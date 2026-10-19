import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: "redirect-legacy-html",
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          if (req.url) {
            const urlPath = req.url.split("?")[0];
            const legacyMap = {
              "/dashboard.html": "/dashboard",
              "/input-pasien.html": "/input-pasien",
              "/monitoring-pasien.html": "/monitoring-pasien",
              "/ekspor-impor.html": "/ekspor-impor",
            };
            if (legacyMap[urlPath]) {
              const query = req.url.includes("?")
                ? req.url.slice(req.url.indexOf("?"))
                : "";
              res.writeHead(302, { Location: legacyMap[urlPath] + query });
              res.end();
              return;
            }
          }
          next();
        });
      },
    },
  ],
  server: {
    port: 3000,
    open: false,
    allowedHosts: "all",
  },
});
