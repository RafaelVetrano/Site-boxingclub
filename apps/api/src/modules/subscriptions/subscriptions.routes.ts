import { FastifyInstance } from 'fastify';
import { PreApproval, PreApprovalPlan } from 'mercadopago';
import { requireAuth, requireAdmin } from '../../middlewares/auth.js';
import { env } from '../../env.js';

function userId(req: any): string {
  return req.authUser.id;
}

export async function subscriptionsRoutes(app: FastifyInstance) {
  // ── POST /admin/plans/sync-mp ─────────────────────────────────────
  app.post('/admin/plans/sync-mp', { preHandler: requireAdmin }, async (req, reply) => {
    if (!env.MP_ACCESS_TOKEN) {
      return reply.status(503).send({ error: 'MP_NOT_CONFIGURED', message: 'MP_ACCESS_TOKEN não configurado.' });
    }

    const plans = await app.prisma.plan.findMany({ where: { active: true, mpPlanId: null } });

    const planAPI = new PreApprovalPlan(app.mp);
    const results: { planId: string; mpPlanId: string }[] = [];
    const backUrl = env.WEB_URL.includes('localhost')
      ? 'https://example.com/conta/planos'
      : `${env.WEB_URL}/conta/planos`;

    for (const plan of plans) {
      try {
        const mpPlan = await planAPI.create({
          body: {
            reason: `${plan.name} — Boxing Club`,
            auto_recurring: {
              frequency: plan.cycleMonths,
              frequency_type: 'months',
              transaction_amount: Number(plan.price),
              currency_id: 'BRL',
            },
            back_url: backUrl,
            status: 'active',
          },
        });

        await app.prisma.plan.update({
          where: { id: plan.id },
          data: { mpPlanId: mpPlan.id },
        });

        results.push({ planId: plan.id, mpPlanId: mpPlan.id! });
      } catch (err) {
        app.log.error({ err, planId: plan.id }, '[sync-mp] Failed to create plan in MP');
      }
    }

    return { synced: results.length, results };
  });

  // ── POST /subscriptions ───────────────────────────────────────────
  app.post('/subscriptions', { preHandler: requireAuth }, async (req, reply) => {
    if (!env.MP_ACCESS_TOKEN) {
      return reply.status(503).send({ error: 'MP_NOT_CONFIGURED', message: 'MP_ACCESS_TOKEN não configurado.' });
    }

    const uid = userId(req);
    const { planId } = req.body as { planId: string };

    // Check for active subscription
    const existing = await app.prisma.subscription.findUnique({ where: { userId: uid } });
    if (existing?.status === 'ACTIVE') {
      return reply.status(409).send({ error: 'ALREADY_SUBSCRIBED', message: 'Você já possui uma assinatura ativa.', statusCode: 409 });
    }

    const plan = await app.prisma.plan.findUnique({ where: { id: planId } });
    if (!plan || !plan.active) {
      return reply.status(404).send({ error: 'PLAN_NOT_FOUND', message: 'Plano não encontrado.', statusCode: 404 });
    }

    if (!plan.mpPlanId) {
      return reply.status(422).send({ error: 'PLAN_NOT_SYNCED', message: 'Plano não sincronizado com Mercado Pago. Execute /admin/plans/sync-mp primeiro.', statusCode: 422 });
    }

    const now = new Date();
    const nextBilling = new Date(now);
    nextBilling.setMonth(nextBilling.getMonth() + plan.cycleMonths);

    // MP's /preapproval create requires a valid MP account email for the payer.
    // In the redirect flow, we use the plan's checkout URL directly — the user
    // authenticates with their MP account on MP's side. The webhook then links
    // the created preapproval back to this subscription by payer_email + planId.
    const initPoint = `https://www.mercadopago.com.br/subscriptions/checkout?preapproval_plan_id=${plan.mpPlanId}`;

    // Upsert subscription (user may have a cancelled one)
    const subscription = await app.prisma.subscription.upsert({
      where: { userId: uid },
      update: {
        planId,
        status: 'PENDING',
        startDate: now,
        nextBilling,
        cancelledAt: null,
        mpPreapprovalId: null,
      },
      create: {
        userId: uid,
        planId,
        status: 'PENDING',
        startDate: now,
        nextBilling,
        mpPreapprovalId: null,
      },
    });

    return { subscriptionId: subscription.id, initPoint };
  });

  // ── GET /subscriptions/me ─────────────────────────────────────────
  app.get('/subscriptions/me', { preHandler: requireAuth }, async (req) => {
    const uid = userId(req);
    const subscription = await app.prisma.subscription.findUnique({
      where: { userId: uid },
      include: { plan: true },
    });
    return subscription ?? null;
  });

  // ── DELETE /subscriptions/me ──────────────────────────────────────
  app.delete('/subscriptions/me', { preHandler: requireAuth }, async (req, reply) => {
    const uid = userId(req);
    const subscription = await app.prisma.subscription.findUnique({ where: { userId: uid } });

    if (!subscription || subscription.status !== 'ACTIVE') {
      return reply.status(404).send({ error: 'NOT_FOUND', message: 'Nenhuma assinatura ativa encontrada.', statusCode: 404 });
    }

    // Cancel on MP if configured
    if (env.MP_ACCESS_TOKEN && subscription.mpPreapprovalId) {
      try {
        const preapprovalAPI = new PreApproval(app.mp);
        await preapprovalAPI.update({
          id: subscription.mpPreapprovalId,
          body: { status: 'cancelled' },
        });
      } catch (err) {
        app.log.error({ err }, '[subscriptions] Failed to cancel preapproval on MP');
      }
    }

    const cancelled = await app.prisma.subscription.update({
      where: { id: subscription.id },
      data: { status: 'CANCELLED', cancelledAt: new Date() },
      include: { plan: true },
    });

    return cancelled;
  });
}
