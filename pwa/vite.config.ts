import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// `base` defaults to '/' for local dev/preview. The GitHub Pages deploy passes
// `--base=/CartWise/` on the CLI so assets/routes resolve under the subpath.
export default defineConfig({
  plugins: [react()],
});
