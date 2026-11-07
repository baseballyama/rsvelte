import * as $ from 'svelte/internal/server';
import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
import Customize from '$lib/components/docs/preview/Customize.svelte';
import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
import PreviewSwitch from '$lib/components/docs/preview/PreviewSwitch.svelte';
import PropTable from '$lib/components/docs/preview/PropTable.svelte';
import DemoCodeTab from '$lib/components/docs/preview/DemoCodeTab.svelte';
import BackgroundContentToggle from '$lib/components/docs/preview/BackgroundContentToggle.svelte';
import Prism from '$lib/components/library/Backgrounds/Prism/Prism.svelte';
import source from '$lib/components/library/Backgrounds/Prism/Prism.svelte?raw';

export default function PrismDemo($$renderer) {
	const D = {
		height: 3.5,
		baseWidth: 5.5,
		animationType: 'rotate',
		glow: 1,
		noise: 0.5,
		scale: 3.6,
		hueShift: 0,
		colorFrequency: 1,
		hoverStrength: 2,
		inertia: 0.05,
		bloom: 1,
		timeScale: 0.5,
		transparent: true
	};

	let height = D.height;
	let baseWidth = D.baseWidth;
	let animationType = D.animationType;
	let glow = D.glow;
	let noise = D.noise;
	let scale = D.scale;
	let hueShift = D.hueShift;
	let colorFrequency = D.colorFrequency;
	let hoverStrength = D.hoverStrength;
	let inertia = D.inertia;
	let bloom = D.bloom;
	let timeScale = D.timeScale;
	let transparent = D.transparent;
	let showContent = true;
	const sO = '<' + 'script lang="ts">';
	const sC = '</' + 'script>';
	const hasChanges = $.derived(() => height !== D.height || baseWidth !== D.baseWidth || animationType !== D.animationType || glow !== D.glow || noise !== D.noise || scale !== D.scale || hueShift !== D.hueShift || colorFrequency !== D.colorFrequency || hoverStrength !== D.hoverStrength || inertia !== D.inertia || bloom !== D.bloom || timeScale !== D.timeScale || transparent !== D.transparent);

	function reset() {
		height = D.height;
		baseWidth = D.baseWidth;
		animationType = D.animationType;
		glow = D.glow;
		noise = D.noise;
		scale = D.scale;
		hueShift = D.hueShift;
		colorFrequency = D.colorFrequency;
		hoverStrength = D.hoverStrength;
		inertia = D.inertia;
		bloom = D.bloom;
		timeScale = D.timeScale;
		transparent = D.transparent;
	}

	const usage = $.derived(() => `${sO}
  import Prism from '$lib/components/Prism.svelte';
${sC}

<div style="position: relative; width: 100%; height: 600px;">
  <Prism animationType="${animationType}" timeScale={${timeScale}} />
</div>`);

	const props = [
		{
			name: 'height',
			type: 'number',
			default: '3.5',
			description: 'Pyramid height.'
		},

		{
			name: 'baseWidth',
			type: 'number',
			default: '5.5',
			description: 'Pyramid base width.'
		},

		{
			name: 'animationType',
			type: "'rotate'|'hover'|'3drotate'",
			default: "'rotate'",
			description: 'Animation mode.'
		},

		{
			name: 'glow',
			type: 'number',
			default: '1',
			description: 'Glow strength.'
		},

		{
			name: 'offset',
			type: '{x,y}',
			default: '{x:0,y:0}',
			description: 'Pixel offset.'
		},

		{
			name: 'noise',
			type: 'number',
			default: '0.5',
			description: 'Grain noise.'
		},

		{
			name: 'transparent',
			type: 'boolean',
			default: 'true',
			description: 'Alpha background.'
		},

		{
			name: 'scale',
			type: 'number',
			default: '3.6',
			description: 'Scene scale.'
		},

		{
			name: 'hueShift',
			type: 'number',
			default: '0',
			description: 'Hue rotation (rad).'
		},

		{
			name: 'colorFrequency',
			type: 'number',
			default: '1',
			description: 'Color stripe frequency.'
		},

		{
			name: 'hoverStrength',
			type: 'number',
			default: '2',
			description: 'Hover rotate strength.'
		},

		{
			name: 'inertia',
			type: 'number',
			default: '0.05',
			description: 'Hover inertia.'
		},

		{
			name: 'bloom',
			type: 'number',
			default: '1',
			description: 'Bloom multiplier.'
		},

		{
			name: 'suspendWhenOffscreen',
			type: 'boolean',
			default: 'false',
			description: 'Pause RAF off-screen.'
		},

		{
			name: 'timeScale',
			type: 'number',
			default: '0.5',
			description: 'Time multiplier.'
		}
	];

	let key = 0;

	function rebuild() {
		key++;
	}

	$.head('1eyc6g3', $$renderer, ($$renderer) => {
		$$renderer.title(($$renderer) => {
			$$renderer.push(`<title>Prism - svelte-bits</title>`);
		});
	});

	$$renderer.push(`<h1 class="sub-category">Prism</h1> `);

	{
		function preview($$renderer) {
			$$renderer.push(`<div class="relative h-[500px] w-full overflow-hidden rounded-[14px]"><!---->`);

			{
				Prism($$renderer, {
					height,
					baseWidth,
					animationType,
					glow,
					noise,
					scale,
					hueShift,
					colorFrequency,
					hoverStrength,
					inertia,
					bloom,
					timeScale,
					transparent
				});
			}

			$$renderer.push(`<!----> `);
			BackgroundContentToggle($$renderer, { showContent, onToggle: (v) => showContent = v });
			$$renderer.push(`<!----></div>`);
		}

		function code($$renderer) {
			DemoCodeTab($$renderer, { slug: 'prism', usage: usage(), source });
		}

		function customize($$renderer) {
			Customize($$renderer, {
				children: ($$renderer) => {
					PreviewSlider($$renderer, {
						title: 'Height',
						min: 0.5,
						max: 10,
						step: 0.1,
						value: height,
						onChange: (v) => {
							height = v;
							rebuild();
						}
					});

					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Base Width',
						min: 0.5,
						max: 12,
						step: 0.1,
						value: baseWidth,
						onChange: (v) => {
							baseWidth = v;
							rebuild();
						}
					});

					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Glow',
						min: 0,
						max: 5,
						step: 0.1,
						value: glow,
						onChange: (v) => glow = v
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
						title: 'Scale',
						min: 0.5,
						max: 10,
						step: 0.1,
						value: scale,
						onChange: (v) => {
							scale = v;
							rebuild();
						}
					});

					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Hue Shift',
						min: -3.14,
						max: 3.14,
						step: 0.01,
						value: hueShift,
						onChange: (v) => hueShift = v
					});

					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Color Frequency',
						min: 0,
						max: 5,
						step: 0.1,
						value: colorFrequency,
						onChange: (v) => colorFrequency = v
					});

					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Hover Strength',
						min: 0,
						max: 5,
						step: 0.1,
						value: hoverStrength,
						onChange: (v) => {
							hoverStrength = v;
							rebuild();
						}
					});

					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Inertia',
						min: 0.01,
						max: 1,
						step: 0.01,
						value: inertia,
						onChange: (v) => {
							inertia = v;
							rebuild();
						}
					});

					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Bloom',
						min: 0,
						max: 5,
						step: 0.1,
						value: bloom,
						onChange: (v) => bloom = v
					});

					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Time Scale',
						min: 0,
						max: 3,
						step: 0.05,
						value: timeScale,
						onChange: (v) => {
							timeScale = v;
							rebuild();
						}
					});

					$$renderer.push(`<!----> `);

					PreviewSwitch($$renderer, {
						title: 'Transparent',
						checked: transparent,
						onChange: (v) => {
							transparent = v;
							rebuild();
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
			onreset: () => {
				reset();
				rebuild();
			},
			hasChanges: hasChanges(),
			componentName: 'Prism',
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