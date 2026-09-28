import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { scaleBand } from "d3-scale";
import { BarChart } from "layerchart";
import * as Card from "$lib/registry/ui/card/index.js";
import * as Chart from "$lib/registry/ui/chart/index.js";
import * as Item from "$lib/registry/ui/item/index.js";
import { Badge } from "$lib/registry/ui/badge/index.js";
import { Button } from "$lib/registry/ui/button/index.js";

var root = $.from_html(`<!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <span class="cn-font-heading text-lg font-semibold">May 25, 2024</span> <span class="text-sm text-muted-foreground">$1,000 scheduled</span>`, 1);
var root_2 = $.from_html(`<!> <span class="cn-font-heading text-lg font-semibold">Accelerated</span> <span class="text-sm text-muted-foreground">Recurring weekly</span>`, 1);
var root_3 = $.from_html(`<div class="grid w-full grid-cols-1 gap-3 md:grid-cols-2"><!> <!></div> <!>`, 1);

export default function Contribution_history($$anchor, $$props) {
	$.push($$props, true);

	const chartData = [
		{ month: "Dec", amount: 800 },
		{ month: "Jan", amount: 1100 },
		{ month: "Feb", amount: 900 },
		{ month: "Mar", amount: 1300 },
		{ month: "Apr", amount: 750 },
		{ month: "May", amount: 1400 }
	];

	const chartConfig = { amount: { label: "Contribution", color: "var(--chart-2)" } };
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

										var text = $.text('Contribution History');

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

										var text_1 = $.text('Last 6 months of activity');

										$.append($$anchor, text_1);
									},
									$$slots: { default: true }
								});
							});

							var node_4 = $.sibling(node_3, 2);

							$.component(node_4, () => Card.Action, ($$anchor, Card_Action) => {
								Card_Action($$anchor, {
									children: ($$anchor, $$slotProps) => {
										Badge($$anchor, {
											variant: 'secondary',
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_2 = $.text('+12% vs last month');

												$.append($$anchor, text_2);
											},
											$$slots: { default: true }
										});
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
						children: ($$anchor, $$slotProps) => {
							var fragment_4 = $.comment();
							var node_6 = $.first_child(fragment_4);

							$.component(node_6, () => Chart.Container, ($$anchor, Chart_Container) => {
								Chart_Container($$anchor, {
									get config() {
										return chartConfig;
									},
									class: 'h-[200px] w-full',
									children: ($$anchor, $$slotProps) => {
										{
											const tooltip = ($$anchor) => {
												var fragment_6 = $.comment();
												var node_7 = $.first_child(fragment_6);

												$.component(node_7, () => Chart.Tooltip, ($$anchor, Chart_Tooltip) => {
													Chart_Tooltip($$anchor, { hideLabel: true, class: 'min-w-40' });
												});

												$.append($$anchor, fragment_6);
											};

											let $0 = $.derived(() => scaleBand().padding(0.25));

											let $1 = $.derived(() => [
												{
													key: "amount",
													label: chartConfig.amount.label,
													color: chartConfig.amount.color
												}
											]);

											BarChart($$anchor, {
												get data() {
													return chartData;
												},
												x: 'month',
												get xScale() {
													return $.get($0);
												},
												axis: 'x',
												rule: false,
												get series() {
													return $.get($1);
												},

												props: {
													bars: { stroke: "none", rounded: "top" },
													xAxis: { tickLength: 0 }
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

				var node_8 = $.sibling(node_5, 2);

				$.component(node_8, () => Card.Footer, ($$anchor, Card_Footer) => {
					Card_Footer($$anchor, {
						class: 'flex-col gap-4',
						children: ($$anchor, $$slotProps) => {
							var fragment_7 = root_3();
							var div = $.first_child(fragment_7);
							var node_9 = $.child(div);

							$.component(node_9, () => Item.Root, ($$anchor, Item_Root) => {
								Item_Root($$anchor, {
									variant: 'muted',
									class: 'flex-col items-stretch',
									children: ($$anchor, $$slotProps) => {
										var fragment_8 = $.comment();
										var node_10 = $.first_child(fragment_8);

										$.component(node_10, () => Item.Content, ($$anchor, Item_Content) => {
											Item_Content($$anchor, {
												class: 'gap-1',
												children: ($$anchor, $$slotProps) => {
													var fragment_9 = root_1();
													var node_11 = $.first_child(fragment_9);

													$.component(node_11, () => Item.Description, ($$anchor, Item_Description) => {
														Item_Description($$anchor, {
															class: 'text-xs font-medium tracking-wider text-muted-foreground uppercase',
															children: ($$anchor, $$slotProps) => {
																$.next();

																var text_3 = $.text('Upcoming');

																$.append($$anchor, text_3);
															},
															$$slots: { default: true }
														});
													});

													$.next(4);
													$.append($$anchor, fragment_9);
												},
												$$slots: { default: true }
											});
										});

										$.append($$anchor, fragment_8);
									},
									$$slots: { default: true }
								});
							});

							var node_12 = $.sibling(node_9, 2);

							$.component(node_12, () => Item.Root, ($$anchor, Item_Root_1) => {
								Item_Root_1($$anchor, {
									variant: 'muted',
									class: 'flex-col items-stretch',
									children: ($$anchor, $$slotProps) => {
										var fragment_10 = $.comment();
										var node_13 = $.first_child(fragment_10);

										$.component(node_13, () => Item.Content, ($$anchor, Item_Content_1) => {
											Item_Content_1($$anchor, {
												class: 'gap-1',
												children: ($$anchor, $$slotProps) => {
													var fragment_11 = root_2();
													var node_14 = $.first_child(fragment_11);

													$.component(node_14, () => Item.Description, ($$anchor, Item_Description_1) => {
														Item_Description_1($$anchor, {
															class: 'text-xs font-medium tracking-wider text-muted-foreground uppercase',
															children: ($$anchor, $$slotProps) => {
																$.next();

																var text_4 = $.text('Auto-Save Plan');

																$.append($$anchor, text_4);
															},
															$$slots: { default: true }
														});
													});

													$.next(4);
													$.append($$anchor, fragment_11);
												},
												$$slots: { default: true }
											});
										});

										$.append($$anchor, fragment_10);
									},
									$$slots: { default: true }
								});
							});

							$.reset(div);

							var node_15 = $.sibling(div, 2);

							Button(node_15, {
								class: 'w-full',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_5 = $.text('View Full Report');

									$.append($$anchor, text_5);
								},
								$$slots: { default: true }
							});

							$.append($$anchor, fragment_7);
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