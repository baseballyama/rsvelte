import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit()],
	server: {
		port: 3000,
		fs: {
			allow: ['..']
		}
	},
	optimizeDeps: {
		exclude: ['svelte-compiler-rust']
	}
});
