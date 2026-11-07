import * as $ from 'svelte/internal/server';
import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
import Customize from '$lib/components/docs/preview/Customize.svelte';
import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
import PropTable from '$lib/components/docs/preview/PropTable.svelte';
import DemoCodeTab from '$lib/components/docs/preview/DemoCodeTab.svelte';
import DecayCard from '$lib/components/library/Components/DecayCard/DecayCard.svelte';
import source from '$lib/components/library/Components/DecayCard/DecayCard.svelte?raw';

export default function DecayCardDemo($$renderer) {
	const DEFAULTS = {
		baseFrequency: 0.015,
		numOctaves: 5,
		seed: 4,
		maxDisplacement: 400,
		movementBound: 50
	};

	let baseFrequency = DEFAULTS.baseFrequency;
	let numOctaves = DEFAULTS.numOctaves;
	let seed = DEFAULTS.seed;
	let maxDisplacement = DEFAULTS.maxDisplacement;
	let movementBound = DEFAULTS.movementBound;
	let key = 0;
	const hasChanges = $.derived(() => baseFrequency !== DEFAULTS.baseFrequency || numOctaves !== DEFAULTS.numOctaves || seed !== DEFAULTS.seed || maxDisplacement !== DEFAULTS.maxDisplacement || movementBound !== DEFAULTS.movementBound);

	function reset() {
		baseFrequency = DEFAULTS.baseFrequency;
		numOctaves = DEFAULTS.numOctaves;
		seed = DEFAULTS.seed;
		maxDisplacement = DEFAULTS.maxDisplacement;
		movementBound = DEFAULTS.movementBound;
		key++;
	}

	const usage = $.derived(() => `<DecayCard baseFrequency={${baseFrequency}} numOctaves={${numOctaves}} seed={${seed}} maxDisplacement={${maxDisplacement}} movementBound={${movementBound}} />`);

	const props = [
		{
			name: 'width',
			type: 'number',
			default: '300',
			description: 'Card width.'
		},

		{
			name: 'height',
			type: 'number',
			default: '400',
			description: 'Card height.'
		},

		{
			name: 'image',
			type: 'string',
			default: 'picsum.photos/300/400',
			description: 'Image URL.'
		},

		{
			name: 'baseFrequency',
			type: 'number',
			default: '0.015',
			description: 'Turbulence base frequency.'
		},

		{
			name: 'numOctaves',
			type: 'number',
			default: '5',
			description: 'Turbulence octaves.'
		},

		{
			name: 'seed',
			type: 'number',
			default: '4',
			description: 'Turbulence seed.'
		},

		{
			name: 'maxDisplacement',
			type: 'number',
			default: '400',
			description: 'Max SVG displacement scale.'
		},

		{
			name: 'movementBound',
			type: 'number',
			default: '50',
			description: 'Soft clamp for image translation.'
		}
	];

	$.head('6fpp8g', $$renderer, ($$renderer) => {
		$$renderer.title(($$renderer) => {
			$$renderer.push(`<title>Decay Card - svelte-bits</title>`);
		});
	});

	$$renderer.push(`<h1 class="sub-category">Decay Card</h1> `);

	{
		function preview($$renderer) {
			$$renderer.push(`<div class="demo-container" style="position:relative;display:flex;align-items:center;justify-content:center;min-height:600px;"><!---->`);

			{
				{
					function children($$renderer) {
						$$renderer.push(`<span style="color:#fff;">The<br/>Decay<br/>Card</span>`);
					}

					DecayCard($$renderer, {
						baseFrequency,
						numOctaves,
						seed,
						maxDisplacement,
						movementBound,
						children,
						$$slots: { default: true }
					});
				}
			}

			$$renderer.push(`<!----></div>`);
		}

		function code($$renderer) {
			DemoCodeTab($$renderer, { slug: 'decay-card', usage: usage(), source });
		}

		function customize($$renderer) {
			Customize($$renderer, {
				children: ($$renderer) => {
					PreviewSlider($$renderer, {
						title: 'Base Frequency',
						min: 0,
						max: 0.1,
						step: 0.001,
						value: baseFrequency,
						onChange: (v) => {
							baseFrequency = v;
							key++;
						}
					});

					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Octaves',
						min: 1,
						max: 10,
						step: 1,
						value: numOctaves,
						onChange: (v) => {
							numOctaves = v;
							key++;
						}
					});

					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Seed',
						min: 0,
						max: 50,
						step: 1,
						value: seed,
						onChange: (v) => {
							seed = v;
							key++;
						}
					});

					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Max Displacement',
						min: 0,
						max: 1000,
						step: 10,
						value: maxDisplacement,
						onChange: (v) => {
							maxDisplacement = v;
							key++;
						}
					});

					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Movement Bound',
						min: 0,
						max: 300,
						step: 5,
						value: movementBound,
						onChange: (v) => {
							movementBound = v;
							key++;
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
			componentName: 'DecayCard',
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