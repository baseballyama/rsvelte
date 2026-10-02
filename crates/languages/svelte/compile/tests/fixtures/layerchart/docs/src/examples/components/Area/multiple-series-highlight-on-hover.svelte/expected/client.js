import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

import {
	Area,
	Axis,
	Chart,
	Circle,
	Highlight,
	Layer,
	Point,
	Text,
	Tooltip,
	defaultChartPadding,
	pivotLonger
} from 'layerchart';

import { flatGroup } from 'd3-array';
import { cls } from '@layerstack/tailwind';
import { createDateSeries } from '$lib/utils/data.js';

var root = $.from_svg(`<!><!>`, 1);
var root_1 = $.from_svg(`<g><!><!></g>`);
var root_2 = $.from_svg(`<!><!><!><!>`, 1);
var root_3 = $.from_html(`<!> <!>`, 1);

export default function Multiple_series_highlight_on_hover($$anchor, $$props) {
	$.push($$props, true);

	const keys = ['apples', 'bananas', 'oranges'];
	const multiSeriesData = createDateSeries({ count: 30, min: 10, max: 100, value: 'integer', keys });
	const multiSeriesFlatData = pivotLonger(multiSeriesData, keys, 'fruit', 'value');
	const dataByFruit = flatGroup(multiSeriesFlatData, (d) => d.fruit);

	const fruitColors = {
		apples: 'var(--color-apples)',
		bananas: 'var(--color-bananas)',
		oranges: 'var(--color-oranges)'
	};

	var $$exports = { data: multiSeriesFlatData };

	{
		const children = ($$anchor, $$arg0) => {
			let context = () => ($$arg0?.()).context;
			var fragment_1 = root_3();
			var node = $.first_child(fragment_1);

			Layer(node, {
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root_2();
					var node_1 = $.first_child(fragment_2);

					Axis(node_1, { placement: 'left', grid: true, rule: true });

					var node_2 = $.sibling(node_1);

					Axis(node_2, { placement: 'bottom', rule: true });

					var node_3 = $.sibling(node_2);

					$.each(node_3, 17, () => dataByFruit, $.index, ($$anchor, $$item) => {
						var $$array = $.derived(() => $.to_array($.get($$item), 2));
						let fruit = () => $.get($$array)[0];
						let data = () => $.get($$array)[1];
						const active = $.derived(() => context().tooltip.data == null || context().tooltip.data.fruit === fruit());
						const color = $.derived(() => context().cScale?.(fruit()));
						var g = root_1();
						var node_4 = $.child(g);

						{
							let $0 = $.derived(() => ({ class: 'stroke-2', stroke: $.get(color) }));

							Area(node_4, {
								get data() {
									return data();
								},

								get fill() {
									return $.get(color);
								},
								fillOpacity: 0.3,
								get line() {
									return $.get($0);
								}
							});
						}

						var node_5 = $.sibling(node_4);

						{
							const children = ($$anchor, $$arg0) => {
								let x = () => ($$arg0?.()).x;
								let y = () => ($$arg0?.()).y;
								var fragment_3 = root();
								var node_6 = $.first_child(fragment_3);

								Circle(node_6, {
									get cx() {
										return x();
									},

									get cy() {
										return y();
									},
									r: 4,
									get fill() {
										return $.get(color);
									}
								});

								var node_7 = $.sibling(node_6);

								Text(node_7, {
									get x() {
										return x();
									},

									get y() {
										return y();
									},

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

								$.append($$anchor, fragment_3);
							};

							Point(node_5, {
								get d() {
									return data()[data().length - 1];
								},
								children,
								$$slots: { default: true }
							});
						}

						$.reset(g);
						$.template_effect(($0) => $.set_class(g, 0, $0), [() => $.clsx(cls(!$.get(active) && 'opacity-20 saturate-0'))]);
						$.append($$anchor, g);
					});

					var node_8 = $.sibling(node_3);

					Highlight(node_8, { points: true, lines: true });
					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});

			var node_9 = $.sibling(node, 2);

			{
				const children = ($$anchor, $$arg0) => {
					let data = () => ($$arg0?.()).data;
					var fragment_4 = root_3();
					var node_10 = $.first_child(fragment_4);

					$.component(node_10, () => Tooltip.Header, ($$anchor, Tooltip_Header) => {
						Tooltip_Header($$anchor, {
							get value() {
								return data().date;
							},
							format: 'day'
						});
					});

					var node_11 = $.sibling(node_10, 2);

					$.component(node_11, () => Tooltip.List, ($$anchor, Tooltip_List) => {
						Tooltip_List($$anchor, {
							children: ($$anchor, $$slotProps) => {
								var fragment_5 = $.comment();
								var node_12 = $.first_child(fragment_5);

								$.component(node_12, () => Tooltip.Item, ($$anchor, Tooltip_Item) => {
									Tooltip_Item($$anchor, {
										get label() {
											return data().fruit;
										},

										get value() {
											return data().value;
										}
									});
								});

								$.append($$anchor, fragment_5);
							},
							$$slots: { default: true }
						});
					});

					$.append($$anchor, fragment_4);
				};

				$.component(node_9, () => Tooltip.Root, ($$anchor, Tooltip_Root) => {
					Tooltip_Root($$anchor, {
						get context() {
							return context();
						},
						children,
						$$slots: { default: true }
					});
				});
			}

			$.append($$anchor, fragment_1);
		};

		let $0 = $.derived(() => Object.keys(fruitColors));
		let $1 = $.derived(() => Object.values(fruitColors));
		let $2 = $.derived(() => defaultChartPadding({ top: 10, bottom: 20, left: 20, right: 60 }));

		Chart($$anchor, {
			get data() {
				return multiSeriesFlatData;
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

			get padding() {
				return $.get($2);
			},
			tooltipContext: { mode: 'quadtree' },
			height: 300,
			children,
			$$slots: { default: true }
		});
	}

	return $.pop($$exports);
}