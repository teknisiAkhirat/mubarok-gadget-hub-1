import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    {
      name: "mgh-global-styles",
      transformIndexHtml() {
        return [
          { tag: "link", attrs: { rel: "stylesheet", href: "/src/index.css" }, injectTo: "head" },
          { tag: "link", attrs: { rel: "stylesheet", href: "/src/premium.css" }, injectTo: "head" }
        ];
      }
    }
  ],
  resolve: {
    alias: { "@": "/src" }
  },
  build: {
    outDir: "dist"
  }
});
