import path from 'node:path';
import type { NextConfig } from 'next';

// Source repos are independent git repositories nested inside the pnpm workspace, so
// Turbopack's automatic workspace-root detection stops at the repo boundary.
// Point it at the workspace root so it can resolve `next` and compile the
// shared component sources.
const workspaceRoot = path.resolve(import.meta.dirname, '../..');

/**
 * Served behind the marketing site at `/dashboard` in the one-host topology, so
 * all of this app's routes and assets live under that prefix. Every Next app
 * otherwise claims `/_next/*`, and two apps sharing one origin would collide.
 * Standalone (e.g. its own dev server) uses `basePath: ''`.
 */
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? '';

const nextConfig: NextConfig = {
  basePath,
  // Compile the shared workspace library from source (no separate build step).
  transpilePackages: ['@aws-rex/common-components'],
  turbopack: {
    root: workspaceRoot,
  },
};

export default nextConfig;
