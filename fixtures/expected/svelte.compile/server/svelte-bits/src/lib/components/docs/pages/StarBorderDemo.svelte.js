import * as $ from 'svelte/internal/server';
import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
import Customize from '$lib/components/docs/preview/Customize.svelte';
import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
import PreviewColorPicker from '$lib/components/docs/preview/PreviewColorPicker.svelte';
import PropTable from '$lib/components/docs/preview/PropTable.svelte';
import DemoCodeTab from '$lib/components/docs/preview/DemoCodeTab.svelte';
import StarBorder from '$lib/components/library/Animations/StarBorder/StarBorder.svelte';
import starBorderSource from '$lib/components/library/Animations/StarBorder/StarBorder.svelte?raw';

export default function StarBorderDemo($$renderer) {
	const DEFAULTS = { color: '#FF8A4C', speed: 6, thickness: 1 };
	let color = DEFAULTS.color;
	let speed = DEFAULTS.speed;
	let thickness = DEFAULTS.thickness;
	const hasChanges = $.derived(() => color !== DEFAULTS.color || speed !== DEFAULTS.speed || thickness !== DEFAULTS.thickness);

	function reset() {
		color = DEFAULTS.color;
		speed = DEFAULTS.speed;
		thickness = DEFAULTS.thickness;
	}

	const usage = $.derived(() => `${'<' + 'script lang="ts">'}
  import StarBorder from '$lib/components/StarBorder.svelte';
${'</' + 'script>'}

<StarBorder
  as="button"
  color="${color}"
  speed="${speed}s"
  thickness={${thickness}}
>
  Star Border
</StarBorder>`);

	const props = [
		{
			name: 'as',
			type: 'string',
			default: '"button"',
			description: 'HTML tag for the wrapper element.'
		},

		{
			name: 'children',
			type: 'Snippet',
			default: '-',
			description: 'Content rendered inside the bordered surface.'
		},

		{
			name: 'color',
			type: 'string',
			default: '"white"',
			description: 'Color of the orbiting radial gradient sweeps.'
		},

		{
			name: 'speed',
			type: 'string',
			default: '"6s"',
			description: 'CSS animation-duration string (e.g. "6s", "2000ms").'
		},

		{
			name: 'thickness',
			type: 'number',
			default: '1',
			description: 'Vertical padding (px) controlling visible border thickness.'
		},

		{
			name: 'class',
			type: 'string',
			default: '""',
			description: 'Extra classes for the wrapper.'
		}
	];

	$.head('j7axi8', $$renderer, ($$renderer) => {
		$$renderer.title(($$renderer) => {
			$$renderer.push(`<title>Star Border - svelte-bits</title>`);
		});
	});

	$$renderer.push(`<h1 class="sub-category">Star Border</h1> `);

	{
		function preview($$renderer) {
			$$renderer.push(`<div style="min-height:400px;display:flex;align-items:center;justify-content:center;width:100%;">`);

			StarBorder($$renderer, {
				as: 'button',
				color,
				speed: `${speed}s`,
				thickness,
				children: ($$renderer) => {
					$$renderer.push(`<!---->Star Border`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----></div>`);
		}

		function code($$renderer) {
			DemoCodeTab($$renderer, {
				slug: 'star-border',
				usage: usage(),
				source: starBorderSource
			});
		}

		function customize($$renderer) {
			Customize($$renderer, {
				children: ($$renderer) => {
					PreviewColorPicker($$renderer, { title: 'Color', value: color, onChange: (v) => color = v });
					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Speed',
						min: 1,
						max: 20,
						step: 0.5,
						value: speed,
						valueUnit: 's',
						onChange: (v) => speed = v
					});

					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Thickness',
						min: 1,
						max: 10,
						step: 1,
						value: thickness,
						valueUnit: 'px',
						onChange: (v) => thickness = v
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
			componentName: 'StarBorder',
			usage: usage(),
			source: starBorderSource,
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