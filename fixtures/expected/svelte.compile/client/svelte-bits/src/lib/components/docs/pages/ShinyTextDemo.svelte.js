import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
import Customize from '$lib/components/docs/preview/Customize.svelte';
import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
import PreviewSwitch from '$lib/components/docs/preview/PreviewSwitch.svelte';
import PreviewSelect from '$lib/components/docs/preview/PreviewSelect.svelte';
import PreviewColorPicker from '$lib/components/docs/preview/PreviewColorPicker.svelte';
import PropTable from '$lib/components/docs/preview/PropTable.svelte';
import DemoCodeTab from '$lib/components/docs/preview/DemoCodeTab.svelte';
import ShinyText from '$lib/components/library/TextAnimations/ShinyText/ShinyText.svelte';
import shinyTextSource from '$lib/components/library/TextAnimations/ShinyText/ShinyText.svelte?raw';

var root = $.from_html(`<div style="position:relative;min-height:400px;font-size:32px;font-weight:600;display:flex;align-items:center;justify-content:center;width:100%;"><!></div>`);
var root_1 = $.from_html(`<!> <!> <!> <!> <!> <!> <!> <!> <!>`, 1);
var root_2 = $.from_html(`<h1 class="sub-category">Shiny Text</h1> <!>`, 1);

