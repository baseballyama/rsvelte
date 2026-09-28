import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import TrendingUpIcon from "@lucide/svelte/icons/trending-up";
import { scaleBand } from "d3-scale";
import { curveLinearClosed } from "d3-shape";
import { LineChart } from "layerchart";
import * as Card from "$lib/registry/ui/card/index.js";
import * as Chart from "$lib/registry/ui/chart/index.js";

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<div class="flex items-center gap-2 leading-none font-medium">Trending up by 5.2% this month <!></div> <div class="flex items-center gap-2 leading-none text-muted-foreground">January - June 2024</div>`, 1);
var root_2 = $.from_html(`<!> <!> <!>`, 1);

export default function Chart_radar_grid_fill($$anchor, $$props) {
	$.push($$props, true);

	const chartData = [
		{ month: "January", desktop: 186 },
		{ month: "February", desktop: 285 },
		{ month: "March", desktop: 237 },
		{ month: "April", desktop: 203 },
		{ month: "May", desktop: 209 },
		{ month: "June", desktop: 264 }
	];

	const chartConfig = { desktop: { label: "Desktop", color: "var(--chart-1)" } };
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => Card.Root, ($$anchor, Card_Root) => {
		Card_Root($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root_2();
				var node_1 = $.first_child(fragment_1);

				$.component(node_1, () => Card.Header, ($$anchor, Card_Header) => {
					Card_Header($$anchor, {
						class: 'items-center',
						children: ($$anchor, $$slotProps) => {
							var fragment_2 = root();
							var node_2 = $.first_child(fragment_2);

							$.component(node_2, () => Card.Title, ($$anchor, Card_Title) => {
								Card_Title($$anchor, {
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text = $.text('Radar Chart - Grid Filled');

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

										var text_1 = $.text('Showing total visitors for the last 6 months');

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
						class: 'flex-1',
						children: ($$anchor, $$slotProps) => {
							var fragment_3 = $.comment();
							var node_5 = $.first_child(fragment_3);

							$.component(node_5, () => Chart.Container, ($$anchor, Chart_Container) => {
								Chart_Container($$anchor, {
									get config() {
										return chartConfig;
									},
									class: 'mx-auto aspect-square max-h-[250px]',
									children: ($$anchor, $$slotProps) => {
										{
											const tooltip = ($$anchor) => {
												var fragment_5 = $.comment();
												var node_6 = $.first_child(fragment_5);

												$.component(node_6, () => Chart.Tooltip, ($$anchor, Chart_Tooltip) => {
													Chart_Tooltip($$anchor, {});
												});

												$.append($$anchor, fragment_5);
											};

											let $0 = $.derived(() => [
												{
													key: "desktop",
													label: "Desktop",
													color: chartConfig.desktop.color
												}
											]);

											let $1 = $.derived(scaleBand);

											let $2 = $.derived(() => ({
												spline: {
													curve: curveLinearClosed,
													fill: "var(--color-desktop)",
													fillOpacity: 0.5,
													stroke: "0",
													motion: "tween"
												},
												xAxis: { tickLength: 0 },
												yAxis: { format: () => "" },
												grid: {
													radialY: "linear",
													class: "fill-(--color-desktop)",
													classes: { line: "fill-(--color-desktop) opacity-20!" }
												},
												tooltip: { context: { mode: "voronoi" } },
												highlight: { lines: false }
											}));

											LineChart($$anchor, {
												get data() {
													return chartData;
												},

												get series() {
													return $.get($0);
												},
												radial: true,
												x: 'month',
												get xScale() {
													return $.get($1);
												},
												padding: 12,
												yPadding: [0, 8],
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

							$.append($$anchor, fragment_3);
						},
						$$slots: { default: true }
					});
				});

				var node_7 = $.sibling(node_4, 2);

				$.component(node_7, () => Card.Footer, ($$anchor, Card_Footer) => {
					Card_Footer($$anchor, {
						class: 'flex-col gap-2 text-sm',
						children: ($$anchor, $$slotProps) => {
							var fragment_6 = root_1();
							var div = $.first_child(fragment_6);
							var node_8 = $.sibling($.child(div));

							TrendingUpIcon(node_8, { class: 'size-4' });
							$.reset(div);
							$.next(2);
							$.append($$anchor, fragment_6);
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