import * as $ from 'svelte/internal/server';
import { Canvas } from '@threlte/core';
import Scene from './Scene.svelte';
import { Color, List, Pane, Slider, Text } from 'svelte-tweakpane-ui';

export default function App($$renderer) {
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

	let options = {
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
	};

	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		Pane($$renderer, {
			title: 'Text',
			position: 'fixed',
			children: ($$renderer) => {
				Text($$renderer, {
					label: 'text',
					get value() {
						return options.text;
					},

					set value($$value) {
						options.text = $$value;
						$$settled = false;
					}
				});

				$$renderer.push(`<!----> `);

				Slider($$renderer, {
					label: 'fontSize',
					min: 0.1,
					max: 4,
					step: 0.1,
					get value() {
						return options.fontSize;
					},

					set value($$value) {
						options.fontSize = $$value;
						$$settled = false;
					}
				});

				$$renderer.push(`<!----> `);

				Slider($$renderer, {
					label: 'maxWidth',
					min: 1,
					max: 40,
					get value() {
						return options.maxWidth;
					},

					set value($$value) {
						options.maxWidth = $$value;
						$$settled = false;
					}
				});

				$$renderer.push(`<!----> `);

				Slider($$renderer, {
					label: 'letterSpacing',
					min: -0.2,
					max: 0.5,
					step: 0.01,
					get value() {
						return options.letterSpacing;
					},

					set value($$value) {
						options.letterSpacing = $$value;
						$$settled = false;
					}
				});

				$$renderer.push(`<!----> `);

				Slider($$renderer, {
					label: 'lineHeight',
					min: 0.5,
					max: 2.5,
					step: 0.05,
					get value() {
						return options.lineHeight;
					},

					set value($$value) {
						options.lineHeight = $$value;
						$$settled = false;
					}
				});

				$$renderer.push(`<!----> `);

				Slider($$renderer, {
					label: 'textIndent',
					min: 0,
					max: 5,
					step: 0.1,
					get value() {
						return options.textIndent;
					},

					set value($$value) {
						options.textIndent = $$value;
						$$settled = false;
					}
				});

				$$renderer.push(`<!----> `);

				List($$renderer, {
					label: 'textAlign',
					options: textAlignOptions,
					get value() {
						return options.textAlign;
					},

					set value($$value) {
						options.textAlign = $$value;
						$$settled = false;
					}
				});

				$$renderer.push(`<!----> `);

				List($$renderer, {
					label: 'whiteSpace',
					options: whiteSpaceOptions,
					get value() {
						return options.whiteSpace;
					},

					set value($$value) {
						options.whiteSpace = $$value;
						$$settled = false;
					}
				});

				$$renderer.push(`<!----> `);

				List($$renderer, {
					label: 'overflowWrap',
					options: overflowWrapOptions,
					get value() {
						return options.overflowWrap;
					},

					set value($$value) {
						options.overflowWrap = $$value;
						$$settled = false;
					}
				});

				$$renderer.push(`<!----> `);

				List($$renderer, {
					label: 'direction',
					options: directionOptions,
					get value() {
						return options.direction;
					},

					set value($$value) {
						options.direction = $$value;
						$$settled = false;
					}
				});

				$$renderer.push(`<!----> `);

				List($$renderer, {
					label: 'anchorX',
					options: anchorXOptions,
					get value() {
						return options.anchorX;
					},

					set value($$value) {
						options.anchorX = $$value;
						$$settled = false;
					}
				});

				$$renderer.push(`<!----> `);

				List($$renderer, {
					label: 'anchorY',
					options: anchorYOptions,
					get value() {
						return options.anchorY;
					},

					set value($$value) {
						options.anchorY = $$value;
						$$settled = false;
					}
				});

				$$renderer.push(`<!----> `);

				Slider($$renderer, {
					label: 'curveRadius',
					min: -10,
					max: 10,
					step: 0.1,
					get value() {
						return options.curveRadius;
					},

					set value($$value) {
						options.curveRadius = $$value;
						$$settled = false;
					}
				});

				$$renderer.push(`<!----> `);

				Color($$renderer, {
					label: 'color',
					get value() {
						return options.color;
					},

					set value($$value) {
						options.color = $$value;
						$$settled = false;
					}
				});

				$$renderer.push(`<!----> `);

				Slider($$renderer, {
					label: 'fillOpacity',
					min: 0,
					max: 1,
					step: 0.01,
					get value() {
						return options.fillOpacity;
					},

					set value($$value) {
						options.fillOpacity = $$value;
						$$settled = false;
					}
				});

				$$renderer.push(`<!----> `);

				Slider($$renderer, {
					label: 'outlineWidth',
					min: 0,
					max: 0.5,
					step: 0.01,
					get value() {
						return options.outlineWidth;
					},

					set value($$value) {
						options.outlineWidth = $$value;
						$$settled = false;
					}
				});

				$$renderer.push(`<!----> `);

				Color($$renderer, {
					label: 'outlineColor',
					get value() {
						return options.outlineColor;
					},

					set value($$value) {
						options.outlineColor = $$value;
						$$settled = false;
					}
				});

				$$renderer.push(`<!----> `);

				Slider($$renderer, {
					label: 'outlineOpacity',
					min: 0,
					max: 1,
					step: 0.01,
					get value() {
						return options.outlineOpacity;
					},

					set value($$value) {
						options.outlineOpacity = $$value;
						$$settled = false;
					}
				});

				$$renderer.push(`<!----> `);

				Slider($$renderer, {
					label: 'outlineBlur',
					min: 0,
					max: 0.5,
					step: 0.01,
					get value() {
						return options.outlineBlur;
					},

					set value($$value) {
						options.outlineBlur = $$value;
						$$settled = false;
					}
				});

				$$renderer.push(`<!----> `);

				Slider($$renderer, {
					label: 'outlineOffsetX',
					min: -0.5,
					max: 0.5,
					step: 0.01,
					get value() {
						return options.outlineOffsetX;
					},

					set value($$value) {
						options.outlineOffsetX = $$value;
						$$settled = false;
					}
				});

				$$renderer.push(`<!----> `);

				Slider($$renderer, {
					label: 'outlineOffsetY',
					min: -0.5,
					max: 0.5,
					step: 0.01,
					get value() {
						return options.outlineOffsetY;
					},

					set value($$value) {
						options.outlineOffsetY = $$value;
						$$settled = false;
					}
				});

				$$renderer.push(`<!----> `);

				Slider($$renderer, {
					label: 'strokeWidth',
					min: 0,
					max: 0.5,
					step: 0.01,
					get value() {
						return options.strokeWidth;
					},

					set value($$value) {
						options.strokeWidth = $$value;
						$$settled = false;
					}
				});

				$$renderer.push(`<!----> `);

				Color($$renderer, {
					label: 'strokeColor',
					get value() {
						return options.strokeColor;
					},

					set value($$value) {
						options.strokeColor = $$value;
						$$settled = false;
					}
				});

				$$renderer.push(`<!----> `);

				Slider($$renderer, {
					label: 'strokeOpacity',
					min: 0,
					max: 1,
					step: 0.01,
					get value() {
						return options.strokeOpacity;
					},

					set value($$value) {
						options.strokeOpacity = $$value;
						$$settled = false;
					}
				});

				$$renderer.push(`<!---->`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <div class="svelte-1mqvytb">`);

		Canvas($$renderer, {
			children: ($$renderer) => {
				Scene($$renderer, $.spread_props([options]));
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