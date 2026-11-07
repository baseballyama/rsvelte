import * as $ from 'svelte/internal/server';
import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
import Customize from '$lib/components/docs/preview/Customize.svelte';
import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
import PreviewSwitch from '$lib/components/docs/preview/PreviewSwitch.svelte';
import PropTable from '$lib/components/docs/preview/PropTable.svelte';
import DemoCodeTab from '$lib/components/docs/preview/DemoCodeTab.svelte';
import BackgroundContentToggle from '$lib/components/docs/preview/BackgroundContentToggle.svelte';
import PrismaticBurst from '$lib/components/library/Backgrounds/PrismaticBurst/PrismaticBurst.svelte';
import source from '$lib/components/library/Backgrounds/PrismaticBurst/PrismaticBurst.svelte?raw';

export default function PrismaticBurstDemo($$renderer) {
	const D = {
		intensity: 2,
		speed: 0.5,
		animationType: 'rotate3d',
		distort: 0,
		paused: false,
		hoverDampness: 0,
		rayCount: 0
	};

	let intensity = D.intensity;
	let speed = D.speed;
	let animationType = D.animationType;
	let distort = D.distort;
	let paused = D.paused;
	let hoverDampness = D.hoverDampness;
	let rayCount = D.rayCount;
	let showContent = true;
	const sO = '<' + 'script lang="ts">';
	const sC = '</' + 'script>';
	const hasChanges = $.derived(() => intensity !== D.intensity || speed !== D.speed || animationType !== D.animationType || distort !== D.distort || paused !== D.paused || hoverDampness !== D.hoverDampness || rayCount !== D.rayCount);

	function reset() {
		intensity = D.intensity;
		speed = D.speed;
		animationType = D.animationType;
		distort = D.distort;
		paused = D.paused;
		hoverDampness = D.hoverDampness;
		rayCount = D.rayCount;
	}

	const usage = $.derived(() => `${sO}
  import PrismaticBurst from '$lib/components/PrismaticBurst.svelte';
${sC}

<div style="position: relative; width: 100%; height: 600px; background: #14110E;">
  <PrismaticBurst intensity={${intensity}} speed={${speed}} animationType="${animationType}" />
</div>`);

	const props = [
		{
			name: 'intensity',
			type: 'number',
			default: '2',
			description: 'Brightness.'
		},

		{
			name: 'speed',
			type: 'number',
			default: '0.5',
			description: 'Animation speed.'
		},

		{
			name: 'animationType',
			type: "'rotate'|'rotate3d'|'hover'",
			default: "'rotate3d'",
			description: 'Animation mode.'
		},

		{
			name: 'colors',
			type: 'string[]',
			default: 'undefined',
			description: 'Custom gradient colors.'
		},

		{
			name: 'distort',
			type: 'number',
			default: '0',
			description: 'Bend distortion strength.'
		},

		{
			name: 'paused',
			type: 'boolean',
			default: 'false',
			description: 'Pause animation.'
		},

		{
			name: 'offset',
			type: '{x,y}',
			default: '{x:0,y:0}',
			description: 'Pixel offset.'
		},

		{
			name: 'hoverDampness',
			type: 'number',
			default: '0',
			description: 'Hover damping (hover mode).'
		},

		{
			name: 'rayCount',
			type: 'number',
			default: '0',
			description: 'Discrete ray count.'
		},

		{
			name: 'mixBlendMode',
			type: 'string',
			default: "'lighten'",
			description: 'CSS mix-blend-mode.'
		}
	];

	$.head('pzjz1g', $$renderer, ($$renderer) => {
		$$renderer.title(($$renderer) => {
			$$renderer.push(`<title>Prismatic Burst - svelte-bits</title>`);
		});
	});

	$$renderer.push(`<h1 class="sub-category">Prismatic Burst</h1> `);

	{
		function preview($$renderer) {
			$$renderer.push(`<div class="relative h-[500px] w-full overflow-hidden rounded-[14px]">`);

			PrismaticBurst($$renderer, {
				intensity,
				speed,
				animationType,
				distort,
				paused,
				hoverDampness,
				rayCount
			});

			$$renderer.push(`<!----> `);
			BackgroundContentToggle($$renderer, { showContent, onToggle: (v) => showContent = v });
			$$renderer.push(`<!----></div>`);
		}

		function code($$renderer) {
			DemoCodeTab($$renderer, { slug: 'prismatic-burst', usage: usage(), source });
		}

		function customize($$renderer) {
			Customize($$renderer, {
				children: ($$renderer) => {
					PreviewSlider($$renderer, {
						title: 'Intensity',
						min: 0,
						max: 5,
						step: 0.1,
						value: intensity,
						onChange: (v) => intensity = v
					});

					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Speed',
						min: 0,
						max: 3,
						step: 0.05,
						value: speed,
						onChange: (v) => speed = v
					});

					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Distort',
						min: 0,
						max: 10,
						step: 0.1,
						value: distort,
						onChange: (v) => distort = v
					});

					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Hover Dampness',
						min: 0,
						max: 1,
						step: 0.01,
						value: hoverDampness,
						onChange: (v) => hoverDampness = v
					});

					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Ray Count',
						min: 0,
						max: 24,
						step: 1,
						value: rayCount,
						onChange: (v) => rayCount = v
					});

					$$renderer.push(`<!----> `);

					PreviewSwitch($$renderer, {
						title: 'Paused',
						checked: paused,
						onChange: (v) => paused = v
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
			componentName: 'PrismaticBurst',
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