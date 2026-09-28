import * as $ from 'svelte/internal/server';
import { Canvas } from '@threlte/core';
import Scene from './Scene.svelte';
import { WebGLRenderer } from 'three';

export default function App($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		$$renderer.push(`<div class="svelte-164bcz4">`);

		Canvas($$renderer, {
			createRenderer: (canvas) => {
				return new WebGLRenderer({ canvas, stencil: true });
			},

			children: ($$renderer) => {
				Scene($$renderer, {});
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></div>`);
	});
}