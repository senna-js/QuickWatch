import { defineConfig } from 'vite';
import { createServer } from 'cors-anywhere';

const host = 'localhost';
const port = 8080;

export default defineConfig({
  server: {
    proxy: {
      '/cors': {
        target: `http://${host}:${port}`,
        rewrite: (path) => path.replace(/^\/cors/, ''),
        configure: () => {
          // CORS proxy
          const server = createServer({
            originWhitelist: [],
            requireHeader: ['origin', 'x-requested-with'],
            removeHeaders: ['cookie', 'cookie2']
          });
          server.listen(port, host, () => {
            console.log('CORS Anywhere proxy running on ' + host + ':' + port);
          });
        }
      }
    }
  }
});