export default function ShinyTextDemo($$anchor) {
	const DEFAULTS = {
		speed: 2,
		delay: 0,
		color: '#b5b5b5',
		shineColor: '#ffffff',
		spread: 120,
		direction: 'left',
		yoyo: false,
		pauseOnHover: false,
		disabled: false
	};

	let speed = $.state($.proxy(DEFAULTS.speed));
	let delay = $.state($.proxy(DEFAULTS.delay));
	let color = $.state($.proxy(DEFAULTS.color));
	let shineColor = $.state($.proxy(DEFAULTS.shineColor));
	let spread = $.state($.proxy(DEFAULTS.spread));
	let direction = $.state($.proxy(DEFAULTS.direction));
	let yoyo = $.state($.proxy(DEFAULTS.yoyo));
	let pauseOnHover = $.state($.proxy(DEFAULTS.pauseOnHover));
	let disabled = $.state($.proxy(DEFAULTS.disabled));
	const hasChanges = $.derived(() => $.get(speed) !== DEFAULTS.speed || $.get(delay) !== DEFAULTS.delay || $.get(color) !== DEFAULTS.color || $.get(shineColor) !== DEFAULTS.shineColor || $.get(spread) !== DEFAULTS.spread || $.get(direction) !== DEFAULTS.direction || $.get(yoyo) !== DEFAULTS.yoyo || $.get(pauseOnHover) !== DEFAULTS.pauseOnHover || $.get(disabled) !== DEFAULTS.disabled);

	function reset() {
		$.set(speed, DEFAULTS.speed, true);
		$.set(delay, DEFAULTS.delay, true);
		$.set(color, DEFAULTS.color, true);
		$.set(shineColor, DEFAULTS.shineColor, true);
		$.set(spread, DEFAULTS.spread, true);
		$.set(direction, DEFAULTS.direction, true);
		$.set(yoyo, DEFAULTS.yoyo, true);
		$.set(pauseOnHover, DEFAULTS.pauseOnHover, true);
		$.set(disabled, DEFAULTS.disabled, true);
	}

	const scriptOpen = '<' + 'script lang="ts">';
	const scriptClose = '</' + 'script>';

	const usage = $.derived(() => `${scriptOpen}
  import ShinyText from '$lib/components/ShinyText.svelte';
${scriptClose}

<ShinyText
  text="✨ Shiny Text Effect"
  speed={${$.get(speed)}}
  delay={${$.get(delay)}}
  color="${$.get(color)}"
  shineColor="${$.get(shineColor)}"
  spread={${$.get(spread)}}
  direction="${$.get(direction)}"
  yoyo={${$.get(yoyo)}}
  pauseOnHover={${$.get(pauseOnHover)}}
  disabled={${$.get(disabled)}}
/>`);

	const props = [
		{
			name: 'text',
			type: 'string',
			default: '-',
			description: 'The text to display with the shine effect.'
		},

		{
			name: 'color',
			type: 'string',
			default: '"#b5b5b5"',
			description: 'Base color of the text.'
		},

		{
			name: 'shineColor',
			type: 'string',
			default: '"#ffffff"',
			description: 'Color of the shine/highlight.'
		},

		{
			name: 'speed',
			type: 'number',
			default: '2',
			description: 'Duration of one animation cycle (seconds).'
		},

		{
			name: 'delay',
			type: 'number',
			default: '0',
			description: 'Pause between cycles (seconds).'
		},

		{
			name: 'spread',
			type: 'number',
			default: '120',
			description: 'Gradient spread angle in degrees.'
		},

		{
			name: 'yoyo',
			type: 'boolean',
			default: 'false',
			description: 'Reverses direction each cycle instead of looping.'
		},

		{
			name: 'pauseOnHover',
			type: 'boolean',
			default: 'false',
			description: 'Pauses the animation on hover.'
		},

		{
			name: "direction",
			type: "'left' | 'right'",
			default: '"left"',
			description: 'Direction the shine travels.'
		},

		{
			name: 'disabled',
			type: 'boolean',
			default: 'false',
			description: 'Disables the effect.'
		},

		{
			name: 'class',
			type: 'string',
			default: '""',
			description: 'Extra classes for the root span.'
		}
	];

	var fragment = root_2();

	$.head('1tirg4k', ($$anchor) => {
		$.effect(() => {
			$.document.title = 'Shiny Text - svelte-bits';
		});
	});

	var node = $.sibling($.first_child(fragment), 2);

	{
		const preview = ($$anchor) => {
			var div = root();
			var node_1 = $.child(div);

			ShinyText(node_1, {
				text: '✨ Shiny Text Effect',
				get speed() {
					return $.get(speed);
				},

				get delay() {
					return $.get(delay);
				},

				get color() {
					return $.get(color);
				},

				get shineColor() {
					return $.get(shineColor);
				},

				get spread() {
					return $.get(spread);
				},

				get direction() {
					return $.get(direction);
				},

				get yoyo() {
					return $.get(yoyo);
				},

				get pauseOnHover() {
					return $.get(pauseOnHover);
				},

				get disabled() {
					return $.get(disabled);
				}
			});

			$.reset(div);
			$.append($$anchor, div);
		};

		const code = ($$anchor) => {
			DemoCodeTab($$anchor, {
				slug: 'shiny-text',
				get usage() {
					return $.get(usage);
				},

				get source() {
					return shinyTextSource;
				}
			});
		};

		const customize = ($$anchor) => {
			Customize($$anchor, {
				children: ($$anchor, $$slotProps) => {
					var fragment_3 = root_1();
					var node_2 = $.first_child(fragment_3);

					PreviewColorPicker(node_2, {
						title: 'Text Color',
						get value() {
							return $.get(color);
						},
						onChange: (v) => $.set(color, v, true)
					});

					var node_3 = $.sibling(node_2, 2);

					PreviewColorPicker(node_3, {
						title: 'Shine Color',
						get value() {
							return $.get(shineColor);
						},
						onChange: (v) => $.set(shineColor, v, true)
					});

					var node_4 = $.sibling(node_3, 2);

					PreviewSlider(node_4, {
						title: 'Speed',
						min: 0.5,
						max: 5,
						step: 0.1,
						get value() {
							return $.get(speed);
						},
						valueUnit: 's',
						onChange: (v) => $.set(speed, v, true)
					});

					var node_5 = $.sibling(node_4, 2);

					PreviewSlider(node_5, {
						title: 'Delay',
						min: 0,
						max: 3,
						step: 0.1,
						get value() {
							return $.get(delay);
						},
						valueUnit: 's',
						onChange: (v) => $.set(delay, v, true)
					});

					var node_6 = $.sibling(node_5, 2);

					PreviewSlider(node_6, {
						title: 'Spread',
						min: 0,
						max: 180,
						step: 5,
						get value() {
							return $.get(spread);
						},
						valueUnit: '°',
						onChange: (v) => $.set(spread, v, true)
					});

					var node_7 = $.sibling(node_6, 2);

					PreviewSelect(node_7, {
						title: 'Direction',
						options: [
							{ label: 'Left', value: 'left' },
							{ label: 'Right', value: 'right' }
						],

						get value() {
							return $.get(direction);
						},
						onChange: (v) => $.set(direction, v, true)
					});

					var node_8 = $.sibling(node_7, 2);

					PreviewSwitch(node_8, {
						title: 'Yoyo Mode',
						get checked() {
							return $.get(yoyo);
						},
						onChange: (v) => $.set(yoyo, v, true)
					});

					var node_9 = $.sibling(node_8, 2);

					PreviewSwitch(node_9, {
						title: 'Pause on Hover',
						get checked() {
							return $.get(pauseOnHover);
						},
						onChange: (v) => $.set(pauseOnHover, v, true)
					});

					var node_10 = $.sibling(node_9, 2);

					PreviewSwitch(node_10, {
						title: 'Disabled',
						get checked() {
							return $.get(disabled);
						},
						onChange: (v) => $.set(disabled, v, true)
					});

					$.append($$anchor, fragment_3);
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
			componentName: 'ShinyText',
			get usage() {
				return $.get(usage);
			},

			get source() {
				return shinyTextSource;
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