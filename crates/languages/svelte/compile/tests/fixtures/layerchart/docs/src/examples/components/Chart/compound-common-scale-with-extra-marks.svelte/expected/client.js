import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Area, BarChart, Tooltip } from 'layerchart';
import { createDateSeries } from '$lib/utils/data.js';

export const layers = ['svg', 'canvas'];

var root = $.from_html(`<!> <!>`, 1);

export default function Compound_common_scale_with_extra_marks($$anchor, $$props) {
	$.push($$props, true);

	const data = createDateSeries({
		count: 30,
		min: 20,
		max: 100,
		value: 'integer',
		keys: ['value', 'baseline']
	});

	var $$exports = { data };

	{
		const aboveMarks = ($$anchor) => {
			Area($$anchor, {
				y1: 'value',
				class: 'fill-secondary/20',
				line: { class: 'stroke-secondary' }
			});
		};

		const tooltip = ($$anchor) => {
			var fragment_2 = $.comment();
			var node = $.first_child(fragment_2);

			{
				const children = ($$anchor, $$arg0) => {
					let data = () => ($$arg0?.()).data;
					var fragment_3 = root();
					var node_1 = $.first_child(fragment_3);

					$.component(node_1, () => Tooltip.Header, ($$anchor, Tooltip_Header) => {
						Tooltip_Header($$anchor, {
							get value() {
								return data().date;
							},
							format: 'day'
						});
					});

					var node_2 = $.sibling(node_1, 2);

					$.component(node_2, () => Tooltip.List, ($$anchor, Tooltip_List) => {
						Tooltip_List($$anchor, {
							children: ($$anchor, $$slotProps) => {
								var fragment_4 = root();
								var node_3 = $.first_child(fragment_4);

								$.component(node_3, () => Tooltip.Item, ($$anchor, Tooltip_Item) => {
									Tooltip_Item($$anchor, {
										label: 'baseline',
										get value() {
											return data().baseline;
										},
										color: 'var(--color-primary)'
									});
								});

								var node_4 = $.sibling(node_3, 2);

								$.component(node_4, () => Tooltip.Item, ($$anchor, Tooltip_Item_1) => {
									Tooltip_Item_1($$anchor, {
										label: 'value',
										get value() {
											return data().value;
										},
										color: 'var(--color-secondary)'
									});
								});

								$.append($$anchor, fragment_4);
							},
							$$slots: { default: true }
						});
					});

					$.append($$anchor, fragment_3);
				};

				$.component(node, () => Tooltip.Root, ($$anchor, Tooltip_Root) => {
					Tooltip_Root($$anchor, { children, $$slots: { default: true } });
				});
			}

			$.append($$anchor, fragment_2);
		};

		BarChart($$anchor, {
			get data() {
				return data;
			},
			x: 'date',
			y: ['baseline', 'value'],
			props: { bars: { y: 'baseline' } },
			height: 300,
			aboveMarks,
			tooltip,
			$$slots: { aboveMarks: true, tooltip: true }
		});
	}

	return $.pop($$exports);
}