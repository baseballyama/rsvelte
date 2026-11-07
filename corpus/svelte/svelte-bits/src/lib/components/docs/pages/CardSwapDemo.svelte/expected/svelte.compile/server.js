import * as $ from 'svelte/internal/server';
import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
import Customize from '$lib/components/docs/preview/Customize.svelte';
import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
import PreviewSwitch from '$lib/components/docs/preview/PreviewSwitch.svelte';
import PreviewSelect from '$lib/components/docs/preview/PreviewSelect.svelte';
import PropTable from '$lib/components/docs/preview/PropTable.svelte';
import DemoCodeTab from '$lib/components/docs/preview/DemoCodeTab.svelte';
import CardSwap from '$lib/components/library/Components/CardSwap/CardSwap.svelte';
import source from '$lib/components/library/Components/CardSwap/CardSwap.svelte?raw';

function headerStripe($$renderer, label, glyph) {
	$$renderer.push(`<div style="border-bottom:1px solid #fff;background:linear-gradient(to top, #2A1F12, #060606);flex-shrink:0;color:white;padding:8px;display:flex;align-items:center;gap:6px;"><span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:white;"></span> <span>${$.escape(glyph)}</span> <span>${$.escape(label)}</span></div>`);
}

function card1($$renderer) {
	headerStripe($$renderer, 'Smooth', '●');
	$$renderer.push(`<!----> <div style="position:relative;flex:1;background:#2A1F12;"></div>`);
}

function card2($$renderer) {
	headerStripe($$renderer, 'Reliable', '◇');
	$$renderer.push(`<!----> <div style="position:relative;flex:1;background:#222222;"></div>`);
}

function card3($$renderer) {
	headerStripe($$renderer, 'Customizable', '⚙');
	$$renderer.push(`<!----> <div style="position:relative;flex:1;background:#52341F;"></div>`);
}

