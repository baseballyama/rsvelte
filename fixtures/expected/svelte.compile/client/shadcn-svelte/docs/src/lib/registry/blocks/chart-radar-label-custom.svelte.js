import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import TrendingUpIcon from "@lucide/svelte/icons/trending-up";
import { scaleBand } from "d3-scale";
import { curveLinearClosed } from "d3-shape";
import { Axis, LineChart, Text } from "layerchart";
import * as Card from "$lib/registry/ui/card/index.js";
import * as Chart from "$lib/registry/ui/chart/index.js";

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<div class="flex items-center gap-2 leading-none font-medium">Trending up by 5.2% this month <!></div> <div class="flex items-center gap-2 leading-none text-muted-foreground">January - June 2024</div>`, 1);
var root_2 = $.from_html(`<!> <!> <!>`, 1);

export default function Chart_radar_label_custom($$anchor, $$props) {
	$.push($$props, true);

	const chartData = [
		{ month: "January", desktop: 186, mobile: 80 },
		{ month: "February", desktop: 305, mobile: 200 },
		{ month: "March", desktop: 237, mobile: 120 },
		{ month: "April", desktop: 73, mobile: 190 },
		{ month: "May", desktop: 209, mobile: 130 },
		{ month: "June", desktop: 214, mobile: 140 }
	];

	const chartConfig = {
		desktop: { label: "Desktop", color: "var(--chart-1)" },
		mobile: { label: "Mobile", color: "var(--chart-2)" }
	};

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

										var text = $.text('Radar Chart - Custom Label');

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
											const axis = ($$anchor) => {
												var fragment_5 = root();
												var node_6 = $.first_child(fragment_5);

												{
													const tickLabel = ($$anchor, $$arg0) => {
														let props = () => ($$arg0?.()).props;
														let index = () => ($$arg0?.()).index;

														const y = $.derived(() => props().y
															? typeof props().y === "number"
																? props().y
																: typeof props().y === "string" ? Number.parseInt(props().y) : 0
															: 0);

														const data = $.derived(() => chartData[index()]);
														var fragment_6 = root();
														var node_7 = $.first_child(fragment_6);

														Text(node_7, $.spread_props(props, {
															get y() {
																return $.get(y);
															},

															get value() {
																return `${$.get(data).desktop ?? ''} / ${$.get(data).mobile ?? ''}`;
															},
															class: 'fill-foreground'
														}));

														var node_8 = $.sibling(node_7, 2);

														{
															let $0 = $.derived(() => $.get(y) + 14);

															Text(node_8, $.spread_props(props, {
																get y() {
																	return $.get($0);
																}
															}));
														}

														$.append($$anchor, fragment_6);
													};

													Axis(node_6, {
														placement: 'angle',
														tickLength: 0,
														tickLabel,
														$$slots: { tickLabel: true }
													});
												}

												var node_9 = $.sibling(node_6, 2);

												Axis(node_9, { placement: 'radius', format: () => "" });
												$.append($$anchor, fragment_5);
											};

											const tooltip = ($$anchor) => {
												var fragment_7 = $.comment();
												var node_10 = $.first_child(fragment_7);

												$.component(node_10, () => Chart.Tooltip, ($$anchor, Chart_Tooltip) => {
													Chart_Tooltip($$anchor, {});
												});

												$.append($$anchor, fragment_7);
											};

											let $0 = $.derived(() => [
												{
													key: "desktop",
													label: "Desktop",
													color: chartConfig.desktop.color,
													props: { fill: chartConfig.desktop.color, fillOpacity: 0.6 }
												},

												{
													key: "mobile",
													label: "Mobile",
													color: chartConfig.mobile.color,
													props: { fill: chartConfig.mobile.color }
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
												get props() {
													return $.get($2);
												},
												axis,
												tooltip,
												$$slots: { axis: true, tooltip: true }
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

				var node_11 = $.sibling(node_4, 2);

				$.component(node_11, () => Card.Footer, ($$anchor, Card_Footer) => {
					Card_Footer($$anchor, {
						class: 'flex-col gap-2 text-sm',
						children: ($$anchor, $$slotProps) => {
							var fragment_8 = root_1();
							var div = $.first_child(fragment_8);
							var node_12 = $.sibling($.child(div));

							TrendingUpIcon(node_12, { class: 'size-4' });
							$.reset(div);
							$.next(2);
							$.append($$anchor, fragment_8);
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