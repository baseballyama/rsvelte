import * as $ from 'svelte/internal/server';
import { Canvas, extend } from '@threlte/core';
import Scene from './Scene.svelte';
import * as THREE from 'three/webgpu';

export default function App($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		extend(THREE);
		$$renderer.push(`<div class="svelte-59pgiv">`);

		Canvas($$renderer, {
			createRenderer: (canvas) => {
				return new THREE.WebGPURenderer({ canvas, antialias: true, forceWebGL: false });
			},

			children: ($$renderer) => {
				Scene($$renderer, {});
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></div>`);
	});
}