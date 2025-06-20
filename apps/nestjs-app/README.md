# FileZen NestJS Example

This is an example project demonstrating how to use FileZen with NestJS for file uploads.

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
   yarn run start:dev
   ```

## Running the app

```bash
# development
$ yarn run start

# watch mode
$ yarn run start:dev

# production mode
$ yarn run start:prod
```

## Testing the Upload

To test the file upload functionality, you can use the provided test script:

```bash
# Make sure the server is running first
yarn run start:dev

# In another terminal, run the test script
node scripts/test-server-upload.js
```

## Project Structure

- [`src/app.module.ts`](./src/app.module.ts) - Main application module with FileZen integration
- [`src/upload.controller.ts`](./src/upload.controller.ts) - File upload controller
- [`src/main.ts`](./src/main.ts) - Application entry point
- [`scripts/test-server-upload.js`](./scripts/test-server-upload.js) - Test script for server upload

## Learn More

- [FileZen Documentation](https://docs.filezen.dev)
- [NestJS Documentation](https://docs.nestjs.com)
- [Discord Community](https://discord.gg/temp-link)
- [Twitter](https://twitter.com/temp-link)
