// @ts-check
import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import tailwindcss from "@tailwindcss/vite";

// outDir "out" is load-bearing: .github/workflows/deploy.yml deploys `out/`
// on push to main and must never be edited. Changing this breaks the deploy.
export default defineConfig({
  site: "https://chimerawerks.com",
  outDir: "out",
  integrations: [react()],
  vite: {
    plugins: [tailwindcss()],
  },
});
