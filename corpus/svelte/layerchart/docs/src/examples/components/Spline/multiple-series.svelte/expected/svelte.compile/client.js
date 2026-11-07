import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { flatGroup } from 'd3-array';

import {
	Axis,
	Chart,
	Circle,
	Highlight,
	Layer,
	Spline,
	Text,
	Tooltip,
	pivotLonger
} from 'layerchart';

import { createDateSeries } from '$lib/utils/data.js';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!> <!>`, 1);

export default function Multiple_series($$anchor, $$props) {
	$.push($$props, true);

	const keys = ['apples', 'bananas', 'oranges'];
	const multiSeriesData = createDateSeries({ count: 30, min: 10, max: 100, value: 'integer', keys });
	const data = pivotLonger(multiSeriesData, keys, 'fruit', 'value');
	const dataByFruit = flatGroup(data, (d) => d.fruit);

	const fruitColors = {
		apples: 'var(--color-apples)',
		bananas: 'var(--color-bananas)',
		oranges: 'var(--color-oranges)'
	};

	var $$exports = { data };

	{
		const children = ($$anchor, $$arg0) => {
			let context = () => ($$arg0?.()).context;
			var fragment_1 = root();
			var node = $.first_child(fragment_1);

			Layer(node, {
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root_1();
					var node_1 = $.first_child(fragment_2);

					Axis(node_1, { placement: 'left', grid: true, rule: true });

					var node_2 = $.sibling(node_1, 2);

					Axis(node_2, { placement: 'bottom', rule: true });

					var node_3 = $.sibling(node_2, 2);

					$.each(node_3, 17, () => dataByFruit, $.index, ($$anchor, $$item, $$index, $$array) => {
						var $$array_1 = $.derived(() => $.to_array($.get($$item), 2));
						let fruit = () => $.get($$array_1)[0];
						let data = () => $.get($$array_1)[1];
						const color = $.derived(() => context().cScale?.(fruit()));

						{
							const endContent = ($$anchor) => {
								var fragment_4 = root();
								var node_4 = $.first_child(fragment_4);

								Circle(node_4, {
									r: 4,
									get fill() {
										return $.get(color);
									}
								});

								var node_5 = $.sibling(node_4, 2);

								Text(node_5, {
									get value() {
										return fruit();
									},
									verticalAnchor: 'middle',
									dx: 6,
									dy: -2,
									class: 'text-xs',
									get fill() {
										return $.get(color);
									}
								});

								$.append($$anchor, fragment_4);
							};

							Spline($$anchor, {
								get data() {
									return data();
								},
								class: 'stroke-2',
								get stroke() {
									return $.get(color);
								},
								endContent,
								$$slots: { endContent: true }
							});
						}
					});

					var node_6 = $.sibling(node_3, 2);

					Highlight(node_6, { points: true, lines: true });
					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});

			var node_7 = $.sibling(node, 2);

			{
				const children = ($$anchor, $$arg0) => {
					let data = () => ($$arg0?.()).data;
					var fragment_5 = root();
					var node_8 = $.first_child(fragment_5);

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
								var fragment_6 = $.comment();
								var node_10 = $.first_child(fragment_6);

								$.component(node_10, () => Tooltip.Item, ($$anchor, Tooltip_Item) => {
									Tooltip_Item($$anchor, {
										get label() {
											return data().fruit;
										},

										get value() {
											return data().value;
										}
									});
								});

								$.append($$anchor, fragment_6);
							},
							$$slots: { default: true }
						});
					});

					$.append($$anchor, fragment_5);
				};

				$.component(node_7, () => Tooltip.Root, ($$anchor, Tooltip_Root) => {
					Tooltip_Root($$anchor, { children, $$slots: { default: true } });
				});
			}

			$.append($$anchor, fragment_1);
		};

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
			padding: { top: 25, left: 25, bottom: 25, right: 48 },
			tooltipContext: { mode: 'quadtree' },
			height: 300,
			children,
			$$slots: { default: true }
		});
	}

	return $.pop($$exports);
}