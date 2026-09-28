import * as $ from 'svelte/internal/server';
import { Pane, Checkbox, Button } from 'svelte-tweakpane-ui';
import { Canvas } from '@threlte/core';
import { HTML } from '@threlte/extras';
import { Debug, World } from '@threlte/rapier';
import Scene from './Scene.svelte';

export default function App($$renderer) {
	let version = 0;
	let debug = true;
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		Pane($$renderer, {
			title: 'Auto Colliders',
			position: 'fixed',
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
				Button($$renderer, { title: 'reset' });
				$$renderer.push(`<!---->`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <div class="svelte-38302h">`);

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
							if (debug) {
								$$renderer.push('<!--[0-->');
								Debug($$renderer, {});
							} else {
								$$renderer.push('<!--[-1-->');
							}

							$$renderer.push(`<!--]--> <!---->`);

							{
								Scene($$renderer, {});
							}

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