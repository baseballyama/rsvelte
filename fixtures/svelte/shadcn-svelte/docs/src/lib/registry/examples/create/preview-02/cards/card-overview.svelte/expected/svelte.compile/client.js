import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { scaleBand } from "d3-scale";
import { BarChart } from "layerchart";
import * as Card from "$lib/registry/ui/card/index.js";
import * as Chart from "$lib/registry/ui/chart/index.js";
import { Badge } from "$lib/registry/ui/badge/index.js";
import { Button } from "$lib/registry/ui/button/index.js";

var root = $.from_html(`<!> <!> <!>`, 1);
var root_1 = $.from_html(`<div class="flex flex-col gap-1"><!> <!></div> <!>`, 1);
var root_2 = $.from_html(`<div class="flex items-center justify-between"><!> <!></div> <!>`, 1);
var root_3 = $.from_html(`<div class="grid grid-cols-2 gap-3"><!> <!> <!></div>`);

export default function Card_overview($$anchor, $$props) {
	$.push($$props, true);

	const activityData = [
		{ month: "Jan", amount: 40 },
		{ month: "Feb", amount: 55 },
		{ month: "Mar", amount: 35 },
		{ month: "Apr", amount: 60 },
		{ month: "May", amount: 45 },
		{ month: "Jun", amount: 50 },
		{ month: "Jul", amount: 65 },
		{ month: "Aug", amount: 40 },
		{ month: "Sep", amount: 55 },
		{ month: "Oct", amount: 70 },
		{ month: "Nov", amount: 45 },
		{ month: "Dec", amount: 80 }
	];

	const chartConfig = { amount: { label: "Activity", color: "var(--chart-2)" } };
	var div = root_3();
	var node = $.child(div);

	$.component(node, () => Card.Root, ($$anchor, Card_Root) => {
		Card_Root($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var fragment = $.comment();
				var node_1 = $.first_child(fragment);

				$.component(node_1, () => Card.Content, ($$anchor, Card_Content) => {
					Card_Content($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_1 = root();
							var node_2 = $.first_child(fragment_1);

							$.component(node_2, () => Card.Description, ($$anchor, Card_Description) => {
								Card_Description($$anchor, {
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text = $.text('Card Balance');

										$.append($$anchor, text);
									},
									$$slots: { default: true }
								});
							});

							var node_3 = $.sibling(node_2, 2);

							$.component(node_3, () => Card.Title, ($$anchor, Card_Title) => {
								Card_Title($$anchor, {
									class: 'text-2xl tabular-nums',
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_1 = $.text('US$12.94');

										$.append($$anchor, text_1);
									},
									$$slots: { default: true }
								});
							});

							var node_4 = $.sibling(node_3, 2);

							$.component(node_4, () => Card.Description, ($$anchor, Card_Description_1) => {
								Card_Description_1($$anchor, {
									class: 'tabular-nums',
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_2 = $.text('US$11,337.06 Available');

										$.append($$anchor, text_2);
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
			},
			$$slots: { default: true }
		});
	});

	var node_5 = $.sibling(node, 2);

	$.component(node_5, () => Card.Root, ($$anchor, Card_Root_1) => {
		Card_Root_1($$anchor, {
			class: 'flex flex-col justify-between',
			children: ($$anchor, $$slotProps) => {
				var fragment_2 = $.comment();
				var node_6 = $.first_child(fragment_2);

				$.component(node_6, () => Card.Content, ($$anchor, Card_Content_1) => {
					Card_Content_1($$anchor, {
						class: 'flex flex-1 flex-col justify-between',
						children: ($$anchor, $$slotProps) => {
							var fragment_3 = root_1();
							var div_1 = $.first_child(fragment_3);
							var node_7 = $.child(div_1);

							$.component(node_7, () => Card.Description, ($$anchor, Card_Description_2) => {
								Card_Description_2($$anchor, {
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_3 = $.text('Payment Due');

										$.append($$anchor, text_3);
									},
									$$slots: { default: true }
								});
							});

							var node_8 = $.sibling(node_7, 2);

							$.component(node_8, () => Card.Title, ($$anchor, Card_Title_1) => {
								Card_Title_1($$anchor, {
									class: 'text-2xl',
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_4 = $.text('1 Apr');

										$.append($$anchor, text_4);
									},
									$$slots: { default: true }
								});
							});

							$.reset(div_1);

							var node_9 = $.sibling(div_1, 2);

							Button(node_9, {
								variant: 'outline',
								size: 'sm',
								class: 'mt-3 w-full',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_5 = $.text('Pay Early');

									$.append($$anchor, text_5);
								},
								$$slots: { default: true }
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

	var node_10 = $.sibling(node_5, 2);

	$.component(node_10, () => Card.Root, ($$anchor, Card_Root_2) => {
		Card_Root_2($$anchor, {
			class: 'col-span-2',
			children: ($$anchor, $$slotProps) => {
				var fragment_4 = $.comment();
				var node_11 = $.first_child(fragment_4);

				$.component(node_11, () => Card.Content, ($$anchor, Card_Content_2) => {
					Card_Content_2($$anchor, {
						class: 'flex flex-col gap-2',
						children: ($$anchor, $$slotProps) => {
							var fragment_5 = root_2();
							var div_2 = $.first_child(fragment_5);
							var node_12 = $.child(div_2);

							$.component(node_12, () => Card.Description, ($$anchor, Card_Description_3) => {
								Card_Description_3($$anchor, {
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_6 = $.text('Yearly Activity');

										$.append($$anchor, text_6);
									},
									$$slots: { default: true }
								});
							});

							var node_13 = $.sibling(node_12, 2);

							Badge(node_13, {
								variant: 'secondary',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_7 = $.text('+US$0.25 Daily Cash');

									$.append($$anchor, text_7);
								},
								$$slots: { default: true }
							});

							$.reset(div_2);

							var node_14 = $.sibling(div_2, 2);

							$.component(node_14, () => Chart.Container, ($$anchor, Chart_Container) => {
								Chart_Container($$anchor, {
									get config() {
										return chartConfig;
									},
									class: 'h-20 w-full',
									children: ($$anchor, $$slotProps) => {
										{
											const tooltip = ($$anchor) => {
												var fragment_7 = $.comment();
												var node_15 = $.first_child(fragment_7);

												$.component(node_15, () => Chart.Tooltip, ($$anchor, Chart_Tooltip) => {
													Chart_Tooltip($$anchor, { hideLabel: true });
												});

												$.append($$anchor, fragment_7);
											};

											let $0 = $.derived(() => scaleBand().padding(0.2));

											let $1 = $.derived(() => [
												{
													key: "amount",
													label: chartConfig.amount.label,
													color: chartConfig.amount.color
												}
											]);

											BarChart($$anchor, {
												get data() {
													return activityData;
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
													bars: { rounded: "top" },
													xAxis: {
														format: (v) => String(v).slice(0, 1),
														tickLength: 0,
														class: "text-[10px]"
													}
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

				$.append($$anchor, fragment_4);
			},
			$$slots: { default: true }
		});
	});

	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}