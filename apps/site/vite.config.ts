import adapter from '@sveltejs/adapter-cloudflare';
import { sveltekit } from '@sveltejs/kit/vite';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';
import { rsvelteSource } from './src/lib/build/source-plugin.ts';

export default defineConfig({
	plugins: [
		tailwindcss(),
		rsvelteSource(),
		sveltekit({
			adapter: adapter(),
			preprocess: vitePreprocess(),
			compilerOptions: { runes: true },
		}),
	],
	server: {
		fs: { allow: [fileURLToPath(new URL('../../crates', import.meta.url))] },
	},
	test: {
		include: ['src/**/*.test.ts'],
	},
});
