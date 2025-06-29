import { fullStackSdkConfig } from '@repo/tsup-config';

export default fullStackSdkConfig({
  entry: ['src/index.ts', 'src/server/index.ts'],
});
