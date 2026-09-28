import * as $ from 'svelte/internal/server';
import { Canvas } from '@threlte/core';
import Scene from './Scene.svelte';
import { Checkbox, Folder, Pane, Slider } from 'svelte-tweakpane-ui';

export default function App($$renderer) {
	let opacity = 1;
	let dashArray = 0.5;
	let dashRatio = 0.5;
	let attenuate = true;
	let scaleDown = 0;
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		Pane($$renderer, {
			title: '',
			position: 'fixed',
			children: ($$renderer) => {
				Slider($$renderer, {
					label: 'opacity',
					min: 0,
					max: 1,
					step: 0.01,
					get value() {
						return opacity;
					},

					set value($$value) {
						opacity = $$value;
						$$settled = false;
					}
				});

				$$renderer.push(`<!----> `);

				Checkbox($$renderer, {
					label: 'attenuate',
					get value() {
						return attenuate;
					},

					set value($$value) {
						attenuate = $$value;
						$$settled = false;
					}
				});

				$$renderer.push(`<!----> `);

				Slider($$renderer, {
					label: 'scaleDown',
					min: 0,
					max: 10,
					step: 0.1,
					get value() {
						return scaleDown;
					},

					set value($$value) {
						scaleDown = $$value;
						$$settled = false;
					}
				});

				$$renderer.push(`<!----> `);

				Folder($$renderer, {
					title: 'Dash',
					children: ($$renderer) => {
						Slider($$renderer, {
							label: 'dashArray',
							min: 0,
							max: 1,
							step: 0.01,
							get value() {
								return dashArray;
							},

							set value($$value) {
								dashArray = $$value;
								$$settled = false;
							}
						});

						$$renderer.push(`<!----> `);

						Slider($$renderer, {
							label: 'dashRatio',
							min: 0,
							max: 1,
							step: 0.01,
							get value() {
								return dashRatio;
							},

							set value($$value) {
								dashRatio = $$value;
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

		$$renderer.push(`<!----> <div class="svelte-13cqxt">`);

		Canvas($$renderer, {
			children: ($$renderer) => {
				Scene($$renderer, { opacity, dashArray, dashRatio, attenuate, scaleDown });
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