import { ZenApi, ZenError } from '@filezen/js';
import { createZenRouter, CreateZenRouterOptions } from '@filezen/js/server';
import { json, type RequestEvent } from '@sveltejs/kit';

export const createZenSvelteRouter = (
  api: ZenApi,
  options?: Partial<CreateZenRouterOptions<RequestEvent, Response>>,
) => {
  const router = createZenRouter<RequestEvent, Response>(api, {
    buildResponse: (data: object) => json(data),
    buildErrorResponse: (error: ZenError) =>
      json(error, { status: error.code }),
    formDataFromRequest: (event: RequestEvent) => event.request.formData(),
    searchParameterFromRequest: (event: RequestEvent) => event.url.searchParams,
    ...options,
  });

  return {
    POST: router.postMethodsHandler,
    DELETE: router.deleteMethodsHandler,
  };
};
