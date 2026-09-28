import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

import {
	Area,
	AreaChart,
	Highlight,
	Tooltip,
	defaultChartPadding,
	pivotLonger
} from 'layerchart';

import { createDateSeries } from '$lib/utils/data.js';
import { group } from 'd3-array';
import { cls } from '@layerstack/tailwind';
import { format } from '@layerstack/utils';

var root = $.from_svg(`<g><!></g>`);
var root_1 = $.from_html(`<!> <!>`, 1);

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

			$.each(node, 17, () => context().series.series, $.index, ($$anchor, s) => {
				const activeSeries = $.derived(() => context().tooltip?.data == null || context().tooltip?.data?.fruit === $.get(s).key);
				var g = root();
				var node_1 = $.child(g);

				{
					let $0 = $.derived(() => ({ stroke: $.get(s).color }));

					Area(node_1, {
						get data() {
							return $.get(s).data;
						},

						get line() {
							return $.get($0);
						},

						get fill() {
							return $.get(s).color;
						},
						fillOpacity: 0.3
					});
				}

				$.reset(g);

				$.template_effect(($0) => $.set_class(g, 0, $0), [
					() => $.clsx(cls(!$.get(activeSeries) && 'opacity-20 saturate-0'))
				]);

				$.append($$anchor, g);
			});

			$.append($$anchor, fragment_1);
		};

		const highlight = ($$anchor, $$arg0) => {
			let context = () => ($$arg0?.()).context;
			const activeSeries = $.derived(() => context().series.series.find((s) => s.key === context().tooltip?.data?.fruit));

			{
				let $0 = $.derived(() => ({ fill: $.get(activeSeries)?.color }));

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
			const activeSeries = $.derived(() => context().series.series.find((s) => s.key === context().tooltip?.data?.fruit));
			var fragment_3 = $.comment();
			var node_2 = $.first_child(fragment_3);

			{
				const children = ($$anchor, $$arg0) => {
					let data = () => ($$arg0?.()).data;
					var fragment_4 = root_1();
					var node_3 = $.first_child(fragment_4);

					$.component(node_3, () => Tooltip.Header, ($$anchor, Tooltip_Header) => {
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

					var node_4 = $.sibling(node_3, 2);

					$.component(node_4, () => Tooltip.List, ($$anchor, Tooltip_List) => {
						Tooltip_List($$anchor, {
							children: ($$anchor, $$slotProps) => {
								var fragment_6 = $.comment();
								var node_5 = $.first_child(fragment_6);

								{
									let $0 = $.derived(() => data()?.fruit);
									let $1 = $.derived(() => data()?.value);
									let $2 = $.derived(() => $.get(activeSeries)?.color);

									$.component(node_5, () => Tooltip.Item, ($$anchor, Tooltip_Item) => {
										Tooltip_Item($$anchor, {
											get label() {
												return $.get($0);
											},

											get value() {
												return $.get($1);
											},

											get color() {
												return $.get($2);
											}
										});
									});
								}

								$.append($$anchor, fragment_6);
							},
							$$slots: { default: true }
						});
					});

					$.append($$anchor, fragment_4);
				};

				$.component(node_2, () => Tooltip.Root, ($$anchor, Tooltip_Root) => {
					Tooltip_Root($$anchor, { children, $$slots: { default: true } });
				});
			}

			$.append($$anchor, fragment_3);
		};

		let $0 = $.derived(() => [
			{
				key: 'apples',
				data: dataByFruit.get('apples'),
				color: 'var(--color-apples)'
			},

			{
				key: 'bananas',
				data: dataByFruit.get('bananas'),
				color: 'var(--color-bananas)'
			},

			{
				key: 'oranges',
				data: dataByFruit.get('oranges'),
				color: 'var(--color-oranges)'
			}
		]);

		let $1 = $.derived(() => defaultChartPadding({ right: 15 }));

		AreaChart($$anchor, {
			x: 'date',
			y: 'value',
			get series() {
				return $.get($0);
			},
			props: { tooltip: { context: { mode: 'quadtree' } } },
			get padding() {
				return $.get($1);
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