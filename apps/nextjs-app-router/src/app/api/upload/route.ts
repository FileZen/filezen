import { ZenApi } from '@filezen/js';
import { createZenNextRouter } from '@filezen/next';
import { NextRequest } from 'next/server';

const zenApi = new ZenApi();

const requestMiddleware = async (request: NextRequest) => {
  /**
   * Here you can verify request, e.g - check user authentication:
   * const user = await getUserFromRequest(request);
   * if (!user) {
   *    throw new ZenError(401, 'Unauthorized');
   * }
   * return { userId: user.id }
   */
};

export const { POST, DELETE } = createZenNextRouter(zenApi, {
  onRequest: requestMiddleware,
});
