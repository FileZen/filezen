# FileZen JavaScript Recipes

This is a collection of JavaScript recipes demonstrating various FileZen capabilities with Next.js App Router for file uploads. The application showcases different FileZen implementation patterns through interactive examples and demonstrations.

## Recipes

- **Navigation System**: Easy navigation between different FileZen recipes
- **Custom Multipart Upload**: Manual multipart upload implementation with custom chunking control
- **URL Upload**: Direct file uploads from URLs (Coming Soon)
- **Bulk Upload**: Multiple file uploads with batch processing (Coming Soon)
- **Progress Tracking**: Real-time upload monitoring (Coming Soon)

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   yarn install
   ```
3. Create `.env` file in the root directory and add your FileZen API key:
   ```
   FILEZEN_API_KEY=your_api_key_here
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```

## Project Structure

- [`src/app/page.tsx`](./src/app/page.tsx) - Landing page with feature overview
- [`src/app/multipart-upload/page.tsx`](./src/app/multipart-upload/page.tsx) - Custom multipart upload example
- [`src/app/api/upload/route.ts`](./src/app/api/upload/route.ts) - API route for file uploads
- [`src/components/Navigation.tsx`](./src/components/Navigation.tsx) - Navigation component
- [`src/components/CustomMultipartUpload.tsx`](./src/components/CustomMultipartUpload.tsx) - File upload component
- [`src/app/layout.tsx`](./src/app/layout.tsx) - Root layout with navigation

## Learn More

- [FileZen Documentation](https://docs.filezen.dev)
- [Discord Community](https://discord.gg/temp-link)
- [Twitter](https://twitter.com/temp-link)
