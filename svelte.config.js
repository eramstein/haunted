import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import path from 'path';

export default {
  // Consult https://svelte.dev/docs#compile-time-svelte-preprocess
  // for more information about preprocessors
  preprocess: vitePreprocess(),
  compilerOptions: {
    // disable all warnings coming from node_modules and all accessibility warnings
    warningFilter: (warning) =>
      !warning.filename?.includes('node_modules') && !warning.code.startsWith('a11y'),
  },
  kit: {
    alias: {
      '@': path.resolve('./src'),
      '@lib': path.resolve('./src/lib'),
      '@data': path.resolve('./src/data'),
    },
  },
};
