import adapter from '@sveltejs/adapter-cloudflare';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: vitePreprocess(),
	compilerOptions: { runes: true },
	kit: {
		adapter: adapter(),
		alias: {
			// The kernel's source is read at build time, so every excerpt on the site is the code.
			$crates: '../../crates'
		}
	}
};

export default config;
