import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
import Customize from '$lib/components/docs/preview/Customize.svelte';
import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
import PropTable from '$lib/components/docs/preview/PropTable.svelte';
import DemoCodeTab from '$lib/components/docs/preview/DemoCodeTab.svelte';
import BackgroundContentToggle from '$lib/components/docs/preview/BackgroundContentToggle.svelte';
import DarkVeil from '$lib/components/library/Backgrounds/DarkVeil/DarkVeil.svelte';
import source from '$lib/components/library/Backgrounds/DarkVeil/DarkVeil.svelte?raw';

var root = $.from_html(`<div class="relative h-[500px] w-full overflow-hidden rounded-[14px]"><!> <!></div>`);
var root_1 = $.from_html(`<!> <!> <!> <!> <!> <!>`, 1);
var root_2 = $.from_html(`<h1 class="sub-category">Dark Veil</h1> <!>`, 1);

export default function DarkVeilDemo($$anchor) {
	const DEFAULTS = {
		hueShift: 0,
		noiseIntensity: 0,
		scanlineIntensity: 0,
		speed: 0.5,
		scanlineFrequency: 0,
		warpAmount: 0
	};

	let hueShift = $.state($.proxy(DEFAULTS.hueShift));
	let noiseIntensity = $.state($.proxy(DEFAULTS.noiseIntensity));
	let scanlineIntensity = $.state($.proxy(DEFAULTS.scanlineIntensity));
	let speed = $.state($.proxy(DEFAULTS.speed));
	let scanlineFrequency = $.state($.proxy(DEFAULTS.scanlineFrequency));
	let warpAmount = $.state($.proxy(DEFAULTS.warpAmount));
	let showContent = $.state(true);
	const scriptOpen = '<' + 'script lang="ts">';
	const scriptClose = '</' + 'script>';
	const hasChanges = $.derived(() => $.get(hueShift) !== DEFAULTS.hueShift || $.get(noiseIntensity) !== DEFAULTS.noiseIntensity || $.get(scanlineIntensity) !== DEFAULTS.scanlineIntensity || $.get(speed) !== DEFAULTS.speed || $.get(scanlineFrequency) !== DEFAULTS.scanlineFrequency || $.get(warpAmount) !== DEFAULTS.warpAmount);

	function reset() {
		$.set(hueShift, DEFAULTS.hueShift, true);
		$.set(noiseIntensity, DEFAULTS.noiseIntensity, true);
		$.set(scanlineIntensity, DEFAULTS.scanlineIntensity, true);
		$.set(speed, DEFAULTS.speed, true);
		$.set(scanlineFrequency, DEFAULTS.scanlineFrequency, true);
		$.set(warpAmount, DEFAULTS.warpAmount, true);
	}

	const usage = $.derived(() => `${scriptOpen}
  import DarkVeil from '$lib/components/DarkVeil.svelte';
${scriptClose}

<div style="width: 100%; height: 600px; position: relative;">
  <DarkVeil hueShift={${$.get(hueShift)}} speed={${$.get(speed)}} warpAmount={${$.get(warpAmount)}} />
</div>`);

	const props = [
		{
			name: 'hueShift',
			type: 'number',
			default: '0',
			description: 'Hue rotation in degrees.'
		},

		{
			name: 'noiseIntensity',
			type: 'number',
			default: '0',
			description: 'Noise grain intensity.'
		},

		{
			name: 'scanlineIntensity',
			type: 'number',
			default: '0',
			description: 'CRT scanline intensity.'
		},

		{
			name: 'speed',
			type: 'number',
			default: '0.5',
			description: 'Animation speed.'
		},

		{
			name: 'scanlineFrequency',
			type: 'number',
			default: '0',
			description: 'Scanline frequency.'
		},

		{
			name: 'warpAmount',
			type: 'number',
			default: '0',
			description: 'Warp distortion amount.'
		},

		{
			name: 'resolutionScale',
			type: 'number',
			default: '1',
			description: 'Render resolution scale.'
		}
	];

	var fragment = root_2();

	$.head('1msa69i', ($$anchor) => {
		$.effect(() => {
			$.document.title = 'Dark Veil - svelte-bits';
		});
	});

	var node = $.sibling($.first_child(fragment), 2);

	{
		const preview = ($$anchor) => {
			var div = root();
			var node_1 = $.child(div);

			DarkVeil(node_1, {
				get hueShift() {
					return $.get(hueShift);
				},

				get noiseIntensity() {
					return $.get(noiseIntensity);
				},

				get scanlineIntensity() {
					return $.get(scanlineIntensity);
				},

				get speed() {
					return $.get(speed);
				},

				get scanlineFrequency() {
					return $.get(scanlineFrequency);
				},

				get warpAmount() {
					return $.get(warpAmount);
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
				slug: 'dark-veil',
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
						title: 'Hue Shift',
						min: 0,
						max: 360,
						step: 1,
						get value() {
							return $.get(hueShift);
						},
						onChange: (v) => $.set(hueShift, v, true)
					});

					var node_4 = $.sibling(node_3, 2);

					PreviewSlider(node_4, {
						title: 'Speed',
						min: 0,
						max: 3,
						step: 0.05,
						get value() {
							return $.get(speed);
						},
						onChange: (v) => $.set(speed, v, true)
					});

					var node_5 = $.sibling(node_4, 2);

					PreviewSlider(node_5, {
						title: 'Warp',
						min: 0,
						max: 2,
						step: 0.05,
						get value() {
							return $.get(warpAmount);
						},
						onChange: (v) => $.set(warpAmount, v, true)
					});

					var node_6 = $.sibling(node_5, 2);

					PreviewSlider(node_6, {
						title: 'Noise',
						min: 0,
						max: 1,
						step: 0.01,
						get value() {
							return $.get(noiseIntensity);
						},
						onChange: (v) => $.set(noiseIntensity, v, true)
					});

					var node_7 = $.sibling(node_6, 2);

					PreviewSlider(node_7, {
						title: 'Scanline Intensity',
						min: 0,
						max: 1,
						step: 0.01,
						get value() {
							return $.get(scanlineIntensity);
						},
						onChange: (v) => $.set(scanlineIntensity, v, true)
					});

					var node_8 = $.sibling(node_7, 2);

					PreviewSlider(node_8, {
						title: 'Scanline Frequency',
						min: 0,
						max: 10,
						step: 0.05,
						get value() {
							return $.get(scanlineFrequency);
						},
						onChange: (v) => $.set(scanlineFrequency, v, true)
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
			componentName: 'DarkVeil',
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