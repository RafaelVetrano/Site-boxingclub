import Fastify from 'fastify';
import { env } from './env.js';
import { prismaPlugin } from './plugins/prisma.js';
import { corsPlugin } from './plugins/cors.js';
import { helmetPlugin } from './plugins/helmet.js';
import { cookiePlugin } from './plugins/cookie.js';
import { rateLimitPlugin } from './plugins/rate-limit.js';
import { multipartPlugin } from './plugins/multipart.js';
import { jwtPlugin } from './plugins/jwt.js';
import { errorHandler } from './plugins/error-handler.js';
import { plansRoutes } from './modules/plans/plans.routes.js';
import { scheduleRoutes } from './modules/schedule/schedule.routes.js';
import { productsRoutes } from './modules/products/products.routes.js';
import { cartRoutes } from './modules/cart/cart.routes.js';
import { ordersRoutes } from './modules/orders/orders.routes.js';
import { paymentsRoutes } from './modules/payments/payments.routes.js';
import { subscriptionsRoutes } from './modules/subscriptions/subscriptions.routes.js';
import { authRoutes } from './modules/auth/auth.routes.js';
import { usersRoutes } from './modules/users/users.routes.js';
import { adminRoutes } from './modules/admin/admin.routes.js';
import { staticPlugin } from './plugins/static.js';
import { mercadopagoPlugin } from './plugins/mercadopago.js';

export async function buildApp() {
  const app = Fastify({
    logger: {
      level: env.NODE_ENV === 'production' ? 'warn' : 'info',
      redact: ['req.headers.authorization', 'body.password', 'body.token'],
    },
  });

  // plugins
  await app.register(prismaPlugin);
  await app.register(corsPlugin);
  await app.register(helmetPlugin);
  await app.register(cookiePlugin);
  await app.register(rateLimitPlugin);
  await app.register(multipartPlugin);
  await app.register(jwtPlugin);
  await app.register(staticPlugin);
  await app.register(mercadopagoPlugin);

  // error handler
  app.setErrorHandler(errorHandler);

  // health check
  app.get('/health', async () => ({ status: 'ok', timestamp: new Date().toISOString() }));

  // public routes
  await app.register(plansRoutes);
  await app.register(scheduleRoutes);
  await app.register(productsRoutes);

  // auth + user routes
  await app.register(authRoutes);
  await app.register(usersRoutes);

  // cart + orders (auth-protected)
  await app.register(cartRoutes);
  await app.register(ordersRoutes);

  // payments webhook (public) + subscriptions (auth-protected)
  await app.register(paymentsRoutes);
  await app.register(subscriptionsRoutes);

  // admin routes (admin-protected)
  await app.register(adminRoutes);

  return app;
}
