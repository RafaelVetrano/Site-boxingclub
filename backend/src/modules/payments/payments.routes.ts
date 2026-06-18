import { FastifyInstance } from 'fastify';
import { createHmac } from 'crypto';
import { Payment, PreApproval } from 'mercadopago';
import { env } from '../../env.js';
import { sendEmail } from '../emails/emails.service.js';

const MP_STATUS_TO_ORDER: Record<string, string> = {
  approved: 'pago',
  rejected: 'recusado',
  in_process: 'pendente',
  cancelled: 'cancelado',
  refunded: 'cancelado',
};

const MP_PREAPPROVAL_TO_SUB: Record<string, string> = {
  authorized: 'ACTIVE',
  cancelled: 'CANCELLED',
  paused: 'PAUSED',
};

function verifyWebhookSignature(
  xSignature: string,
  xRequestId: string,
  bodyId: string | undefined,
  secret: string
): boolean {
  // x-signature format: ts=<timestamp>,v1=<hash>
  const parts = Object.fromEntries(xSignature.split(',').map((p) => p.split('=')));
  const ts = parts['ts'];
  const v1 = parts['v1'];
  if (!ts || !v1) return false;

  const manifest = `id:${bodyId ?? ''};request-id:${xRequestId};ts:${ts}`;
  const expected = createHmac('sha256', secret).update(manifest).digest('hex');
  return expected === v1;
}

export async function paymentsRoutes(app: FastifyInstance) {
  // ── POST /payments/webhook/mercadopago ────────────────────────────
  app.post('/payments/webhook/mercadopago', async (req, reply) => {
    const xSignature = (req.headers['x-signature'] as string) ?? '';
    const xRequestId = (req.headers['x-request-id'] as string) ?? '';
    const body = req.body as any;

    // Validate signature when secret is configured
    if (env.MP_WEBHOOK_SECRET) {
      const dataId = body?.data?.id ?? req.query as any;
      const valid = verifyWebhookSignature(xSignature, xRequestId, String(dataId ?? ''), env.MP_WEBHOOK_SECRET);
      if (!valid) {
        return reply.status(401).send({ error: 'INVALID_SIGNATURE' });
      }
    }

    // Respond 200 immediately; process async
    reply.status(200).send({ received: true });

    const type: string = body?.type ?? body?.action ?? '';

    if (type === 'payment') {
      void handlePaymentWebhook(app, body);
    } else if (type === 'subscription_preapproval' || type === 'preapproval') {
      void handlePreapprovalWebhook(app, body);
    }
  });
}

async function handlePaymentWebhook(app: FastifyInstance, body: any) {
  try {
    const paymentId = String(body?.data?.id ?? body?.id ?? '');
    if (!paymentId) return;

    const paymentAPI = new Payment(app.mp);
    const mpPayment = await paymentAPI.get({ id: paymentId });

    const orderId = mpPayment.external_reference;
    if (!orderId) return;

    const order = await app.prisma.order.findUnique({ where: { id: orderId }, include: { items: true, user: true } });
    if (!order) return;

    // Idempotency: already processed this payment
    if (order.mpPaymentId === paymentId) return;

    const newStatus = MP_STATUS_TO_ORDER[mpPayment.status ?? ''] ?? 'pendente';
    const at = new Date().toISOString();
    const history = [...(order.statusHistory as any[]), { status: newStatus, at, note: `MP: ${mpPayment.status}` }];

    await app.prisma.order.update({
      where: { id: orderId },
      data: {
        status: newStatus as any,
        mpPaymentId: paymentId,
        statusHistory: history,
        paymentMethod: resolvePaymentMethod(mpPayment.payment_type_id),
      },
    });

    if (newStatus === 'pago') {
      // Decrement stock in a transaction
      try {
        await app.prisma.$transaction(
          order.items.map((item: any) =>
            app.prisma.product.updateMany({
              where: { id: item.productId ?? undefined },
              data: { stock: { decrement: item.qty } },
            })
          )
        );
      } catch (err) {
        app.log.error({ err, orderId }, '[webhook] Failed to decrement stock');
      }

      // Send receipt email
      const itemsHtml = order.items
        .map(
          (i: any) =>
            `<div style="padding:10px 16px;border-bottom:1px solid #e7e5e0;display:flex;justify-content:space-between;">
              <span>${i.qty}× ${i.name}</span>
              <span>R$ ${(Number(i.price) * i.qty).toFixed(2).replace('.', ',')}</span>
            </div>`
        )
        .join('');

      const paymentLabel: Record<string, string> = {
        credit_card: 'Cartão de crédito',
        debit_card: 'Cartão de débito',
        pix: 'PIX',
        boleto: 'Boleto',
      };

      const number = order.number + 10000;
      await sendEmail('order-receipt', order.user.email, {
        firstName: order.user.firstName,
        number: String(number),
        items: itemsHtml,
        total: `R$ ${Number(order.total).toFixed(2).replace('.', ',')}`,
        paymentMethod: paymentLabel[order.paymentMethod] ?? order.paymentMethod,
      });
    }
  } catch (err) {
    app.log.error({ err }, '[webhook] handlePaymentWebhook error');
  }
}

