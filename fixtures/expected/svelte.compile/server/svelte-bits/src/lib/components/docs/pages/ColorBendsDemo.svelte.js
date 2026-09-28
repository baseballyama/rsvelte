import * as $ from 'svelte/internal/server';
import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
import Customize from '$lib/components/docs/preview/Customize.svelte';
import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
import PreviewColorPicker from '$lib/components/docs/preview/PreviewColorPicker.svelte';
import PropTable from '$lib/components/docs/preview/PropTable.svelte';
import DemoCodeTab from '$lib/components/docs/preview/DemoCodeTab.svelte';
import BackgroundContentToggle from '$lib/components/docs/preview/BackgroundContentToggle.svelte';
import ColorBends from '$lib/components/library/Backgrounds/ColorBends/ColorBends.svelte';
import colorBendsSource from '$lib/components/library/Backgrounds/ColorBends/ColorBends.svelte?raw';

export default function ColorBendsDemo($$renderer) {
	const DEFAULTS = {
		rotation: 90,
		autoRotate: 0,
		speed: 0.2,
		scale: 1,
		frequency: 1,
		warpStrength: 1,
		mouseInfluence: 1,
		parallax: 0.5,
		noise: 0.15,
		iterations: 1,
		intensity: 1.5,
		bandWidth: 6,
		color: '#ff3e00'
	};

	let rotation = DEFAULTS.rotation;
	let autoRotate = DEFAULTS.autoRotate;
	let speed = DEFAULTS.speed;
	let scale = DEFAULTS.scale;
	let frequency = DEFAULTS.frequency;
	let warpStrength = DEFAULTS.warpStrength;
	let mouseInfluence = DEFAULTS.mouseInfluence;
	let parallax = DEFAULTS.parallax;
	let noise = DEFAULTS.noise;
	let iterations = DEFAULTS.iterations;
	let intensity = DEFAULTS.intensity;
	let bandWidth = DEFAULTS.bandWidth;
	let color = DEFAULTS.color;
	let showContent = true;
	const scriptOpen = '<' + 'script lang="ts">';
	const scriptClose = '</' + 'script>';
	const hasChanges = $.derived(() => rotation !== DEFAULTS.rotation || autoRotate !== DEFAULTS.autoRotate || speed !== DEFAULTS.speed || scale !== DEFAULTS.scale || frequency !== DEFAULTS.frequency || warpStrength !== DEFAULTS.warpStrength || mouseInfluence !== DEFAULTS.mouseInfluence || parallax !== DEFAULTS.parallax || noise !== DEFAULTS.noise || iterations !== DEFAULTS.iterations || intensity !== DEFAULTS.intensity || bandWidth !== DEFAULTS.bandWidth || color !== DEFAULTS.color);

	function reset() {
		rotation = DEFAULTS.rotation;
		autoRotate = DEFAULTS.autoRotate;
		speed = DEFAULTS.speed;
		scale = DEFAULTS.scale;
		frequency = DEFAULTS.frequency;
		warpStrength = DEFAULTS.warpStrength;
		mouseInfluence = DEFAULTS.mouseInfluence;
		parallax = DEFAULTS.parallax;
		noise = DEFAULTS.noise;
		iterations = DEFAULTS.iterations;
		intensity = DEFAULTS.intensity;
		bandWidth = DEFAULTS.bandWidth;
		color = DEFAULTS.color;
	}

	const usage = $.derived(() => `${scriptOpen}
  import ColorBends from '$lib/components/ColorBends.svelte';
${scriptClose}

<div style="height: 500px; position: relative; overflow: hidden;">
  <ColorBends
    rotation={${rotation}}
    autoRotate={${autoRotate}}
    speed={${speed}}
    scale={${scale}}
    frequency={${frequency}}
    warpStrength={${warpStrength}}
    mouseInfluence={${mouseInfluence}}
    parallax={${parallax}}
    noise={${noise}}
    iterations={${iterations}}
    intensity={${intensity}}
    bandWidth={${bandWidth}}
    colors={["${color}"]}
  />
</div>`);

	const props = [
		{
			name: 'rotation',
			type: 'number',
			default: '90',
			description: 'Base rotation angle in degrees.'
		},

		{
			name: 'autoRotate',
			type: 'number',
			default: '0',
			description: 'Automatic rotation speed in degrees per second.'
		},

		{
			name: 'speed',
			type: 'number',
			default: '0.2',
			description: 'Animation time scale of the shader.'
		},

		{
			name: 'colors',
			type: 'string[]',
			default: '[]',
			description: 'Palette of up to 8 hex colors used to blend the bends.'
		},

		{
			name: 'transparent',
			type: 'boolean',
			default: 'true',
			description: 'Whether the background is transparent and uses alpha.'
		},

		{
			name: 'scale',
			type: 'number',
			default: '1',
			description: 'Zoom factor of the pattern.'
		},

		{
			name: 'frequency',
			type: 'number',
			default: '1',
			description: 'Wave frequency used in the pattern.'
		},

		{
			name: 'warpStrength',
			type: 'number',
			default: '1',
			description: 'Amount of warping and distortion applied to waves.'
		},

		{
			name: 'mouseInfluence',
			type: 'number',
			default: '1',
			description: 'How strongly the waves react to pointer movement.'
		},

		{
			name: 'parallax',
			type: 'number',
			default: '0.5',
			description: 'Parallax factor shifting content with the pointer.'
		},

		{
			name: 'noise',
			type: 'number',
			default: '0.15',
			description: 'Adds subtle grain. 0 disables noise.'
		},

		{
			name: 'iterations',
			type: 'number',
			default: '1',
			description: 'Number of extra warp passes, from 1 to 5.'
		},

		{
			name: 'intensity',
			type: 'number',
			default: '1.5',
			description: 'Brightness multiplier for the final color output.'
		},

		{
			name: 'bandWidth',
			type: 'number',
			default: '6',
			description: 'Controls the width and falloff of each color band.'
		},

		{
			name: 'class',
			type: 'string',
			default: '""',
			description: 'Extra classes for the root container.'
		}
	];

	$.head('iqc7mf', $$renderer, ($$renderer) => {
		$$renderer.title(($$renderer) => {
			$$renderer.push(`<title>Color Bends - svelte-bits</title>`);
		});
	});

	$$renderer.push(`<h1 class="sub-category">Color Bends</h1> `);

	{
		function preview($$renderer) {
			$$renderer.push(`<div class="relative h-[500px] w-full overflow-hidden rounded-2xl bg-[#14110e]">`);

			ColorBends($$renderer, {
				rotation,
				autoRotate,
				speed,
				scale,
				frequency,
				warpStrength,
				mouseInfluence,
				parallax,
				noise,
				iterations,
				intensity,
				bandWidth,
				colors: [color]
			});

			$$renderer.push(`<!----> `);
			BackgroundContentToggle($$renderer, { showContent, onToggle: (v) => showContent = v });
			$$renderer.push(`<!----></div>`);
		}

		function code($$renderer) {
			DemoCodeTab($$renderer, {
				slug: 'color-bends',
				usage: usage(),
				source: colorBendsSource
			});
		}

		function customize($$renderer) {
			Customize($$renderer, {
				children: ($$renderer) => {
					PreviewColorPicker($$renderer, { title: 'Color', value: color, onChange: (v) => color = v });
					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Rotation (deg)',
						min: -180,
						max: 180,
						step: 1,
						value: rotation,
						onChange: (v) => rotation = v
					});

					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Auto Rotate (deg/s)',
						min: -5,
						max: 5,
						step: 1,
						value: autoRotate,
						onChange: (v) => autoRotate = v
					});

					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Speed',
						min: 0,
						max: 1,
						step: 0.01,
						value: speed,
						onChange: (v) => speed = v
					});

					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Scale',
						min: 0.2,
						max: 5,
						step: 0.1,
						value: scale,
						onChange: (v) => scale = v
					});

					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Frequency',
						min: 0,
						max: 5,
						step: 0.1,
						value: frequency,
						onChange: (v) => frequency = v
					});

					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Warp Strength',
						min: 0.9,
						max: 1,
						step: 0.005,
						value: warpStrength,
						onChange: (v) => warpStrength = v
					});

					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Mouse Influence',
						min: 0,
						max: 2,
						step: 0.05,
						value: mouseInfluence,
						onChange: (v) => mouseInfluence = v
					});

					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Parallax',
						min: 0,
						max: 2,
						step: 0.05,
						value: parallax,
						onChange: (v) => parallax = v
					});

					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Noise',
						min: 0,
						max: 1,
						step: 0.01,
						value: noise,
						onChange: (v) => noise = v
					});

					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Iterations',
						min: 1,
						max: 5,
						step: 1,
						value: iterations,
						onChange: (v) => iterations = v
					});

					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Intensity',
						min: 0.1,
						max: 2,
						step: 0.1,
						value: intensity,
						onChange: (v) => intensity = v
					});

					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Band Width',
						min: 1,
						max: 20,
						step: 0.5,
						value: bandWidth,
						onChange: (v) => bandWidth = v
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
			componentName: 'ColorBends',
			usage: usage(),
			source: colorBendsSource,
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