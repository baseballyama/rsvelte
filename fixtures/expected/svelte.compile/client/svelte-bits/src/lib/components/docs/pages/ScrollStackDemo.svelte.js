import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
import Customize from '$lib/components/docs/preview/Customize.svelte';
import PropTable from '$lib/components/docs/preview/PropTable.svelte';
import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
import PreviewSelect from '$lib/components/docs/preview/PreviewSelect.svelte';
import DemoCodeTab from '$lib/components/docs/preview/DemoCodeTab.svelte';
import ScrollStack from '$lib/components/library/Components/ScrollStack/ScrollStack.svelte';
import source from '$lib/components/library/Components/ScrollStack/ScrollStack.svelte?raw';

const card1 = ($$anchor) => {
	var h3 = root();

	$.append($$anchor, h3);
};

const card2 = ($$anchor) => {
	var h3_1 = root_1();

	$.append($$anchor, h3_1);
};

const card3 = ($$anchor) => {
	var h3_2 = root_2();

	$.append($$anchor, h3_2);
};

const card4 = ($$anchor) => {
	var h3_3 = root_3();

	$.append($$anchor, h3_3);
};

const card5 = ($$anchor) => {
	var h3_4 = root_4();

	$.append($$anchor, h3_4);
};

var root = $.from_html(`<h3>Text Animations</h3>`);
var root_1 = $.from_html(`<h3>Animations</h3>`);
var root_2 = $.from_html(`<h3>Components</h3>`);
var root_3 = $.from_html(`<h3>Backgrounds</h3>`);
var root_4 = $.from_html(`<h3>All on svelte-bits!</h3>`);
var root_5 = $.from_html(`<div class="demo-container" style="position:relative;height:400px;padding:0;overflow:hidden;"><button class="refresh-btn svelte-488nc9" aria-label="Refresh" type="button"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="svelte-488nc9"><polyline points="23 4 23 10 17 10"></polyline><polyline points="1 20 1 14 7 14"></polyline><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path></svg></button> <div style="text-align:center;color:#222222;font-size:clamp(2rem,4vw,3rem);font-weight:900;position:absolute;top:25%;left:50%;transform:translate(-50%,-50%);pointer-events:none;transition:all 0.3s ease;z-index:1;"> </div> <!></div>`);
var root_6 = $.from_html(`<!> <!> <!> <!> <!> <!>`, 1);
var root_7 = $.from_html(`<h1 class="sub-category">Scroll Stack</h1> <!>`, 1);

