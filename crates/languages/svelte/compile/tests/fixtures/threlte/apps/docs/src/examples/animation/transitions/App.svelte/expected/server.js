import * as $ from 'svelte/internal/server';
import { Pane, Button } from 'svelte-tweakpane-ui';
import { Canvas } from '@threlte/core';
import Scene from './Scene.svelte';

export default function App($$renderer) {
	let action = 'idle';

	Pane($$renderer, {
		title: 'Transitions',
		position: 'fixed',
		children: ($$renderer) => {
			Button($$renderer, { title: 'Idle' });
			$$renderer.push(`<!----> `);
			Button($$renderer, { title: 'Walk' });
			$$renderer.push(`<!----> `);
			Button($$renderer, { title: 'Run' });
			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> <div class="svelte-vn43nl">`);

	Canvas($$renderer, {
		children: ($$renderer) => {
			Scene($$renderer, { action });
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div>`);
}