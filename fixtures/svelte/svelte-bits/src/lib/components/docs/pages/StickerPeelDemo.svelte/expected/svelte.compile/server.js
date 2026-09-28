import * as $ from 'svelte/internal/server';
import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
import Customize from '$lib/components/docs/preview/Customize.svelte';
import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
import PropTable from '$lib/components/docs/preview/PropTable.svelte';
import DemoCodeTab from '$lib/components/docs/preview/DemoCodeTab.svelte';
import StickerPeel from '$lib/components/library/Animations/StickerPeel/StickerPeel.svelte';
import source from '$lib/components/library/Animations/StickerPeel/StickerPeel.svelte?raw';
import logo from '$lib/assets/logo/svelte-bits-icon-logo.svg';

export default function StickerPeelDemo($$renderer) {
	const DEFAULTS = {
		rotate: 0,
		width: 200,
		peelBackHoverPct: 30,
		peelBackActivePct: 40,
		lightingIntensity: 0.1,
		shadowIntensity: 0.5,
		peelDirection: 0
	};

	let rotate = DEFAULTS.rotate;
	let width = DEFAULTS.width;
	let peelBackHoverPct = DEFAULTS.peelBackHoverPct;
	let peelBackActivePct = DEFAULTS.peelBackActivePct;
	let lightingIntensity = DEFAULTS.lightingIntensity;
	let shadowIntensity = DEFAULTS.shadowIntensity;
	let peelDirection = DEFAULTS.peelDirection;
	const hasChanges = $.derived(() => rotate !== DEFAULTS.rotate || width !== DEFAULTS.width || peelBackHoverPct !== DEFAULTS.peelBackHoverPct || peelBackActivePct !== DEFAULTS.peelBackActivePct || lightingIntensity !== DEFAULTS.lightingIntensity || shadowIntensity !== DEFAULTS.shadowIntensity || peelDirection !== DEFAULTS.peelDirection);

	function reset() {
		rotate = DEFAULTS.rotate;
		width = DEFAULTS.width;
		peelBackHoverPct = DEFAULTS.peelBackHoverPct;
		peelBackActivePct = DEFAULTS.peelBackActivePct;
		lightingIntensity = DEFAULTS.lightingIntensity;
		shadowIntensity = DEFAULTS.shadowIntensity;
		peelDirection = DEFAULTS.peelDirection;
	}

	const usage = $.derived(() => `<StickerPeel imageSrc="/sticker.png" rotate={${rotate}} width={${width}} peelBackHoverPct={${peelBackHoverPct}} peelBackActivePct={${peelBackActivePct}} lightingIntensity={${lightingIntensity}} shadowIntensity={${shadowIntensity}} peelDirection={${peelDirection}} />`);

	const props = [
		{
			name: 'imageSrc',
			type: 'string',
			default: 'required',
			description: 'URL of the sticker image.'
		},

		{
			name: 'rotate',
			type: 'number',
			default: '30',
			description: 'Initial rotation (deg).'
		},

		{
			name: 'peelBackHoverPct',
			type: 'number',
			default: '30',
			description: 'Hover peel-back percentage.'
		},

		{
			name: 'peelBackActivePct',
			type: 'number',
			default: '40',
			description: 'Drag/active peel-back percentage.'
		},

		{
			name: 'peelEasing',
			type: 'string',
			default: '"power3.out"',
			description: 'GSAP easing for peel.'
		},

		{
			name: 'peelHoverEasing',
			type: 'string',
			default: '"power2.out"',
			description: 'GSAP easing for hover.'
		},

		{
			name: 'width',
			type: 'number',
			default: '200',
			description: 'Sticker width (px).'
		},

		{
			name: 'shadowIntensity',
			type: 'number',
			default: '0.6',
			description: 'Drop shadow intensity (0-1).'
		},

		{
			name: 'lightingIntensity',
			type: 'number',
			default: '0.1',
			description: 'Specular lighting intensity (0-1).'
		},

		{
			name: 'initialPosition',
			type: '"center" | { x, y }',
			default: '"center"',
			description: 'Initial draggable position.'
		},

		{
			name: 'peelDirection',
			type: 'number',
			default: '0',
			description: 'Peel direction in degrees.'
		}
	];

	$.head('3s0qzb', $$renderer, ($$renderer) => {
		$$renderer.title(($$renderer) => {
			$$renderer.push(`<title>Sticker Peel - svelte-bits</title>`);
		});
	});

	$$renderer.push(`<h1 class="sub-category">Sticker Peel</h1> `);

	{
		function preview($$renderer) {
			$$renderer.push(`<div class="demo-container" style="position:relative;height:500px;overflow:hidden;">`);

			StickerPeel($$renderer, {
				imageSrc: logo,
				rotate,
				width,
				peelBackHoverPct,
				peelBackActivePct,
				lightingIntensity,
				shadowIntensity,
				peelDirection
			});

			$$renderer.push(`<!----></div>`);
		}

		function code($$renderer) {
			DemoCodeTab($$renderer, { slug: 'sticker-peel', usage: usage(), source });
		}

		function customize($$renderer) {
			Customize($$renderer, {
				children: ($$renderer) => {
					PreviewSlider($$renderer, {
						title: 'Rotate',
						min: -180,
						max: 180,
						step: 1,
						value: rotate,
						valueUnit: '°',
						onChange: (v) => rotate = v
					});

					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Width',
						min: 80,
						max: 400,
						step: 5,
						value: width,
						valueUnit: 'px',
						onChange: (v) => width = v
					});

					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Peel Back Hover %',
						min: 0,
						max: 100,
						step: 1,
						value: peelBackHoverPct,
						valueUnit: '%',
						onChange: (v) => peelBackHoverPct = v
					});

					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Peel Back Active %',
						min: 0,
						max: 100,
						step: 1,
						value: peelBackActivePct,
						valueUnit: '%',
						onChange: (v) => peelBackActivePct = v
					});

					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Lighting Intensity',
						min: 0,
						max: 1,
						step: 0.05,
						value: lightingIntensity,
						onChange: (v) => lightingIntensity = v
					});

					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Shadow Intensity',
						min: 0,
						max: 1,
						step: 0.05,
						value: shadowIntensity,
						onChange: (v) => shadowIntensity = v
					});

					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Peel Direction',
						min: -180,
						max: 180,
						step: 1,
						value: peelDirection,
						valueUnit: '°',
						onChange: (v) => peelDirection = v
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
			componentName: 'StickerPeel',
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