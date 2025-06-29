# @repo/tsup-config

Shared tsup configurations for FileZen SDK packages.

## Usage

Install in your SDK package:

```json
{
  "devDependencies": {
    "@repo/tsup-config": "*"
  }
}
```

## Configurations

### Base Config

Generic configuration for any TypeScript package:

```js
// tsup.config.js
import { createSdkConfig } from '@repo/tsup-config'

export default createSdkConfig({
  entry: ['src/index.ts'],
  external: ['your-external-deps']
})
```

### Browser SDK

Optimized for browser-only packages:

```js
// tsup.config.js  
import { browserSdkConfig } from '@repo/tsup-config'

export default browserSdkConfig({
  entry: ['src/index.ts']
})
```

### Server SDK

Optimized for Node.js server packages:

```js
// tsup.config.js
import { serverSdkConfig } from '@repo/tsup-config'

export default serverSdkConfig({
  entry: ['src/index.ts']
})
```

### Fullstack SDK

For packages that work in both browser and server:

```js
// tsup.config.js
import { fullStackSdkConfig } from '@repo/tsup-config'

export default fullStackSdkConfig({
  entry: ['src/index.ts', 'src/server/index.ts']
})
```

## Features

All configurations include:

- ✅ **Dual Format**: Generates both CJS (`.js`) and ESM (`.mjs`)
- ✅ **TypeScript**: Generates `.d.ts` declaration files
- ✅ **Source Maps**: For debugging
- ✅ **Tree Shaking**: Removes unused code
- ✅ **Clean Build**: Clears dist folder before build

## Customization

You can override any option:

```js
import { createSdkConfig } from '@repo/tsup-config'

export default createSdkConfig({
  entry: ['src/index.ts'],
  minify: true,  // Override default
  external: ['custom-external'],
  // ... any other tsup options
})
``` 