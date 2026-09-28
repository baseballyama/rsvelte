import * as $ from 'svelte/internal/server';
import { Canvas } from '@threlte/core';
import { Project, Sheet } from '@threlte/theatre';
import Scene from './Scene.svelte';
import state from './state.json';

export default function App($$renderer) {
	$$renderer.push(`<div class="svelte-1cj9lw1">`);

	Canvas($$renderer, {
		children: ($$renderer) => {
			Project($$renderer, {
				config: { state },
				children: ($$renderer) => {
					Sheet($$renderer, {
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