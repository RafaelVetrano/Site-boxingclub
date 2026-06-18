import { FastifyRequest, FastifyReply } from 'fastify';

export async function requireAuth(req: FastifyRequest, reply: FastifyReply) {
  try {
    await req.jwtVerify();
  } catch {
    return reply.status(401).send({ error: 'UNAUTHORIZED', message: 'Token inválido ou expirado.', statusCode: 401 });
  }

  const payload = req.user as { sub: string; role: string };

  const user = await req.server.prisma.user.findUnique({
    where: { id: payload.sub },
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

  if (!user) {
    return reply.status(401).send({ error: 'UNAUTHORIZED', message: 'Usuário não encontrado.', statusCode: 401 });
  }

  (req as any).authUser = user;
}

export async function requireAdmin(req: FastifyRequest, reply: FastifyReply) {
  await requireAuth(req, reply);
  if (reply.sent) return;

  const user = (req as any).authUser;
  if (user?.role !== 'ADMIN') {
    return reply.status(403).send({ error: 'FORBIDDEN', message: 'Acesso restrito a administradores.', statusCode: 403 });
  }
}
