import * as $ from 'svelte/internal/server';
import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
import Customize from '$lib/components/docs/preview/Customize.svelte';
import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
import PreviewColorPicker from '$lib/components/docs/preview/PreviewColorPicker.svelte';
import PropTable from '$lib/components/docs/preview/PropTable.svelte';
import DemoCodeTab from '$lib/components/docs/preview/DemoCodeTab.svelte';
import BackgroundContentToggle from '$lib/components/docs/preview/BackgroundContentToggle.svelte';
import PixelSnow from '$lib/components/library/Backgrounds/PixelSnow/PixelSnow.svelte';
import source from '$lib/components/library/Backgrounds/PixelSnow/PixelSnow.svelte?raw';

export default function PixelSnowDemo($$renderer) {
	const D = {
		color: '#ffffff',
		flakeSize: 0.01,
		minFlakeSize: 1.25,
		pixelResolution: 200,
		speed: 1.25,
		depthFade: 8,
		brightness: 1,
		density: 0.3,
		direction: 125,
		variant: 'square'
	};

	let color = D.color;
	let flakeSize = D.flakeSize;
	let minFlakeSize = D.minFlakeSize;
	let pixelResolution = D.pixelResolution;
	let speed = D.speed;
	let depthFade = D.depthFade;
	let brightness = D.brightness;
	let density = D.density;
	let direction = D.direction;
	let variant = D.variant;
	let showContent = true;
	const sO = '<' + 'script lang="ts">';
	const sC = '</' + 'script>';
	const hasChanges = $.derived(() => color !== D.color || flakeSize !== D.flakeSize || minFlakeSize !== D.minFlakeSize || pixelResolution !== D.pixelResolution || speed !== D.speed || depthFade !== D.depthFade || brightness !== D.brightness || density !== D.density || direction !== D.direction || variant !== D.variant);

	function reset() {
		color = D.color;
		flakeSize = D.flakeSize;
		minFlakeSize = D.minFlakeSize;
		pixelResolution = D.pixelResolution;
		speed = D.speed;
		depthFade = D.depthFade;
		brightness = D.brightness;
		density = D.density;
		direction = D.direction;
		variant = D.variant;
	}

	const usage = $.derived(() => `${sO}
  import PixelSnow from '$lib/components/PixelSnow.svelte';
${sC}

<div style="width: 100%; height: 600px; position: relative; background: #14110E;">
  <PixelSnow color="${color}" density={${density}} variant="${variant}" />
</div>`);

	const props = [
		{
			name: 'color',
			type: 'string',
			default: "'#ffffff'",
			description: 'Snowflake color.'
		},

		{
			name: 'flakeSize',
			type: 'number',
			default: '0.01',
			description: 'Flake size.'
		},

		{
			name: 'minFlakeSize',
			type: 'number',
			default: '1.25',
			description: 'Minimum flake size in screen pixels.'
		},

		{
			name: 'pixelResolution',
			type: 'number',
			default: '200',
			description: 'Resolution downsample for pixel look.'
		},

		{
			name: 'speed',
			type: 'number',
			default: '1.25',
			description: 'Fall speed.'
		},

		{
			name: 'depthFade',
			type: 'number',
			default: '8',
			description: 'Depth fade falloff.'
		},

		{
			name: 'farPlane',
			type: 'number',
			default: '20',
			description: 'Far render plane.'
		},

		{
			name: 'brightness',
			type: 'number',
			default: '1',
			description: 'Brightness.'
		},

		{
			name: 'gamma',
			type: 'number',
			default: '0.4545',
			description: 'Gamma correction.'
		},

		{
			name: 'density',
			type: 'number',
			default: '0.3',
			description: 'Snowflake density.'
		},

		{
			name: 'variant',
			type: "'square' | 'round' | 'snowflake'",
			default: "'square'",
			description: 'Flake shape.'
		},

		{
			name: 'direction',
			type: 'number',
			default: '125',
			description: 'Wind direction in degrees.'
		}
	];

	$.head('m8bfrx', $$renderer, ($$renderer) => {
		$$renderer.title(($$renderer) => {
			$$renderer.push(`<title>Pixel Snow - svelte-bits</title>`);
		});
	});

	$$renderer.push(`<h1 class="sub-category">Pixel Snow</h1> `);

	{
		function preview($$renderer) {
			$$renderer.push(`<div class="relative h-[500px] w-full overflow-hidden rounded-[14px]">`);

			PixelSnow($$renderer, {
				color,
				flakeSize,
				minFlakeSize,
				pixelResolution,
				speed,
				depthFade,
				brightness,
				density,
				variant,
				direction
			});

			$$renderer.push(`<!----> `);
			BackgroundContentToggle($$renderer, { showContent, onToggle: (v) => showContent = v });
			$$renderer.push(`<!----></div>`);
		}

		function code($$renderer) {
			DemoCodeTab($$renderer, { slug: 'pixel-snow', usage: usage(), source });
		}

		function customize($$renderer) {
			Customize($$renderer, {
				children: ($$renderer) => {
					PreviewColorPicker($$renderer, { title: 'Color', value: color, onChange: (v) => color = v });
					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Density',
						min: 0.05,
						max: 1,
						step: 0.05,
						value: density,
						onChange: (v) => density = v
					});

					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Speed',
						min: 0,
						max: 5,
						step: 0.05,
						value: speed,
						onChange: (v) => speed = v
					});

					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Direction',
						min: 0,
						max: 360,
						step: 1,
						value: direction,
						onChange: (v) => direction = v
					});

					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Flake Size',
						min: 0.005,
						max: 0.05,
						step: 0.001,
						value: flakeSize,
						onChange: (v) => flakeSize = v
					});

					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Min Flake Size',
						min: 0.5,
						max: 4,
						step: 0.1,
						value: minFlakeSize,
						onChange: (v) => minFlakeSize = v
					});

					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Pixel Resolution',
						min: 50,
						max: 500,
						step: 10,
						value: pixelResolution,
						onChange: (v) => pixelResolution = v
					});

					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Depth Fade',
						min: 1,
						max: 20,
						step: 0.5,
						value: depthFade,
						onChange: (v) => depthFade = v
					});

					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Brightness',
						min: 0,
						max: 3,
						step: 0.1,
						value: brightness,
						onChange: (v) => brightness = v
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
			componentName: 'PixelSnow',
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