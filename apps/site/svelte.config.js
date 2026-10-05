import adapter from '@sveltejs/adapter-cloudflare';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: vitePreprocess(),
	compilerOptions: { runes: true },
	kit: {
		adapter: adapter(),
		// English paths are not route paths, so the crawler would not find the prerendered English pages by itself.
		prerender: { entries: ['*', '/en', '/en/why'] },
		alias: {
			// The kernel's source is read at build time, so every excerpt on the site is the code.
			$crates: '../../crates'
		}
	}
};

export default config;
