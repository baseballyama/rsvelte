import * as $ from 'svelte/internal/server';
import Scene from './Scene.svelte';
import { Button, Pane } from 'svelte-tweakpane-ui';
import { Canvas } from '@threlte/core';
import { World } from '@threlte/rapier';

export default function App($$renderer) {
	let resetCounter = 0;
	let showDebug = false;

	Pane($$renderer, {
		title: '',
		position: 'fixed',
		children: ($$renderer) => {
			Button($$renderer, { title: 'Reset' });
			$$renderer.push(`<!----> `);
			Button($$renderer, { title: 'Toggle Debug' });
			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> <div class="svelte-1izvkyu">`);

	Canvas($$renderer, {
		children: ($$renderer) => {
			World($$renderer, {
				children: ($$renderer) => {
					Scene($$renderer, { resetCounter, showDebug });
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div>`);
}