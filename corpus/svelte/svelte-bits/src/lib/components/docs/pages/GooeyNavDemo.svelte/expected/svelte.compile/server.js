import * as $ from 'svelte/internal/server';
import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
import Customize from '$lib/components/docs/preview/Customize.svelte';
import PropTable from '$lib/components/docs/preview/PropTable.svelte';
import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
import DemoCodeTab from '$lib/components/docs/preview/DemoCodeTab.svelte';
import GooeyNav from '$lib/components/library/Components/GooeyNav/GooeyNav.svelte';
import source from '$lib/components/library/Components/GooeyNav/GooeyNav.svelte?raw';

export default function GooeyNavDemo($$renderer) {
	const DEFAULTS = { particleCount: 15, timeVariance: 300, particleR: 100 };
	let particleCount = DEFAULTS.particleCount;
	let timeVariance = DEFAULTS.timeVariance;
	let particleR = DEFAULTS.particleR;
	let key = 0;

	const items = [
		{ label: 'Home', href: '#' },
		{ label: 'About', href: '#' },
		{ label: 'Contact', href: '#' }
	];

	const usage = `<GooeyNav items={items} animationTime={500} particleCount={15} particleDistances={[90, 0]} particleR={100} timeVariance={300} initialActiveIndex={0} />`;

	const props = [
		{
			name: 'items',
			type: 'GooeyNavItem[]',
			default: '[]',
			description: 'Array of navigation items.'
		},

		{
			name: 'animationTime',
			type: 'number',
			default: '600',
			description: 'Duration (ms) of the main animation.'
		},

		{
			name: 'particleCount',
			type: 'number',
			default: '15',
			description: 'Number of bubble particles per transition.'
		},

		{
			name: 'particleDistances',
			type: '[number, number]',
			default: '[90, 10]',
			description: 'Outer and inner distances of bubble spread.'
		},

		{
			name: 'particleR',
			type: 'number',
			default: '100',
			description: 'Radius factor influencing random particle rotation.'
		},

		{
			name: 'timeVariance',
			type: 'number',
			default: '300',
			description: 'Random time variance (ms) for particle animations.'
		},

		{
			name: 'colors',
			type: 'number[]',
			default: '[1, 2, 3, 1, 2, 3, 1, 4]',
			description: 'Color indices used when creating bubble particles.'
		},

		{
			name: 'initialActiveIndex',
			type: 'number',
			default: '0',
			description: 'Which item is selected on mount.'
		}
	];

	const hasChanges = $.derived(() => particleCount !== DEFAULTS.particleCount || timeVariance !== DEFAULTS.timeVariance || particleR !== DEFAULTS.particleR);

	function reset() {
		particleCount = DEFAULTS.particleCount;
		timeVariance = DEFAULTS.timeVariance;
		particleR = DEFAULTS.particleR;
		key++;
	}

	$.head('23er1s', $$renderer, ($$renderer) => {
		$$renderer.title(($$renderer) => {
			$$renderer.push(`<title>Gooey Nav - svelte-bits</title>`);
		});
	});

	$$renderer.push(`<h1 class="sub-category">Gooey Nav</h1> `);

	{
		function preview($$renderer) {
			$$renderer.push(`<div class="demo-container" style="position:relative;height:400px;overflow:hidden;display:flex;align-items:center;justify-content:center;"><!---->`);

			{
				GooeyNav($$renderer, {
					items,
					animationTime: 500,
					particleCount,
					particleDistances: [90, 0],
					particleR,
					timeVariance,
					initialActiveIndex: 0
				});
			}

			$$renderer.push(`<!----></div>`);
		}

		function code($$renderer) {
			DemoCodeTab($$renderer, { slug: 'gooey-nav', usage, source });
		}

		function customize($$renderer) {
			Customize($$renderer, {
				children: ($$renderer) => {
					PreviewSlider($$renderer, {
						title: 'Particle Count',
						min: 1,
						max: 50,
						step: 1,
						value: particleCount,
						onChange: (v) => {
							particleCount = v;
							key++;
						}
					});

					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Animation Variance',
						min: 0,
						max: 2000,
						step: 100,
						value: timeVariance,
						onChange: (v) => {
							timeVariance = v;
							key++;
						}
					});

					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Radius Factor',
						min: 0,
						max: 1000,
						step: 100,
						value: particleR,
						onChange: (v) => {
							particleR = v;
							key++;
						}
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
			componentName: 'GooeyNav',
			usage,
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