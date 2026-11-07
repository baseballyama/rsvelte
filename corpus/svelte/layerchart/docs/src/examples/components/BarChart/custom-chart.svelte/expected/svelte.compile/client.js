import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { BarChart, Tooltip, Layer, Axis, Bars, Highlight } from 'layerchart';
import { format } from '@layerstack/utils';
import { createDateSeries } from '$lib/utils/data.js';

var root = $.from_html(`<!> <!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);

export default function Custom_chart($$anchor, $$props) {
	$.push($$props, true);

	const data = createDateSeries({
		count: 10,
		min: 20,
		max: 100,
		value: 'integer',
		keys: ['value', 'baseline']
	});

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

					Axis(node_2, { placement: 'bottom', rule: true });

					var node_3 = $.sibling(node_2, 2);

					Bars(node_3, { radius: 4, strokeWidth: 1, class: 'fill-primary' });

					var node_4 = $.sibling(node_3, 2);

					Highlight(node_4, { area: true });
					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});

			var node_5 = $.sibling(node, 2);

			{
				const children = ($$anchor, $$arg0) => {
					let data = () => ($$arg0?.()).data;
					var fragment_3 = root_1();
					var node_6 = $.first_child(fragment_3);

					$.component(node_6, () => Tooltip.Header, ($$anchor, Tooltip_Header) => {
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

					var node_7 = $.sibling(node_6, 2);

					$.component(node_7, () => Tooltip.List, ($$anchor, Tooltip_List) => {
						Tooltip_List($$anchor, {
							children: ($$anchor, $$slotProps) => {
								var fragment_5 = $.comment();
								var node_8 = $.first_child(fragment_5);

								{
									let $0 = $.derived(() => context().y(data()));

									$.component(node_8, () => Tooltip.Item, ($$anchor, Tooltip_Item) => {
										Tooltip_Item($$anchor, {
											label: 'value',
											get value() {
												return $.get($0);
											}
										});
									});
								}

								$.append($$anchor, fragment_5);
							},
							$$slots: { default: true }
						});
					});

					$.append($$anchor, fragment_3);
				};

				$.component(node_5, () => Tooltip.Root, ($$anchor, Tooltip_Root) => {
					Tooltip_Root($$anchor, { children, $$slots: { default: true } });
				});
			}

			$.append($$anchor, fragment_1);
		};

		BarChart($$anchor, {
			get data() {
				return data;
			},
			x: 'date',
			y: 'value',
			height: 300,
			children,
			$$slots: { default: true }
		});
	}

	return $.pop($$exports);
}