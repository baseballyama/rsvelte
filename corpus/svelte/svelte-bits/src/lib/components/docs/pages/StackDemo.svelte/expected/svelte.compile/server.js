import * as $ from 'svelte/internal/server';
import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
import Customize from '$lib/components/docs/preview/Customize.svelte';
import PropTable from '$lib/components/docs/preview/PropTable.svelte';
import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
import PreviewSwitch from '$lib/components/docs/preview/PreviewSwitch.svelte';
import DemoCodeTab from '$lib/components/docs/preview/DemoCodeTab.svelte';
import Stack from '$lib/components/library/Components/Stack/Stack.svelte';
import source from '$lib/components/library/Components/Stack/Stack.svelte?raw';

export default function StackDemo($$renderer) {
	const DEFAULTS = {
		randomRotation: false,
		sensitivity: 200,
		autoplay: false,
		autoplayDelay: 3000,
		pauseOnHover: false
	};

	let randomRotation = DEFAULTS.randomRotation;
	let sensitivity = DEFAULTS.sensitivity;
	let autoplay = DEFAULTS.autoplay;
	let autoplayDelay = DEFAULTS.autoplayDelay;
	let pauseOnHover = DEFAULTS.pauseOnHover;
	let key = 0;
	const hasChanges = $.derived(() => randomRotation !== DEFAULTS.randomRotation || sensitivity !== DEFAULTS.sensitivity || autoplay !== DEFAULTS.autoplay || autoplayDelay !== DEFAULTS.autoplayDelay || pauseOnHover !== DEFAULTS.pauseOnHover);

	function reset() {
		randomRotation = DEFAULTS.randomRotation;
		sensitivity = DEFAULTS.sensitivity;
		autoplay = DEFAULTS.autoplay;
		autoplayDelay = DEFAULTS.autoplayDelay;
		pauseOnHover = DEFAULTS.pauseOnHover;
		key++;
	}

	const usage = `<Stack randomRotation={false} sensitivity={200} autoplay={false} autoplayDelay={3000} pauseOnHover={false} />`;

	const props = [
		{
			name: 'randomRotation',
			type: 'boolean',
			default: 'false',
			description: "Applies a random rotation to each card for a 'messy' look."
		},

		{
			name: 'sensitivity',
			type: 'number',
			default: '200',
			description: 'Drag sensitivity for sending a card to the back.'
		},

		{
			name: 'sendToBackOnClick',
			type: 'boolean',
			default: 'false',
			description: 'When enabled, the stack also shifts to the next card on click.'
		},

		{
			name: 'cardsData',
			type: 'StackCard[]',
			default: '[]',
			description: 'Array of cards to display.'
		},

		{
			name: 'animationConfig',
			type: '{ stiffness, damping }',
			default: '{ 260, 20 }',
			description: 'Spring animation configuration.'
		},

		{
			name: 'autoplay',
			type: 'boolean',
			default: 'false',
			description: 'Automatically cycles through cards.'
		},

		{
			name: 'autoplayDelay',
			type: 'number',
			default: '3000',
			description: 'Delay (ms) between auto transitions.'
		},

		{
			name: 'pauseOnHover',
			type: 'boolean',
			default: 'false',
			description: 'Pauses autoplay on hover.'
		}
	];

	$.head('1dlqdpc', $$renderer, ($$renderer) => {
		$$renderer.title(($$renderer) => {
			$$renderer.push(`<title>Stack - svelte-bits</title>`);
		});
	});

	$$renderer.push(`<h1 class="sub-category">Stack</h1> `);

	{
		function preview($$renderer) {
			$$renderer.push(`<div class="demo-container" style="position:relative;min-height:400px;display:flex;align-items:center;justify-content:center;overflow:hidden;"><!---->`);

			{
				Stack($$renderer, {
					randomRotation,
					sensitivity,
					autoplay,
					autoplayDelay,
					pauseOnHover
				});
			}

			$$renderer.push(`<!----></div>`);
		}

		function code($$renderer) {
			DemoCodeTab($$renderer, { slug: 'stack', usage, source });
		}

		function customize($$renderer) {
			Customize($$renderer, {
				children: ($$renderer) => {
					PreviewSwitch($$renderer, {
						title: 'Random Rotation',
						checked: randomRotation,
						onChange: (v) => {
							randomRotation = v;
							key++;
						}
					});

					$$renderer.push(`<!----> `);

					PreviewSwitch($$renderer, {
						title: 'Autoplay',
						checked: autoplay,
						onChange: (v) => autoplay = v
					});

					$$renderer.push(`<!----> `);

					PreviewSwitch($$renderer, {
						title: 'Pause On Hover',
						checked: pauseOnHover,
						onChange: (v) => pauseOnHover = v
					});

					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Sensitivity',
						min: 100,
						max: 300,
						step: 10,
						value: sensitivity,
						onChange: (v) => {
							sensitivity = v;
							key++;
						}
					});

					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Autoplay Delay',
						min: 1000,
						max: 5000,
						step: 500,
						value: autoplayDelay,
						onChange: (v) => autoplayDelay = v
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
			componentName: 'Stack',
			usage,
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