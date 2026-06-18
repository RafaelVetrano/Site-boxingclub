import fp from 'fastify-plugin';
import fastifyHelmet from '@fastify/helmet';

export const helmetPlugin = fp(async (app) => {
  await app.register(fastifyHelmet, {
    contentSecurityPolicy: false,
  });
});
