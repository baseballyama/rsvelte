import * as $ from 'svelte/internal/server';
import { Canvas, T } from '@threlte/core';
import Scene from './Scene.svelte';

export default function App($$renderer) {
	$$renderer.push(`<div class="svelte-126ywpt">`);

	Canvas($$renderer, {
		children: ($$renderer) => {
			Scene($$renderer, {});
			$$renderer.push(`<!----> `);

			if (T.DirectionalLight) {
				$$renderer.push('<!--[-->');
				T.DirectionalLight($$renderer, { intensity: 2, castShadow: true, position: [1, 1, 1] });
				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div>`);
}