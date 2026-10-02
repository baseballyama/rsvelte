import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Scene from './Scene.svelte';
import { Canvas } from '@threlte/core';
import { Checkbox, Folder, List, Pane, Slider } from 'svelte-tweakpane-ui';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!> <!>`, 1);
var root_2 = $.from_html(`<!> <div class="svelte-14jmdig"><!></div>`, 1);

export default function App($$anchor) {
	let useEnvironment = $.state(true);
	let environmentInputsDisabled = $.derived(() => !$.get(useEnvironment));
	let environmentIsBackground = $.state(true);
	let materialRoughness = $.state(0);
	let materialMetalness = $.state(1);
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

	let cube = $.state($.proxy(cubes.bridge));
	const environmentFilesPath = $.derived(() => pathMap[$.get(cube)]);
	const environmentFiles = $.derived(() => filesMap[$.get(cube)]);
	const environmentUrls = $.derived(() => $.get(environmentFiles).map((file) => `${$.get(environmentFilesPath)}${file}`));
	var fragment = root_2();
	var node = $.first_child(fragment);

	Pane(node, {
		position: 'fixed',
		title: 'CubeEnvironment',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_1();
			var node_1 = $.first_child(fragment_1);

			Checkbox(node_1, {
				label: 'use <Environment>',
				get value() {
					return $.get(useEnvironment);
				},

				set value($$value) {
					$.set(useEnvironment, $$value, true);
				}
			});

			var node_2 = $.sibling(node_1, 2);

			Checkbox(node_2, {
				get disabled() {
					return $.get(environmentInputsDisabled);
				},
				label: 'is background',
				get value() {
					return $.get(environmentIsBackground);
				},

				set value($$value) {
					$.set(environmentIsBackground, $$value, true);
				}
			});

			var node_3 = $.sibling(node_2, 2);

			List(node_3, {
				get disabled() {
					return $.get(environmentInputsDisabled);
				},
				label: 'cube environment map',
				get options() {
					return cubes;
				},

				get value() {
					return $.get(cube);
				},

				set value($$value) {
					$.set(cube, $$value, true);
				}
			});

			var node_4 = $.sibling(node_3, 2);

			Folder(node_4, {
				title: 'material props',
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root();
					var node_5 = $.first_child(fragment_2);

					Slider(node_5, {
						get disabled() {
							return $.get(environmentInputsDisabled);
						},
						label: 'metalness',
						min: 0,
						max: 1,
						step: 0.1,
						get value() {
							return $.get(materialMetalness);
						},

						set value($$value) {
							$.set(materialMetalness, $$value, true);
						}
					});

					var node_6 = $.sibling(node_5, 2);

					Slider(node_6, {
						get disabled() {
							return $.get(environmentInputsDisabled);
						},
						label: 'roughness',
						min: 0,
						max: 1,
						step: 0.1,
						get value() {
							return $.get(materialRoughness);
						},

						set value($$value) {
							$.set(materialRoughness, $$value, true);
						}
					});

					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	var div = $.sibling(node, 2);
	var node_7 = $.child(div);

	Canvas(node_7, {
		children: ($$anchor, $$slotProps) => {
			Scene($$anchor, {
				get environmentIsBackground() {
					return $.get(environmentIsBackground);
				},

				get environmentUrls() {
					return $.get(environmentUrls);
				},

				get materialMetalness() {
					return $.get(materialMetalness);
				},

				get materialRoughness() {
					return $.get(materialRoughness);
				},

				get useEnvironment() {
					return $.get(useEnvironment);
				}
			});
		},
		$$slots: { default: true }
	});

	$.reset(div);
	$.append($$anchor, fragment);
}