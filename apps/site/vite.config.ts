import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';
import { rsvelteSource } from './src/lib/build/source-plugin.ts';

export default defineConfig({
	plugins: [tailwindcss(), rsvelteSource(), sveltekit()],
	server: {
		fs: { allow: [fileURLToPath(new URL('../../crates', import.meta.url))] }
	},
	test: {
		include: ['src/**/*.test.ts']
	}
});
