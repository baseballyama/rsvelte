import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { scaleBand } from "d3-scale";
import { BarChart } from "layerchart";
import { cubicInOut } from "svelte/easing";
import * as Card from "$lib/registry/ui/card/index.js";
import * as Chart from "$lib/registry/ui/chart/index.js";

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<div class="flex min-w-[130px] items-center text-xs text-muted-foreground"> <div class="ms-auto flex items-baseline gap-0.5 font-mono font-medium text-foreground tabular-nums"> <span class="font-normal text-muted-foreground">kcal</span></div></div>`);

export default function Chart_tooltip_formatter($$anchor, $$props) {
	$.push($$props, true);

	const chartData = [
		{ date: "2024-07-15", running: 450, swimming: 300 },
		{ date: "2024-07-16", running: 380, swimming: 420 },
		{ date: "2024-07-17", running: 520, swimming: 120 },
		{ date: "2024-07-18", running: 140, swimming: 550 },
		{ date: "2024-07-19", running: 600, swimming: 350 },
		{ date: "2024-07-20", running: 480, swimming: 400 }
	];

	const chartConfig = {
		running: { label: "Running", color: "var(--chart-1)" },
		swimming: { label: "Swimming", color: "var(--chart-2)" }
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

										var text = $.text('Tooltip - Formatter');

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

										var text_1 = $.text('Tooltip with custom formatter.');

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

												{
													const formatter = ($$anchor, $$arg0) => {
														let name = () => ($$arg0?.()).name;
														let value = () => ($$arg0?.()).value;
														var div = root_1();
														var text_2 = $.child(div);
														var div_1 = $.sibling(text_2);
														var text_3 = $.child(div_1);

														$.next();
														$.reset(div_1);
														$.reset(div);

														$.template_effect(() => {
															$.set_text(text_2, `${(chartConfig[name()]?.label || name()) ?? ''} `);
															$.set_text(text_3, `${value() ?? ''} `);
														});

														$.append($$anchor, div);
													};

													$.component(node_6, () => Chart.Tooltip, ($$anchor, Chart_Tooltip) => {
														Chart_Tooltip($$anchor, { hideLabel: true, formatter, $$slots: { formatter: true } });
													});
												}

												$.append($$anchor, fragment_5);
											};

											let $0 = $.derived(() => scaleBand().padding(0.25));

											let $1 = $.derived(() => [
												{
													key: "running",
													label: "Running",
													color: chartConfig.running.color,
													props: { rounded: "bottom" }
												},

												{
													key: "swimming",
													label: "Swimming",
													color: chartConfig.swimming.color
												}
											]);

											let $2 = $.derived(() => ({
												bars: {
													stroke: "none",
													motion: { type: "tween", duration: 500, easing: cubicInOut }
												},
												xAxis: {
													format: (d) => new Date(d).toLocaleDateString("en-US", { weekday: "short" }),
													tickLabelProps: { svgProps: { y: 13 } }
												}
											}));

											BarChart($$anchor, {
												get data() {
													return chartData;
												},

												get xScale() {
													return $.get($0);
												},
												x: 'date',
												axis: 'x',
												rule: false,
												get series() {
													return $.get($1);
												},
												seriesLayout: 'stack',
												grid: false,
												highlight: false,
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

				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		});
	});

	$.append($$anchor, fragment);
	$.pop();
}