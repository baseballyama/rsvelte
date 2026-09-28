import * as $ from 'svelte/internal/server';
import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
import Customize from '$lib/components/docs/preview/Customize.svelte';
import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
import PreviewColorPicker from '$lib/components/docs/preview/PreviewColorPicker.svelte';
import PropTable from '$lib/components/docs/preview/PropTable.svelte';
import DemoCodeTab from '$lib/components/docs/preview/DemoCodeTab.svelte';
import ElectricBorder from '$lib/components/library/Animations/ElectricBorder/ElectricBorder.svelte';
import source from '$lib/components/library/Animations/ElectricBorder/ElectricBorder.svelte?raw';

export default function ElectricBorderDemo($$renderer) {
	const DEFAULTS = { color: '#FF8A4C', speed: 1, chaos: 0.12, borderRadius: 16 };
	let color = DEFAULTS.color;
	let speed = DEFAULTS.speed;
	let chaos = DEFAULTS.chaos;
	let borderRadius = DEFAULTS.borderRadius;
	const hasChanges = $.derived(() => color !== DEFAULTS.color || speed !== DEFAULTS.speed || chaos !== DEFAULTS.chaos || borderRadius !== DEFAULTS.borderRadius);

	function reset() {
		color = DEFAULTS.color;
		speed = DEFAULTS.speed;
		chaos = DEFAULTS.chaos;
		borderRadius = DEFAULTS.borderRadius;
	}

	const usage = $.derived(() => `<ElectricBorder color="${color}" speed={${speed}} chaos={${chaos}} borderRadius={${borderRadius}}>
  <div>Your content</div>
</ElectricBorder>`);

	const props = [
		{
			name: 'children',
			type: 'Snippet',
			default: 'required',
			description: 'Content wrapped by the electric border.'
		},

		{
			name: 'color',
			type: 'string',
			default: '"#FF8A4C"',
			description: 'Border color.'
		},

		{
			name: 'speed',
			type: 'number',
			default: '1',
			description: 'Animation speed multiplier.'
		},

		{
			name: 'chaos',
			type: 'number',
			default: '0.12',
			description: 'Distortion noise scale.'
		},

		{
			name: 'borderRadius',
			type: 'number',
			default: '24',
			description: 'Corner radius (px).'
		},

		{
			name: 'class',
			type: 'string',
			default: '""',
			description: 'Wrapper class.'
		},

		{
			name: 'style',
			type: 'string',
			default: '""',
			description: 'Inline style.'
		}
	];

	$.head('zpom17', $$renderer, ($$renderer) => {
		$$renderer.title(($$renderer) => {
			$$renderer.push(`<title>Electric Border - svelte-bits</title>`);
		});
	});

	$$renderer.push(`<h1 class="sub-category">Electric Border</h1> `);

	{
		function preview($$renderer) {
			$$renderer.push(`<div class="demo-container" style="position:relative;height:500px;display:flex;align-items:center;justify-content:center;">`);

			ElectricBorder($$renderer, {
				color,
				speed,
				chaos,
				borderRadius,
				style: 'width:300px;',
				children: ($$renderer) => {
					$$renderer.push(`<div style="padding:2rem 1.5rem;background:#0a0a0a;border-radius:16px;color:#fff;text-align:center;"><h3 style="margin:0 0 .5rem;font-size:1.25rem;font-weight:700;">Electric</h3> <p style="margin:0;color:#aaa;font-size:.9rem;">Hover, click, or just admire the bouncy current crawling around the edges.</p></div>`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----></div>`);
		}

		function code($$renderer) {
			DemoCodeTab($$renderer, { slug: 'electric-border', usage: usage(), source });
		}

		function customize($$renderer) {
			Customize($$renderer, {
				children: ($$renderer) => {
					PreviewColorPicker($$renderer, { title: 'Color', value: color, onChange: (v) => color = v });
					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Speed',
						min: 0,
						max: 5,
						step: 0.1,
						value: speed,
						onChange: (v) => speed = v
					});

					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Chaos',
						min: 0,
						max: 2,
						step: 0.05,
						value: chaos,
						onChange: (v) => chaos = v
					});

					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Border Radius',
						min: 0,
						max: 64,
						step: 1,
						value: borderRadius,
						valueUnit: 'px',
						onChange: (v) => borderRadius = v
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
			componentName: 'ElectricBorder',
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