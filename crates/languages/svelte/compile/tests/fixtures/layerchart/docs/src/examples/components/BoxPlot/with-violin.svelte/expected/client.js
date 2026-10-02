import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { scaleBand } from 'd3-scale';
import { extent } from 'd3-array';

import {
	Axis,
	BoxPlot,
	Chart,
	Highlight,
	Layer,
	Tooltip,
	Violin,
	computeBoxStats
} from 'layerchart';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!> <!>`, 1);
var root_2 = $.from_html(`<!> <!> <!> <!> <!>`, 1);

export default function With_violin($$anchor, $$props) {
	$.push($$props, true);

	// Generate 5 distributions with different characteristics
	function generateSamples(count, mean, stddev) {
		const values = [];

		for (let i = 0; i < count; i++) {
			// Box-Muller transform for normal distribution
			const u1 = Math.random();

			const u2 = Math.random();
			const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);

			values.push(mean + z * stddev);
		}

		return values;
	}

	const distributions = [
		{ group: 'A', mean: 50, stddev: 12 },
		{ group: 'B', mean: 40, stddev: 8 },
		{ group: 'C', mean: 60, stddev: 15 },
		{ group: 'D', mean: 45, stddev: 10 },
		{ group: 'E', mean: 55, stddev: 18 }
	];

	const data = distributions.map((d) => {
		const values = generateSamples(200, d.mean, d.stddev);

		return { group: d.group, values, ...computeBoxStats(values) };
	});

	const yDomain = extent(data.flatMap((d) => d.values));
	var $$exports = { data };

	{
		let $0 = $.derived(() => scaleBand().padding(0.2));

		Chart($$anchor, {
			get data() {
				return data;
			},
			x: 'group',
			get xScale() {
				return $.get($0);
			},
			y: 'median',
			get yDomain() {
				return yDomain;
			},
			yNice: true,
			tooltipContext: { mode: 'band' },
			padding: { left: 30, bottom: 24, top: 8, right: 8 },
			height: 350,
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root();
				var node = $.first_child(fragment_1);

				Layer(node, {
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = root_1();
						var node_1 = $.first_child(fragment_2);

						Axis(node_1, { placement: 'left', grid: true, rule: true });

						var node_2 = $.sibling(node_1, 2);

						Axis(node_2, { placement: 'bottom', rule: true });

						var node_3 = $.sibling(node_2, 2);

						$.each(node_3, 17, () => data, $.index, ($$anchor, item) => {
							var fragment_3 = root();
							var node_4 = $.first_child(fragment_3);

							Violin(node_4, {
								get data() {
									return $.get(item);
								},
								values: 'values',
								fill: 'oklch(0.8 0.05 260)',
								fillOpacity: 0.25,
								stroke: 'oklch(0.7 0.08 260)',
								strokeWidth: 1
							});

							var node_5 = $.sibling(node_4, 2);

							BoxPlot(node_5, {
								get data() {
									return $.get(item);
								},
								min: 'min',
								q1: 'q1',
								median: 'median',
								q3: 'q3',
								max: 'max',
								outliers: 'outliers',
								width: 16,
								fill: 'white',
								fillOpacity: 0.4,
								stroke: 'oklch(0.4 0.1 260)',
								strokeWidth: 1.5,
								radius: 2,
								outlierRadius: 3
							});

							$.append($$anchor, fragment_3);
						});

						var node_6 = $.sibling(node_3, 2);

						Highlight(node_6, { area: true });
						$.append($$anchor, fragment_2);
					},
					$$slots: { default: true }
				});

				var node_7 = $.sibling(node, 2);

				{
					const children = ($$anchor, $$arg0) => {
						let data = () => ($$arg0?.()).data;
						var fragment_4 = root();
						var node_8 = $.first_child(fragment_4);

						{
							let $0 = $.derived(() => `Group ${data().group}`);

							$.component(node_8, () => Tooltip.Header, ($$anchor, Tooltip_Header) => {
								Tooltip_Header($$anchor, {
									get value() {
										return $.get($0);
									}
								});
							});
						}

						var node_9 = $.sibling(node_8, 2);

						$.component(node_9, () => Tooltip.List, ($$anchor, Tooltip_List) => {
							Tooltip_List($$anchor, {
								children: ($$anchor, $$slotProps) => {
									var fragment_5 = root_2();
									var node_10 = $.first_child(fragment_5);

									$.component(node_10, () => Tooltip.Item, ($$anchor, Tooltip_Item) => {
										Tooltip_Item($$anchor, {
											label: 'Max',
											get value() {
												return data().max;
											},
											format: 'decimal'
										});
									});

									var node_11 = $.sibling(node_10, 2);

									$.component(node_11, () => Tooltip.Item, ($$anchor, Tooltip_Item_1) => {
										Tooltip_Item_1($$anchor, {
											label: 'Q3',
											get value() {
												return data().q3;
											},
											format: 'decimal'
										});
									});

									var node_12 = $.sibling(node_11, 2);

									$.component(node_12, () => Tooltip.Item, ($$anchor, Tooltip_Item_2) => {
										Tooltip_Item_2($$anchor, {
											label: 'Median',
											get value() {
												return data().median;
											},
											format: 'decimal'
										});
									});

									var node_13 = $.sibling(node_12, 2);

									$.component(node_13, () => Tooltip.Item, ($$anchor, Tooltip_Item_3) => {
										Tooltip_Item_3($$anchor, {
											label: 'Q1',
											get value() {
												return data().q1;
											},
											format: 'decimal'
										});
									});

									var node_14 = $.sibling(node_13, 2);

									$.component(node_14, () => Tooltip.Item, ($$anchor, Tooltip_Item_4) => {
										Tooltip_Item_4($$anchor, {
											label: 'Min',
											get value() {
												return data().min;
											},
											format: 'decimal'
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