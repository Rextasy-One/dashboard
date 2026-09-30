# @aws-rex/dashboard

The Aws Rex dashboard — a Next.js (App Router) + Tailwind CSS application that consumes the shared
component library.

- **Repo:** `Rextasy-One/dashboard`
- **Stack:** Next.js 16 (App Router, Turbopack), React 19, Tailwind CSS 4, TypeScript 5
- **Depends on:** `@aws-rex/common-components` (`workspace:*`)

## Develop

From the workspace root, or from this directory:

```bash
pnpm --filter @aws-rex/dashboard dev     # root
pnpm dev                                  # or here → http://localhost:3000
```

## Scripts

```bash
pnpm dev
pnpm build
pnpm start
pnpm lint
pnpm typecheck
pnpm format
```

## How it consumes the shared library

1. `package.json` → `"@aws-rex/common-components": "workspace:*"`.
2. `next.config.ts` → `transpilePackages: ['@aws-rex/common-components']` compiles the library from
   TypeScript source (no separate build step).
3. `next.config.ts` → `turbopack.root` points at the workspace root. Because each pod is its own git
   repository, Turbopack's automatic root detection stops at the pod boundary; this keeps `next` and
   the shared source resolvable.
4. `src/app/globals.css` → `@source '../../../common-components/src'` so Tailwind generates the
   utility classes used inside the library.

## Layout

```
src/
├── app/
│   ├── globals.css   # Tailwind entry + @source for the shared library
│   ├── layout.tsx    # renders <Header /> and <Footer />
│   └── page.tsx      # Hello World
└── ...
```

## Tooling

ESLint, Prettier, and TypeScript config come from
[`@aws-rex/config`](https://github.com/Rextasy-One/config) as a versioned dependency (`^1.0.0`):

```js
// eslint.config.mjs
import { nextConfig } from '@aws-rex/config/eslint/next';
export default nextConfig();
```

## Roadmap

Apollo GraphQL wiring is next — see the workspace [`docs/ROADMAP.md`](../../docs/ROADMAP.md).
