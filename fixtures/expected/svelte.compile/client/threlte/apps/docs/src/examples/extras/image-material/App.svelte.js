import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Scene from './Scene.svelte';
import { Canvas } from '@threlte/core';
import { Checkbox, Color, Folder, Pane, Slider } from 'svelte-tweakpane-ui';

var root = $.from_html(`<!> <!> <!> <!> <!> <!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!>`, 1);
var root_2 = $.from_html(`<!> <!>`, 1);

export default function App($$anchor, $$props) {
	$.push($$props, true);

	let brightness = $.state(0);
	let contrast = $.state(0);
	let negative = $.state(false);
	let hue = $.state(0);
	let saturation = $.state(0);
	let lightness = $.state(0);
	let monochromeColor = $.state('#ed8922');
	let monochromeStrength = $.state(0);
	let textureOverrideEnabled = $.state(false);
	let alphaThreshold = $.state(0.5);
	let alphaSmoothing = $.state(0.15);

	$.user_effect(() => {
		$.set(hue, 0);
		$.set(saturation, 0);
		$.set(lightness, 0);

		if ($.get(textureOverrideEnabled)) {
			$.set(hue, 0.2);
			$.set(saturation, -1);
			$.set(lightness, 0.15);
		}
	});

	var fragment = root_2();
	var node = $.first_child(fragment);

	Canvas(node, {
		children: ($$anchor, $$slotProps) => {
			Scene($$anchor, {
				get alphaSmoothing() {
					return $.get(alphaSmoothing);
				},

				get alphaThreshold() {
					return $.get(alphaThreshold);
				},

				get brightness() {
					return $.get(brightness);
				},

				get contrast() {
					return $.get(contrast);
				},

				get hue() {
					return $.get(hue);
				},

				get lightness() {
					return $.get(lightness);
				},

				get monochromeColor() {
					return $.get(monochromeColor);
				},

				get monochromeStrength() {
					return $.get(monochromeStrength);
				},

				get negative() {
					return $.get(negative);
				},

				get saturation() {
					return $.get(saturation);
				},

				get textureOverrideEnabled() {
					return $.get(textureOverrideEnabled);
				}
			});
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 2);

	Pane(node_1, {
		title: 'Image',
		position: 'fixed',
		children: ($$anchor, $$slotProps) => {
			var fragment_2 = root_2();
			var node_2 = $.first_child(fragment_2);

			Folder(node_2, {
				title: 'Color processing',
				children: ($$anchor, $$slotProps) => {
					var fragment_3 = root();
					var node_3 = $.first_child(fragment_3);

					Slider(node_3, {
						label: 'brightness',
						min: -1,
						max: 1,
						get value() {
							return $.get(brightness);
						},

						set value($$value) {
							$.set(brightness, $$value, true);
						}
					});

					var node_4 = $.sibling(node_3, 2);

					Slider(node_4, {
						label: 'contrast',
						min: -1,
						max: 1,
						get value() {
							return $.get(contrast);
						},

						set value($$value) {
							$.set(contrast, $$value, true);
						}
					});

					var node_5 = $.sibling(node_4, 2);

					Slider(node_5, {
						label: 'hue',
						min: 0,
						max: 1,
						get value() {
							return $.get(hue);
						},

						set value($$value) {
							$.set(hue, $$value, true);
						}
					});

					var node_6 = $.sibling(node_5, 2);

					Slider(node_6, {
						label: 'saturation',
						min: -1,
						max: 1,
						get value() {
							return $.get(saturation);
						},

						set value($$value) {
							$.set(saturation, $$value, true);
						}
					});

					var node_7 = $.sibling(node_6, 2);

					Slider(node_7, {
						label: 'lightness',
						min: -1,
						max: 1,
						get value() {
							return $.get(lightness);
						},

						set value($$value) {
							$.set(lightness, $$value, true);
						}
					});

					var node_8 = $.sibling(node_7, 2);

					Slider(node_8, {
						label: 'monochromeStrength',
						min: 0,
						max: 1,
						get value() {
							return $.get(monochromeStrength);
						},

						set value($$value) {
							$.set(monochromeStrength, $$value, true);
						}
					});

					var node_9 = $.sibling(node_8, 2);

					Color(node_9, {
						label: 'monochromeColor',
						get value() {
							return $.get(monochromeColor);
						},

						set value($$value) {
							$.set(monochromeColor, $$value, true);
						}
					});

					var node_10 = $.sibling(node_9, 2);

					Checkbox(node_10, {
						label: 'negative',
						get value() {
							return $.get(negative);
						},

						set value($$value) {
							$.set(negative, $$value, true);
						}
					});

					$.append($$anchor, fragment_3);
				},
				$$slots: { default: true }
			});

			var node_11 = $.sibling(node_2, 2);

			Folder(node_11, {
				title: 'Color processing with a texture',
				children: ($$anchor, $$slotProps) => {
					var fragment_4 = root_1();
					var node_12 = $.first_child(fragment_4);

					Checkbox(node_12, {
						label: 'enabled',
						get value() {
							return $.get(textureOverrideEnabled);
						},

						set value($$value) {
							$.set(textureOverrideEnabled, $$value, true);
						}
					});

					var node_13 = $.sibling(node_12, 2);

					Slider(node_13, {
						label: 'alphaThreshold',
						min: 0,
						max: 1,
						get value() {
							return $.get(alphaThreshold);
						},

						set value($$value) {
							$.set(alphaThreshold, $$value, true);
						}
					});

					var node_14 = $.sibling(node_13, 2);

					Slider(node_14, {
						label: 'alphaSmoothing',
						min: 0,
						max: 1,
						get value() {
							return $.get(alphaSmoothing);
						},

						set value($$value) {
							$.set(alphaSmoothing, $$value, true);
						}
					});

					$.append($$anchor, fragment_4);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_2);
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
	$.pop();
}