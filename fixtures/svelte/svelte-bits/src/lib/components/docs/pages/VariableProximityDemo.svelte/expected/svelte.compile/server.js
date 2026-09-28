import * as $ from 'svelte/internal/server';
import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
import Customize from '$lib/components/docs/preview/Customize.svelte';
import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
import PreviewSelect from '$lib/components/docs/preview/PreviewSelect.svelte';
import PropTable from '$lib/components/docs/preview/PropTable.svelte';
import DemoCodeTab from '$lib/components/docs/preview/DemoCodeTab.svelte';
import ReplayButton from '$lib/components/docs/preview/ReplayButton.svelte';
import VariableProximity from '$lib/components/library/TextAnimations/VariableProximity/VariableProximity.svelte';
import source from '$lib/components/library/TextAnimations/VariableProximity/VariableProximity.svelte?raw';

export default function VariableProximityDemo($$renderer) {
	const DEFAULTS = { radius: 100, falloff: 'linear' };
	let radius = DEFAULTS.radius;
	let falloff = DEFAULTS.falloff;
	let replay = 0;
	let containerEl = void 0;
	const hasChanges = $.derived(() => radius !== DEFAULTS.radius || falloff !== DEFAULTS.falloff);

	function reset() {
		radius = DEFAULTS.radius;
		falloff = DEFAULTS.falloff;
		replay++;
	}

	const usage = $.derived(() => `<VariableProximity
  label="Hover me! And then star Svelte Bits on GitHub, or else..."
  fromFontVariationSettings="'wght' 400, 'opsz' 9"
  toFontVariationSettings="'wght' 1000, 'opsz' 40"
  containerRef={containerEl}
  radius={${radius}}
  falloff="${falloff}"
/>`);

	const props = [
		{
			name: 'label',
			type: 'string',
			default: '""',
			description: 'The text content to display.'
		},

		{
			name: 'fromFontVariationSettings',
			type: 'string',
			default: "\"'wght' 400, 'opsz' 9\"",
			description: 'Variation settings applied when the cursor is far from the letter.'
		},

		{
			name: 'toFontVariationSettings',
			type: 'string',
			default: "\"'wght' 800, 'opsz' 40\"",
			description: 'Target variation settings reached at the cursor position.'
		},

		{
			name: 'containerRef',
			type: 'HTMLElement | null',
			default: 'null',
			description: 'Container used to compute relative cursor position. Without it the effect is disabled.'
		},

		{
			name: 'radius',
			type: 'number',
			default: '50',
			description: 'Proximity radius (in pixels) within which the effect applies.'
		},

		{
			name: 'falloff',
			type: '"linear" | "exponential" | "gaussian"',
			default: '"linear"',
			description: 'Curve shape of the influence falloff with distance.'
		},

		{
			name: 'class',
			type: 'string',
			default: '""',
			description: 'Additional CSS class for the wrapper span.'
		},

		{
			name: 'style',
			type: 'string',
			default: '""',
			description: 'Inline style for the wrapper span.'
		}
	];

	$.head('16lttmn', $$renderer, ($$renderer) => {
		$$renderer.title(($$renderer) => {
			$$renderer.push(`<title>Variable Proximity - svelte-bits</title>`);
		});
	});

	$$renderer.push(`<h1 class="sub-category">Variable Proximity</h1> `);

	{
		function preview($$renderer) {
			$$renderer.push(`<div class="demo-container variable-proximity-demo relative flex w-full items-center justify-center overflow-hidden svelte-16lttmn" style="height:400px;padding:1rem;cursor:pointer;">`);
			ReplayButton($$renderer, { onClick: () => replay++ });
			$$renderer.push(`<!----> <!---->`);

			{
				VariableProximity($$renderer, {
					label: 'Hover me! And then star Svelte Bits on GitHub, or else...',
					fromFontVariationSettings: '\'wght\' 400, \'opsz\' 9',
					toFontVariationSettings: '\'wght\' 1000, \'opsz\' 40',
					containerRef: containerEl ?? null,
					radius,
					falloff
				});
			}

			$$renderer.push(`<!----></div>`);
		}

		function code($$renderer) {
			DemoCodeTab($$renderer, { slug: 'variable-proximity', usage: usage(), source });
		}

		function customize($$renderer) {
			Customize($$renderer, {
				children: ($$renderer) => {
					PreviewSlider($$renderer, {
						title: 'Radius',
						min: 50,
						max: 300,
						step: 10,
						value: radius,
						valueUnit: 'px',
						onChange: (v) => {
							radius = v;
						}
					});

					$$renderer.push(`<!----> `);

					PreviewSelect($$renderer, {
						title: 'Falloff',
						value: falloff,
						options: [
							{ value: 'linear', label: 'Linear' },
							{ value: 'exponential', label: 'Exponential' },
							{ value: 'gaussian', label: 'Gaussian' }
						],

						onChange: (v) => {
							falloff = v;
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
			componentName: 'VariableProximity',
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