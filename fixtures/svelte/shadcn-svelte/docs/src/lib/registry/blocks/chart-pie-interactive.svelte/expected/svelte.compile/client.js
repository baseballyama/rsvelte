import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import TrendingUpIcon from "@lucide/svelte/icons/trending-up";
import { Arc, PieChart, Text } from "layerchart";
import * as Card from "$lib/registry/ui/card/index.js";
import * as Chart from "$lib/registry/ui/chart/index.js";
import * as Select from "$lib/registry/ui/select/index.js";
import ChartStyle from "../ui/chart/chart-style.svelte";

var root = $.from_html(`<span class="flex h-3 w-3 shrink-0 rounded-sm"></span> `, 1);
var root_1 = $.from_html(`<div class="flex items-center gap-2 text-xs"> </div>`);
var root_2 = $.from_html(`<!> <!>`, 1);
var root_3 = $.from_html(`<div class="grid gap-1"><!> <!></div> <!>`, 1);
var root_4 = $.from_svg(`<g><!><!></g>`);
var root_5 = $.from_html(`<div class="flex items-center gap-2 leading-none font-medium">Trending up by 5.2% this month <!></div> <div class="leading-none text-muted-foreground">Showing total visitors for the last 6 months</div>`, 1);
var root_6 = $.from_html(`<!> <!> <!> <!>`, 1);

