import * as $ from 'svelte/internal/server';
import { Canvas } from '@threlte/core';
import { Sequence, Theatre } from '@threlte/theatre';
import Scene from './Scene.svelte';
import state from './state.json';

export default function App($$renderer) {
	$$renderer.push(`<div class="svelte-1mwxa0b">`);

	Canvas($$renderer, {
		children: ($$renderer) => {
			Theatre($$renderer, {
				config: { state },
				children: ($$renderer) => {
					Sequence($$renderer, {
						autoplay: true,
						iterationCount: Infinity,
						children: ($$renderer) => {
							Scene($$renderer, {});
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div>`);
}