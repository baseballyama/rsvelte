import * as $ from 'svelte/internal/server';
import Scene from './Scene.svelte';
import { Canvas } from '@threlte/core';
import { Checkbox, Pane } from 'svelte-tweakpane-ui';

export default function App($$renderer) {
	let autoRender = true;
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		Pane($$renderer, {
			position: 'fixed',
			children: ($$renderer) => {
				Checkbox($$renderer, {
					label: 'auto render',
					get value() {
						return autoRender;
					},

					set value($$value) {
						autoRender = $$value;
						$$settled = false;
					}
				});
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <div class="svelte-eg0rw4">`);

		Canvas($$renderer, {
			children: ($$renderer) => {
				Scene($$renderer, { autoRender });
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