import * as $ from 'svelte/internal/server';
import { Canvas } from '@threlte/core';
import Scene from './Scene.svelte';
import { Pane, Slider, Checkbox } from 'svelte-tweakpane-ui';

export default function App($$renderer) {
	let x = 0;
	let y = 0;
	let z = 0;
	let precise = false;
	let showSphere = true;
	let autoAlign = true;
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		Pane($$renderer, {
			title: 'Align',
			position: 'fixed',
			children: ($$renderer) => {
				Slider($$renderer, {
					label: 'X',
					min: -1,
					max: 1,
					get value() {
						return x;
					},

					set value($$value) {
						x = $$value;
						$$settled = false;
					}
				});

				$$renderer.push(`<!----> `);

				Slider($$renderer, {
					label: 'Y',
					min: -1,
					max: 1,
					get value() {
						return y;
					},

					set value($$value) {
						y = $$value;
						$$settled = false;
					}
				});

				$$renderer.push(`<!----> `);

				Slider($$renderer, {
					label: 'Z',
					min: -1,
					max: 1,
					get value() {
						return z;
					},

					set value($$value) {
						z = $$value;
						$$settled = false;
					}
				});

				$$renderer.push(`<!----> `);

				Checkbox($$renderer, {
					label: 'Precise',
					get value() {
						return precise;
					},

					set value($$value) {
						precise = $$value;
						$$settled = false;
					}
				});

				$$renderer.push(`<!----> `);

				Checkbox($$renderer, {
					label: 'Show Sphere',
					get value() {
						return showSphere;
					},

					set value($$value) {
						showSphere = $$value;
						$$settled = false;
					}
				});

				$$renderer.push(`<!----> `);

				Checkbox($$renderer, {
					label: 'Auto Align',
					get value() {
						return autoAlign;
					},

					set value($$value) {
						autoAlign = $$value;
						$$settled = false;
					}
				});

				$$renderer.push(`<!---->`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <div class="svelte-1rt90eb">`);

		Canvas($$renderer, {
			children: ($$renderer) => {
				Scene($$renderer, { x, y, z, precise, showSphere, autoAlign });
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