import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { curveNatural } from "d3-shape";
import { LineChart } from "layerchart";
import * as Card from "$lib/registry/ui/card/index.js";
import * as Chart from "$lib/registry/ui/chart/index.js";

var root = $.from_html(`<!> <!>`, 1);

export default function Exercise_minutes($$anchor) {
	const data = [
		{ average: 400, today: 240, day: "Monday" },
		{ average: 300, today: 139, day: "Tuesday" },
		{ average: 200, today: 980, day: "Wednesday" },
		{ average: 278, today: 390, day: "Thursday" },
		{ average: 189, today: 480, day: "Friday" },
		{ average: 239, today: 380, day: "Saturday" },
		{ average: 349, today: 430, day: "Sunday" }
	];

	const chartConfig = {
		today: { label: "Today", color: "var(--primary)" },
		average: { label: "Average", color: "var(--primary)" }
	};

	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => Card.Root, ($$anchor, Card_Root) => {
		Card_Root($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root();
				var node_1 = $.first_child(fragment_1);

				$.component(node_1, () => Card.Header, ($$anchor, Card_Header) => {
					Card_Header($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_2 = root();
							var node_2 = $.first_child(fragment_2);

							$.component(node_2, () => Card.Title, ($$anchor, Card_Title) => {
								Card_Title($$anchor, {
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text = $.text('Exercise Minutes');

										$.append($$anchor, text);
									},
									$$slots: { default: true }
								});
							});

							var node_3 = $.sibling(node_2, 2);

							$.component(node_3, () => Card.Description, ($$anchor, Card_Description) => {
								Card_Description($$anchor, {
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_1 = $.text('Your exercise minutes are ahead of where you normally are.');

										$.append($$anchor, text_1);
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_2);
						},
						$$slots: { default: true }
					});
				});

				var node_4 = $.sibling(node_1, 2);

				$.component(node_4, () => Card.Content, ($$anchor, Card_Content) => {
					Card_Content($$anchor, {
						class: 'pb-4',
						children: ($$anchor, $$slotProps) => {
							var fragment_3 = $.comment();
							var node_5 = $.first_child(fragment_3);

							$.component(node_5, () => Chart.Container, ($$anchor, Chart_Container) => {
								Chart_Container($$anchor, {
									get config() {
										return chartConfig;
									},
									class: 'w-full md:h-[200px] [&_.lc-highlight-line]:stroke-1',
									children: ($$anchor, $$slotProps) => {
										{
											const tooltip = ($$anchor) => {
												var fragment_5 = $.comment();
												var node_6 = $.first_child(fragment_5);

												$.component(node_6, () => Chart.Tooltip, ($$anchor, Chart_Tooltip) => {
													Chart_Tooltip($$anchor, { label: 'Minutes' });
												});

												$.append($$anchor, fragment_5);
											};

											let $0 = $.derived(() => data.map((d, i) => ({ ...d, index: i })));

											let $1 = $.derived(() => ({
												spline: { curve: curveNatural, strokeWidth: 2 },
												points: {
													r: 3,
													stroke: "var(--color-today)",
													strokeWidth: 2,
													fill: "var(--color-today)"
												},
												highlight: { points: { motion: { type: "none" }, r: 5 } },
												xAxis: { format: (d) => data[d]?.day?.slice(0, 3) }
											}));

											LineChart($$anchor, {
												axis: 'x',
												get data() {
													return $.get($0);
												},
												x: 'index',
												series: [
													{
														key: "average",
														color: "var(--color-average)",
														label: "Average",
														props: { "stroke-opacity": 0.5 }
													},
													{ key: "today", color: "var(--color-today)", label: "Today" }
												],
												seriesLayout: 'stack',
												points: true,
												get props() {
													return $.get($1);
												},
												tooltip,
												$$slots: { tooltip: true }
											});
										}
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_3);
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		});
	});

	$.append($$anchor, fragment);
}