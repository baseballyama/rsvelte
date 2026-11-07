import * as $ from 'svelte/internal/server';
import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
import Customize from '$lib/components/docs/preview/Customize.svelte';
import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
import PropTable from '$lib/components/docs/preview/PropTable.svelte';
import DemoCodeTab from '$lib/components/docs/preview/DemoCodeTab.svelte';
import ShapeBlur from '$lib/components/library/Animations/ShapeBlur/ShapeBlur.svelte';
import source from '$lib/components/library/Animations/ShapeBlur/ShapeBlur.svelte?raw';

export default function ShapeBlurDemo($$renderer) {
	const DEFAULTS = {
		shapeSize: 1.0,
		roundness: 0.5,
		borderSize: 0.05,
		circleSize: 0.25,
		circleEdge: 1
	};

	let shapeSize = DEFAULTS.shapeSize;
	let roundness = DEFAULTS.roundness;
	let borderSize = DEFAULTS.borderSize;
	let circleSize = DEFAULTS.circleSize;
	let circleEdge = DEFAULTS.circleEdge;
	const hasChanges = $.derived(() => shapeSize !== DEFAULTS.shapeSize || roundness !== DEFAULTS.roundness || borderSize !== DEFAULTS.borderSize || circleSize !== DEFAULTS.circleSize || circleEdge !== DEFAULTS.circleEdge);

	function reset() {
		shapeSize = DEFAULTS.shapeSize;
		roundness = DEFAULTS.roundness;
		borderSize = DEFAULTS.borderSize;
		circleSize = DEFAULTS.circleSize;
		circleEdge = DEFAULTS.circleEdge;
	}

	const usage = $.derived(() => `<ShapeBlur shapeSize={${shapeSize}} roundness={${roundness}} borderSize={${borderSize}} circleSize={${circleSize}} circleEdge={${circleEdge}} />`);

	const props = [
		{
			name: 'variation',
			type: 'number',
			default: '0',
			description: 'Shape variation index (0-3).'
		},

		{
			name: 'shapeSize',
			type: 'number',
			default: '1.2',
			description: 'Shape size in shader units.'
		},

		{
			name: 'roundness',
			type: 'number',
			default: '0.4',
			description: 'Corner roundness.'
		},

		{
			name: 'borderSize',
			type: 'number',
			default: '0.05',
			description: 'Border thickness.'
		},

		{
			name: 'circleSize',
			type: 'number',
			default: '0.3',
			description: 'Cursor reveal radius.'
		},

		{
			name: 'circleEdge',
			type: 'number',
			default: '0.5',
			description: 'Cursor reveal edge softness.'
		},

		{
			name: 'pixelRatioProp',
			type: 'number',
			default: 'devicePixelRatio',
			description: 'Render pixel ratio.'
		}
	];

	$.head('o41bhs', $$renderer, ($$renderer) => {
		$$renderer.title(($$renderer) => {
			$$renderer.push(`<title>Shape Blur - svelte-bits</title>`);
		});
	});

	$$renderer.push(`<h1 class="sub-category">Shape Blur</h1> `);

	{
		function preview($$renderer) {
			$$renderer.push(`<div class="demo-container" style="position:relative;height:500px;overflow:hidden;">`);
			ShapeBlur($$renderer, { shapeSize, roundness, borderSize, circleSize, circleEdge });
			$$renderer.push(`<!----></div>`);
		}

		function code($$renderer) {
			DemoCodeTab($$renderer, { slug: 'shape-blur', usage: usage(), source });
		}

		function customize($$renderer) {
			Customize($$renderer, {
				children: ($$renderer) => {
					PreviewSlider($$renderer, {
						title: 'Shape Size',
						min: 0.1,
						max: 2,
						step: 0.05,
						value: shapeSize,
						onChange: (v) => shapeSize = v
					});

					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Roundness',
						min: 0,
						max: 1,
						step: 0.05,
						value: roundness,
						onChange: (v) => roundness = v
					});

					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Border Size',
						min: 0,
						max: 0.3,
						step: 0.01,
						value: borderSize,
						onChange: (v) => borderSize = v
					});

					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Circle Size',
						min: 0.05,
						max: 1,
						step: 0.05,
						value: circleSize,
						onChange: (v) => circleSize = v
					});

					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Circle Edge',
						min: 0,
						max: 2,
						step: 0.05,
						value: circleEdge,
						onChange: (v) => circleEdge = v
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
			componentName: 'ShapeBlur',
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