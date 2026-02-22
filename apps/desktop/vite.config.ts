import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  root: path.resolve(__dirname, "renderer"),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "renderer/src"),
    },
  },
  server: {
    port: 5173,
    open: true,
  },
  build: {
    outDir: path.resolve(__dirname, "dist"),
    emptyOutDir: true,
  },
});
