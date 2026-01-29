import { defineConfig } from 'vite';

// GitHub Pages (project pages) needs a base path of '/<repo>/'
const repo = 'solar-system-h5';

export default defineConfig({
  base: `/${repo}/`,
  server: {
    port: 5173,
    strictPort: true
  },
  build: {
    sourcemap: true
  }
});
