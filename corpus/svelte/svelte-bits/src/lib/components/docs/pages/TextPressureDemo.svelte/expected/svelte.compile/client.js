import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
import Customize from '$lib/components/docs/preview/Customize.svelte';
import PreviewSwitch from '$lib/components/docs/preview/PreviewSwitch.svelte';
import PreviewInput from '$lib/components/docs/preview/PreviewInput.svelte';
import PreviewColorPicker from '$lib/components/docs/preview/PreviewColorPicker.svelte';
import PropTable from '$lib/components/docs/preview/PropTable.svelte';
import DemoCodeTab from '$lib/components/docs/preview/DemoCodeTab.svelte';
import ReplayButton from '$lib/components/docs/preview/ReplayButton.svelte';
import TextPressure from '$lib/components/library/TextAnimations/TextPressure/TextPressure.svelte';
import source from '$lib/components/library/TextAnimations/TextPressure/TextPressure.svelte?raw';

var root = $.from_html(`<div class="demo-container relative w-full overflow-hidden" style="height:400px;max-height:450px;display:flex;align-items:center;justify-content:center;"><!> <div style="width:100%;height:100%;"><!></div></div>`);
var root_1 = $.from_html(`<!> <!> <!> <!> <!> <!> <!> <!> <!>`, 1);
var root_2 = $.from_html(`<h1 class="sub-category">Text Pressure</h1> <!>`, 1);

