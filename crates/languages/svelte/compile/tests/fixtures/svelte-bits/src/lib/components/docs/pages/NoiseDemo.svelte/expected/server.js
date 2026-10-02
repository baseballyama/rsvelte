import * as $ from 'svelte/internal/server';
import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
import Customize from '$lib/components/docs/preview/Customize.svelte';
import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
import PropTable from '$lib/components/docs/preview/PropTable.svelte';
import DemoCodeTab from '$lib/components/docs/preview/DemoCodeTab.svelte';
import Noise from '$lib/components/library/Animations/Noise/Noise.svelte';
import noiseSource from '$lib/components/library/Animations/Noise/Noise.svelte?raw';

export default function NoiseDemo($$renderer) {
	const DEFAULTS = {
		patternSize: 250,
		patternScaleX: 2,
		patternScaleY: 2,
		patternAlpha: 15
	};

	let patternSize = DEFAULTS.patternSize;
	let patternScaleX = DEFAULTS.patternScaleX;
	let patternScaleY = DEFAULTS.patternScaleY;
	let patternAlpha = DEFAULTS.patternAlpha;
	let renderKey = 0;
	const hasChanges = $.derived(() => patternSize !== DEFAULTS.patternSize || patternScaleX !== DEFAULTS.patternScaleX || patternScaleY !== DEFAULTS.patternScaleY || patternAlpha !== DEFAULTS.patternAlpha);

	function forceRerender() {
		renderKey += 1;
	}

	function reset() {
		patternSize = DEFAULTS.patternSize;
		patternScaleX = DEFAULTS.patternScaleX;
		patternScaleY = DEFAULTS.patternScaleY;
		patternAlpha = DEFAULTS.patternAlpha;
		forceRerender();
	}

	const usage = $.derived(() => `${'<' + 'script lang="ts">'}
  import Noise from '$lib/components/Noise.svelte';
${'</' + 'script>'}

<div style="position:relative;width:100%;height:600px;overflow:hidden;">
  <Noise
    patternSize={${patternSize}}
    patternScaleX={${patternScaleX}}
    patternScaleY={${patternScaleY}}
    patternAlpha={${patternAlpha}}
  />
</div>`);

	const props = [
		{
			name: 'patternSize',
			type: 'number',
			default: '250',
			description: 'Defines the size of the grain pattern.'
		},

		{
			name: 'patternScaleX',
			type: 'number',
			default: '1',
			description: 'Scaling factor for the X-axis of the grain pattern.'
		},

		{
			name: 'patternScaleY',
			type: 'number',
			default: '1',
			description: 'Scaling factor for the Y-axis of the grain pattern.'
		},

		{
			name: 'patternRefreshInterval',
			type: 'number',
			default: '2',
			description: 'Number of frames between regenerations of the grain.'
		},

		{
			name: 'patternAlpha',
			type: 'number',
			default: '15',
			description: 'Opacity of the grain pattern (0-255).'
		}
	];

	$.head('u6vhp6', $$renderer, ($$renderer) => {
		$$renderer.title(($$renderer) => {
			$$renderer.push(`<title>Noise - svelte-bits</title>`);
		});
	});

	$$renderer.push(`<h1 class="sub-category">Noise</h1> `);

	{
		function preview($$renderer) {
			$$renderer.push(`<div class="relative min-h-[400px] w-full overflow-hidden rounded-[14px] bg-[#111]"><p class="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center text-[clamp(3rem,12vw,6rem)] font-black leading-none text-[#333]">Ooh, edgy!</p> <!---->`);

			{
				Noise($$renderer, { patternSize, patternScaleX, patternScaleY, patternAlpha });
			}

			$$renderer.push(`<!----></div>`);
		}

		function code($$renderer) {
			DemoCodeTab($$renderer, { slug: 'noise', usage: usage(), source: noiseSource });
		}

		function customize($$renderer) {
			Customize($$renderer, {
				children: ($$renderer) => {
					PreviewSlider($$renderer, {
						title: 'Pattern Size',
						min: 50,
						max: 500,
						step: 10,
						value: patternSize,
						valueUnit: 'px',
						onChange: (v) => {
							patternSize = v;
							forceRerender();
						}
					});

					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Scale X',
						min: 0.1,
						max: 5,
						step: 0.1,
						value: patternScaleX,
						onChange: (v) => {
							patternScaleX = v;
							forceRerender();
						}
					});

					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Scale Y',
						min: 0.1,
						max: 5,
						step: 0.1,
						value: patternScaleY,
						onChange: (v) => {
							patternScaleY = v;
							forceRerender();
						}
					});

					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Pattern Alpha',
						min: 0,
						max: 25,
						step: 5,
						value: patternAlpha,
						onChange: (v) => {
							patternAlpha = v;
							forceRerender();
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
			onreset: reset,
			hasChanges: hasChanges(),
			componentName: 'Noise',
			usage: usage(),
			source: noiseSource,
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