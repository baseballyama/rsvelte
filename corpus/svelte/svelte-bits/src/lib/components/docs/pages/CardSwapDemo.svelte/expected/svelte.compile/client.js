import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
import Customize from '$lib/components/docs/preview/Customize.svelte';
import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
import PreviewSwitch from '$lib/components/docs/preview/PreviewSwitch.svelte';
import PreviewSelect from '$lib/components/docs/preview/PreviewSelect.svelte';
import PropTable from '$lib/components/docs/preview/PropTable.svelte';
import DemoCodeTab from '$lib/components/docs/preview/DemoCodeTab.svelte';
import CardSwap from '$lib/components/library/Components/CardSwap/CardSwap.svelte';
import source from '$lib/components/library/Components/CardSwap/CardSwap.svelte?raw';

const headerStripe = ($$anchor, label = $.noop, glyph = $.noop) => {
	var div = root();
	var span = $.sibling($.child(div), 2);
	var text = $.only_child(span, true);
	var span_1 = $.sibling(span, 2);
	var text_1 = $.only_child(span_1, true);

	$.reset(div);

	$.template_effect(() => {
		$.set_text(text, glyph());
		$.set_text(text_1, label());
	});

	$.append($$anchor, div);
};

const card1 = ($$anchor) => {
	var fragment = root_1();
	var node = $.first_child(fragment);

	headerStripe(node, () => 'Smooth', () => '●');
	$.next(2);
	$.append($$anchor, fragment);
};

const card2 = ($$anchor) => {
	var fragment_1 = root_2();
	var node_1 = $.first_child(fragment_1);

	headerStripe(node_1, () => 'Reliable', () => '◇');
	$.next(2);
	$.append($$anchor, fragment_1);
};

const card3 = ($$anchor) => {
	var fragment_2 = root_3();
	var node_2 = $.first_child(fragment_2);

	headerStripe(node_2, () => 'Customizable', () => '⚙');
	$.next(2);
	$.append($$anchor, fragment_2);
};

var root = $.from_html(`<div style="border-bottom:1px solid #fff;background:linear-gradient(to top, #2A1F12, #060606);flex-shrink:0;color:white;padding:8px;display:flex;align-items:center;gap:6px;"><span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:white;"></span> <span> </span> <span> </span></div>`);
var root_1 = $.from_html(`<!> <div style="position:relative;flex:1;background:#2A1F12;"></div>`, 1);
var root_2 = $.from_html(`<!> <div style="position:relative;flex:1;background:#222222;"></div>`, 1);
var root_3 = $.from_html(`<!> <div style="position:relative;flex:1;background:#52341F;"></div>`, 1);
var root_4 = $.from_html(`<div class="demo-container" style="position:relative;height:500px;overflow:hidden;display:flex;"><div style="width:50%;display:flex;flex-direction:column;justify-content:center;padding:0 0 0 6rem;"><div style="font-size:2rem;font-weight:500;line-height:1.1;margin-bottom:1rem;">Card stacks have never<br/>looked so good</div> <div style="font-size:1.1rem;font-weight:400;line-height:1.1;color:#999;">Just look at it go!</div></div> <div style="width:50%;height:100%;position:relative;"><!></div></div>`);
var root_5 = $.from_html(`<!> <!> <!> <!> <!> <!>`, 1);
var root_6 = $.from_html(`<h1 class="sub-category">Card Swap</h1> <!>`, 1);

