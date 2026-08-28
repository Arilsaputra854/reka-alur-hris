import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: { port: 5173, host: "0.0.0.0" },
  preview: { port: 4173, host: "0.0.0.0" },
  build: {
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks: {
          react: ["react", "react-dom", "react-router-dom"],
          firebase: ["firebase/app", "firebase/auth", "firebase/firestore"],
          icons: ["lucide-react"],
        },
      },
    },
  },
  test: { environment: "jsdom", globals: true, exclude: ["tests/**", "node_modules/**"] },
});
