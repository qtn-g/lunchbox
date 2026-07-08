import { defineConfig } from 'tsdown';

export default defineConfig({
  deps: {
    alwaysBundle: ['@lunchbox/utils'],
  },
  entry: ['src/index.ts'],
  minify: true,
});
