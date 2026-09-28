import * as $ from 'svelte/internal/server';
import { Canvas } from '@threlte/core';
import { HTML } from '@threlte/extras';
import { World } from '@threlte/rapier';
import { Button, Checkbox, Pane } from 'svelte-tweakpane-ui';
import Scene from './Scene.svelte';

export default function App($$renderer) {
	let debug = false;
	let resetKey = 0;
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		Pane($$renderer, {
			position: 'fixed',
			title: 'Fixed Joint',
			children: ($$renderer) => {
				Button($$renderer, { title: 'Throw hammers' });
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

		$$renderer.push(`<!----> <div class="svelte-zu2mxn">`);

		Canvas($$renderer, {
			children: ($$renderer) => {
				{
					function fallback($$renderer) {
						HTML($$renderer, {
							transform: true,
							children: ($$renderer) => {
								$$renderer.push(`<p class="text-xs">It seems your browser<br/> doesn't support WASM.<br/> I'm sorry.</p>`);
							},
							$$slots: { default: true }
						});
					}

					World($$renderer, {
						fallback,
						children: ($$renderer) => {
							Scene($$renderer, { debug, resetKey });
						},
						$$slots: { fallback: true, default: true }
					});
				}
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