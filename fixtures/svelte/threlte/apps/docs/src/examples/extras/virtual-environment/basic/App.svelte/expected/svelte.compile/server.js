import * as $ from 'svelte/internal/server';
import { Canvas } from '@threlte/core';
import Scene from './Scene.svelte';
import { Checkbox, Pane } from 'svelte-tweakpane-ui';

export default function App($$renderer) {
	let debug = true;
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		Pane($$renderer, {
			title: 'Virtual Environment',
			position: 'fixed',
			children: ($$renderer) => {
				Checkbox($$renderer, {
					label: 'debug',
					get value() {
						return debug;
					},

					set value($$value) {
						debug = $$value;
						$$settled = false;
					}
				});
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <div class="svelte-qkr43q">`);

		Canvas($$renderer, {
			children: ($$renderer) => {
				Scene($$renderer, { debug });
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