import fp from 'fastify-plugin';
import fastifyJwt from '@fastify/jwt';
import { env } from '../env.js';

export const jwtPlugin = fp(async (app) => {
  // Access token JWT (default namespace — used by app.jwt.sign / req.jwtVerify)
  await app.register(fastifyJwt, {
    secret: env.JWT_ACCESS_SECRET,
    sign: { expiresIn: env.JWT_ACCESS_EXPIRES },
  });

  // Refresh token JWT (separate namespace)
  await app.register(fastifyJwt, {
    secret: env.JWT_REFRESH_SECRET,
    sign: { expiresIn: env.JWT_REFRESH_EXPIRES },
    namespace: 'refresh',
    jwtVerify: 'refreshVerify',
    jwtSign: 'refreshSign',
  });
});
