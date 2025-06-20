import { validate as isValidUUID } from 'uuid';
import { ZenApi } from '../ZenApi';
import { ZenSigner } from './ZenSigner';

export type CreateZenRouterOptions<Request, Response> = {
  buildResponse: (data: object) => Response;
  formDataFromRequest: (request: Request) => Promise<FormData>;
  searchParameterFromRequest: (request: Request) => URLSearchParams;
};

export const createZenRouter = <Request, Response>(
  api: ZenApi,
  options: CreateZenRouterOptions<Request, Response>,
) => {
  const signer = new ZenSigner(api);

  async function postMethodsHandler(request: Request) {
    const formData = await options.formDataFromRequest(request);

    const signedUrl = signer.generateSignedUrl({
      path: formData.get('path') as string,
      fileKey: formData.get('fileKey') as string,
      expiresIn: formData.get('expiresIn') as any,
    });

    return options.buildResponse({ url: signedUrl });
  }

  async function deleteMethodsHandler(request: Request) {
    const searchParams = options.searchParameterFromRequest(request);
    const urlOrId = searchParams.get('urlOrId') as string;
    if (!urlOrId) {
      throw new Error('urlOrId query parameter is required');
    }
    const result = await (isValidUUID(urlOrId)
      ? api.deleteFile(urlOrId)
      : api.deleteFileByUrl(urlOrId));
    return options.buildResponse({ success: result.data });
  }

  return { postMethodsHandler, deleteMethodsHandler };
};
