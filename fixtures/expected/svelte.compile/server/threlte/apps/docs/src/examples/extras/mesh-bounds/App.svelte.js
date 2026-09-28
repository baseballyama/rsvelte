import * as $ from 'svelte/internal/server';
import Scene from './Scene.svelte';
import { Canvas } from '@threlte/core';
import { Checkbox, Pane } from 'svelte-tweakpane-ui';

export default function App($$renderer) {
	let showBounds = false;
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		Pane($$renderer, {
			title: 'meshBounds',
			position: 'fixed',
			children: ($$renderer) => {
				Checkbox($$renderer, {
					label: 'show bounds',
					get value() {
						return showBounds;
					},

					set value($$value) {
						showBounds = $$value;
						$$settled = false;
					}
				});
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <div class="svelte-hpv6gj">`);

		Canvas($$renderer, {
			children: ($$renderer) => {
				Scene($$renderer, { showBounds });
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