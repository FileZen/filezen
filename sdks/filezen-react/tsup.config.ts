import { browserSdkConfig } from '@repo/tsup-config';

export default browserSdkConfig({
  entry: ['src/index.ts'],
  external: ['react', 'react-dom', '@filezen/js'],
});
