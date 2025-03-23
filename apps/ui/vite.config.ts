import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@components": path.resolve(__dirname, "./src/components"),
    },
  },
  server: {
    proxy: {
      "/graphql": {
        target: "https://api.thegraph.com",
        changeOrigin: true,
        rewrite: (path) =>
          path.replace(/^\/graphql/, "/subgraphs/name/ethereum/ethereum"),
      },
    },
  },
});
