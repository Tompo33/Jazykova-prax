
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: './',
  define: {
    'process.env': {
      API_KEY: 'import.meta.env.VITE_GEMINI_API_KEY'
    }
  }
});
