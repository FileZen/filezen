import { createZenAstroRouter } from '@filezen/astro';
import { ZenApi } from '@filezen/js';
import type { APIContext } from 'astro';

const zenApi = new ZenApi();

const requestMiddleware = async (context: APIContext) => {
  /**
   * Here you can verify request, e.g - check user authentication:
   * const user = await getUserFromRequest(context);
   * if (!user) {
   *    throw new ZenError(401, 'Unauthorized');
   * }
   * return { userId: user.id }
   */
};

export const { POST, DELETE } = createZenAstroRouter(zenApi, {
  onRequest: requestMiddleware,
});
