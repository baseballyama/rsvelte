import * as $ from 'svelte/internal/server';
import { Canvas } from '@threlte/core';
import Scene from './Scene.svelte';
import { Pane, Checkbox } from 'svelte-tweakpane-ui';

export default function App($$renderer) {
	let showScene = true;
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		Pane($$renderer, {
			title: '',
			position: 'fixed',
			children: ($$renderer) => {
				Checkbox($$renderer, {
					get value() {
						return showScene;
					},

					set value($$value) {
						showScene = $$value;
						$$settled = false;
					}
				});
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <div class="svelte-3nylqy">`);

		Canvas($$renderer, {
			children: ($$renderer) => {
				if (showScene) {
					$$renderer.push('<!--[0-->');
					Scene($$renderer, {});
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]-->`);
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