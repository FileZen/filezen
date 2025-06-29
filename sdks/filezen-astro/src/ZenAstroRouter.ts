import { ZenApi, ZenError } from '@filezen/js';
import { createZenRouter, CreateZenRouterOptions } from '@filezen/js/server';
import type { APIContext } from 'astro';

export const createZenAstroRouter = (
  api: ZenApi,
  options?: Partial<CreateZenRouterOptions<APIContext, Response>>,
) => {
  const router = createZenRouter<APIContext, Response>(api, {
    buildResponse: (data: object) =>
      new Response(JSON.stringify(data), {
        headers: { 'Content-Type': 'application/json' },
      }),
    buildErrorResponse: (error: ZenError) =>
      new Response(JSON.stringify(error), {
        status: error.code,
        headers: { 'Content-Type': 'application/json' },
      }),
    formDataFromRequest: (context: APIContext) => context.request.formData(),
    searchParameterFromRequest: (context: APIContext) =>
      context.url.searchParams,
    ...options,
  });

  return {
    POST: router.postMethodsHandler,
    DELETE: router.deleteMethodsHandler,
  };
};
