import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
  test: {
    include: ['src/__e2e__/**/*.test.ts'],
    environment: 'node',
    hookTimeout: 30000,
    testTimeout: 60000,
    reporters: ['default'],
    pool: 'threads',
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
});