export default function TextPressureDemo($$anchor) {
	const DEFAULTS = {
		text: 'Hello!',
		flex: true,
		alpha: false,
		stroke: false,
		width: true,
		weight: true,
		italic: true,
		textColor: '#ffffff',
		strokeColor: '#5227FF'
	};

	let text = $.state($.proxy(DEFAULTS.text));
	let flex = $.state($.proxy(DEFAULTS.flex));
	let alpha = $.state($.proxy(DEFAULTS.alpha));
	let stroke = $.state($.proxy(DEFAULTS.stroke));
	let width = $.state($.proxy(DEFAULTS.width));
	let weight = $.state($.proxy(DEFAULTS.weight));
	let italic = $.state($.proxy(DEFAULTS.italic));
	let textColor = $.state($.proxy(DEFAULTS.textColor));
	let strokeColor = $.state($.proxy(DEFAULTS.strokeColor));
	let replay = $.state(0);
	const hasChanges = $.derived(() => $.get(text) !== DEFAULTS.text || $.get(flex) !== DEFAULTS.flex || $.get(alpha) !== DEFAULTS.alpha || $.get(stroke) !== DEFAULTS.stroke || $.get(width) !== DEFAULTS.width || $.get(weight) !== DEFAULTS.weight || $.get(italic) !== DEFAULTS.italic || $.get(textColor) !== DEFAULTS.textColor || $.get(strokeColor) !== DEFAULTS.strokeColor);

	function reset() {
		$.set(text, DEFAULTS.text, true);
		$.set(flex, DEFAULTS.flex, true);
		$.set(alpha, DEFAULTS.alpha, true);
		$.set(stroke, DEFAULTS.stroke, true);
		$.set(width, DEFAULTS.width, true);
		$.set(weight, DEFAULTS.weight, true);
		$.set(italic, DEFAULTS.italic, true);
		$.set(textColor, DEFAULTS.textColor, true);
		$.set(strokeColor, DEFAULTS.strokeColor, true);
		$.update(replay);
	}

	const usage = $.derived(() => `<TextPressure
  text="${$.get(text)}"
  flex={${$.get(flex)}}
  alpha={${$.get(alpha)}}
  stroke={${$.get(stroke)}}
  width={${$.get(width)}}
  weight={${$.get(weight)}}
  italic={${$.get(italic)}}
  textColor="${$.get(textColor)}"
  strokeColor="${$.get(strokeColor)}"
  minFontSize={36}
/>`);

	const props = [
		{
			name: 'text',
			type: 'string',
			default: '"Hello!"',
			description: 'Text content that will be displayed and animated.'
		},

		{
			name: 'fontFamily',
			type: 'string',
			default: '"Compressa VF"',
			description: 'Name of the variable font family.'
		},

		{
			name: 'fontUrl',
			type: 'string',
			default: 'CompressaPRO-GX.woff2',
			description: 'URL for the variable font file (needed).'
		},

		{
			name: 'flex',
			type: 'boolean',
			default: 'true',
			description: 'Whether the characters are spaced using flex layout.'
		},

		{
			name: 'scale',
			type: 'boolean',
			default: 'false',
			description: 'If true, vertically scales the text to fill its container height.'
		},

		{
			name: 'alpha',
			type: 'boolean',
			default: 'false',
			description: 'If true, applies an opacity effect based on cursor distance.'
		},

		{
			name: 'stroke',
			type: 'boolean',
			default: 'false',
			description: 'If true, adds a stroke effect around characters.'
		},

		{
			name: 'width',
			type: 'boolean',
			default: 'true',
			description: 'If true, varies the variable-font "width" axis.'
		},

		{
			name: 'weight',
			type: 'boolean',
			default: 'true',
			description: 'If true, varies the variable-font "weight" axis.'
		},

		{
			name: 'italic',
			type: 'boolean',
			default: 'true',
			description: 'If true, varies the variable-font "italics" axis.'
		},

		{
			name: 'textColor',
			type: 'string',
			default: '"#FFFFFF"',
			description: 'The fill color of the text.'
		},

		{
			name: 'strokeColor',
			type: 'string',
			default: '"#FF0000"',
			description: 'The stroke color applied when "stroke" is true.'
		},

		{
			name: 'class',
			type: 'string',
			default: '""',
			description: 'Additional class for styling the <h1> wrapper.'
		},

		{
			name: 'minFontSize',
			type: 'number',
			default: '24',
			description: 'Minimum font-size to avoid overly tiny text on smaller screens.'
		}
	];

	var fragment = root_2();

	$.head('1hjmzzy', ($$anchor) => {
		$.effect(() => {
			$.document.title = 'Text Pressure - svelte-bits';
		});
	});

	var node = $.sibling($.first_child(fragment), 2);

	{
		const preview = ($$anchor) => {
			var div = root();
			var node_1 = $.child(div);

			ReplayButton(node_1, { onClick: () => $.update(replay) });

			var div_1 = $.sibling(node_1, 2);
			var node_2 = $.child(div_1);

			$.key(node_2, () => $.get(replay), ($$anchor) => {
				TextPressure($$anchor, {
					get text() {
						return $.get(text);
					},

					get flex() {
						return $.get(flex);
					},

					get alpha() {
						return $.get(alpha);
					},

					get stroke() {
						return $.get(stroke);
					},

					get width() {
						return $.get(width);
					},

					get weight() {
						return $.get(weight);
					},

					get italic() {
						return $.get(italic);
					},

					get textColor() {
						return $.get(textColor);
					},

					get strokeColor() {
						return $.get(strokeColor);
					},
					minFontSize: 36
				});
			});

			$.reset(div_1);
			$.reset(div);
			$.append($$anchor, div);
		};

		const code = ($$anchor) => {
			DemoCodeTab($$anchor, {
				slug: 'text-pressure',
				get usage() {
					return $.get(usage);
				},

				get source() {
					return source;
				}
			});
		};

		const customize = ($$anchor) => {
			Customize($$anchor, {
				children: ($$anchor, $$slotProps) => {
					var fragment_4 = root_1();
					var node_3 = $.first_child(fragment_4);

					PreviewColorPicker(node_3, {
						title: 'Text Color',
						get value() {
							return $.get(textColor);
						},

						onChange: (v) => {
							$.set(textColor, v, true);
							$.update(replay);
						}
					});

					var node_4 = $.sibling(node_3, 2);

					PreviewColorPicker(node_4, {
						title: 'Stroke Color',
						get value() {
							return $.get(strokeColor);
						},

						onChange: (v) => {
							$.set(strokeColor, v, true);
							$.update(replay);
						}
					});

					var node_5 = $.sibling(node_4, 2);

					PreviewInput(node_5, {
						title: 'Text',
						get value() {
							return $.get(text);
						},
						placeholder: 'Your text here...',
						maxlength: 10,
						onChange: (v) => {
							$.set(text, v, true);
						}
					});

					var node_6 = $.sibling(node_5, 2);

					PreviewSwitch(node_6, {
						title: 'Flex',
						get checked() {
							return $.get(flex);
						},

						onChange: (v) => {
							$.set(flex, v, true);
							$.update(replay);
						}
					});

					var node_7 = $.sibling(node_6, 2);

					PreviewSwitch(node_7, {
						title: 'Alpha',
						get checked() {
							return $.get(alpha);
						},

						onChange: (v) => {
							$.set(alpha, v, true);
							$.update(replay);
						}
					});

					var node_8 = $.sibling(node_7, 2);

					PreviewSwitch(node_8, {
						title: 'Stroke',
						get checked() {
							return $.get(stroke);
						},

						onChange: (v) => {
							$.set(stroke, v, true);
							$.update(replay);
						}
					});

					var node_9 = $.sibling(node_8, 2);

					PreviewSwitch(node_9, {
						title: 'Width',
						get checked() {
							return $.get(width);
						},

						onChange: (v) => {
							$.set(width, v, true);
							$.update(replay);
						}
					});

					var node_10 = $.sibling(node_9, 2);

					PreviewSwitch(node_10, {
						title: 'Weight',
						get checked() {
							return $.get(weight);
						},

						onChange: (v) => {
							$.set(weight, v, true);
							$.update(replay);
						}
					});

					var node_11 = $.sibling(node_10, 2);

					PreviewSwitch(node_11, {
						title: 'Italic',
						get checked() {
							return $.get(italic);
						},

						onChange: (v) => {
							$.set(italic, v, true);
							$.update(replay);
						}
					});

					$.append($$anchor, fragment_4);
				},
				$$slots: { default: true }
			});
		};

		const propTable = ($$anchor) => {
			PropTable($$anchor, {
				get rows() {
					return props;
				}
			});
		};

		TabsLayout(node, {
			onreset: reset,
			get hasChanges() {
				return $.get(hasChanges);
			},
			componentName: 'TextPressure',
			get usage() {
				return $.get(usage);
			},

			get source() {
				return source;
			},

			get props() {
				return props;
			},
			preview,
			code,
			customize,
			propTable,
			$$slots: { preview: true, code: true, customize: true, propTable: true }
		});
	}

	$.append($$anchor, fragment);
}