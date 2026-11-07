import * as $ from 'svelte/internal/server';
import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
import Customize from '$lib/components/docs/preview/Customize.svelte';
import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
import PreviewSwitch from '$lib/components/docs/preview/PreviewSwitch.svelte';
import PreviewColorPicker from '$lib/components/docs/preview/PreviewColorPicker.svelte';
import PropTable from '$lib/components/docs/preview/PropTable.svelte';
import DemoCodeTab from '$lib/components/docs/preview/DemoCodeTab.svelte';
import PixelTransition from '$lib/components/library/Animations/PixelTransition/PixelTransition.svelte';
import source from '$lib/components/library/Animations/PixelTransition/PixelTransition.svelte?raw';

export default function PixelTransitionDemo($$renderer) {
	const DEFAULTS = {
		gridSize: 8,
		pixelColor: '#ffffff',
		animationStepDuration: 0.4,
		once: false
	};

	let gridSize = DEFAULTS.gridSize;
	let pixelColor = DEFAULTS.pixelColor;
	let animationStepDuration = DEFAULTS.animationStepDuration;
	let once = DEFAULTS.once;
	const hasChanges = $.derived(() => gridSize !== DEFAULTS.gridSize || pixelColor !== DEFAULTS.pixelColor || animationStepDuration !== DEFAULTS.animationStepDuration || once !== DEFAULTS.once);

	function reset() {
		gridSize = DEFAULTS.gridSize;
		pixelColor = DEFAULTS.pixelColor;
		animationStepDuration = DEFAULTS.animationStepDuration;
		once = DEFAULTS.once;
	}

	const usage = $.derived(() => `<PixelTransition gridSize={${gridSize}} pixelColor="${pixelColor}" animationStepDuration={${animationStepDuration}} aspectRatio="100%">
  {#snippet firstContent()}<img src="..." />{/snippet}
  {#snippet secondContent()}<div>Hello!</div>{/snippet}
</PixelTransition>`);

	const props = [
		{
			name: 'firstContent',
			type: 'Snippet',
			default: 'required',
			description: 'Initial content.'
		},

		{
			name: 'secondContent',
			type: 'Snippet',
			default: 'required',
			description: 'Revealed content on hover.'
		},

		{
			name: 'gridSize',
			type: 'number',
			default: '7',
			description: 'Pixel grid resolution.'
		},

		{
			name: 'pixelColor',
			type: 'string',
			default: '"currentColor"',
			description: 'Color of transition pixels.'
		},

		{
			name: 'animationStepDuration',
			type: 'number',
			default: '0.3',
			description: 'Per-step duration (s).'
		},

		{
			name: 'aspectRatio',
			type: 'string',
			default: '"100%"',
			description: 'CSS aspect-ratio padding-bottom.'
		},

		{
			name: 'class',
			type: 'string',
			default: '""',
			description: 'Wrapper class.'
		},

		{
			name: 'pixelClass',
			type: 'string',
			default: '""',
			description: 'Class for each pixel.'
		}
	];

	$.head('y93ehd', $$renderer, ($$renderer) => {
		$$renderer.title(($$renderer) => {
			$$renderer.push(`<title>Pixel Transition - svelte-bits</title>`);
		});
	});

	$$renderer.push(`<h1 class="sub-category">Pixel Transition</h1> `);

	{
		function preview($$renderer) {
			$$renderer.push(`<div class="demo-container" style="position:relative;height:500px;display:flex;align-items:center;justify-content:center;"><div style="width:340px;">`);

			{
				function firstContent($$renderer) {
					$$renderer.push(`<img src="https://picsum.photos/seed/pix/400/400" alt="" style="width:100%;height:100%;object-fit:cover;"/>`);
				}

				function secondContent($$renderer) {
					$$renderer.push(`<div style="display:grid;place-items:center;width:100%;height:100%;background:#111;color:#fff;font-size:1.6rem;font-weight:700;">Hello!</div>`);
				}

				PixelTransition($$renderer, {
					gridSize,
					pixelColor,
					animationStepDuration,
					aspectRatio: '100%',
					firstContent,
					secondContent,
					$$slots: { firstContent: true, secondContent: true }
				});
			}

			$$renderer.push(`<!----></div></div>`);
		}

		function code($$renderer) {
			DemoCodeTab($$renderer, { slug: 'pixel-transition', usage: usage(), source });
		}

		function customize($$renderer) {
			Customize($$renderer, {
				children: ($$renderer) => {
					PreviewColorPicker($$renderer, {
						title: 'Pixel Color',
						value: pixelColor,
						onChange: (v) => pixelColor = v
					});

					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Grid Size',
						min: 2,
						max: 20,
						step: 1,
						value: gridSize,
						onChange: (v) => gridSize = v
					});

					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Step Duration',
						min: 0.1,
						max: 2,
						step: 0.05,
						value: animationStepDuration,
						valueUnit: 's',
						onChange: (v) => animationStepDuration = v
					});

					$$renderer.push(`<!----> `);
					PreviewSwitch($$renderer, { title: 'Play Once', checked: once, onChange: (v) => once = v });
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
			componentName: 'PixelTransition',
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