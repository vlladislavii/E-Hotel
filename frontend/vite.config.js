import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  base: process.env.NODE_ENV === 'production' ? '/E-Hotel/' : '/',
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        dashboard: resolve(__dirname, 'src/html/dashboard.html'),
        catalog: resolve(__dirname, 'src/html/hotel-catalog.html'),
        search: resolve(__dirname, 'src/html/search-availability.html'),
        management: resolve(__dirname, 'src/html/stay-management.html'),
        booking: resolve(__dirname, 'src/html/booking.html'),
      }
    }
  }
})