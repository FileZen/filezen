# FileZen Astro Example

This example demonstrates how to use FileZen for file uploads in an Astro application, showcasing both pure Astro components and React components within the same app.

## Features

- 📤 **File Upload**: Drag and drop or click to upload images
- 🔄 **File Replacement**: Automatically deletes previous files when uploading new ones  
- ⚡ **Astro API Routes**: Server-side upload handling with type safety
- 🎨 **Multi-Framework**: Pure Astro components and React components side-by-side
- 🔧 **TypeScript**: Full type safety throughout the application
- 🚀 **Server-Side Rendering**: Dynamic API routes with SSR support

## About Astro Integration

This example showcases the unique capabilities of Astro's architecture:

- **Pure Astro Components**: Server-rendered `.astro` components with client-side JavaScript
- **React Integration**: Full React components with hooks and state management  
- **Framework Agnostic**: FileZen works seamlessly with any framework in Astro
- **Islands Architecture**: Only hydrate components that need interactivity

## Getting Started

### Prerequisites

- Node.js 18+
- Yarn (this project uses Yarn workspaces)
- FileZen API key

### Installation

1. Install dependencies:
```bash
yarn install
```

2. Set up your environment variables:
```bash
# Create .env file in the root of your project
FILEZEN_API_KEY=your_api_key_here
```

3. Start the development server:
```bash
yarn dev
```

4. Open [http://localhost:4321](http://localhost:4321) to view the application.

## Project Structure

```
src/
├── layouts/
│   └── Layout.astro             # Root layout component
├── pages/
│   ├── index.astro              # Home page
│   └── api/
│       └── upload.ts            # Upload API endpoint
├── components/
│   ├── FileUpload.astro         # Pure Astro upload component
│   └── FileUploadReact.tsx      # React upload component
└── env.d.ts                     # Environment types
```

## How It Works

### API Route Integration

The `/api/upload` endpoint uses the `@filezen/astro` SDK:

```typescript
import { ZenApi } from '@filezen/js';
import { createZenAstroRouter } from '@filezen/astro';

const zenApi = new ZenApi({
  apiKey: import.meta.env.FILEZEN_API_KEY,
});

export const { POST, DELETE } = createZenAstroRouter(zenApi, {
  onRequest: requestMiddleware,
});
```

### Pure Astro Component

The `FileUpload.astro` component demonstrates:
- Server-side rendering with client-side interactivity
- Vanilla JavaScript for drag-and-drop functionality
- Scoped CSS styling
- TypeScript support in client scripts

### React Component Integration  

The `FileUploadReact.tsx` component showcases:
- Full React hooks and state management
- TypeScript interfaces for type safety
- Event handling with React patterns
- Inline styling for demonstration

## Framework Comparison

| Feature | Pure Astro | React in Astro |
|---------|------------|----------------|
| **Bundle Size** | Minimal JS | React runtime included |
| **Hydration** | Island-based | Component-level |
| **Development** | Astro syntax | Familiar React patterns |
| **Performance** | Maximum efficiency | Good with selective hydration |

## Configuration

### Environment Variables

Create a `.env` file:

```bash
FILEZEN_API_KEY=your_api_key_here
```

### Astro Configuration

The app is configured for server-side rendering in `astro.config.mjs`:

```javascript
export default defineConfig({
  integrations: [react()],
  output: 'server', // SSR mode for API routes
});
```

### Custom Middleware

Add authentication or validation in the API route:

```typescript
const requestMiddleware = async (context: APIContext) => {
  // Add authentication logic
  const user = await getUserFromRequest(context);
  if (!user) {
    throw new ZenError(401, 'Unauthorized');
  }
  return { userId: user.id };
};
```

## Key Technologies

- **Astro 4.0+**: Modern web framework with islands architecture
- **React 18**: Optional UI library integration
- **FileZen**: File upload and management service  
- **TypeScript**: Type-safe development
- **Vite**: Fast build tool and development server

## API Endpoints

- `POST /api/upload` - Upload a file via FileZen
- `DELETE /api/upload` - Delete a file via FileZen

## Building for Production

```bash
# Build the application
yarn build

# Preview the production build
yarn preview
```

## Deployment Options

Astro's server mode works with various SSR-compatible deployment platforms:

- **Node.js**: Traditional server deployments
- **Serverless**: Vercel, Netlify Functions
- **Edge Runtime**: Cloudflare Workers, Vercel Edge Functions
- **Container**: Docker, Kubernetes deployments

## Framework Extensions

Easily add other frameworks to the same app:

```bash
# Add Vue support
npm astro add vue

# Add Svelte support  
npm astro add svelte

# Add solid support
npm astro add solid
```

Then use FileZen with any framework:

```vue
<!-- FileUploadVue.vue -->
<script setup lang="ts">
import { ZenClient } from '@filezen/js';
// Vue component logic...
</script>
```

## Performance Benefits

- **Minimal JavaScript**: Only components that need interactivity are hydrated
- **Framework Flexibility**: Choose the right tool for each component
- **Static Generation**: Most content is pre-rendered at build time
- **Progressive Enhancement**: Works without JavaScript, enhanced with it

## Troubleshooting

### Common Issues

1. **Import errors**: Ensure `@filezen/astro` is properly installed
2. **Environment variables**: Check `.env` file is in the project root
3. **React hydration**: Use `client:load` directive for interactive components

### Debug Mode

Enable debug logging:
```bash
DEBUG=filezen:* yarn dev
```

## Related Documentation

- [Astro Documentation](https://docs.astro.build) - Framework overview and guides
- [Astro Islands](https://docs.astro.build/concepts/islands/) - Understanding partial hydration
- [FileZen Documentation](https://filezen.dev) - File upload service documentation

## License

This example is part of the FileZen SDK examples and follows the same license terms. 