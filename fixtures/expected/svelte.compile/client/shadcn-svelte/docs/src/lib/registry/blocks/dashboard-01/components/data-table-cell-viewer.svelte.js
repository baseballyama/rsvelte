import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import TrendingUpIcon from "@tabler/icons-svelte/icons/trending-up";
import { scaleUtc } from "d3-scale";
import { curveNatural } from "d3-shape";
import { AreaChart } from "layerchart";
import * as Chart from "$lib/registry/ui/chart/index.js";
import * as Drawer from "$lib/registry/ui/drawer/index.js";
import * as Select from "$lib/registry/ui/select/index.js";
import { IsMobile } from "$lib/registry/hooks/is-mobile.svelte.js";
import { Button } from "$lib/registry/ui/button/index.js";
import { Input } from "$lib/registry/ui/input/index.js";
import { Label } from "$lib/registry/ui/label/index.js";
import { Separator } from "$lib/registry/ui/separator/index.js";

var root = $.from_html(`<!> <!>`, 1);

var root_1 = $.from_html(
	`<!> <!> <div class="grid gap-2"><div class="flex gap-2 leading-none font-medium">Trending up by 5.2% this month <!></div> <div class="text-muted-foreground">Showing total visitors for the last 6 months. This is just some random text to test the
						layout. It spans multiple lines and should wrap around.</div></div> <!>`,
	1
);

var root_2 = $.from_html(`<!> <!> <!> <!> <!> <!> <!> <!>`, 1);
var root_3 = $.from_html(`<!> <!> <!>`, 1);
var root_4 = $.from_html(`<!> <div class="flex flex-col gap-4 overflow-y-auto px-4 text-sm"><!> <form class="flex flex-col gap-4"><div class="flex flex-col gap-3"><!> <!></div> <div class="grid grid-cols-2 gap-4"><div class="flex flex-col gap-3"><!> <!></div> <div class="flex flex-col gap-3"><!> <!></div></div> <div class="grid grid-cols-2 gap-4"><div class="flex flex-col gap-3"><!> <!></div> <div class="flex flex-col gap-3"><!> <!></div></div> <div class="flex flex-col gap-3"><!> <!></div></form></div> <!>`, 1);

