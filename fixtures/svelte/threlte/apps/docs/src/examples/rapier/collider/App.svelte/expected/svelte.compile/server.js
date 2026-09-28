import * as $ from 'svelte/internal/server';
import { Canvas } from '@threlte/core';
import { HTML } from '@threlte/extras';
import { World } from '@threlte/rapier';
import Scene from './Scene.svelte';
import { Pane, Button } from 'svelte-tweakpane-ui';

export default function App($$renderer) {
	let testIndex = 0;
	let version = 0;

	Pane($$renderer, {
		title: 'Colliders',
		position: 'fixed',
		children: ($$renderer) => {
			Button($$renderer, { label: 'type', title: 'Standalone' });
			$$renderer.push(`<!----> `);
			Button($$renderer, { label: '', title: 'Attached' });
			$$renderer.push(`<!----> `);
			Button($$renderer, { label: '', title: 'Sensor' });
			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> <div class="svelte-1jc57aa">`);

	Canvas($$renderer, {
		children: ($$renderer) => {
			{
				function fallback($$renderer) {
					HTML($$renderer, {
						transform: true,
						children: ($$renderer) => {
							$$renderer.push(`<p class="text-xs">It seems your browser doesn't support WASM.<br/> I'm sorry.</p>`);
						},
						$$slots: { default: true }
					});
				}

				World($$renderer, {
					fallback,
					children: ($$renderer) => {
						$$renderer.push(`<!---->`);

						{
							Scene($$renderer, { testIndex });
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