import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  server: {allowedHosts: ['api.varunaditya.xyz']},
  plugins: [tailwindcss(),]
});