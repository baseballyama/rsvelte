import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { ChartGroup, LineChart, Tooltip } from 'layerchart';
import { createDateSeries } from '$lib/utils/data.js';
import { rollup, sum } from 'd3-array';

var root = $.from_html(`<div class="grid gap-2"><div class="border rounded-sm p-2"><div class="text-sm text-surface-content/70">By region</div> <!></div> <div class="border rounded-sm p-2"><div class="text-sm text-surface-content/70 mb-4">Total</div> <!></div></div>`);

export default function Faceted_group($$anchor, $$props) {
	$.push($$props, true);

	const regions = ['North', 'South', 'West'];

	// One series per region, over the same days
	const data = regions.flatMap((region) => createDateSeries({
		count: 30,
		min: 100,
		max: 400,
		value: 'integer',
		keys: ['value']
	}).map((d) => ({ ...d, region })));

	const totals = Array.from(rollup(data, (rows) => sum(rows, (d) => d.value), (d) => +d.date), ([date, value]) => ({ date: new Date(date), value })).sort((a, b) => +a.date - +b.date);
	var $$exports = { data };

	ChartGroup($$anchor, {
		children: ($$anchor, $$slotProps) => {
			var div = root();
			var div_1 = $.child(div);
			var node = $.sibling($.child(div_1), 2);

			{
				const tooltip = ($$anchor, $$arg0) => {
					let context = () => ($$arg0?.()).context;
					var fragment_1 = $.comment();
					var node_1 = $.first_child(fragment_1);

					{
						const children = ($$anchor, $$arg0) => {
							let data = () => ($$arg0?.()).data;
							var fragment_2 = $.comment();
							var node_2 = $.first_child(fragment_2);

							$.component(node_2, () => Tooltip.List, ($$anchor, Tooltip_List) => {
								Tooltip_List($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_3 = $.comment();
										var node_3 = $.first_child(fragment_3);

										{
											let $0 = $.derived(() => context().cScale?.(context().c(data())));

											$.component(node_3, () => Tooltip.Item, ($$anchor, Tooltip_Item) => {
												Tooltip_Item($$anchor, {
													get label() {
														return data().region;
													},

													get value() {
														return data().value;
													},

													get color() {
														return $.get($0);
													},
													valueAlign: 'right'
												});
											});
										}

										$.append($$anchor, fragment_3);
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_2);
						};

						$.component(node_1, () => Tooltip.Root, ($$anchor, Tooltip_Root) => {
							Tooltip_Root($$anchor, { facetAll: true, children, $$slots: { default: true } });
						});
					}

					$.append($$anchor, fragment_1);
				};

				LineChart(node, {
					get data() {
						return data;
					},
					x: 'date',
					y: 'value',
					c: 'region',
					cRange: [
						'var(--color-info)',
						'var(--color-success)',
						'var(--color-warning)'
					],
					fx: 'region',
					highlight: { lines: true, points: true, facetAll: true },
					height: 140,
					padding: { left: 40, bottom: 20, top: 20 },
					tooltip,
					$$slots: { tooltip: true }
				});
			}

			$.reset(div_1);

			var div_2 = $.sibling(div_1, 2);
			var node_4 = $.sibling($.child(div_2), 2);

			LineChart(node_4, {
				get data() {
					return totals;
				},
				x: 'date',
				y: 'value',
				height: 120,
				padding: { left: 40, bottom: 20 }
			});

			$.reset(div_2);
			$.reset(div);
			$.append($$anchor, div);
		},
		$$slots: { default: true }
	});

	return $.pop($$exports);
}