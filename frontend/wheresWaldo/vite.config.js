import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  preview: {
    allowedHosts: ["fortunate-reprieve-production-2b89.up.railway.app"],
  },
  server: {
    allowedHosts: ["fortunate-reprieve-production-2b89.up.railway.app"],
  },
});
