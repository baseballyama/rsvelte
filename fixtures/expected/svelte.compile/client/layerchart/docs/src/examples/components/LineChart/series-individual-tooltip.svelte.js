import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

import {
	LineChart,
	Highlight,
	pivotLonger,
	Spline,
	Tooltip,
	defaultChartPadding
} from 'layerchart';

import { createDateSeries } from '$lib/utils/data.js';
import { group } from 'd3-array';
import { cls } from '@layerstack/tailwind';
import { format } from '@layerstack/utils';

var root = $.from_html(`<!> <!>`, 1);

export default function Series_individual_tooltip($$anchor, $$props) {
	$.push($$props, true);

	const keys = ['apples', 'bananas', 'oranges'];
	const data = createDateSeries({ count: 30, min: 10, max: 100, value: 'integer', keys });
	const flatData = pivotLonger(data, keys, 'fruit', 'value');
	const dataByFruit = group(flatData, (d) => d.fruit);
	var $$exports = { data: dataByFruit };

	{
		const marks = ($$anchor, $$arg0) => {
			let context = () => ($$arg0?.()).context;
			var fragment_1 = $.comment();
			var node = $.first_child(fragment_1);

			$.each(node, 17, () => context().series.visibleSeries, $.index, ($$anchor, s) => {
				const active = $.derived(() => (context().tooltip.data == null || $.get(s).key === context().tooltip.data?.fruit) && (context().series.highlightKey === null || $.get(s).key === context().series.highlightKey));

				{
					let $0 = $.derived(() => cls(!$.get(active) && 'opacity-20 saturate-0'));

					Spline($$anchor, {
						get data() {
							return data;
						},

						get y() {
							return $.get(s).key;
						},

						get stroke() {
							return $.get(s).color;
						},

						get class() {
							return $.get($0);
						}
					});
				}
			});

			$.append($$anchor, fragment_1);
		};

		const highlight = ($$anchor, $$arg0) => {
			let context = () => ($$arg0?.()).context;
			const activeSeriesColor = $.derived(() => context().series.series.find((s) => s.key === context().tooltip.data?.fruit)?.color);

			{
				let $0 = $.derived(() => ({ fill: $.get(activeSeriesColor) }));

				Highlight($$anchor, {
					lines: true,
					get points() {
						return $.get($0);
					}
				});
			}
		};

		const tooltip = ($$anchor, $$arg0) => {
			let context = () => ($$arg0?.()).context;
			const activeSeriesColor = $.derived(() => context().series.series.find((s) => s.key === context().tooltip.data?.fruit)?.color);
			var fragment_4 = $.comment();
			var node_1 = $.first_child(fragment_4);

			{
				const children = ($$anchor, $$arg0) => {
					let data = () => ($$arg0?.()).data;
					var fragment_5 = root();
					var node_2 = $.first_child(fragment_5);

					$.component(node_2, () => Tooltip.Header, ($$anchor, Tooltip_Header) => {
						Tooltip_Header($$anchor, {
							children: ($$anchor, $$slotProps) => {
								$.next();

								var text = $.text();

								$.template_effect(($0) => $.set_text(text, $0), [() => format(context().x(data()))]);
								$.append($$anchor, text);
							},
							$$slots: { default: true }
						});
					});

					var node_3 = $.sibling(node_2, 2);

					$.component(node_3, () => Tooltip.List, ($$anchor, Tooltip_List) => {
						Tooltip_List($$anchor, {
							children: ($$anchor, $$slotProps) => {
								var fragment_7 = $.comment();
								var node_4 = $.first_child(fragment_7);

								$.component(node_4, () => Tooltip.Item, ($$anchor, Tooltip_Item) => {
									Tooltip_Item($$anchor, {
										get label() {
											return data().fruit;
										},

										get value() {
											return data().value;
										},

										get color() {
											return $.get(activeSeriesColor);
										}
									});
								});

								$.append($$anchor, fragment_7);
							},
							$$slots: { default: true }
						});
					});

					$.append($$anchor, fragment_5);
				};

				$.component(node_1, () => Tooltip.Root, ($$anchor, Tooltip_Root) => {
					Tooltip_Root($$anchor, { children, $$slots: { default: true } });
				});
			}

			$.append($$anchor, fragment_4);
		};

		let $0 = $.derived(() => defaultChartPadding({ legend: true, right: 10 }));

		LineChart($$anchor, {
			get data() {
				return flatData;
			},
			x: 'date',
			y: 'value',
			series: [
				{ key: 'apples', color: 'var(--color-apples)' },
				{ key: 'bananas', color: 'var(--color-bananas)' },
				{ key: 'oranges', color: 'var(--color-oranges)' }
			],
			props: { tooltip: { context: { mode: 'quadtree' } } },
			brush: true,
			legend: true,
			get padding() {
				return $.get($0);
			},
			height: 300,
			marks,
			highlight,
			tooltip,
			$$slots: { marks: true, highlight: true, tooltip: true }
		});
	}

	return $.pop($$exports);
}