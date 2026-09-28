import * as $ from 'svelte/internal/server';
import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
import Customize from '$lib/components/docs/preview/Customize.svelte';
import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
import PreviewSwitch from '$lib/components/docs/preview/PreviewSwitch.svelte';
import PropTable from '$lib/components/docs/preview/PropTable.svelte';
import DemoCodeTab from '$lib/components/docs/preview/DemoCodeTab.svelte';
import Counter from '$lib/components/library/Components/Counter/Counter.svelte';
import source from '$lib/components/library/Components/Counter/Counter.svelte?raw';

export default function CounterDemo($$renderer) {
	const DEFAULTS = { digitPlaceHolders: true, value: 1, fontSize: 80, gap: 10 };
	let digitPlaceHolders = DEFAULTS.digitPlaceHolders;
	let value = DEFAULTS.value;
	let fontSize = DEFAULTS.fontSize;
	let gap = DEFAULTS.gap;
	const roundToTenth = (n) => Math.round(n * 10) / 10;
	const hasChanges = $.derived(() => digitPlaceHolders !== DEFAULTS.digitPlaceHolders || value !== DEFAULTS.value || fontSize !== DEFAULTS.fontSize || gap !== DEFAULTS.gap);

	function reset() {
		digitPlaceHolders = DEFAULTS.digitPlaceHolders;
		value = DEFAULTS.value;
		fontSize = DEFAULTS.fontSize;
		gap = DEFAULTS.gap;
	}

	const usage = $.derived(() => `<Counter value={${digitPlaceHolders ? `parseFloat((${value}).toFixed(1))` : value}} ${digitPlaceHolders ? `places={[100, 10, 1, '.', 0.1]} ` : ''}gradientFrom="#14110E" fontSize={${fontSize}} padding={5} gap={${gap}} borderRadius={10} horizontalPadding={15} textColor="white" fontWeight={900} />`);

	const props = [
		{
			name: 'value',
			type: 'number',
			default: '-',
			description: 'The numeric value to display in the counter.'
		},

		{
			name: 'fontSize',
			type: 'number',
			default: '100',
			description: 'The base font size used for the counter digits.'
		},

		{
			name: 'padding',
			type: 'number',
			default: '0',
			description: 'Additional padding added to the digit height.'
		},

		{
			name: 'places',
			type: 'number[]',
			default: '[100, 10, 1, ".", 0.1]',
			description: 'Defines which digit positions to display. Use "." for the decimal point. If omitted, place values will be detected automatically.'
		},

		{
			name: 'gap',
			type: 'number',
			default: '8',
			description: 'The gap (in pixels) between each digit.'
		},

		{
			name: 'borderRadius',
			type: 'number',
			default: '4',
			description: 'Border radius (in pixels) for the counter container.'
		},

		{
			name: 'horizontalPadding',
			type: 'number',
			default: '8',
			description: 'Horizontal padding (in pixels) for the counter container.'
		},

		{
			name: 'textColor',
			type: 'string',
			default: '"white"',
			description: 'Text color for the counter digits.'
		},

		{
			name: 'fontWeight',
			type: 'string | number',
			default: '"bold"',
			description: 'Font weight of the counter digits.'
		},

		{
			name: 'gradientHeight',
			type: 'number',
			default: '16',
			description: 'Height (in pixels) of the gradient overlays.'
		},

		{
			name: 'gradientFrom',
			type: 'string',
			default: '"black"',
			description: 'Starting color for the gradient overlays.'
		},

		{
			name: 'gradientTo',
			type: 'string',
			default: '"transparent"',
			description: 'Ending color for the gradient overlays.'
		}
	];

	$.head('h70fqo', $$renderer, ($$renderer) => {
		$$renderer.title(($$renderer) => {
			$$renderer.push(`<title>Counter - svelte-bits</title>`);
		});
	});

	$$renderer.push(`<h1 class="sub-category">Counter</h1> `);

	{
		function preview($$renderer) {
			$$renderer.push(`<div class="demo-container" style="position:relative;height:500px;overflow:hidden;">`);

			if (digitPlaceHolders) {
				$$renderer.push('<!--[0-->');

				Counter($$renderer, {
					value: parseFloat(value.toFixed(1)),
					places: [100, 10, 1, '.', 0.1],
					gradientFrom: '#14110E',
					fontSize,
					padding: 5,
					gap,
					borderRadius: 10,
					horizontalPadding: 15,
					textColor: 'white',
					fontWeight: 900
				});
			} else {
				$$renderer.push('<!--[-1-->');

				Counter($$renderer, {
					value,
					gradientFrom: '#14110E',
					fontSize,
					padding: 5,
					gap,
					borderRadius: 10,
					horizontalPadding: 15,
					textColor: 'white',
					fontWeight: 900
				});
			}

			$$renderer.push(`<!--]--> <div class="counter-controls svelte-h70fqo"><button type="button" class="counter-btn wide svelte-h70fqo">- 0.4</button> <button type="button" class="counter-btn svelte-h70fqo">-</button> <button type="button" class="counter-btn svelte-h70fqo">+</button> <button type="button" class="counter-btn wide svelte-h70fqo">+ 0.4</button></div></div>`);
		}

		function code($$renderer) {
			DemoCodeTab($$renderer, { slug: 'counter', usage: usage(), source });
		}

		function customize($$renderer) {
			Customize($$renderer, {
				children: ($$renderer) => {
					PreviewSwitch($$renderer, {
						title: 'Digit Place Holders',
						checked: digitPlaceHolders,
						onChange: (v) => digitPlaceHolders = v
					});

					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Value',
						min: 0,
						max: 999,
						step: 1,
						value,
						onChange: (v) => value = v
					});

					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Gap',
						min: 0,
						max: 50,
						step: 10,
						value: gap,
						onChange: (v) => gap = v
					});

					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Font Size',
						min: 40,
						max: 200,
						step: 10,
						value: fontSize,
						onChange: (v) => fontSize = v
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
			componentName: 'Counter',
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