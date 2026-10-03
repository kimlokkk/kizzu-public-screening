import path from "node:path"
import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"

export default defineConfig(({ mode }) => ({
  base: mode === "production"
    ? "/semak-perkembangan/"
    : "/",
  
  plugins: [
    react(),
    tailwindcss(),
  ],

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },

  server: {
    port: 5173,

    proxy: {
      "/api": {
        //target: "http://localhost/kizzu-public-screening",
        target: "http://127.0.0.1:8080",
        changeOrigin: true,
      },
    },
  },
}))