import { defineConfig } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [
    // The React and Tailwind plugins are both required for Make, even if
    // Tailwind is not being actively used – do not remove them
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      // Alias @ to the src directory
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    // Optimize chunk size and splitting
    chunkSizeWarningLimit: 1000, // Increase limit to 1000 KB for warnings
    rollupOptions: {
      output: {
        manualChunks: {
          // Split vendor code into separate chunks
          'react-vendor': ['react', 'react-dom', 'react-router'],
          'supabase-vendor': ['@supabase/supabase-js'],
          'ui-vendor': ['date-fns', 'recharts', 'lucide-react'],
        },
      },
    },
  },
})