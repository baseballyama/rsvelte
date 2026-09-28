import * as $ from 'svelte/internal/server';
import { Checkbox, Pane } from 'svelte-tweakpane-ui';
import Scene from './Scene.svelte';
import { Canvas } from '@threlte/core';
import { NoToneMapping } from 'three';

export default function App($$renderer) {
	let showCylinder = true;
	let auto = true;
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		Pane($$renderer, {
			title: 'Resize',
			position: 'fixed',
			children: ($$renderer) => {
				Checkbox($$renderer, {
					label: 'Show Cylinder',
					get value() {
						return showCylinder;
					},

					set value($$value) {
						showCylinder = $$value;
						$$settled = false;
					}
				});

				$$renderer.push(`<!----> `);

				Checkbox($$renderer, {
					label: 'Auto',
					get value() {
						return auto;
					},

					set value($$value) {
						auto = $$value;
						$$settled = false;
					}
				});

				$$renderer.push(`<!---->`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <div class="svelte-1cssqp6">`);

		Canvas($$renderer, {
			toneMapping: NoToneMapping,
			children: ($$renderer) => {
				Scene($$renderer, { showCylinder, auto });
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