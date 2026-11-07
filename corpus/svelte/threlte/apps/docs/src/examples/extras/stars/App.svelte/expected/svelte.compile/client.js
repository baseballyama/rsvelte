import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Canvas } from '@threlte/core';
import { Checkbox, Folder, Pane, Slider } from 'svelte-tweakpane-ui';
import Scene from './Scene.svelte';

var root = $.from_html(`<!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!> <!> <!> <!>`, 1);
var root_2 = $.from_html(`<!> <div class="svelte-8wusir"><!></div>`, 1);

export default function App($$anchor) {
	let count = $.state(5000);
	let radius = $.state(50);
	let depth = $.state(50);
	let factor = $.state(6);
	let saturation = $.state(1);
	let lightness = $.state(0.8);
	let opacity = $.state(1);
	let fade = $.state(true);
	let rounded = $.state(false);
	let speed = $.state(0);
	var fragment = root_2();
	var node = $.first_child(fragment);

	Pane(node, {
		title: 'Stars',
		position: 'fixed',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node_1 = $.first_child(fragment_1);

			Folder(node_1, {
				title: 'Distribution',
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root();
					var node_2 = $.first_child(fragment_2);

					Slider(node_2, {
						label: 'count',
						min: 100,
						max: 20000,
						step: 100,
						get value() {
							return $.get(count);
						},

						set value($$value) {
							$.set(count, $$value, true);
						}
					});

					var node_3 = $.sibling(node_2, 2);

					Slider(node_3, {
						label: 'radius',
						min: 1,
						max: 200,
						step: 1,
						get value() {
							return $.get(radius);
						},

						set value($$value) {
							$.set(radius, $$value, true);
						}
					});

					var node_4 = $.sibling(node_3, 2);

					Slider(node_4, {
						label: 'depth',
						min: 1,
						max: 200,
						step: 1,
						get value() {
							return $.get(depth);
						},

						set value($$value) {
							$.set(depth, $$value, true);
						}
					});

					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});

			var node_5 = $.sibling(node_1, 2);

			Folder(node_5, {
				title: 'Appearance',
				children: ($$anchor, $$slotProps) => {
					var fragment_3 = root_1();
					var node_6 = $.first_child(fragment_3);

					Slider(node_6, {
						label: 'factor',
						min: 0,
						max: 20,
						step: 0.1,
						get value() {
							return $.get(factor);
						},

						set value($$value) {
							$.set(factor, $$value, true);
						}
					});

					var node_7 = $.sibling(node_6, 2);

					Slider(node_7, {
						label: 'saturation',
						min: 0,
						max: 1,
						step: 0.01,
						get value() {
							return $.get(saturation);
						},

						set value($$value) {
							$.set(saturation, $$value, true);
						}
					});

					var node_8 = $.sibling(node_7, 2);

					Slider(node_8, {
						label: 'lightness',
						min: 0,
						max: 1,
						step: 0.01,
						get value() {
							return $.get(lightness);
						},

						set value($$value) {
							$.set(lightness, $$value, true);
						}
					});

					var node_9 = $.sibling(node_8, 2);

					Slider(node_9, {
						label: 'opacity',
						min: 0,
						max: 1,
						step: 0.01,
						get value() {
							return $.get(opacity);
						},

						set value($$value) {
							$.set(opacity, $$value, true);
						}
					});

					var node_10 = $.sibling(node_9, 2);

					Checkbox(node_10, {
						label: 'fade',
						get value() {
							return $.get(fade);
						},

						set value($$value) {
							$.set(fade, $$value, true);
						}
					});

					var node_11 = $.sibling(node_10, 2);

					Checkbox(node_11, {
						label: 'rounded',
						get value() {
							return $.get(rounded);
						},

						set value($$value) {
							$.set(rounded, $$value, true);
						}
					});

					$.append($$anchor, fragment_3);
				},
				$$slots: { default: true }
			});

			var node_12 = $.sibling(node_5, 2);

			Folder(node_12, {
				title: 'Animation',
				children: ($$anchor, $$slotProps) => {
					Slider($$anchor, {
						label: 'speed',
						min: 0,
						max: 5,
						step: 0.1,
						get value() {
							return $.get(speed);
						},

						set value($$value) {
							$.set(speed, $$value, true);
						}
					});
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	var div = $.sibling(node, 2);
	var node_13 = $.child(div);

	Canvas(node_13, {
		children: ($$anchor, $$slotProps) => {
			Scene($$anchor, {
				get count() {
					return $.get(count);
				},

				get radius() {
					return $.get(radius);
				},

				get depth() {
					return $.get(depth);
				},

				get factor() {
					return $.get(factor);
				},

				get saturation() {
					return $.get(saturation);
				},

				get lightness() {
					return $.get(lightness);
				},

				get opacity() {
					return $.get(opacity);
				},

				get fade() {
					return $.get(fade);
				},

				get rounded() {
					return $.get(rounded);
				},

				get speed() {
					return $.get(speed);
				}
			});
		},
		$$slots: { default: true }
	});

	$.reset(div);
	$.append($$anchor, fragment);
}