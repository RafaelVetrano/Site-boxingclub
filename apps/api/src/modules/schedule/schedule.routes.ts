import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { requireAdmin } from '../../middlewares/auth.js';

const scheduleBodySchema = z.object({
  day: z.number().int().min(0).max(5),
  time: z.string().regex(/^\d{1,2}:\d{2}$/, 'Formato inválido: HH:MM'),
  categoryId: z.string().min(1),
  teacher: z.string().optional(),
  notes: z.string().optional(),
});

const categoryBodySchema = z.object({
  id: z.string().min(1).optional(),
  label: z.string().min(1),
  color: z.string().min(1),
});

export async function scheduleRoutes(app: FastifyInstance) {
  // ── GET /schedule (public) ───────────────────────────────────────
  app.get('/schedule', async () => {
    const schedules = await app.prisma.classSchedule.findMany({
      include: { category: true },
      orderBy: [{ day: 'asc' }, { time: 'asc' }],
    });
    return schedules;
  });

  // ── POST /schedule (admin) ───────────────────────────────────────
  app.post('/schedule', { preHandler: requireAdmin }, async (req, reply) => {
    const body = scheduleBodySchema.parse(req.body);

    const category = await app.prisma.classCategory.findUnique({ where: { id: body.categoryId } });
    if (!category) return reply.status(400).send({ error: 'INVALID_CATEGORY', message: 'Categoria não encontrada.', statusCode: 400 });

    const item = await app.prisma.classSchedule.create({
      data: {
        day: body.day,
        time: body.time,
        categoryId: body.categoryId,
        teacher: body.teacher ?? null,
        notes: body.notes ?? null,
      },
      include: { category: true },
    });

    return reply.status(201).send(item);
  });

  // ── PATCH /schedule/:id (admin) ──────────────────────────────────
  app.patch('/schedule/:id', { preHandler: requireAdmin }, async (req, reply) => {
    const { id } = req.params as { id: string };
    const body = scheduleBodySchema.partial().parse(req.body);

    const existing = await app.prisma.classSchedule.findUnique({ where: { id } });
    if (!existing) return reply.status(404).send({ error: 'NOT_FOUND', message: 'Horário não encontrado.', statusCode: 404 });

    if (body.categoryId) {
      const category = await app.prisma.classCategory.findUnique({ where: { id: body.categoryId } });
      if (!category) return reply.status(400).send({ error: 'INVALID_CATEGORY', message: 'Categoria não encontrada.', statusCode: 400 });
    }

    const item = await app.prisma.classSchedule.update({
      where: { id },
      data: body,
      include: { category: true },
    });

    return item;
  });

  // ── DELETE /schedule/:id (admin) ─────────────────────────────────
  app.delete('/schedule/:id', { preHandler: requireAdmin }, async (req, reply) => {
    const { id } = req.params as { id: string };

    const existing = await app.prisma.classSchedule.findUnique({ where: { id } });
    if (!existing) return reply.status(404).send({ error: 'NOT_FOUND', message: 'Horário não encontrado.', statusCode: 404 });

    await app.prisma.classSchedule.delete({ where: { id } });
    return reply.status(204).send();
  });

  // ── GET /categories (public) ─────────────────────────────────────
  app.get('/categories', async () => {
    const categories = await app.prisma.classCategory.findMany({
      orderBy: { label: 'asc' },
    });
    return categories;
  });

  // ── POST /categories (admin) ─────────────────────────────────────
  app.post('/categories', { preHandler: requireAdmin }, async (req, reply) => {
    const body = categoryBodySchema.parse(req.body);

    const data: any = {
      label: body.label,
      color: body.color,
    };
    if (body.id) data.id = body.id;

    const category = await app.prisma.classCategory.create({ data });
    return reply.status(201).send(category);
  });

  // ── PATCH /categories/:id (admin) ────────────────────────────────
  app.patch('/categories/:id', { preHandler: requireAdmin }, async (req, reply) => {
    const { id } = req.params as { id: string };
    const body = categoryBodySchema.partial().parse(req.body);

    const existing = await app.prisma.classCategory.findUnique({ where: { id } });
    if (!existing) return reply.status(404).send({ error: 'NOT_FOUND', message: 'Categoria não encontrada.', statusCode: 404 });

    const category = await app.prisma.classCategory.update({
      where: { id },
      data: { label: body.label, color: body.color },
    });

    return category;
  });

  // ── DELETE /categories/:id (admin) ───────────────────────────────
  app.delete('/categories/:id', { preHandler: requireAdmin }, async (req, reply) => {
    const { id } = req.params as { id: string };

    const existing = await app.prisma.classCategory.findUnique({ where: { id } });
    if (!existing) return reply.status(404).send({ error: 'NOT_FOUND', message: 'Categoria não encontrada.', statusCode: 404 });

    const inUse = await app.prisma.classSchedule.count({ where: { categoryId: id } });
    if (inUse > 0) {
      return reply.status(400).send({ error: 'CATEGORY_IN_USE', message: `Esta categoria está associada a ${inUse} aula(s). Remova as aulas primeiro.`, statusCode: 400 });
    }

    await app.prisma.classCategory.delete({ where: { id } });
    return reply.status(204).send();
  });
}
