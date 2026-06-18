import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { requireAuth } from '../../middlewares/auth.js';

const addItemSchema = z.object({
  productId: z.string().cuid(),
  qty: z.number().int().min(1),
});

const updateItemSchema = z.object({
  qty: z.number().int().min(0),
});

function userId(req: any): string {
  return req.authUser.id;
}

function serializeCart(items: any[]) {
  const subtotal = items.reduce((s: number, i: any) => s + Number(i.product.price) * i.qty, 0);
  return {
    items: items.map((i) => ({
      productId: i.productId,
      name: i.product.name,
      price: Number(i.product.price),
      qty: i.qty,
      stock: i.product.stock,
      glyph: i.product.glyph,
      image: (i.product.images as string[])[0] ?? null,
    })),
    subtotal,
  };
}

export async function cartRoutes(app: FastifyInstance) {
  // ── GET /cart ─────────────────────────────────────────────────────
  app.get('/cart', { preHandler: requireAuth }, async (req) => {
    const items = await app.prisma.cartItem.findMany({
      where: { userId: userId(req) },
      include: { product: true },
    });
    return serializeCart(items);
  });

  // ── POST /cart/items ──────────────────────────────────────────────
  app.post('/cart/items', { preHandler: requireAuth }, async (req, reply) => {
    const body = addItemSchema.parse(req.body);
    const uid = userId(req);

    const product = await app.prisma.product.findUnique({ where: { id: body.productId } });
    if (!product || !product.active) {
      return reply.status(404).send({ error: 'NOT_FOUND', message: 'Produto não encontrado.', statusCode: 404 });
    }

    const existing = await app.prisma.cartItem.findUnique({
      where: { userId_productId: { userId: uid, productId: body.productId } },
    });

    const newQty = (existing?.qty ?? 0) + body.qty;
    if (newQty > product.stock) {
      return reply.status(400).send({ error: 'STOCK_EXCEEDED', message: `Estoque insuficiente. Disponível: ${product.stock}`, statusCode: 400 });
    }

    const item = await app.prisma.cartItem.upsert({
      where: { userId_productId: { userId: uid, productId: body.productId } },
      create: { userId: uid, productId: body.productId, qty: newQty },
      update: { qty: newQty },
      include: { product: true },
    });

    return {
      productId: item.productId,
      name: item.product.name,
      price: Number(item.product.price),
      qty: item.qty,
      stock: item.product.stock,
      glyph: item.product.glyph,
      image: (item.product.images as string[])[0] ?? null,
    };
  });

  // ── PATCH /cart/items/:productId ──────────────────────────────────
  app.patch('/cart/items/:productId', { preHandler: requireAuth }, async (req, reply) => {
    const { productId } = req.params as { productId: string };
    const { qty } = updateItemSchema.parse(req.body);
    const uid = userId(req);

    if (qty <= 0) {
      await app.prisma.cartItem.deleteMany({ where: { userId: uid, productId } });
      return { removed: true };
    }

    const product = await app.prisma.product.findUnique({ where: { id: productId } });
    if (!product) return reply.status(404).send({ error: 'NOT_FOUND', message: 'Produto não encontrado.', statusCode: 404 });

    if (qty > product.stock) {
      return reply.status(400).send({ error: 'STOCK_EXCEEDED', message: `Estoque insuficiente. Disponível: ${product.stock}`, statusCode: 400 });
    }

    const item = await app.prisma.cartItem.update({
      where: { userId_productId: { userId: uid, productId } },
      data: { qty },
      include: { product: true },
    });

    return {
      productId: item.productId,
      name: item.product.name,
      price: Number(item.product.price),
      qty: item.qty,
    };
  });

  // ── DELETE /cart/items/:productId ─────────────────────────────────
  app.delete('/cart/items/:productId', { preHandler: requireAuth }, async (req) => {
    const { productId } = req.params as { productId: string };
    await app.prisma.cartItem.deleteMany({ where: { userId: userId(req), productId } });
    return { ok: true };
  });

  // ── DELETE /cart ──────────────────────────────────────────────────
  app.delete('/cart', { preHandler: requireAuth }, async (req) => {
    await app.prisma.cartItem.deleteMany({ where: { userId: userId(req) } });
    return { ok: true };
  });
}
