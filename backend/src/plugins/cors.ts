import fp from 'fastify-plugin';
import fastifyCors from '@fastify/cors';
import { env } from '../env.js';

export const corsPlugin = fp(async (app) => {
  const allowedOrigins = (env.ALLOWED_ORIGINS ?? env.WEB_URL)
    .split(',')
    .map((o) => o.trim());

  await app.register(fastifyCors, {
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  });
});
