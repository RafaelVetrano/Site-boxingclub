import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { requireAuth, requireAdmin } from '../../middlewares/auth.js';
import { Preference } from 'mercadopago';
import { env } from '../../env.js';

const ORDER_NUMBER_OFFSET = 10000;

const updateStatusSchema = z.object({
  status: z.enum(['entregue', 'pago', 'pendente', 'nao_pago', 'cancelado', 'recusado', 'expirado', 'erro']),
  note: z.string().optional(),
});

const adminListQuerySchema = z.object({
  status: z.enum(['entregue', 'pago', 'pendente', 'nao_pago', 'cancelado', 'recusado', 'expirado', 'erro']).optional(),
  paymentMethod: z.enum(['pix', 'credit_card', 'debit_card', 'boleto']).optional(),
  from: z.string().optional(),
  to: z.string().optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

function formatOrder(order: any) {
  return {
    ...order,
    number: order.number + ORDER_NUMBER_OFFSET,
    total: Number(order.total),
    items: order.items?.map((i: any) => ({ ...i, price: Number(i.price) })),
  };
}

function userId(req: any): string {
  return req.authUser.id;
}

export async function ordersRoutes(app: FastifyInstance) {
  // ── POST /orders — create from cart ──────────────────────────────
  app.post('/orders', { preHandler: requireAuth }, async (req, reply) => {
    const uid = userId(req);

    const cartItems = await app.prisma.cartItem.findMany({
      where: { userId: uid },
      include: { product: true },
    });

    if (cartItems.length === 0) {
      return reply.status(400).send({ error: 'EMPTY_CART', message: 'Seu carrinho está vazio.', statusCode: 400 });
    }

    for (const ci of cartItems) {
      if (!ci.product.active) {
        return reply.status(400).send({ error: 'PRODUCT_UNAVAILABLE', message: `Produto "${ci.product.name}" não está mais disponível.`, statusCode: 400 });
      }
      if (ci.qty > ci.product.stock) {
        return reply.status(400).send({ error: 'STOCK_EXCEEDED', message: `Estoque insuficiente para "${ci.product.name}".`, statusCode: 400 });
      }
    }

    type CartItemWithProduct = typeof cartItems[number];
    const total = cartItems.reduce((s: number, i: CartItemWithProduct) => s + Number(i.product.price) * i.qty, 0);
    const now = new Date().toISOString();

    const order = await app.prisma.order.create({
      data: {
        userId: uid,
        total,
        paymentMethod: 'pix',
        status: 'pendente',
        statusHistory: [{ status: 'pendente', at: now, note: 'Pedido criado' }],
        items: {
          create: cartItems.map((ci: CartItemWithProduct) => ({
            productId: ci.productId,
            name: ci.product.name,
            price: Number(ci.product.price),
            qty: ci.qty,
            glyph: ci.product.glyph,
            image: (ci.product.images as string[])[0] ?? null,
          })),
        },
      },
      include: { items: true },
    });

    await app.prisma.cartItem.deleteMany({ where: { userId: uid } });

    // Create Mercado Pago preference if token is configured
    if (env.MP_ACCESS_TOKEN) {
      try {
        const preferenceAPI = new Preference(app.mp);
        const pref = await preferenceAPI.create({
          body: {
            items: order.items.map((i: any) => ({
              id: i.productId ?? i.id,
              title: i.name,
              unit_price: Number(i.price),
              quantity: i.qty,
              currency_id: 'BRL',
            })),
            payer: { email: (req as any).authUser.email },
            back_urls: {
              success: `${env.WEB_URL}/checkout/success`,
              failure: `${env.WEB_URL}/checkout/failure`,
              pending: `${env.WEB_URL}/checkout/success`,
            },
            auto_return: 'approved',
            notification_url: `${env.API_URL}/payments/webhook/mercadopago`,
            external_reference: order.id,
            statement_descriptor: 'BOXING CLUB',
          },
        });

        await app.prisma.order.update({
          where: { id: order.id },
          data: { mpPreferenceId: pref.id },
        });

        return {
          ...formatOrder(order),
          mpPreferenceId: pref.id,
          initPoint: pref.init_point,
          sandboxInitPoint: pref.sandbox_init_point,
        };
      } catch (err) {
        app.log.error({ err }, '[orders] Failed to create MP preference');
      }
    }

    return formatOrder(order);
  });

  // ── GET /orders/me ────────────────────────────────────────────────
  app.get('/orders/me', { preHandler: requireAuth }, async (req) => {
    const orders = await app.prisma.order.findMany({
      where: { userId: userId(req) },
      include: { items: true },
      orderBy: { date: 'desc' },
    });
    return orders.map(formatOrder);
  });

  // ── GET /orders/me/:id ────────────────────────────────────────────
  app.get('/orders/me/:id', { preHandler: requireAuth }, async (req, reply) => {
    const { id } = req.params as { id: string };
    const uid = userId(req);

    const order = await app.prisma.order.findFirst({
      where: { id, userId: uid },
      include: { items: true },
    });

    if (!order) return reply.status(404).send({ error: 'NOT_FOUND', message: 'Pedido não encontrado.', statusCode: 404 });
    return formatOrder(order);
  });

  // ── GET /orders (admin) ───────────────────────────────────────────
  app.get('/orders', { preHandler: requireAdmin }, async (req) => {
    const query = adminListQuerySchema.parse(req.query);
    const skip = (query.page - 1) * query.limit;

    const where: any = {
      ...(query.status ? { status: query.status } : {}),
      ...(query.paymentMethod ? { paymentMethod: query.paymentMethod } : {}),
      ...(query.from ? { date: { gte: new Date(query.from) } } : {}),
      ...(query.to ? { date: { lte: new Date(query.to + 'T23:59:59') } } : {}),
      ...(query.search
        ? {
            OR: [
              { user: { email: { contains: query.search, mode: 'insensitive' as const } } },
            ],
          }
        : {}),
    };

    const [total, orders] = await Promise.all([
      app.prisma.order.count({ where }),
      app.prisma.order.findMany({
        where,
        include: { items: true, user: { select: { id: true, firstName: true, lastName: true, email: true } } },
        orderBy: { date: 'desc' },
        skip,
        take: query.limit,
      }),
    ]);

    return {
      data: orders.map(formatOrder),
      total,
      page: query.page,
      limit: query.limit,
      pages: Math.ceil(total / query.limit),
    };
  });

  // ── GET /orders/:id (admin) ───────────────────────────────────────
  app.get('/orders/:id', { preHandler: requireAdmin }, async (req, reply) => {
    const { id } = req.params as { id: string };

    const order = await app.prisma.order.findUnique({
      where: { id },
      include: { items: true, user: { select: { id: true, firstName: true, lastName: true, email: true } } },
    });

    if (!order) return reply.status(404).send({ error: 'NOT_FOUND', message: 'Pedido não encontrado.', statusCode: 404 });
    return formatOrder(order);
  });

  // ── PATCH /orders/:id/status (admin) ─────────────────────────────
  app.patch('/orders/:id/status', { preHandler: requireAdmin }, async (req, reply) => {
    const { id } = req.params as { id: string };
    const body = updateStatusSchema.parse(req.body);

    const order = await app.prisma.order.findUnique({ where: { id } });
    if (!order) return reply.status(404).send({ error: 'NOT_FOUND', message: 'Pedido não encontrado.', statusCode: 404 });

    const at = new Date().toISOString();
    const history = [...(order.statusHistory as any[]), { status: body.status, at, note: body.note ?? null }];

    const updated = await app.prisma.order.update({
      where: { id },
      data: {
        status: body.status,
        statusHistory: history,
        ...(body.status === 'entregue' ? { deliveredAt: new Date() } : {}),
      },
      include: { items: true },
    });

    return formatOrder(updated);
  });
}
