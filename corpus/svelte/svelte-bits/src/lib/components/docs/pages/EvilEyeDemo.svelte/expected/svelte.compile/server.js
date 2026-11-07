import * as $ from 'svelte/internal/server';
import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
import Customize from '$lib/components/docs/preview/Customize.svelte';
import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
import PreviewColorPicker from '$lib/components/docs/preview/PreviewColorPicker.svelte';
import PropTable from '$lib/components/docs/preview/PropTable.svelte';
import DemoCodeTab from '$lib/components/docs/preview/DemoCodeTab.svelte';
import BackgroundContentToggle from '$lib/components/docs/preview/BackgroundContentToggle.svelte';
import EvilEye from '$lib/components/library/Backgrounds/EvilEye/EvilEye.svelte';
import source from '$lib/components/library/Backgrounds/EvilEye/EvilEye.svelte?raw';

export default function EvilEyeDemo($$renderer) {
	const D = {
		eyeColor: '#FF6F37',
		intensity: 1.5,
		pupilSize: 0.6,
		irisWidth: 0.25,
		glowIntensity: 0.35,
		scale: 0.8,
		noiseScale: 1,
		pupilFollow: 1,
		flameSpeed: 1,
		backgroundColor: '#14110E'
	};

	let eyeColor = D.eyeColor;
	let intensity = D.intensity;
	let pupilSize = D.pupilSize;
	let irisWidth = D.irisWidth;
	let glowIntensity = D.glowIntensity;
	let scale = D.scale;
	let noiseScale = D.noiseScale;
	let pupilFollow = D.pupilFollow;
	let flameSpeed = D.flameSpeed;
	let backgroundColor = D.backgroundColor;
	let showContent = true;
	const sO = '<' + 'script lang="ts">';
	const sC = '</' + 'script>';
	const hasChanges = $.derived(() => eyeColor !== D.eyeColor || intensity !== D.intensity || pupilSize !== D.pupilSize || irisWidth !== D.irisWidth || glowIntensity !== D.glowIntensity || scale !== D.scale || noiseScale !== D.noiseScale || pupilFollow !== D.pupilFollow || flameSpeed !== D.flameSpeed || backgroundColor !== D.backgroundColor);

	function reset() {
		eyeColor = D.eyeColor;
		intensity = D.intensity;
		pupilSize = D.pupilSize;
		irisWidth = D.irisWidth;
		glowIntensity = D.glowIntensity;
		scale = D.scale;
		noiseScale = D.noiseScale;
		pupilFollow = D.pupilFollow;
		flameSpeed = D.flameSpeed;
		backgroundColor = D.backgroundColor;
	}

	const usage = $.derived(() => `${sO}
  import EvilEye from '$lib/components/EvilEye.svelte';
${sC}

<div style="width: 100%; height: 600px; position: relative;">
  <EvilEye eyeColor="${eyeColor}" />
</div>`);

	const props = [
		{
			name: 'eyeColor',
			type: 'string',
			default: '"#FF6F37"',
			description: 'Primary eye color.'
		},

		{
			name: 'intensity',
			type: 'number',
			default: '1.5',
			description: 'Brightness multiplier.'
		},

		{
			name: 'pupilSize',
			type: 'number',
			default: '0.6',
			description: 'Pupil size.'
		},

		{
			name: 'irisWidth',
			type: 'number',
			default: '0.25',
			description: 'Iris ring width.'
		},

		{
			name: 'glowIntensity',
			type: 'number',
			default: '0.35',
			description: 'Outer glow intensity.'
		},

		{
			name: 'scale',
			type: 'number',
			default: '0.8',
			description: 'Eye scale.'
		},

		{
			name: 'noiseScale',
			type: 'number',
			default: '1',
			description: 'Noise scale.'
		},

		{
			name: 'pupilFollow',
			type: 'number',
			default: '1',
			description: 'Pupil cursor follow strength.'
		},

		{
			name: 'flameSpeed',
			type: 'number',
			default: '1',
			description: 'Flame animation speed.'
		},

		{
			name: 'backgroundColor',
			type: 'string',
			default: '"#000000"',
			description: 'Background color.'
		}
	];

	$.head('1gaiw99', $$renderer, ($$renderer) => {
		$$renderer.title(($$renderer) => {
			$$renderer.push(`<title>Evil Eye - svelte-bits</title>`);
		});
	});

	$$renderer.push(`<h1 class="sub-category">Evil Eye</h1> `);

	{
		function preview($$renderer) {
			$$renderer.push(`<div class="relative h-[500px] w-full overflow-hidden rounded-[14px]">`);

			EvilEye($$renderer, {
				eyeColor,
				intensity,
				pupilSize,
				irisWidth,
				glowIntensity,
				scale,
				noiseScale,
				pupilFollow,
				flameSpeed,
				backgroundColor
			});

			$$renderer.push(`<!----> `);
			BackgroundContentToggle($$renderer, { showContent, onToggle: (v) => showContent = v });
			$$renderer.push(`<!----></div>`);
		}

		function code($$renderer) {
			DemoCodeTab($$renderer, { slug: 'evil-eye', usage: usage(), source });
		}

		function customize($$renderer) {
			Customize($$renderer, {
				children: ($$renderer) => {
					PreviewColorPicker($$renderer, {
						title: 'Eye Color',
						value: eyeColor,
						onChange: (v) => eyeColor = v
					});

					$$renderer.push(`<!----> `);

					PreviewColorPicker($$renderer, {
						title: 'Background',
						value: backgroundColor,
						onChange: (v) => backgroundColor = v
					});

					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Intensity',
						min: 0,
						max: 5,
						step: 0.05,
						value: intensity,
						onChange: (v) => intensity = v
					});

					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Pupil Size',
						min: 0,
						max: 2,
						step: 0.05,
						value: pupilSize,
						onChange: (v) => pupilSize = v
					});

					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Iris Width',
						min: 0.05,
						max: 0.6,
						step: 0.01,
						value: irisWidth,
						onChange: (v) => irisWidth = v
					});

					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Glow Intensity',
						min: 0,
						max: 2,
						step: 0.05,
						value: glowIntensity,
						onChange: (v) => glowIntensity = v
					});

					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Scale',
						min: 0.2,
						max: 2,
						step: 0.05,
						value: scale,
						onChange: (v) => scale = v
					});

					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Noise Scale',
						min: 0.1,
						max: 3,
						step: 0.05,
						value: noiseScale,
						onChange: (v) => noiseScale = v
					});

					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Pupil Follow',
						min: 0,
						max: 3,
						step: 0.05,
						value: pupilFollow,
						onChange: (v) => pupilFollow = v
					});

					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Flame Speed',
						min: 0,
						max: 3,
						step: 0.05,
						value: flameSpeed,
						onChange: (v) => flameSpeed = v
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
			componentName: 'EvilEye',
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