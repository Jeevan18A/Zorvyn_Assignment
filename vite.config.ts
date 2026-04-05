import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    port: 3000,
    open: true,
  },
  optimizeDeps: {
    include: ['date-fns', 'recharts', 'lucide-react', 'zustand'],
  },
  build: {
    // Enable code splitting
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Separate vendor chunks for better caching
          if (id.includes('react') || id.includes('react-dom')) {
            return 'vendor'
          }
          if (id.includes('recharts')) {
            return 'charts'
          }
          if (id.includes('date-fns') || id.includes('clsx') || id.includes('tailwind-merge')) {
            return 'utils'
          }
          if (id.includes('lucide-react')) {
            return 'icons'
          }
          if (id.includes('zustand')) {
            return 'state'
          }
        },
      },
    },
    // Optimize bundle size
    minify: 'terser',
    sourcemap: true,
    // Enable chunk size warnings
    chunkSizeWarningLimit: 1000,
  },
  // Enable experimental features for better performance
  experimental: {
    renderBuiltUrl: (filename, { hostType }) => {
      if (hostType === 'js') {
        return { js: `/${filename}` }
      } else {
        return { relative: true }
      }
    },
  },
})