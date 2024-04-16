import { URL, fileURLToPath } from 'url';

import vue from '@vitejs/plugin-vue2';
import vueJsx from '@vitejs/plugin-vue2-jsx';
import { VuetifyResolver } from 'unplugin-vue-components/resolvers';
import Components from 'unplugin-vue-components/vite';
import { defineConfig } from 'vite';
import { chunkSplitPlugin } from 'vite-plugin-chunk-split';
import VueSetupExtend from 'vite-plugin-vue-setup-extend';
import inheritAttrs from 'vite-plugin-vue-setup-inherit-attrs';

export default defineConfig({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
    extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json', '.vue'],
  },
  plugins: [
    vue({ include: [/\.vue$/, /\.md$/, /\.mdx$/] }),
    inheritAttrs() as any,
    Components({
      resolvers: [VuetifyResolver()],
      include: [/\.vue$/, /\.vue\?vue/, /\.md$/, /\.mdx$/],
      dts: false,
    }),
    vueJsx(),
    chunkSplitPlugin({
      strategy: 'default',
      customSplitting: {
        'vuetify-vendor': ['vuetify'],
        '@kubegems': ['@kubegems/api', '@kubegems/extension', '@kubegems/libs'],
        '@iconify-json/logos': ['@iconify-json/logos'],
        '@iconify-json/mdi': ['@iconify-json/mdi'],
      },
    }),
    VueSetupExtend(),
  ],
  envPrefix: 'VUE_APP_',
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: '@import "@/scss/variables.scss";',
      },
      sass: {
        additionalData: ['@import "@/scss/variables.scss"', ''].join('\n'),
      },
    },
  },
  build: {
    chunkSizeWarningLimit: 2048,
  },
  server: {
    host: '0.0.0.0',
    port: 3001,
    strictPort: true,
    proxy: {
      '^(/.*/pai-hub/).*': {
        target: 'http://local.kubegems.io:39999',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^(\/.*\/pai-hub\/)/, '/v1/'),
        ws: true,
      },
      '/api/v1/pai': {
        target: 'http://172.16.23.238:32460',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/v1\/pai/, '/v1'),
        ws: true,
      },
      '/api/v1': {
        target: 'http://local.kubegems.io:30939',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/v1/, '/v1'),
        ws: true,
      },
    },
  },
});
