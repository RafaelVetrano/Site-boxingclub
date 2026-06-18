import fp from 'fastify-plugin';
import fastifyCors from '@fastify/cors';
import { env } from '../env.js';

export const corsPlugin = fp(async (app) => {
  await app.register(fastifyCors, {
    origin: env.WEB_URL,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  });
});
