import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import viteCompression from 'vite-plugin-compression'

const timeStamp = new Date().getTime()

export default defineConfig({
  plugins: [
    vue(),
    viteCompression({
      threshold: 10000 // 对大于 10kb 的文件进行压缩 单位是b
    })
  ],
  base: '/three/',
  resolve: {
    alias: {
      '@': '/src'
    }
  },
  build: {
    chunkSizeWarningLimit: 1024000, // 对大于 1000mb
    rollupOptions: {
      output: {
        chunkFileNames: `assets/js/[name]-[hash].${timeStamp}.js`,
        entryFileNames: `assets/js/[name]-[hash].${timeStamp}.js`,
        assetFileNames: `assets/[ext]/[name]-[hash].${timeStamp}.[ext]`
      }
    }
  },
  server: {
    port: 3001,
    host: '0.0.0.0',
    hmr: true,
    proxy: {
      '/airSourceURL': {
        target: 'http://218.59.142.130:10010',
        changeOrigin: true,
        secure: false,
        rewrite: path => path.replace(/^\/airSourceURL/, '')
      },
      '/wryStateIP': {
        target: 'http://218.59.142.130:10010/wf-api',
        changeOrigin: true,
        secure: false,
        rewrite: path => path.replace(/^\/wryStateIP/, '')
      },
      '/getAirForcastData': {
        target: 'http://218.59.142.130:10010/paas',
        changeOrigin: true,
        secure: false,
        rewrite: path => path.replace(/^\/getAirForcastData/, '')
      },
      '/gettargetmanage': {
        // target: 'http://192.168.1.55:9010/',
        target: 'http://10.211.128.186:2222/gateway/water-service',
        changeOrigin: true,
        secure: false,
        rewrite: path => path.replace(/^\/gettargetmanage/, '')
      },
      '/drinkingWater': {
        target: 'http://192.168.1.19:9010',
        // target: 'http://10.211.128.186:2222/water/',
        changeOrigin: true,
        secure: false,
        rewrite: path => path.replace(/^\/drinkingWater/, '')
      }
    }
  }
})
