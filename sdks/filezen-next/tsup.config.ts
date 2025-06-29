import { browserSdkConfig } from '@repo/tsup-config';

export default browserSdkConfig({
  entry: ['src/index.ts'],
  external: ['next', 'react', '@filezen/js', '@filezen/react'],
});