async function handlePreapprovalWebhook(app: FastifyInstance, body: any) {
  try {
    const preapprovalId = String(body?.data?.id ?? body?.id ?? '');
    if (!preapprovalId) return;

    const preapprovalAPI = new PreApproval(app.mp);
    const mpSub = await preapprovalAPI.get({ id: preapprovalId });

    // Primary lookup: match by mpPreapprovalId (for future direct-create flows)
    let subscription = await app.prisma.subscription.findFirst({
      where: { mpPreapprovalId: preapprovalId },
      include: { user: true, plan: true },
    });

    // Fallback: match by payer_email + plan (redirect flow — user subscribed via plan init_point)
    if (!subscription && (mpSub as any).payer_email && (mpSub as any).preapproval_plan_id) {
      const [plan, user] = await Promise.all([
        app.prisma.plan.findFirst({ where: { mpPlanId: (mpSub as any).preapproval_plan_id } }),
        app.prisma.user.findUnique({ where: { email: (mpSub as any).payer_email } }),
      ]);
      if (plan && user) {
        subscription = await app.prisma.subscription.findFirst({
          where: { userId: user.id, planId: plan.id },
          include: { user: true, plan: true },
        });
      }
    }

    if (!subscription) return;

    const newStatus = MP_PREAPPROVAL_TO_SUB[mpSub.status ?? ''];
    if (!newStatus) return;

    const now = new Date();
    const nextBilling = new Date(now);
    nextBilling.setMonth(nextBilling.getMonth() + subscription.plan.cycleMonths);

    await app.prisma.subscription.update({
      where: { id: subscription.id },
      data: {
        status: newStatus as any,
        mpPreapprovalId: preapprovalId,
        ...(newStatus === 'ACTIVE' ? { nextBilling } : {}),
        ...(newStatus === 'CANCELLED' ? { cancelledAt: now } : {}),
      },
    });

    if (newStatus === 'ACTIVE') {
      await sendEmail('subscription-activated', subscription.user.email, {
        firstName: subscription.user.firstName,
        planName: subscription.plan.name,
        nextBilling: nextBilling.toLocaleDateString('pt-BR'),
      });
    } else if (newStatus === 'CANCELLED') {
      await sendEmail('subscription-cancelled', subscription.user.email, {
        firstName: subscription.user.firstName,
        planName: subscription.plan.name,
      });
    }
  } catch (err) {
    app.log.error({ err }, '[webhook] handlePreapprovalWebhook error');
  }
}

function resolvePaymentMethod(mpType: string | null | undefined): any {
  if (!mpType) return 'pix';
  if (mpType === 'credit_card') return 'credit_card';
  if (mpType === 'debit_card') return 'debit_card';
  if (mpType === 'bank_transfer' || mpType === 'pix') return 'pix';
  if (mpType === 'ticket') return 'boleto';
  return 'pix';
}
