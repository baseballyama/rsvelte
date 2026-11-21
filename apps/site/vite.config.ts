import adapter from '@sveltejs/adapter-static';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { highlight } from './scripts/highlight.ts';

export default defineConfig({
	plugins: [
		sveltekit({
			adapter: adapter(),
			compilerOptions: { runes: true },
			preprocess: [highlight()],
			// GitHub Pages serves the site below /rsvelte (PAGES=1); a local build serves it at the root.
			paths: { base: process.env.PAGES === '1' ? '/rsvelte' : '' },
		}),
	],
});
