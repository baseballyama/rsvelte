import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
import Customize from '$lib/components/docs/preview/Customize.svelte';
import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
import PreviewColorPicker from '$lib/components/docs/preview/PreviewColorPicker.svelte';
import PreviewSwitch from '$lib/components/docs/preview/PreviewSwitch.svelte';
import PropTable from '$lib/components/docs/preview/PropTable.svelte';
import DemoCodeTab from '$lib/components/docs/preview/DemoCodeTab.svelte';
import BackgroundContentToggle from '$lib/components/docs/preview/BackgroundContentToggle.svelte';
import Balatro from '$lib/components/library/Backgrounds/Balatro/Balatro.svelte';
import source from '$lib/components/library/Backgrounds/Balatro/Balatro.svelte?raw';

var root = $.from_html(`<div class="relative h-[500px] w-full overflow-hidden rounded-[14px]"><!> <!></div>`);
var root_1 = $.from_html(`<!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!>`, 1);
var root_2 = $.from_html(`<h1 class="sub-category">Balatro</h1> <!>`, 1);

export default function BalatroDemo($$anchor) {
	const DEFAULTS = {
		spinRotation: -2.0,
		spinSpeed: 7.0,
		color1: '#FF3E00',
		color2: '#FF8A4C',
		color3: '#14110E',
		contrast: 3.5,
		lighting: 0.4,
		spinAmount: 0.25,
		pixelFilter: 745,
		spinEase: 1.0,
		isRotate: false,
		mouseInteraction: true
	};

	let spinRotation = $.state($.proxy(DEFAULTS.spinRotation));
	let spinSpeed = $.state($.proxy(DEFAULTS.spinSpeed));
	let color1 = $.state($.proxy(DEFAULTS.color1));
	let color2 = $.state($.proxy(DEFAULTS.color2));
	let color3 = $.state($.proxy(DEFAULTS.color3));
	let contrast = $.state($.proxy(DEFAULTS.contrast));
	let lighting = $.state($.proxy(DEFAULTS.lighting));
	let spinAmount = $.state($.proxy(DEFAULTS.spinAmount));
	let pixelFilter = $.state($.proxy(DEFAULTS.pixelFilter));
	let spinEase = $.state($.proxy(DEFAULTS.spinEase));
	let isRotate = $.state($.proxy(DEFAULTS.isRotate));
	let mouseInteraction = $.state($.proxy(DEFAULTS.mouseInteraction));
	let showContent = $.state(true);
	const scriptOpen = '<' + 'script lang="ts">';
	const scriptClose = '</' + 'script>';
	const hasChanges = $.derived(() => $.get(spinRotation) !== DEFAULTS.spinRotation || $.get(spinSpeed) !== DEFAULTS.spinSpeed || $.get(color1) !== DEFAULTS.color1 || $.get(color2) !== DEFAULTS.color2 || $.get(color3) !== DEFAULTS.color3 || $.get(contrast) !== DEFAULTS.contrast || $.get(lighting) !== DEFAULTS.lighting || $.get(spinAmount) !== DEFAULTS.spinAmount || $.get(pixelFilter) !== DEFAULTS.pixelFilter || $.get(spinEase) !== DEFAULTS.spinEase || $.get(isRotate) !== DEFAULTS.isRotate || $.get(mouseInteraction) !== DEFAULTS.mouseInteraction);

	function reset() {
		$.set(spinRotation, DEFAULTS.spinRotation, true);
		$.set(spinSpeed, DEFAULTS.spinSpeed, true);
		$.set(color1, DEFAULTS.color1, true);
		$.set(color2, DEFAULTS.color2, true);
		$.set(color3, DEFAULTS.color3, true);
		$.set(contrast, DEFAULTS.contrast, true);
		$.set(lighting, DEFAULTS.lighting, true);
		$.set(spinAmount, DEFAULTS.spinAmount, true);
		$.set(pixelFilter, DEFAULTS.pixelFilter, true);
		$.set(spinEase, DEFAULTS.spinEase, true);
		$.set(isRotate, DEFAULTS.isRotate, true);
		$.set(mouseInteraction, DEFAULTS.mouseInteraction, true);
	}

	const usage = $.derived(() => `${scriptOpen}
  import Balatro from '$lib/components/Balatro.svelte';
${scriptClose}

<div style="width: 100%; height: 500px; position: relative;">
  <Balatro
    isRotate={${$.get(isRotate)}}
    mouseInteraction={${$.get(mouseInteraction)}}
    pixelFilter={${$.get(pixelFilter)}}
    color1="${$.get(color1)}"
    color2="${$.get(color2)}"
    color3="${$.get(color3)}"
  />
</div>`);

	const props = [
		{
			name: 'spinRotation',
			type: 'number',
			default: '-2.0',
			description: 'Base spin rotation factor.'
		},

		{
			name: 'spinSpeed',
			type: 'number',
			default: '7.0',
			description: 'Speed of the swirling animation.'
		},

		{
			name: 'offset',
			type: '[number, number]',
			default: '[0, 0]',
			description: 'Pattern offset.'
		},

		{
			name: 'color1',
			type: 'string',
			default: '"#DE443B"',
			description: 'Primary paint color.'
		},

		{
			name: 'color2',
			type: 'string',
			default: '"#006BB4"',
			description: 'Secondary paint color.'
		},

		{
			name: 'color3',
			type: 'string',
			default: '"#162325"',
			description: 'Background paint color.'
		},

		{
			name: 'contrast',
			type: 'number',
			default: '3.5',
			description: 'Contrast between paint blobs.'
		},

		{
			name: 'lighting',
			type: 'number',
			default: '0.4',
			description: 'Highlight strength.'
		},

		{
			name: 'spinAmount',
			type: 'number',
			default: '0.25',
			description: 'Strength of the spin warp.'
		},

		{
			name: 'pixelFilter',
			type: 'number',
			default: '745',
			description: 'Pixelation factor (higher = finer).'
		},

		{
			name: 'spinEase',
			type: 'number',
			default: '1.0',
			description: 'Easing factor for the spin.'
		},

		{
			name: 'isRotate',
			type: 'boolean',
			default: 'false',
			description: 'Continuously rotate over time.'
		},

		{
			name: 'mouseInteraction',
			type: 'boolean',
			default: 'true',
			description: 'React to pointer movement.'
		}
	];

	var fragment = root_2();

	$.head('1qxdhz3', ($$anchor) => {
		$.effect(() => {
			$.document.title = 'Balatro - svelte-bits';
		});
	});

	var node = $.sibling($.first_child(fragment), 2);

	{
		const preview = ($$anchor) => {
			var div = root();
			var node_1 = $.child(div);

			Balatro(node_1, {
				get spinRotation() {
					return $.get(spinRotation);
				},

				get spinSpeed() {
					return $.get(spinSpeed);
				},

				get color1() {
					return $.get(color1);
				},

				get color2() {
					return $.get(color2);
				},

				get color3() {
					return $.get(color3);
				},

				get contrast() {
					return $.get(contrast);
				},

				get lighting() {
					return $.get(lighting);
				},

				get spinAmount() {
					return $.get(spinAmount);
				},

				get pixelFilter() {
					return $.get(pixelFilter);
				},

				get spinEase() {
					return $.get(spinEase);
				},

				get isRotate() {
					return $.get(isRotate);
				},

				get mouseInteraction() {
					return $.get(mouseInteraction);
				}
			});

			var node_2 = $.sibling(node_1, 2);

			BackgroundContentToggle(node_2, {
				get showContent() {
					return $.get(showContent);
				},
				onToggle: (v) => $.set(showContent, v, true)
			});

			$.reset(div);
			$.append($$anchor, div);
		};

		const code = ($$anchor) => {
			DemoCodeTab($$anchor, {
				slug: 'balatro',
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
					var fragment_3 = root_1();
					var node_3 = $.first_child(fragment_3);

					PreviewColorPicker(node_3, {
						title: 'Color 1',
						get value() {
							return $.get(color1);
						},
						onChange: (v) => $.set(color1, v, true)
					});

					var node_4 = $.sibling(node_3, 2);

					PreviewColorPicker(node_4, {
						title: 'Color 2',
						get value() {
							return $.get(color2);
						},
						onChange: (v) => $.set(color2, v, true)
					});

					var node_5 = $.sibling(node_4, 2);

					PreviewColorPicker(node_5, {
						title: 'Color 3',
						get value() {
							return $.get(color3);
						},
						onChange: (v) => $.set(color3, v, true)
					});

					var node_6 = $.sibling(node_5, 2);

					PreviewSlider(node_6, {
						title: 'Spin Rotation',
						min: -10,
						max: 10,
						step: 0.1,
						get value() {
							return $.get(spinRotation);
						},
						onChange: (v) => $.set(spinRotation, v, true)
					});

					var node_7 = $.sibling(node_6, 2);

					PreviewSlider(node_7, {
						title: 'Spin Speed',
						min: 0,
						max: 20,
						step: 0.1,
						get value() {
							return $.get(spinSpeed);
						},
						onChange: (v) => $.set(spinSpeed, v, true)
					});

					var node_8 = $.sibling(node_7, 2);

					PreviewSlider(node_8, {
						title: 'Contrast',
						min: 0.1,
						max: 10,
						step: 0.1,
						get value() {
							return $.get(contrast);
						},
						onChange: (v) => $.set(contrast, v, true)
					});

					var node_9 = $.sibling(node_8, 2);

					PreviewSlider(node_9, {
						title: 'Lighting',
						min: 0,
						max: 2,
						step: 0.05,
						get value() {
							return $.get(lighting);
						},
						onChange: (v) => $.set(lighting, v, true)
					});

					var node_10 = $.sibling(node_9, 2);

					PreviewSlider(node_10, {
						title: 'Spin Amount',
						min: 0,
						max: 1,
						step: 0.01,
						get value() {
							return $.get(spinAmount);
						},
						onChange: (v) => $.set(spinAmount, v, true)
					});

					var node_11 = $.sibling(node_10, 2);

					PreviewSlider(node_11, {
						title: 'Pixel Filter',
						min: 50,
						max: 2000,
						step: 1,
						get value() {
							return $.get(pixelFilter);
						},
						onChange: (v) => $.set(pixelFilter, v, true)
					});

					var node_12 = $.sibling(node_11, 2);

					PreviewSlider(node_12, {
						title: 'Spin Ease',
						min: 0,
						max: 5,
						step: 0.05,
						get value() {
							return $.get(spinEase);
						},
						onChange: (v) => $.set(spinEase, v, true)
					});

					var node_13 = $.sibling(node_12, 2);

					PreviewSwitch(node_13, {
						title: 'Rotate Over Time',
						get checked() {
							return $.get(isRotate);
						},
						onChange: (v) => $.set(isRotate, v, true)
					});

					var node_14 = $.sibling(node_13, 2);

					PreviewSwitch(node_14, {
						title: 'Mouse Interaction',
						get checked() {
							return $.get(mouseInteraction);
						},
						onChange: (v) => $.set(mouseInteraction, v, true)
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
			componentName: 'Balatro',
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