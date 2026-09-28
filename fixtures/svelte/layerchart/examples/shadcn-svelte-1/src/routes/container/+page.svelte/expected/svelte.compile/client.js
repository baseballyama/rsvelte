import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

import {
	ArcChart,
	AreaChart,
	BarChart,
	LineChart,
	PieChart,
	ScatterChart
} from 'layerchart';

import * as Chart from '$lib/components/ui/chart/index.js';

var root = $.from_html(`<div class="grid grid-cols-2 gap-10"><!> <!> <!> <!> <!> <!></div>`);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	const data = [
		{ date: new Date('2025-01-01T00:00'), value: 30 },
		{ date: new Date('2025-02-01T00:00'), value: 50 },
		{ date: new Date('2025-03-01T00:00'), value: 40 },
		{ date: new Date('2025-04-01T00:00'), value: 70 },
		{ date: new Date('2025-05-01T00:00'), value: 60 },
		{ date: new Date('2025-06-01T00:00'), value: 90 }
	];

	const chartConfig = { default: { label: 'Value', color: 'var(--chart-1)' } };

	const pieData = [
		{ fruit: 'apples', value: 3840, color: 'var(--chart-1)' },
		{ fruit: 'bananas', value: 1920, color: 'var(--chart-2)' },
		{ fruit: 'cherries', value: 960, color: 'var(--chart-3)' },
		{ fruit: 'grapes', value: 400, color: 'var(--chart-4)' }
	];

	const pieChartConfig = {
		apples: { label: 'Apples', color: 'var(--chart-1)' },
		bananas: { label: 'Bananas', color: 'var(--chart-2)' },
		cherries: { label: 'Cherries', color: 'var(--chart-3)' },
		grapes: { label: 'Grapes', color: 'var(--chart-4)' }
	};

	const arcChartConfig = { example: { label: 'Example', color: 'var(--chart-2)' } };
	var div = root();
	var node = $.child(div);

	$.component(node, () => Chart.Container, ($$anchor, Chart_Container) => {
		Chart_Container($$anchor, {
			get config() {
				return chartConfig;
			},
			class: 'h-[200px] w-full',
			children: ($$anchor, $$slotProps) => {
				{
					const tooltip = ($$anchor) => {
						var fragment_1 = $.comment();
						var node_1 = $.first_child(fragment_1);

						$.component(node_1, () => Chart.Tooltip, ($$anchor, Chart_Tooltip) => {
							Chart_Tooltip($$anchor, { labelFormatter: (value) => value.toLocaleDateString() });
						});

						$.append($$anchor, fragment_1);
					};

					AreaChart($$anchor, {
						get data() {
							return data;
						},
						x: 'date',
						y: 'value',
						tooltip,
						$$slots: { tooltip: true }
					});
				}
			},
			$$slots: { default: true }
		});
	});

	var node_2 = $.sibling(node, 2);

	$.component(node_2, () => Chart.Container, ($$anchor, Chart_Container_1) => {
		Chart_Container_1($$anchor, {
			get config() {
				return chartConfig;
			},
			class: 'h-[200px] w-full',
			children: ($$anchor, $$slotProps) => {
				{
					const tooltip = ($$anchor) => {
						var fragment_3 = $.comment();
						var node_3 = $.first_child(fragment_3);

						$.component(node_3, () => Chart.Tooltip, ($$anchor, Chart_Tooltip_1) => {
							Chart_Tooltip_1($$anchor, { labelFormatter: (value) => value.toLocaleDateString() });
						});

						$.append($$anchor, fragment_3);
					};

					LineChart($$anchor, {
						get data() {
							return data;
						},
						x: 'date',
						y: 'value',
						tooltip,
						$$slots: { tooltip: true }
					});
				}
			},
			$$slots: { default: true }
		});
	});

	var node_4 = $.sibling(node_2, 2);

	$.component(node_4, () => Chart.Container, ($$anchor, Chart_Container_2) => {
		Chart_Container_2($$anchor, {
			get config() {
				return chartConfig;
			},
			class: 'h-[200px] w-full',
			children: ($$anchor, $$slotProps) => {
				{
					const tooltip = ($$anchor) => {
						var fragment_5 = $.comment();
						var node_5 = $.first_child(fragment_5);

						$.component(node_5, () => Chart.Tooltip, ($$anchor, Chart_Tooltip_2) => {
							Chart_Tooltip_2($$anchor, { labelFormatter: (value) => value.toLocaleDateString() });
						});

						$.append($$anchor, fragment_5);
					};

					BarChart($$anchor, {
						get data() {
							return data;
						},
						x: 'date',
						y: 'value',
						tooltip,
						$$slots: { tooltip: true }
					});
				}
			},
			$$slots: { default: true }
		});
	});

	var node_6 = $.sibling(node_4, 2);

	$.component(node_6, () => Chart.Container, ($$anchor, Chart_Container_3) => {
		Chart_Container_3($$anchor, {
			get config() {
				return chartConfig;
			},
			class: 'h-[200px] w-full',
			children: ($$anchor, $$slotProps) => {
				ScatterChart($$anchor, {
					get data() {
						return data;
					},
					x: 'date',
					y: 'value'
				});
			},
			$$slots: { default: true }
		});
	});

	var node_7 = $.sibling(node_6, 2);

	$.component(node_7, () => Chart.Container, ($$anchor, Chart_Container_4) => {
		Chart_Container_4($$anchor, {
			get config() {
				return pieChartConfig;
			},
			class: 'h-[200px] w-full',
			children: ($$anchor, $$slotProps) => {
				{
					const tooltip = ($$anchor) => {
						var fragment_8 = $.comment();
						var node_8 = $.first_child(fragment_8);

						$.component(node_8, () => Chart.Tooltip, ($$anchor, Chart_Tooltip_3) => {
							Chart_Tooltip_3($$anchor, { hideLabel: true });
						});

						$.append($$anchor, fragment_8);
					};

					let $0 = $.derived(() => Object.values(pieChartConfig).map((c) => c.color));

					PieChart($$anchor, {
						get data() {
							return pieData;
						},
						key: 'fruit',
						value: 'value',
						get cRange() {
							return $.get($0);
						},
						tooltip,
						$$slots: { tooltip: true }
					});
				}
			},
			$$slots: { default: true }
		});
	});

	var node_9 = $.sibling(node_7, 2);

	$.component(node_9, () => Chart.Container, ($$anchor, Chart_Container_5) => {
		Chart_Container_5($$anchor, {
			get config() {
				return arcChartConfig;
			},
			class: 'h-[200px] w-full',
			children: ($$anchor, $$slotProps) => {
				{
					const tooltip = ($$anchor) => {
						var fragment_10 = $.comment();
						var node_10 = $.first_child(fragment_10);

						$.component(node_10, () => Chart.Tooltip, ($$anchor, Chart_Tooltip_4) => {
							Chart_Tooltip_4($$anchor, { hideLabel: true });
						});

						$.append($$anchor, fragment_10);
					};

					ArcChart($$anchor, {
						data: [{ key: 'example', value: 70, color: 'var(--chart-2)' }],
						maxValue: 100,
						innerRadius: -20,
						cornerRadius: 10,
						tooltip,
						$$slots: { tooltip: true }
					});
				}
			},
			$$slots: { default: true }
		});
	});

	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}