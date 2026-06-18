import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { requireAdmin } from '../../middlewares/auth.js';

const usersQuerySchema = z.object({
  search: z.string().optional(),
  role: z.enum(['USER', 'ADMIN']).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

const roleBodySchema = z.object({
  role: z.enum(['USER', 'ADMIN']),
});

export async function adminRoutes(app: FastifyInstance) {
  // ── GET /admin/stats ─────────────────────────────────────────────
  app.get('/admin/stats', { preHandler: requireAdmin }, async () => {
    const [
      totalUsers,
      paidRevenue,
      activeSchedule,
      activeProducts,
      recentOrders,
      recentUsers,
      subscriptions,
    ] = await Promise.all([
      app.prisma.user.count(),
      app.prisma.order.aggregate({
        where: { status: { in: ['pago', 'entregue'] } },
        _sum: { total: true },
      }),
      app.prisma.classSchedule.count(),
      app.prisma.product.count({ where: { active: true } }),
      app.prisma.order.findMany({
        take: 5,
        orderBy: { date: 'desc' },
        include: {
          user: { select: { id: true, firstName: true, lastName: true, email: true } },
          items: true,
        },
      }),
      app.prisma.user.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          role: true,
          avatar: true,
          createdAt: true,
          subscription: {
            include: { plan: { select: { name: true } } },
          },
        },
      }),
      app.prisma.subscription.count({ where: { status: 'ACTIVE' } }),
    ]);

    const ORDER_OFFSET = 10000;

    return {
      totalUsers,
      revenue: Number(paidRevenue._sum.total ?? 0),
      activeSchedule,
      activeProducts,
      activeSubscriptions: subscriptions,
      recentOrders: recentOrders.map((o: any) => ({
        ...o,
        number: o.number + ORDER_OFFSET,
        total: Number(o.total),
        items: o.items.map((i: any) => ({ ...i, price: Number(i.price) })),
      })),
      recentUsers: recentUsers.map((u: any) => ({ ...u })),
    };
  });

  // ── GET /admin/users ─────────────────────────────────────────────
  app.get('/admin/users', { preHandler: requireAdmin }, async (req) => {
    const query = usersQuerySchema.parse(req.query);
    const skip = (query.page - 1) * query.limit;

    const where: any = {
      ...(query.role ? { role: query.role } : {}),
      ...(query.search
        ? {
            OR: [
              { firstName: { contains: query.search, mode: 'insensitive' as const } },
              { lastName: { contains: query.search, mode: 'insensitive' as const } },
              { email: { contains: query.search, mode: 'insensitive' as const } },
            ],
          }
        : {}),
    };

    const [total, users] = await Promise.all([
      app.prisma.user.count({ where }),
      app.prisma.user.findMany({
        where,
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          role: true,
          avatar: true,
          emailVerified: true,
          createdAt: true,
          subscription: {
            include: { plan: { select: { name: true } } },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: query.limit,
      }),
    ]);

    return {
      data: users.map((u: any) => ({ ...u })),
      total,
      page: query.page,
      limit: query.limit,
      pages: Math.ceil(total / query.limit),
    };
  });

  // ── GET /admin/users/:id ─────────────────────────────────────────
  app.get('/admin/users/:id', { preHandler: requireAdmin }, async (req, reply) => {
    const { id } = req.params as { id: string };

    const user = await app.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        avatar: true,
        emailVerified: true,
        createdAt: true,
        orders: {
          take: 5,
          orderBy: { date: 'desc' },
          include: { items: true },
        },
        subscription: {
          include: { plan: { select: { name: true } } },
        },
      },
    });

    if (!user) return reply.status(404).send({ error: 'NOT_FOUND', message: 'Usuário não encontrado.', statusCode: 404 });

    const ORDER_OFFSET = 10000;
    return {
      ...user,
      orders: user.orders.map((o: any) => ({
        ...o,
        number: o.number + ORDER_OFFSET,
        total: Number(o.total),
        items: o.items.map((i: any) => ({ ...i, price: Number(i.price) })),
      })),
    };
  });

  // ── PATCH /admin/users/:id/role ──────────────────────────────────
  app.patch('/admin/users/:id/role', { preHandler: requireAdmin }, async (req, reply) => {
    const { id } = req.params as { id: string };
    const { role } = roleBodySchema.parse(req.body);
    const me = (req as any).authUser;

    if (me.id === id) {
      return reply.status(400).send({ error: 'SELF_ROLE', message: 'Você não pode alterar seu próprio papel.', statusCode: 400 });
    }

    const user = await app.prisma.user.findUnique({ where: { id } });
    if (!user) return reply.status(404).send({ error: 'NOT_FOUND', message: 'Usuário não encontrado.', statusCode: 404 });

    const updated = await app.prisma.user.update({
      where: { id },
      data: { role },
      select: { id: true, firstName: true, lastName: true, email: true, role: true },
    });

    return updated;
  });

  // ── DELETE /admin/users/:id ──────────────────────────────────────
  app.delete('/admin/users/:id', { preHandler: requireAdmin }, async (req, reply) => {
    const { id } = req.params as { id: string };
    const me = (req as any).authUser;

    if (me.id === id) {
      return reply.status(400).send({ error: 'SELF_DELETE', message: 'Você não pode excluir sua própria conta.', statusCode: 400 });
    }

    const user = await app.prisma.user.findUnique({ where: { id } });
    if (!user) return reply.status(404).send({ error: 'NOT_FOUND', message: 'Usuário não encontrado.', statusCode: 404 });

    await app.prisma.user.delete({ where: { id } });

    return reply.status(204).send();
  });
}
