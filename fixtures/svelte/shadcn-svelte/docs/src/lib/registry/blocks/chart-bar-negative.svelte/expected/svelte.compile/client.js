import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import TrendingUpIcon from "@lucide/svelte/icons/trending-up";
import { scaleBand } from "d3-scale";
import { BarChart } from "layerchart";
import * as Card from "$lib/registry/ui/card/index.js";
import * as Chart from "$lib/registry/ui/chart/index.js";

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<div class="flex w-full items-start gap-2 text-sm"><div class="grid gap-2"><div class="flex items-center gap-2 leading-none font-medium">Trending up by 5.2% this month <!></div> <div class="flex items-center gap-2 leading-none text-muted-foreground">Showing total visitors for the last 6 months</div></div></div>`);
var root_2 = $.from_html(`<!> <!> <!>`, 1);

export default function Chart_bar_negative($$anchor, $$props) {
	$.push($$props, true);

	const chartData = [
		{ month: "January", visitors: 186 },
		{ month: "February", visitors: 205 },
		{ month: "March", visitors: -207 },
		{ month: "April", visitors: 173 },
		{ month: "May", visitors: -209 },
		{ month: "June", visitors: 214 }
	];

	const chartConfig = { visitors: { label: "Visitors" } };
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => Card.Root, ($$anchor, Card_Root) => {
		Card_Root($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root_2();
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

										var text = $.text('Bar Chart - Negative');

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

										var text_1 = $.text('January - June 2024');

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
						children: ($$anchor, $$slotProps) => {
							var fragment_3 = $.comment();
							var node_5 = $.first_child(fragment_3);

							$.component(node_5, () => Chart.Container, ($$anchor, Chart_Container) => {
								Chart_Container($$anchor, {
									get config() {
										return chartConfig;
									},

									children: ($$anchor, $$slotProps) => {
										{
											const tooltip = ($$anchor) => {
												var fragment_5 = $.comment();
												var node_6 = $.first_child(fragment_5);

												$.component(node_6, () => Chart.Tooltip, ($$anchor, Chart_Tooltip) => {
													Chart_Tooltip($$anchor, { hideLabel: true, hideIndicator: true, nameKey: 'visitors' });
												});

												$.append($$anchor, fragment_5);
											};

											let $0 = $.derived(() => scaleBand().padding(0.25));

											BarChart($$anchor, {
												labels: {
													offset: 5,
													value: (d) => d.month,
													fill: (d) => {
														if (d.visitors > 0) {
															return "var(--chart-1)";
														} else if (d.visitors < 0) {
															return "var(--chart-2)";
														}
													}
												},

												get data() {
													return chartData;
												},

												get xScale() {
													return $.get($0);
												},
												x: 'month',
												y: 'visitors',
												yNice: 4,
												yBaseline: 0,
												cRange: ["var(--chart-1)", "var(--chart-2)"],
												c: (d) => d.visitors > 0 ? "var(--chart-1)" : "var(--chart-2)",
												axis: false,
												props: {
													bars: { stroke: "none", radius: 0 },
													highlight: { area: { fill: "none" } },
													xAxis: { format: (d) => d.slice(0, 3) }
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

				var node_7 = $.sibling(node_4, 2);

				$.component(node_7, () => Card.Footer, ($$anchor, Card_Footer) => {
					Card_Footer($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var div = root_1();
							var div_1 = $.child(div);
							var div_2 = $.child(div_1);
							var node_8 = $.sibling($.child(div_2));

							TrendingUpIcon(node_8, { class: 'size-4' });
							$.reset(div_2);
							$.next(2);
							$.reset(div_1);
							$.reset(div);
							$.append($$anchor, div);
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