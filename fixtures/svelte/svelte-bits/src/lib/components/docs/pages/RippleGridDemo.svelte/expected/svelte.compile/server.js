import * as $ from 'svelte/internal/server';
import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
import Customize from '$lib/components/docs/preview/Customize.svelte';
import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
import PreviewSwitch from '$lib/components/docs/preview/PreviewSwitch.svelte';
import PreviewColorPicker from '$lib/components/docs/preview/PreviewColorPicker.svelte';
import PropTable from '$lib/components/docs/preview/PropTable.svelte';
import DemoCodeTab from '$lib/components/docs/preview/DemoCodeTab.svelte';
import BackgroundContentToggle from '$lib/components/docs/preview/BackgroundContentToggle.svelte';
import RippleGrid from '$lib/components/library/Backgrounds/RippleGrid/RippleGrid.svelte';
import source from '$lib/components/library/Backgrounds/RippleGrid/RippleGrid.svelte?raw';

export default function RippleGridDemo($$renderer) {
	const D = {
		enableRainbow: false,
		gridColor: '#ff8a3d',
		rippleIntensity: 0.05,
		gridSize: 10,
		gridThickness: 15,
		mouseInteraction: true,
		mouseInteractionRadius: 1.2,
		opacity: 0.8
	};

	let enableRainbow = D.enableRainbow;
	let gridColor = D.gridColor;
	let rippleIntensity = D.rippleIntensity;
	let gridSize = D.gridSize;
	let gridThickness = D.gridThickness;
	let mouseInteraction = D.mouseInteraction;
	let mouseInteractionRadius = D.mouseInteractionRadius;
	let opacity = D.opacity;
	let showContent = true;
	const sO = '<' + 'script lang="ts">';
	const sC = '</' + 'script>';
	const hasChanges = $.derived(() => enableRainbow !== D.enableRainbow || gridColor !== D.gridColor || rippleIntensity !== D.rippleIntensity || gridSize !== D.gridSize || gridThickness !== D.gridThickness || mouseInteraction !== D.mouseInteraction || mouseInteractionRadius !== D.mouseInteractionRadius || opacity !== D.opacity);

	function reset() {
		enableRainbow = D.enableRainbow;
		gridColor = D.gridColor;
		rippleIntensity = D.rippleIntensity;
		gridSize = D.gridSize;
		gridThickness = D.gridThickness;
		mouseInteraction = D.mouseInteraction;
		mouseInteractionRadius = D.mouseInteractionRadius;
		opacity = D.opacity;
	}

	const usage = $.derived(() => `${sO}
  import RippleGrid from '$lib/components/RippleGrid.svelte';
${sC}

<div style="width: 100%; height: 600px; position: relative;">
  <RippleGrid gridColor="${gridColor}" rippleIntensity={${rippleIntensity}} gridSize={${gridSize}} />
</div>`);

	const props = [
		{
			name: 'enableRainbow',
			type: 'boolean',
			default: 'false',
			description: 'Cycle through rainbow colors.'
		},

		{
			name: 'gridColor',
			type: 'string',
			default: '"#ffffff"',
			description: 'Hex color of the grid.'
		},

		{
			name: 'rippleIntensity',
			type: 'number',
			default: '0.05',
			description: 'Ripple amplitude.'
		},

		{
			name: 'gridSize',
			type: 'number',
			default: '10',
			description: 'Grid density.'
		},

		{
			name: 'gridThickness',
			type: 'number',
			default: '15',
			description: 'Line thickness.'
		},

		{
			name: 'fadeDistance',
			type: 'number',
			default: '1.5',
			description: 'Distance fade.'
		},

		{
			name: 'vignetteStrength',
			type: 'number',
			default: '2',
			description: 'Vignette strength.'
		},

		{
			name: 'glowIntensity',
			type: 'number',
			default: '0.1',
			description: 'Glow intensity.'
		},

		{
			name: 'opacity',
			type: 'number',
			default: '1',
			description: 'Overall opacity.'
		},

		{
			name: 'gridRotation',
			type: 'number',
			default: '0',
			description: 'Grid rotation in degrees.'
		},

		{
			name: 'mouseInteraction',
			type: 'boolean',
			default: 'true',
			description: 'React to mouse.'
		},

		{
			name: 'mouseInteractionRadius',
			type: 'number',
			default: '1',
			description: 'Mouse influence radius.'
		}
	];

	$.head('f1e1dg', $$renderer, ($$renderer) => {
		$$renderer.title(($$renderer) => {
			$$renderer.push(`<title>Ripple Grid - svelte-bits</title>`);
		});
	});

	$$renderer.push(`<h1 class="sub-category">Ripple Grid</h1> `);

	{
		function preview($$renderer) {
			$$renderer.push(`<div class="relative h-[500px] w-full overflow-hidden rounded-[14px]">`);

			RippleGrid($$renderer, {
				enableRainbow,
				gridColor,
				rippleIntensity,
				gridSize,
				gridThickness,
				mouseInteraction,
				mouseInteractionRadius,
				opacity
			});

			$$renderer.push(`<!----> `);
			BackgroundContentToggle($$renderer, { showContent, onToggle: (v) => showContent = v });
			$$renderer.push(`<!----></div>`);
		}

		function code($$renderer) {
			DemoCodeTab($$renderer, { slug: 'ripple-grid', usage: usage(), source });
		}

		function customize($$renderer) {
			Customize($$renderer, {
				children: ($$renderer) => {
					PreviewSwitch($$renderer, {
						title: 'Rainbow',
						checked: enableRainbow,
						onChange: (v) => enableRainbow = v
					});

					$$renderer.push(`<!----> `);

					PreviewColorPicker($$renderer, {
						title: 'Grid Color',
						value: gridColor,
						onChange: (v) => gridColor = v
					});

					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Ripple Intensity',
						min: 0,
						max: 0.3,
						step: 0.005,
						value: rippleIntensity,
						onChange: (v) => rippleIntensity = v
					});

					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Grid Size',
						min: 1,
						max: 30,
						step: 0.5,
						value: gridSize,
						onChange: (v) => gridSize = v
					});

					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Grid Thickness',
						min: 1,
						max: 50,
						step: 0.5,
						value: gridThickness,
						onChange: (v) => gridThickness = v
					});

					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Opacity',
						min: 0,
						max: 1,
						step: 0.05,
						value: opacity,
						onChange: (v) => opacity = v
					});

					$$renderer.push(`<!----> `);

					PreviewSwitch($$renderer, {
						title: 'Mouse Interaction',
						checked: mouseInteraction,
						onChange: (v) => mouseInteraction = v
					});

					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Mouse Radius',
						min: 0.1,
						max: 5,
						step: 0.1,
						value: mouseInteractionRadius,
						onChange: (v) => mouseInteractionRadius = v
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
			componentName: 'RippleGrid',
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