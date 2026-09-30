import path from 'node:path';
import type { NextConfig } from 'next';

// Pods are independent git repositories nested inside the pnpm workspace, so
// Turbopack's automatic workspace-root detection stops at the pod boundary.
// Point it at the workspace root so it can resolve `next` and compile the
// shared component sources.
const workspaceRoot = path.resolve(import.meta.dirname, '../..');

const nextConfig: NextConfig = {
  // Compile the shared workspace library from source (no separate build step).
  transpilePackages: ['@aws-rex/common-components'],
  turbopack: {
    root: workspaceRoot,
  },
};

export default nextConfig;
