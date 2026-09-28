import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { scaleBand } from 'd3-scale';
import { range } from 'd3-array';
import { timeWeek, timeYear } from 'd3-time';
import { Highlight, ScatterChart, Tooltip } from 'layerchart';
import { createDateSeries } from '$lib/utils/data.js';

var root = $.from_html(`<!> <!>`, 1);

export default function Punchcard($$anchor, $$props) {
	$.push($$props, true);

	const data = createDateSeries({ count: 60, min: 10, max: 100, value: 'integer' });
	const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
	var $$exports = { data };

	{
		const highlight = ($$anchor) => {
			var fragment_1 = root();
			var node = $.first_child(fragment_1);

			Highlight(node, { area: true, axis: 'x' });

			var node_1 = $.sibling(node, 2);

			Highlight(node_1, { area: true, axis: 'y' });
			$.append($$anchor, fragment_1);
		};

		const tooltip = ($$anchor) => {
			var fragment_2 = $.comment();
			var node_2 = $.first_child(fragment_2);

			{
				const children = ($$anchor, $$arg0) => {
					let data = () => ($$arg0?.()).data;
					var fragment_3 = root();
					var node_3 = $.first_child(fragment_3);

					$.component(node_3, () => Tooltip.Header, ($$anchor, Tooltip_Header) => {
						Tooltip_Header($$anchor, {
							get value() {
								return data().date;
							},
							format: 'day'
						});
					});

					var node_4 = $.sibling(node_3, 2);

					$.component(node_4, () => Tooltip.List, ($$anchor, Tooltip_List) => {
						Tooltip_List($$anchor, {
							children: ($$anchor, $$slotProps) => {
								var fragment_4 = $.comment();
								var node_5 = $.first_child(fragment_4);

								$.component(node_5, () => Tooltip.Item, ($$anchor, Tooltip_Item) => {
									Tooltip_Item($$anchor, {
										label: 'value',
										get value() {
											return data().value;
										},
										valueAlign: 'right'
									});
								});

								$.append($$anchor, fragment_4);
							},
							$$slots: { default: true }
						});
					});

					$.append($$anchor, fragment_3);
				};

				$.component(node_2, () => Tooltip.Root, ($$anchor, Tooltip_Root) => {
					Tooltip_Root($$anchor, { children, $$slots: { default: true } });
				});
			}

			$.append($$anchor, fragment_2);
		};

		let $0 = $.derived(scaleBand);
		let $1 = $.derived(scaleBand);
		let $2 = $.derived(() => range(7));

		ScatterChart($$anchor, {
			get data() {
				return data;
			},
			x: (d) => timeWeek.count(timeYear(d.date), d.date),
			get xScale() {
				return $.get($0);
			},
			y: (d) => d.date.getDay(),
			get yScale() {
				return $.get($1);
			},

			get yDomain() {
				return $.get($2);
			},
			r: 'value',
			rRange: [0, 16],
			props: {
				xAxis: { format: (d) => 'Week ' + d },
				yAxis: { format: (d) => daysOfWeek[d] },
				rule: { x: true, y: false },
				grid: { x: false, y: true, bandAlign: 'between' },
				tooltip: { context: { mode: 'band' } }
			},
			padding: { left: 32, bottom: 16 },
			height: 300,
			highlight,
			tooltip,
			$$slots: { highlight: true, tooltip: true }
		});
	}

	return $.pop($$exports);
}