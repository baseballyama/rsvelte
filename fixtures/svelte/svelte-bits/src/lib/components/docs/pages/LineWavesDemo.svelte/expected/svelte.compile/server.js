import * as $ from 'svelte/internal/server';
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

export default function LineWavesDemo($$renderer) {
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

	let speed = D.speed;
	let innerLineCount = D.innerLineCount;
	let outerLineCount = D.outerLineCount;
	let warpIntensity = D.warpIntensity;
	let rotation = D.rotation;
	let edgeFadeWidth = D.edgeFadeWidth;
	let colorCycleSpeed = D.colorCycleSpeed;
	let brightness = D.brightness;
	let color1 = D.color1;
	let color2 = D.color2;
	let color3 = D.color3;
	let enableMouseInteraction = D.enableMouseInteraction;
	let mouseInfluence = D.mouseInfluence;
	let showContent = true;
	const sO = '<' + 'script lang="ts">';
	const sC = '</' + 'script>';
	const hasChanges = $.derived(() => speed !== D.speed || innerLineCount !== D.innerLineCount || outerLineCount !== D.outerLineCount || warpIntensity !== D.warpIntensity || rotation !== D.rotation || edgeFadeWidth !== D.edgeFadeWidth || colorCycleSpeed !== D.colorCycleSpeed || brightness !== D.brightness || color1 !== D.color1 || color2 !== D.color2 || color3 !== D.color3 || enableMouseInteraction !== D.enableMouseInteraction || mouseInfluence !== D.mouseInfluence);

	function reset() {
		speed = D.speed;
		innerLineCount = D.innerLineCount;
		outerLineCount = D.outerLineCount;
		warpIntensity = D.warpIntensity;
		rotation = D.rotation;
		edgeFadeWidth = D.edgeFadeWidth;
		colorCycleSpeed = D.colorCycleSpeed;
		brightness = D.brightness;
		color1 = D.color1;
		color2 = D.color2;
		color3 = D.color3;
		enableMouseInteraction = D.enableMouseInteraction;
		mouseInfluence = D.mouseInfluence;
	}

	const usage = $.derived(() => `${sO}
  import LineWaves from '$lib/components/LineWaves.svelte';
${sC}

<div style="width: 100%; height: 600px; position: relative;">
  <LineWaves color1="${color1}" color2="${color2}" color3="${color3}" />
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

	$.head('1y9cqfo', $$renderer, ($$renderer) => {
		$$renderer.title(($$renderer) => {
			$$renderer.push(`<title>Line Waves - svelte-bits</title>`);
		});
	});

	$$renderer.push(`<h1 class="sub-category">Line Waves</h1> `);

	{
		function preview($$renderer) {
			$$renderer.push(`<div class="relative h-[500px] w-full overflow-hidden rounded-[14px]">`);

			LineWaves($$renderer, {
				speed,
				innerLineCount,
				outerLineCount,
				warpIntensity,
				rotation,
				edgeFadeWidth,
				colorCycleSpeed,
				brightness,
				color1,
				color2,
				color3,
				enableMouseInteraction,
				mouseInfluence
			});

			$$renderer.push(`<!----> `);
			BackgroundContentToggle($$renderer, { showContent, onToggle: (v) => showContent = v });
			$$renderer.push(`<!----></div>`);
		}

		function code($$renderer) {
			DemoCodeTab($$renderer, { slug: 'line-waves', usage: usage(), source });
		}

		function customize($$renderer) {
			Customize($$renderer, {
				children: ($$renderer) => {
					PreviewColorPicker($$renderer, { title: 'Color 1', value: color1, onChange: (v) => color1 = v });
					$$renderer.push(`<!----> `);
					PreviewColorPicker($$renderer, { title: 'Color 2', value: color2, onChange: (v) => color2 = v });
					$$renderer.push(`<!----> `);
					PreviewColorPicker($$renderer, { title: 'Color 3', value: color3, onChange: (v) => color3 = v });
					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Speed',
						min: 0,
						max: 2,
						step: 0.05,
						value: speed,
						onChange: (v) => speed = v
					});

					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Inner Lines',
						min: 4,
						max: 128,
						step: 1,
						value: innerLineCount,
						onChange: (v) => innerLineCount = v
					});

					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Outer Lines',
						min: 4,
						max: 128,
						step: 1,
						value: outerLineCount,
						onChange: (v) => outerLineCount = v
					});

					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Warp Intensity',
						min: 0,
						max: 3,
						step: 0.05,
						value: warpIntensity,
						onChange: (v) => warpIntensity = v
					});

					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Rotation',
						min: -180,
						max: 180,
						step: 1,
						value: rotation,
						onChange: (v) => rotation = v
					});

					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Edge Fade Width',
						min: -1,
						max: 1,
						step: 0.05,
						value: edgeFadeWidth,
						onChange: (v) => edgeFadeWidth = v
					});

					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Color Cycle Speed',
						min: 0,
						max: 3,
						step: 0.05,
						value: colorCycleSpeed,
						onChange: (v) => colorCycleSpeed = v
					});

					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Brightness',
						min: 0,
						max: 2,
						step: 0.05,
						value: brightness,
						onChange: (v) => brightness = v
					});

					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Mouse Influence',
						min: 0,
						max: 5,
						step: 0.1,
						value: mouseInfluence,
						onChange: (v) => mouseInfluence = v
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
			componentName: 'LineWaves',
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