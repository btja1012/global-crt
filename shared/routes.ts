import { z } from 'zod';
import { insertTicketSchema, insertCommentSchema, tickets, comments, attachments } from './schema';

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
  tickets: {
    list: {
      method: 'GET' as const,
      path: '/api/tickets' as const,
      responses: {
        200: z.array(z.any()),
        401: errorSchemas.unauthorized,
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/tickets/:id' as const,
      responses: {
        200: z.any(),
        404: errorSchemas.notFound,
        401: errorSchemas.unauthorized,
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/tickets' as const,
      input: insertTicketSchema,
      responses: {
        201: z.any(),
        400: errorSchemas.validation,
        401: errorSchemas.unauthorized,
      },
    },
    update: {
      method: 'PUT' as const,
      path: '/api/tickets/:id' as const,
      input: insertTicketSchema.partial(),
      responses: {
        200: z.any(),
        400: errorSchemas.validation,
        404: errorSchemas.notFound,
        401: errorSchemas.unauthorized,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/tickets/:id' as const,
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
        401: errorSchemas.unauthorized,
      },
    },
  },
  comments: {
    list: {
      method: 'GET' as const,
      path: '/api/tickets/:ticketId/comments' as const,
      responses: {
        200: z.array(z.any()),
        401: errorSchemas.unauthorized,
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/tickets/:ticketId/comments' as const,
      input: z.object({ content: z.string().min(1) }),
      responses: {
        201: z.any(),
        400: errorSchemas.validation,
        401: errorSchemas.unauthorized,
      },
    },
  },
  attachments: {
    list: {
      method: 'GET' as const,
      path: '/api/tickets/:ticketId/attachments' as const,
      responses: {
        200: z.array(z.any()),
        401: errorSchemas.unauthorized,
      },
    },
    upload: {
      method: 'POST' as const,
      path: '/api/tickets/:ticketId/attachments' as const,
      responses: {
        201: z.any(),
        400: errorSchemas.validation,
        401: errorSchemas.unauthorized,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/attachments/:id' as const,
      responses: {
        204: z.void(),
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
