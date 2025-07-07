import { resolve } from 'path'
import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()]
  },
  preload: {
    plugins: [externalizeDepsPlugin()]
  },
  renderer: {
    resolve: {
      alias: {
        '@renderer': resolve('src/renderer/src')
      }
    },
    plugins: [vue()],
    build: {
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: true,  // 移除console
          drop_debugger: true  // 移除debugger
        }
      },
      sourcemap: false, // 生产环境不生成map
      assetsInlineLimit: 4096, // 4kb以下资源内联
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              // 将第三方库分包，优化缓存
              return 'vendor'
            }
          }
        }
      }
    },
    optimizeDeps: {
      exclude: ['electron', 'fs', 'path'] // 这些依赖不预打包进renderer
    }
  }
})