export default function Data_table_cell_viewer($$anchor, $$props) {
	$.push($$props, true);

	const chartData = [
		{ date: new Date("2024-01-01"), desktop: 186, mobile: 80 },
		{ date: new Date("2024-02-01"), desktop: 305, mobile: 200 },
		{ date: new Date("2024-03-01"), desktop: 237, mobile: 120 },
		{ date: new Date("2024-04-01"), desktop: 73, mobile: 190 },
		{ date: new Date("2024-05-01"), desktop: 209, mobile: 130 },
		{ date: new Date("2024-06-01"), desktop: 214, mobile: 140 }
	];

	const chartConfig = {
		desktop: { label: "Desktop", color: "var(--primary)" },
		mobile: { label: "Mobile", color: "var(--primary)" }
	};

	const isMobile = new IsMobile();
	let type = $.derived(() => $$props.item.type);
	let status = $.derived(() => $$props.item.status);
	let reviewer = $.derived(() => $$props.item.reviewer);
	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		let $0 = $.derived(() => isMobile.current ? "bottom" : "right");

		$.component(node, () => Drawer.Root, ($$anchor, Drawer_Root) => {
			Drawer_Root($$anchor, {
				get direction() {
					return $.get($0);
				},

				children: ($$anchor, $$slotProps) => {
					var fragment_1 = root();
					var node_1 = $.first_child(fragment_1);

					{
						const child = ($$anchor, $$arg0) => {
							let props = () => ($$arg0?.()).props;

							Button($$anchor, $.spread_props(
								{
									variant: 'link',
									class: 'w-fit px-0 text-start text-foreground'
								},
								props,
								{
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text = $.text();

										$.template_effect(() => $.set_text(text, $$props.item.header));
										$.append($$anchor, text);
									},
									$$slots: { default: true }
								}
							));
						};

						$.component(node_1, () => Drawer.Trigger, ($$anchor, Drawer_Trigger) => {
							Drawer_Trigger($$anchor, { child, $$slots: { child: true } });
						});
					}

					var node_2 = $.sibling(node_1, 2);

					$.component(node_2, () => Drawer.Content, ($$anchor, Drawer_Content) => {
						Drawer_Content($$anchor, {
							children: ($$anchor, $$slotProps) => {
								var fragment_4 = root_4();
								var node_3 = $.first_child(fragment_4);

								$.component(node_3, () => Drawer.Header, ($$anchor, Drawer_Header) => {
									Drawer_Header($$anchor, {
										class: 'gap-1',
										children: ($$anchor, $$slotProps) => {
											var fragment_5 = root();
											var node_4 = $.first_child(fragment_5);

											$.component(node_4, () => Drawer.Title, ($$anchor, Drawer_Title) => {
												Drawer_Title($$anchor, {
													children: ($$anchor, $$slotProps) => {
														$.next();

														var text_1 = $.text();

														$.template_effect(() => $.set_text(text_1, $$props.item.header));
														$.append($$anchor, text_1);
													},
													$$slots: { default: true }
												});
											});

											var node_5 = $.sibling(node_4, 2);

											$.component(node_5, () => Drawer.Description, ($$anchor, Drawer_Description) => {
												Drawer_Description($$anchor, {
													children: ($$anchor, $$slotProps) => {
														$.next();

														var text_2 = $.text('Showing total visitors for the last 6 months');

														$.append($$anchor, text_2);
													},
													$$slots: { default: true }
												});
											});

											$.append($$anchor, fragment_5);
										},
										$$slots: { default: true }
									});
								});

								var div = $.sibling(node_3, 2);
								var node_6 = $.child(div);

								{
									var consequent = ($$anchor) => {
										var fragment_7 = root_1();
										var node_7 = $.first_child(fragment_7);

										$.component(node_7, () => Chart.Container, ($$anchor, Chart_Container) => {
											Chart_Container($$anchor, {
												get config() {
													return chartConfig;
												},

												children: ($$anchor, $$slotProps) => {
													{
														const tooltip = ($$anchor) => {
															var fragment_9 = $.comment();
															var node_8 = $.first_child(fragment_9);

															$.component(node_8, () => Chart.Tooltip, ($$anchor, Chart_Tooltip) => {
																Chart_Tooltip($$anchor, {
																	labelFormatter: (v) => {
																		return v.toLocaleDateString("en-US", { month: "long" });
																	},
																	indicator: 'dot'
																});
															});

															$.append($$anchor, fragment_9);
														};

														let $0 = $.derived(scaleUtc);

														let $1 = $.derived(() => [
															{
																key: "mobile",
																label: "Mobile",
																color: chartConfig.mobile.color
															},

															{
																key: "desktop",
																label: "Desktop",
																color: chartConfig.desktop.color
															}
														]);

														let $2 = $.derived(() => ({
															area: {
																curve: curveNatural,
																fillOpacity: 0.4,
																line: { class: "stroke-1" },
																motion: "tween"
															},
															xAxis: {
																format: (v) => v.toLocaleDateString("en-US", { month: "short" })
															},
															yAxis: { ticks: [0, 300, 600] }
														}));

														AreaChart($$anchor, {
															get data() {
																return chartData;
															},
															x: 'date',
															get xScale() {
																return $.get($0);
															},
															yDomain: [0, 600],
															get series() {
																return $.get($1);
															},
															seriesLayout: 'stack',
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

										var node_9 = $.sibling(node_7, 2);

										Separator(node_9, {});

										var div_1 = $.sibling(node_9, 2);
										var div_2 = $.child(div_1);
										var node_10 = $.sibling($.child(div_2));

										TrendingUpIcon(node_10, { class: 'size-4' });
										$.reset(div_2);
										$.next(2);
										$.reset(div_1);

										var node_11 = $.sibling(div_1, 2);

										Separator(node_11, {});
										$.append($$anchor, fragment_7);
									};

									$.if(node_6, ($$render) => {
										if (!isMobile.current) $$render(consequent);
									});
								}

								var form = $.sibling(node_6, 2);
								var div_3 = $.child(form);
								var node_12 = $.child(div_3);

								Label(node_12, {
									for: 'header',
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_3 = $.text('Header');

										$.append($$anchor, text_3);
									},
									$$slots: { default: true }
								});

								var node_13 = $.sibling(node_12, 2);

								Input(node_13, {
									id: 'header',
									get value() {
										return $$props.item.header;
									}
								});

								$.reset(div_3);

								var div_4 = $.sibling(div_3, 2);
								var div_5 = $.child(div_4);
								var node_14 = $.child(div_5);

								Label(node_14, {
									for: 'type',
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_4 = $.text('Type');

										$.append($$anchor, text_4);
									},
									$$slots: { default: true }
								});

								var node_15 = $.sibling(node_14, 2);

								$.component(node_15, () => Select.Root, ($$anchor, Select_Root) => {
									Select_Root($$anchor, {
										type: 'single',
										get value() {
											return $.get(type);
										},

										set value($$value) {
											$.set(type, $$value);
										},

										children: ($$anchor, $$slotProps) => {
											var fragment_10 = root();
											var node_16 = $.first_child(fragment_10);

											$.component(node_16, () => Select.Trigger, ($$anchor, Select_Trigger) => {
												Select_Trigger($$anchor, {
													id: 'type',
													class: 'w-full',
													children: ($$anchor, $$slotProps) => {
														$.next();

														var text_5 = $.text();

														$.template_effect(() => $.set_text(text_5, $.get(type) ?? "Select a type"));
														$.append($$anchor, text_5);
													},
													$$slots: { default: true }
												});
											});

											var node_17 = $.sibling(node_16, 2);

											$.component(node_17, () => Select.Content, ($$anchor, Select_Content) => {
												Select_Content($$anchor, {
													children: ($$anchor, $$slotProps) => {
														var fragment_12 = root_2();
														var node_18 = $.first_child(fragment_12);

														$.component(node_18, () => Select.Item, ($$anchor, Select_Item) => {
															Select_Item($$anchor, {
																value: 'Table of Contents',
																children: ($$anchor, $$slotProps) => {
																	$.next();

																	var text_6 = $.text('Table of Contents');

																	$.append($$anchor, text_6);
																},
																$$slots: { default: true }
															});
														});

														var node_19 = $.sibling(node_18, 2);

														$.component(node_19, () => Select.Item, ($$anchor, Select_Item_1) => {
															Select_Item_1($$anchor, {
																value: 'Executive Summary',
																children: ($$anchor, $$slotProps) => {
																	$.next();

																	var text_7 = $.text('Executive Summary');

																	$.append($$anchor, text_7);
																},
																$$slots: { default: true }
															});
														});

														var node_20 = $.sibling(node_19, 2);

														$.component(node_20, () => Select.Item, ($$anchor, Select_Item_2) => {
															Select_Item_2($$anchor, {
																value: 'Technical Approach',
																children: ($$anchor, $$slotProps) => {
																	$.next();

																	var text_8 = $.text('Technical Approach');

																	$.append($$anchor, text_8);
																},
																$$slots: { default: true }
															});
														});

														var node_21 = $.sibling(node_20, 2);

														$.component(node_21, () => Select.Item, ($$anchor, Select_Item_3) => {
															Select_Item_3($$anchor, {
																value: 'Design',
																children: ($$anchor, $$slotProps) => {
																	$.next();

																	var text_9 = $.text('Design');

																	$.append($$anchor, text_9);
																},
																$$slots: { default: true }
															});
														});

														var node_22 = $.sibling(node_21, 2);

														$.component(node_22, () => Select.Item, ($$anchor, Select_Item_4) => {
															Select_Item_4($$anchor, {
																value: 'Capabilities',
																children: ($$anchor, $$slotProps) => {
																	$.next();

																	var text_10 = $.text('Capabilities');

																	$.append($$anchor, text_10);
																},
																$$slots: { default: true }
															});
														});

														var node_23 = $.sibling(node_22, 2);

														$.component(node_23, () => Select.Item, ($$anchor, Select_Item_5) => {
															Select_Item_5($$anchor, {
																value: 'Focus Documents',
																children: ($$anchor, $$slotProps) => {
																	$.next();

																	var text_11 = $.text('Focus Documents');

																	$.append($$anchor, text_11);
																},
																$$slots: { default: true }
															});
														});

														var node_24 = $.sibling(node_23, 2);

														$.component(node_24, () => Select.Item, ($$anchor, Select_Item_6) => {
															Select_Item_6($$anchor, {
																value: 'Narrative',
																children: ($$anchor, $$slotProps) => {
																	$.next();

																	var text_12 = $.text('Narrative');

																	$.append($$anchor, text_12);
																},
																$$slots: { default: true }
															});
														});

														var node_25 = $.sibling(node_24, 2);

														$.component(node_25, () => Select.Item, ($$anchor, Select_Item_7) => {
															Select_Item_7($$anchor, {
																value: 'Cover Page',
																children: ($$anchor, $$slotProps) => {
																	$.next();

																	var text_13 = $.text('Cover Page');

																	$.append($$anchor, text_13);
																},
																$$slots: { default: true }
															});
														});

														$.append($$anchor, fragment_12);
													},
													$$slots: { default: true }
												});
											});

											$.append($$anchor, fragment_10);
										},
										$$slots: { default: true }
									});
								});

								$.reset(div_5);

								var div_6 = $.sibling(div_5, 2);
								var node_26 = $.child(div_6);

								Label(node_26, {
									for: 'status',
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_14 = $.text('Status');

										$.append($$anchor, text_14);
									},
									$$slots: { default: true }
								});

								var node_27 = $.sibling(node_26, 2);

								$.component(node_27, () => Select.Root, ($$anchor, Select_Root_1) => {
									Select_Root_1($$anchor, {
										type: 'single',
										get value() {
											return $.get(status);
										},

										set value($$value) {
											$.set(status, $$value);
										},

										children: ($$anchor, $$slotProps) => {
											var fragment_13 = root();
											var node_28 = $.first_child(fragment_13);

											$.component(node_28, () => Select.Trigger, ($$anchor, Select_Trigger_1) => {
												Select_Trigger_1($$anchor, {
													id: 'status',
													class: 'w-full',
													children: ($$anchor, $$slotProps) => {
														$.next();

														var text_15 = $.text();

														$.template_effect(() => $.set_text(text_15, $.get(status) ?? "Select a status"));
														$.append($$anchor, text_15);
													},
													$$slots: { default: true }
												});
											});

											var node_29 = $.sibling(node_28, 2);

											$.component(node_29, () => Select.Content, ($$anchor, Select_Content_1) => {
												Select_Content_1($$anchor, {
													children: ($$anchor, $$slotProps) => {
														var fragment_15 = root_3();
														var node_30 = $.first_child(fragment_15);

														$.component(node_30, () => Select.Item, ($$anchor, Select_Item_8) => {
															Select_Item_8($$anchor, {
																value: 'Done',
																children: ($$anchor, $$slotProps) => {
																	$.next();

																	var text_16 = $.text('Done');

																	$.append($$anchor, text_16);
																},
																$$slots: { default: true }
															});
														});

														var node_31 = $.sibling(node_30, 2);

														$.component(node_31, () => Select.Item, ($$anchor, Select_Item_9) => {
															Select_Item_9($$anchor, {
																value: 'In Progress',
																children: ($$anchor, $$slotProps) => {
																	$.next();

																	var text_17 = $.text('In Progress');

																	$.append($$anchor, text_17);
																},
																$$slots: { default: true }
															});
														});

														var node_32 = $.sibling(node_31, 2);

														$.component(node_32, () => Select.Item, ($$anchor, Select_Item_10) => {
															Select_Item_10($$anchor, {
																value: 'Not Started',
																children: ($$anchor, $$slotProps) => {
																	$.next();

																	var text_18 = $.text('Not Started');

																	$.append($$anchor, text_18);
																},
																$$slots: { default: true }
															});
														});

														$.append($$anchor, fragment_15);
													},
													$$slots: { default: true }
												});
											});

											$.append($$anchor, fragment_13);
										},
										$$slots: { default: true }
									});
								});

								$.reset(div_6);
								$.reset(div_4);

								var div_7 = $.sibling(div_4, 2);
								var div_8 = $.child(div_7);
								var node_33 = $.child(div_8);

								Label(node_33, {
									for: 'target',
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_19 = $.text('Target');

										$.append($$anchor, text_19);
									},
									$$slots: { default: true }
								});

								var node_34 = $.sibling(node_33, 2);

								Input(node_34, {
									id: 'target',
									get value() {
										return $$props.item.target;
									}
								});

								$.reset(div_8);

								var div_9 = $.sibling(div_8, 2);
								var node_35 = $.child(div_9);

								Label(node_35, {
									for: 'limit',
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_20 = $.text('Limit');

										$.append($$anchor, text_20);
									},
									$$slots: { default: true }
								});

								var node_36 = $.sibling(node_35, 2);

								Input(node_36, {
									id: 'limit',
									get value() {
										return $$props.item.limit;
									}
								});

								$.reset(div_9);
								$.reset(div_7);

								var div_10 = $.sibling(div_7, 2);
								var node_37 = $.child(div_10);

								Label(node_37, {
									for: 'reviewer',
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_21 = $.text('Reviewer');

										$.append($$anchor, text_21);
									},
									$$slots: { default: true }
								});

								var node_38 = $.sibling(node_37, 2);

								$.component(node_38, () => Select.Root, ($$anchor, Select_Root_2) => {
									Select_Root_2($$anchor, {
										type: 'single',
										get value() {
											return $.get(reviewer);
										},

										set value($$value) {
											$.set(reviewer, $$value);
										},

										children: ($$anchor, $$slotProps) => {
											var fragment_16 = root();
											var node_39 = $.first_child(fragment_16);

											$.component(node_39, () => Select.Trigger, ($$anchor, Select_Trigger_2) => {
												Select_Trigger_2($$anchor, {
													id: 'reviewer',
													class: 'w-full',
													children: ($$anchor, $$slotProps) => {
														$.next();

														var text_22 = $.text();

														$.template_effect(() => $.set_text(text_22, $.get(reviewer) ?? "Select a reviewer"));
														$.append($$anchor, text_22);
													},
													$$slots: { default: true }
												});
											});

											var node_40 = $.sibling(node_39, 2);

											$.component(node_40, () => Select.Content, ($$anchor, Select_Content_2) => {
												Select_Content_2($$anchor, {
													children: ($$anchor, $$slotProps) => {
														var fragment_18 = root_3();
														var node_41 = $.first_child(fragment_18);

														$.component(node_41, () => Select.Item, ($$anchor, Select_Item_11) => {
															Select_Item_11($$anchor, {
																value: 'Eddie Lake',
																children: ($$anchor, $$slotProps) => {
																	$.next();

																	var text_23 = $.text('Eddie Lake');

																	$.append($$anchor, text_23);
																},
																$$slots: { default: true }
															});
														});

														var node_42 = $.sibling(node_41, 2);

														$.component(node_42, () => Select.Item, ($$anchor, Select_Item_12) => {
															Select_Item_12($$anchor, {
																value: 'Jamik Tashpulatov',
																children: ($$anchor, $$slotProps) => {
																	$.next();

																	var text_24 = $.text('Jamik Tashpulatov');

																	$.append($$anchor, text_24);
																},
																$$slots: { default: true }
															});
														});

														var node_43 = $.sibling(node_42, 2);

														$.component(node_43, () => Select.Item, ($$anchor, Select_Item_13) => {
															Select_Item_13($$anchor, {
																value: 'Emily Whalen',
																children: ($$anchor, $$slotProps) => {
																	$.next();

																	var text_25 = $.text('Emily Whalen');

																	$.append($$anchor, text_25);
																},
																$$slots: { default: true }
															});
														});

														$.append($$anchor, fragment_18);
													},
													$$slots: { default: true }
												});
											});

											$.append($$anchor, fragment_16);
										},
										$$slots: { default: true }
									});
								});

								$.reset(div_10);
								$.reset(form);
								$.reset(div);

								var node_44 = $.sibling(div, 2);

								$.component(node_44, () => Drawer.Footer, ($$anchor, Drawer_Footer) => {
									Drawer_Footer($$anchor, {
										children: ($$anchor, $$slotProps) => {
											var fragment_19 = root();
											var node_45 = $.first_child(fragment_19);

											Button(node_45, {
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_26 = $.text('Submit');

													$.append($$anchor, text_26);
												},
												$$slots: { default: true }
											});

											var node_46 = $.sibling(node_45, 2);

											{
												const child = ($$anchor, $$arg0) => {
													let props = () => ($$arg0?.()).props;

													Button($$anchor, $.spread_props({ variant: 'outline' }, props, {
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_27 = $.text('Done');

															$.append($$anchor, text_27);
														},
														$$slots: { default: true }
													}));
												};

												$.component(node_46, () => Drawer.Close, ($$anchor, Drawer_Close) => {
													Drawer_Close($$anchor, { child, $$slots: { child: true } });
												});
											}

											$.append($$anchor, fragment_19);
										},
										$$slots: { default: true }
									});
								});

								$.append($$anchor, fragment_4);
							},
							$$slots: { default: true }
						});
					});

					$.append($$anchor, fragment_1);
				},
				$$slots: { default: true }
			});
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}