import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Axis, Chart, Highlight, Layer, Spline, Tooltip } from 'layerchart';
import { createDateSeries } from '$lib/utils/data.js';

var root = $.from_html(`<!> <!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);
var root_2 = $.from_html(`<div class="flex justify-center p-2"><!></div>`);

export default function Vertical($$anchor, $$props) {
	$.push($$props, true);

	const data = createDateSeries({ count: 30, min: 50, max: 100, value: 'integer' });
	var $$exports = { data };
	var div = root_2();
	var node = $.child(div);

	Chart(node, {
		get data() {
			return data;
		},
		x: 'value',
		xNice: true,
		y: 'date',
		padding: 25,
		tooltipContext: { mode: 'quadtree-y' },
		height: 600,
		width: 400,
		children: ($$anchor, $$slotProps) => {
			var fragment = root_1();
			var node_1 = $.first_child(fragment);

			Layer(node_1, {
				children: ($$anchor, $$slotProps) => {
					var fragment_1 = root();
					var node_2 = $.first_child(fragment_1);

					Axis(node_2, { placement: 'left', grid: true, rule: true });

					var node_3 = $.sibling(node_2, 2);

					Axis(node_3, { placement: 'bottom', rule: true });

					var node_4 = $.sibling(node_3, 2);

					Spline(node_4, { class: 'stroke-2 stroke-primary' });

					var node_5 = $.sibling(node_4, 2);

					Highlight(node_5, { points: true, lines: true });
					$.append($$anchor, fragment_1);
				},
				$$slots: { default: true }
			});

			var node_6 = $.sibling(node_1, 2);

			{
				const children = ($$anchor, $$arg0) => {
					let data = () => ($$arg0?.()).data;
					var fragment_2 = root_1();
					var node_7 = $.first_child(fragment_2);

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
								var fragment_3 = $.comment();
								var node_9 = $.first_child(fragment_3);

								$.component(node_9, () => Tooltip.Item, ($$anchor, Tooltip_Item) => {
									Tooltip_Item($$anchor, {
										label: 'value',
										get value() {
											return data().value;
										}
									});
								});

								$.append($$anchor, fragment_3);
							},
							$$slots: { default: true }
						});
					});

					$.append($$anchor, fragment_2);
				};

				$.component(node_6, () => Tooltip.Root, ($$anchor, Tooltip_Root) => {
					Tooltip_Root($$anchor, { children, $$slots: { default: true } });
				});
			}

			$.append($$anchor, fragment);
		},
		$$slots: { default: true }
	});

	$.reset(div);
	$.append($$anchor, div);

	return $.pop($$exports);
}