import * as $ from 'svelte/internal/server';
import { Canvas } from '@threlte/core';
import { HTML } from '@threlte/extras';
import { Debug, World } from '@threlte/rapier';
import Scene from './Scene.svelte';
import { Pane, Button } from 'svelte-tweakpane-ui';

export default function App($$renderer) {
	let reset;
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		Pane($$renderer, {
			title: 'Collision Groups',
			position: 'fixed',
			children: ($$renderer) => {
				Button($$renderer, { title: 'Reset' });
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <div class="svelte-a07qv5">`);

		Canvas($$renderer, {
			children: ($$renderer) => {
				{
					function fallback($$renderer) {
						HTML($$renderer, {
							transform: true,
							children: ($$renderer) => {
								$$renderer.push(`<p class="svelte-a07qv5">It seems your browser<br/> doesn't support WASM.<br/> I'm sorry.</p>`);
							},
							$$slots: { default: true }
						});
					}

					World($$renderer, {
						fallback,
						children: ($$renderer) => {
							Debug($$renderer, {});
							$$renderer.push(`<!----> `);

							Scene($$renderer, {
								get reset() {
									return reset;
								},

								set reset($$value) {
									reset = $$value;
									$$settled = false;
								}
							});

							$$renderer.push(`<!---->`);
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