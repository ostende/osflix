import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { nodePolyfills } from 'vite-plugin-node-polyfills'

export default defineConfig({
  plugins: [
    react(),
    nodePolyfills({
      include: ['buffer', 'stream', 'events', 'process', 'path', 'util', 'crypto'],
      globals: {
        Buffer: true,
        global: true,
        process: true
      },
    })
  ],
  resolve: {
    alias: {
      'stream': 'stream-browserify',
      'buffer': 'buffer/',
      'events': 'events',
      'streamx': 'streamx'
    }
  },
  define: {
    'process.env': {},
    'process.version': '"v16.0.0"', // Added explicit process.version definition
    'global': 'globalThis',
  },
  optimizeDeps: {
    include: [
      'webtorrent',
      'bittorrent-tracker',
      'create-torrent',
      'stream-browserify',
      'buffer',
      'events',
      '@tanstack/react-query',
      'react-router-dom',
      'lucide-react',
      'zustand'
    ],
    exclude: ['eventemitter2'],
    esbuildOptions: {
      define: {
        global: 'globalThis'
      },
      platform: 'browser',
      target: 'es2020',
      format: 'esm'
    }
  },
  build: {
    target: 'es2020',
    commonjsOptions: {
      transformMixedEsModules: true,
      include: [
        /node_modules\/webtorrent/,
        /node_modules\/bittorrent-tracker/,
        /node_modules\/create-torrent/,
        /node_modules\/.*/, 
      ],
      defaultIsModuleExports: 'auto',
      requireReturnsDefault: 'auto'
    },
    rollupOptions: {
      output: {
        manualChunks: {
          webtorrent: ['webtorrent'],
          vendor: [
            '@tanstack/react-query',
            'react-router-dom',
            'lucide-react',
            'zustand'
          ]
        }
      }
    }
  }
})