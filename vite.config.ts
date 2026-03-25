import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
    base: '/reading-log-app/',
    plugins: [react(), tailwindcss()],
    test: {
          globals: true,
          environment: 'jsdom',
    },
})
