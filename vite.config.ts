import path from "path"
import { defineConfig } from "vite"
import react from "@vitejs/plugin-react" // Or @vitejs/plugin-react-swc if you used SWC
import tailwindcss from "@tailwindcss/vite"

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})