import fp from 'fastify-plugin';
import fastifyStatic from '@fastify/static';
import path from 'path';
import { mkdir } from 'fs/promises';

const UPLOADS_BASE = process.env.UPLOADS_DIR || '/app/uploads';

export const staticPlugin = fp(async (app) => {
  await mkdir(UPLOADS_BASE, { recursive: true });

  await app.register(fastifyStatic, {
    root: path.resolve(UPLOADS_BASE),
    prefix: '/uploads/',
    decorateReply: false,
  });
});
