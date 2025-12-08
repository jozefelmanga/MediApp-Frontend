import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: Number(process.env.PORT) || 8080,
    proxy: {
      // Proxy /api to the backend gateway during development to avoid CORS
      // Uses VITE_GATEWAY_URL if provided, otherwise falls back to http://localhost:8550
      "/api": {
        target: process.env.VITE_GATEWAY_URL || "http://localhost:8550",
        changeOrigin: true,
        secure: false,
        // keep the /api path
      },
    },
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(
    Boolean
  ),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
