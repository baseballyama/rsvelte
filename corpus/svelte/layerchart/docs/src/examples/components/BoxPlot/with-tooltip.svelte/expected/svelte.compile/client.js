import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { scaleBand } from 'd3-scale';

import {
	Axis,
	BoxPlot,
	Chart,
	Highlight,
	Layer,
	Tooltip,
	computeBoxStats
} from 'layerchart';

var root = $.from_html(`<!> <!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!> <!> <!> <!>`, 1);
var root_2 = $.from_html(`<!> <!>`, 1);

export default function With_tooltip($$anchor, $$props) {
	$.push($$props, true);

	const rawData = [
		{
			group: 'A',
			values: [
				2,
				7,
				8,
				12,
				15,
				18,
				21,
				25,
				27,
				30,
				32,
				35,
				38,
				40,
				42,
				45,
				50,
				55,
				60,
				85
			]
		},

		{
			group: 'B',
			values: [
				10,
				15,
				18,
				20,
				22,
				25,
				28,
				30,
				32,
				35,
				37,
				40,
				42,
				45,
				48,
				50,
				55,
				58,
				62,
				65
			]
		},

		{
			group: 'C',
			values: [
				5,
				8,
				10,
				12,
				15,
				18,
				20,
				22,
				25,
				28,
				30,
				33,
				35,
				38,
				40,
				42,
				45,
				48,
				70,
				75
			]
		},

		{
			group: 'D',
			values: [
				1,
				20,
				25,
				30,
				35,
				38,
				40,
				42,
				45,
				48,
				50,
				52,
				55,
				58,
				60,
				62,
				65,
				70,
				75,
				95
			]
		}
	];

	const data = rawData.map((d) => ({ group: d.group, ...computeBoxStats(d.values) }));
	var $$exports = { data };

	{
		let $0 = $.derived(() => scaleBand().padding(0.3));

		Chart($$anchor, {
			get data() {
				return data;
			},
			x: 'group',
			get xScale() {
				return $.get($0);
			},
			y: 'median',
			yDomain: [0, 100],
			yNice: true,
			tooltipContext: { mode: 'band' },
			padding: { left: 24, bottom: 20, top: 8 },
			height: 300,
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root_2();
				var node = $.first_child(fragment_1);

				Layer(node, {
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = root();
						var node_1 = $.first_child(fragment_2);

						Axis(node_1, { placement: 'left', grid: true, rule: true });

						var node_2 = $.sibling(node_1, 2);

						Axis(node_2, { placement: 'bottom', rule: true });

						var node_3 = $.sibling(node_2, 2);

						$.each(node_3, 17, () => data, $.index, ($$anchor, item) => {
							BoxPlot($$anchor, {
								get data() {
									return $.get(item);
								},
								min: 'min',
								q1: 'q1',
								median: 'median',
								q3: 'q3',
								max: 'max',
								outliers: 'outliers'
							});
						});

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
						var fragment_4 = root_2();
						var node_6 = $.first_child(fragment_4);

						$.component(node_6, () => Tooltip.Header, ($$anchor, Tooltip_Header) => {
							Tooltip_Header($$anchor, {
								get value() {
									return data().group;
								}
							});
						});

						var node_7 = $.sibling(node_6, 2);

						$.component(node_7, () => Tooltip.List, ($$anchor, Tooltip_List) => {
							Tooltip_List($$anchor, {
								children: ($$anchor, $$slotProps) => {
									var fragment_5 = root_1();
									var node_8 = $.first_child(fragment_5);

									$.component(node_8, () => Tooltip.Item, ($$anchor, Tooltip_Item) => {
										Tooltip_Item($$anchor, {
											label: 'Max',
											get value() {
												return data().max;
											}
										});
									});

									var node_9 = $.sibling(node_8, 2);

									$.component(node_9, () => Tooltip.Item, ($$anchor, Tooltip_Item_1) => {
										Tooltip_Item_1($$anchor, {
											label: 'Q3',
											get value() {
												return data().q3;
											}
										});
									});

									var node_10 = $.sibling(node_9, 2);

									$.component(node_10, () => Tooltip.Item, ($$anchor, Tooltip_Item_2) => {
										Tooltip_Item_2($$anchor, {
											label: 'Median',
											get value() {
												return data().median;
											}
										});
									});

									var node_11 = $.sibling(node_10, 2);

									$.component(node_11, () => Tooltip.Item, ($$anchor, Tooltip_Item_3) => {
										Tooltip_Item_3($$anchor, {
											label: 'Q1',
											get value() {
												return data().q1;
											}
										});
									});

									var node_12 = $.sibling(node_11, 2);

									$.component(node_12, () => Tooltip.Item, ($$anchor, Tooltip_Item_4) => {
										Tooltip_Item_4($$anchor, {
											label: 'Min',
											get value() {
												return data().min;
											}
										});
									});

									var node_13 = $.sibling(node_12, 2);

									{
										var consequent = ($$anchor) => {
											var fragment_6 = $.comment();
											var node_14 = $.first_child(fragment_6);

											{
												let $0 = $.derived(() => data().outliers.join(', '));

												$.component(node_14, () => Tooltip.Item, ($$anchor, Tooltip_Item_5) => {
													Tooltip_Item_5($$anchor, {
														label: 'Outliers',
														get value() {
															return $.get($0);
														}
													});
												});
											}

											$.append($$anchor, fragment_6);
										};

										$.if(node_13, ($$render) => {
											if (data().outliers?.length) $$render(consequent);
										});
									}

									$.append($$anchor, fragment_5);
								},
								$$slots: { default: true }
							});
						});

						$.append($$anchor, fragment_4);
					};

					$.component(node_5, () => Tooltip.Root, ($$anchor, Tooltip_Root) => {
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