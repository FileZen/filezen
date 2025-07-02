import { ZenApi } from '../ZenApi';
import { buildZenError, ZenError } from '../ZenError';
import { ZenSigner } from './ZenSigner';
import { isValidUUID } from '../utils';

export type CreateZenRouterOptions<Request, Response> = {
  buildResponse: (data: object) => Response;
  buildErrorResponse: (error: ZenError) => Response;
  formDataFromRequest: (request: Request) => Promise<FormData>;
  searchParameterFromRequest: (request: Request) => URLSearchParams;
  onRequest?: (
    request: Request,
  ) => Promise<object | void | undefined> | (object | void | undefined);
};

export const createZenRouter = <Request, Response>(
  api: ZenApi,
  options: CreateZenRouterOptions<Request, Response>,
) => {
  const signer = new ZenSigner(api);

  async function postMethodsHandler(request: Request) {
    try {
      const additionalMetadata = await options.onRequest?.(request);
      const formData = await options.formDataFromRequest(request);

      const signedUrl = signer.generateSignedUrl({
        path: formData.get('path') as string,
        fileKey: formData.get('fileKey') as string,
        expiresIn: formData.get('expiresIn') as any,
      });

      return options.buildResponse({ url: signedUrl });
    } catch (error) {
      return options.buildErrorResponse(buildZenError(error));
    }
  }

  async function deleteMethodsHandler(request: Request) {
    try {
      const additionalMetadata = await options.onRequest?.(request);
      const searchParams = options.searchParameterFromRequest(request);
      const urlOrId = searchParams.get('urlOrId') as string;
      if (!urlOrId) {
        return options.buildErrorResponse(
          new ZenError(400, 'urlOrId query parameter is required'),
        );
      }
      const result = await (isValidUUID(urlOrId)
        ? api.deleteFile(urlOrId)
        : api.deleteFileByUrl(urlOrId));
      return options.buildResponse({ success: result.data });
    } catch (error) {
      return options.buildErrorResponse(buildZenError(error));
    }
  }

  return { postMethodsHandler, deleteMethodsHandler };
};
