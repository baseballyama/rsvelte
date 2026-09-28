import * as $ from 'svelte/internal/server';
import Scene from './Scene.svelte';
import { Canvas } from '@threlte/core';
import { Checkbox, Folder, List, Pane, Slider } from 'svelte-tweakpane-ui';

export default function App($$renderer) {
	let useEnvironment = true;
	let environmentInputsDisabled = $.derived(() => !useEnvironment);
	let environmentIsBackground = true;
	let materialRoughness = 0;
	let materialMetalness = 1;
	const cubes = { bridge: 'bridge', pisa: 'pisa' };

	const pathMap = {
		bridge: '/textures/cube/Bridge2_cube/',
		pisa: '/textures/cube/pisaHDR/'
	};

	const filesMap = {
		bridge: [
			'posx.jpg',
			'negx.jpg',
			'posy.jpg',
			'negy.jpg',
			'posz.jpg',
			'negz.jpg'
		],
		pisa: ['nx.hdr', 'ny.hdr', 'nz.hdr', 'px.hdr', 'py.hdr', 'pz.hdr']
	};

	let cube = cubes.bridge;
	const environmentFilesPath = $.derived(() => pathMap[cube]);
	const environmentFiles = $.derived(() => filesMap[cube]);
	const environmentUrls = $.derived(() => environmentFiles().map((file) => `${environmentFilesPath()}${file}`));
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		Pane($$renderer, {
			position: 'fixed',
			title: 'CubeEnvironment',
			children: ($$renderer) => {
				Checkbox($$renderer, {
					label: 'use <Environment>',
					get value() {
						return useEnvironment;
					},

					set value($$value) {
						useEnvironment = $$value;
						$$settled = false;
					}
				});

				$$renderer.push(`<!----> `);

				Checkbox($$renderer, {
					disabled: environmentInputsDisabled(),
					label: 'is background',
					get value() {
						return environmentIsBackground;
					},

					set value($$value) {
						environmentIsBackground = $$value;
						$$settled = false;
					}
				});

				$$renderer.push(`<!----> `);

				List($$renderer, {
					disabled: environmentInputsDisabled(),
					label: 'cube environment map',
					options: cubes,
					get value() {
						return cube;
					},

					set value($$value) {
						cube = $$value;
						$$settled = false;
					}
				});

				$$renderer.push(`<!----> `);

				Folder($$renderer, {
					title: 'material props',
					children: ($$renderer) => {
						Slider($$renderer, {
							disabled: environmentInputsDisabled(),
							label: 'metalness',
							min: 0,
							max: 1,
							step: 0.1,
							get value() {
								return materialMetalness;
							},

							set value($$value) {
								materialMetalness = $$value;
								$$settled = false;
							}
						});

						$$renderer.push(`<!----> `);

						Slider($$renderer, {
							disabled: environmentInputsDisabled(),
							label: 'roughness',
							min: 0,
							max: 1,
							step: 0.1,
							get value() {
								return materialRoughness;
							},

							set value($$value) {
								materialRoughness = $$value;
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

		$$renderer.push(`<!----> <div class="svelte-14jmdig">`);

		Canvas($$renderer, {
			children: ($$renderer) => {
				Scene($$renderer, {
					environmentIsBackground,
					environmentUrls: environmentUrls(),
					materialMetalness,
					materialRoughness,
					useEnvironment
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