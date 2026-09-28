import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

import {
	Area,
	Axis,
	Chart,
	Highlight,
	Layer,
	Tooltip,
	asAny,
	defaultChartPadding
} from 'layerchart';

import { stack } from 'd3-shape';
import flatten from '$lib/utils/flatten.js';
import { createDateSeries } from '$lib/utils/data.js';

var root = $.from_html(`<!> <!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);

export default function Stack($$anchor, $$props) {
	$.push($$props, true);

	const keys = ['apples', 'bananas', 'oranges'];
	const multiSeriesData = createDateSeries({ count: 30, min: 10, max: 100, value: 'integer', keys });
	const stackData = stack().keys(keys)(multiSeriesData);

	const fruitColors = {
		apples: 'var(--color-apples)',
		bananas: 'var(--color-bananas)',
		oranges: 'var(--color-oranges)'
	};

	var $$exports = { data: stackData };

	{
		const children = ($$anchor, $$arg0) => {
			let context = () => ($$arg0?.()).context;
			var fragment_1 = root_1();
			var node = $.first_child(fragment_1);

			Layer(node, {
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root();
					var node_1 = $.first_child(fragment_2);

					Axis(node_1, { placement: 'left', grid: true, rule: true });

					var node_2 = $.sibling(node_1, 2);

					Axis(node_2, { placement: 'bottom', rule: true });

					var node_3 = $.sibling(node_2, 2);

					$.each(node_3, 17, () => stackData, $.index, ($$anchor, seriesData) => {
						const color = $.derived(() => context().cGet($.get(seriesData)));

						{
							let $0 = $.derived(() => ({ stroke: $.get(color), 'stroke-width': 2 }));

							Area($$anchor, {
								get data() {
									return $.get(seriesData);
								},

								get line() {
									return $.get($0);
								},

								get fill() {
									return $.get(color);
								},
								fillOpacity: 0.2
							});
						}
					});

					var node_4 = $.sibling(node_3, 2);

					Highlight(node_4, { points: true, lines: true });
					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});

			var node_5 = $.sibling(node, 2);

			{
				const children = ($$anchor, $$arg0) => {
					let data = () => ($$arg0?.()).data;
					var fragment_4 = root_1();
					var node_6 = $.first_child(fragment_4);

					$.component(node_6, () => Tooltip.Header, ($$anchor, Tooltip_Header) => {
						Tooltip_Header($$anchor, {
							get value() {
								return data().data.date;
							},
							format: 'day'
						});
					});

					var node_7 = $.sibling(node_6, 2);

					$.component(node_7, () => Tooltip.List, ($$anchor, Tooltip_List) => {
						Tooltip_List($$anchor, {
							children: ($$anchor, $$slotProps) => {
								var fragment_5 = $.comment();
								var node_8 = $.first_child(fragment_5);

								$.each(node_8, 17, () => keys, $.index, ($$anchor, key) => {
									var fragment_6 = $.comment();
									var node_9 = $.first_child(fragment_6);

									{
										let $0 = $.derived(() => context().cScale?.($.get(key)));

										$.component(node_9, () => Tooltip.Item, ($$anchor, Tooltip_Item) => {
											Tooltip_Item($$anchor, {
												get label() {
													return $.get(key);
												},

												get value() {
													return data().data[$.get(key)];
												},

												get color() {
													return $.get($0);
												}
											});
										});
									}

									$.append($$anchor, fragment_6);
								});

								$.append($$anchor, fragment_5);
							},
							$$slots: { default: true }
						});
					});

					$.append($$anchor, fragment_4);
				};

				$.component(node_5, () => Tooltip.Root, ($$anchor, Tooltip_Root) => {
					Tooltip_Root($$anchor, { children, $$slots: { default: true } });
				});
			}

			$.append($$anchor, fragment_1);
		};

		let $0 = $.derived(() => flatten(stackData));
		let $1 = $.derived(() => Object.keys(fruitColors));
		let $2 = $.derived(() => Object.values(fruitColors));
		let $3 = $.derived(() => defaultChartPadding({ left: 25, bottom: 20, right: 15 }));

		Chart($$anchor, {
			get data() {
				return stackData;
			},

			get flatData() {
				return $.get($0);
			},
			x: (d) => asAny(d).data.date,
			y: [0, 1],
			yNice: true,
			c: 'key',
			get cDomain() {
				return $.get($1);
			},

			get cRange() {
				return $.get($2);
			},
			tooltipContext: { mode: 'quadtree-x' },
			get padding() {
				return $.get($3);
			},
			height: 300,
			children,
			$$slots: { default: true }
		});
	}

	return $.pop($$exports);
}