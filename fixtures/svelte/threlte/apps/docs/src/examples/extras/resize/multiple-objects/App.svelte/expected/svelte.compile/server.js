import * as $ from 'svelte/internal/server';
import Scene from './Scene.svelte';
import { Canvas } from '@threlte/core';
import { Checkbox, Pane } from 'svelte-tweakpane-ui';

export default function App($$renderer) {
	let resize = true;
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		Pane($$renderer, {
			position: 'fixed',
			title: 'objects',
			children: ($$renderer) => {
				Checkbox($$renderer, {
					label: 'resize',
					get value() {
						return resize;
					},

					set value($$value) {
						resize = $$value;
						$$settled = false;
					}
				});
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <div class="svelte-15uvn8">`);

		Canvas($$renderer, {
			children: ($$renderer) => {
				Scene($$renderer, { resize });
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></div>`);
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}