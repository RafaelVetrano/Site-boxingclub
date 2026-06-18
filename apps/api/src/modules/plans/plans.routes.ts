import { FastifyInstance } from 'fastify';

export async function plansRoutes(app: FastifyInstance) {
  app.get('/plans', async () => {
    const plans = await app.prisma.plan.findMany({
      where: { active: true },
      orderBy: { id: 'asc' },
    });
    return plans;
  });
}
