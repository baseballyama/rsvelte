import * as $ from 'svelte/internal/server';
import { Canvas } from '@threlte/core';
import { Theatre } from '$lib/index.js';
import Scene from './scene.svelte';

export default function _page($$renderer) {
	$$renderer.push(`<main class="svelte-7o2h8q">`);

	Canvas($$renderer, {
		children: ($$renderer) => {
			Theatre($$renderer, {
				children: ($$renderer) => {
					Scene($$renderer, {});
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></main>`);
}