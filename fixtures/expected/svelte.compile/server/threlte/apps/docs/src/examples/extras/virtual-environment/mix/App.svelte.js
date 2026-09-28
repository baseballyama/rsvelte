import * as $ from 'svelte/internal/server';
import { Canvas } from '@threlte/core';
import Scene from './Scene.svelte';
import { Checkbox, Pane } from 'svelte-tweakpane-ui';
import { Suspense } from '@threlte/extras';

export default function App($$renderer) {
	let debug = true;
	let mixEnvironment = true;
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

				$$renderer.push(`<!----> `);

				Checkbox($$renderer, {
					label: 'Mix Environment Map',
					get value() {
						return mixEnvironment;
					},

					set value($$value) {
						mixEnvironment = $$value;
						$$settled = false;
					}
				});

				$$renderer.push(`<!---->`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <div class="svelte-mnc17a">`);

		Canvas($$renderer, {
			children: ($$renderer) => {
				Scene($$renderer, { debug, mixEnvironment });
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