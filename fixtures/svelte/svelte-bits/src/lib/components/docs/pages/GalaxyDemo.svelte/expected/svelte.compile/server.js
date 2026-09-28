import * as $ from 'svelte/internal/server';
import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
import Customize from '$lib/components/docs/preview/Customize.svelte';
import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
import PreviewSwitch from '$lib/components/docs/preview/PreviewSwitch.svelte';
import PropTable from '$lib/components/docs/preview/PropTable.svelte';
import DemoCodeTab from '$lib/components/docs/preview/DemoCodeTab.svelte';
import BackgroundContentToggle from '$lib/components/docs/preview/BackgroundContentToggle.svelte';
import Galaxy from '$lib/components/library/Backgrounds/Galaxy/Galaxy.svelte';
import source from '$lib/components/library/Backgrounds/Galaxy/Galaxy.svelte?raw';

export default function GalaxyDemo($$renderer) {
	const D = {
		density: 1,
		hueShift: 30,
		glowIntensity: 0.3,
		saturation: 0,
		twinkleIntensity: 0.3,
		rotationSpeed: 0.1,
		repulsionStrength: 2,
		speed: 1,
		mouseRepulsion: true,
		autoCenterRepulsion: 0,
		transparent: true
	};

	let density = D.density;
	let hueShift = D.hueShift;
	let glowIntensity = D.glowIntensity;
	let saturation = D.saturation;
	let twinkleIntensity = D.twinkleIntensity;
	let rotationSpeed = D.rotationSpeed;
	let repulsionStrength = D.repulsionStrength;
	let speed = D.speed;
	let mouseRepulsion = D.mouseRepulsion;
	let autoCenterRepulsion = D.autoCenterRepulsion;
	let transparent = D.transparent;
	let showContent = true;
	const sO = '<' + 'script lang="ts">';
	const sC = '</' + 'script>';
	const hasChanges = $.derived(() => density !== D.density || hueShift !== D.hueShift || glowIntensity !== D.glowIntensity || saturation !== D.saturation || twinkleIntensity !== D.twinkleIntensity || rotationSpeed !== D.rotationSpeed || repulsionStrength !== D.repulsionStrength || speed !== D.speed || mouseRepulsion !== D.mouseRepulsion || autoCenterRepulsion !== D.autoCenterRepulsion || transparent !== D.transparent);

	function reset() {
		density = D.density;
		hueShift = D.hueShift;
		glowIntensity = D.glowIntensity;
		saturation = D.saturation;
		twinkleIntensity = D.twinkleIntensity;
		rotationSpeed = D.rotationSpeed;
		repulsionStrength = D.repulsionStrength;
		speed = D.speed;
		mouseRepulsion = D.mouseRepulsion;
		autoCenterRepulsion = D.autoCenterRepulsion;
		transparent = D.transparent;
	}

	const usage = $.derived(() => `${sO}
  import Galaxy from '$lib/components/Galaxy.svelte';
${sC}

<div style="width: 100%; height: 600px; position: relative;">
  <Galaxy density={${density}} hueShift={${hueShift}} glowIntensity={${glowIntensity}} />
</div>`);

	const props = [
		{
			name: 'focal',
			type: '[number, number]',
			default: '[0.5, 0.5]',
			description: 'Focal point.'
		},

		{
			name: 'rotation',
			type: '[number, number]',
			default: '[1, 0]',
			description: 'Rotation matrix.'
		},

		{
			name: 'starSpeed',
			type: 'number',
			default: '0.5',
			description: 'Star speed.'
		},

		{
			name: 'density',
			type: 'number',
			default: '1',
			description: 'Star density.'
		},

		{
			name: 'hueShift',
			type: 'number',
			default: '140',
			description: 'Hue shift in degrees.'
		},

		{
			name: 'speed',
			type: 'number',
			default: '1',
			description: 'Animation speed.'
		},

		{
			name: 'glowIntensity',
			type: 'number',
			default: '0.3',
			description: 'Star glow intensity.'
		},

		{
			name: 'saturation',
			type: 'number',
			default: '0',
			description: 'Color saturation.'
		},

		{
			name: 'twinkleIntensity',
			type: 'number',
			default: '0.3',
			description: 'Twinkle strength.'
		},

		{
			name: 'rotationSpeed',
			type: 'number',
			default: '0.1',
			description: 'Auto rotation speed.'
		},

		{
			name: 'mouseRepulsion',
			type: 'boolean',
			default: 'true',
			description: 'Repel from cursor.'
		},

		{
			name: 'repulsionStrength',
			type: 'number',
			default: '2',
			description: 'Repulsion strength.'
		},

		{
			name: 'autoCenterRepulsion',
			type: 'number',
			default: '0',
			description: 'Auto center repulsion.'
		},

		{
			name: 'mouseInteraction',
			type: 'boolean',
			default: 'true',
			description: 'Respond to mouse.'
		},

		{
			name: 'transparent',
			type: 'boolean',
			default: 'true',
			description: 'Transparent background.'
		}
	];

	$.head('apkwoe', $$renderer, ($$renderer) => {
		$$renderer.title(($$renderer) => {
			$$renderer.push(`<title>Galaxy - svelte-bits</title>`);
		});
	});

	$$renderer.push(`<h1 class="sub-category">Galaxy</h1> `);

	{
		function preview($$renderer) {
			$$renderer.push(`<div class="relative h-[500px] w-full overflow-hidden rounded-[14px]">`);

			Galaxy($$renderer, {
				density,
				hueShift,
				glowIntensity,
				saturation,
				twinkleIntensity,
				rotationSpeed,
				repulsionStrength,
				speed,
				mouseRepulsion,
				autoCenterRepulsion,
				transparent
			});

			$$renderer.push(`<!----> `);
			BackgroundContentToggle($$renderer, { showContent, onToggle: (v) => showContent = v });
			$$renderer.push(`<!----></div>`);
		}

		function code($$renderer) {
			DemoCodeTab($$renderer, { slug: 'galaxy', usage: usage(), source });
		}

		function customize($$renderer) {
			Customize($$renderer, {
				children: ($$renderer) => {
					PreviewSlider($$renderer, {
						title: 'Density',
						min: 0.1,
						max: 3,
						step: 0.1,
						value: density,
						onChange: (v) => density = v
					});

					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Hue Shift',
						min: 0,
						max: 360,
						step: 1,
						value: hueShift,
						onChange: (v) => hueShift = v
					});

					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Speed',
						min: 0,
						max: 3,
						step: 0.1,
						value: speed,
						onChange: (v) => speed = v
					});

					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Glow Intensity',
						min: 0,
						max: 1,
						step: 0.05,
						value: glowIntensity,
						onChange: (v) => glowIntensity = v
					});

					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Saturation',
						min: 0,
						max: 1,
						step: 0.05,
						value: saturation,
						onChange: (v) => saturation = v
					});

					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Twinkle Intensity',
						min: 0,
						max: 1,
						step: 0.05,
						value: twinkleIntensity,
						onChange: (v) => twinkleIntensity = v
					});

					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Rotation Speed',
						min: 0,
						max: 1,
						step: 0.05,
						value: rotationSpeed,
						onChange: (v) => rotationSpeed = v
					});

					$$renderer.push(`<!----> `);

					PreviewSwitch($$renderer, {
						title: 'Mouse Repulsion',
						checked: mouseRepulsion,
						onChange: (v) => mouseRepulsion = v
					});

					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Repulsion Strength',
						min: 0,
						max: 5,
						step: 0.1,
						value: repulsionStrength,
						onChange: (v) => repulsionStrength = v
					});

					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Auto Center Repulsion',
						min: 0,
						max: 3,
						step: 0.1,
						value: autoCenterRepulsion,
						onChange: (v) => autoCenterRepulsion = v
					});

					$$renderer.push(`<!----> `);

					PreviewSwitch($$renderer, {
						title: 'Transparent',
						checked: transparent,
						onChange: (v) => transparent = v
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
			componentName: 'Galaxy',
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