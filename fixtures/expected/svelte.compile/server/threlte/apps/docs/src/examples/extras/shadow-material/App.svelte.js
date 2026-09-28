import * as $ from 'svelte/internal/server';
import { Canvas } from '@threlte/core';
import Scene from './Scene.svelte';
import { Color, Pane } from 'svelte-tweakpane-ui';

export default function App($$renderer) {
	let color = '#000000';
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		Canvas($$renderer, {
			children: ($$renderer) => {
				Scene($$renderer, { color });
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Pane($$renderer, {
			title: 'shadow material',
			position: 'fixed',
			children: ($$renderer) => {
				Color($$renderer, {
					label: 'shadow color',
					get value() {
						return color;
					},

					set value($$value) {
						color = $$value;
						$$settled = false;
					}
				});
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