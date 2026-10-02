import * as $ from 'svelte/internal/server';
import { Canvas } from '../lib/index.js';
import Scene from './scene.svelte';

export default function _page($$renderer) {
	$$renderer.push(`<main class="svelte-1b8f432">`);

	Canvas($$renderer, {
		renderMode: 'always',
		children: ($$renderer) => {
			Scene($$renderer, {});
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></main>`);
}