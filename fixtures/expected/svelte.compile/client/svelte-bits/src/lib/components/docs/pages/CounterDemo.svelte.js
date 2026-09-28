import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
import Customize from '$lib/components/docs/preview/Customize.svelte';
import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
import PreviewSwitch from '$lib/components/docs/preview/PreviewSwitch.svelte';
import PropTable from '$lib/components/docs/preview/PropTable.svelte';
import DemoCodeTab from '$lib/components/docs/preview/DemoCodeTab.svelte';
import Counter from '$lib/components/library/Components/Counter/Counter.svelte';
import source from '$lib/components/library/Components/Counter/Counter.svelte?raw';

var root = $.from_html(`<div class="demo-container" style="position:relative;height:500px;overflow:hidden;"><!> <div class="counter-controls svelte-h70fqo"><button type="button" class="counter-btn wide svelte-h70fqo">- 0.4</button> <button type="button" class="counter-btn svelte-h70fqo">-</button> <button type="button" class="counter-btn svelte-h70fqo">+</button> <button type="button" class="counter-btn wide svelte-h70fqo">+ 0.4</button></div></div>`);
var root_1 = $.from_html(`<!> <!> <!> <!>`, 1);
var root_2 = $.from_html(`<h1 class="sub-category">Counter</h1> <!>`, 1);

