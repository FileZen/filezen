import { ZenApi } from '@filezen/js';
import { createZenRouter } from '@filezen/js/server';
import { NextRequest, NextResponse } from 'next/server';

export const createZenNextRouter = (api: ZenApi) => {
  const router = createZenRouter<NextRequest, NextResponse>(api, {
    buildResponse: (data) => NextResponse.json(data),
    formDataFromRequest: (request) => request.formData(),
    searchParameterFromRequest: (request) => request.nextUrl.searchParams,
  });
  return {
    POST: router.postMethodsHandler,
    DELETE: router.deleteMethodsHandler,
  };
};
