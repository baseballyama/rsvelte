import * as $ from 'svelte/internal/server';
import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
import Customize from '$lib/components/docs/preview/Customize.svelte';
import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
import PropTable from '$lib/components/docs/preview/PropTable.svelte';
import DemoCodeTab from '$lib/components/docs/preview/DemoCodeTab.svelte';
import BackgroundContentToggle from '$lib/components/docs/preview/BackgroundContentToggle.svelte';
import GridDistortion from '$lib/components/library/Backgrounds/GridDistortion/GridDistortion.svelte';
import source from '$lib/components/library/Backgrounds/GridDistortion/GridDistortion.svelte?raw';

export default function GridDistortionDemo($$renderer) {
	const D = { grid: 15, mouse: 0.1, strength: 0.15, relaxation: 0.9 };
	const imageSrc = 'https://images.unsplash.com/photo-1707343843437-caacff5cfa74?w=1200&q=80';
	let grid = D.grid;
	let mouse = D.mouse;
	let strength = D.strength;
	let relaxation = D.relaxation;
	let showContent = true;
	const sO = '<' + 'script lang="ts">';
	const sC = '</' + 'script>';
	const hasChanges = $.derived(() => grid !== D.grid || mouse !== D.mouse || strength !== D.strength || relaxation !== D.relaxation);

	function reset() {
		grid = D.grid;
		mouse = D.mouse;
		strength = D.strength;
		relaxation = D.relaxation;
	}

	const usage = $.derived(() => `${sO}
  import GridDistortion from '$lib/components/GridDistortion.svelte';
${sC}

<div style="width: 100%; height: 600px; position: relative;">
  <GridDistortion imageSrc="..." grid={${grid}} mouse={${mouse}} strength={${strength}} relaxation={${relaxation}} />
</div>`);

	const props = [
		{
			name: 'grid',
			type: 'number',
			default: '15',
			description: 'Grid resolution.'
		},

		{
			name: 'mouse',
			type: 'number',
			default: '0.1',
			description: 'Cursor radius.'
		},

		{
			name: 'strength',
			type: 'number',
			default: '0.15',
			description: 'Distortion strength.'
		},

		{
			name: 'relaxation',
			type: 'number',
			default: '0.9',
			description: 'Distortion relaxation.'
		},

		{
			name: 'imageSrc',
			type: 'string',
			description: 'Image source URL.'
		}
	];

	$.head('u0by31', $$renderer, ($$renderer) => {
		$$renderer.title(($$renderer) => {
			$$renderer.push(`<title>Grid Distortion - svelte-bits</title>`);
		});
	});

	$$renderer.push(`<h1 class="sub-category">Grid Distortion</h1> `);

	{
		function preview($$renderer) {
			$$renderer.push(`<!---->`);

			{
				$$renderer.push(`<div class="relative h-[500px] w-full overflow-hidden rounded-[14px]">`);
				GridDistortion($$renderer, { grid, mouse, strength, relaxation, imageSrc });
				$$renderer.push(`<!----> `);
				BackgroundContentToggle($$renderer, { showContent, onToggle: (v) => showContent = v });
				$$renderer.push(`<!----></div>`);
			}

			$$renderer.push(`<!---->`);
		}

		function code($$renderer) {
			DemoCodeTab($$renderer, { slug: 'grid-distortion', usage: usage(), source });
		}

		function customize($$renderer) {
			Customize($$renderer, {
				children: ($$renderer) => {
					PreviewSlider($$renderer, {
						title: 'Grid',
						min: 4,
						max: 50,
						step: 1,
						value: grid,
						onChange: (v) => grid = v
					});

					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Mouse Radius',
						min: 0.01,
						max: 1,
						step: 0.01,
						value: mouse,
						onChange: (v) => mouse = v
					});

					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Strength',
						min: 0,
						max: 1,
						step: 0.01,
						value: strength,
						onChange: (v) => strength = v
					});

					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Relaxation',
						min: 0,
						max: 1,
						step: 0.01,
						value: relaxation,
						onChange: (v) => relaxation = v
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
			componentName: 'GridDistortion',
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