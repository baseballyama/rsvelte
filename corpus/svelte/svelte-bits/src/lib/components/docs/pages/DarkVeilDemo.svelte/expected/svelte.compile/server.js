import * as $ from 'svelte/internal/server';
import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
import Customize from '$lib/components/docs/preview/Customize.svelte';
import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
import PropTable from '$lib/components/docs/preview/PropTable.svelte';
import DemoCodeTab from '$lib/components/docs/preview/DemoCodeTab.svelte';
import BackgroundContentToggle from '$lib/components/docs/preview/BackgroundContentToggle.svelte';
import DarkVeil from '$lib/components/library/Backgrounds/DarkVeil/DarkVeil.svelte';
import source from '$lib/components/library/Backgrounds/DarkVeil/DarkVeil.svelte?raw';

export default function DarkVeilDemo($$renderer) {
	const DEFAULTS = {
		hueShift: 0,
		noiseIntensity: 0,
		scanlineIntensity: 0,
		speed: 0.5,
		scanlineFrequency: 0,
		warpAmount: 0
	};

	let hueShift = DEFAULTS.hueShift;
	let noiseIntensity = DEFAULTS.noiseIntensity;
	let scanlineIntensity = DEFAULTS.scanlineIntensity;
	let speed = DEFAULTS.speed;
	let scanlineFrequency = DEFAULTS.scanlineFrequency;
	let warpAmount = DEFAULTS.warpAmount;
	let showContent = true;
	const scriptOpen = '<' + 'script lang="ts">';
	const scriptClose = '</' + 'script>';
	const hasChanges = $.derived(() => hueShift !== DEFAULTS.hueShift || noiseIntensity !== DEFAULTS.noiseIntensity || scanlineIntensity !== DEFAULTS.scanlineIntensity || speed !== DEFAULTS.speed || scanlineFrequency !== DEFAULTS.scanlineFrequency || warpAmount !== DEFAULTS.warpAmount);

	function reset() {
		hueShift = DEFAULTS.hueShift;
		noiseIntensity = DEFAULTS.noiseIntensity;
		scanlineIntensity = DEFAULTS.scanlineIntensity;
		speed = DEFAULTS.speed;
		scanlineFrequency = DEFAULTS.scanlineFrequency;
		warpAmount = DEFAULTS.warpAmount;
	}

	const usage = $.derived(() => `${scriptOpen}
  import DarkVeil from '$lib/components/DarkVeil.svelte';
${scriptClose}

<div style="width: 100%; height: 600px; position: relative;">
  <DarkVeil hueShift={${hueShift}} speed={${speed}} warpAmount={${warpAmount}} />
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

	$.head('1msa69i', $$renderer, ($$renderer) => {
		$$renderer.title(($$renderer) => {
			$$renderer.push(`<title>Dark Veil - svelte-bits</title>`);
		});
	});

	$$renderer.push(`<h1 class="sub-category">Dark Veil</h1> `);

	{
		function preview($$renderer) {
			$$renderer.push(`<div class="relative h-[500px] w-full overflow-hidden rounded-[14px]">`);

			DarkVeil($$renderer, {
				hueShift,
				noiseIntensity,
				scanlineIntensity,
				speed,
				scanlineFrequency,
				warpAmount
			});

			$$renderer.push(`<!----> `);
			BackgroundContentToggle($$renderer, { showContent, onToggle: (v) => showContent = v });
			$$renderer.push(`<!----></div>`);
		}

		function code($$renderer) {
			DemoCodeTab($$renderer, { slug: 'dark-veil', usage: usage(), source });
		}

		function customize($$renderer) {
			Customize($$renderer, {
				children: ($$renderer) => {
					PreviewSlider($$renderer, {
						title: 'Hue Shift',
						min: 0,
						max: 360,
						step: 1,
						value: hueShift,
						onChange: (v) => hueShift = v
					});

					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Speed',
						min: 0,
						max: 3,
						step: 0.05,
						value: speed,
						onChange: (v) => speed = v
					});

					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Warp',
						min: 0,
						max: 2,
						step: 0.05,
						value: warpAmount,
						onChange: (v) => warpAmount = v
					});

					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Noise',
						min: 0,
						max: 1,
						step: 0.01,
						value: noiseIntensity,
						onChange: (v) => noiseIntensity = v
					});

					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Scanline Intensity',
						min: 0,
						max: 1,
						step: 0.01,
						value: scanlineIntensity,
						onChange: (v) => scanlineIntensity = v
					});

					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Scanline Frequency',
						min: 0,
						max: 10,
						step: 0.05,
						value: scanlineFrequency,
						onChange: (v) => scanlineFrequency = v
					});

					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});
		}

		function propTable($$renderer) {
			PropTable($$renderer, { rows: props });
		}

		TabsLayout($$renderer, {
			onreset: reset,
			hasChanges: hasChanges(),
			componentName: 'DarkVeil',
			usage: usage(),
			source,
			props,
			preview,
			code,
			customize,
			propTable,
			$$slots: { preview: true, code: true, customize: true, propTable: true }
		});
	}

	$$renderer.push(`<!---->`);
}