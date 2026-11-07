import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { stack } from 'd3-shape';

import {
	Area,
	asAny,
	Axis,
	Chart,
	Layer,
	Highlight,
	Tooltip,
	defaultChartPadding
} from 'layerchart';

import { flatten } from '@layerstack/utils';
import { createDateSeries } from '$lib/utils/data.js';
import TooltipContextControls from '$lib/components/controls/TooltipContextControls.svelte';

var root = $.from_html(`<!> <!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);

export default function Stacked_area($$anchor, $$props) {
	$.push($$props, true);

	const keys = ['apples', 'bananas', 'oranges'];
	const stackDateSeries = createDateSeries({ count: 30, min: 50, max: 100, value: 'integer', keys });
	const data = stack().keys(keys)(stackDateSeries);

	let settings = $.state($.proxy({
		mode: 'quadtree-x',
		highlight: ['points', 'lines'],
		axis: undefined,
		snapToDataX: false,
		snapToDataY: false
	}));

	var $$exports = { data };
	var fragment = root_1();
	var node = $.first_child(fragment);

	TooltipContextControls(node, {
		get settings() {
			return $.get(settings);
		},

		set settings($$value) {
			$.set(settings, $$value, true);
		}
	});

	var node_1 = $.sibling(node, 2);

	{
		const children = ($$anchor, $$arg0) => {
			let context = () => ($$arg0?.()).context;
			var fragment_1 = root_1();
			var node_2 = $.first_child(fragment_1);

			Layer(node_2, {
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root();
					var node_3 = $.first_child(fragment_2);

					Axis(node_3, { placement: 'left', grid: true, rule: true });

					var node_4 = $.sibling(node_3, 2);

					Axis(node_4, { placement: 'bottom', rule: true });

					var node_5 = $.sibling(node_4, 2);

					$.each(node_5, 17, () => data, $.index, ($$anchor, seriesData) => {
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

					var node_6 = $.sibling(node_5, 2);

					{
						let $0 = $.derived(() => $.get(settings).highlight.includes('points'));
						let $1 = $.derived(() => $.get(settings).highlight.includes('lines'));
						let $2 = $.derived(() => $.get(settings).highlight.includes('area'));

						Highlight(node_6, {
							get points() {
								return $.get($0);
							},

							get lines() {
								return $.get($1);
							},

							get area() {
								return $.get($2);
							},

							get axis() {
								return $.get(settings).axis;
							}
						});
					}

					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});

			var node_7 = $.sibling(node_2, 2);

			{
				const children = ($$anchor, $$arg0) => {
					let data = () => ($$arg0?.()).data;
					var fragment_4 = root_1();
					var node_8 = $.first_child(fragment_4);

					$.component(node_8, () => Tooltip.Header, ($$anchor, Tooltip_Header) => {
						Tooltip_Header($$anchor, {
							get value() {
								return data().data.date;
							},
							format: 'day'
						});
					});

					var node_9 = $.sibling(node_8, 2);

					$.component(node_9, () => Tooltip.List, ($$anchor, Tooltip_List) => {
						Tooltip_List($$anchor, {
							children: ($$anchor, $$slotProps) => {
								var fragment_5 = $.comment();
								var node_10 = $.first_child(fragment_5);

								$.each(node_10, 17, () => keys, $.index, ($$anchor, key) => {
									var fragment_6 = $.comment();
									var node_11 = $.first_child(fragment_6);

									$.component(node_11, () => Tooltip.Item, ($$anchor, Tooltip_Item) => {
										Tooltip_Item($$anchor, {
											get label() {
												return $.get(key);
											},

											get value() {
												return data().data[$.get(key)];
											}
										});
									});

									$.append($$anchor, fragment_6);
								});

								$.append($$anchor, fragment_5);
							},
							$$slots: { default: true }
						});
					});

					$.append($$anchor, fragment_4);
				};

				let $0 = $.derived(() => $.get(settings).snapToDataX ? 'data' : 'pointer');
				let $1 = $.derived(() => $.get(settings).snapToDataY ? 'data' : 'pointer');

				$.component(node_7, () => Tooltip.Root, ($$anchor, Tooltip_Root) => {
					Tooltip_Root($$anchor, {
						get x() {
							return $.get($0);
						},

						get y() {
							return $.get($1);
						},
						children,
						$$slots: { default: true }
					});
				});
			}

			$.append($$anchor, fragment_1);
		};

		let $0 = $.derived(() => flatten(data));
		let $1 = $.derived(() => defaultChartPadding({ top: 5, left: 28, bottom: 24, right: 15 }));
		let $2 = $.derived(() => ({ mode: $.get(settings).mode }));

		Chart(node_1, {
			get data() {
				return data;
			},

			get flatData() {
				return $.get($0);
			},
			x: (d) => asAny(d).data.date,
			y: [0, 1],
			yNice: true,
			c: 'key',
			get cDomain() {
				return keys;
			},

			cRange: [
				'var(--color-apples)',
				'var(--color-bananas)',
				'var(--color-oranges)'
			],

			get padding() {
				return $.get($1);
			},

			get tooltipContext() {
				return $.get($2);
			},
			height: 300,
			children,
			$$slots: { default: true }
		});
	}

	$.append($$anchor, fragment);

	return $.pop($$exports);
}