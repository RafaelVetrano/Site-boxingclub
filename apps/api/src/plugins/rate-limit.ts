import fp from 'fastify-plugin';
import fastifyRateLimit from '@fastify/rate-limit';

export const rateLimitPlugin = fp(async (app) => {
  await app.register(fastifyRateLimit, {
    max: 100,
    timeWindow: '1 minute',
    keyGenerator: (req) => req.ip,
  });
});
