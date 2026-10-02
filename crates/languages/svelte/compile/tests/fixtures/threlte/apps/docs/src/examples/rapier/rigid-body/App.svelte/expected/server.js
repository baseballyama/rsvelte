import * as $ from 'svelte/internal/server';
import { Canvas } from '@threlte/core';
import { HTML } from '@threlte/extras';
import { World } from '@threlte/rapier';
import { muted } from './Particle.svelte';
import Scene from './Scene.svelte';
import { Pane, Button } from 'svelte-tweakpane-ui';

export default function App($$renderer) {
	var $$store_subs;

	Pane($$renderer, {
		title: 'Rigid Body',
		position: 'fixed',
		children: ($$renderer) => {
			Button($$renderer, { title: 'toggle sound' });
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> <div class="svelte-1bcopus">`);

	Canvas($$renderer, {
		children: ($$renderer) => {
			{
				function fallback($$renderer) {
					HTML($$renderer, {
						transform: true,
						children: ($$renderer) => {
							$$renderer.push(`<p class="svelte-1bcopus">It seems your browser doesn't support WASM.<br/> I'm sorry.</p>`);
						},
						$$slots: { default: true }
					});
				}

				World($$renderer, {
					fallback,
					children: ($$renderer) => {
						Scene($$renderer, {});
					},
					$$slots: { fallback: true, default: true }
				});
			}
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div>`);

	if ($$store_subs) $.unsubscribe_stores($$store_subs);
}