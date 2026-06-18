import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { mkdir, writeFile, unlink } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { requireAdmin } from '../../middlewares/auth.js';

const UPLOADS_BASE = process.env.UPLOADS_DIR || '/app/uploads';
const ALLOWED_MIME = ['image/jpeg', 'image/png', 'image/webp'];

const listQuerySchema = z.object({
  category: z.string().optional(),
  search: z.string().optional(),
  active: z.coerce.boolean().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

async function saveUploadedImages(
  app: FastifyInstance,
  productId: string,
  req: Parameters<typeof app.get>[1] extends (req: infer R, ...args: any[]) => any ? R : never
): Promise<string[]> {
  const urls: string[] = [];
  const dir = path.join(UPLOADS_BASE, 'products', productId);

  if (!existsSync(dir)) await mkdir(dir, { recursive: true });

  const parts = (req as any).parts?.();
  if (!parts) return urls;

  for await (const part of parts) {
    if (part.type !== 'file') continue;
    if (!ALLOWED_MIME.includes(part.mimetype)) continue;
    const buf = await part.toBuffer();
    if (buf.byteLength > 5 * 1024 * 1024) continue;
    const ext = part.mimetype.split('/')[1] === 'jpeg' ? 'jpg' : part.mimetype.split('/')[1];
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    await writeFile(path.join(dir, filename), buf);
    urls.push(`/uploads/products/${productId}/${filename}`);
  }

  return urls;
}

export async function productsRoutes(app: FastifyInstance) {
  // ── Public: list ──────────────────────────────────────────────────
  app.get('/products', async (req) => {
    const query = listQuerySchema.parse(req.query);
    const skip = (query.page - 1) * query.limit;

    const where = {
      active: query.active !== undefined ? query.active : true,
      ...(query.category ? { category: query.category } : {}),
      ...(query.search
        ? {
            OR: [
              { name: { contains: query.search, mode: 'insensitive' as const } },
              { description: { contains: query.search, mode: 'insensitive' as const } },
            ],
          }
        : {}),
    };

    const [total, products] = await Promise.all([
      app.prisma.product.count({ where }),
      app.prisma.product.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: query.limit,
      }),
    ]);

    return { data: products, total, page: query.page, limit: query.limit, pages: Math.ceil(total / query.limit) };
  });

  // ── Public: single ────────────────────────────────────────────────
  app.get('/products/:id', async (req, reply) => {
    const { id } = req.params as { id: string };
    const product = await app.prisma.product.findUnique({ where: { id } });
    if (!product) return reply.status(404).send({ error: 'NOT_FOUND', message: 'Produto não encontrado', statusCode: 404 });
    return product;
  });

  // ── Admin: create ─────────────────────────────────────────────────
  app.post('/products', { preHandler: requireAdmin }, async (req, reply) => {
    const fields: Record<string, string> = {};
    const fileBuffers: Array<{ buf: Buffer; mime: string }> = [];

    for await (const part of (req as any).parts()) {
      if (part.type === 'field') {
        fields[part.fieldname] = part.value as string;
      } else if (part.type === 'file') {
        if (!ALLOWED_MIME.includes(part.mimetype)) continue;
        const buf = await part.toBuffer();
        if (buf.byteLength > 5 * 1024 * 1024) continue;
        fileBuffers.push({ buf, mime: part.mimetype });
      }
    }

    const schema = z.object({
      name: z.string().min(1).max(200),
      description: z.string().optional().default(''),
      price: z.coerce.number().positive(),
      category: z.string().min(1),
      stock: z.coerce.number().int().min(0).default(0),
      glyph: z.string().optional().default('box'),
    });

    let parsed;
    try {
      parsed = schema.parse(fields);
    } catch (e: any) {
      return reply.status(400).send({ error: 'VALIDATION_ERROR', message: e.message, statusCode: 400 });
    }

    const product = await app.prisma.product.create({
      data: {
        name: parsed.name,
        description: parsed.description,
        price: parsed.price,
        category: parsed.category,
        stock: parsed.stock,
        glyph: parsed.glyph,
        images: [],
      },
    });

    if (fileBuffers.length > 0) {
      const dir = path.join(UPLOADS_BASE, 'products', product.id);
      await mkdir(dir, { recursive: true });
      const urls: string[] = [];
      for (const { buf, mime } of fileBuffers) {
        const ext = mime === 'image/jpeg' ? 'jpg' : mime.split('/')[1];
        const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
        await writeFile(path.join(dir, filename), buf);
        urls.push(`/uploads/products/${product.id}/${filename}`);
      }
      await app.prisma.product.update({ where: { id: product.id }, data: { images: urls } });
      return { ...product, images: urls };
    }

    return product;
  });

  // ── Admin: update ─────────────────────────────────────────────────
  app.patch('/products/:id', { preHandler: requireAdmin }, async (req, reply) => {
    const { id } = req.params as { id: string };

    const existing = await app.prisma.product.findUnique({ where: { id } });
    if (!existing) return reply.status(404).send({ error: 'NOT_FOUND', message: 'Produto não encontrado', statusCode: 404 });

    const fields: Record<string, string> = {};
    const fileBuffers: Array<{ buf: Buffer; mime: string }> = [];

    for await (const part of (req as any).parts()) {
      if (part.type === 'field') {
        fields[part.fieldname] = part.value as string;
      } else if (part.type === 'file') {
        if (!ALLOWED_MIME.includes(part.mimetype)) continue;
        const buf = await part.toBuffer();
        if (buf.byteLength > 5 * 1024 * 1024) continue;
        fileBuffers.push({ buf, mime: part.mimetype });
      }
    }

    const schema = z.object({
      name: z.string().min(1).max(200).optional(),
      description: z.string().optional(),
      price: z.coerce.number().positive().optional(),
      category: z.string().min(1).optional(),
      stock: z.coerce.number().int().min(0).optional(),
      glyph: z.string().optional(),
      active: z.enum(['true', 'false']).transform((v) => v === 'true').optional(),
    });

    let parsed;
    try {
      parsed = schema.parse(fields);
    } catch (e: any) {
      return reply.status(400).send({ error: 'VALIDATION_ERROR', message: e.message, statusCode: 400 });
    }

    let newImages = existing.images as string[];
    if (fileBuffers.length > 0) {
      const dir = path.join(UPLOADS_BASE, 'products', id);
      await mkdir(dir, { recursive: true });
      for (const { buf, mime } of fileBuffers) {
        const ext = mime === 'image/jpeg' ? 'jpg' : mime.split('/')[1];
        const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
        await writeFile(path.join(dir, filename), buf);
        newImages = [...newImages, `/uploads/products/${id}/${filename}`];
      }
    }

    const product = await app.prisma.product.update({
      where: { id },
      data: { ...parsed, images: newImages },
    });

    return product;
  });

  // ── Admin: soft delete ────────────────────────────────────────────
  app.delete('/products/:id', { preHandler: requireAdmin }, async (req, reply) => {
    const { id } = req.params as { id: string };
    const existing = await app.prisma.product.findUnique({ where: { id } });
    if (!existing) return reply.status(404).send({ error: 'NOT_FOUND', message: 'Produto não encontrado', statusCode: 404 });
    await app.prisma.product.update({ where: { id }, data: { active: false } });
    return { ok: true };
  });
}
