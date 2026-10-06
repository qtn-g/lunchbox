import { defineConfig } from 'tsdown';

export default defineConfig({
  deps: {
    alwaysBundle: ['@lunchbox-tools/utils'],
  },
  // Eager emit is required to inline types imported from @lunchbox-tools/utils (e.g. TicketProvider).
  dts: { eager: true },
  entry: ['src/index.ts'],
  minify: true,
});
