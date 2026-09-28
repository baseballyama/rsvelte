import * as $ from 'svelte/internal/server';
import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
import Customize from '$lib/components/docs/preview/Customize.svelte';
import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
import PreviewSwitch from '$lib/components/docs/preview/PreviewSwitch.svelte';
import PreviewColorPicker from '$lib/components/docs/preview/PreviewColorPicker.svelte';
import PreviewSelect from '$lib/components/docs/preview/PreviewSelect.svelte';
import PropTable from '$lib/components/docs/preview/PropTable.svelte';
import DemoCodeTab from '$lib/components/docs/preview/DemoCodeTab.svelte';
import CursorGrid from '$lib/components/library/Animations/CursorGrid/CursorGrid.svelte';
import source from '$lib/components/library/Animations/CursorGrid/CursorGrid.svelte?raw';

export default function CursorGridDemo($$renderer) {
	const D = {
		cellSize: 70,
		color: '#D946EF',
		radius: 140,
		falloff: 'smooth',
		holdTime: 400,
		fadeDuration: 800,
		lineWidth: 1.2,
		maxOpacity: 1,
		fillOpacity: 0,
		gridOpacity: 0,
		cellRadius: 0,
		clickPulse: true,
		pulseSpeed: 600
	};

	let cellSize = D.cellSize;
	let color = D.color;
	let radius = D.radius;
	let falloff = D.falloff;
	let holdTime = D.holdTime;
	let fadeDuration = D.fadeDuration;
	let lineWidth = D.lineWidth;
	let maxOpacity = D.maxOpacity;
	let fillOpacity = D.fillOpacity;
	let gridOpacity = D.gridOpacity;
	let cellRadius = D.cellRadius;
	let clickPulse = D.clickPulse;
	let pulseSpeed = D.pulseSpeed;
	const hasChanges = $.derived(() => cellSize !== D.cellSize || color !== D.color || radius !== D.radius || falloff !== D.falloff || holdTime !== D.holdTime || fadeDuration !== D.fadeDuration || lineWidth !== D.lineWidth || maxOpacity !== D.maxOpacity || fillOpacity !== D.fillOpacity || gridOpacity !== D.gridOpacity || cellRadius !== D.cellRadius || clickPulse !== D.clickPulse || pulseSpeed !== D.pulseSpeed);

	function reset() {
		cellSize = D.cellSize;
		color = D.color;
		radius = D.radius;
		falloff = D.falloff;
		holdTime = D.holdTime;
		fadeDuration = D.fadeDuration;
		lineWidth = D.lineWidth;
		maxOpacity = D.maxOpacity;
		fillOpacity = D.fillOpacity;
		gridOpacity = D.gridOpacity;
		cellRadius = D.cellRadius;
		clickPulse = D.clickPulse;
		pulseSpeed = D.pulseSpeed;
	}

	const usage = $.derived(() => `<CursorGrid cellSize={${cellSize}} color="${color}" radius={${radius}} falloff="${falloff}" clickPulse={${clickPulse}} />`);

	const props = [
		{
			name: 'cellSize',
			type: 'number',
			default: '70',
			description: 'Grid cell size in px.'
		},

		{
			name: 'color',
			type: 'string',
			default: '"#D946EF"',
			description: 'Color of lit cells.'
		},

		{
			name: 'radius',
			type: 'number',
			default: '140',
			description: 'Cursor influence radius in px.'
		},

		{
			name: 'falloff',
			type: '"linear" | "smooth" | "sharp"',
			default: '"smooth"',
			description: 'Easing curve mapping distance to brightness.'
		},

		{
			name: 'holdTime',
			type: 'number',
			default: '400',
			description: 'Time in ms a cell stays lit before fading.'
		},

		{
			name: 'fadeDuration',
			type: 'number',
			default: '800',
			description: 'Fade-out duration in ms.'
		},

		{
			name: 'lineWidth',
			type: 'number',
			default: '1.2',
			description: 'Cell stroke width in px.'
		},

		{
			name: 'maxOpacity',
			type: 'number',
			default: '1',
			description: 'Maximum stroke opacity for a lit cell.'
		},

		{
			name: 'fillOpacity',
			type: 'number',
			default: '0',
			description: 'Fill opacity for a lit cell.'
		},

		{
			name: 'gridOpacity',
			type: 'number',
			default: '0',
			description: 'Opacity of the faint static lattice.'
		},

		{
			name: 'cellRadius',
			type: 'number',
			default: '0',
			description: 'Corner radius of each cell in px.'
		},

		{
			name: 'clickPulse',
			type: 'boolean',
			default: 'true',
			description: 'Emit an expanding ring pulse on click.'
		},

		{
			name: 'pulseSpeed',
			type: 'number',
			default: '600',
			description: 'Click pulse expansion speed in px/s.'
		},

		{
			name: 'class',
			type: 'string',
			default: '""',
			description: 'Extra classes for the wrapper.'
		}
	];

	$.head('wmccys', $$renderer, ($$renderer) => {
		$$renderer.title(($$renderer) => {
			$$renderer.push(`<title>Cursor Grid - svelte-bits</title>`);
		});
	});

	$$renderer.push(`<h1 class="sub-category">Cursor Grid</h1> `);

	{
		function preview($$renderer) {
			$$renderer.push(`<div class="relative h-[500px] w-full overflow-hidden rounded-[14px]">`);

			CursorGrid($$renderer, {
				cellSize,
				color,
				radius,
				falloff,
				holdTime,
				fadeDuration,
				lineWidth,
				maxOpacity,
				fillOpacity,
				gridOpacity,
				cellRadius,
				clickPulse,
				pulseSpeed
			});

			$$renderer.push(`<!----> <p class="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center text-[clamp(2rem,6vw,3rem)] font-black" style="color:var(--text-secondary)">Move Your Cursor</p></div>`);
		}

		function code($$renderer) {
			DemoCodeTab($$renderer, { slug: 'cursor-grid', usage: usage(), source });
		}

		function customize($$renderer) {
			Customize($$renderer, {
				children: ($$renderer) => {
					PreviewColorPicker($$renderer, { title: 'Color', value: color, onChange: (v) => color = v });
					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Cell Size',
						min: 20,
						max: 160,
						step: 2,
						value: cellSize,
						valueUnit: 'px',
						onChange: (v) => cellSize = v
					});

					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Radius',
						min: 20,
						max: 400,
						step: 5,
						value: radius,
						valueUnit: 'px',
						onChange: (v) => radius = v
					});

					$$renderer.push(`<!----> `);

					PreviewSelect($$renderer, {
						title: 'Falloff',
						value: falloff,
						options: [
							{ label: 'Linear', value: 'linear' },
							{ label: 'Smooth', value: 'smooth' },
							{ label: 'Sharp', value: 'sharp' }
						],
						onChange: (v) => falloff = v
					});

					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Hold Time',
						min: 0,
						max: 2000,
						step: 50,
						value: holdTime,
						valueUnit: 'ms',
						onChange: (v) => holdTime = v
					});

					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Fade Duration',
						min: 100,
						max: 3000,
						step: 50,
						value: fadeDuration,
						valueUnit: 'ms',
						onChange: (v) => fadeDuration = v
					});

					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Line Width',
						min: 0.5,
						max: 6,
						step: 0.1,
						value: lineWidth,
						valueUnit: 'px',
						onChange: (v) => lineWidth = v
					});

					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Max Opacity',
						min: 0,
						max: 1,
						step: 0.01,
						value: maxOpacity,
						onChange: (v) => maxOpacity = v
					});

					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Fill Opacity',
						min: 0,
						max: 1,
						step: 0.01,
						value: fillOpacity,
						onChange: (v) => fillOpacity = v
					});

					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Grid Opacity',
						min: 0,
						max: 1,
						step: 0.01,
						value: gridOpacity,
						onChange: (v) => gridOpacity = v
					});

					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Cell Radius',
						min: 0,
						max: 40,
						step: 1,
						value: cellRadius,
						valueUnit: 'px',
						onChange: (v) => cellRadius = v
					});

					$$renderer.push(`<!----> `);

					PreviewSwitch($$renderer, {
						title: 'Click Pulse',
						checked: clickPulse,
						onChange: (v) => clickPulse = v
					});

					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Pulse Speed',
						min: 100,
						max: 2000,
						step: 25,
						value: pulseSpeed,
						valueUnit: 'px/s',
						onChange: (v) => pulseSpeed = v
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
			componentName: 'CursorGrid',
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