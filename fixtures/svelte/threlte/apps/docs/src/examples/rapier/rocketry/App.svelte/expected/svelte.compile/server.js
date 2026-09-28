import * as $ from 'svelte/internal/server';
import { Canvas } from '@threlte/core';
import { Debug, World } from '@threlte/rapier';
import Scene from './Scene.svelte';
import BatchedRenderer from './quarks/BatchedRenderer.svelte';

export default function App($$renderer) {
	$$renderer.push(`<main class="svelte-p6jdu7">`);

	Canvas($$renderer, {
		children: ($$renderer) => {
			World($$renderer, {
				gravity: [0, -1, 0],
				framerate: 120,
				children: ($$renderer) => {
					Debug($$renderer, {});
					$$renderer.push(`<!----> `);
					BatchedRenderer($$renderer, {});
					$$renderer.push(`<!----> `);
					Scene($$renderer, {});
					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></main>`);
}