import type { Plugin } from 'vite';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { transform } from 'esbuild';
import { build } from 'vite';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function minifyEs(): Plugin {
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

const config = {
  root: path.resolve(__dirname, '..', 'src'),
  outDir: path.resolve(__dirname, '..', 'dist'),
};

async function buildEs() {
  return build({
    root: config.root,
    build: {
      outDir: config.outDir,
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
    resolve: {
      dedupe: ['svelte'],
    },
    plugins: [
      svelte(),
      minifyEs(),
    ],
  });
}

async function buildUmd() {
  return build({
    root: config.root,
    build: {
      outDir: config.outDir,
      lib: {
        entry: './index.ts',
        fileName: 'index',
        name: 'ClWC',
        formats: ['umd'],
      },
      emptyOutDir: false,
    },
    resolve: {
      dedupe: ['svelte'],
    },
    plugins: [
      svelte(),
    ],
  });
}

async function createSymLink(pathName: string) {
  const target = path.resolve(__dirname, '..', 'example', ...pathName.split('/'));
  if (fs.existsSync(target)) {
    return;
  }
  return fs.promises.symlink(
    path.resolve(__dirname, '..', 'dist'),
    target,
    'dir',
  );
}

(async function () {
  console.log('[ESM] Building...');
  console.time('[ESM] Built.');
  await buildEs();
  console.timeEnd('[ESM] Built.');
  console.log();
  console.log('[UMD] Building...');
  console.time('[UMD] Built.');
  await buildUmd();
  console.timeEnd('[UMD] Built.');
  await createSymLink('public/dist');
})();
