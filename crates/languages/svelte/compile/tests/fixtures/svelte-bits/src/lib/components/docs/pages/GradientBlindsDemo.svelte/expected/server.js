import * as $ from 'svelte/internal/server';
import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
import Customize from '$lib/components/docs/preview/Customize.svelte';
import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
import PreviewSwitch from '$lib/components/docs/preview/PreviewSwitch.svelte';
import PropTable from '$lib/components/docs/preview/PropTable.svelte';
import DemoCodeTab from '$lib/components/docs/preview/DemoCodeTab.svelte';
import BackgroundContentToggle from '$lib/components/docs/preview/BackgroundContentToggle.svelte';
import GradientBlinds from '$lib/components/library/Backgrounds/GradientBlinds/GradientBlinds.svelte';
import source from '$lib/components/library/Backgrounds/GradientBlinds/GradientBlinds.svelte?raw';

export default function GradientBlindsDemo($$renderer) {
	const D = {
		angle: 0,
		noise: 0.3,
		blindCount: 16,
		blindMinWidth: 60,
		mouseDampening: 0.15,
		mirrorGradient: false,
		spotlightRadius: 0.5,
		spotlightSoftness: 1,
		spotlightOpacity: 1,
		distortAmount: 0,
		shineDirection: 'left'
	};

	let angle = D.angle;
	let noise = D.noise;
	let blindCount = D.blindCount;
	let blindMinWidth = D.blindMinWidth;
	let mouseDampening = D.mouseDampening;
	let mirrorGradient = D.mirrorGradient;
	let spotlightRadius = D.spotlightRadius;
	let spotlightSoftness = D.spotlightSoftness;
	let spotlightOpacity = D.spotlightOpacity;
	let distortAmount = D.distortAmount;
	let shineDirection = D.shineDirection;
	let showContent = true;
	const sO = '<' + 'script lang="ts">';
	const sC = '</' + 'script>';
	const hasChanges = $.derived(() => angle !== D.angle || noise !== D.noise || blindCount !== D.blindCount || blindMinWidth !== D.blindMinWidth || mouseDampening !== D.mouseDampening || mirrorGradient !== D.mirrorGradient || spotlightRadius !== D.spotlightRadius || spotlightSoftness !== D.spotlightSoftness || spotlightOpacity !== D.spotlightOpacity || distortAmount !== D.distortAmount || shineDirection !== D.shineDirection);

	function reset() {
		angle = D.angle;
		noise = D.noise;
		blindCount = D.blindCount;
		blindMinWidth = D.blindMinWidth;
		mouseDampening = D.mouseDampening;
		mirrorGradient = D.mirrorGradient;
		spotlightRadius = D.spotlightRadius;
		spotlightSoftness = D.spotlightSoftness;
		spotlightOpacity = D.spotlightOpacity;
		distortAmount = D.distortAmount;
		shineDirection = D.shineDirection;
	}

	const usage = $.derived(() => `${sO}
  import GradientBlinds from '$lib/components/GradientBlinds.svelte';
${sC}

<div style="width: 100%; height: 600px; position: relative; background: #14110E;">
  <GradientBlinds gradientColors={["#FF9FFC", "#ff8a3d"]} angle={${angle}} blindCount={${blindCount}} />
</div>`);

	const props = [
		{
			name: 'gradientColors',
			type: 'string[]',
			default: "['#FF9FFC', '#ff8a3d']",
			description: 'Gradient stops (up to 8).'
		},

		{
			name: 'angle',
			type: 'number',
			default: '0',
			description: 'Gradient rotation in degrees.'
		},

		{
			name: 'noise',
			type: 'number',
			default: '0.3',
			description: 'Grain noise amount.'
		},

		{
			name: 'blindCount',
			type: 'number',
			default: '16',
			description: 'Number of blinds.'
		},

		{
			name: 'blindMinWidth',
			type: 'number',
			default: '60',
			description: 'Min blind width in px (cap).'
		},

		{
			name: 'mouseDampening',
			type: 'number',
			default: '0.15',
			description: 'Mouse follow tau in seconds.'
		},

		{
			name: 'mirrorGradient',
			type: 'boolean',
			default: 'false',
			description: 'Mirror the gradient.'
		},

		{
			name: 'spotlightRadius',
			type: 'number',
			default: '0.5',
			description: 'Spotlight radius.'
		},

		{
			name: 'spotlightSoftness',
			type: 'number',
			default: '1',
			description: 'Spotlight softness.'
		},

		{
			name: 'spotlightOpacity',
			type: 'number',
			default: '1',
			description: 'Spotlight opacity.'
		},

		{
			name: 'distortAmount',
			type: 'number',
			default: '0',
			description: 'Distortion strength.'
		},

		{
			name: 'shineDirection',
			type: "'left' | 'right'",
			default: "'left'",
			description: 'Shine direction.'
		},

		{
			name: 'mixBlendMode',
			type: 'string',
			default: "'lighten'",
			description: 'CSS mix-blend-mode.'
		}
	];

	$.head('15zjqcq', $$renderer, ($$renderer) => {
		$$renderer.title(($$renderer) => {
			$$renderer.push(`<title>Gradient Blinds - svelte-bits</title>`);
		});
	});

	$$renderer.push(`<h1 class="sub-category">Gradient Blinds</h1> `);

	{
		function preview($$renderer) {
			$$renderer.push(`<div class="relative h-[500px] w-full overflow-hidden rounded-[14px]">`);

			GradientBlinds($$renderer, {
				gradientColors: ['#FF9FFC', '#ff8a3d'],
				angle,
				noise,
				blindCount,
				blindMinWidth,
				mouseDampening,
				mirrorGradient,
				spotlightRadius,
				spotlightSoftness,
				spotlightOpacity,
				distortAmount,
				shineDirection
			});

			$$renderer.push(`<!----> `);
			BackgroundContentToggle($$renderer, { showContent, onToggle: (v) => showContent = v });
			$$renderer.push(`<!----></div>`);
		}

		function code($$renderer) {
			DemoCodeTab($$renderer, { slug: 'gradient-blinds', usage: usage(), source });
		}

		function customize($$renderer) {
			Customize($$renderer, {
				children: ($$renderer) => {
					PreviewSlider($$renderer, {
						title: 'Angle',
						min: -180,
						max: 180,
						step: 1,
						value: angle,
						onChange: (v) => angle = v
					});

					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Blind Count',
						min: 1,
						max: 64,
						step: 1,
						value: blindCount,
						onChange: (v) => blindCount = v
					});

					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Blind Min Width',
						min: 0,
						max: 300,
						step: 1,
						value: blindMinWidth,
						onChange: (v) => blindMinWidth = v
					});

					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Noise',
						min: 0,
						max: 1,
						step: 0.05,
						value: noise,
						onChange: (v) => noise = v
					});

					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Mouse Dampening',
						min: 0,
						max: 1,
						step: 0.05,
						value: mouseDampening,
						onChange: (v) => mouseDampening = v
					});

					$$renderer.push(`<!----> `);

					PreviewSwitch($$renderer, {
						title: 'Mirror Gradient',
						checked: mirrorGradient,
						onChange: (v) => mirrorGradient = v
					});

					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Spotlight Radius',
						min: 0.1,
						max: 2,
						step: 0.05,
						value: spotlightRadius,
						onChange: (v) => spotlightRadius = v
					});

					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Spotlight Softness',
						min: 0.1,
						max: 4,
						step: 0.1,
						value: spotlightSoftness,
						onChange: (v) => spotlightSoftness = v
					});

					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Spotlight Opacity',
						min: 0,
						max: 2,
						step: 0.05,
						value: spotlightOpacity,
						onChange: (v) => spotlightOpacity = v
					});

					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Distort',
						min: 0,
						max: 5,
						step: 0.1,
						value: distortAmount,
						onChange: (v) => distortAmount = v
					});

					$$renderer.push(`<!----> `);

					PreviewSwitch($$renderer, {
						title: 'Shine Right',
						checked: shineDirection === 'right',
						onChange: (v) => shineDirection = v ? 'right' : 'left'
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
			componentName: 'GradientBlinds',
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