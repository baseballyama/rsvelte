import * as $ from 'svelte/internal/server';
import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
import Customize from '$lib/components/docs/preview/Customize.svelte';
import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
import PreviewColorPicker from '$lib/components/docs/preview/PreviewColorPicker.svelte';
import PropTable from '$lib/components/docs/preview/PropTable.svelte';
import DemoCodeTab from '$lib/components/docs/preview/DemoCodeTab.svelte';
import GhostCursor from '$lib/components/library/Animations/GhostCursor/GhostCursor.svelte';
import source from '$lib/components/library/Animations/GhostCursor/GhostCursor.svelte?raw';

export default function GhostCursorDemo($$renderer) {
	const DEFAULTS = {
		trailLength: 50,
		inertia: 0.5,
		grainIntensity: 0.05,
		bloomStrength: 0.1,
		bloomRadius: 1.0,
		bloomThreshold: 0.025,
		brightness: 2,
		color: '#FF8A4C',
		fadeDelayMs: 1000,
		fadeDurationMs: 1500
	};

	let trailLength = DEFAULTS.trailLength;
	let inertia = DEFAULTS.inertia;
	let grainIntensity = DEFAULTS.grainIntensity;
	let bloomStrength = DEFAULTS.bloomStrength;
	let bloomRadius = DEFAULTS.bloomRadius;
	let bloomThreshold = DEFAULTS.bloomThreshold;
	let brightness = DEFAULTS.brightness;
	let color = DEFAULTS.color;
	let fadeDelayMs = DEFAULTS.fadeDelayMs;
	let fadeDurationMs = DEFAULTS.fadeDurationMs;
	const hasChanges = $.derived(() => trailLength !== DEFAULTS.trailLength || inertia !== DEFAULTS.inertia || grainIntensity !== DEFAULTS.grainIntensity || bloomStrength !== DEFAULTS.bloomStrength || bloomRadius !== DEFAULTS.bloomRadius || bloomThreshold !== DEFAULTS.bloomThreshold || brightness !== DEFAULTS.brightness || color !== DEFAULTS.color || fadeDelayMs !== DEFAULTS.fadeDelayMs || fadeDurationMs !== DEFAULTS.fadeDurationMs);

	function reset() {
		trailLength = DEFAULTS.trailLength;
		inertia = DEFAULTS.inertia;
		grainIntensity = DEFAULTS.grainIntensity;
		bloomStrength = DEFAULTS.bloomStrength;
		bloomRadius = DEFAULTS.bloomRadius;
		bloomThreshold = DEFAULTS.bloomThreshold;
		brightness = DEFAULTS.brightness;
		color = DEFAULTS.color;
		fadeDelayMs = DEFAULTS.fadeDelayMs;
		fadeDurationMs = DEFAULTS.fadeDurationMs;
	}

	const usage = $.derived(() => `<GhostCursor trailLength={${trailLength}} inertia={${inertia}} brightness={${brightness}} color="${color}" />`);

	const props = [
		{
			name: 'trailLength',
			type: 'number',
			default: '50',
			description: 'Number of trail points kept.'
		},

		{
			name: 'inertia',
			type: 'number',
			default: '0.5',
			description: 'Trail inertia (0-1).'
		},

		{
			name: 'grainIntensity',
			type: 'number',
			default: '0.05',
			description: 'Film grain intensity.'
		},

		{
			name: 'bloomStrength',
			type: 'number',
			default: '0.1',
			description: 'Bloom post-process strength.'
		},

		{
			name: 'bloomRadius',
			type: 'number',
			default: '1.0',
			description: 'Bloom radius.'
		},

		{
			name: 'bloomThreshold',
			type: 'number',
			default: '0.025',
			description: 'Bloom luminance threshold.'
		},

		{
			name: 'brightness',
			type: 'number',
			default: '1',
			description: 'Trail brightness multiplier.'
		},

		{
			name: 'color',
			type: 'string',
			default: '"#B497CF"',
			description: 'Trail color.'
		},

		{
			name: 'mixBlendMode',
			type: 'string',
			default: '"screen"',
			description: 'CSS mix-blend-mode of overlay.'
		},

		{
			name: 'fadeDelayMs',
			type: 'number',
			default: 'undefined',
			description: 'Idle delay before fading.'
		},

		{
			name: 'fadeDurationMs',
			type: 'number',
			default: 'undefined',
			description: 'Idle fade duration.'
		}
	];

	$.head('1yuyzsz', $$renderer, ($$renderer) => {
		$$renderer.title(($$renderer) => {
			$$renderer.push(`<title>Ghost Cursor - svelte-bits</title>`);
		});
	});

	$$renderer.push(`<h1 class="sub-category">Ghost Cursor</h1> `);

	{
		function preview($$renderer) {
			$$renderer.push(`<div class="demo-container" style="position:relative;height:500px;overflow:hidden;">`);

			GhostCursor($$renderer, {
				trailLength,
				inertia,
				grainIntensity,
				bloomStrength,
				bloomRadius,
				bloomThreshold,
				brightness,
				color,
				fadeDelayMs,
				fadeDurationMs
			});

			$$renderer.push(`<!----></div>`);
		}

		function code($$renderer) {
			DemoCodeTab($$renderer, { slug: 'ghost-cursor', usage: usage(), source });
		}

		function customize($$renderer) {
			Customize($$renderer, {
				children: ($$renderer) => {
					PreviewColorPicker($$renderer, { title: 'Color', value: color, onChange: (v) => color = v });
					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Trail Length',
						min: 5,
						max: 150,
						step: 1,
						value: trailLength,
						onChange: (v) => trailLength = v
					});

					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Inertia',
						min: 0,
						max: 1,
						step: 0.05,
						value: inertia,
						onChange: (v) => inertia = v
					});

					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Brightness',
						min: 0.5,
						max: 5,
						step: 0.1,
						value: brightness,
						onChange: (v) => brightness = v
					});

					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Grain Intensity',
						min: 0,
						max: 0.5,
						step: 0.01,
						value: grainIntensity,
						onChange: (v) => grainIntensity = v
					});

					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Bloom Strength',
						min: 0,
						max: 1,
						step: 0.05,
						value: bloomStrength,
						onChange: (v) => bloomStrength = v
					});

					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Bloom Radius',
						min: 0,
						max: 3,
						step: 0.1,
						value: bloomRadius,
						onChange: (v) => bloomRadius = v
					});

					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Bloom Threshold',
						min: 0,
						max: 1,
						step: 0.01,
						value: bloomThreshold,
						onChange: (v) => bloomThreshold = v
					});

					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Fade Delay',
						min: 0,
						max: 5000,
						step: 100,
						value: fadeDelayMs,
						valueUnit: 'ms',
						onChange: (v) => fadeDelayMs = v
					});

					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Fade Duration',
						min: 100,
						max: 5000,
						step: 100,
						value: fadeDurationMs,
						valueUnit: 'ms',
						onChange: (v) => fadeDurationMs = v
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
			componentName: 'GhostCursor',
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