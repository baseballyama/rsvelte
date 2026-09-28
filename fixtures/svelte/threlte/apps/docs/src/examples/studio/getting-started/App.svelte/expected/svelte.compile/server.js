import * as $ from 'svelte/internal/server';
import { Canvas } from '@threlte/core';
import Scene from './Scene.svelte';
import { Studio } from '@threlte/studio';
import Tour from './Tour/Tour.svelte';

export default function App($$renderer) {
	$$renderer.push(`<div class="svelte-zbgrhz">`);

	Canvas($$renderer, {
		children: ($$renderer) => {
			Studio($$renderer, {
				transient: true,
				children: ($$renderer) => {
					Scene($$renderer, {});
					$$renderer.push(`<!----> `);
					Tour($$renderer, {});
					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> <div id="tour-target" class="svelte-zbgrhz"></div></div>`);
}