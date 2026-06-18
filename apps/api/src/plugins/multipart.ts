import fp from 'fastify-plugin';
import fastifyMultipart from '@fastify/multipart';

export const multipartPlugin = fp(async (app) => {
  await app.register(fastifyMultipart, {
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB
      files: 10,
    },
  });
});
