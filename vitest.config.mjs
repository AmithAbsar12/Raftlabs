import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

export default defineConfig({
  resolve: { alias: { "@": fileURLToPath(new URL("./", import.meta.url)), "server-only": fileURLToPath(new URL("./tests/server-only.js", import.meta.url)) } },
  esbuild: { loader: "jsx", jsx: "automatic", include: /.*\.[jt]sx?$/ },
  optimizeDeps: { esbuildOptions: { loader: { ".js": "jsx" } } },
  test: {
    environment: "jsdom",
    setupFiles: ["./tests/setup.js"],
    clearMocks: true,
  },
});
