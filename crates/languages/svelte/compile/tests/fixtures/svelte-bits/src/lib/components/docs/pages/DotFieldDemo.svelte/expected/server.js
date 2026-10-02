import * as $ from 'svelte/internal/server';
import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
import Customize from '$lib/components/docs/preview/Customize.svelte';
import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
import PreviewSwitch from '$lib/components/docs/preview/PreviewSwitch.svelte';
import PreviewColorPicker from '$lib/components/docs/preview/PreviewColorPicker.svelte';
import PropTable from '$lib/components/docs/preview/PropTable.svelte';
import DemoCodeTab from '$lib/components/docs/preview/DemoCodeTab.svelte';
import BackgroundContentToggle from '$lib/components/docs/preview/BackgroundContentToggle.svelte';
import DotField from '$lib/components/library/Backgrounds/DotField/DotField.svelte';
import dotFieldSource from '$lib/components/library/Backgrounds/DotField/DotField.svelte?raw';

export default function DotFieldDemo($$renderer) {
	const DEFAULTS = {
		dotRadius: 1.5,
		dotSpacing: 14,
		cursorRadius: 500,
		cursorForce: 0.1,
		bulgeOnly: true,
		bulgeStrength: 67,
		glowRadius: 160,
		sparkle: false,
		waveAmplitude: 0,
		gradientFrom: '#ff3e00',
		gradientTo: '#ffb089',
		glowColor: '#14110e'
	};

	let dotRadius = DEFAULTS.dotRadius;
	let dotSpacing = DEFAULTS.dotSpacing;
	let cursorRadius = DEFAULTS.cursorRadius;
	let cursorForce = DEFAULTS.cursorForce;
	let bulgeOnly = DEFAULTS.bulgeOnly;
	let bulgeStrength = DEFAULTS.bulgeStrength;
	let glowRadius = DEFAULTS.glowRadius;
	let sparkle = DEFAULTS.sparkle;
	let waveAmplitude = DEFAULTS.waveAmplitude;
	let gradientFrom = DEFAULTS.gradientFrom;
	let gradientTo = DEFAULTS.gradientTo;
	let glowColor = DEFAULTS.glowColor;
	let showContent = true;
	const scriptOpen = '<' + 'script lang="ts">';
	const scriptClose = '</' + 'script>';
	const hasChanges = $.derived(() => dotRadius !== DEFAULTS.dotRadius || dotSpacing !== DEFAULTS.dotSpacing || cursorRadius !== DEFAULTS.cursorRadius || cursorForce !== DEFAULTS.cursorForce || bulgeOnly !== DEFAULTS.bulgeOnly || bulgeStrength !== DEFAULTS.bulgeStrength || glowRadius !== DEFAULTS.glowRadius || sparkle !== DEFAULTS.sparkle || waveAmplitude !== DEFAULTS.waveAmplitude || gradientFrom !== DEFAULTS.gradientFrom || gradientTo !== DEFAULTS.gradientTo || glowColor !== DEFAULTS.glowColor);

	function reset() {
		dotRadius = DEFAULTS.dotRadius;
		dotSpacing = DEFAULTS.dotSpacing;
		cursorRadius = DEFAULTS.cursorRadius;
		cursorForce = DEFAULTS.cursorForce;
		bulgeOnly = DEFAULTS.bulgeOnly;
		bulgeStrength = DEFAULTS.bulgeStrength;
		glowRadius = DEFAULTS.glowRadius;
		sparkle = DEFAULTS.sparkle;
		waveAmplitude = DEFAULTS.waveAmplitude;
		gradientFrom = DEFAULTS.gradientFrom;
		gradientTo = DEFAULTS.gradientTo;
		glowColor = DEFAULTS.glowColor;
	}

	const usage = $.derived(() => `${scriptOpen}
  import DotField from '$lib/components/DotField.svelte';
${scriptClose}

<div style="height: 500px; position: relative; overflow: hidden;">
  <DotField
    dotRadius={${dotRadius}}
    dotSpacing={${dotSpacing}}
    cursorRadius={${cursorRadius}}
    cursorForce={${cursorForce}}
    bulgeOnly={${bulgeOnly}}
    bulgeStrength={${bulgeStrength}}
    glowRadius={${glowRadius}}
    sparkle={${sparkle}}
    waveAmplitude={${waveAmplitude}}
    gradientFrom="${gradientFrom}"
    gradientTo="${gradientTo}"
    glowColor="${glowColor}"
  />
</div>`);

	const props = [
		{
			name: 'dotRadius',
			type: 'number',
			default: '1.5',
			description: 'Radius of each individual dot in the grid.'
		},

		{
			name: 'dotSpacing',
			type: 'number',
			default: '14',
			description: 'Spacing between dots in the grid.'
		},

		{
			name: 'cursorRadius',
			type: 'number',
			default: '500',
			description: 'Radius of the cursor interaction area.'
		},

		{
			name: 'cursorForce',
			type: 'number',
			default: '0.1',
			description: 'Force applied to dots when not in bulge mode.'
		},

		{
			name: 'bulgeOnly',
			type: 'boolean',
			default: 'true',
			description: 'When true, dots bulge around the cursor. When false, dots are pushed with physics.'
		},

		{
			name: 'bulgeStrength',
			type: 'number',
			default: '67',
			description: 'Strength of the bulge effect around the cursor.'
		},

		{
			name: 'glowRadius',
			type: 'number',
			default: '160',
			description: 'Radius of the SVG glow effect that follows the cursor.'
		},

		{
			name: 'sparkle',
			type: 'boolean',
			default: 'false',
			description: 'When enabled, a small fraction of dots sparkle at a larger size.'
		},

		{
			name: 'waveAmplitude',
			type: 'number',
			default: '0',
			description: 'Amplitude of the wave displacement animation applied to dots.'
		},

		{
			name: 'gradientFrom',
			type: 'string',
			default: '"rgba(255, 62, 0, 0.35)"',
			description: 'Start color of the diagonal gradient applied to dots.'
		},

		{
			name: 'gradientTo',
			type: 'string',
			default: '"rgba(255, 176, 137, 0.25)"',
			description: 'End color of the diagonal gradient applied to dots.'
		},

		{
			name: 'glowColor',
			type: 'string',
			default: '"#14110E"',
			description: 'Color of the radial glow effect that follows the cursor.'
		},

		{
			name: 'class',
			type: 'string',
			default: '""',
			description: 'Extra classes for the root wrapper.'
		}
	];

	$.head('111i6gj', $$renderer, ($$renderer) => {
		$$renderer.title(($$renderer) => {
			$$renderer.push(`<title>Dot Field - svelte-bits</title>`);
		});
	});

	$$renderer.push(`<h1 class="sub-category">Dot Field</h1> `);

	{
		function preview($$renderer) {
			$$renderer.push(`<div class="relative h-[500px] w-full overflow-hidden rounded-2xl bg-[#14110e]">`);

			DotField($$renderer, {
				dotRadius,
				dotSpacing,
				cursorRadius,
				cursorForce,
				bulgeOnly,
				bulgeStrength,
				glowRadius,
				sparkle,
				waveAmplitude,
				gradientFrom,
				gradientTo,
				glowColor
			});

			$$renderer.push(`<!----> `);
			BackgroundContentToggle($$renderer, { showContent, onToggle: (v) => showContent = v });
			$$renderer.push(`<!----></div>`);
		}

		function code($$renderer) {
			DemoCodeTab($$renderer, { slug: 'dot-field', usage: usage(), source: dotFieldSource });
		}

		function customize($$renderer) {
			Customize($$renderer, {
				children: ($$renderer) => {
					PreviewSlider($$renderer, {
						title: 'Dot Radius',
						min: 0.5,
						max: 5,
						step: 0.5,
						value: dotRadius,
						onChange: (v) => dotRadius = v
					});

					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Dot Spacing',
						min: 5,
						max: 30,
						step: 1,
						value: dotSpacing,
						onChange: (v) => dotSpacing = v
					});

					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Cursor Radius',
						min: 100,
						max: 1000,
						step: 50,
						value: cursorRadius,
						onChange: (v) => cursorRadius = v
					});

					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Cursor Force',
						min: 0,
						max: 1,
						step: 0.01,
						value: cursorForce,
						onChange: (v) => cursorForce = v
					});

					$$renderer.push(`<!----> `);

					PreviewSwitch($$renderer, {
						title: 'Bulge Only',
						checked: bulgeOnly,
						onChange: (v) => bulgeOnly = v
					});

					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Bulge Strength',
						min: 0,
						max: 150,
						step: 1,
						value: bulgeStrength,
						onChange: (v) => bulgeStrength = v
					});

					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Glow Radius',
						min: 50,
						max: 400,
						step: 10,
						value: glowRadius,
						onChange: (v) => glowRadius = v
					});

					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Wave Amplitude',
						min: 0,
						max: 20,
						step: 1,
						value: waveAmplitude,
						onChange: (v) => waveAmplitude = v
					});

					$$renderer.push(`<!----> `);

					PreviewSwitch($$renderer, {
						title: 'Sparkle',
						checked: sparkle,
						onChange: (v) => sparkle = v
					});

					$$renderer.push(`<!----> `);

					PreviewColorPicker($$renderer, {
						title: 'Gradient From',
						value: gradientFrom,
						onChange: (v) => gradientFrom = v
					});

					$$renderer.push(`<!----> `);

					PreviewColorPicker($$renderer, {
						title: 'Gradient To',
						value: gradientTo,
						onChange: (v) => gradientTo = v
					});

					$$renderer.push(`<!----> `);

					PreviewColorPicker($$renderer, {
						title: 'Glow Color',
						value: glowColor,
						onChange: (v) => glowColor = v
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
			componentName: 'DotField',
			usage: usage(),
			source: dotFieldSource,
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