export default function CardSwapDemo($$renderer) {
	const DEFAULTS = {
		cardDistance: 60,
		verticalDistance: 70,
		delay: 5000,
		skewAmount: 6,
		easing: 'elastic',
		pauseOnHover: false
	};

	let cardDistance = DEFAULTS.cardDistance;
	let verticalDistance = DEFAULTS.verticalDistance;
	let delay = DEFAULTS.delay;
	let skewAmount = DEFAULTS.skewAmount;
	let easing = DEFAULTS.easing;
	let pauseOnHover = DEFAULTS.pauseOnHover;
	let key = 0;
	const hasChanges = $.derived(() => cardDistance !== DEFAULTS.cardDistance || verticalDistance !== DEFAULTS.verticalDistance || delay !== DEFAULTS.delay || skewAmount !== DEFAULTS.skewAmount || easing !== DEFAULTS.easing || pauseOnHover !== DEFAULTS.pauseOnHover);

	function reset() {
		cardDistance = DEFAULTS.cardDistance;
		verticalDistance = DEFAULTS.verticalDistance;
		delay = DEFAULTS.delay;
		skewAmount = DEFAULTS.skewAmount;
		easing = DEFAULTS.easing;
		pauseOnHover = DEFAULTS.pauseOnHover;
		key++;
	}

	const cards = [
		{
			content: card1,
			style: 'display:flex;flex-direction:column;overflow:hidden;'
		},

		{
			content: card2,
			style: 'display:flex;flex-direction:column;overflow:hidden;'
		},

		{
			content: card3,
			style: 'display:flex;flex-direction:column;overflow:hidden;'
		}
	];

	const usage = $.derived(() => `<CardSwap cards={cards} cardDistance={${cardDistance}} verticalDistance={${verticalDistance}} delay={${delay}} skewAmount={${skewAmount}} easing="${easing}" pauseOnHover={${pauseOnHover}} />`);

	const props = [
		{
			name: 'cards',
			type: 'CardSwapItem[]',
			default: '-',
			description: 'Cards to display in the stack.'
		},

		{
			name: 'width',
			type: 'number | string',
			default: '500',
			description: 'Card container width.'
		},

		{
			name: 'height',
			type: 'number | string',
			default: '400',
			description: 'Card container height.'
		},

		{
			name: 'cardDistance',
			type: 'number',
			default: '60',
			description: 'X-axis spacing between cards.'
		},

		{
			name: 'verticalDistance',
			type: 'number',
			default: '70',
			description: 'Y-axis spacing between cards.'
		},

		{
			name: 'delay',
			type: 'number',
			default: '5000',
			description: 'Milliseconds between swaps.'
		},

		{
			name: 'pauseOnHover',
			type: 'boolean',
			default: 'false',
			description: 'Pause animation on hover.'
		},

		{
			name: 'onCardClick',
			type: '(idx: number) => void',
			default: '-',
			description: 'Callback when a card is clicked.'
		},

		{
			name: 'skewAmount',
			type: 'number',
			default: '6',
			description: 'Skew angle (deg) for top/bottom edges.'
		},

		{
			name: 'easing',
			type: '"linear" | "elastic"',
			default: '"elastic"',
			description: 'Animation easing type.'
		}
	];

	$.head('1l4f1bf', $$renderer, ($$renderer) => {
		$$renderer.title(($$renderer) => {
			$$renderer.push(`<title>Card Swap - svelte-bits</title>`);
		});
	});

	$$renderer.push(`<h1 class="sub-category">Card Swap</h1> `);

	{
		function preview($$renderer) {
			$$renderer.push(`<div class="demo-container" style="position:relative;height:500px;overflow:hidden;display:flex;"><div style="width:50%;display:flex;flex-direction:column;justify-content:center;padding:0 0 0 6rem;"><div style="font-size:2rem;font-weight:500;line-height:1.1;margin-bottom:1rem;">Card stacks have never<br/>looked so good</div> <div style="font-size:1.1rem;font-weight:400;line-height:1.1;color:#999;">Just look at it go!</div></div> <div style="width:50%;height:100%;position:relative;"><!---->`);

			{
				CardSwap($$renderer, {
					cards,
					cardDistance,
					verticalDistance,
					delay,
					skewAmount,
					easing,
					pauseOnHover
				});
			}

			$$renderer.push(`<!----></div></div>`);
		}

		function code($$renderer) {
			DemoCodeTab($$renderer, { slug: 'card-swap', usage: usage(), source });
		}

		function customize($$renderer) {
			Customize($$renderer, {
				children: ($$renderer) => {
					PreviewSlider($$renderer, {
						title: 'Card Distance',
						min: 0,
						max: 150,
						step: 1,
						value: cardDistance,
						onChange: (v) => {
							cardDistance = v;
							key++;
						}
					});

					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Vertical Distance',
						min: 0,
						max: 150,
						step: 1,
						value: verticalDistance,
						onChange: (v) => {
							verticalDistance = v;
							key++;
						}
					});

					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Delay (ms)',
						min: 1000,
						max: 10000,
						step: 500,
						value: delay,
						onChange: (v) => {
							delay = v;
							key++;
						}
					});

					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Skew Amount',
						min: 0,
						max: 30,
						step: 1,
						value: skewAmount,
						onChange: (v) => {
							skewAmount = v;
							key++;
						}
					});

					$$renderer.push(`<!----> `);

					PreviewSelect($$renderer, {
						title: 'Easing',
						value: easing,
						options: [
							{ label: 'elastic', value: 'elastic' },
							{ label: 'linear', value: 'linear' }
						],

						onChange: (v) => {
							easing = v;
							key++;
						}
					});

					$$renderer.push(`<!----> `);

					PreviewSwitch($$renderer, {
						title: 'Pause on Hover',
						checked: pauseOnHover,
						onChange: (v) => {
							pauseOnHover = v;
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
			componentName: 'CardSwap',
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