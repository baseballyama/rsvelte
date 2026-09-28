import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

import {
	Area,
	Axis,
	Chart,
	Highlight,
	Layer,
	RectClipPath,
	Rule,
	Tooltip
} from 'layerchart';

import { createDateSeries } from '$lib/utils/data.js';

var root = $.from_html(`<!> <!> <!> <!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);

export default function Highlight_color_based_on_value_using_color_scale($$anchor, $$props) {
	$.push($$props, true);

	const data = createDateSeries({ count: 30, min: -20, max: 50, value: 'integer' });
	var $$exports = { data };

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

					Axis(node_2, { placement: 'bottom' });

					var node_3 = $.sibling(node_2, 2);

					Rule(node_3, { y: 0 });

					var node_4 = $.sibling(node_3, 2);

					{
						let $0 = $.derived(() => context().yScale(0));

						RectClipPath(node_4, {
							x: 0,
							y: 0,
							get width() {
								return context().width;
							},

							get height() {
								return $.get($0);
							},

							children: ($$anchor, $$slotProps) => {
								Area($$anchor, {
									y0: (d) => 0,
									line: { class: 'stroke-2 stroke-success' },
									class: 'fill-success/20'
								});
							},
							$$slots: { default: true }
						});
					}

					var node_5 = $.sibling(node_4, 2);

					{
						let $0 = $.derived(() => context().yScale(0));
						let $1 = $.derived(() => context().height - context().yScale(0));

						RectClipPath(node_5, {
							x: 0,
							get y() {
								return $.get($0);
							},

							get width() {
								return context().width;
							},

							get height() {
								return $.get($1);
							},

							children: ($$anchor, $$slotProps) => {
								Area($$anchor, {
									y0: (d) => 0,
									line: { class: 'stroke-2 stroke-danger' },
									class: 'fill-danger/20'
								});
							},
							$$slots: { default: true }
						});
					}

					var node_6 = $.sibling(node_5, 2);

					Highlight(node_6, { lines: true, points: true });
					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});

			var node_7 = $.sibling(node, 2);

			{
				const children = ($$anchor, $$arg0) => {
					let data = () => ($$arg0?.()).data;
					var fragment_5 = root_1();
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
										label: 'value',
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

		Chart($$anchor, {
			get data() {
				return data;
			},
			x: 'date',
			y: 'value',
			yNice: true,
			c: (d) => d.value < 0 ? 'under' : 'over',
			cDomain: ['over', 'under'],
			cRange: ['var(--color-success)', 'var(--color-danger)'],
			seriesLayout: 'overlap',
			tooltipContext: { mode: 'quadtree-x' },
			padding: 20,
			height: 300,
			children,
			$$slots: { default: true }
		});
	}

	return $.pop($$exports);
}