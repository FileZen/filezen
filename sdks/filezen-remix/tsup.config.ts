import { createSdkConfig } from '@repo/tsup-config';

export default createSdkConfig({
  entry: ['src/index.ts'],
  external: ['@filezen/js', '@filezen/react', '@remix-run/node', 'react'],
});
