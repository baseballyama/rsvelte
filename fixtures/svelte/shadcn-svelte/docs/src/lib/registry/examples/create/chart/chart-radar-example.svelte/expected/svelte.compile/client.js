import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { scaleBand } from "d3-scale";
import { curveLinearClosed } from "d3-shape";
import { LineChart } from "layerchart";
import * as Card from "$lib/registry/ui/card/index.js";
import * as Chart from "$lib/registry/ui/chart/index.js";
import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<div class="flex items-center gap-2 leading-none font-medium">Trending up by 5.2% this month <!></div> <div class="flex items-center gap-2 leading-none text-muted-foreground">January - June 2024</div>`, 1);
var root_2 = $.from_html(`<!> <!> <!>`, 1);

export default function Chart_radar_example($$anchor, $$props) {
	$.push($$props, true);

	const radarChartData = [
		{ month: "January", desktop: 186, mobile: 80 },
		{ month: "February", desktop: 305, mobile: 200 },
		{ month: "March", desktop: 237, mobile: 120 },
		{ month: "April", desktop: 73, mobile: 190 },
		{ month: "May", desktop: 209, mobile: 130 },
		{ month: "June", desktop: 214, mobile: 140 }
	];

	const radarChartConfig = {
		desktop: { label: "Desktop", color: "var(--chart-1)" },
		mobile: { label: "Mobile", color: "var(--chart-2)" }
	};

	Example($$anchor, {
		title: 'Radar Chart',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = $.comment();
			var node = $.first_child(fragment_1);

			$.component(node, () => Card.Root, ($$anchor, Card_Root) => {
				Card_Root($$anchor, {
					class: 'w-full',
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = root_2();
						var node_1 = $.first_child(fragment_2);

						$.component(node_1, () => Card.Header, ($$anchor, Card_Header) => {
							Card_Header($$anchor, {
								class: 'items-center pb-4',
								children: ($$anchor, $$slotProps) => {
									var fragment_3 = root();
									var node_2 = $.first_child(fragment_3);

									$.component(node_2, () => Card.Title, ($$anchor, Card_Title) => {
										Card_Title($$anchor, {
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text = $.text('Radar Chart - Multiple');

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

									$.append($$anchor, fragment_3);
								},
								$$slots: { default: true }
							});
						});

						var node_4 = $.sibling(node_1, 2);

						$.component(node_4, () => Card.Content, ($$anchor, Card_Content) => {
							Card_Content($$anchor, {
								class: 'pb-0',
								children: ($$anchor, $$slotProps) => {
									var fragment_4 = $.comment();
									var node_5 = $.first_child(fragment_4);

									$.component(node_5, () => Chart.Container, ($$anchor, Chart_Container) => {
										Chart_Container($$anchor, {
											get config() {
												return radarChartConfig;
											},
											class: 'mx-auto aspect-square max-h-[250px]',
											children: ($$anchor, $$slotProps) => {
												{
													const tooltip = ($$anchor) => {
														var fragment_6 = $.comment();
														var node_6 = $.first_child(fragment_6);

														$.component(node_6, () => Chart.Tooltip, ($$anchor, Chart_Tooltip) => {
															Chart_Tooltip($$anchor, { indicator: 'line' });
														});

														$.append($$anchor, fragment_6);
													};

													let $0 = $.derived(() => [
														{
															key: "desktop",
															label: "Desktop",
															color: radarChartConfig.desktop.color,
															props: { fill: radarChartConfig.desktop.color, fillOpacity: 0.6 }
														},

														{
															key: "mobile",
															label: "Mobile",
															color: radarChartConfig.mobile.color,
															props: { fill: radarChartConfig.mobile.color }
														}
													]);

													let $1 = $.derived(scaleBand);

													let $2 = $.derived(() => ({
														spline: { curve: curveLinearClosed, stroke: "0", motion: "tween" },
														xAxis: { tickLength: 0 },
														yAxis: { format: () => "" },
														grid: { radialY: "linear" },
														tooltip: { context: { mode: "voronoi" } },
														highlight: { lines: false, points: { r: 4 } }
													}));

													LineChart($$anchor, {
														get data() {
															return radarChartData;
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

									$.append($$anchor, fragment_4);
								},
								$$slots: { default: true }
							});
						});

						var node_7 = $.sibling(node_4, 2);

						$.component(node_7, () => Card.Footer, ($$anchor, Card_Footer) => {
							Card_Footer($$anchor, {
								class: 'flex-col gap-2',
								children: ($$anchor, $$slotProps) => {
									var fragment_7 = root_1();
									var div = $.first_child(fragment_7);
									var node_8 = $.sibling($.child(div));

									IconPlaceholder(node_8, {
										lucide: 'TrendingUpIcon',
										tabler: 'IconTrendingUp',
										hugeicons: 'ChartUpIcon',
										phosphor: 'TrendUpIcon',
										remixicon: 'RiLineChartLine',
										class: 'size-4'
									});

									$.reset(div);
									$.next(2);
									$.append($$anchor, fragment_7);
								},
								$$slots: { default: true }
							});
						});

						$.append($$anchor, fragment_2);
					},
					$$slots: { default: true }
				});
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	$.pop();
}