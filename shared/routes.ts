import { z } from 'zod';
import { insertCargoSchema, cargos } from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  unauthorized: z.object({
    message: z.string(),
  })
};

export const api = {
  cargos: {
    list: {
      method: 'GET' as const,
      path: '/api/cargos' as const,
      responses: {
        200: z.array(z.custom<typeof cargos.$inferSelect>()),
        401: errorSchemas.unauthorized,
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/cargos/:id' as const,
      responses: {
        200: z.custom<typeof cargos.$inferSelect>(),
        404: errorSchemas.notFound,
        401: errorSchemas.unauthorized,
      },
    },
    track: {
      method: 'GET' as const,
      path: '/api/track/:trackingNumber' as const,
      responses: {
        200: z.custom<typeof cargos.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/cargos' as const,
      input: insertCargoSchema,
      responses: {
        201: z.custom<typeof cargos.$inferSelect>(),
        400: errorSchemas.validation,
        401: errorSchemas.unauthorized,
      },
    },
    update: {
      method: 'PUT' as const,
      path: '/api/cargos/:id' as const,
      input: insertCargoSchema.partial(),
      responses: {
        200: z.custom<typeof cargos.$inferSelect>(),
        400: errorSchemas.validation,
        404: errorSchemas.notFound,
        401: errorSchemas.unauthorized,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/cargos/:id' as const,
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
        401: errorSchemas.unauthorized,
      },
    },
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}

export type CargoInput = z.infer<typeof api.cargos.create.input>;
export type CargoUpdateInput = z.infer<typeof api.cargos.update.input>;
export type CargoResponse = z.infer<typeof api.cargos.create.responses[201]>;
