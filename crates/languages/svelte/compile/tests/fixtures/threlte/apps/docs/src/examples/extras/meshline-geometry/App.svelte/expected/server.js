import * as $ from 'svelte/internal/server';
import { Canvas } from '@threlte/core';
import Scene from './Scene.svelte';
import { List, Pane, Slider, Color } from 'svelte-tweakpane-ui';

export default function App($$renderer) {
	const shapeOptions = { none: 'none', taper: 'taper' };
	let shape = 'taper';
	let color = '#fe3d00';
	let width = 1;
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		Pane($$renderer, {
			title: '',
			position: 'fixed',
			children: ($$renderer) => {
				List($$renderer, {
					options: shapeOptions,
					label: 'shape',
					get value() {
						return shape;
					},

					set value($$value) {
						shape = $$value;
						$$settled = false;
					}
				});

				$$renderer.push(`<!----> `);

				Color($$renderer, {
					label: 'color',
					get value() {
						return color;
					},

					set value($$value) {
						color = $$value;
						$$settled = false;
					}
				});

				$$renderer.push(`<!----> `);

				Slider($$renderer, {
					label: 'width',
					min: 0.1,
					max: 5,
					step: 0.1,
					get value() {
						return width;
					},

					set value($$value) {
						width = $$value;
						$$settled = false;
					}
				});

				$$renderer.push(`<!---->`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <div class="svelte-q6oaii">`);

		Canvas($$renderer, {
			children: ($$renderer) => {
				Scene($$renderer, { shape, color, width });
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