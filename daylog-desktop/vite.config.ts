import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  // 打包后的前端由 Tauri 自有协议加载，不能依赖开发服务器的根路径。
  base: "./",
  plugins: [react()],
  clearScreen: false,
  server: {
    port: 1420,
    strictPort: true
  },
  envPrefix: ["VITE_", "TAURI_"]
});
