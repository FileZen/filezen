import { ZenApi, ZenError } from '@filezen/js';
import { createZenRouter, CreateZenRouterOptions } from '@filezen/js/server';
import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node';

export const createZenRemixRouter = (
  api: ZenApi,
  options?: Partial<CreateZenRouterOptions<Request, Response>>,
) => {
  const router = createZenRouter<Request, Response>(api, {
    buildResponse: (data: object) => new Response(JSON.stringify(data), {
      headers: { 'Content-Type': 'application/json' },
    }),
    buildErrorResponse: (error: ZenError) =>
      new Response(JSON.stringify(error), { 
        status: error.code,
        headers: { 'Content-Type': 'application/json' },
      }),
    formDataFromRequest: (request: Request) => request.formData(),
    searchParameterFromRequest: (request: Request) => {
      const url = new URL(request.url);
      return url.searchParams;
    },
    ...options,
  });

  const action = async ({ request }: ActionFunctionArgs) => {
    return router.postMethodsHandler(request);
  };

  const loader = async ({ request }: LoaderFunctionArgs) => {
    return router.deleteMethodsHandler(request);
  };

  return { action, loader };
}; 