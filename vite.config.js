import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [vue()],
  server: {
    port: 5173
  },
  resolve: {
    alias: {
        'vue': 'vue/dist/vue.esm-bundler.js',
        '@': '/src'
    }
  },
  optimizeDeps: {
    include: ['vue', 'bootstrap/dist/js/bootstrap.bundle.min.js']
  }
});