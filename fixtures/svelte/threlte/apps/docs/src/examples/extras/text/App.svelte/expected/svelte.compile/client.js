import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Canvas } from '@threlte/core';
import Scene from './Scene.svelte';
import { Color, List, Pane, Slider, Text } from 'svelte-tweakpane-ui';

var root = $.from_html(`<!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <div class="svelte-1mqvytb"><!></div>`, 1);

export default function App($$anchor) {
	const anchorXOptions = { left: 'left', center: 'center', right: 'right' };

	const anchorYOptions = {
		top: 'top',
		'top-baseline': 'top-baseline',
		middle: 'middle',
		'bottom-baseline': 'bottom-baseline',
		bottom: 'bottom'
	};

	const directionOptions = { auto: 'auto', ltr: 'ltr', rtl: 'rtl' };

	const textAlignOptions = {
		left: 'left',
		right: 'right',
		center: 'center',
		justify: 'justify'
	};

	const whiteSpaceOptions = { normal: 'normal', nowrap: 'nowrap', 'pre-wrap': 'pre-wrap' };
	const overflowWrapOptions = { normal: 'normal', 'break-word': 'break-word' };

	let options = $.proxy({
		text: 'hello world',
		fontSize: 1,
		maxWidth: 20,
		letterSpacing: -0.1,
		lineHeight: 1.15,
		textIndent: 0,
		textAlign: 'center',
		whiteSpace: 'normal',
		overflowWrap: 'normal',
		direction: 'auto',
		anchorX: 'center',
		anchorY: 'middle',
		curveRadius: 0,
		color: '#ffffff',
		fillOpacity: 1,
		outlineWidth: 0,
		outlineColor: '#000000',
		outlineOpacity: 1,
		outlineBlur: 0,
		outlineOffsetX: 0,
		outlineOffsetY: 0,
		strokeWidth: 0,
		strokeColor: '#808080',
		strokeOpacity: 1
	});

	var fragment = root_1();
	var node = $.first_child(fragment);

	Pane(node, {
		title: 'Text',
		position: 'fixed',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node_1 = $.first_child(fragment_1);

			Text(node_1, {
				label: 'text',
				get value() {
					return options.text;
				},

				set value($$value) {
					options.text = $$value;
				}
			});

			var node_2 = $.sibling(node_1, 2);

			Slider(node_2, {
				label: 'fontSize',
				min: 0.1,
				max: 4,
				step: 0.1,
				get value() {
					return options.fontSize;
				},

				set value($$value) {
					options.fontSize = $$value;
				}
			});

			var node_3 = $.sibling(node_2, 2);

			Slider(node_3, {
				label: 'maxWidth',
				min: 1,
				max: 40,
				get value() {
					return options.maxWidth;
				},

				set value($$value) {
					options.maxWidth = $$value;
				}
			});

			var node_4 = $.sibling(node_3, 2);

			Slider(node_4, {
				label: 'letterSpacing',
				min: -0.2,
				max: 0.5,
				step: 0.01,
				get value() {
					return options.letterSpacing;
				},

				set value($$value) {
					options.letterSpacing = $$value;
				}
			});

			var node_5 = $.sibling(node_4, 2);

			Slider(node_5, {
				label: 'lineHeight',
				min: 0.5,
				max: 2.5,
				step: 0.05,
				get value() {
					return options.lineHeight;
				},

				set value($$value) {
					options.lineHeight = $$value;
				}
			});

			var node_6 = $.sibling(node_5, 2);

			Slider(node_6, {
				label: 'textIndent',
				min: 0,
				max: 5,
				step: 0.1,
				get value() {
					return options.textIndent;
				},

				set value($$value) {
					options.textIndent = $$value;
				}
			});

			var node_7 = $.sibling(node_6, 2);

			List(node_7, {
				label: 'textAlign',
				get options() {
					return textAlignOptions;
				},

				get value() {
					return options.textAlign;
				},

				set value($$value) {
					options.textAlign = $$value;
				}
			});

			var node_8 = $.sibling(node_7, 2);

			List(node_8, {
				label: 'whiteSpace',
				get options() {
					return whiteSpaceOptions;
				},

				get value() {
					return options.whiteSpace;
				},

				set value($$value) {
					options.whiteSpace = $$value;
				}
			});

			var node_9 = $.sibling(node_8, 2);

			List(node_9, {
				label: 'overflowWrap',
				get options() {
					return overflowWrapOptions;
				},

				get value() {
					return options.overflowWrap;
				},

				set value($$value) {
					options.overflowWrap = $$value;
				}
			});

			var node_10 = $.sibling(node_9, 2);

			List(node_10, {
				label: 'direction',
				get options() {
					return directionOptions;
				},

				get value() {
					return options.direction;
				},

				set value($$value) {
					options.direction = $$value;
				}
			});

			var node_11 = $.sibling(node_10, 2);

			List(node_11, {
				label: 'anchorX',
				get options() {
					return anchorXOptions;
				},

				get value() {
					return options.anchorX;
				},

				set value($$value) {
					options.anchorX = $$value;
				}
			});

			var node_12 = $.sibling(node_11, 2);

			List(node_12, {
				label: 'anchorY',
				get options() {
					return anchorYOptions;
				},

				get value() {
					return options.anchorY;
				},

				set value($$value) {
					options.anchorY = $$value;
				}
			});

			var node_13 = $.sibling(node_12, 2);

			Slider(node_13, {
				label: 'curveRadius',
				min: -10,
				max: 10,
				step: 0.1,
				get value() {
					return options.curveRadius;
				},

				set value($$value) {
					options.curveRadius = $$value;
				}
			});

			var node_14 = $.sibling(node_13, 2);

			Color(node_14, {
				label: 'color',
				get value() {
					return options.color;
				},

				set value($$value) {
					options.color = $$value;
				}
			});

			var node_15 = $.sibling(node_14, 2);

			Slider(node_15, {
				label: 'fillOpacity',
				min: 0,
				max: 1,
				step: 0.01,
				get value() {
					return options.fillOpacity;
				},

				set value($$value) {
					options.fillOpacity = $$value;
				}
			});

			var node_16 = $.sibling(node_15, 2);

			Slider(node_16, {
				label: 'outlineWidth',
				min: 0,
				max: 0.5,
				step: 0.01,
				get value() {
					return options.outlineWidth;
				},

				set value($$value) {
					options.outlineWidth = $$value;
				}
			});

			var node_17 = $.sibling(node_16, 2);

			Color(node_17, {
				label: 'outlineColor',
				get value() {
					return options.outlineColor;
				},

				set value($$value) {
					options.outlineColor = $$value;
				}
			});

			var node_18 = $.sibling(node_17, 2);

			Slider(node_18, {
				label: 'outlineOpacity',
				min: 0,
				max: 1,
				step: 0.01,
				get value() {
					return options.outlineOpacity;
				},

				set value($$value) {
					options.outlineOpacity = $$value;
				}
			});

			var node_19 = $.sibling(node_18, 2);

			Slider(node_19, {
				label: 'outlineBlur',
				min: 0,
				max: 0.5,
				step: 0.01,
				get value() {
					return options.outlineBlur;
				},

				set value($$value) {
					options.outlineBlur = $$value;
				}
			});

			var node_20 = $.sibling(node_19, 2);

			Slider(node_20, {
				label: 'outlineOffsetX',
				min: -0.5,
				max: 0.5,
				step: 0.01,
				get value() {
					return options.outlineOffsetX;
				},

				set value($$value) {
					options.outlineOffsetX = $$value;
				}
			});

			var node_21 = $.sibling(node_20, 2);

			Slider(node_21, {
				label: 'outlineOffsetY',
				min: -0.5,
				max: 0.5,
				step: 0.01,
				get value() {
					return options.outlineOffsetY;
				},

				set value($$value) {
					options.outlineOffsetY = $$value;
				}
			});

			var node_22 = $.sibling(node_21, 2);

			Slider(node_22, {
				label: 'strokeWidth',
				min: 0,
				max: 0.5,
				step: 0.01,
				get value() {
					return options.strokeWidth;
				},

				set value($$value) {
					options.strokeWidth = $$value;
				}
			});

			var node_23 = $.sibling(node_22, 2);

			Color(node_23, {
				label: 'strokeColor',
				get value() {
					return options.strokeColor;
				},

				set value($$value) {
					options.strokeColor = $$value;
				}
			});

			var node_24 = $.sibling(node_23, 2);

			Slider(node_24, {
				label: 'strokeOpacity',
				min: 0,
				max: 1,
				step: 0.01,
				get value() {
					return options.strokeOpacity;
				},

				set value($$value) {
					options.strokeOpacity = $$value;
				}
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	var div = $.sibling(node, 2);
	var node_25 = $.child(div);

	Canvas(node_25, {
		children: ($$anchor, $$slotProps) => {
			Scene($$anchor, $.spread_props(() => options));
		},
		$$slots: { default: true }
	});

	$.reset(div);
	$.append($$anchor, fragment);
}