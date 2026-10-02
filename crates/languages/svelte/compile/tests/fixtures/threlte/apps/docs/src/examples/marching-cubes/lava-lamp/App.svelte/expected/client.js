import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Scene from './Scene.svelte';
import { Canvas } from '@threlte/core';
import { Pane, Folder, List, Slider } from 'svelte-tweakpane-ui';

var root = $.from_html(`<!> <!> <!> <!>`, 1);
var root_1 = $.from_html(`<div class="svelte-1dv3gr2"><!> <!></div>`);

export default function App($$anchor) {
	let ballCount = $.state(15);
	let isolation = $.state(80);
	let planeAxis = $.state('y');
	let resolution = $.state(35);
	const axisOptions = { x: 'x', y: 'y', z: 'z' };
	var div = root_1();
	var node = $.child(div);

	Pane(node, {
		position: 'fixed',
		title: 'Lava Lamp',
		children: ($$anchor, $$slotProps) => {
			var fragment = root();
			var node_1 = $.first_child(fragment);

			Slider(node_1, {
				label: 'ball count',
				min: 3,
				max: 25,
				step: 1,
				get value() {
					return $.get(ballCount);
				},

				set value($$value) {
					$.set(ballCount, $$value, true);
				}
			});

			var node_2 = $.sibling(node_1, 2);

			Slider(node_2, {
				label: 'isolation',
				min: 40,
				max: 100,
				step: 1,
				get value() {
					return $.get(isolation);
				},

				set value($$value) {
					$.set(isolation, $$value, true);
				}
			});

			var node_3 = $.sibling(node_2, 2);

			Slider(node_3, {
				label: 'resolution',
				min: 10,
				max: 50,
				step: 1,
				get value() {
					return $.get(resolution);
				},

				set value($$value) {
					$.set(resolution, $$value, true);
				}
			});

			var node_4 = $.sibling(node_3, 2);

			Folder(node_4, {
				title: 'Plane',
				children: ($$anchor, $$slotProps) => {
					List($$anchor, {
						label: 'Axis',
						get options() {
							return axisOptions;
						},

						get value() {
							return $.get(planeAxis);
						},

						set value($$value) {
							$.set(planeAxis, $$value, true);
						}
					});
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment);
		},
		$$slots: { default: true }
	});

	var node_5 = $.sibling(node, 2);

	Canvas(node_5, {
		children: ($$anchor, $$slotProps) => {
			Scene($$anchor, {
				get ballCount() {
					return $.get(ballCount);
				},

				get planeAxis() {
					return $.get(planeAxis);
				},

				get resolution() {
					return $.get(resolution);
				},

				get isolation() {
					return $.get(isolation);
				}
			});
		},
		$$slots: { default: true }
	});

	$.reset(div);
	$.append($$anchor, div);
}