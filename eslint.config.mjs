import defineConfig from '@antfu/eslint-config';

export default defineConfig({
  svelte: true,
  formatters: true,
  stylistic: {
    indent: 2,
    quotes: 'single',
    semi: true,
  },
});
