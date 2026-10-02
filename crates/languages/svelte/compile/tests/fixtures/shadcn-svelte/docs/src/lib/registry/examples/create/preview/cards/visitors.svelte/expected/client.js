import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { scaleBand } from "d3-scale";
import { curveNatural } from "d3-shape";
import { AreaChart } from "layerchart";
import * as Card from "$lib/registry/ui/card/index.js";
import * as Chart from "$lib/registry/ui/chart/index.js";
import { Badge } from "$lib/registry/ui/badge/index.js";

var root = $.from_html(`<!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);

export default function Visitors($$anchor, $$props) {
	$.push($$props, true);

	const areaChartData = [
		{ month: "January", desktop: 186 },
		{ month: "February", desktop: 305 },
		{ month: "March", desktop: 237 },
		{ month: "April", desktop: 73 },
		{ month: "May", desktop: 209 },
		{ month: "June", desktop: 214 }
	];

	const areaChartConfig = { desktop: { label: "Desktop", color: "var(--chart-1)" } };
	const latestVisitors = areaChartData[areaChartData.length - 1]?.desktop ?? 0;
	const previousVisitors = areaChartData[areaChartData.length - 2]?.desktop ?? latestVisitors;

	const trendPercent = previousVisitors === 0
		? 0
		: Math.round((latestVisitors - previousVisitors) / previousVisitors * 100);

	const trendPrefix = trendPercent > 0 ? "+" : "";
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => Card.Root, ($$anchor, Card_Root) => {
		Card_Root($$anchor, {
			class: 'pb-0',
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root_1();
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

										var text = $.text('Visitors');

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

										var text_1 = $.text('Last 6 months');

										$.append($$anchor, text_1);
									},
									$$slots: { default: true }
								});
							});

							var node_4 = $.sibling(node_3, 2);

							$.component(node_4, () => Card.Action, ($$anchor, Card_Action) => {
								Card_Action($$anchor, {
									children: ($$anchor, $$slotProps) => {
										{
											let $0 = $.derived(() => trendPercent >= 0 ? "secondary" : "destructive");

											Badge($$anchor, {
												get variant() {
													return $.get($0);
												},

												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_2 = $.text();

													$.template_effect(() => $.set_text(text_2, `${trendPrefix}${trendPercent}% vs last month`));
													$.append($$anchor, text_2);
												},
												$$slots: { default: true }
											});
										}
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_2);
						},
						$$slots: { default: true }
					});
				});

				var node_5 = $.sibling(node_1, 2);

				$.component(node_5, () => Card.Content, ($$anchor, Card_Content) => {
					Card_Content($$anchor, {
						class: 'px-0',
						children: ($$anchor, $$slotProps) => {
							var fragment_5 = $.comment();
							var node_6 = $.first_child(fragment_5);

							$.component(node_6, () => Chart.Container, ($$anchor, Chart_Container) => {
								Chart_Container($$anchor, {
									get config() {
										return areaChartConfig;
									},
									class: 'h-48 w-full',
									children: ($$anchor, $$slotProps) => {
										{
											const tooltip = ($$anchor) => {
												var fragment_7 = $.comment();
												var node_7 = $.first_child(fragment_7);

												$.component(node_7, () => Chart.Tooltip, ($$anchor, Chart_Tooltip) => {
													Chart_Tooltip($$anchor, { indicator: 'line', hideLabel: true });
												});

												$.append($$anchor, fragment_7);
											};

											let $0 = $.derived(scaleBand);

											let $1 = $.derived(() => [
												{
													key: "desktop",
													label: "Desktop",
													color: areaChartConfig.desktop.color
												}
											]);

											let $2 = $.derived(() => ({
												area: { curve: curveNatural, fillOpacity: 0.15, motion: "tween" },
												xAxis: { format: (d) => d.slice(0, 3), tickLength: 0 }
											}));

											AreaChart($$anchor, {
												get data() {
													return areaChartData;
												},
												x: 'month',
												get xScale() {
													return $.get($0);
												},
												axis: 'x',
												get series() {
													return $.get($1);
												},

												get props() {
													return $.get($2);
												},
												tooltip,
												$$slots: { tooltip: true }
											});
										}
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_5);
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
	$.pop();
}