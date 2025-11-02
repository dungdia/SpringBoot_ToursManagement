import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import tailwindcss from "@tailwindcss/vite";
import { fileURLToPath, URL } from "node:url";

// https://vite.dev/config/
export default defineConfig({
   plugins: [react(), tailwindcss()],
   resolve: {
      alias: {
         "@": fileURLToPath(new URL("./src", import.meta.url)),
      },
   },
   server: {
      port: 5173,
      // Đây là phần quan trọng
      setupMiddlewares: (middlewares, server) => {
         server.middlewares.use((req, res, next) => {
            res.setHeader("Cross-Origin-Opener-Policy", "unsafe-none");
            res.setHeader("Cross-Origin-Embedder-Policy", "unsafe-none");
            next();
         });
         return middlewares;
      },
      hmr: { overlay: false },
   },
});
