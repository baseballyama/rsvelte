import * as $ from 'svelte/internal/server';
import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
import Customize from '$lib/components/docs/preview/Customize.svelte';
import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
import PropTable from '$lib/components/docs/preview/PropTable.svelte';
import DemoCodeTab from '$lib/components/docs/preview/DemoCodeTab.svelte';
import ReplayButton from '$lib/components/docs/preview/ReplayButton.svelte';
import ScrollVelocity from '$lib/components/library/TextAnimations/ScrollVelocity/ScrollVelocity.svelte';
import source from '$lib/components/library/TextAnimations/ScrollVelocity/ScrollVelocity.svelte?raw';

export default function ScrollVelocityDemo($$renderer) {
	const DEFAULTS = { velocity: 100, numCopies: 6, damping: 50, stiffness: 400 };
	let velocity = DEFAULTS.velocity;
	let numCopies = DEFAULTS.numCopies;
	let damping = DEFAULTS.damping;
	let stiffness = DEFAULTS.stiffness;
	let replay = 0;
	const hasChanges = $.derived(() => velocity !== DEFAULTS.velocity || numCopies !== DEFAULTS.numCopies || damping !== DEFAULTS.damping || stiffness !== DEFAULTS.stiffness);

	function reset() {
		velocity = DEFAULTS.velocity;
		numCopies = DEFAULTS.numCopies;
		damping = DEFAULTS.damping;
		stiffness = DEFAULTS.stiffness;
		replay++;
	}

	const usage = $.derived(() => `<ScrollVelocity
  texts={['Svelte Bits', 'Scroll Down']}
  velocity={${velocity}}
  numCopies={${numCopies}}
  damping={${damping}}
  stiffness={${stiffness}}
/>`);

	const props = [
		{
			name: 'scrollContainer',
			type: 'HTMLElement | null',
			default: 'null',
			description: 'Optional custom scroll container to track. Defaults to window.'
		},

		{
			name: 'texts',
			type: 'string[]',
			default: '[]',
			description: 'Array of strings to render as scrolling rows. Odd-indexed rows scroll in the opposite direction.'
		},

		{
			name: 'velocity',
			type: 'number',
			default: '100',
			description: 'Base scrolling velocity in px per second. Sign flips for odd-indexed rows.'
		},

		{
			name: 'class',
			type: 'string',
			default: '""',
			description: 'CSS class applied to each text copy span.'
		},

		{
			name: 'damping',
			type: 'number',
			default: '50',
			description: 'Damping coefficient for the spring smoothing scroll velocity.'
		},

		{
			name: 'stiffness',
			type: 'number',
			default: '400',
			description: 'Stiffness coefficient for the spring smoothing scroll velocity.'
		},

		{
			name: 'numCopies',
			type: 'number',
			default: '6',
			description: 'Number of text copies rendered in each row for a continuous loop.'
		},

		{
			name: 'velocityMapping',
			type: '{ input: [number, number]; output: [number, number] }',
			default: '{ input: [0, 1000], output: [0, 5] }',
			description: 'Linear mapping from scroll velocity to motion multiplier.'
		},

		{
			name: 'parallaxClass',
			type: 'string',
			default: '"parallax"',
			description: 'CSS class for the parallax container of each row.'
		},

		{
			name: 'scrollerClass',
			type: 'string',
			default: '"scroller"',
			description: 'CSS class for the inner scroller div of each row.'
		},

		{
			name: 'parallaxStyle',
			type: 'string',
			default: '""',
			description: 'Inline style applied to each parallax container.'
		},

		{
			name: 'scrollerStyle',
			type: 'string',
			default: '""',
			description: 'Inline style applied to each scroller div.'
		}
	];

	$.head('m7bhyo', $$renderer, ($$renderer) => {
		$$renderer.title(($$renderer) => {
			$$renderer.push(`<title>Scroll Velocity - svelte-bits</title>`);
		});
	});

	$$renderer.push(`<h1 class="sub-category">Scroll Velocity</h1> `);

	{
		function preview($$renderer) {
			$$renderer.push(`<div class="demo-container relative flex w-full items-center justify-center overflow-hidden" style="height:400px;padding:0;">`);
			ReplayButton($$renderer, { onClick: () => replay++ });
			$$renderer.push(`<!----> <!---->`);

			{
				$$renderer.push(`<div class="w-full">`);

				ScrollVelocity($$renderer, {
					texts: ['Svelte Bits', 'Scroll Down'],
					velocity,
					numCopies,
					damping,
					stiffness
				});

				$$renderer.push(`<!----></div>`);
			}

			$$renderer.push(`<!----></div>`);
		}

		function code($$renderer) {
			DemoCodeTab($$renderer, { slug: 'scroll-velocity', usage: usage(), source });
		}

		function customize($$renderer) {
			Customize($$renderer, {
				children: ($$renderer) => {
					PreviewSlider($$renderer, {
						title: 'Velocity',
						min: 10,
						max: 500,
						step: 10,
						value: velocity,
						onChange: (v) => {
							velocity = v;
							replay++;
						}
					});

					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Num Copies',
						min: 2,
						max: 12,
						step: 1,
						value: numCopies,
						onChange: (v) => {
							numCopies = v;
							replay++;
						}
					});

					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Damping',
						min: 10,
						max: 100,
						step: 5,
						value: damping,
						onChange: (v) => {
							damping = v;
							replay++;
						}
					});

					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Stiffness',
						min: 100,
						max: 800,
						step: 50,
						value: stiffness,
						onChange: (v) => {
							stiffness = v;
							replay++;
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
			componentName: 'ScrollVelocity',
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