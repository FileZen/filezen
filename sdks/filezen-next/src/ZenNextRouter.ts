import { ZenApi } from '@filezen/js';
import { createZenRouter } from '@filezen/js/server';
import { NextRequest, NextResponse } from 'next/server';

export const createZenNextRouter = (api: ZenApi) => {
  const router = createZenRouter<NextRequest, NextResponse>(api, {
    buildResponse: (data: object) => NextResponse.json(data),
    formDataFromRequest: (request: NextRequest) => request.formData(),
    searchParameterFromRequest: (request: NextRequest) =>
      request.nextUrl.searchParams,
  });
  return {
    POST: router.postMethodsHandler,
    DELETE: router.deleteMethodsHandler,
  };
};
