import * as $ from 'svelte/internal/server';
import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
import Customize from '$lib/components/docs/preview/Customize.svelte';
import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
import PreviewColorPicker from '$lib/components/docs/preview/PreviewColorPicker.svelte';
import PropTable from '$lib/components/docs/preview/PropTable.svelte';
import DemoCodeTab from '$lib/components/docs/preview/DemoCodeTab.svelte';
import BackgroundContentToggle from '$lib/components/docs/preview/BackgroundContentToggle.svelte';
import DotGrid from '$lib/components/library/Backgrounds/DotGrid/DotGrid.svelte';
import source from '$lib/components/library/Backgrounds/DotGrid/DotGrid.svelte?raw';

export default function DotGridDemo($$renderer) {
	const D = {
		dotSize: 16,
		gap: 32,
		baseColor: '#5c2a08',
		activeColor: '#ff8a3d',
		proximity: 150,
		shockRadius: 250,
		shockStrength: 5,
		resistance: 750,
		returnDuration: 1.5
	};

	let dotSize = D.dotSize;
	let gap = D.gap;
	let baseColor = D.baseColor;
	let activeColor = D.activeColor;
	let proximity = D.proximity;
	let shockRadius = D.shockRadius;
	let shockStrength = D.shockStrength;
	let resistance = D.resistance;
	let returnDuration = D.returnDuration;
	let showContent = true;
	const sO = '<' + 'script lang="ts">';
	const sC = '</' + 'script>';
	const hasChanges = $.derived(() => dotSize !== D.dotSize || gap !== D.gap || baseColor !== D.baseColor || activeColor !== D.activeColor || proximity !== D.proximity || shockRadius !== D.shockRadius || shockStrength !== D.shockStrength || resistance !== D.resistance || returnDuration !== D.returnDuration);

	function reset() {
		dotSize = D.dotSize;
		gap = D.gap;
		baseColor = D.baseColor;
		activeColor = D.activeColor;
		proximity = D.proximity;
		shockRadius = D.shockRadius;
		shockStrength = D.shockStrength;
		resistance = D.resistance;
		returnDuration = D.returnDuration;
	}

	const usage = $.derived(() => `${sO}
  import DotGrid from '$lib/components/DotGrid.svelte';
${sC}

<div style="width: 100%; height: 600px; position: relative;">
  <DotGrid baseColor="${baseColor}" activeColor="${activeColor}" />
</div>`);

	const props = [
		{
			name: 'dotSize',
			type: 'number',
			default: '16',
			description: 'Dot diameter in px.'
		},

		{
			name: 'gap',
			type: 'number',
			default: '32',
			description: 'Gap between dots.'
		},

		{
			name: 'baseColor',
			type: 'string',
			default: '"#FF8A4C"',
			description: 'Base dot color.'
		},

		{
			name: 'activeColor',
			type: 'string',
			default: '"#FF8A4C"',
			description: 'Color near cursor.'
		},

		{
			name: 'proximity',
			type: 'number',
			default: '150',
			description: 'Proximity highlight radius.'
		},

		{
			name: 'speedTrigger',
			type: 'number',
			default: '100',
			description: 'Velocity threshold to push dots.'
		},

		{
			name: 'shockRadius',
			type: 'number',
			default: '250',
			description: 'Click shockwave radius.'
		},

		{
			name: 'shockStrength',
			type: 'number',
			default: '5',
			description: 'Click shockwave strength.'
		},

		{
			name: 'maxSpeed',
			type: 'number',
			default: '5000',
			description: 'Maximum mouse velocity.'
		},

		{
			name: 'resistance',
			type: 'number',
			default: '750',
			description: 'Inertia resistance.'
		},

		{
			name: 'returnDuration',
			type: 'number',
			default: '1.5',
			description: 'Return animation duration.'
		}
	];

	$.head('15m2iy1', $$renderer, ($$renderer) => {
		$$renderer.title(($$renderer) => {
			$$renderer.push(`<title>Dot Grid - svelte-bits</title>`);
		});
	});

	$$renderer.push(`<h1 class="sub-category">Dot Grid</h1> `);

	{
		function preview($$renderer) {
			$$renderer.push(`<!---->`);

			{
				$$renderer.push(`<div class="relative h-[500px] w-full overflow-hidden rounded-[14px]">`);

				DotGrid($$renderer, {
					dotSize,
					gap,
					baseColor,
					activeColor,
					proximity,
					shockRadius,
					shockStrength,
					resistance,
					returnDuration
				});

				$$renderer.push(`<!----> `);
				BackgroundContentToggle($$renderer, { showContent, onToggle: (v) => showContent = v });
				$$renderer.push(`<!----></div>`);
			}

			$$renderer.push(`<!---->`);
		}

		function code($$renderer) {
			DemoCodeTab($$renderer, { slug: 'dot-grid', usage: usage(), source });
		}

		function customize($$renderer) {
			Customize($$renderer, {
				children: ($$renderer) => {
					PreviewColorPicker($$renderer, {
						title: 'Base Color',
						value: baseColor,
						onChange: (v) => baseColor = v
					});

					$$renderer.push(`<!----> `);

					PreviewColorPicker($$renderer, {
						title: 'Active Color',
						value: activeColor,
						onChange: (v) => activeColor = v
					});

					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Dot Size',
						min: 4,
						max: 40,
						step: 1,
						value: dotSize,
						onChange: (v) => dotSize = v
					});

					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Gap',
						min: 4,
						max: 80,
						step: 1,
						value: gap,
						onChange: (v) => gap = v
					});

					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Proximity',
						min: 20,
						max: 400,
						step: 1,
						value: proximity,
						onChange: (v) => proximity = v
					});

					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Shock Radius',
						min: 50,
						max: 500,
						step: 1,
						value: shockRadius,
						onChange: (v) => shockRadius = v
					});

					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Shock Strength',
						min: 0,
						max: 20,
						step: 0.1,
						value: shockStrength,
						onChange: (v) => shockStrength = v
					});

					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Resistance',
						min: 50,
						max: 3000,
						step: 10,
						value: resistance,
						onChange: (v) => resistance = v
					});

					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Return Duration',
						min: 0.1,
						max: 5,
						step: 0.05,
						value: returnDuration,
						onChange: (v) => returnDuration = v
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
			componentName: 'DotGrid',
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