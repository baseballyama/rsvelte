import * as $ from 'svelte/internal/server';
import { Canvas } from '@threlte/core';
import RenderIndicator from './RenderIndicator.svelte';
import Scene from './Scene.svelte';

export default function App($$renderer) {
	$$renderer.push(`<div class="wrapper svelte-ujr49h">`);

	Canvas($$renderer, {
		children: ($$renderer) => {
			Scene($$renderer, {});
			$$renderer.push(`<!----> `);
			RenderIndicator($$renderer, {});
			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> <div class="description svelte-ujr49h"><p><strong>Click and drag</strong> to rotate the camera.</p> <p><strong>Hover</strong> over the sphere to scale it up.</p></div></div>`);
}