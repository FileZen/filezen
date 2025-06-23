import { ZenApi, ZenError } from '@filezen/js';
import { createZenRouter, CreateZenRouterOptions } from '@filezen/js/server';
import { NextRequest, NextResponse } from 'next/server';

export const createZenNextRouter = (
  api: ZenApi,
  options?: Partial<CreateZenRouterOptions<NextRequest, NextResponse>>,
) => {
  const router = createZenRouter<NextRequest, NextResponse>(api, {
    buildResponse: (data: object) => NextResponse.json(data),
    buildErrorResponse: (error: ZenError) =>
      new NextResponse(JSON.stringify(error), { status: error.code }),
    formDataFromRequest: (request: NextRequest) => request.formData(),
    searchParameterFromRequest: (request: NextRequest) =>
      request.nextUrl.searchParams,
    ...options,
  });
  return {
    POST: router.postMethodsHandler,
    DELETE: router.deleteMethodsHandler,
  };
};
