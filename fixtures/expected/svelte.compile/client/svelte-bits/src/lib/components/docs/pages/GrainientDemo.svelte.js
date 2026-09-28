import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
import Customize from '$lib/components/docs/preview/Customize.svelte';
import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
import PreviewSwitch from '$lib/components/docs/preview/PreviewSwitch.svelte';
import PreviewColorPicker from '$lib/components/docs/preview/PreviewColorPicker.svelte';
import PropTable from '$lib/components/docs/preview/PropTable.svelte';
import DemoCodeTab from '$lib/components/docs/preview/DemoCodeTab.svelte';
import BackgroundContentToggle from '$lib/components/docs/preview/BackgroundContentToggle.svelte';
import Grainient from '$lib/components/library/Backgrounds/Grainient/Grainient.svelte';
import source from '$lib/components/library/Backgrounds/Grainient/Grainient.svelte?raw';

var root = $.from_html(`<div class="relative h-[500px] w-full overflow-hidden rounded-[14px]"><!> <!></div>`);
var root_1 = $.from_html(`<!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!>`, 1);
var root_2 = $.from_html(`<h1 class="sub-category">Grainient</h1> <!>`, 1);

export default function GrainientDemo($$anchor) {
	const D = {
		timeSpeed: 0.25,
		warpStrength: 1,
		warpFrequency: 5,
		warpSpeed: 2,
		grainAmount: 0.1,
		contrast: 1.5,
		saturation: 1,
		zoom: 0.9,
		grainAnimated: false,
		color1: '#FFB089',
		color2: '#ff8a3d',
		color3: '#FF3E00'
	};

	let timeSpeed = $.state($.proxy(D.timeSpeed));
	let warpStrength = $.state($.proxy(D.warpStrength));
	let warpFrequency = $.state($.proxy(D.warpFrequency));
	let warpSpeed = $.state($.proxy(D.warpSpeed));
	let grainAmount = $.state($.proxy(D.grainAmount));
	let contrast = $.state($.proxy(D.contrast));
	let saturation = $.state($.proxy(D.saturation));
	let zoom = $.state($.proxy(D.zoom));
	let grainAnimated = $.state($.proxy(D.grainAnimated));
	let color1 = $.state($.proxy(D.color1));
	let color2 = $.state($.proxy(D.color2));
	let color3 = $.state($.proxy(D.color3));
	let showContent = $.state(true);
	const sO = '<' + 'script lang="ts">';
	const sC = '</' + 'script>';
	const hasChanges = $.derived(() => $.get(timeSpeed) !== D.timeSpeed || $.get(warpStrength) !== D.warpStrength || $.get(warpFrequency) !== D.warpFrequency || $.get(warpSpeed) !== D.warpSpeed || $.get(grainAmount) !== D.grainAmount || $.get(contrast) !== D.contrast || $.get(saturation) !== D.saturation || $.get(zoom) !== D.zoom || $.get(grainAnimated) !== D.grainAnimated || $.get(color1) !== D.color1 || $.get(color2) !== D.color2 || $.get(color3) !== D.color3);

	function reset() {
		$.set(timeSpeed, D.timeSpeed, true);
		$.set(warpStrength, D.warpStrength, true);
		$.set(warpFrequency, D.warpFrequency, true);
		$.set(warpSpeed, D.warpSpeed, true);
		$.set(grainAmount, D.grainAmount, true);
		$.set(contrast, D.contrast, true);
		$.set(saturation, D.saturation, true);
		$.set(zoom, D.zoom, true);
		$.set(grainAnimated, D.grainAnimated, true);
		$.set(color1, D.color1, true);
		$.set(color2, D.color2, true);
		$.set(color3, D.color3, true);
	}

	const usage = $.derived(() => `${sO}
  import Grainient from '$lib/components/Grainient.svelte';
${sC}

<div style="width: 100%; height: 600px; position: relative;">
  <Grainient color1="${$.get(color1)}" color2="${$.get(color2)}" color3="${$.get(color3)}" />
</div>`);

	const props = [
		{
			name: 'timeSpeed',
			type: 'number',
			default: '0.25',
			description: 'Animation time multiplier.'
		},

		{
			name: 'colorBalance',
			type: 'number',
			default: '0',
			description: 'Balance between color stops.'
		},

		{
			name: 'warpStrength',
			type: 'number',
			default: '1',
			description: 'Warp distortion strength.'
		},

		{
			name: 'warpFrequency',
			type: 'number',
			default: '5',
			description: 'Warp frequency.'
		},

		{
			name: 'warpSpeed',
			type: 'number',
			default: '2',
			description: 'Warp animation speed.'
		},

		{
			name: 'warpAmplitude',
			type: 'number',
			default: '50',
			description: 'Warp amplitude.'
		},

		{
			name: 'blendAngle',
			type: 'number',
			default: '0',
			description: 'Color blend angle.'
		},

		{
			name: 'blendSoftness',
			type: 'number',
			default: '0.05',
			description: 'Color blend softness.'
		},

		{
			name: 'rotationAmount',
			type: 'number',
			default: '500',
			description: 'Noise-driven rotation.'
		},

		{
			name: 'noiseScale',
			type: 'number',
			default: '2',
			description: 'Noise scale.'
		},

		{
			name: 'grainAmount',
			type: 'number',
			default: '0.1',
			description: 'Grain intensity.'
		},

		{
			name: 'grainScale',
			type: 'number',
			default: '2',
			description: 'Grain texture scale.'
		},

		{
			name: 'grainAnimated',
			type: 'boolean',
			default: 'false',
			description: 'Animate the grain.'
		},

		{
			name: 'contrast',
			type: 'number',
			default: '1.5',
			description: 'Contrast multiplier.'
		},

		{
			name: 'gamma',
			type: 'number',
			default: '1',
			description: 'Gamma correction.'
		},

		{
			name: 'saturation',
			type: 'number',
			default: '1',
			description: 'Color saturation.'
		},

		{
			name: 'centerX',
			type: 'number',
			default: '0',
			description: 'X center offset.'
		},

		{
			name: 'centerY',
			type: 'number',
			default: '0',
			description: 'Y center offset.'
		},

		{
			name: 'zoom',
			type: 'number',
			default: '0.9',
			description: 'Zoom factor.'
		},

		{
			name: 'color1',
			type: 'string',
			default: '"#FF9FFC"',
			description: 'First color stop.'
		},

		{
			name: 'color2',
			type: 'string',
			default: '"#FF8A4C"',
			description: 'Second color stop.'
		},

		{
			name: 'color3',
			type: 'string',
			default: '"#B497CF"',
			description: 'Third color stop.'
		}
	];

	var fragment = root_2();

	$.head('1g3g70l', ($$anchor) => {
		$.effect(() => {
			$.document.title = 'Grainient - svelte-bits';
		});
	});

	var node = $.sibling($.first_child(fragment), 2);

	{
		const preview = ($$anchor) => {
			var div = root();
			var node_1 = $.child(div);

			Grainient(node_1, {
				get timeSpeed() {
					return $.get(timeSpeed);
				},

				get warpStrength() {
					return $.get(warpStrength);
				},

				get warpFrequency() {
					return $.get(warpFrequency);
				},

				get warpSpeed() {
					return $.get(warpSpeed);
				},

				get grainAmount() {
					return $.get(grainAmount);
				},

				get contrast() {
					return $.get(contrast);
				},

				get saturation() {
					return $.get(saturation);
				},

				get zoom() {
					return $.get(zoom);
				},

				get grainAnimated() {
					return $.get(grainAnimated);
				},

				get color1() {
					return $.get(color1);
				},

				get color2() {
					return $.get(color2);
				},

				get color3() {
					return $.get(color3);
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
				slug: 'grainient',
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
						title: 'Time Speed',
						min: 0,
						max: 2,
						step: 0.05,
						get value() {
							return $.get(timeSpeed);
						},
						onChange: (v) => $.set(timeSpeed, v, true)
					});

					var node_7 = $.sibling(node_6, 2);

					PreviewSlider(node_7, {
						title: 'Warp Strength',
						min: 0,
						max: 3,
						step: 0.05,
						get value() {
							return $.get(warpStrength);
						},
						onChange: (v) => $.set(warpStrength, v, true)
					});

					var node_8 = $.sibling(node_7, 2);

					PreviewSlider(node_8, {
						title: 'Warp Frequency',
						min: 0,
						max: 20,
						step: 0.1,
						get value() {
							return $.get(warpFrequency);
						},
						onChange: (v) => $.set(warpFrequency, v, true)
					});

					var node_9 = $.sibling(node_8, 2);

					PreviewSlider(node_9, {
						title: 'Warp Speed',
						min: 0,
						max: 10,
						step: 0.1,
						get value() {
							return $.get(warpSpeed);
						},
						onChange: (v) => $.set(warpSpeed, v, true)
					});

					var node_10 = $.sibling(node_9, 2);

					PreviewSlider(node_10, {
						title: 'Grain Amount',
						min: 0,
						max: 0.5,
						step: 0.01,
						get value() {
							return $.get(grainAmount);
						},
						onChange: (v) => $.set(grainAmount, v, true)
					});

					var node_11 = $.sibling(node_10, 2);

					PreviewSlider(node_11, {
						title: 'Contrast',
						min: 0,
						max: 3,
						step: 0.05,
						get value() {
							return $.get(contrast);
						},
						onChange: (v) => $.set(contrast, v, true)
					});

					var node_12 = $.sibling(node_11, 2);

					PreviewSlider(node_12, {
						title: 'Saturation',
						min: 0,
						max: 3,
						step: 0.05,
						get value() {
							return $.get(saturation);
						},
						onChange: (v) => $.set(saturation, v, true)
					});

					var node_13 = $.sibling(node_12, 2);

					PreviewSlider(node_13, {
						title: 'Zoom',
						min: 0.1,
						max: 3,
						step: 0.05,
						get value() {
							return $.get(zoom);
						},
						onChange: (v) => $.set(zoom, v, true)
					});

					var node_14 = $.sibling(node_13, 2);

					PreviewSwitch(node_14, {
						title: 'Animate Grain',
						get checked() {
							return $.get(grainAnimated);
						},
						onChange: (v) => $.set(grainAnimated, v, true)
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
			componentName: 'Grainient',
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