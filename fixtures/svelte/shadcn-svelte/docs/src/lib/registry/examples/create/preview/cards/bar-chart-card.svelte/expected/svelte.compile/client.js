import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { scaleBand } from "d3-scale";
import { BarChart } from "layerchart";
import * as Card from "$lib/registry/ui/card/index.js";
import * as Chart from "$lib/registry/ui/chart/index.js";
import * as ToggleGroup from "$lib/registry/ui/toggle-group/index.js";

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!>`, 1);
var root_2 = $.from_html(`<div class="grid w-full grid-cols-3 divide-x divide-border/60"><div class="px-2 text-center"><div class="text-[0.65rem] text-muted-foreground uppercase">Desktop</div> <div class="text-sm font-medium tabular-nums"> </div></div> <div class="px-2 text-center"><div class="text-[0.65rem] text-muted-foreground uppercase">Mobile</div> <div class="text-sm font-medium tabular-nums"> </div></div> <div class="px-2 text-center"><div class="text-[0.65rem] text-muted-foreground uppercase">Mix Delta</div> <div class="text-sm font-medium tabular-nums"> </div></div></div>`);

export default function Bar_chart_card($$anchor, $$props) {
	$.push($$props, true);

	const barChartData = [
		{ month: "January", desktop: 186, mobile: 80 },
		{ month: "February", desktop: 305, mobile: 200 },
		{ month: "March", desktop: 237, mobile: 120 },
		{ month: "April", desktop: 73, mobile: 190 },
		{ month: "May", desktop: 209, mobile: 130 },
		{ month: "June", desktop: 214, mobile: 140 }
	];

	const barChartConfig = {
		desktop: { label: "Desktop", color: "var(--chart-1)" },
		mobile: { label: "Mobile", color: "var(--chart-2)" }
	};

	const desktopTotal = barChartData.reduce((sum, item) => sum + item.desktop, 0);
	const mobileTotal = barChartData.reduce((sum, item) => sum + item.mobile, 0);
	const desktopDelta = Math.round((desktopTotal - mobileTotal) / mobileTotal * 100);
	const desktopDeltaPrefix = desktopDelta > 0 ? "+" : "";
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => Card.Root, ($$anchor, Card_Root) => {
		Card_Root($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root_1();
				var node_1 = $.first_child(fragment_1);

				$.component(node_1, () => Card.Header, ($$anchor, Card_Header) => {
					Card_Header($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_2 = root_1();
							var node_2 = $.first_child(fragment_2);

							$.component(node_2, () => Card.Title, ($$anchor, Card_Title) => {
								Card_Title($$anchor, {
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text = $.text('Traffic Channels');

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

										var text_1 = $.text('Desktop vs mobile over the last 6 months');

										$.append($$anchor, text_1);
									},
									$$slots: { default: true }
								});
							});

							var node_4 = $.sibling(node_3, 2);

							$.component(node_4, () => Card.Action, ($$anchor, Card_Action) => {
								Card_Action($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_3 = $.comment();
										var node_5 = $.first_child(fragment_3);

										$.component(node_5, () => ToggleGroup.Root, ($$anchor, ToggleGroup_Root) => {
											ToggleGroup_Root($$anchor, {
												'aria-label': 'Time range',
												type: 'single',
												value: '6m',
												variant: 'outline',
												size: 'sm',
												children: ($$anchor, $$slotProps) => {
													var fragment_4 = root();
													var node_6 = $.first_child(fragment_4);

													$.component(node_6, () => ToggleGroup.Item, ($$anchor, ToggleGroup_Item) => {
														ToggleGroup_Item($$anchor, {
															value: '6m',
															children: ($$anchor, $$slotProps) => {
																$.next();

																var text_2 = $.text('6M');

																$.append($$anchor, text_2);
															},
															$$slots: { default: true }
														});
													});

													var node_7 = $.sibling(node_6, 2);

													$.component(node_7, () => ToggleGroup.Item, ($$anchor, ToggleGroup_Item_1) => {
														ToggleGroup_Item_1($$anchor, {
															value: '12m',
															children: ($$anchor, $$slotProps) => {
																$.next();

																var text_3 = $.text('12M');

																$.append($$anchor, text_3);
															},
															$$slots: { default: true }
														});
													});

													$.append($$anchor, fragment_4);
												},
												$$slots: { default: true }
											});
										});

										$.append($$anchor, fragment_3);
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_2);
						},
						$$slots: { default: true }
					});
				});

				var node_8 = $.sibling(node_1, 2);

				$.component(node_8, () => Card.Content, ($$anchor, Card_Content) => {
					Card_Content($$anchor, {
						class: 'pt-0',
						children: ($$anchor, $$slotProps) => {
							var fragment_5 = $.comment();
							var node_9 = $.first_child(fragment_5);

							$.component(node_9, () => Chart.Container, ($$anchor, Chart_Container) => {
								Chart_Container($$anchor, {
									get config() {
										return barChartConfig;
									},
									class: 'max-h-[180px] w-full',
									children: ($$anchor, $$slotProps) => {
										{
											const tooltip = ($$anchor) => {
												var fragment_7 = $.comment();
												var node_10 = $.first_child(fragment_7);

												$.component(node_10, () => Chart.Tooltip, ($$anchor, Chart_Tooltip) => {
													Chart_Tooltip($$anchor, { indicator: 'dashed' });
												});

												$.append($$anchor, fragment_7);
											};

											let $0 = $.derived(() => scaleBand().padding(0.25));
											let $1 = $.derived(() => scaleBand().paddingInner(0.2));

											let $2 = $.derived(() => [
												{
													key: "desktop",
													label: barChartConfig.desktop.label,
													color: barChartConfig.desktop.color
												},

												{
													key: "mobile",
													label: barChartConfig.mobile.label,
													color: barChartConfig.mobile.color
												}
											]);

											BarChart($$anchor, {
												get data() {
													return barChartData;
												},

												get xScale() {
													return $.get($0);
												},
												x: 'month',
												axis: 'x',
												get x1Scale() {
													return $.get($1);
												},
												seriesLayout: 'group',
												rule: false,
												props: {
													bars: { stroke: "none", rounded: "all" },
													xAxis: { format: (d) => d.slice(0, 3), tickLength: 0 }
												},

												get series() {
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

				var node_11 = $.sibling(node_8, 2);

				$.component(node_11, () => Card.Footer, ($$anchor, Card_Footer) => {
					Card_Footer($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var div = root_2();
							var div_1 = $.child(div);
							var div_2 = $.sibling($.child(div_1), 2);
							var text_4 = $.only_child(div_2, true);

							$.reset(div_1);

							var div_3 = $.sibling(div_1, 2);
							var div_4 = $.sibling($.child(div_3), 2);
							var text_5 = $.only_child(div_4, true);

							$.reset(div_3);

							var div_5 = $.sibling(div_3, 2);
							var div_6 = $.sibling($.child(div_5), 2);
							var text_6 = $.only_child(div_6);

							$.reset(div_5);
							$.reset(div);

							$.template_effect(
								($0, $1) => {
									$.set_text(text_4, $0);
									$.set_text(text_5, $1);
									$.set_text(text_6, `${desktopDeltaPrefix}${desktopDelta}%`);
								},
								[
									() => desktopTotal.toLocaleString(),
									() => mobileTotal.toLocaleString()
								]
							);

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