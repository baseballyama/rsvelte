import * as $ from 'svelte/internal/server';
import Scene from './Scene.svelte';
import { AsciiRenderer } from '@threlte/extras';
import { Canvas } from '@threlte/core';
import { Checkbox, Pane } from 'svelte-tweakpane-ui';

export default function App($$renderer) {
	let color = false;
	const options = $.derived(() => ({ color }));
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		Pane($$renderer, {
			title: 'render on update',
			position: 'fixed',
			children: ($$renderer) => {
				Checkbox($$renderer, {
					label: 'color',
					get value() {
						return color;
					},

					set value($$value) {
						color = $$value;
						$$settled = false;
					}
				});
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <div class="svelte-1obhc4a">`);

		Canvas($$renderer, {
			children: ($$renderer) => {
				{
					function children($$renderer, { asciiEffect }) {
						Scene($$renderer, { asciiEffect });
					}

					AsciiRenderer($$renderer, {
						autoRender: false,
						options: options(),
						children,
						$$slots: { default: true }
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