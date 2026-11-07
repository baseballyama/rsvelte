import * as $ from 'svelte/internal/server';
import Scene from './Scene.svelte';
import { Canvas } from '@threlte/core';
import { Checkbox, Color, Folder, Pane, Wheel } from 'svelte-tweakpane-ui';

export default function App($$renderer) {
	let length = 0.25;
	let segments = 20;
	let materialColor = '#ffffff';
	let materialWireframe = false;
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		Pane($$renderer, {
			position: 'fixed',
			title: '',
			children: ($$renderer) => {
				Wheel($$renderer, {
					step: 0.1,
					label: 'length',
					get value() {
						return length;
					},

					set value($$value) {
						length = $$value;
						$$settled = false;
					}
				});

				$$renderer.push(`<!----> `);

				Wheel($$renderer, {
					step: 1,
					label: 'segments',
					get value() {
						return segments;
					},

					set value($$value) {
						segments = $$value;
						$$settled = false;
					}
				});

				$$renderer.push(`<!----> `);

				Folder($$renderer, {
					title: 'material props',
					children: ($$renderer) => {
						Color($$renderer, {
							label: 'color',
							get value() {
								return materialColor;
							},

							set value($$value) {
								materialColor = $$value;
								$$settled = false;
							}
						});

						$$renderer.push(`<!----> `);

						Checkbox($$renderer, {
							label: 'wireframe',
							get value() {
								return materialWireframe;
							},

							set value($$value) {
								materialWireframe = $$value;
								$$settled = false;
							}
						});

						$$renderer.push(`<!---->`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!---->`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <div class="svelte-1qxlpye">`);

		Canvas($$renderer, {
			children: ($$renderer) => {
				Scene($$renderer, { length, materialColor, materialWireframe, segments });
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