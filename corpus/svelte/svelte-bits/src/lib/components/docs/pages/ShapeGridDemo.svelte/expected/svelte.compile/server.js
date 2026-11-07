import * as $ from 'svelte/internal/server';
import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
import Customize from '$lib/components/docs/preview/Customize.svelte';
import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
import PreviewSelect from '$lib/components/docs/preview/PreviewSelect.svelte';
import PreviewColorPicker from '$lib/components/docs/preview/PreviewColorPicker.svelte';
import PropTable from '$lib/components/docs/preview/PropTable.svelte';
import DemoCodeTab from '$lib/components/docs/preview/DemoCodeTab.svelte';
import BackgroundContentToggle from '$lib/components/docs/preview/BackgroundContentToggle.svelte';
import ShapeGrid from '$lib/components/library/Backgrounds/ShapeGrid/ShapeGrid.svelte';
import source from '$lib/components/library/Backgrounds/ShapeGrid/ShapeGrid.svelte?raw';

export default function ShapeGridDemo($$renderer) {
	const DEFAULTS = {
		shape: 'square',
		direction: 'right',
		speed: 1,
		squareSize: 40,
		hoverTrailAmount: 0,
		borderColor: '#999999',
		hoverFillColor: '#222222'
	};

	let shape = DEFAULTS.shape;
	let direction = DEFAULTS.direction;
	let speed = DEFAULTS.speed;
	let squareSize = DEFAULTS.squareSize;
	let hoverTrailAmount = DEFAULTS.hoverTrailAmount;
	let borderColor = DEFAULTS.borderColor;
	let hoverFillColor = DEFAULTS.hoverFillColor;
	let showContent = true;
	const scriptOpen = '<' + 'script lang="ts">';
	const scriptClose = '</' + 'script>';
	const hasChanges = $.derived(() => shape !== DEFAULTS.shape || direction !== DEFAULTS.direction || speed !== DEFAULTS.speed || squareSize !== DEFAULTS.squareSize || hoverTrailAmount !== DEFAULTS.hoverTrailAmount || borderColor !== DEFAULTS.borderColor || hoverFillColor !== DEFAULTS.hoverFillColor);

	function reset() {
		shape = DEFAULTS.shape;
		direction = DEFAULTS.direction;
		speed = DEFAULTS.speed;
		squareSize = DEFAULTS.squareSize;
		hoverTrailAmount = DEFAULTS.hoverTrailAmount;
		borderColor = DEFAULTS.borderColor;
		hoverFillColor = DEFAULTS.hoverFillColor;
	}

	const usage = $.derived(() => `${scriptOpen}
  import ShapeGrid from '$lib/components/ShapeGrid.svelte';
${scriptClose}

<ShapeGrid
  shape="${shape}"
  direction="${direction}"
  speed={${speed}}
  squareSize={${squareSize}}
  hoverTrailAmount={${hoverTrailAmount}}
  borderColor="${borderColor}"
  hoverFillColor="${hoverFillColor}"
/>`);

	const props = [
		{
			name: 'shape',
			type: '"square" | "hexagon" | "circle" | "triangle"',
			default: '"square"',
			description: 'Cell shape rendered across the grid.'
		},

		{
			name: 'direction',
			type: '"diagonal" | "up" | "right" | "down" | "left"',
			default: '"right"',
			description: 'Direction the grid scrolls.'
		},

		{
			name: 'speed',
			type: 'number',
			default: '1',
			description: 'Animation speed multiplier.'
		},

		{
			name: 'squareSize',
			type: 'number',
			default: '40',
			description: 'Cell size in pixels.'
		},

		{
			name: 'borderColor',
			type: 'string',
			default: '"#999"',
			description: 'Stroke color of grid cells.'
		},

		{
			name: 'hoverFillColor',
			type: 'string',
			default: '"#222"',
			description: 'Fill color of hovered cells.'
		},

		{
			name: 'hoverTrailAmount',
			type: 'number',
			default: '0',
			description: 'Number of trailing cells highlighted behind the cursor.'
		},

		{
			name: 'fadeColor',
			type: 'string',
			default: '"#14110E"',
			description: 'Color used for the radial fade towards edges.'
		}
	];

	$.head('x3ysnj', $$renderer, ($$renderer) => {
		$$renderer.title(($$renderer) => {
			$$renderer.push(`<title>Shape Grid - svelte-bits</title>`);
		});
	});

	$$renderer.push(`<h1 class="sub-category">Shape Grid</h1> `);

	{
		function preview($$renderer) {
			$$renderer.push(`<div style="position:relative;width:100%;height:400px;border-radius:14px;overflow:hidden;background:var(--bg-body);">`);

			ShapeGrid($$renderer, {
				shape,
				direction,
				speed,
				squareSize,
				hoverTrailAmount,
				borderColor,
				hoverFillColor
			});

			$$renderer.push(`<!----> `);
			BackgroundContentToggle($$renderer, { showContent, onToggle: (v) => showContent = v });
			$$renderer.push(`<!----></div>`);
		}

		function code($$renderer) {
			DemoCodeTab($$renderer, { slug: 'shape-grid', usage: usage(), source });
		}

		function customize($$renderer) {
			Customize($$renderer, {
				children: ($$renderer) => {
					PreviewSelect($$renderer, {
						title: 'Shape',
						value: shape,
						options: ['square', 'hexagon', 'circle', 'triangle'],
						onChange: (v) => shape = v
					});

					$$renderer.push(`<!----> `);

					PreviewSelect($$renderer, {
						title: 'Direction',
						value: direction,
						options: ['right', 'left', 'up', 'down', 'diagonal'],
						onChange: (v) => direction = v
					});

					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Speed',
						min: 0.1,
						max: 3,
						step: 0.1,
						value: speed,
						valueUnit: 'x',
						onChange: (v) => speed = v
					});

					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Square Size',
						min: 10,
						max: 100,
						step: 1,
						value: squareSize,
						onChange: (v) => squareSize = v
					});

					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Hover Trail',
						min: 0,
						max: 20,
						step: 1,
						value: hoverTrailAmount,
						onChange: (v) => hoverTrailAmount = v
					});

					$$renderer.push(`<!----> `);

					PreviewColorPicker($$renderer, {
						title: 'Border Color',
						value: borderColor,
						onChange: (v) => borderColor = v
					});

					$$renderer.push(`<!----> `);

					PreviewColorPicker($$renderer, {
						title: 'Hover Fill',
						value: hoverFillColor,
						onChange: (v) => hoverFillColor = v
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
			componentName: 'ShapeGrid',
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