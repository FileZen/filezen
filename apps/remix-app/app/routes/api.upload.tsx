import { ZenApi } from '@filezen/js';
import { createZenRemixRouter } from '@filezen/remix';

const zenApi = new ZenApi();

const requestMiddleware = async (request: Request) => {
  /**
   * Here you can verify request, e.g - check user authentication:
   * const user = await getUserFromRequest(request);
   * if (!user) {
   *    throw new ZenError(401, 'Unauthorized');
   * }
   * return { userId: user.id }
   */
};

export const { action, loader } = createZenRemixRouter(zenApi, {
  onRequest: requestMiddleware,
});