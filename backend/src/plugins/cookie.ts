import fp from 'fastify-plugin';
import fastifyCookie from '@fastify/cookie';

export const cookiePlugin = fp(async (app) => {
  await app.register(fastifyCookie, {
    secret: process.env.JWT_REFRESH_SECRET || 'cookie-secret',
  });
});
