import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { scaleBand } from "d3-scale";
import { BarChart } from "layerchart";
import * as Card from "$lib/registry/ui/card/index.js";
import * as Chart from "$lib/registry/ui/chart/index.js";
import * as Item from "$lib/registry/ui/item/index.js";
import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
import { Button } from "$lib/registry/ui/button/index.js";

var root = $.from_html(`<!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);
var root_2 = $.from_html(`<!> <!> <span class="hidden text-sm font-semibold tabular-nums md:block"> </span>`, 1);

export default function Dividend_income($$anchor, $$props) {
	$.push($$props, true);

	const HOLDINGS = [
		{
			name: "Vanguard VIG",
			shares: "450 Shares",
			amount: "$1,842.10",
			data: [
				{ q: "Q1", value: 380 },
				{ q: "Q2", value: 420 },
				{ q: "Q3", value: 390 },
				{ q: "Q4", value: 652 }
			]
		},

		{
			name: "S&P 500 VOO",
			shares: "112 Shares",
			amount: "$928.40",
			data: [
				{ q: "Q1", value: 180 },
				{ q: "Q2", value: 210 },
				{ q: "Q3", value: 320 },
				{ q: "Q4", value: 218 }
			]
		},

		{
			name: "Apple AAPL",
			shares: "85 Shares",
			amount: "$340.00",
			data: [
				{ q: "Q1", value: 60 },
				{ q: "Q2", value: 70 },
				{ q: "Q3", value: 120 },
				{ q: "Q4", value: 90 }
			]
		},

		{
			name: "Realty Income",
			shares: "320 Shares",
			amount: "$1,139.50",
			data: [
				{ q: "Q1", value: 240 },
				{ q: "Q2", value: 260 },
				{ q: "Q3", value: 280 },
				{ q: "Q4", value: 360 }
			]
		}
	];

	const miniChartConfig = { value: { label: "Dividend", color: "var(--chart-2)" } };
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
							var fragment_2 = root();
							var node_2 = $.first_child(fragment_2);

							$.component(node_2, () => Card.Title, ($$anchor, Card_Title) => {
								Card_Title($$anchor, {
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text = $.text('Q2 Dividend Income');

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

										var text_1 = $.text('Quarterly dividend payouts across your portfolio holdings.');

										$.append($$anchor, text_1);
									},
									$$slots: { default: true }
								});
							});

							var node_4 = $.sibling(node_3, 2);

							$.component(node_4, () => Card.Action, ($$anchor, Card_Action) => {
								Card_Action($$anchor, {
									children: ($$anchor, $$slotProps) => {
										Button($$anchor, {
											variant: 'ghost',
											size: 'icon-sm',
											class: 'bg-muted',
											children: ($$anchor, $$slotProps) => {
												IconPlaceholder($$anchor, {
													lucide: 'XIcon',
													tabler: 'IconX',
													hugeicons: 'Cancel01Icon',
													phosphor: 'XIcon',
													remixicon: 'RiCloseLine'
												});
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
							var fragment_5 = $.comment();
							var node_6 = $.first_child(fragment_5);

							$.component(node_6, () => Item.Group, ($$anchor, Item_Group) => {
								Item_Group($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_6 = $.comment();
										var node_7 = $.first_child(fragment_6);

										$.each(node_7, 17, () => HOLDINGS, (holding) => holding.name, ($$anchor, holding) => {
											var fragment_7 = $.comment();
											var node_8 = $.first_child(fragment_7);

											$.component(node_8, () => Item.Root, ($$anchor, Item_Root) => {
												Item_Root($$anchor, {
													variant: 'muted',
													children: ($$anchor, $$slotProps) => {
														var fragment_8 = root_2();
														var node_9 = $.first_child(fragment_8);

														$.component(node_9, () => Item.Content, ($$anchor, Item_Content) => {
															Item_Content($$anchor, {
																children: ($$anchor, $$slotProps) => {
																	var fragment_9 = root_1();
																	var node_10 = $.first_child(fragment_9);

																	$.component(node_10, () => Item.Title, ($$anchor, Item_Title) => {
																		Item_Title($$anchor, {
																			children: ($$anchor, $$slotProps) => {
																				$.next();

																				var text_2 = $.text();

																				$.template_effect(() => $.set_text(text_2, $.get(holding).name));
																				$.append($$anchor, text_2);
																			},
																			$$slots: { default: true }
																		});
																	});

																	var node_11 = $.sibling(node_10, 2);

																	$.component(node_11, () => Item.Description, ($$anchor, Item_Description) => {
																		Item_Description($$anchor, {
																			children: ($$anchor, $$slotProps) => {
																				$.next();

																				var text_3 = $.text();

																				$.template_effect(() => $.set_text(text_3, $.get(holding).shares));
																				$.append($$anchor, text_3);
																			},
																			$$slots: { default: true }
																		});
																	});

																	$.append($$anchor, fragment_9);
																},
																$$slots: { default: true }
															});
														});

														var node_12 = $.sibling(node_9, 2);

														$.component(node_12, () => Chart.Container, ($$anchor, Chart_Container) => {
															Chart_Container($$anchor, {
																get config() {
																	return miniChartConfig;
																},
																class: 'hidden h-8 w-24 md:block [&_[data-slot=chart]]:h-full',
																children: ($$anchor, $$slotProps) => {
																	{
																		const tooltip = ($$anchor) => {
																			var fragment_13 = $.comment();
																			var node_13 = $.first_child(fragment_13);

																			$.component(node_13, () => Chart.Tooltip, ($$anchor, Chart_Tooltip) => {
																				Chart_Tooltip($$anchor, { hideLabel: true });
																			});

																			$.append($$anchor, fragment_13);
																		};

																		let $0 = $.derived(() => scaleBand().padding(0.2));

																		let $1 = $.derived(() => [
																			{
																				key: "value",
																				label: miniChartConfig.value.label,
																				color: miniChartConfig.value.color
																			}
																		]);

																		BarChart($$anchor, {
																			get data() {
																				return $.get(holding).data;
																			},
																			x: 'q',
																			get xScale() {
																				return $.get($0);
																			},
																			axis: false,
																			rule: false,
																			get series() {
																				return $.get($1);
																			},
																			props: { bars: { rounded: "top" } },
																			tooltip,
																			$$slots: { tooltip: true }
																		});
																	}
																},
																$$slots: { default: true }
															});
														});

														var span = $.sibling(node_12, 2);
														var text_4 = $.only_child(span, true);

														$.template_effect(() => $.set_text(text_4, $.get(holding).amount));
														$.append($$anchor, fragment_8);
													},
													$$slots: { default: true }
												});
											});

											$.append($$anchor, fragment_7);
										});

										$.append($$anchor, fragment_6);
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_5);
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