export default function CounterDemo($$anchor) {
	const DEFAULTS = { digitPlaceHolders: true, value: 1, fontSize: 80, gap: 10 };
	let digitPlaceHolders = $.state($.proxy(DEFAULTS.digitPlaceHolders));
	let value = $.state($.proxy(DEFAULTS.value));
	let fontSize = $.state($.proxy(DEFAULTS.fontSize));
	let gap = $.state($.proxy(DEFAULTS.gap));
	const roundToTenth = (n) => Math.round(n * 10) / 10;
	const hasChanges = $.derived(() => $.get(digitPlaceHolders) !== DEFAULTS.digitPlaceHolders || $.get(value) !== DEFAULTS.value || $.get(fontSize) !== DEFAULTS.fontSize || $.get(gap) !== DEFAULTS.gap);

	function reset() {
		$.set(digitPlaceHolders, DEFAULTS.digitPlaceHolders, true);
		$.set(value, DEFAULTS.value, true);
		$.set(fontSize, DEFAULTS.fontSize, true);
		$.set(gap, DEFAULTS.gap, true);
	}

	const usage = $.derived(() => `<Counter value={${$.get(digitPlaceHolders)
		? `parseFloat((${$.get(value)}).toFixed(1))`
		: $.get(value)}} ${$.get(digitPlaceHolders) ? `places={[100, 10, 1, '.', 0.1]} ` : ''}gradientFrom="#14110E" fontSize={${$.get(fontSize)}} padding={5} gap={${$.get(gap)}} borderRadius={10} horizontalPadding={15} textColor="white" fontWeight={900} />`);

	const props = [
		{
			name: 'value',
			type: 'number',
			default: '-',
			description: 'The numeric value to display in the counter.'
		},

		{
			name: 'fontSize',
			type: 'number',
			default: '100',
			description: 'The base font size used for the counter digits.'
		},

		{
			name: 'padding',
			type: 'number',
			default: '0',
			description: 'Additional padding added to the digit height.'
		},

		{
			name: 'places',
			type: 'number[]',
			default: '[100, 10, 1, ".", 0.1]',
			description: 'Defines which digit positions to display. Use "." for the decimal point. If omitted, place values will be detected automatically.'
		},

		{
			name: 'gap',
			type: 'number',
			default: '8',
			description: 'The gap (in pixels) between each digit.'
		},

		{
			name: 'borderRadius',
			type: 'number',
			default: '4',
			description: 'Border radius (in pixels) for the counter container.'
		},

		{
			name: 'horizontalPadding',
			type: 'number',
			default: '8',
			description: 'Horizontal padding (in pixels) for the counter container.'
		},

		{
			name: 'textColor',
			type: 'string',
			default: '"white"',
			description: 'Text color for the counter digits.'
		},

		{
			name: 'fontWeight',
			type: 'string | number',
			default: '"bold"',
			description: 'Font weight of the counter digits.'
		},

		{
			name: 'gradientHeight',
			type: 'number',
			default: '16',
			description: 'Height (in pixels) of the gradient overlays.'
		},

		{
			name: 'gradientFrom',
			type: 'string',
			default: '"black"',
			description: 'Starting color for the gradient overlays.'
		},

		{
			name: 'gradientTo',
			type: 'string',
			default: '"transparent"',
			description: 'Ending color for the gradient overlays.'
		}
	];

	var fragment = root_2();

	$.head('h70fqo', ($$anchor) => {
		$.effect(() => {
			$.document.title = 'Counter - svelte-bits';
		});
	});

	var node = $.sibling($.first_child(fragment), 2);

	{
		const preview = ($$anchor) => {
			var div = root();
			var node_1 = $.child(div);

			{
				var consequent = ($$anchor) => {
					{
						let $0 = $.derived(() => parseFloat($.get(value).toFixed(1)));

						Counter($$anchor, {
							get value() {
								return $.get($0);
							},
							places: [100, 10, 1, '.', 0.1],
							gradientFrom: '#14110E',
							get fontSize() {
								return $.get(fontSize);
							},
							padding: 5,
							get gap() {
								return $.get(gap);
							},
							borderRadius: 10,
							horizontalPadding: 15,
							textColor: 'white',
							fontWeight: 900
						});
					}
				};

				var alternate = ($$anchor) => {
					Counter($$anchor, {
						get value() {
							return $.get(value);
						},
						gradientFrom: '#14110E',
						get fontSize() {
							return $.get(fontSize);
						},
						padding: 5,
						get gap() {
							return $.get(gap);
						},
						borderRadius: 10,
						horizontalPadding: 15,
						textColor: 'white',
						fontWeight: 900
					});
				};

				$.if(node_1, ($$render) => {
					if ($.get(digitPlaceHolders)) $$render(consequent); else $$render(alternate, -1);
				});
			}

			var div_1 = $.sibling(node_1, 2);
			var button = $.child(div_1);
			var button_1 = $.sibling(button, 2);
			var button_2 = $.sibling(button_1, 2);
			var button_3 = $.sibling(button_2, 2);

			$.reset(div_1);
			$.reset(div);
			$.delegated('click', button, () => $.set(value, roundToTenth($.get(value) - 0.4), true));
			$.delegated('click', button_1, () => $.set(value, $.get(value) - 1));
			$.delegated('click', button_2, () => $.get(value) < 999 && $.set(value, $.get(value) + 1));
			$.delegated('click', button_3, () => $.get(value) < 999 && $.set(value, roundToTenth($.get(value) + 0.4), true));
			$.append($$anchor, div);
		};

		const code = ($$anchor) => {
			DemoCodeTab($$anchor, {
				slug: 'counter',
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
					var fragment_5 = root_1();
					var node_2 = $.first_child(fragment_5);

					PreviewSwitch(node_2, {
						title: 'Digit Place Holders',
						get checked() {
							return $.get(digitPlaceHolders);
						},
						onChange: (v) => $.set(digitPlaceHolders, v, true)
					});

					var node_3 = $.sibling(node_2, 2);

					PreviewSlider(node_3, {
						title: 'Value',
						min: 0,
						max: 999,
						step: 1,
						get value() {
							return $.get(value);
						},
						onChange: (v) => $.set(value, v, true)
					});

					var node_4 = $.sibling(node_3, 2);

					PreviewSlider(node_4, {
						title: 'Gap',
						min: 0,
						max: 50,
						step: 10,
						get value() {
							return $.get(gap);
						},
						onChange: (v) => $.set(gap, v, true)
					});

					var node_5 = $.sibling(node_4, 2);

					PreviewSlider(node_5, {
						title: 'Font Size',
						min: 40,
						max: 200,
						step: 10,
						get value() {
							return $.get(fontSize);
						},
						onChange: (v) => $.set(fontSize, v, true)
					});

					$.append($$anchor, fragment_5);
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
			componentName: 'Counter',
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

	$.append($$anchor, fragment);
}

$.delegate(['click']);