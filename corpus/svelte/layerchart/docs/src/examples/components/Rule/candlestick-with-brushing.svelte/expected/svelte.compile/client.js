import 'svelte/internal/disclose-version';
import { getAppleTicker } from '$lib/data.remote.js';
import * as $ from 'svelte/internal/client';
import { scaleUtc } from 'd3-scale';
import { utcDay } from 'd3-time';
import { Axis, Bars, Chart, Highlight, Layer, Rule, Tooltip } from 'layerchart';

const data = await getAppleTicker();
var root = $.from_html(`<!> <!> <!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!> <!>`, 1);
var root_2 = $.from_html(`<!> <!>`, 1);

export default function Candlestick_with_brushing($$anchor, $$props) {
	$.push($$props, true);

	let xDomain = $.state($.proxy([null, null]));
	var $$exports = { data };
	var fragment = root_2();
	var node = $.first_child(fragment);

	{
		let $0 = $.derived(() => data.filter((d) => ($.get(xDomain)?.[0] == null || d.date >= $.get(xDomain)?.[0]) && ($.get(xDomain)?.[1] == null || d.date <= $.get(xDomain)?.[1])));
		let $1 = $.derived(scaleUtc);

		Chart(node, {
			get data() {
				return $.get($0);
			},
			x: 'date',
			get xScale() {
				return $.get($1);
			},

			get xDomain() {
				return $.get(xDomain);
			},
			y: ['high', 'low'],
			yNice: true,
			c: (d) => d.close < d.open ? 'desc' : 'asc',
			cDomain: ['desc', 'asc'],
			cRange: ['var(--color-danger)', 'var(--color-success)'],
			padding: { left: 20, bottom: 32, top: 20 },
			tooltipContext: { mode: 'quadtree-x' },
			height: 300,
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root_2();
				var node_1 = $.first_child(fragment_1);

				Layer(node_1, {
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = root();
						var node_2 = $.first_child(fragment_2);

						Axis(node_2, { placement: 'left', grid: true, rule: true, tickSpacing: 20 });

						var node_3 = $.sibling(node_2, 2);

						Axis(node_3, { placement: 'bottom', rule: true, tickMultiline: true });

						var node_4 = $.sibling(node_3, 2);

						Rule(node_4, { y: ['high', 'low'] });

						var node_5 = $.sibling(node_4, 2);

						Rule(node_5, { y: ['open', 'close'], strokeWidth: 3 });

						var node_6 = $.sibling(node_5, 2);

						Highlight(node_6, { lines: true });
						$.append($$anchor, fragment_2);
					},
					$$slots: { default: true }
				});

				var node_7 = $.sibling(node_1, 2);

				{
					const children = ($$anchor, $$arg0) => {
						let data = () => ($$arg0?.()).data;
						var fragment_3 = root_2();
						var node_8 = $.first_child(fragment_3);

						$.component(node_8, () => Tooltip.Header, ($$anchor, Tooltip_Header) => {
							Tooltip_Header($$anchor, {
								get value() {
									return data().date;
								},
								format: 'day'
							});
						});

						var node_9 = $.sibling(node_8, 2);

						$.component(node_9, () => Tooltip.List, ($$anchor, Tooltip_List) => {
							Tooltip_List($$anchor, {
								children: ($$anchor, $$slotProps) => {
									var fragment_4 = root_1();
									var node_10 = $.first_child(fragment_4);

									$.component(node_10, () => Tooltip.Item, ($$anchor, Tooltip_Item) => {
										Tooltip_Item($$anchor, {
											label: 'Open',
											get value() {
												return data().open;
											},
											format: 'decimal'
										});
									});

									var node_11 = $.sibling(node_10, 2);

									$.component(node_11, () => Tooltip.Item, ($$anchor, Tooltip_Item_1) => {
										Tooltip_Item_1($$anchor, {
											label: 'Close',
											get value() {
												return data().close;
											},
											format: 'decimal'
										});
									});

									var node_12 = $.sibling(node_11, 2);

									$.component(node_12, () => Tooltip.Item, ($$anchor, Tooltip_Item_2) => {
										Tooltip_Item_2($$anchor, {
											label: 'High',
											get value() {
												return data().high;
											},
											format: 'decimal'
										});
									});

									var node_13 = $.sibling(node_12, 2);

									$.component(node_13, () => Tooltip.Item, ($$anchor, Tooltip_Item_3) => {
										Tooltip_Item_3($$anchor, {
											label: 'Low',
											get value() {
												return data().low;
											},
											format: 'decimal'
										});
									});

									$.append($$anchor, fragment_4);
								},
								$$slots: { default: true }
							});
						});

						$.append($$anchor, fragment_3);
					};

					$.component(node_7, () => Tooltip.Root, ($$anchor, Tooltip_Root) => {
						Tooltip_Root($$anchor, { children, $$slots: { default: true } });
					});
				}

				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		});
	}

	var node_14 = $.sibling(node, 2);

	{
		let $0 = $.derived(scaleUtc);

		Chart(node_14, {
			get data() {
				return data;
			},
			x: 'date',
			get xScale() {
				return $.get($0);
			},

			get xInterval() {
				return utcDay;
			},
			y: 'volume',
			yNice: true,
			height: 40,
			brush: {
				onChange: (e) => {
					$.set(xDomain, e.brush.x, true);
				}
			},

			children: ($$anchor, $$slotProps) => {
				Layer($$anchor, {
					children: ($$anchor, $$slotProps) => {
						Bars($$anchor, { insets: { x: 0.5 } });
					},
					$$slots: { default: true }
				});
			},
			$$slots: { default: true }
		});
	}

	$.append($$anchor, fragment);

	return $.pop($$exports);
}