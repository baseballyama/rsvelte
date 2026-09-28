import * as $ from 'svelte/internal/server';
import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
import Customize from '$lib/components/docs/preview/Customize.svelte';
import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
import PreviewSwitch from '$lib/components/docs/preview/PreviewSwitch.svelte';
import PreviewSelect from '$lib/components/docs/preview/PreviewSelect.svelte';
import PropTable from '$lib/components/docs/preview/PropTable.svelte';
import DemoCodeTab from '$lib/components/docs/preview/DemoCodeTab.svelte';
import GradientText from '$lib/components/library/TextAnimations/GradientText/GradientText.svelte';
import gradientTextSource from '$lib/components/library/TextAnimations/GradientText/GradientText.svelte?raw';

export default function GradientTextDemo($$renderer) {
	const DEFAULTS = {
		colors: ['#FF3E00', '#FF8A4C', '#FFB089'],
		animationSpeed: 8,
		showBorder: false,
		direction: 'horizontal',
		pauseOnHover: false,
		yoyo: true
	};

	let animationSpeed = DEFAULTS.animationSpeed;
	let showBorder = DEFAULTS.showBorder;
	let direction = DEFAULTS.direction;
	let pauseOnHover = DEFAULTS.pauseOnHover;
	let yoyo = DEFAULTS.yoyo;
	const hasChanges = $.derived(() => animationSpeed !== DEFAULTS.animationSpeed || showBorder !== DEFAULTS.showBorder || direction !== DEFAULTS.direction || pauseOnHover !== DEFAULTS.pauseOnHover || yoyo !== DEFAULTS.yoyo);

	function reset() {
		animationSpeed = DEFAULTS.animationSpeed;
		showBorder = DEFAULTS.showBorder;
		direction = DEFAULTS.direction;
		pauseOnHover = DEFAULTS.pauseOnHover;
		yoyo = DEFAULTS.yoyo;
	}

	const usage = $.derived(() => `${'<' + 'script lang="ts">'}
  import GradientText from '$lib/components/GradientText.svelte';
${'</' + 'script>'}

<GradientText
  colors={["#FF3E00", "#FF8A4C", "#FFB089"]}
  animationSpeed={${animationSpeed}}
  showBorder={${showBorder}}
  direction="${direction}"
  pauseOnHover={${pauseOnHover}}
  yoyo={${yoyo}}
>
  Add a splash of color!
</GradientText>`);

	const props = [
		{
			name: 'children',
			type: 'Snippet',
			default: '-',
			description: 'Content to render with the gradient.'
		},

		{
			name: 'colors',
			type: 'string[]',
			default: '["#FF3E00","#FF8A4C","#FFB089"]',
			description: 'Gradient color stops; first color is duplicated at the end for seamless looping.'
		},

		{
			name: 'animationSpeed',
			type: 'number',
			default: '8',
			description: 'Duration (seconds) of one animation cycle.'
		},

		{
			name: 'showBorder',
			type: 'boolean',
			default: 'false',
			description: 'Renders an animated gradient border around the content.'
		},

		{
			name: 'direction',
			type: "'horizontal' | 'vertical' | 'diagonal'",
			default: '"horizontal"',
			description: 'Axis along which the gradient travels.'
		},

		{
			name: 'pauseOnHover',
			type: 'boolean',
			default: 'false',
			description: 'Pauses the animation while hovered.'
		},

		{
			name: 'yoyo',
			type: 'boolean',
			default: 'true',
			description: 'Reverse direction on each cycle instead of seamless loop.'
		},

		{
			name: 'class',
			type: 'string',
			default: '""',
			description: 'Extra classes for the wrapper.'
		}
	];

	$.head('pfyj9p', $$renderer, ($$renderer) => {
		$$renderer.title(($$renderer) => {
			$$renderer.push(`<title>Gradient Text - svelte-bits</title>`);
		});
	});

	$$renderer.push(`<h1 class="sub-category">Gradient Text</h1> `);

	{
		function preview($$renderer) {
			$$renderer.push(`<div style="position:relative;min-height:400px;font-size:48px;font-weight:700;display:flex;align-items:center;justify-content:center;width:100%;">`);

			GradientText($$renderer, {
				colors: DEFAULTS.colors,
				animationSpeed,
				showBorder,
				direction,
				pauseOnHover,
				yoyo,
				children: ($$renderer) => {
					$$renderer.push(`<!---->Add a splash of color!`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----></div>`);
		}

		function code($$renderer) {
			DemoCodeTab($$renderer, {
				slug: 'gradient-text',
				usage: usage(),
				source: gradientTextSource
			});
		}

		function customize($$renderer) {
			Customize($$renderer, {
				children: ($$renderer) => {
					PreviewSlider($$renderer, {
						title: 'Animation Speed',
						min: 1,
						max: 20,
						step: 0.5,
						value: animationSpeed,
						valueUnit: 's',
						onChange: (v) => animationSpeed = v
					});

					$$renderer.push(`<!----> `);

					PreviewSelect($$renderer, {
						title: 'Direction',
						options: [
							{ label: 'Horizontal', value: 'horizontal' },
							{ label: 'Vertical', value: 'vertical' },
							{ label: 'Diagonal', value: 'diagonal' }
						],
						value: direction,
						onChange: (v) => direction = v
					});

					$$renderer.push(`<!----> `);

					PreviewSwitch($$renderer, {
						title: 'Show Border',
						checked: showBorder,
						onChange: (v) => showBorder = v
					});

					$$renderer.push(`<!----> `);
					PreviewSwitch($$renderer, { title: 'Yoyo', checked: yoyo, onChange: (v) => yoyo = v });
					$$renderer.push(`<!----> `);

					PreviewSwitch($$renderer, {
						title: 'Pause on Hover',
						checked: pauseOnHover,
						onChange: (v) => pauseOnHover = v
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
			componentName: 'GradientText',
			usage: usage(),
			source: gradientTextSource,
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