import adapter from '@sveltejs/adapter-cloudflare';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import type { Config } from '@sveltejs/kit';

const config: Config = {
	preprocess: vitePreprocess(),
	compilerOptions: { runes: true },
	kit: {
		adapter: adapter(),
		alias: {
			// The kernel's source is read at build time, so every excerpt on the site is the code.
			$crates: '../../crates',
			// Built by scripts/generate.ts and ignored by Git.
			$generated: 'generated',
		},
	},
};

export default config;
