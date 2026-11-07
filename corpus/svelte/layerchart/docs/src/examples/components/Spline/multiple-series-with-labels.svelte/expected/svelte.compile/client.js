import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

import {
	Axis,
	Chart,
	Highlight,
	Labels,
	Layer,
	Spline,
	Tooltip,
	pivotLonger
} from 'layerchart';

import { createDateSeries } from '$lib/utils/data.js';

var root = $.from_html(`<!> <!> <!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);

export default function Multiple_series_with_labels($$anchor, $$props) {
	$.push($$props, true);

	const keys = ['apples', 'bananas', 'oranges'];
	const multiSeriesData = createDateSeries({ count: 30, min: 10, max: 100, value: 'integer', keys });
	const data = pivotLonger(multiSeriesData, keys, 'fruit', 'value');

	const fruitColors = {
		apples: 'var(--color-apples)',
		bananas: 'var(--color-bananas)',
		oranges: 'var(--color-oranges)'
	};

	var $$exports = { data };

	{
		let $0 = $.derived(() => Object.keys(fruitColors));
		let $1 = $.derived(() => Object.values(fruitColors));

		Chart($$anchor, {
			get data() {
				return data;
			},
			x: 'date',
			y: 'value',
			yDomain: [0, null],
			yNice: true,
			c: 'fruit',
			get cDomain() {
				return $.get($0);
			},

			get cRange() {
				return $.get($1);
			},
			tooltipContext: { mode: 'quadtree' },
			padding: 25,
			height: 300,
			children: ($$anchor, $$slotProps) => {
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

						Spline(node_3, { stroke: 'fruit', class: 'stroke-2' });

						var node_4 = $.sibling(node_3, 2);

						Labels(node_4, { format: 'integer' });

						var node_5 = $.sibling(node_4, 2);

						Highlight(node_5, { points: true, lines: true });
						$.append($$anchor, fragment_2);
					},
					$$slots: { default: true }
				});

				var node_6 = $.sibling(node, 2);

				{
					const children = ($$anchor, $$arg0) => {
						let data = () => ($$arg0?.()).data;
						var fragment_3 = root_1();
						var node_7 = $.first_child(fragment_3);

						$.component(node_7, () => Tooltip.Header, ($$anchor, Tooltip_Header) => {
							Tooltip_Header($$anchor, {
								get value() {
									return data().date;
								},
								format: 'day'
							});
						});

						var node_8 = $.sibling(node_7, 2);

						$.component(node_8, () => Tooltip.List, ($$anchor, Tooltip_List) => {
							Tooltip_List($$anchor, {
								children: ($$anchor, $$slotProps) => {
									var fragment_4 = $.comment();
									var node_9 = $.first_child(fragment_4);

									$.component(node_9, () => Tooltip.Item, ($$anchor, Tooltip_Item) => {
										Tooltip_Item($$anchor, {
											get label() {
												return data().fruit;
											},

											get value() {
												return data().value;
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

					$.component(node_6, () => Tooltip.Root, ($$anchor, Tooltip_Root) => {
						Tooltip_Root($$anchor, { children, $$slots: { default: true } });
					});
				}

				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		});
	}

	return $.pop($$exports);
}