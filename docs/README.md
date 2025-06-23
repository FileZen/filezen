# FileZen Documentation

This documentation site is built with [Nextra](https://nextra.site/) - a static site generator framework powered by Next.js.

## 🚀 Project Structure

```
.
├── public/           # Static assets like images, favicon
├── pages/           # Documentation pages (.mdx files)
│   ├── _app.tsx     # Custom App component
│   ├── _meta.ts     # Navigation configuration
│   ├── index.mdx    # Homepage
│   ├── introduction/
│   ├── guides/
│   ├── dynamic-image/
│   ├── mobile/
│   ├── frameworks/
│   └── backend-adapters/
├── next.config.js   # Next.js configuration with Nextra
├── theme.config.tsx # Nextra theme configuration
├── package.json
└── tsconfig.json
```

Nextra looks for `.md` or `.mdx` files in the `pages/` directory. Each file is exposed as a route based on its file name.

Navigation is configured using `_meta.ts` files in each directory.

Static assets like favicons can be placed in the `public/` directory.

## 🧞 Commands

All commands are run from the root of the project, from a terminal:

| Command                   | Action                                           |
| :------------------------ | :----------------------------------------------- |
| `pnpm install`            | Installs dependencies                            |
| `pnpm dev`                | Starts local dev server at `localhost:3000`     |
| `pnpm build`              | Build your production site to `./.next/`        |
| `pnpm start`              | Preview your build locally, before deploying    |

## 👀 Want to learn more?

Check out [Nextra's docs](https://nextra.site/), read [the Next.js documentation](https://nextjs.org/docs), or explore [Nextra examples](https://github.com/shuding/nextra).
