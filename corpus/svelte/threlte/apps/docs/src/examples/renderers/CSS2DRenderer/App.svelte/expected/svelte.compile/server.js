import * as $ from 'svelte/internal/server';
import { Canvas } from '@threlte/core';
import Scene from './Scene.svelte';

export default function App($$renderer) {
	let element = void 0;

	$$renderer.push(`<div id="css-renderer-target" class="svelte-sscyvt"></div> <div id="main" class="svelte-sscyvt">`);

	Canvas($$renderer, {
		children: ($$renderer) => {
			if (element !== undefined) {
				$$renderer.push('<!--[0-->');
				Scene($$renderer, { element });
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]-->`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div>`);
}