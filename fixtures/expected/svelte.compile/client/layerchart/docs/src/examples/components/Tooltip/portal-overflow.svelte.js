import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Field, Switch } from 'svelte-ux';

import {
	Area,
	Axis,
	Chart,
	Layer,
	Highlight,
	Tooltip,
	defaultChartPadding
} from 'layerchart';

import { createDateSeries } from '$lib/utils/data.js';

var root = $.from_html(`<!> <!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);
var root_2 = $.from_html(`<div class="flex gap-2 mb-4 screenshot-hidden"><!></div> <div class="overflow-hidden rounded border p-2"><!></div>`, 1);

export default function Portal_overflow($$anchor, $$props) {
	$.push($$props, true);

	const data = createDateSeries({
		count: 30,
		min: 20,
		max: 100,
		value: 'integer',
		keys: ['value']
	});

	let portal = $.state(true);
	var $$exports = { data };
	var fragment = root_2();
	var div = $.first_child(fragment);
	var node = $.child(div);

	Field(node, {
		label: 'Portal',
		children: ($$anchor, $$slotProps) => {
			Switch($$anchor, {
				get checked() {
					return $.get(portal);
				},

				set checked($$value) {
					$.set(portal, $$value, true);
				}
			});
		},
		$$slots: { default: true }
	});

	$.reset(div);

	var div_1 = $.sibling(div, 2);

	$.set_style(div_1, '', {}, { height: '200px' });

	var node_1 = $.child(div_1);

	{
		let $0 = $.derived(() => defaultChartPadding({ top: 5, left: 28, bottom: 24, right: 15 }));

		Chart(node_1, {
			get data() {
				return data;
			},
			x: 'date',
			y: 'value',
			yDomain: [0, null],
			yNice: true,
			get padding() {
				return $.get($0);
			},
			tooltipContext: { mode: 'quadtree-x' },
			children: ($$anchor, $$slotProps) => {
				var fragment_2 = root_1();
				var node_2 = $.first_child(fragment_2);

				Layer(node_2, {
					children: ($$anchor, $$slotProps) => {
						var fragment_3 = root();
						var node_3 = $.first_child(fragment_3);

						Axis(node_3, { placement: 'left', grid: true, rule: true });

						var node_4 = $.sibling(node_3, 2);

						Axis(node_4, { placement: 'bottom', rule: true });

						var node_5 = $.sibling(node_4, 2);

						Area(node_5, {
							class: 'fill-primary/30',
							line: { class: 'stroke-primary stroke-2' }
						});

						var node_6 = $.sibling(node_5, 2);

						Highlight(node_6, { points: true, lines: true });
						$.append($$anchor, fragment_3);
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
									return data().date;
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

									$.component(node_10, () => Tooltip.Item, ($$anchor, Tooltip_Item) => {
										Tooltip_Item($$anchor, {
											label: 'value',
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

					$.component(node_7, () => Tooltip.Root, ($$anchor, Tooltip_Root) => {
						Tooltip_Root($$anchor, {
							get portal() {
								return $.get(portal);
							},
							contained: false,
							children,
							$$slots: { default: true }
						});
					});
				}

				$.append($$anchor, fragment_2);
			},
			$$slots: { default: true }
		});
	}

	$.reset(div_1);
	$.append($$anchor, fragment);

	return $.pop($$exports);
}