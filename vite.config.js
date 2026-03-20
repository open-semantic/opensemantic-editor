import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { resolve } from 'path'
import { createRequire } from 'module'

const require = createRequire(import.meta.url)
const pkg = require('./package.json')
const monacoVersion = pkg.dependencies['@monaco-editor/react'].replace(/[^\d.]/g, '')

export default defineConfig(({ mode }) => ({
  plugins: [
    tailwindcss(),
    react(),
  ],
  base: './',
  define: {
    'global': 'globalThis',
    'process.env.NODE_ENV': JSON.stringify('production'),
  },
  resolve: {
    alias: {
      'path': 'path-browserify'
    }
  },
  worker: {
    format: 'es',
    rollupOptions: {
      output: {
        entryFileNames: `assets/[name]-${monacoVersion}.js`
      }
    }
  },
  build: {
    outDir: 'dist',
    copyPublicDir: true,
    sourcemap: mode === 'debug' ? true : false,
    minify: mode === 'debug' ? false : 'esbuild',
    ...(mode !== 'app' ? {
      lib: {
        entry: resolve(import.meta.dirname, 'src/embed.jsx'),
        name: 'OpenSemanticEditor',
        formats: ['es'],
        fileName: () => `opensemantic-editor.es.js`
      },
    } : {}),
    rollupOptions: {
      output: {
        exports: 'named',
        assetFileNames: (assetInfo) => {
          if (assetInfo.name === 'style.css') return 'opensemantic-editor.css';
          return assetInfo.name;
        },
        manualChunks: {
          monaco: ['monaco-editor', '@monaco-editor/react', 'monaco-yaml']
        },
        chunkFileNames: (chunkInfo) => {
          if (chunkInfo.name === 'monaco') {
            return `monaco-${monacoVersion}.js`;
          }
          if (chunkInfo.name.includes('worker')) {
            return `assets/[name]-${monacoVersion}.js`;
          }
          return '[name]-[hash].js';
        }
      }
    },
    chunkSizeWarningLimit: 5000,
    cssCodeSplit: false,
  },
  optimizeDeps: {
    include: [
      'monaco-editor',
      'monaco-yaml'
    ]
  }
}))
