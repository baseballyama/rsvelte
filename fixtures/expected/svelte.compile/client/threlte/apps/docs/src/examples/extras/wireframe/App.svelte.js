import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Color } from 'three';
import { Pane, Checkbox, Slider, Color as ColorInput, Separator } from 'svelte-tweakpane-ui';
import { Canvas } from '@threlte/core';
import Scene from './Scene.svelte';

var root = $.from_html(`<!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <div class="svelte-1l3rqwu"><!></div>`, 1);

export default function App($$anchor, $$props) {
	$.push($$props, true);

	let wireframeProps = $.proxy({
		thickness: 0.7,
		squeeze: true,
		squeezeMin: 0.2,
		squeezeMax: -0.13,
		dash: false,
		dashInvert: true,
		dashRepeats: 4,
		dashLength: 0.1,
		fill: new Color('lightgreen'),
		fillOpacity: 1,
		fillMix: 0,
		stroke: new Color('red'),
		strokeOpacity: 1,
		colorBackfaces: false,
		backfaceStroke: new Color('lightred')
	});

	var fragment = root_1();
	var node = $.first_child(fragment);

	Pane(node, {
		title: '',
		position: 'fixed',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node_1 = $.first_child(fragment_1);

			Slider(node_1, {
				label: 'thickness',
				min: 0,
				max: 20,
				step: 0.1,
				get value() {
					return wireframeProps.thickness;
				},

				set value($$value) {
					wireframeProps.thickness = $$value;
				}
			});

			var node_2 = $.sibling(node_1, 2);

			Separator(node_2, {});

			var node_3 = $.sibling(node_2, 2);

			Checkbox(node_3, {
				label: 'squeeze',
				get value() {
					return wireframeProps.squeeze;
				},

				set value($$value) {
					wireframeProps.squeeze = $$value;
				}
			});

			var node_4 = $.sibling(node_3, 2);

			Slider(node_4, {
				label: 'squeezeMin',
				get value() {
					return wireframeProps.squeezeMin;
				},

				set value($$value) {
					wireframeProps.squeezeMin = $$value;
				}
			});

			var node_5 = $.sibling(node_4, 2);

			Slider(node_5, {
				label: 'squeezeMax',
				get value() {
					return wireframeProps.squeezeMax;
				},

				set value($$value) {
					wireframeProps.squeezeMax = $$value;
				}
			});

			var node_6 = $.sibling(node_5, 2);

			Separator(node_6, {});

			var node_7 = $.sibling(node_6, 2);

			Checkbox(node_7, {
				label: 'dash',
				get value() {
					return wireframeProps.dash;
				},

				set value($$value) {
					wireframeProps.dash = $$value;
				}
			});

			var node_8 = $.sibling(node_7, 2);

			Checkbox(node_8, {
				label: 'dashInvert',
				get value() {
					return wireframeProps.dashInvert;
				},

				set value($$value) {
					wireframeProps.dashInvert = $$value;
				}
			});

			var node_9 = $.sibling(node_8, 2);

			Slider(node_9, {
				label: 'dashLength',
				get value() {
					return wireframeProps.dashLength;
				},

				set value($$value) {
					wireframeProps.dashLength = $$value;
				}
			});

			var node_10 = $.sibling(node_9, 2);

			Slider(node_10, {
				label: 'dashRepeats',
				step: 1,
				get value() {
					return wireframeProps.dashRepeats;
				},

				set value($$value) {
					wireframeProps.dashRepeats = $$value;
				}
			});

			var node_11 = $.sibling(node_10, 2);

			Separator(node_11, {});

			var node_12 = $.sibling(node_11, 2);

			ColorInput(node_12, {
				label: 'fill',
				type: 'float',
				get value() {
					return wireframeProps.fill;
				},

				set value($$value) {
					wireframeProps.fill = $$value;
				}
			});

			var node_13 = $.sibling(node_12, 2);

			Slider(node_13, {
				label: 'fillOpacity',
				get value() {
					return wireframeProps.fillOpacity;
				},

				set value($$value) {
					wireframeProps.fillOpacity = $$value;
				}
			});

			var node_14 = $.sibling(node_13, 2);

			Slider(node_14, {
				label: 'fillMix',
				step: 0.01,
				get value() {
					return wireframeProps.fillMix;
				},

				set value($$value) {
					wireframeProps.fillMix = $$value;
				}
			});

			var node_15 = $.sibling(node_14, 2);

			Separator(node_15, {});

			var node_16 = $.sibling(node_15, 2);

			ColorInput(node_16, {
				label: 'stroke',
				type: 'float',
				get value() {
					return wireframeProps.stroke;
				},

				set value($$value) {
					wireframeProps.stroke = $$value;
				}
			});

			var node_17 = $.sibling(node_16, 2);

			Slider(node_17, {
				label: 'fillOpacity',
				get value() {
					return wireframeProps.strokeOpacity;
				},

				set value($$value) {
					wireframeProps.strokeOpacity = $$value;
				}
			});

			var node_18 = $.sibling(node_17, 2);

			ColorInput(node_18, {
				label: 'backfaceStroke',
				type: 'float',
				get value() {
					return wireframeProps.backfaceStroke;
				},

				set value($$value) {
					wireframeProps.backfaceStroke = $$value;
				}
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	var div = $.sibling(node, 2);
	var node_19 = $.child(div);

	Canvas(node_19, {
		children: ($$anchor, $$slotProps) => {
			Scene($$anchor, {
				get wireframeProps() {
					return wireframeProps;
				}
			});
		},
		$$slots: { default: true }
	});

	$.reset(div);
	$.append($$anchor, fragment);
	$.pop();
}