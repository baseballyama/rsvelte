import * as $ from 'svelte/internal/server';
import { Canvas } from '@threlte/core';
import { Theatre } from '@threlte/theatre';
import Scene from './Scene.svelte';
import state from './state.json';

export default function App($$renderer) {
	$$renderer.push(`<div class="svelte-1gnzkad">`);

	Canvas($$renderer, {
		children: ($$renderer) => {
			Theatre($$renderer, {
				config: { state },
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