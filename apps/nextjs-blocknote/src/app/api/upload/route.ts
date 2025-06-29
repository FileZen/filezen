import { ZenApi } from '@filezen/js';
import { createZenNextRouter } from '@filezen/next';

const zenApi = new ZenApi();

export const { POST, DELETE } = createZenNextRouter(zenApi);
