import * as $ from 'svelte/internal/server';
import { Canvas } from '@threlte/core';
import { VRButton } from '@threlte/xr';
import Scene from './Scene.svelte';

export default function App($$renderer) {
	$$renderer.push(`<div class="svelte-bp8ci7">`);

	Canvas($$renderer, {
		children: ($$renderer) => {
			Scene($$renderer, {});
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);
	VRButton($$renderer, {});
	$$renderer.push(`<!----></div>`);
}