import * as $ from 'svelte/internal/server';
import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
import Customize from '$lib/components/docs/preview/Customize.svelte';
import PreviewSwitch from '$lib/components/docs/preview/PreviewSwitch.svelte';
import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
import PropTable from '$lib/components/docs/preview/PropTable.svelte';
import DemoCodeTab from '$lib/components/docs/preview/DemoCodeTab.svelte';
import BounceCards from '$lib/components/library/Components/BounceCards/BounceCards.svelte';
import source from '$lib/components/library/Components/BounceCards/BounceCards.svelte?raw';

export default function BounceCardsDemo($$renderer) {
	const DEFAULTS = {
		enableHover: false,
		animationDelay: 1,
		animationStagger: 0.08
	};

	let enableHover = DEFAULTS.enableHover;
	let animationDelay = DEFAULTS.animationDelay;
	let animationStagger = DEFAULTS.animationStagger;
	let key = 0;

	const images = [
		'https://picsum.photos/400/400?grayscale',
		'https://picsum.photos/500/500?grayscale',
		'https://picsum.photos/600/600?grayscale',
		'https://picsum.photos/700/700?grayscale',
		'https://picsum.photos/300/300?grayscale'
	];

	const transformStyles = [
		'rotate(5deg) translate(-150px)',
		'rotate(0deg) translate(-70px)',
		'rotate(-5deg)',
		'rotate(5deg) translate(70px)',
		'rotate(-5deg) translate(150px)'
	];

	const hasChanges = $.derived(() => enableHover !== DEFAULTS.enableHover || animationDelay !== DEFAULTS.animationDelay || animationStagger !== DEFAULTS.animationStagger);

	function reset() {
		enableHover = DEFAULTS.enableHover;
		animationDelay = DEFAULTS.animationDelay;
		animationStagger = DEFAULTS.animationStagger;
		key++;
	}

	const usage = $.derived(() => `<BounceCards images={images} animationDelay={${animationDelay}} animationStagger={${animationStagger}} enableHover={${enableHover}} />`);

	const props = [
		{
			name: 'class',
			type: 'string',
			default: '""',
			description: 'Additional CSS classes for the container.'
		},

		{
			name: 'images',
			type: 'string[]',
			default: '[]',
			description: 'Array of image URLs to display.'
		},

		{
			name: 'containerWidth',
			type: 'number',
			default: '400',
			description: 'Width of the container (px).'
		},

		{
			name: 'containerHeight',
			type: 'number',
			default: '400',
			description: 'Height of the container (px).'
		},

		{
			name: 'animationDelay',
			type: 'number',
			default: '0.5',
			description: 'Delay (in seconds) before the animation starts.'
		},

		{
			name: 'animationStagger',
			type: 'number',
			default: '0.06',
			description: "Time between each card's animation."
		},

		{
			name: 'easeType',
			type: 'string',
			default: '"elastic.out(1, 0.8)"',
			description: 'Easing function for the bounce.'
		},

		{
			name: 'transformStyles',
			type: 'string[]',
			default: '[...]',
			description: 'Custom transforms for each card position.'
		},

		{
			name: 'enableHover',
			type: 'boolean',
			default: 'false',
			description: 'Enable hover-to-spread behaviour.'
		}
	];

	$.head('1d9cg05', $$renderer, ($$renderer) => {
		$$renderer.title(($$renderer) => {
			$$renderer.push(`<title>Bounce Cards - svelte-bits</title>`);
		});
	});

	$$renderer.push(`<h1 class="sub-category">Bounce Cards</h1> `);

	{
		function preview($$renderer) {
			$$renderer.push(`<div class="demo-container" style="position:relative;height:500px;display:flex;align-items:center;justify-content:center;overflow:hidden;"><!---->`);

			{
				BounceCards($$renderer, {
					images,
					transformStyles,
					enableHover,
					animationDelay,
					animationStagger,
					containerWidth: 500,
					containerHeight: 250
				});
			}

			$$renderer.push(`<!----></div>`);
		}

		function code($$renderer) {
			DemoCodeTab($$renderer, { slug: 'bounce-cards', usage: usage(), source });
		}

		function customize($$renderer) {
			Customize($$renderer, {
				children: ($$renderer) => {
					PreviewSwitch($$renderer, {
						title: 'Enable Hover',
						checked: enableHover,
						onChange: (v) => {
							enableHover = v;
							key++;
						}
					});

					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Animation Delay',
						min: 0,
						max: 2,
						step: 0.1,
						value: animationDelay,
						onChange: (v) => {
							animationDelay = v;
							key++;
						}
					});

					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Animation Stagger',
						min: 0,
						max: 0.3,
						step: 0.01,
						value: animationStagger,
						onChange: (v) => {
							animationStagger = v;
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
			componentName: 'BounceCards',
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