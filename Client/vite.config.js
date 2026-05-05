import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  define: {
    global: {},
  },
  plugins: [react()],
  esbuild: {
    logLevel: 'silent' // Suppresses warnings
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"), // Maps @ to ./src
    },
  },  
  optimizeDeps: {
    include: ["@shadcn/ui"], // Optimizes ShadCN components
  },
});
  