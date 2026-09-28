import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { scaleBand } from 'd3-scale';
import { Axis, Bars, Chart, Highlight, Layer, Tooltip } from 'layerchart';
import { createDateSeries } from '$lib/utils/data.js';

var root = $.from_html(`<!> <!> <!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);
var root_2 = $.from_html(`<div class="h-[300px] p-4 border rounded-sm"><!></div>`);

export default function Vertical_multiple_overlapping($$anchor, $$props) {
	$.push($$props, true);

	const data = createDateSeries({ count: 20, min: 20, max: 80, keys: ['value', 'baseline'] });
	var $$exports = { data };
	var div = root_2();
	var node = $.child(div);

	{
		let $0 = $.derived(() => scaleBand().padding(0.4));

		Chart(node, {
			get data() {
				return data;
			},
			x: 'date',
			get xScale() {
				return $.get($0);
			},
			y: ['value', 'baseline'],
			yDomain: [0, null],
			yNice: true,
			padding: { left: 24, bottom: 20, top: 8 },
			tooltipContext: { mode: 'bisect-x' },
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

						Bars(node_4, {
							y: 'baseline',
							strokeWidth: 1,
							class: 'fill-surface-content/20'
						});

						var node_5 = $.sibling(node_4, 2);

						Bars(node_5, {
							y: 'value',
							strokeWidth: 1,
							insets: { x: 4 },
							class: 'fill-primary'
						});

						var node_6 = $.sibling(node_5, 2);

						Highlight(node_6, { area: true });
						$.append($$anchor, fragment_1);
					},
					$$slots: { default: true }
				});

				var node_7 = $.sibling(node_1, 2);

				{
					const children = ($$anchor, $$arg0) => {
						let data = () => ($$arg0?.()).data;
						var fragment_2 = root_1();
						var node_8 = $.first_child(fragment_2);

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
									var fragment_3 = root_1();
									var node_10 = $.first_child(fragment_3);

									$.component(node_10, () => Tooltip.Item, ($$anchor, Tooltip_Item) => {
										Tooltip_Item($$anchor, {
											label: 'value',
											get value() {
												return data().value;
											}
										});
									});

									var node_11 = $.sibling(node_10, 2);

									$.component(node_11, () => Tooltip.Item, ($$anchor, Tooltip_Item_1) => {
										Tooltip_Item_1($$anchor, {
											label: 'baseline',
											get value() {
												return data().baseline;
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

					$.component(node_7, () => Tooltip.Root, ($$anchor, Tooltip_Root) => {
						Tooltip_Root($$anchor, { children, $$slots: { default: true } });
					});
				}

				$.append($$anchor, fragment);
			},
			$$slots: { default: true }
		});
	}

	$.reset(div);
	$.append($$anchor, div);

	return $.pop($$exports);
}