import { defineConfig } from 'tsdown';

export default defineConfig({
  deps: {
    alwaysBundle: ['@lunchbox-tools/utils'],
  },
  dts: false,
  entry: ['src/cli.ts'],
  minify: true,
});
