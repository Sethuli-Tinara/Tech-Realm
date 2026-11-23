import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// During "npm run dev", forward /api requests to the API on port 4000.
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: { '/api': 'http://localhost:4000' },
  },
});
