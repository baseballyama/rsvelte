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
import LineWaves from '$lib/components/library/Backgrounds/LineWaves/LineWaves.svelte';
import source from '$lib/components/library/Backgrounds/LineWaves/LineWaves.svelte?raw';

var root = $.from_html(`<div class="relative h-[500px] w-full overflow-hidden rounded-[14px]"><!> <!></div>`);
var root_1 = $.from_html(`<!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!>`, 1);
var root_2 = $.from_html(`<h1 class="sub-category">Line Waves</h1> <!>`, 1);

export default function LineWavesDemo($$anchor) {
	const D = {
		speed: 0.3,
		innerLineCount: 32,
		outerLineCount: 36,
		warpIntensity: 1,
		rotation: -45,
		edgeFadeWidth: 0,
		colorCycleSpeed: 1,
		brightness: 0.2,
		color1: '#ffffff',
		color2: '#ff8a3d',
		color3: '#ffffff',
		enableMouseInteraction: true,
		mouseInfluence: 2
	};

	let speed = $.state($.proxy(D.speed));
	let innerLineCount = $.state($.proxy(D.innerLineCount));
	let outerLineCount = $.state($.proxy(D.outerLineCount));
	let warpIntensity = $.state($.proxy(D.warpIntensity));
	let rotation = $.state($.proxy(D.rotation));
	let edgeFadeWidth = $.state($.proxy(D.edgeFadeWidth));
	let colorCycleSpeed = $.state($.proxy(D.colorCycleSpeed));
	let brightness = $.state($.proxy(D.brightness));
	let color1 = $.state($.proxy(D.color1));
	let color2 = $.state($.proxy(D.color2));
	let color3 = $.state($.proxy(D.color3));
	let enableMouseInteraction = $.state($.proxy(D.enableMouseInteraction));
	let mouseInfluence = $.state($.proxy(D.mouseInfluence));
	let showContent = $.state(true);
	const sO = '<' + 'script lang="ts">';
	const sC = '</' + 'script>';
	const hasChanges = $.derived(() => $.get(speed) !== D.speed || $.get(innerLineCount) !== D.innerLineCount || $.get(outerLineCount) !== D.outerLineCount || $.get(warpIntensity) !== D.warpIntensity || $.get(rotation) !== D.rotation || $.get(edgeFadeWidth) !== D.edgeFadeWidth || $.get(colorCycleSpeed) !== D.colorCycleSpeed || $.get(brightness) !== D.brightness || $.get(color1) !== D.color1 || $.get(color2) !== D.color2 || $.get(color3) !== D.color3 || $.get(enableMouseInteraction) !== D.enableMouseInteraction || $.get(mouseInfluence) !== D.mouseInfluence);

	function reset() {
		$.set(speed, D.speed, true);
		$.set(innerLineCount, D.innerLineCount, true);
		$.set(outerLineCount, D.outerLineCount, true);
		$.set(warpIntensity, D.warpIntensity, true);
		$.set(rotation, D.rotation, true);
		$.set(edgeFadeWidth, D.edgeFadeWidth, true);
		$.set(colorCycleSpeed, D.colorCycleSpeed, true);
		$.set(brightness, D.brightness, true);
		$.set(color1, D.color1, true);
		$.set(color2, D.color2, true);
		$.set(color3, D.color3, true);
		$.set(enableMouseInteraction, D.enableMouseInteraction, true);
		$.set(mouseInfluence, D.mouseInfluence, true);
	}

	const usage = $.derived(() => `${sO}
  import LineWaves from '$lib/components/LineWaves.svelte';
${sC}

<div style="width: 100%; height: 600px; position: relative;">
  <LineWaves color1="${$.get(color1)}" color2="${$.get(color2)}" color3="${$.get(color3)}" />
</div>`);

	const props = [
		{
			name: 'speed',
			type: 'number',
			default: '0.3',
			description: 'Animation speed.'
		},

		{
			name: 'innerLineCount',
			type: 'number',
			default: '32',
			description: 'Inner area line count.'
		},

		{
			name: 'outerLineCount',
			type: 'number',
			default: '36',
			description: 'Outer area line count.'
		},

		{
			name: 'warpIntensity',
			type: 'number',
			default: '1',
			description: 'Warp intensity.'
		},

		{
			name: 'rotation',
			type: 'number',
			default: '-45',
			description: 'Rotation in degrees.'
		},

		{
			name: 'edgeFadeWidth',
			type: 'number',
			default: '0',
			description: 'Edge fade width.'
		},

		{
			name: 'colorCycleSpeed',
			type: 'number',
			default: '1',
			description: 'Color cycle speed.'
		},

		{
			name: 'brightness',
			type: 'number',
			default: '0.2',
			description: 'Overall brightness.'
		},

		{
			name: 'color1',
			type: 'string',
			default: '"#ffffff"',
			description: 'First color.'
		},

		{
			name: 'color2',
			type: 'string',
			default: '"#ffffff"',
			description: 'Second color.'
		},

		{
			name: 'color3',
			type: 'string',
			default: '"#ffffff"',
			description: 'Third color.'
		},

		{
			name: 'enableMouseInteraction',
			type: 'boolean',
			default: 'true',
			description: 'Mouse interaction.'
		},

		{
			name: 'mouseInfluence',
			type: 'number',
			default: '2',
			description: 'Mouse influence amount.'
		}
	];

	var fragment = root_2();

	$.head('1y9cqfo', ($$anchor) => {
		$.effect(() => {
			$.document.title = 'Line Waves - svelte-bits';
		});
	});

	var node = $.sibling($.first_child(fragment), 2);

	{
		const preview = ($$anchor) => {
			var div = root();
			var node_1 = $.child(div);

			LineWaves(node_1, {
				get speed() {
					return $.get(speed);
				},

				get innerLineCount() {
					return $.get(innerLineCount);
				},

				get outerLineCount() {
					return $.get(outerLineCount);
				},

				get warpIntensity() {
					return $.get(warpIntensity);
				},

				get rotation() {
					return $.get(rotation);
				},

				get edgeFadeWidth() {
					return $.get(edgeFadeWidth);
				},

				get colorCycleSpeed() {
					return $.get(colorCycleSpeed);
				},

				get brightness() {
					return $.get(brightness);
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

				get enableMouseInteraction() {
					return $.get(enableMouseInteraction);
				},

				get mouseInfluence() {
					return $.get(mouseInfluence);
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
				slug: 'line-waves',
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
						title: 'Speed',
						min: 0,
						max: 2,
						step: 0.05,
						get value() {
							return $.get(speed);
						},
						onChange: (v) => $.set(speed, v, true)
					});

					var node_7 = $.sibling(node_6, 2);

					PreviewSlider(node_7, {
						title: 'Inner Lines',
						min: 4,
						max: 128,
						step: 1,
						get value() {
							return $.get(innerLineCount);
						},
						onChange: (v) => $.set(innerLineCount, v, true)
					});

					var node_8 = $.sibling(node_7, 2);

					PreviewSlider(node_8, {
						title: 'Outer Lines',
						min: 4,
						max: 128,
						step: 1,
						get value() {
							return $.get(outerLineCount);
						},
						onChange: (v) => $.set(outerLineCount, v, true)
					});

					var node_9 = $.sibling(node_8, 2);

					PreviewSlider(node_9, {
						title: 'Warp Intensity',
						min: 0,
						max: 3,
						step: 0.05,
						get value() {
							return $.get(warpIntensity);
						},
						onChange: (v) => $.set(warpIntensity, v, true)
					});

					var node_10 = $.sibling(node_9, 2);

					PreviewSlider(node_10, {
						title: 'Rotation',
						min: -180,
						max: 180,
						step: 1,
						get value() {
							return $.get(rotation);
						},
						onChange: (v) => $.set(rotation, v, true)
					});

					var node_11 = $.sibling(node_10, 2);

					PreviewSlider(node_11, {
						title: 'Edge Fade Width',
						min: -1,
						max: 1,
						step: 0.05,
						get value() {
							return $.get(edgeFadeWidth);
						},
						onChange: (v) => $.set(edgeFadeWidth, v, true)
					});

					var node_12 = $.sibling(node_11, 2);

					PreviewSlider(node_12, {
						title: 'Color Cycle Speed',
						min: 0,
						max: 3,
						step: 0.05,
						get value() {
							return $.get(colorCycleSpeed);
						},
						onChange: (v) => $.set(colorCycleSpeed, v, true)
					});

					var node_13 = $.sibling(node_12, 2);

					PreviewSlider(node_13, {
						title: 'Brightness',
						min: 0,
						max: 2,
						step: 0.05,
						get value() {
							return $.get(brightness);
						},
						onChange: (v) => $.set(brightness, v, true)
					});

					var node_14 = $.sibling(node_13, 2);

					PreviewSlider(node_14, {
						title: 'Mouse Influence',
						min: 0,
						max: 5,
						step: 0.1,
						get value() {
							return $.get(mouseInfluence);
						},
						onChange: (v) => $.set(mouseInfluence, v, true)
					});

					var node_15 = $.sibling(node_14, 2);

					PreviewSwitch(node_15, {
						title: 'Mouse Interaction',
						get checked() {
							return $.get(enableMouseInteraction);
						},
						onChange: (v) => $.set(enableMouseInteraction, v, true)
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
			componentName: 'LineWaves',
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