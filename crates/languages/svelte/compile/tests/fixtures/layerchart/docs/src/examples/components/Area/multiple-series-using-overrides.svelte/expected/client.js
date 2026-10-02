import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Area, Axis, Chart, Highlight, Layer, Tooltip } from 'layerchart';
import { createDateSeries } from '$lib/utils/data.js';

var root = $.from_html(`<!> <!> <!> <!> <!> <!> <!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!>`, 1);
var root_2 = $.from_html(`<!> <!>`, 1);

export default function Multiple_series_using_overrides($$anchor, $$props) {
	$.push($$props, true);

	const keys = ['apples', 'bananas', 'oranges'];
	const multiSeriesData = createDateSeries({ count: 30, min: 10, max: 100, value: 'integer', keys });

	const fruitColors = {
		apples: 'var(--color-apples)',
		bananas: 'var(--color-bananas)',
		oranges: 'var(--color-oranges)'
	};

	var $$exports = { data: multiSeriesData };

	Chart($$anchor, {
		get data() {
			return multiSeriesData;
		},
		x: 'date',
		y: ['apples', 'bananas', 'oranges'],
		yDomain: [0, null],
		yNice: true,
		padding: { top: 20, left: 20, bottom: 20, right: 15 },
		tooltipContext: { mode: 'quadtree-x' },
		height: 300,
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_2();
			var node = $.first_child(fragment_1);

			Layer(node, {
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root();
					var node_1 = $.first_child(fragment_2);

					Axis(node_1, { placement: 'left', grid: true, rule: true });

					var node_2 = $.sibling(node_1, 2);

					Axis(node_2, { placement: 'bottom', rule: true });

					var node_3 = $.sibling(node_2, 2);

					{
						let $0 = $.derived(() => ({ stroke: fruitColors.apples, class: 'stroke-2' }));

						Area(node_3, {
							y1: (d) => d.apples,
							class: 'stroke-2',
							get fill() {
								return fruitColors.apples;
							},
							fillOpacity: 0.3,
							get line() {
								return $.get($0);
							}
						});
					}

					var node_4 = $.sibling(node_3, 2);

					{
						let $0 = $.derived(() => ({ stroke: fruitColors.bananas, class: 'stroke-2' }));

						Area(node_4, {
							y1: (d) => d.bananas,
							class: 'stroke-2',
							get fill() {
								return fruitColors.bananas;
							},
							fillOpacity: 0.3,
							get line() {
								return $.get($0);
							}
						});
					}

					var node_5 = $.sibling(node_4, 2);

					{
						let $0 = $.derived(() => ({ stroke: fruitColors.oranges, class: 'stroke-2' }));

						Area(node_5, {
							y1: (d) => d.oranges,
							class: 'stroke-2',
							get fill() {
								return fruitColors.oranges;
							},
							fillOpacity: 0.3,
							get line() {
								return $.get($0);
							}
						});
					}

					var node_6 = $.sibling(node_5, 2);

					{
						let $0 = $.derived(() => ({ fill: fruitColors.apples }));

						Highlight(node_6, {
							y: (d) => d.apples,
							get points() {
								return $.get($0);
							}
						});
					}

					var node_7 = $.sibling(node_6, 2);

					{
						let $0 = $.derived(() => ({ fill: fruitColors.bananas }));

						Highlight(node_7, {
							y: (d) => d.bananas,
							get points() {
								return $.get($0);
							}
						});
					}

					var node_8 = $.sibling(node_7, 2);

					{
						let $0 = $.derived(() => ({ fill: fruitColors.oranges }));

						Highlight(node_8, {
							y: (d) => d.oranges,
							get points() {
								return $.get($0);
							}
						});
					}

					var node_9 = $.sibling(node_8, 2);

					Highlight(node_9, { lines: true });
					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});

			var node_10 = $.sibling(node, 2);

			{
				const children = ($$anchor, $$arg0) => {
					let data = () => ($$arg0?.()).data;
					var fragment_3 = root_2();
					var node_11 = $.first_child(fragment_3);

					$.component(node_11, () => Tooltip.Header, ($$anchor, Tooltip_Header) => {
						Tooltip_Header($$anchor, {
							get value() {
								return data().date;
							},
							format: 'day'
						});
					});

					var node_12 = $.sibling(node_11, 2);

					$.component(node_12, () => Tooltip.List, ($$anchor, Tooltip_List) => {
						Tooltip_List($$anchor, {
							children: ($$anchor, $$slotProps) => {
								var fragment_4 = root_1();
								var node_13 = $.first_child(fragment_4);

								$.component(node_13, () => Tooltip.Item, ($$anchor, Tooltip_Item) => {
									Tooltip_Item($$anchor, {
										label: 'apples',
										get value() {
											return data().apples;
										}
									});
								});

								var node_14 = $.sibling(node_13, 2);

								$.component(node_14, () => Tooltip.Item, ($$anchor, Tooltip_Item_1) => {
									Tooltip_Item_1($$anchor, {
										label: 'bananas',
										get value() {
											return data().bananas;
										}
									});
								});

								var node_15 = $.sibling(node_14, 2);

								$.component(node_15, () => Tooltip.Item, ($$anchor, Tooltip_Item_2) => {
									Tooltip_Item_2($$anchor, {
										label: 'oranges',
										get value() {
											return data().oranges;
										}
									});
								});

								$.append($$anchor, fragment_4);
							},
							$$slots: { default: true }
						});
					});

					$.append($$anchor, fragment_3);
				};

				$.component(node_10, () => Tooltip.Root, ($$anchor, Tooltip_Root) => {
					Tooltip_Root($$anchor, { children, $$slots: { default: true } });
				});
			}

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	return $.pop($$exports);
}