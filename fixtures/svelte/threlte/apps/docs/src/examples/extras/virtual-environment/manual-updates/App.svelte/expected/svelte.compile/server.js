import * as $ from 'svelte/internal/server';
import { Canvas } from '@threlte/core';
import Scene from './Scene.svelte';

export default function App($$renderer) {
	$$renderer.push(`<div class="svelte-1jlt9l9">`);

	Canvas($$renderer, {
		children: ($$renderer) => {
			Scene($$renderer, {});
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div>`);
}