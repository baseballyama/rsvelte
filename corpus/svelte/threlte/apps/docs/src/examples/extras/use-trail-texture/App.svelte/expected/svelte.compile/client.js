import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Canvas } from '@threlte/core';
import Scene from './Scene.svelte';
import { Pane, Folder, Slider, List } from 'svelte-tweakpane-ui';
import * as easings from 'svelte/easing';

var root = $.from_html(`<!> <!> <!> <!> <!> <!> <!> <!> <!>`, 1);
var root_1 = $.from_html(`<div class="svelte-yy4h58"><!> <!></div>`);

export default function App($$anchor, $$props) {
	$.push($$props, true);

	let size = $.state(64);
	let maxAge = $.state(750);
	let radius = $.state(0.3);
	let intensity = $.state(0.2);
	let interpolate = $.state(0);
	let smoothing = $.state(0);
	let minForce = $.state(0.3);
	let amount = $.state(0.1);
	let easeName = $.state('circOut');

	const easingOptions = {
		linear: 'linear',
		circOut: 'circOut',
		cubicOut: 'cubicOut',
		quadOut: 'quadOut',
		expoOut: 'expoOut',
		elasticOut: 'elasticOut',
		bounceOut: 'bounceOut'
	};

	const ease = $.derived(() => easings[$.get(easeName)]);
	var div = root_1();
	var node = $.child(div);

	Pane(node, {
		position: 'fixed',
		title: '',
		children: ($$anchor, $$slotProps) => {
			var fragment = root();
			var node_1 = $.first_child(fragment);

			Slider(node_1, {
				label: 'size',
				min: 8,
				max: 256,
				step: 8,
				get value() {
					return $.get(size);
				},

				set value($$value) {
					$.set(size, $$value, true);
				}
			});

			var node_2 = $.sibling(node_1, 2);

			Slider(node_2, {
				label: 'maxAge',
				min: 300,
				max: 1000,
				step: 50,
				get value() {
					return $.get(maxAge);
				},

				set value($$value) {
					$.set(maxAge, $$value, true);
				}
			});

			var node_3 = $.sibling(node_2, 2);

			Slider(node_3, {
				label: 'radius',
				min: 0,
				max: 1,
				step: 0.01,
				get value() {
					return $.get(radius);
				},

				set value($$value) {
					$.set(radius, $$value, true);
				}
			});

			var node_4 = $.sibling(node_3, 2);

			Slider(node_4, {
				label: 'intensity',
				min: 0,
				max: 1,
				step: 0.1,
				get value() {
					return $.get(intensity);
				},

				set value($$value) {
					$.set(intensity, $$value, true);
				}
			});

			var node_5 = $.sibling(node_4, 2);

			Slider(node_5, {
				label: 'interpolate',
				min: 0,
				max: 2,
				step: 1,
				get value() {
					return $.get(interpolate);
				},

				set value($$value) {
					$.set(interpolate, $$value, true);
				}
			});

			var node_6 = $.sibling(node_5, 2);

			Slider(node_6, {
				label: 'smoothing',
				min: 0,
				max: 0.99,
				step: 0.01,
				get value() {
					return $.get(smoothing);
				},

				set value($$value) {
					$.set(smoothing, $$value, true);
				}
			});

			var node_7 = $.sibling(node_6, 2);

			Slider(node_7, {
				label: 'minForce',
				min: 0,
				max: 1,
				step: 0.1,
				get value() {
					return $.get(minForce);
				},

				set value($$value) {
					$.set(minForce, $$value, true);
				}
			});

			var node_8 = $.sibling(node_7, 2);

			List(node_8, {
				label: 'ease',
				get options() {
					return easingOptions;
				},

				get value() {
					return $.get(easeName);
				},

				set value($$value) {
					$.set(easeName, $$value, true);
				}
			});

			var node_9 = $.sibling(node_8, 2);

			Folder(node_9, {
				title: 'Displacement',
				children: ($$anchor, $$slotProps) => {
					Slider($$anchor, {
						label: 'amount',
						min: 0,
						max: 0.5,
						step: 0.01,
						get value() {
							return $.get(amount);
						},

						set value($$value) {
							$.set(amount, $$value, true);
						}
					});
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment);
		},
		$$slots: { default: true }
	});

	var node_10 = $.sibling(node, 2);

	Canvas(node_10, {
		children: ($$anchor, $$slotProps) => {
			Scene($$anchor, {
				get size() {
					return $.get(size);
				},

				get maxAge() {
					return $.get(maxAge);
				},

				get radius() {
					return $.get(radius);
				},

				get intensity() {
					return $.get(intensity);
				},

				get interpolate() {
					return $.get(interpolate);
				},

				get smoothing() {
					return $.get(smoothing);
				},

				get minForce() {
					return $.get(minForce);
				},

				get amount() {
					return $.get(amount);
				},

				get ease() {
					return $.get(ease);
				}
			});
		},
		$$slots: { default: true }
	});

	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}