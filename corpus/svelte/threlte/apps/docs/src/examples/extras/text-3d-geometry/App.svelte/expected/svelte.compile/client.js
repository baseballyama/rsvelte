import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Canvas } from '@threlte/core';
import { Checkbox, Pane, Slider, Textarea } from 'svelte-tweakpane-ui';
import Scene from './Scene.svelte';
import { MathUtils } from 'three';

var root = $.from_html(`<!> <!> <!> <!> <!> <!> <!> <!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <div class="svelte-12n28bw"><!></div>`, 1);

export default function App($$anchor, $$props) {
	$.push($$props, true);

	let options = $.proxy({
		text: 'Hello\nWorld',
		bevelEnabled: true,
		bevelOffset: 0,
		bevelSegments: 20,
		bevelSize: 0.2,
		bevelThickness: 0.1,
		curveSegments: 12,
		depth: 1,
		size: 5,
		smooth: 0.1
	});

	var fragment = root_1();
	var node = $.first_child(fragment);

	Pane(node, {
		title: 'Text3DGeometry',
		position: 'fixed',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node_1 = $.first_child(fragment_1);

			Textarea(node_1, {
				label: 'text',
				get value() {
					return options.text;
				},

				set value($$value) {
					options.text = $$value;
				}
			});

			var node_2 = $.sibling(node_1, 2);

			Checkbox(node_2, {
				label: 'bevelEnabled',
				get value() {
					return options.bevelEnabled;
				},

				set value($$value) {
					options.bevelEnabled = $$value;
				}
			});

			var node_3 = $.sibling(node_2, 2);

			Slider(node_3, {
				label: 'bevelOffset',
				min: 0,
				max: 2,
				get value() {
					return options.bevelOffset;
				},

				set value($$value) {
					options.bevelOffset = $$value;
				}
			});

			var node_4 = $.sibling(node_3, 2);

			Slider(node_4, {
				label: 'bevelSegments',
				step: 1,
				min: 0,
				max: 50,
				get value() {
					return options.bevelSegments;
				},

				set value($$value) {
					options.bevelSegments = $$value;
				}
			});

			var node_5 = $.sibling(node_4, 2);

			Slider(node_5, {
				label: 'bevelSize',
				min: 0,
				max: 2,
				get value() {
					return options.bevelSize;
				},

				set value($$value) {
					options.bevelSize = $$value;
				}
			});

			var node_6 = $.sibling(node_5, 2);

			Slider(node_6, {
				label: 'bevelThickness',
				min: 0,
				max: 2,
				get value() {
					return options.bevelThickness;
				},

				set value($$value) {
					options.bevelThickness = $$value;
				}
			});

			var node_7 = $.sibling(node_6, 2);

			Slider(node_7, {
				label: 'curveSegments',
				step: 1,
				min: 0,
				max: 50,
				get value() {
					return options.curveSegments;
				},

				set value($$value) {
					options.curveSegments = $$value;
				}
			});

			var node_8 = $.sibling(node_7, 2);

			Slider(node_8, {
				label: 'depth',
				min: 0,
				max: 5,
				get value() {
					return options.depth;
				},

				set value($$value) {
					options.depth = $$value;
				}
			});

			var node_9 = $.sibling(node_8, 2);

			Slider(node_9, {
				label: 'size',
				min: 0,
				max: 10,
				get value() {
					return options.size;
				},

				set value($$value) {
					options.size = $$value;
				}
			});

			var node_10 = $.sibling(node_9, 2);

			{
				let $0 = $.derived(() => MathUtils.degToRad(180));

				Slider(node_10, {
					label: 'smooth',
					min: 0,
					get max() {
						return $.get($0);
					},

					get value() {
						return options.smooth;
					},

					set value($$value) {
						options.smooth = $$value;
					}
				});
			}

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	var div = $.sibling(node, 2);
	var node_11 = $.child(div);

	Canvas(node_11, {
		children: ($$anchor, $$slotProps) => {
			Scene($$anchor, $.spread_props(() => options));
		},
		$$slots: { default: true }
	});

	$.reset(div);
	$.append($$anchor, fragment);
	$.pop();
}