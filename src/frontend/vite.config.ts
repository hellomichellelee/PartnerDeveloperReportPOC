import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:7071",
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: "dist",
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          "fluent-ui": [
            "@fluentui/react-components",
            "@fluentui/react-datepicker-compat",
          ],
          "fluent-icons": ["@fluentui/react-icons"],
          react: ["react", "react-dom"],
        },
      },
    },
  },
});
