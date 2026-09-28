import * as $ from 'svelte/internal/server';
import { Canvas } from '@threlte/core';
import Scene, { hdrs } from './Scene.svelte';
import { Checkbox, Folder, List, Pane, Slider } from 'svelte-tweakpane-ui';

export default function App($$renderer) {
	const resolutionOptions = { 32: 32, 64: 64, 128: 128, 256: 256, 512: 512, 1024: 1024 };

	const environmentOptions = {
		auto: 'auto',
		industrial: 'industrial',
		puresky: 'puresky',
		workshop: 'workshop'
	};

	let hdr = 'auto';
	let metalness = 1;
	let resolution = 256;
	let roughness = 0;
	let capFrames = false;
	let frames = $.derived(() => capFrames ? 3 : Infinity);
	let near = 0.1;
	let far = 1000;
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		Pane($$renderer, {
			position: 'fixed',
			title: '',
			children: ($$renderer) => {
				List($$renderer, {
					label: 'resolution',
					options: resolutionOptions,
					get value() {
						return resolution;
					},

					set value($$value) {
						resolution = $$value;
						$$settled = false;
					}
				});

				$$renderer.push(`<!----> `);

				List($$renderer, {
					label: 'environment',
					options: environmentOptions,
					get value() {
						return hdr;
					},

					set value($$value) {
						hdr = $$value;
						$$settled = false;
					}
				});

				$$renderer.push(`<!----> `);

				Checkbox($$renderer, {
					label: 'cap frames',
					get value() {
						return capFrames;
					},

					set value($$value) {
						capFrames = $$value;
						$$settled = false;
					}
				});

				$$renderer.push(`<!----> `);

				Slider($$renderer, {
					label: 'near',
					max: 15,
					min: 0.1,
					get value() {
						return near;
					},

					set value($$value) {
						near = $$value;
						$$settled = false;
					}
				});

				$$renderer.push(`<!----> `);

				Slider($$renderer, {
					label: 'far',
					max: 2000,
					min: 10,
					get value() {
						return far;
					},

					set value($$value) {
						far = $$value;
						$$settled = false;
					}
				});

				$$renderer.push(`<!----> `);

				Folder($$renderer, {
					title: 'material props',
					children: ($$renderer) => {
						Slider($$renderer, {
							max: 1,
							min: 0,
							step: 0.1,
							label: 'metalness',
							get value() {
								return metalness;
							},

							set value($$value) {
								metalness = $$value;
								$$settled = false;
							}
						});

						$$renderer.push(`<!----> `);

						Slider($$renderer, {
							max: 1,
							min: 0,
							step: 0.1,
							label: 'roughness',
							get value() {
								return roughness;
							},

							set value($$value) {
								roughness = $$value;
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

		$$renderer.push(`<!----> <div class="svelte-rwuya5">`);

		Canvas($$renderer, {
			children: ($$renderer) => {
				Scene($$renderer, {
					frames: frames(),
					hdr,
					metalness,
					near,
					far,
					resolution,
					roughness
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