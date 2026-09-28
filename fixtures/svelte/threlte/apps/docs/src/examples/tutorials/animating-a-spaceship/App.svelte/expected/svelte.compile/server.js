import * as $ from 'svelte/internal/server';
import { Canvas } from '@threlte/core';
import Scene from './Scene.svelte';

export default function App($$renderer) {
	$$renderer.push(`<div class="svelte-100473v">`);

	Canvas($$renderer, {
		autoRender: false,
		children: ($$renderer) => {
			Scene($$renderer, {});
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div>`);
}