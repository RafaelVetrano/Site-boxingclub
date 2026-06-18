import { FastifyError, FastifyRequest, FastifyReply } from 'fastify';
import { ZodError } from 'zod';

export function errorHandler(
  error: FastifyError | ZodError | Error,
  req: FastifyRequest,
  reply: FastifyReply
) {
  const isProd = process.env.NODE_ENV === 'production';

  if (error instanceof ZodError) {
    return reply.status(400).send({
      error: 'VALIDATION_ERROR',
      message: 'Dados inválidos',
      statusCode: 400,
      details: error.flatten().fieldErrors,
    });
  }

  const fastifyError = error as FastifyError;

  if (fastifyError.statusCode === 429) {
    return reply.status(429).send({
      error: 'TOO_MANY_REQUESTS',
      message: 'Muitas tentativas. Tente novamente em breve.',
      statusCode: 429,
    });
  }

  if (fastifyError.validation) {
    return reply.status(400).send({
      error: 'VALIDATION_ERROR',
      message: fastifyError.message,
      statusCode: 400,
    });
  }

  const statusCode = fastifyError.statusCode ?? 500;

  req.log.error({ err: error, req: { method: req.method, url: req.url } });

  return reply.status(statusCode).send({
    error: fastifyError.code ?? 'INTERNAL_ERROR',
    message: statusCode >= 500 && isProd ? 'Erro interno do servidor' : error.message,
    statusCode,
    ...(statusCode < 500 || !isProd ? {} : {}),
  });
}