export default function Chart_pie_interactive($$anchor) {
	const desktopData = [
		{
			month: "january",
			desktop: 186,
			color: "var(--color-january)"
		},

		{
			month: "february",
			desktop: 305,
			color: "var(--color-february)"
		},
		{ month: "march", desktop: 237, color: "var(--color-march)" },
		{ month: "april", desktop: 173, color: "var(--color-april)" },
		{ month: "may", desktop: 209, color: "var(--color-may)" }
	];

	const chartConfig = {
		desktop: { label: "Desktop" },
		january: { label: "January", color: "var(--chart-1)" },
		february: { label: "February", color: "var(--chart-2)" },
		march: { label: "March", color: "var(--chart-3)" },
		april: { label: "April", color: "var(--chart-4)" },
		may: { label: "May", color: "var(--chart-5)" }
	};

	let activeMonth = $.state($.proxy(desktopData[0].month));
	const id = "pie-interactive";
	const activeIndex = $.derived(() => desktopData.findIndex((item) => item.month === $.get(activeMonth)));
	const months = $.derived(() => desktopData.map((item) => item.month));
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => Card.Root, ($$anchor, Card_Root) => {
		Card_Root($$anchor, {
			'data-chart': id,
			class: 'flex flex-col',
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root_6();
				var node_1 = $.first_child(fragment_1);

				ChartStyle(node_1, {
					id,
					get config() {
						return chartConfig;
					}
				});

				var node_2 = $.sibling(node_1, 2);

				$.component(node_2, () => Card.Header, ($$anchor, Card_Header) => {
					Card_Header($$anchor, {
						class: 'flex flex-row items-start space-y-0 pb-0',
						children: ($$anchor, $$slotProps) => {
							var fragment_2 = root_3();
							var div = $.first_child(fragment_2);
							var node_3 = $.child(div);

							$.component(node_3, () => Card.Title, ($$anchor, Card_Title) => {
								Card_Title($$anchor, {
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text = $.text('Pie Chart - Interactive');

										$.append($$anchor, text);
									},
									$$slots: { default: true }
								});
							});

							var node_4 = $.sibling(node_3, 2);

							$.component(node_4, () => Card.Description, ($$anchor, Card_Description) => {
								Card_Description($$anchor, {
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_1 = $.text('January - June 2024');

										$.append($$anchor, text_1);
									},
									$$slots: { default: true }
								});
							});

							$.reset(div);

							var node_5 = $.sibling(div, 2);

							$.component(node_5, () => Select.Root, ($$anchor, Select_Root) => {
								Select_Root($$anchor, {
									type: 'single',
									get value() {
										return $.get(activeMonth);
									},

									set value($$value) {
										$.set(activeMonth, $$value, true);
									},

									children: ($$anchor, $$slotProps) => {
										var fragment_3 = root_2();
										var node_6 = $.first_child(fragment_3);

										$.component(node_6, () => Select.Trigger, ($$anchor, Select_Trigger) => {
											Select_Trigger($$anchor, {
												class: 'ms-auto h-7 w-[130px] rounded-lg ps-2.5 text-sm',
												'aria-label': 'Select a value',
												children: ($$anchor, $$slotProps) => {
													var fragment_4 = root();
													var span = $.first_child(fragment_4);
													let styles;
													var text_2 = $.sibling(span);

													$.template_effect(() => {
														styles = $.set_style(span, '', styles, { 'background-color': `var(--color-${$.get(activeMonth)})` });

														$.set_text(text_2, ` ${($.get(activeMonth)
															? chartConfig[$.get(activeMonth)].label
															: "Select month") ?? ''}`);
													});

													$.append($$anchor, fragment_4);
												},
												$$slots: { default: true }
											});
										});

										var node_7 = $.sibling(node_6, 2);

										$.component(node_7, () => Select.Content, ($$anchor, Select_Content) => {
											Select_Content($$anchor, {
												align: 'end',
												class: 'rounded-xl',
												children: ($$anchor, $$slotProps) => {
													var fragment_5 = $.comment();
													var node_8 = $.first_child(fragment_5);

													$.each(node_8, 16, () => $.get(months), (month) => month, ($$anchor, month) => {
														const config = $.derived(() => chartConfig[month]);
														var fragment_6 = $.comment();
														var node_9 = $.first_child(fragment_6);

														{
															var consequent = ($$anchor) => {
																var fragment_7 = $.comment();
																var node_10 = $.first_child(fragment_7);

																$.component(node_10, () => Select.Item, ($$anchor, Select_Item) => {
																	Select_Item($$anchor, {
																		get value() {
																			return month;
																		},

																		get label() {
																			return $.get(config).label;
																		},
																		class: 'rounded-lg [&_span]:flex',
																		children: ($$anchor, $$slotProps) => {
																			var div_1 = root_1();
																			var text_3 = $.only_child(div_1, true);

																			$.template_effect(() => $.set_text(text_3, $.get(config)?.label));
																			$.append($$anchor, div_1);
																		},
																		$$slots: { default: true }
																	});
																});

																$.append($$anchor, fragment_7);
															};

															$.if(node_9, ($$render) => {
																if ($.get(config)) $$render(consequent);
															});
														}

														$.append($$anchor, fragment_6);
													});

													$.append($$anchor, fragment_5);
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

				var node_11 = $.sibling(node_2, 2);

				$.component(node_11, () => Card.Content, ($$anchor, Card_Content) => {
					Card_Content($$anchor, {
						class: 'flex-1',
						children: ($$anchor, $$slotProps) => {
							var fragment_8 = $.comment();
							var node_12 = $.first_child(fragment_8);

							$.component(node_12, () => Chart.Container, ($$anchor, Chart_Container) => {
								Chart_Container($$anchor, {
									id,
									get config() {
										return chartConfig;
									},
									class: 'mx-auto aspect-square max-h-[250px]',
									children: ($$anchor, $$slotProps) => {
										{
											const aboveMarks = ($$anchor) => {
												var fragment_10 = root_2();
												var node_13 = $.first_child(fragment_10);

												{
													let $0 = $.derived(() => desktopData[$.get(activeIndex)].desktop.toLocaleString());

													Text(node_13, {
														get value() {
															return $.get($0);
														},
														textAnchor: 'middle',
														verticalAnchor: 'middle',
														class: 'fill-foreground !text-3xl font-bold',
														dy: 3
													});
												}

												var node_14 = $.sibling(node_13, 2);

												Text(node_14, {
													value: 'Visitors',
													textAnchor: 'middle',
													verticalAnchor: 'middle',
													class: '!fill-muted-foreground text-muted-foreground',
													dy: 22
												});

												$.append($$anchor, fragment_10);
											};

											const arc = ($$anchor, $$arg0) => {
												let props = () => ($$arg0?.()).props;
												let index = () => ($$arg0?.()).index;
												const isActive = $.derived(() => index() === $.get(activeIndex));

												const arcProps = $.derived(() => $.get(isActive)
													? { ...props(), outerRadius: 60, innerRadius: 105 }
													: props());

												var fragment_11 = $.comment();
												var node_15 = $.first_child(fragment_11);

												{
													var consequent_1 = ($$anchor) => {
														var g = root_4();
														var node_16 = $.child(g);

														Arc(node_16, $.spread_props(() => $.get(arcProps)));

														var node_17 = $.sibling(node_16);

														Arc(node_17, $.spread_props(() => $.get(arcProps), { outerRadius: 107, innerRadius: 119 }));
														$.reset(g);
														$.append($$anchor, g);
													};

													var alternate = ($$anchor) => {
														Arc($$anchor, $.spread_props(() => $.get(arcProps)));
													};

													$.if(node_15, ($$render) => {
														if ($.get(isActive)) $$render(consequent_1); else $$render(alternate, -1);
													});
												}

												$.append($$anchor, fragment_11);
											};

											const tooltip = ($$anchor) => {
												var fragment_13 = $.comment();
												var node_18 = $.first_child(fragment_13);

												$.component(node_18, () => Chart.Tooltip, ($$anchor, Chart_Tooltip) => {
													Chart_Tooltip($$anchor, {
														labelKey: 'visitors',
														nameKey: 'month',
														indicator: 'line',
														labelFormatter: (_, payload) => {
															return chartConfig[payload?.[0].key].label;
														}
													});
												});

												$.append($$anchor, fragment_13);
											};

											PieChart($$anchor, {
												get data() {
													return desktopData;
												},
												label: 'month',
												key: 'month',
												value: 'desktop',
												c: 'color',
												props: {
													pie: {
														sort: (a, b) => {
															const monthOrder = ["january", "february", "march", "april", "may"];

															return monthOrder.indexOf(a.month) - monthOrder.indexOf(b.month);
														},
														motion: "tween"
													}
												},
												innerRadius: 60,
												padding: 29,
												aboveMarks,
												arc,
												tooltip,
												$$slots: { aboveMarks: true, arc: true, tooltip: true }
											});
										}
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_8);
						},
						$$slots: { default: true }
					});
				});

				var node_19 = $.sibling(node_11, 2);

				$.component(node_19, () => Card.Footer, ($$anchor, Card_Footer) => {
					Card_Footer($$anchor, {
						class: 'flex-col gap-2 text-sm',
						children: ($$anchor, $$slotProps) => {
							var fragment_14 = root_5();
							var div_2 = $.first_child(fragment_14);
							var node_20 = $.sibling($.child(div_2));

							TrendingUpIcon(node_20, { class: 'size-4' });
							$.reset(div_2);
							$.next(2);
							$.append($$anchor, fragment_14);
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