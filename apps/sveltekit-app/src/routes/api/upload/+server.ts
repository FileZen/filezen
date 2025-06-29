import { FILEZEN_API_KEY } from '$env/static/private';
import { ZenApi } from '@filezen/js';
import { createZenSvelteRouter } from '@filezen/svelte';
import type { RequestEvent } from '@sveltejs/kit';

const zenApi = new ZenApi({
  apiKey: FILEZEN_API_KEY,
});

const requestMiddleware = async (event: RequestEvent) => {
  /**
   * Here you can verify request, e.g - check user authentication:
   * const user = await getUserFromRequest(event);
   * if (!user) {
   *    throw new ZenError(401, 'Unauthorized');
   * }
   * return { userId: user.id }
   */
};

const router = createZenSvelteRouter(zenApi, {
  onRequest: requestMiddleware,
});

export const { POST, DELETE } = router;
