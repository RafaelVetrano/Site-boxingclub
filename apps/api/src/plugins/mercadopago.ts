import fp from 'fastify-plugin';
import { MercadoPagoConfig } from 'mercadopago';
import { env } from '../env.js';

declare module 'fastify' {
  interface FastifyInstance {
    mp: MercadoPagoConfig;
  }
}

export const mercadopagoPlugin = fp(async (app) => {
  const client = new MercadoPagoConfig({
    accessToken: env.MP_ACCESS_TOKEN ?? '',
    options: { timeout: 5000 },
  });

  app.decorate('mp', client);
});
