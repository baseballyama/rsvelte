import * as $ from 'svelte/internal/server';
import { Canvas } from '@threlte/core';
import { Theatre } from '@threlte/theatre';
import Scene from './Scene.svelte';

export default function App($$renderer) {
	$$renderer.push(`<div class="svelte-ot2p6r">`);

	Canvas($$renderer, {
		children: ($$renderer) => {
			Theatre($$renderer, {
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