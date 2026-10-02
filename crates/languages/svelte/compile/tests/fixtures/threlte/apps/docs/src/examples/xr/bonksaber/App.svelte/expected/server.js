import * as $ from 'svelte/internal/server';
import { Canvas } from '@threlte/core';
import { World } from '@threlte/rapier';
import { VRButton } from '@threlte/xr';
import Scene from './Scene.svelte';

export default function App($$renderer) {
	$$renderer.push(`<div class="svelte-ojo0kc">`);

	Canvas($$renderer, {
		children: ($$renderer) => {
			World($$renderer, {
				gravity: [0, 0, 0],
				children: ($$renderer) => {
					Scene($$renderer, {});
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);
	VRButton($$renderer, {});
	$$renderer.push(`<!----></div>`);
}