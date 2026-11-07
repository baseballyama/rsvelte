import * as $ from 'svelte/internal/server';
import { Canvas } from '@threlte/core';
import Scene from './Scene.svelte';

export default function _page($$renderer) {
	$$renderer.push(`<main class="svelte-vobrrm">`);

	Canvas($$renderer, {
		children: ($$renderer) => {
			Scene($$renderer, {});
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></main>`);
}