import * as $ from 'svelte/internal/server';
import { Canvas, T } from '@threlte/core';
import Scene from './Scene.svelte';
import { NoToneMapping } from 'three';
import { Grid, OrbitControls } from '@threlte/extras';
import { Pane, Slider, List } from 'svelte-tweakpane-ui';

export default function App($$renderer) {
	let innerWidth = 0;
	let width = 800;
	let height = 800;
	let rows = 5;
	let columns = 5;
	let size = 128;

	let sizeOptions = {
		'64px': 64,
		'128px': 128,
		'256px': 256,
		'512px': 512,
		'1024px': 1024
	};

	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		Pane($$renderer, {
			title: 'Flex',
			position: 'fixed',
			children: ($$renderer) => {
				Slider($$renderer, {
					label: 'Window Width',
					min: 450,
					max: 800,
					get value() {
						return width;
					},

					set value($$value) {
						width = $$value;
						$$settled = false;
					}
				});

				$$renderer.push(`<!----> `);

				Slider($$renderer, {
					label: 'Window Height',
					min: 450,
					max: 800,
					get value() {
						return height;
					},

					set value($$value) {
						height = $$value;
						$$settled = false;
					}
				});

				$$renderer.push(`<!----> `);

				Slider($$renderer, {
					label: 'Rows',
					step: 1,
					min: 3,
					max: 8,
					get value() {
						return rows;
					},

					set value($$value) {
						rows = $$value;
						$$settled = false;
					}
				});

				$$renderer.push(`<!----> `);

				Slider($$renderer, {
					label: 'Columns',
					step: 1,
					min: 3,
					max: 8,
					get value() {
						return columns;
					},

					set value($$value) {
						columns = $$value;
						$$settled = false;
					}
				});

				$$renderer.push(`<!----> `);

				List($$renderer, {
					label: 'MatCap Size',
					options: sizeOptions,
					get value() {
						return size;
					},

					set value($$value) {
						size = $$value;
						$$settled = false;
					}
				});

				$$renderer.push(`<!---->`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <div class="svelte-3hwgvu">`);

		Canvas($$renderer, {
			toneMapping: NoToneMapping,
			children: ($$renderer) => {
				Grid($$renderer, {
					'position.z': -10.1,
					plane: 'xy',
					gridSize: 800,
					cellColor: '#0A0F19',
					sectionColor: '#481D1A',
					sectionSize: 100,
					cellSize: 10,
					fadeStrength: 0
				});

				$$renderer.push(`<!----> `);

				if (T.OrthographicCamera) {
					$$renderer.push('<!--[-->');

					T.OrthographicCamera($$renderer, {
						makeDefault: true,
						'position.z': 1000,
						'position.x': 500,
						'position.y': 500,
						zoom: innerWidth / 1200,
						children: ($$renderer) => {
							OrbitControls($$renderer, {});
						},
						$$slots: { default: true }
					});

					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}

				$$renderer.push(` `);

				Scene($$renderer, {
					windowWidth: width,
					windowHeight: height,
					rows,
					columns,
					size
				});

				$$renderer.push(`<!---->`);
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