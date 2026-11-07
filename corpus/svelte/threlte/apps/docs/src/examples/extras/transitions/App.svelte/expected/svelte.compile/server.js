import * as $ from 'svelte/internal/server';
import { Canvas } from '@threlte/core';
import Scene from './Scene.svelte';
import { Checkbox, Pane } from 'svelte-tweakpane-ui';
import { Suspense } from '@threlte/extras';

export default function App($$renderer) {
	let red = true;
	let blue = true;
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		Pane($$renderer, {
			title: 'Transitions',
			position: 'fixed',
			children: ($$renderer) => {
				Checkbox($$renderer, {
					label: 'Toggle Red',
					get value() {
						return red;
					},

					set value($$value) {
						red = $$value;
						$$settled = false;
					}
				});

				$$renderer.push(`<!----> `);

				Checkbox($$renderer, {
					label: 'Toggle Blue',
					get value() {
						return blue;
					},

					set value($$value) {
						blue = $$value;
						$$settled = false;
					}
				});

				$$renderer.push(`<!---->`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <div class="svelte-14owz5s">`);

		Canvas($$renderer, {
			children: ($$renderer) => {
				Suspense($$renderer, {
					children: ($$renderer) => {
						Scene($$renderer, { red, blue });
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