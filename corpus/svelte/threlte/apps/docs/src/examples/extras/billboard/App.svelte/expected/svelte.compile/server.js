import * as $ from 'svelte/internal/server';
import Scene from './Scene.svelte';
import { Canvas } from '@threlte/core';
import { Pane, Checkbox } from 'svelte-tweakpane-ui';

export default function App($$renderer) {
	let follow = true;
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		Pane($$renderer, {
			title: 'Billboard',
			position: 'fixed',
			children: ($$renderer) => {
				Checkbox($$renderer, {
					label: 'follow',
					get value() {
						return follow;
					},

					set value($$value) {
						follow = $$value;
						$$settled = false;
					}
				});
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Canvas($$renderer, {
			children: ($$renderer) => {
				Scene($$renderer, { follow });
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!---->`);
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}