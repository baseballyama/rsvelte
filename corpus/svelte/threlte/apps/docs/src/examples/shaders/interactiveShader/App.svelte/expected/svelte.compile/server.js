import * as $ from 'svelte/internal/server';
import { Canvas } from '@threlte/core';
import Scene from './Scene.svelte';

export default function App($$renderer) {
	$$renderer.push(`<div class="svelte-1uojcvo">`);

	Canvas($$renderer, {
		children: ($$renderer) => {
			Scene($$renderer, {});
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> <span class="absolute top-4 left-4 z-20 whitespace-nowrap text-white">Click on the terrain</span></div>`);
}