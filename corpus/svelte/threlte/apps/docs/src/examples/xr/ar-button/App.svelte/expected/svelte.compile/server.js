import * as $ from 'svelte/internal/server';
import { Canvas } from '@threlte/core';
import { ARButton } from '@threlte/xr';
import Scene from './Scene.svelte';

export default function App($$renderer) {
	$$renderer.push(`<div class="svelte-nzushx">`);

	Canvas($$renderer, {
		children: ($$renderer) => {
			Scene($$renderer, {});
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);
	ARButton($$renderer, {});
	$$renderer.push(`<!----></div>`);
}