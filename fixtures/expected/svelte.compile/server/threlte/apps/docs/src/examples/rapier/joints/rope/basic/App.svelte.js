import * as $ from 'svelte/internal/server';
import { Canvas } from '@threlte/core';
import Scene from './Scene.svelte';
import { World } from '@threlte/rapier';
import { Checkbox, Pane, Slider } from 'svelte-tweakpane-ui';
import { NoToneMapping } from 'three';

export default function App($$renderer) {
	let debug = false;
	let damping = 0.8;
	let segments = 20;
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		Pane($$renderer, {
			position: 'fixed',
			title: 'Rope',
			children: ($$renderer) => {
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

				$$renderer.push(`<!----> `);

				Slider($$renderer, {
					label: 'Damping',
					min: 0,
					max: 1,
					step: 0.01,
					get value() {
						return damping;
					},

					set value($$value) {
						damping = $$value;
						$$settled = false;
					}
				});

				$$renderer.push(`<!----> `);

				Slider($$renderer, {
					label: 'Segments',
					min: 2,
					max: 20,
					step: 1,
					get value() {
						return segments;
					},

					set value($$value) {
						segments = $$value;
						$$settled = false;
					}
				});

				$$renderer.push(`<!---->`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <div class="svelte-zcw1rf">`);

		Canvas($$renderer, {
			toneMapping: NoToneMapping,
			children: ($$renderer) => {
				World($$renderer, {
					children: ($$renderer) => {
						Scene($$renderer, { debug, damping, segments });
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