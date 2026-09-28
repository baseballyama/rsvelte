import * as $ from 'svelte/internal/server';
import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
import Customize from '$lib/components/docs/preview/Customize.svelte';
import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
import PreviewSwitch from '$lib/components/docs/preview/PreviewSwitch.svelte';
import PreviewColorPicker from '$lib/components/docs/preview/PreviewColorPicker.svelte';
import PropTable from '$lib/components/docs/preview/PropTable.svelte';
import DemoCodeTab from '$lib/components/docs/preview/DemoCodeTab.svelte';
import PixelTrail from '$lib/components/library/Animations/PixelTrail/PixelTrail.svelte';
import source from '$lib/components/library/Animations/PixelTrail/PixelTrail.svelte?raw';

export default function PixelTrailDemo($$renderer) {
	const DEFAULTS = {
		gridSize: 50,
		trailSize: 0.1,
		maxAge: 250,
		interpolate: 5,
		color: '#FF8A4C',
		gooeyEnabled: true,
		gooStrength: 2
	};

	let gridSize = DEFAULTS.gridSize;
	let trailSize = DEFAULTS.trailSize;
	let maxAge = DEFAULTS.maxAge;
	let interpolate = DEFAULTS.interpolate;
	let color = DEFAULTS.color;
	let gooeyEnabled = DEFAULTS.gooeyEnabled;
	let gooStrength = DEFAULTS.gooStrength;

	const gooeyFilter = $.derived(() => gooeyEnabled
		? { id: 'pixel-trail-goo', strength: gooStrength }
		: undefined);

	const hasChanges = $.derived(() => gridSize !== DEFAULTS.gridSize || trailSize !== DEFAULTS.trailSize || maxAge !== DEFAULTS.maxAge || interpolate !== DEFAULTS.interpolate || color !== DEFAULTS.color || gooeyEnabled !== DEFAULTS.gooeyEnabled || gooStrength !== DEFAULTS.gooStrength);

	function reset() {
		gridSize = DEFAULTS.gridSize;
		trailSize = DEFAULTS.trailSize;
		maxAge = DEFAULTS.maxAge;
		interpolate = DEFAULTS.interpolate;
		color = DEFAULTS.color;
		gooeyEnabled = DEFAULTS.gooeyEnabled;
		gooStrength = DEFAULTS.gooStrength;
	}

	const usage = $.derived(() => `<PixelTrail gridSize={${gridSize}} trailSize={${trailSize}} maxAge={${maxAge}} interpolate={${interpolate}} color="${color}" gooeyEnabled={${gooeyEnabled}} gooStrength={${gooStrength}} />`);

	const props = [
		{
			name: 'gridSize',
			type: 'number',
			default: '40',
			description: 'Grid resolution (cells per axis).'
		},

		{
			name: 'trailSize',
			type: 'number',
			default: '0.1',
			description: 'Trail brush size in grid units.'
		},

		{
			name: 'maxAge',
			type: 'number',
			default: '250',
			description: 'Trail lifetime in milliseconds.'
		},

		{
			name: 'interpolate',
			type: 'number',
			default: '5',
			description: 'Interpolation density between cursor samples.'
		},

		{
			name: 'color',
			type: 'string',
			default: '"#ffffff"',
			description: 'Trail color.'
		},

		{
			name: 'gooeyEnabled',
			type: 'boolean',
			default: 'true',
			description: 'Enable SVG goo filter.'
		},

		{
			name: 'gooStrength',
			type: 'number',
			default: '2',
			description: 'Goo blur intensity.'
		}
	];

	$.head('1dewshm', $$renderer, ($$renderer) => {
		$$renderer.title(($$renderer) => {
			$$renderer.push(`<title>Pixel Trail - svelte-bits</title>`);
		});
	});

	$$renderer.push(`<h1 class="sub-category">Pixel Trail</h1> `);

	{
		function preview($$renderer) {
			$$renderer.push(`<div class="demo-container" style="position:relative;height:500px;overflow:hidden;"><!---->`);

			{
				PixelTrail($$renderer, {
					gridSize,
					trailSize,
					maxAge,
					interpolate,
					color,
					gooeyFilter: gooeyFilter()
				});
			}

			$$renderer.push(`<!----></div>`);
		}

		function code($$renderer) {
			DemoCodeTab($$renderer, { slug: 'pixel-trail', usage: usage(), source });
		}

		function customize($$renderer) {
			Customize($$renderer, {
				children: ($$renderer) => {
					PreviewColorPicker($$renderer, { title: 'Color', value: color, onChange: (v) => color = v });
					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Grid Size',
						min: 10,
						max: 120,
						step: 1,
						value: gridSize,
						onChange: (v) => gridSize = v
					});

					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Trail Size',
						min: 0.01,
						max: 1,
						step: 0.01,
						value: trailSize,
						onChange: (v) => trailSize = v
					});

					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Max Age',
						min: 50,
						max: 2000,
						step: 50,
						value: maxAge,
						valueUnit: 'ms',
						onChange: (v) => maxAge = v
					});

					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Interpolate',
						min: 0,
						max: 20,
						step: 1,
						value: interpolate,
						onChange: (v) => interpolate = v
					});

					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Goo Strength',
						min: 0,
						max: 10,
						step: 0.1,
						value: gooStrength,
						onChange: (v) => gooStrength = v
					});

					$$renderer.push(`<!----> `);

					PreviewSwitch($$renderer, {
						title: 'Gooey Enabled',
						checked: gooeyEnabled,
						onChange: (v) => gooeyEnabled = v
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
			componentName: 'PixelTrail',
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