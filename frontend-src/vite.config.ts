import { defineConfig } from "vite";

// Builds one self-contained ES module (Lit bundled in, no CDN) into the integration,
// so HACS installs it without a build step. Commit the output.
export default defineConfig({
  build: {
    lib: { entry: "src/al-sim-panel.ts", formats: ["es"], fileName: () => "al-sim-panel.js" },
    outDir: "../custom_components/adaptive_lighting/frontend",
    emptyOutDir: false,
    target: "es2021",
    minify: true,
    sourcemap: false,
  },
  test: { environment: "node", include: ["test/**/*.test.ts"] },
});
