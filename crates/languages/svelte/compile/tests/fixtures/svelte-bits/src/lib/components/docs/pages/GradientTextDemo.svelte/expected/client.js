import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
import Customize from '$lib/components/docs/preview/Customize.svelte';
import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
import PreviewSwitch from '$lib/components/docs/preview/PreviewSwitch.svelte';
import PreviewSelect from '$lib/components/docs/preview/PreviewSelect.svelte';
import PropTable from '$lib/components/docs/preview/PropTable.svelte';
import DemoCodeTab from '$lib/components/docs/preview/DemoCodeTab.svelte';
import GradientText from '$lib/components/library/TextAnimations/GradientText/GradientText.svelte';
import gradientTextSource from '$lib/components/library/TextAnimations/GradientText/GradientText.svelte?raw';

var root = $.from_html(`<div style="position:relative;min-height:400px;font-size:48px;font-weight:700;display:flex;align-items:center;justify-content:center;width:100%;"><!></div>`);
var root_1 = $.from_html(`<!> <!> <!> <!> <!>`, 1);
var root_2 = $.from_html(`<h1 class="sub-category">Gradient Text</h1> <!>`, 1);

export default function GradientTextDemo($$anchor) {
	const DEFAULTS = {
		colors: ['#FF3E00', '#FF8A4C', '#FFB089'],
		animationSpeed: 8,
		showBorder: false,
		direction: 'horizontal',
		pauseOnHover: false,
		yoyo: true
	};

	let animationSpeed = $.state($.proxy(DEFAULTS.animationSpeed));
	let showBorder = $.state($.proxy(DEFAULTS.showBorder));
	let direction = $.state($.proxy(DEFAULTS.direction));
	let pauseOnHover = $.state($.proxy(DEFAULTS.pauseOnHover));
	let yoyo = $.state($.proxy(DEFAULTS.yoyo));
	const hasChanges = $.derived(() => $.get(animationSpeed) !== DEFAULTS.animationSpeed || $.get(showBorder) !== DEFAULTS.showBorder || $.get(direction) !== DEFAULTS.direction || $.get(pauseOnHover) !== DEFAULTS.pauseOnHover || $.get(yoyo) !== DEFAULTS.yoyo);

	function reset() {
		$.set(animationSpeed, DEFAULTS.animationSpeed, true);
		$.set(showBorder, DEFAULTS.showBorder, true);
		$.set(direction, DEFAULTS.direction, true);
		$.set(pauseOnHover, DEFAULTS.pauseOnHover, true);
		$.set(yoyo, DEFAULTS.yoyo, true);
	}

	const usage = $.derived(() => `${'<' + 'script lang="ts">'}
  import GradientText from '$lib/components/GradientText.svelte';
${'</' + 'script>'}

<GradientText
  colors={["#FF3E00", "#FF8A4C", "#FFB089"]}
  animationSpeed={${$.get(animationSpeed)}}
  showBorder={${$.get(showBorder)}}
  direction="${$.get(direction)}"
  pauseOnHover={${$.get(pauseOnHover)}}
  yoyo={${$.get(yoyo)}}
>
  Add a splash of color!
</GradientText>`);

	const props = [
		{
			name: 'children',
			type: 'Snippet',
			default: '-',
			description: 'Content to render with the gradient.'
		},

		{
			name: 'colors',
			type: 'string[]',
			default: '["#FF3E00","#FF8A4C","#FFB089"]',
			description: 'Gradient color stops; first color is duplicated at the end for seamless looping.'
		},

		{
			name: 'animationSpeed',
			type: 'number',
			default: '8',
			description: 'Duration (seconds) of one animation cycle.'
		},

		{
			name: 'showBorder',
			type: 'boolean',
			default: 'false',
			description: 'Renders an animated gradient border around the content.'
		},

		{
			name: 'direction',
			type: "'horizontal' | 'vertical' | 'diagonal'",
			default: '"horizontal"',
			description: 'Axis along which the gradient travels.'
		},

		{
			name: 'pauseOnHover',
			type: 'boolean',
			default: 'false',
			description: 'Pauses the animation while hovered.'
		},

		{
			name: 'yoyo',
			type: 'boolean',
			default: 'true',
			description: 'Reverse direction on each cycle instead of seamless loop.'
		},

		{
			name: 'class',
			type: 'string',
			default: '""',
			description: 'Extra classes for the wrapper.'
		}
	];

	var fragment = root_2();

	$.head('pfyj9p', ($$anchor) => {
		$.effect(() => {
			$.document.title = 'Gradient Text - svelte-bits';
		});
	});

	var node = $.sibling($.first_child(fragment), 2);

	{
		const preview = ($$anchor) => {
			var div = root();
			var node_1 = $.child(div);

			GradientText(node_1, {
				get colors() {
					return DEFAULTS.colors;
				},

				get animationSpeed() {
					return $.get(animationSpeed);
				},

				get showBorder() {
					return $.get(showBorder);
				},

				get direction() {
					return $.get(direction);
				},

				get pauseOnHover() {
					return $.get(pauseOnHover);
				},

				get yoyo() {
					return $.get(yoyo);
				},

				children: ($$anchor, $$slotProps) => {
					$.next();

					var text = $.text('Add a splash of color!');

					$.append($$anchor, text);
				},
				$$slots: { default: true }
			});

			$.reset(div);
			$.append($$anchor, div);
		};

		const code = ($$anchor) => {
			DemoCodeTab($$anchor, {
				slug: 'gradient-text',
				get usage() {
					return $.get(usage);
				},

				get source() {
					return gradientTextSource;
				}
			});
		};

		const customize = ($$anchor) => {
			Customize($$anchor, {
				children: ($$anchor, $$slotProps) => {
					var fragment_3 = root_1();
					var node_2 = $.first_child(fragment_3);

					PreviewSlider(node_2, {
						title: 'Animation Speed',
						min: 1,
						max: 20,
						step: 0.5,
						get value() {
							return $.get(animationSpeed);
						},
						valueUnit: 's',
						onChange: (v) => $.set(animationSpeed, v, true)
					});

					var node_3 = $.sibling(node_2, 2);

					PreviewSelect(node_3, {
						title: 'Direction',
						options: [
							{ label: 'Horizontal', value: 'horizontal' },
							{ label: 'Vertical', value: 'vertical' },
							{ label: 'Diagonal', value: 'diagonal' }
						],

						get value() {
							return $.get(direction);
						},
						onChange: (v) => $.set(direction, v, true)
					});

					var node_4 = $.sibling(node_3, 2);

					PreviewSwitch(node_4, {
						title: 'Show Border',
						get checked() {
							return $.get(showBorder);
						},
						onChange: (v) => $.set(showBorder, v, true)
					});

					var node_5 = $.sibling(node_4, 2);

					PreviewSwitch(node_5, {
						title: 'Yoyo',
						get checked() {
							return $.get(yoyo);
						},
						onChange: (v) => $.set(yoyo, v, true)
					});

					var node_6 = $.sibling(node_5, 2);

					PreviewSwitch(node_6, {
						title: 'Pause on Hover',
						get checked() {
							return $.get(pauseOnHover);
						},
						onChange: (v) => $.set(pauseOnHover, v, true)
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
			componentName: 'GradientText',
			get usage() {
				return $.get(usage);
			},

			get source() {
				return gradientTextSource;
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