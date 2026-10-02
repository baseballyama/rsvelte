import * as $ from 'svelte/internal/server';
import { Canvas } from '@threlte/core';
import Scene from './Scene.svelte';
import { PerfMonitor } from '@threlte/extras';

export default function App($$renderer) {
	$$renderer.push(`<div class="svelte-139knn0">`);

	Canvas($$renderer, {
		children: ($$renderer) => {
			PerfMonitor($$renderer, {});
			$$renderer.push(`<!----> `);
			Scene($$renderer, {});
			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div>`);
}