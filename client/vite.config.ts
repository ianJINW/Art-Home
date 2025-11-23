import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsconfigpaths from "vite-tsconfig-paths";
import path from "path";

// https://vite.dev/config/
export default defineConfig(() => ({
	plugins: [react(), tailwindcss(), tsconfigpaths()],
	resolve: {
		alias: {
			'@': path.resolve(__dirname, 'src'),
		},
	},
	server: {
		// Allow serving files from the workspace root even if Vite is started
		// from a parent directory or when paths contain spaces.
		fs: {
			allow: [path.resolve(__dirname)],
		},
	},
}));
