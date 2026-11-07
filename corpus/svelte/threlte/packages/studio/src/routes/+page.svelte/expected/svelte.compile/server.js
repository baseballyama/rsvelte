import * as $ from 'svelte/internal/server';
import { Canvas } from '@threlte/core';
import Scene from './Scene.svelte';
import { Studio } from '$lib/index.js';
import { NoToneMapping } from 'three';

export default function _page($$renderer) {
	$$renderer.push(`<div class="svelte-3ztvqh">`);

	Canvas($$renderer, {
		toneMapping: NoToneMapping,
		children: ($$renderer) => {
			Studio($$renderer, {
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