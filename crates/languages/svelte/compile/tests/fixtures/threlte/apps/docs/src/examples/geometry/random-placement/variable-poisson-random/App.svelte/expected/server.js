import * as $ from 'svelte/internal/server';
import { Canvas } from '@threlte/core';
import Scene from './Scene.svelte';
import { Pane, Button } from 'svelte-tweakpane-ui';
import { radius } from './stores';

export default function App($$renderer) {
	let regen = false;

	Pane($$renderer, {
		title: 'Adjusted Sampling',
		position: 'fixed',
		children: ($$renderer) => {
			Button($$renderer, { title: 'regenerate' });
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> <div class="svelte-1lqm4ql">`);

	Canvas($$renderer, {
		children: ($$renderer) => {
			Scene($$renderer, { regen });
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div>`);
}