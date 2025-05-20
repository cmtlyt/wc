import { svelte } from '@sveltejs/vite-plugin-svelte';
import { transform } from 'esbuild';
import { defineConfig } from 'vite';
// https://vite.dev/config/
export default defineConfig({
  root: './src/',
  build: {
    outDir: '../dist',
    lib: {
      entry: './index.ts',
      fileName: 'index',
      formats: ['es'],
    },
    emptyOutDir: true,
    rollupOptions: {
      output: {
        inlineDynamicImports: false,
        manualChunks: {
          svelte: ['svelte'],
        },
        chunkFileNames(chunkInfo) {
          return `${chunkInfo.name.replace(/\.wc$/, '')}.js`;
        },
      },
    },
  },
  plugins: [
    svelte(),
    minifyEs(),
  ],
});
function minifyEs() {
  return {
    name: 'minify-es',
    renderChunk: {
      order: 'post',
      async handler(code, chunk, outputOptions) {
        if (outputOptions.format === 'es' && chunk.fileName.endsWith('.js')) {
          return await transform(code, { minify: true });
        }
        return code;
      },
    },
  };
}
