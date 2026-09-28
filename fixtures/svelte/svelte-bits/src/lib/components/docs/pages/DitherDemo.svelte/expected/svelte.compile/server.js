import * as $ from 'svelte/internal/server';
import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
import Customize from '$lib/components/docs/preview/Customize.svelte';
import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
import PreviewSwitch from '$lib/components/docs/preview/PreviewSwitch.svelte';
import PropTable from '$lib/components/docs/preview/PropTable.svelte';
import DemoCodeTab from '$lib/components/docs/preview/DemoCodeTab.svelte';
import BackgroundContentToggle from '$lib/components/docs/preview/BackgroundContentToggle.svelte';
import Dither from '$lib/components/library/Backgrounds/Dither/Dither.svelte';
import source from '$lib/components/library/Backgrounds/Dither/Dither.svelte?raw';

export default function DitherDemo($$renderer) {
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

	let waveSpeed = D.waveSpeed;
	let waveFrequency = D.waveFrequency;
	let waveAmplitude = D.waveAmplitude;
	let colorNum = D.colorNum;
	let pixelSize = D.pixelSize;
	let disableAnimation = D.disableAnimation;
	let enableMouseInteraction = D.enableMouseInteraction;
	let mouseRadius = D.mouseRadius;
	let showContent = true;
	const sO = '<' + 'script lang="ts">';
	const sC = '</' + 'script>';
	const hasChanges = $.derived(() => waveSpeed !== D.waveSpeed || waveFrequency !== D.waveFrequency || waveAmplitude !== D.waveAmplitude || colorNum !== D.colorNum || pixelSize !== D.pixelSize || disableAnimation !== D.disableAnimation || enableMouseInteraction !== D.enableMouseInteraction || mouseRadius !== D.mouseRadius);

	function reset() {
		waveSpeed = D.waveSpeed;
		waveFrequency = D.waveFrequency;
		waveAmplitude = D.waveAmplitude;
		colorNum = D.colorNum;
		pixelSize = D.pixelSize;
		disableAnimation = D.disableAnimation;
		enableMouseInteraction = D.enableMouseInteraction;
		mouseRadius = D.mouseRadius;
	}

	const usage = $.derived(() => `${sO}
  import Dither from '$lib/components/Dither.svelte';
${sC}

<div style="position: relative; width: 100%; height: 600px; background: #14110E;">
  <Dither colorNum={${colorNum}} pixelSize={${pixelSize}} />
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

	$.head('1mvpi8q', $$renderer, ($$renderer) => {
		$$renderer.title(($$renderer) => {
			$$renderer.push(`<title>Dither - svelte-bits</title>`);
		});
	});

	$$renderer.push(`<h1 class="sub-category">Dither</h1> `);

	{
		function preview($$renderer) {
			$$renderer.push(`<div class="relative h-[500px] w-full overflow-hidden rounded-[14px]">`);

			Dither($$renderer, {
				waveSpeed,
				waveFrequency,
				waveAmplitude,
				colorNum,
				pixelSize,
				disableAnimation,
				enableMouseInteraction,
				mouseRadius,
				waveColor: [1.0, 0.541, 0.298]
			});

			$$renderer.push(`<!----> `);
			BackgroundContentToggle($$renderer, { showContent, onToggle: (v) => showContent = v });
			$$renderer.push(`<!----></div>`);
		}

		function code($$renderer) {
			DemoCodeTab($$renderer, { slug: 'dither', usage: usage(), source });
		}

		function customize($$renderer) {
			Customize($$renderer, {
				children: ($$renderer) => {
					PreviewSlider($$renderer, {
						title: 'Wave Speed',
						min: 0,
						max: 0.5,
						step: 0.005,
						value: waveSpeed,
						onChange: (v) => waveSpeed = v
					});

					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Wave Frequency',
						min: 0.5,
						max: 10,
						step: 0.1,
						value: waveFrequency,
						onChange: (v) => waveFrequency = v
					});

					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Wave Amplitude',
						min: 0,
						max: 1,
						step: 0.01,
						value: waveAmplitude,
						onChange: (v) => waveAmplitude = v
					});

					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Color Num',
						min: 2,
						max: 16,
						step: 1,
						value: colorNum,
						onChange: (v) => colorNum = v
					});

					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Pixel Size',
						min: 1,
						max: 10,
						step: 1,
						value: pixelSize,
						onChange: (v) => pixelSize = v
					});

					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Mouse Radius',
						min: 0.1,
						max: 3,
						step: 0.05,
						value: mouseRadius,
						onChange: (v) => mouseRadius = v
					});

					$$renderer.push(`<!----> `);

					PreviewSwitch($$renderer, {
						title: 'Disable Animation',
						checked: disableAnimation,
						onChange: (v) => disableAnimation = v
					});

					$$renderer.push(`<!----> `);

					PreviewSwitch($$renderer, {
						title: 'Mouse Interaction',
						checked: enableMouseInteraction,
						onChange: (v) => enableMouseInteraction = v
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
			componentName: 'Dither',
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