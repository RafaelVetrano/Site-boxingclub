import { FastifyInstance } from 'fastify';
import bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';
import { z } from 'zod';
import { requireAuth } from '../../middlewares/auth.js';
import { sendEmail } from '../emails/emails.service.js';
import { env } from '../../env.js';

const SALT_ROUNDS = 12;
const REFRESH_COOKIE = 'bc_refresh';

// ── Schemas ───────────────────────────────────────────────────────

const registerSchema = z.object({
  firstName: z.string().min(1).max(80),
  lastName: z.string().min(1).max(80),
  email: z.string().email(),
  password: z.string().min(6).max(100),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const verifyEmailSchema = z.object({
  token: z.string().uuid(),
});

const resendVerificationSchema = z.object({
  email: z.string().email(),
});

const resendByTokenSchema = z.object({
  token: z.string().uuid(),
});

const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

const resetPasswordSchema = z.object({
  token: z.string().uuid(),
  password: z.string().min(6).max(100),
});

// ── Helpers ───────────────────────────────────────────────────────

function cookieOpts(maxAge: number) {
  return {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge,
  };
}

function signRefresh(app: FastifyInstance, sub: string): string {
  return (app.jwt as any).refresh.sign({ sub });
}

function verifyRefresh(app: FastifyInstance, token: string): { sub: string } {
  return (app.jwt as any).refresh.verify(token) as { sub: string };
}

function signAccess(app: FastifyInstance, sub: string, role: string): string {
  return app.jwt.sign({ sub, role });
}

function userSafe(u: Record<string, any>) {
  const { passwordHash: _p, ...rest } = u;
  return rest;
}

// ── Routes ────────────────────────────────────────────────────────

export async function authRoutes(app: FastifyInstance) {
  // POST /auth/register
  app.post(
    '/auth/register',
    {
      config: { rateLimit: { max: 3, timeWindow: '1 minute' } },
    },
    async (req, reply) => {
      const body = registerSchema.parse(req.body);

      const existing = await app.prisma.user.findUnique({ where: { email: body.email } });
      if (existing) {
        return reply.status(409).send({ error: 'EMAIL_TAKEN', message: 'Este e-mail já está em uso.', statusCode: 409 });
      }

      const passwordHash = await bcrypt.hash(body.password, SALT_ROUNDS);
      const user = await app.prisma.user.create({
        data: {
          firstName: body.firstName,
          lastName: body.lastName,
          email: body.email,
          passwordHash,
          emailVerified: false,
        },
      });

      const token = randomUUID();
      await app.prisma.emailToken.create({
        data: {
          userId: user.id,
          token,
          type: 'EMAIL_VERIFICATION',
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        },
      });

      const verifyUrl = `${env.WEB_URL}/confirmar-email/${token}`;
      await sendEmail('email-verification', user.email, { firstName: user.firstName, verifyUrl });

      return reply.status(201).send({ message: 'Conta criada! Verifique seu e-mail.' });
    }
  );

  // POST /auth/login
  app.post(
    '/auth/login',
    {
      config: { rateLimit: { max: 5, timeWindow: '1 minute' } },
    },
    async (req, reply) => {
      const body = loginSchema.parse(req.body);

      const user = await app.prisma.user.findUnique({ where: { email: body.email } });
      if (!user || !(await bcrypt.compare(body.password, user.passwordHash))) {
        return reply.status(401).send({ error: 'INVALID_CREDENTIALS', message: 'E-mail ou senha incorretos.', statusCode: 401 });
      }

      if (!user.emailVerified) {
        return reply.status(403).send({ error: 'EMAIL_NOT_VERIFIED', message: 'Confirme seu e-mail antes de entrar.', statusCode: 403 });
      }

      const accessToken = signAccess(app, user.id, user.role);
      const refreshToken = signRefresh(app, user.id);

      reply.setCookie(REFRESH_COOKIE, refreshToken, cookieOpts(7 * 24 * 60 * 60));

      return { accessToken, user: userSafe(user) };
    }
  );

  // POST /auth/admin/login
  app.post(
    '/auth/admin/login',
    {
      config: { rateLimit: { max: 5, timeWindow: '1 minute' } },
    },
    async (req, reply) => {
      const body = loginSchema.parse(req.body);

      const user = await app.prisma.user.findUnique({ where: { email: body.email } });
      if (!user || !(await bcrypt.compare(body.password, user.passwordHash))) {
        return reply.status(401).send({ error: 'INVALID_CREDENTIALS', message: 'Credenciais inválidas.', statusCode: 401 });
      }

      if (user.role !== 'ADMIN') {
        return reply.status(403).send({ error: 'FORBIDDEN', message: 'Acesso restrito a administradores.', statusCode: 403 });
      }

      if (!user.emailVerified) {
        return reply.status(403).send({ error: 'EMAIL_NOT_VERIFIED', message: 'Confirme seu e-mail antes de entrar.', statusCode: 403 });
      }

      const accessToken = signAccess(app, user.id, user.role);
      const refreshToken = signRefresh(app, user.id);

      reply.setCookie(REFRESH_COOKIE, refreshToken, cookieOpts(7 * 24 * 60 * 60));

      return { accessToken, user: userSafe(user) };
    }
  );

  // POST /auth/refresh
  app.post('/auth/refresh', async (req, reply) => {
    const token = req.cookies[REFRESH_COOKIE];
    if (!token) {
      return reply.status(401).send({ error: 'NO_REFRESH_TOKEN', message: 'Refresh token não encontrado.', statusCode: 401 });
    }

    let payload: { sub: string };
    try {
      payload = verifyRefresh(app, token);
    } catch {
      return reply.status(401).send({ error: 'INVALID_REFRESH_TOKEN', message: 'Refresh token inválido ou expirado.', statusCode: 401 });
    }

    const user = await app.prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user) {
      return reply.status(401).send({ error: 'USER_NOT_FOUND', message: 'Usuário não encontrado.', statusCode: 401 });
    }

    const accessToken = signAccess(app, user.id, user.role);
    return { accessToken };
  });

  // POST /auth/logout
  app.post('/auth/logout', async (_req, reply) => {
    reply.clearCookie(REFRESH_COOKIE, { path: '/' });
    return { message: 'Logout realizado.' };
  });

  // GET /auth/me
  app.get('/auth/me', { preHandler: requireAuth }, async (req) => {
    return (req as any).authUser;
  });

  // POST /auth/verify-email
  app.post('/auth/verify-email', async (req, reply) => {
    const { token } = verifyEmailSchema.parse(req.body);

    const emailToken = await app.prisma.emailToken.findUnique({ where: { token } });

    if (!emailToken || emailToken.type !== 'EMAIL_VERIFICATION') {
      return reply.status(404).send({ code: 'TOKEN_NOT_FOUND', message: 'Token não encontrado.', statusCode: 404 });
    }

    if (emailToken.usedAt) {
      return reply.status(409).send({ code: 'TOKEN_ALREADY_USED', message: 'Este link já foi utilizado.', statusCode: 409 });
    }

    if (emailToken.expiresAt < new Date()) {
      return reply.status(410).send({ code: 'TOKEN_EXPIRED', message: 'O link de confirmação expirou.', statusCode: 410 });
    }

    await app.prisma.$transaction([
      app.prisma.user.update({
        where: { id: emailToken.userId },
        data: { emailVerified: true, emailVerifiedAt: new Date() },
      }),
      app.prisma.emailToken.update({
        where: { id: emailToken.id },
        data: { usedAt: new Date() },
      }),
    ]);

    return reply.status(200).send({ code: 'EMAIL_VERIFIED', message: 'E-mail confirmado com sucesso!' });
  });

  // POST /auth/resend-verification
  app.post(
    '/auth/resend-verification',
    {
      config: { rateLimit: { max: 1, timeWindow: '1 minute' } },
    },
    async (req, reply) => {
      const { email } = resendVerificationSchema.parse(req.body);

      const user = await app.prisma.user.findUnique({ where: { email } });
      if (!user || user.emailVerified) {
        // Silent — don't reveal whether user exists or is already verified
        return { message: 'Se o e-mail existir, o link foi reenviado.' };
      }

      // Invalidate previous tokens
      await app.prisma.emailToken.updateMany({
        where: { userId: user.id, type: 'EMAIL_VERIFICATION', usedAt: null },
        data: { usedAt: new Date() },
      });

      const token = randomUUID();
      await app.prisma.emailToken.create({
        data: {
          userId: user.id,
          token,
          type: 'EMAIL_VERIFICATION',
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        },
      });

      const verifyUrl = `${env.WEB_URL}/confirmar-email/${token}`;
      await sendEmail('email-verification', user.email, { firstName: user.firstName, verifyUrl });

      return { message: 'Se o e-mail existir, o link foi reenviado.' };
    }
  );

  // POST /auth/resend-by-token
  app.post(
    '/auth/resend-by-token',
    {
      config: { rateLimit: { max: 3, timeWindow: '5 minutes' } },
    },
    async (req, reply) => {
      const { token } = resendByTokenSchema.parse(req.body);

      const emailToken = await app.prisma.emailToken.findUnique({
        where: { token },
        include: { user: true },
      });

      if (!emailToken || emailToken.type !== 'EMAIL_VERIFICATION') {
        // Silent — don't reveal token validity
        return { message: 'Se o token existir, o link foi reenviado.' };
      }

      const user = emailToken.user;
      if (user.emailVerified) {
        return { message: 'Se o token existir, o link foi reenviado.' };
      }

      // Invalidate previous tokens
      await app.prisma.emailToken.updateMany({
        where: { userId: user.id, type: 'EMAIL_VERIFICATION', usedAt: null },
        data: { usedAt: new Date() },
      });

      const newToken = randomUUID();
      await app.prisma.emailToken.create({
        data: {
          userId: user.id,
          token: newToken,
          type: 'EMAIL_VERIFICATION',
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        },
      });

      const verifyUrl = `${env.WEB_URL}/confirmar-email/${newToken}`;
      await sendEmail('email-verification', user.email, { firstName: user.firstName, verifyUrl });

      return reply.status(200).send({ message: 'Se o token existir, o link foi reenviado.' });
    }
  );

  // POST /auth/forgot-password
  app.post(
    '/auth/forgot-password',
    {
      config: { rateLimit: { max: 3, timeWindow: '15 minutes' } },
    },
    async (req) => {
      const { email } = forgotPasswordSchema.parse(req.body);

      // Always return 200 — anti-enumeration
      const user = await app.prisma.user.findUnique({ where: { email } });
      if (user) {
        // Invalidate previous reset tokens
        await app.prisma.emailToken.updateMany({
          where: { userId: user.id, type: 'PASSWORD_RESET', usedAt: null },
          data: { usedAt: new Date() },
        });

        const token = randomUUID();
        await app.prisma.emailToken.create({
          data: {
            userId: user.id,
            token,
            type: 'PASSWORD_RESET',
            expiresAt: new Date(Date.now() + 60 * 60 * 1000),
          },
        });

        const resetUrl = `${env.WEB_URL}/redefinir-senha/${token}`;
        await sendEmail('password-reset', user.email, { firstName: user.firstName, resetUrl });
      }

      return { message: 'Se o e-mail existir, as instruções foram enviadas.' };
    }
  );

  // POST /auth/reset-password
  app.post('/auth/reset-password', async (req, reply) => {
    const { token, password } = resetPasswordSchema.parse(req.body);

    const emailToken = await app.prisma.emailToken.findUnique({ where: { token } });

    if (
      !emailToken ||
      emailToken.type !== 'PASSWORD_RESET' ||
      emailToken.usedAt ||
      emailToken.expiresAt < new Date()
    ) {
      return reply.status(400).send({ error: 'INVALID_TOKEN', message: 'Token inválido ou expirado.', statusCode: 400 });
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    await app.prisma.$transaction([
      app.prisma.user.update({
        where: { id: emailToken.userId },
        data: { passwordHash },
      }),
      app.prisma.emailToken.update({
        where: { id: emailToken.id },
        data: { usedAt: new Date() },
      }),
    ]);

    return { message: 'Senha redefinida com sucesso!' };
  });
}