export default function ScrollStackDemo($$anchor) {
	const DEFAULTS = {
		itemDistance: 200,
		itemStackDistance: 30,
		baseScale: 0.85,
		rotationAmount: 0,
		blurAmount: 0,
		stackPosition: '20%'
	};

	let itemDistance = $.state($.proxy(DEFAULTS.itemDistance));
	let itemStackDistance = $.state($.proxy(DEFAULTS.itemStackDistance));
	let baseScale = $.state($.proxy(DEFAULTS.baseScale));
	let rotationAmount = $.state($.proxy(DEFAULTS.rotationAmount));
	let blurAmount = $.state($.proxy(DEFAULTS.blurAmount));
	let stackPosition = $.state($.proxy(DEFAULTS.stackPosition));
	let key = $.state(0);
	let isCompleted = $.state(false);
	const hasChanges = $.derived(() => $.get(itemDistance) !== DEFAULTS.itemDistance || $.get(itemStackDistance) !== DEFAULTS.itemStackDistance || $.get(baseScale) !== DEFAULTS.baseScale || $.get(rotationAmount) !== DEFAULTS.rotationAmount || $.get(blurAmount) !== DEFAULTS.blurAmount || $.get(stackPosition) !== DEFAULTS.stackPosition);

	function reset() {
		$.set(itemDistance, DEFAULTS.itemDistance, true);
		$.set(itemStackDistance, DEFAULTS.itemStackDistance, true);
		$.set(baseScale, DEFAULTS.baseScale, true);
		$.set(rotationAmount, DEFAULTS.rotationAmount, true);
		$.set(blurAmount, DEFAULTS.blurAmount, true);
		$.set(stackPosition, DEFAULTS.stackPosition, true);
		refresh();
	}

	function refresh() {
		$.update(key);
		$.set(isCompleted, false);
	}

	function bump(setter, v) {
		setter(v);
		refresh();
	}

	const usage = `<ScrollStack cards={[c1, c2, c3]} itemDistance={200} baseScale={0.85} stackPosition="20%" />`;

	const props = [
		{
			name: 'cards',
			type: 'Snippet[]',
			default: '-',
			description: 'Array of card content snippets.'
		},

		{
			name: 'itemDistance',
			type: 'number',
			default: '100',
			description: 'Distance between stacked items in px.'
		},

		{
			name: 'itemScale',
			type: 'number',
			default: '0.03',
			description: 'Scale increment per item.'
		},

		{
			name: 'itemStackDistance',
			type: 'number',
			default: '30',
			description: 'Distance when items start stacking.'
		},

		{
			name: 'stackPosition',
			type: 'string',
			default: '"20%"',
			description: 'Where stacking begins (% of viewport).'
		},

		{
			name: 'scaleEndPosition',
			type: 'string',
			default: '"10%"',
			description: 'Where scaling ends (% of viewport).'
		},

		{
			name: 'baseScale',
			type: 'number',
			default: '0.85',
			description: 'Base scale of first item.'
		},

		{
			name: 'rotationAmount',
			type: 'number',
			default: '0',
			description: 'Rotation per item in degrees.'
		},

		{
			name: 'blurAmount',
			type: 'number',
			default: '0',
			description: 'Blur for back items.'
		},

		{
			name: 'useWindowScroll',
			type: 'boolean',
			default: 'false',
			description: 'Use window scroll instead of container.'
		},

		{
			name: 'onStackComplete',
			type: '() => void',
			default: '-',
			description: 'Fires when stack completes.'
		}
	];

	const stackPositionOptions = [
		{ value: '10%', label: '10%' },
		{ value: '15%', label: '15%' },
		{ value: '20%', label: '20%' },
		{ value: '25%', label: '25%' },
		{ value: '30%', label: '30%' },
		{ value: '35%', label: '35%' }
	];

	var fragment = root_7();

	$.head('488nc9', ($$anchor) => {
		$.effect(() => {
			$.document.title = 'Scroll Stack - svelte-bits';
		});
	});

	var node = $.sibling($.first_child(fragment), 2);

	{
		const preview = ($$anchor) => {
			var div = root_5();
			var button = $.child(div);
			var div_1 = $.sibling(button, 2);
			var text = $.only_child(div_1, true);
			var node_1 = $.sibling(div_1, 2);

			$.key(node_1, () => $.get(key), ($$anchor) => {
				{
					let $0 = $.derived(() => [card1, card2, card3, card4, card5]);

					ScrollStack($$anchor, {
						get cards() {
							return $.get($0);
						},

						get itemDistance() {
							return $.get(itemDistance);
						},

						get itemStackDistance() {
							return $.get(itemStackDistance);
						},

						get stackPosition() {
							return $.get(stackPosition);
						},

						get baseScale() {
							return $.get(baseScale);
						},

						get rotationAmount() {
							return $.get(rotationAmount);
						},

						get blurAmount() {
							return $.get(blurAmount);
						},
						itemClass: 'scroll-stack-card-demo',
						onStackComplete: () => $.set(isCompleted, true)
					});
				}
			});

			$.reset(div);
			$.template_effect(() => $.set_text(text, $.get(isCompleted) ? 'Stack Completed!' : 'Scroll Down'));
			$.delegated('click', button, refresh);
			$.append($$anchor, div);
		};

		const code = ($$anchor) => {
			DemoCodeTab($$anchor, {
				slug: 'scroll-stack',
				usage,
				get source() {
					return source;
				}
			});
		};

		const customize = ($$anchor) => {
			Customize($$anchor, {
				children: ($$anchor, $$slotProps) => {
					var fragment_4 = root_6();
					var node_2 = $.first_child(fragment_4);

					PreviewSlider(node_2, {
						title: 'Item Distance',
						min: 0,
						max: 1000,
						step: 10,
						get value() {
							return $.get(itemDistance);
						},
						valueUnit: 'px',
						onChange: (v) => bump((x) => $.set(itemDistance, x, true), v)
					});

					var node_3 = $.sibling(node_2, 2);

					PreviewSlider(node_3, {
						title: 'Stack Distance',
						min: 0,
						max: 40,
						step: 5,
						get value() {
							return $.get(itemStackDistance);
						},
						valueUnit: 'px',
						onChange: (v) => bump((x) => $.set(itemStackDistance, x, true), v)
					});

					var node_4 = $.sibling(node_3, 2);

					PreviewSelect(node_4, {
						title: 'Stack Position',
						get options() {
							return stackPositionOptions;
						},

						get value() {
							return $.get(stackPosition);
						},
						onChange: (v) => bump((x) => $.set(stackPosition, x, true), v)
					});

					var node_5 = $.sibling(node_4, 2);

					PreviewSlider(node_5, {
						title: 'Base Scale',
						min: 0.5,
						max: 1.0,
						step: 0.05,
						get value() {
							return $.get(baseScale);
						},
						onChange: (v) => bump((x) => $.set(baseScale, x, true), v)
					});

					var node_6 = $.sibling(node_5, 2);

					PreviewSlider(node_6, {
						title: 'Rotation Amount',
						min: 0,
						max: 1,
						step: 0.1,
						get value() {
							return $.get(rotationAmount);
						},
						valueUnit: '°',
						onChange: (v) => bump((x) => $.set(rotationAmount, x, true), v)
					});

					var node_7 = $.sibling(node_6, 2);

					PreviewSlider(node_7, {
						title: 'Blur Amount',
						min: 0,
						max: 10,
						step: 0.5,
						get value() {
							return $.get(blurAmount);
						},
						valueUnit: 'px',
						onChange: (v) => bump((x) => $.set(blurAmount, x, true), v)
					});

					$.append($$anchor, fragment_4);
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

		TabsLayout(node, {
			onreset: reset,
			get hasChanges() {
				return $.get(hasChanges);
			},
			componentName: 'ScrollStack',
			usage,
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

	$.append($$anchor, fragment);
}

$.delegate(['click']);