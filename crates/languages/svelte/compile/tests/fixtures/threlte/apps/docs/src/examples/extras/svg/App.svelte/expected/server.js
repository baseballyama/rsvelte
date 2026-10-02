import * as $ from 'svelte/internal/server';
import { NoToneMapping } from 'three';
import { Canvas } from '@threlte/core';
import Scene from './Scene.svelte';
import { Pane, List } from 'svelte-tweakpane-ui';

export default function App($$renderer) {
	const options = { logo: 0, ordering: 1 };
	let selection = 0;
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		$$renderer.push(`<div class="svelte-l9pgem">`);

		Canvas($$renderer, {
			toneMapping: NoToneMapping,
			children: ($$renderer) => {
				Scene($$renderer, { selection });
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></div> `);

		Pane($$renderer, {
			position: 'fixed',
			title: 'SVG',
			children: ($$renderer) => {
				List($$renderer, {
					label: 'scene',
					options,
					get value() {
						return selection;
					},

					set value($$value) {
						selection = $$value;
						$$settled = false;
					}
				});
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!---->`);
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}