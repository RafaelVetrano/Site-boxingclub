import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { requireAuth } from '../../middlewares/auth.js';

const patchMeSchema = z.object({
  firstName: z.string().min(1).max(80).optional(),
  lastName: z.string().min(1).max(80).optional(),
  avatar: z.string().url().nullable().optional(),
});

export async function usersRoutes(app: FastifyInstance) {
  app.patch('/users/me', { preHandler: requireAuth }, async (req, reply) => {
    const body = patchMeSchema.parse(req.body);
    const authUser = (req as any).authUser;

    const data: Record<string, unknown> = {};
    if (body.firstName !== undefined) data.firstName = body.firstName;
    if (body.lastName !== undefined) data.lastName = body.lastName;
    if (body.avatar !== undefined) data.avatar = body.avatar;

    if (Object.keys(data).length === 0) {
      return reply.status(400).send({ error: 'NO_FIELDS', message: 'Nenhum campo para atualizar.', statusCode: 400 });
    }

    const updated = await app.prisma.user.update({
      where: { id: authUser.id },
      data,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        avatar: true,
        emailVerified: true,
        emailVerifiedAt: true,
        createdAt: true,
      },
    });

    return updated;
  });
}
