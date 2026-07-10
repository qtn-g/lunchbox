import { defineConfig } from 'tsdown';

export default defineConfig({
  deps: {
    alwaysBundle: ['@lunchbox-tools/utils'],
  },
  entry: ['src/index.ts'],
  minify: true,
});
