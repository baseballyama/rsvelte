import * as $ from 'svelte/internal/server';
import { Canvas } from '@threlte/core';
import { Suspense } from '@threlte/extras';
import { World } from '@threlte/rapier';
import Scene from './Scene.svelte';
import { Pane, Checkbox } from 'svelte-tweakpane-ui';

export default function App($$renderer) {
	let controls = false;
	let debug = false;
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		Pane($$renderer, {
			title: 'Decal',
			position: 'fixed',
			children: ($$renderer) => {
				Checkbox($$renderer, {
					label: 'Controls',
					get value() {
						return controls;
					},

					set value($$value) {
						controls = $$value;
						$$settled = false;
					}
				});

				$$renderer.push(`<!----> `);

				Checkbox($$renderer, {
					label: 'Debug',
					get value() {
						return debug;
					},

					set value($$value) {
						debug = $$value;
						$$settled = false;
					}
				});

				$$renderer.push(`<!---->`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <div class="svelte-i7hpsr">`);

		Canvas($$renderer, {
			children: ($$renderer) => {
				World($$renderer, {
					gravity: [0, 0, 0],
					children: ($$renderer) => {
						Suspense($$renderer, {
							children: ($$renderer) => {
								Scene($$renderer, { controls, debug });
							},
							$$slots: { default: true }
						});
					},
					$$slots: { default: true }
				});
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