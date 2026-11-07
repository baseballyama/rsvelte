import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
import Customize from '$lib/components/docs/preview/Customize.svelte';
import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
import PreviewSwitch from '$lib/components/docs/preview/PreviewSwitch.svelte';
import PropTable from '$lib/components/docs/preview/PropTable.svelte';
import DemoCodeTab from '$lib/components/docs/preview/DemoCodeTab.svelte';
import BackgroundContentToggle from '$lib/components/docs/preview/BackgroundContentToggle.svelte';
import Dither from '$lib/components/library/Backgrounds/Dither/Dither.svelte';
import source from '$lib/components/library/Backgrounds/Dither/Dither.svelte?raw';

var root = $.from_html(`<div class="relative h-[500px] w-full overflow-hidden rounded-[14px]"><!> <!></div>`);
var root_1 = $.from_html(`<!> <!> <!> <!> <!> <!> <!> <!>`, 1);
var root_2 = $.from_html(`<h1 class="sub-category">Dither</h1> <!>`, 1);

export default function DitherDemo($$anchor) {
	const D = {
		waveSpeed: 0.05,
		waveFrequency: 3,
		waveAmplitude: 0.3,
		colorNum: 4,
		pixelSize: 2,
		disableAnimation: false,
		enableMouseInteraction: true,
		mouseRadius: 1
	};

	let waveSpeed = $.state($.proxy(D.waveSpeed));
	let waveFrequency = $.state($.proxy(D.waveFrequency));
	let waveAmplitude = $.state($.proxy(D.waveAmplitude));
	let colorNum = $.state($.proxy(D.colorNum));
	let pixelSize = $.state($.proxy(D.pixelSize));
	let disableAnimation = $.state($.proxy(D.disableAnimation));
	let enableMouseInteraction = $.state($.proxy(D.enableMouseInteraction));
	let mouseRadius = $.state($.proxy(D.mouseRadius));
	let showContent = $.state(true);
	const sO = '<' + 'script lang="ts">';
	const sC = '</' + 'script>';
	const hasChanges = $.derived(() => $.get(waveSpeed) !== D.waveSpeed || $.get(waveFrequency) !== D.waveFrequency || $.get(waveAmplitude) !== D.waveAmplitude || $.get(colorNum) !== D.colorNum || $.get(pixelSize) !== D.pixelSize || $.get(disableAnimation) !== D.disableAnimation || $.get(enableMouseInteraction) !== D.enableMouseInteraction || $.get(mouseRadius) !== D.mouseRadius);

	function reset() {
		$.set(waveSpeed, D.waveSpeed, true);
		$.set(waveFrequency, D.waveFrequency, true);
		$.set(waveAmplitude, D.waveAmplitude, true);
		$.set(colorNum, D.colorNum, true);
		$.set(pixelSize, D.pixelSize, true);
		$.set(disableAnimation, D.disableAnimation, true);
		$.set(enableMouseInteraction, D.enableMouseInteraction, true);
		$.set(mouseRadius, D.mouseRadius, true);
	}

	const usage = $.derived(() => `${sO}
  import Dither from '$lib/components/Dither.svelte';
${sC}

<div style="position: relative; width: 100%; height: 600px; background: #14110E;">
  <Dither colorNum={${$.get(colorNum)}} pixelSize={${$.get(pixelSize)}} />
</div>`);

	const props = [
		{
			name: 'waveSpeed',
			type: 'number',
			default: '0.05',
			description: 'Wave time scale.'
		},

		{
			name: 'waveFrequency',
			type: 'number',
			default: '3',
			description: 'fbm frequency multiplier.'
		},

		{
			name: 'waveAmplitude',
			type: 'number',
			default: '0.3',
			description: 'fbm amplitude multiplier.'
		},

		{
			name: 'waveColor',
			type: '[r,g,b]',
			default: '[0.5,0.5,0.5]',
			description: 'Wave color.'
		},

		{
			name: 'colorNum',
			type: 'number',
			default: '4',
			description: 'Color quantization steps.'
		},

		{
			name: 'pixelSize',
			type: 'number',
			default: '2',
			description: 'Pixel block size.'
		},

		{
			name: 'disableAnimation',
			type: 'boolean',
			default: 'false',
			description: 'Pause animation.'
		},

		{
			name: 'enableMouseInteraction',
			type: 'boolean',
			default: 'true',
			description: 'Enable mouse warp.'
		},

		{
			name: 'mouseRadius',
			type: 'number',
			default: '1',
			description: 'Mouse warp radius.'
		}
	];

	var fragment = root_2();

	$.head('1mvpi8q', ($$anchor) => {
		$.effect(() => {
			$.document.title = 'Dither - svelte-bits';
		});
	});

	var node = $.sibling($.first_child(fragment), 2);

	{
		const preview = ($$anchor) => {
			var div = root();
			var node_1 = $.child(div);

			Dither(node_1, {
				get waveSpeed() {
					return $.get(waveSpeed);
				},

				get waveFrequency() {
					return $.get(waveFrequency);
				},

				get waveAmplitude() {
					return $.get(waveAmplitude);
				},

				get colorNum() {
					return $.get(colorNum);
				},

				get pixelSize() {
					return $.get(pixelSize);
				},

				get disableAnimation() {
					return $.get(disableAnimation);
				},

				get enableMouseInteraction() {
					return $.get(enableMouseInteraction);
				},

				get mouseRadius() {
					return $.get(mouseRadius);
				},
				waveColor: [1.0, 0.541, 0.298]
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
				slug: 'dither',
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

					PreviewSlider(node_3, {
						title: 'Wave Speed',
						min: 0,
						max: 0.5,
						step: 0.005,
						get value() {
							return $.get(waveSpeed);
						},
						onChange: (v) => $.set(waveSpeed, v, true)
					});

					var node_4 = $.sibling(node_3, 2);

					PreviewSlider(node_4, {
						title: 'Wave Frequency',
						min: 0.5,
						max: 10,
						step: 0.1,
						get value() {
							return $.get(waveFrequency);
						},
						onChange: (v) => $.set(waveFrequency, v, true)
					});

					var node_5 = $.sibling(node_4, 2);

					PreviewSlider(node_5, {
						title: 'Wave Amplitude',
						min: 0,
						max: 1,
						step: 0.01,
						get value() {
							return $.get(waveAmplitude);
						},
						onChange: (v) => $.set(waveAmplitude, v, true)
					});

					var node_6 = $.sibling(node_5, 2);

					PreviewSlider(node_6, {
						title: 'Color Num',
						min: 2,
						max: 16,
						step: 1,
						get value() {
							return $.get(colorNum);
						},
						onChange: (v) => $.set(colorNum, v, true)
					});

					var node_7 = $.sibling(node_6, 2);

					PreviewSlider(node_7, {
						title: 'Pixel Size',
						min: 1,
						max: 10,
						step: 1,
						get value() {
							return $.get(pixelSize);
						},
						onChange: (v) => $.set(pixelSize, v, true)
					});

					var node_8 = $.sibling(node_7, 2);

					PreviewSlider(node_8, {
						title: 'Mouse Radius',
						min: 0.1,
						max: 3,
						step: 0.05,
						get value() {
							return $.get(mouseRadius);
						},
						onChange: (v) => $.set(mouseRadius, v, true)
					});

					var node_9 = $.sibling(node_8, 2);

					PreviewSwitch(node_9, {
						title: 'Disable Animation',
						get checked() {
							return $.get(disableAnimation);
						},
						onChange: (v) => $.set(disableAnimation, v, true)
					});

					var node_10 = $.sibling(node_9, 2);

					PreviewSwitch(node_10, {
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
			componentName: 'Dither',
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