export default function CardSwapDemo($$anchor) {
	const DEFAULTS = {
		cardDistance: 60,
		verticalDistance: 70,
		delay: 5000,
		skewAmount: 6,
		easing: 'elastic',
		pauseOnHover: false
	};

	let cardDistance = $.state($.proxy(DEFAULTS.cardDistance));
	let verticalDistance = $.state($.proxy(DEFAULTS.verticalDistance));
	let delay = $.state($.proxy(DEFAULTS.delay));
	let skewAmount = $.state($.proxy(DEFAULTS.skewAmount));
	let easing = $.state($.proxy(DEFAULTS.easing));
	let pauseOnHover = $.state($.proxy(DEFAULTS.pauseOnHover));
	let key = $.state(0);
	const hasChanges = $.derived(() => $.get(cardDistance) !== DEFAULTS.cardDistance || $.get(verticalDistance) !== DEFAULTS.verticalDistance || $.get(delay) !== DEFAULTS.delay || $.get(skewAmount) !== DEFAULTS.skewAmount || $.get(easing) !== DEFAULTS.easing || $.get(pauseOnHover) !== DEFAULTS.pauseOnHover);

	function reset() {
		$.set(cardDistance, DEFAULTS.cardDistance, true);
		$.set(verticalDistance, DEFAULTS.verticalDistance, true);
		$.set(delay, DEFAULTS.delay, true);
		$.set(skewAmount, DEFAULTS.skewAmount, true);
		$.set(easing, DEFAULTS.easing, true);
		$.set(pauseOnHover, DEFAULTS.pauseOnHover, true);
		$.update(key);
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

	const usage = $.derived(() => `<CardSwap cards={cards} cardDistance={${$.get(cardDistance)}} verticalDistance={${$.get(verticalDistance)}} delay={${$.get(delay)}} skewAmount={${$.get(skewAmount)}} easing="${$.get(easing)}" pauseOnHover={${$.get(pauseOnHover)}} />`);

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

	var fragment_3 = root_6();

	$.head('1l4f1bf', ($$anchor) => {
		$.effect(() => {
			$.document.title = 'Card Swap - svelte-bits';
		});
	});

	var node_3 = $.sibling($.first_child(fragment_3), 2);

	{
		const preview = ($$anchor) => {
			var div_1 = root_4();
			var div_2 = $.sibling($.child(div_1), 2);
			var node_4 = $.child(div_2);

			$.key(node_4, () => $.get(key), ($$anchor) => {
				CardSwap($$anchor, {
					get cards() {
						return cards;
					},

					get cardDistance() {
						return $.get(cardDistance);
					},

					get verticalDistance() {
						return $.get(verticalDistance);
					},

					get delay() {
						return $.get(delay);
					},

					get skewAmount() {
						return $.get(skewAmount);
					},

					get easing() {
						return $.get(easing);
					},

					get pauseOnHover() {
						return $.get(pauseOnHover);
					}
				});
			});

			$.reset(div_2);
			$.reset(div_1);
			$.append($$anchor, div_1);
		};

		const code = ($$anchor) => {
			DemoCodeTab($$anchor, {
				slug: 'card-swap',
				get usage() {
					return $.get(usage);
				},

				get source() {
					return source;
				}
			});
		};

		const customize = ($$anchor) => {
			Customize($$anchor, {
				children: ($$anchor, $$slotProps) => {
					var fragment_7 = root_5();
					var node_5 = $.first_child(fragment_7);

					PreviewSlider(node_5, {
						title: 'Card Distance',
						min: 0,
						max: 150,
						step: 1,
						get value() {
							return $.get(cardDistance);
						},

						onChange: (v) => {
							$.set(cardDistance, v, true);
							$.update(key);
						}
					});

					var node_6 = $.sibling(node_5, 2);

					PreviewSlider(node_6, {
						title: 'Vertical Distance',
						min: 0,
						max: 150,
						step: 1,
						get value() {
							return $.get(verticalDistance);
						},

						onChange: (v) => {
							$.set(verticalDistance, v, true);
							$.update(key);
						}
					});

					var node_7 = $.sibling(node_6, 2);

					PreviewSlider(node_7, {
						title: 'Delay (ms)',
						min: 1000,
						max: 10000,
						step: 500,
						get value() {
							return $.get(delay);
						},

						onChange: (v) => {
							$.set(delay, v, true);
							$.update(key);
						}
					});

					var node_8 = $.sibling(node_7, 2);

					PreviewSlider(node_8, {
						title: 'Skew Amount',
						min: 0,
						max: 30,
						step: 1,
						get value() {
							return $.get(skewAmount);
						},

						onChange: (v) => {
							$.set(skewAmount, v, true);
							$.update(key);
						}
					});

					var node_9 = $.sibling(node_8, 2);

					PreviewSelect(node_9, {
						title: 'Easing',
						get value() {
							return $.get(easing);
						},

						options: [
							{ label: 'elastic', value: 'elastic' },
							{ label: 'linear', value: 'linear' }
						],

						onChange: (v) => {
							$.set(easing, v, true);
							$.update(key);
						}
					});

					var node_10 = $.sibling(node_9, 2);

					PreviewSwitch(node_10, {
						title: 'Pause on Hover',
						get checked() {
							return $.get(pauseOnHover);
						},

						onChange: (v) => {
							$.set(pauseOnHover, v, true);
							$.update(key);
						}
					});

					$.append($$anchor, fragment_7);
				},
				$$slots: { default: true }
			});
		};

		const propTable = ($$anchor) => {
			PropTable($$anchor, {
				get rows() {
					return props;
				}
			});
		};

		TabsLayout(node_3, {
			onreset: reset,
			get hasChanges() {
				return $.get(hasChanges);
			},
			componentName: 'CardSwap',
			get usage() {
				return $.get(usage);
			},

			get source() {
				return source;
			},

			get props() {
				return props;
			},
			preview,
			code,
			customize,
			propTable,
			$$slots: { preview: true, code: true, customize: true, propTable: true }
		});
	}

	$.append($$anchor, fragment_3);
}