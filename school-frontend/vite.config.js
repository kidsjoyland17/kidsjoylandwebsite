import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "url";

// This file runs as an ES module ("type": "module" in package.json),
// where __dirname doesn't exist natively — it's a CommonJS global.
// Derive the equivalent from import.meta.url instead.
const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true,
        secure: false,
      },
    },
  },
  build: {
    // Split heavy vendor libs into their own cacheable chunk
    // so a small app-code change doesn't invalidate the whole vendor bundle.
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            if (
              id.includes("react-dom") ||
              id.includes("/react/") ||
              id.includes("react-router")
            ) {
              return "react-vendor";
            }
          }
        },
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});