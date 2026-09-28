import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Canvas, T } from '@threlte/core';
import Scene from './Scene.svelte';
import { NoToneMapping } from 'three';
import { Grid, OrbitControls } from '@threlte/extras';
import { Pane, Slider, List } from 'svelte-tweakpane-ui';

var root = $.from_html(`<!> <!> <!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!>`, 1);
var root_2 = $.from_html(`<!> <div class="svelte-3hwgvu"><!></div>`, 1);

export default function App($$anchor) {
	let innerWidth = $.state(0);
	let width = $.state(800);
	let height = $.state(800);
	let rows = $.state(5);
	let columns = $.state(5);
	let size = $.state(128);

	let sizeOptions = {
		'64px': 64,
		'128px': 128,
		'256px': 256,
		'512px': 512,
		'1024px': 1024
	};

	var fragment = root_2();
	var node = $.first_child(fragment);

	Pane(node, {
		title: 'Flex',
		position: 'fixed',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node_1 = $.first_child(fragment_1);

			Slider(node_1, {
				label: 'Window Width',
				min: 450,
				max: 800,
				get value() {
					return $.get(width);
				},

				set value($$value) {
					$.set(width, $$value, true);
				}
			});

			var node_2 = $.sibling(node_1, 2);

			Slider(node_2, {
				label: 'Window Height',
				min: 450,
				max: 800,
				get value() {
					return $.get(height);
				},

				set value($$value) {
					$.set(height, $$value, true);
				}
			});

			var node_3 = $.sibling(node_2, 2);

			Slider(node_3, {
				label: 'Rows',
				step: 1,
				min: 3,
				max: 8,
				get value() {
					return $.get(rows);
				},

				set value($$value) {
					$.set(rows, $$value, true);
				}
			});

			var node_4 = $.sibling(node_3, 2);

			Slider(node_4, {
				label: 'Columns',
				step: 1,
				min: 3,
				max: 8,
				get value() {
					return $.get(columns);
				},

				set value($$value) {
					$.set(columns, $$value, true);
				}
			});

			var node_5 = $.sibling(node_4, 2);

			List(node_5, {
				label: 'MatCap Size',
				get options() {
					return sizeOptions;
				},

				get value() {
					return $.get(size);
				},

				set value($$value) {
					$.set(size, $$value, true);
				}
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	var div = $.sibling(node, 2);
	var node_6 = $.child(div);

	Canvas(node_6, {
		get toneMapping() {
			return NoToneMapping;
		},

		children: ($$anchor, $$slotProps) => {
			var fragment_2 = root_1();
			var node_7 = $.first_child(fragment_2);

			Grid(node_7, {
				'position.z': -10.1,
				plane: 'xy',
				gridSize: 800,
				cellColor: '#0A0F19',
				sectionColor: '#481D1A',
				sectionSize: 100,
				cellSize: 10,
				fadeStrength: 0
			});

			var node_8 = $.sibling(node_7, 2);

			{
				let $0 = $.derived(() => $.get(innerWidth) / 1200);

				$.component(node_8, () => T.OrthographicCamera, ($$anchor, T_OrthographicCamera) => {
					T_OrthographicCamera($$anchor, {
						makeDefault: true,
						'position.z': 1000,
						'position.x': 500,
						'position.y': 500,
						get zoom() {
							return $.get($0);
						},

						children: ($$anchor, $$slotProps) => {
							OrbitControls($$anchor, {});
						},
						$$slots: { default: true }
					});
				});
			}

			var node_9 = $.sibling(node_8, 2);

			Scene(node_9, {
				get windowWidth() {
					return $.get(width);
				},

				get windowHeight() {
					return $.get(height);
				},

				get rows() {
					return $.get(rows);
				},

				get columns() {
					return $.get(columns);
				},

				get size() {
					return $.get(size);
				}
			});

			$.append($$anchor, fragment_2);
		},
		$$slots: { default: true }
	});

	$.reset(div);
	$.bind_window_size('innerWidth', ($$value) => $.set(innerWidth, $$value, true));
	$.append($$anchor, fragment);
}