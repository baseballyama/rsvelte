import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { scaleBand } from 'd3-scale';
import { format } from '@layerstack/utils';
import { Axis, Bars, Chart, Highlight, Layer, Rule, Tooltip } from 'layerchart';
import { createDateSeries } from '$lib/utils/data.js';

var root = $.from_html(`<!> <!> <!> <!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);

export default function Vertical_multiple_diverging($$anchor, $$props) {
	$.push($$props, true);

	const data = createDateSeries({ count: 20, min: 20, max: 100, keys: ['value', 'baseline'] });
	var $$exports = { data };

	{
		let $0 = $.derived(() => scaleBand().padding(0.4));

		Chart($$anchor, {
			get data() {
				return data;
			},
			x: 'date',
			get xScale() {
				return $.get($0);
			},
			y: ['value', (d) => -d.baseline],
			yNice: true,
			padding: { left: 24, bottom: 20, top: 8 },
			tooltipContext: { mode: 'bisect-x' },
			height: 300,
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root_1();
				var node = $.first_child(fragment_1);

				Layer(node, {
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = root();
						var node_1 = $.first_child(fragment_2);

						Axis(node_1, {
							placement: 'left',
							grid: true,
							rule: true,
							format: (d) => format(Math.abs(d), 'integer')
						});

						var node_2 = $.sibling(node_1, 2);

						Axis(node_2, { placement: 'bottom' });

						var node_3 = $.sibling(node_2, 2);

						Bars(node_3, {
							y: 'value',
							rounded: 'top',
							strokeWidth: 1,
							class: 'fill-primary'
						});

						var node_4 = $.sibling(node_3, 2);

						Bars(node_4, {
							y: (d) => -d.baseline,
							rounded: 'bottom',
							strokeWidth: 1,
							class: 'fill-secondary'
						});

						var node_5 = $.sibling(node_4, 2);

						Rule(node_5, { y: 0 });

						var node_6 = $.sibling(node_5, 2);

						Highlight(node_6, { area: true });
						$.append($$anchor, fragment_2);
					},
					$$slots: { default: true }
				});

				var node_7 = $.sibling(node, 2);

				{
					const children = ($$anchor, $$arg0) => {
						let data = () => ($$arg0?.()).data;
						var fragment_3 = root_1();
						var node_8 = $.first_child(fragment_3);

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
									var fragment_4 = root_1();
									var node_10 = $.first_child(fragment_4);

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

									$.append($$anchor, fragment_4);
								},
								$$slots: { default: true }
							});
						});

						$.append($$anchor, fragment_3);
					};

					$.component(node_7, () => Tooltip.Root, ($$anchor, Tooltip_Root) => {
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