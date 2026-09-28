import * as $ from 'svelte/internal/server';
import { Canvas } from '@threlte/core';
import Scene from './Scene.svelte';
import { Studio } from '@threlte/studio';
import { NoToneMapping } from 'three';

export default function App($$renderer) {
	$$renderer.push(`<div class="svelte-1hyicu8">`);

	Canvas($$renderer, {
		toneMapping: NoToneMapping,
		children: ($$renderer) => {
			Studio($$renderer, {
				transient: true,
				children: ($$renderer) => {
					Scene($$renderer, {});
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div>`);
}