import * as $ from 'svelte/internal/server';
import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
import Customize from '$lib/components/docs/preview/Customize.svelte';
import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
import PreviewSwitch from '$lib/components/docs/preview/PreviewSwitch.svelte';
import PreviewColorPicker from '$lib/components/docs/preview/PreviewColorPicker.svelte';
import PropTable from '$lib/components/docs/preview/PropTable.svelte';
import DemoCodeTab from '$lib/components/docs/preview/DemoCodeTab.svelte';
import MetaBalls from '$lib/components/library/Animations/MetaBalls/MetaBalls.svelte';
import source from '$lib/components/library/Animations/MetaBalls/MetaBalls.svelte?raw';

export default function MetaBallsDemo($$renderer) {
	const DEFAULTS = {
		color: '#FF8A4C',
		cursorBallColor: '#FF8A4C',
		speed: 0.3,
		animationSize: 30,
		ballCount: 15,
		clumpFactor: 1,
		enableMouseInteraction: true,
		hoverSmoothness: 0.15,
		cursorBallSize: 2
	};

	let color = DEFAULTS.color;
	let cursorBallColor = DEFAULTS.cursorBallColor;
	let speed = DEFAULTS.speed;
	let animationSize = DEFAULTS.animationSize;
	let ballCount = DEFAULTS.ballCount;
	let clumpFactor = DEFAULTS.clumpFactor;
	let enableMouseInteraction = DEFAULTS.enableMouseInteraction;
	let hoverSmoothness = DEFAULTS.hoverSmoothness;
	let cursorBallSize = DEFAULTS.cursorBallSize;
	const hasChanges = $.derived(() => color !== DEFAULTS.color || cursorBallColor !== DEFAULTS.cursorBallColor || speed !== DEFAULTS.speed || animationSize !== DEFAULTS.animationSize || ballCount !== DEFAULTS.ballCount || clumpFactor !== DEFAULTS.clumpFactor || enableMouseInteraction !== DEFAULTS.enableMouseInteraction || hoverSmoothness !== DEFAULTS.hoverSmoothness || cursorBallSize !== DEFAULTS.cursorBallSize);

	function reset() {
		color = DEFAULTS.color;
		cursorBallColor = DEFAULTS.cursorBallColor;
		speed = DEFAULTS.speed;
		animationSize = DEFAULTS.animationSize;
		ballCount = DEFAULTS.ballCount;
		clumpFactor = DEFAULTS.clumpFactor;
		enableMouseInteraction = DEFAULTS.enableMouseInteraction;
		hoverSmoothness = DEFAULTS.hoverSmoothness;
		cursorBallSize = DEFAULTS.cursorBallSize;
	}

	const usage = $.derived(() => `<MetaBalls color="${color}" cursorBallColor="${cursorBallColor}" speed={${speed}} ballCount={${ballCount}} animationSize={${animationSize}} clumpFactor={${clumpFactor}} enableMouseInteraction={${enableMouseInteraction}} hoverSmoothness={${hoverSmoothness}} cursorBallSize={${cursorBallSize}} />`);

	const props = [
		{
			name: 'color',
			type: 'string',
			default: '"#ffffff"',
			description: 'Metaball color.'
		},

		{
			name: 'cursorBallColor',
			type: 'string',
			default: '"#ffffff"',
			description: 'Cursor ball color.'
		},

		{
			name: 'speed',
			type: 'number',
			default: '0.3',
			description: 'Animation speed.'
		},

		{
			name: 'animationSize',
			type: 'number',
			default: '30',
			description: 'Animation field size.'
		},

		{
			name: 'ballCount',
			type: 'number',
			default: '15',
			description: 'Number of balls (1-50).'
		},

		{
			name: 'clumpFactor',
			type: 'number',
			default: '1',
			description: 'How tightly balls cluster.'
		},

		{
			name: 'enableMouseInteraction',
			type: 'boolean',
			default: 'true',
			description: 'Cursor ball follows mouse.'
		},

		{
			name: 'enableTransparency',
			type: 'boolean',
			default: 'false',
			description: 'Transparent canvas background.'
		},

		{
			name: 'hoverSmoothness',
			type: 'number',
			default: '0.05',
			description: 'Cursor follow smoothness.'
		},

		{
			name: 'cursorBallSize',
			type: 'number',
			default: '3',
			description: 'Cursor ball radius.'
		}
	];

	$.head('1iwngh7', $$renderer, ($$renderer) => {
		$$renderer.title(($$renderer) => {
			$$renderer.push(`<title>Meta Balls - svelte-bits</title>`);
		});
	});

	$$renderer.push(`<h1 class="sub-category">Meta Balls</h1> `);

	{
		function preview($$renderer) {
			$$renderer.push(`<div class="demo-container" style="position:relative;height:500px;overflow:hidden;">`);

			MetaBalls($$renderer, {
				color,
				cursorBallColor,
				speed,
				animationSize,
				ballCount,
				clumpFactor,
				enableMouseInteraction,
				enableTransparency: true,
				hoverSmoothness,
				cursorBallSize
			});

			$$renderer.push(`<!----></div>`);
		}

		function code($$renderer) {
			DemoCodeTab($$renderer, { slug: 'meta-balls', usage: usage(), source });
		}

		function customize($$renderer) {
			Customize($$renderer, {
				children: ($$renderer) => {
					PreviewColorPicker($$renderer, { title: 'Color', value: color, onChange: (v) => color = v });
					$$renderer.push(`<!----> `);

					PreviewColorPicker($$renderer, {
						title: 'Cursor Ball Color',
						value: cursorBallColor,
						onChange: (v) => cursorBallColor = v
					});

					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Ball Count',
						min: 1,
						max: 50,
						step: 1,
						value: ballCount,
						onChange: (v) => ballCount = v
					});

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
						title: 'Animation Size',
						min: 5,
						max: 80,
						step: 1,
						value: animationSize,
						onChange: (v) => animationSize = v
					});

					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Clump Factor',
						min: 0,
						max: 3,
						step: 0.1,
						value: clumpFactor,
						onChange: (v) => clumpFactor = v
					});

					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Hover Smoothness',
						min: 0.01,
						max: 1,
						step: 0.01,
						value: hoverSmoothness,
						onChange: (v) => hoverSmoothness = v
					});

					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Cursor Ball Size',
						min: 0.5,
						max: 10,
						step: 0.1,
						value: cursorBallSize,
						onChange: (v) => cursorBallSize = v
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
			componentName: 'MetaBalls',
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