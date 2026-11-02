import { configDefaults, defineConfig } from 'vitest/config';

const excludePatterns: Array<string> = [
  ...configDefaults.exclude,
  'tsdown.config.ts',
  '**/*.config.ts',
  'src/cli.ts',
  'src/types/**',
];

export default defineConfig({
  test: {
    coverage: {
      exclude: excludePatterns,
      provider: 'v8',
    },
    exclude: excludePatterns,
    include: ['src/tests/**/*.test.ts'],
  },
});
