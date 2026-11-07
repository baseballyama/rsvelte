import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { scaleBand } from "d3-scale";
import { curveNatural } from "d3-shape";
import { AreaChart } from "layerchart";
import { tick } from "svelte";
import * as Card from "$lib/registry/ui/card/index.js";
import * as Chart from "$lib/registry/ui/chart/index.js";
import * as Command from "$lib/registry/ui/command/index.js";
import * as Field from "$lib/registry/ui/field/index.js";
import * as Popover from "$lib/registry/ui/popover/index.js";
import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
import { Button } from "$lib/registry/ui/button/index.js";
import { Separator } from "$lib/registry/ui/separator/index.js";

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(` <!>`, 1);
var root_2 = $.from_html(`<!> <!> <!>`, 1);

export default function Stock_performance($$anchor, $$props) {
	$.push($$props, true);

	const TICKERS = ["VOO", "VIG", "AAPL", "MSFT", "GOOGL", "AMZN", "TSLA"];

	const CHART_DATA = {
		VOO: [
			{ month: "Jan", price: 412 },
			{ month: "Feb", price: 438 },
			{ month: "Mar", price: 395 },
			{ month: "Apr", price: 450 },
			{ month: "May", price: 420 },
			{ month: "Jun", price: 462 }
		],
		AAPL: [
			{ month: "Jan", price: 185 },
			{ month: "Feb", price: 210 },
			{ month: "Mar", price: 172 },
			{ month: "Apr", price: 198 },
			{ month: "May", price: 178 },
			{ month: "Jun", price: 215 }
		]
	};

	const DEFAULT_DATA = [
		{ month: "Jan", price: 100 },
		{ month: "Feb", price: 118 },
		{ month: "Mar", price: 95 },
		{ month: "Apr", price: 125 },
		{ month: "May", price: 108 },
		{ month: "Jun", price: 130 }
	];

	const chartConfig = { price: { label: "Price", color: "var(--chart-1)" } };
	let ticker = $.state("VOO");
	let open = $.state(false);
	let triggerRef = $.state(null);
	const data = $.derived(() => CHART_DATA[$.get(ticker)] ?? DEFAULT_DATA);

	function closeAndFocus() {
		$.set(open, false);
		tick().then(() => $.get(triggerRef)?.focus());
	}

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

										var text = $.text('Stock Performance');

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

										var text_1 = $.text('6-month price history.');

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
						class: 'flex flex-col gap-4',
						children: ($$anchor, $$slotProps) => {
							var fragment_3 = root_2();
							var node_5 = $.first_child(fragment_3);

							$.component(node_5, () => Field.Group, ($$anchor, Field_Group) => {
								Field_Group($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_4 = $.comment();
										var node_6 = $.first_child(fragment_4);

										$.component(node_6, () => Field.Field, ($$anchor, Field_Field) => {
											Field_Field($$anchor, {
												children: ($$anchor, $$slotProps) => {
													var fragment_5 = root();
													var node_7 = $.first_child(fragment_5);

													$.component(node_7, () => Field.Label, ($$anchor, Field_Label) => {
														Field_Label($$anchor, {
															for: 'ticker-select',
															children: ($$anchor, $$slotProps) => {
																$.next();

																var text_2 = $.text('Ticker');

																$.append($$anchor, text_2);
															},
															$$slots: { default: true }
														});
													});

													var node_8 = $.sibling(node_7, 2);

													$.component(node_8, () => Popover.Root, ($$anchor, Popover_Root) => {
														Popover_Root($$anchor, {
															get open() {
																return $.get(open);
															},

															set open($$value) {
																$.set(open, $$value, true);
															},

															children: ($$anchor, $$slotProps) => {
																var fragment_6 = root();
																var node_9 = $.first_child(fragment_6);

																{
																	const child = ($$anchor, $$arg0) => {
																		let props = () => ($$arg0?.()).props;

																		Button($$anchor, $.spread_props(props, {
																			variant: 'outline',
																			id: 'ticker-select',
																			class: 'w-full justify-between bg-muted font-normal',
																			role: 'combobox',
																			get 'aria-expanded'() {
																				return $.get(open);
																			},

																			children: ($$anchor, $$slotProps) => {
																				$.next();

																				var fragment_8 = root_1();
																				var text_3 = $.first_child(fragment_8);
																				var node_10 = $.sibling(text_3);

																				IconPlaceholder(node_10, {
																					lucide: 'ChevronDownIcon',
																					tabler: 'IconChevronDown',
																					hugeicons: 'ArrowDown01Icon',
																					phosphor: 'CaretDownIcon',
																					remixicon: 'RiArrowDownSLine',
																					class: 'size-4 text-muted-foreground opacity-50'
																				});

																				$.template_effect(() => $.set_text(text_3, `${$.get(ticker) ?? ''} `));
																				$.append($$anchor, fragment_8);
																			},
																			$$slots: { default: true }
																		}));
																	};

																	$.component(node_9, () => Popover.Trigger, ($$anchor, Popover_Trigger) => {
																		Popover_Trigger($$anchor, {
																			get ref() {
																				return $.get(triggerRef);
																			},

																			set ref($$value) {
																				$.set(triggerRef, $$value, true);
																			},
																			child,
																			$$slots: { child: true }
																		});
																	});
																}

																var node_11 = $.sibling(node_9, 2);

																$.component(node_11, () => Popover.Content, ($$anchor, Popover_Content) => {
																	Popover_Content($$anchor, {
																		class: 'w-[var(--bits-popover-anchor-width)] p-0',
																		align: 'start',
																		children: ($$anchor, $$slotProps) => {
																			var fragment_9 = $.comment();
																			var node_12 = $.first_child(fragment_9);

																			$.component(node_12, () => Command.Root, ($$anchor, Command_Root) => {
																				Command_Root($$anchor, {
																					children: ($$anchor, $$slotProps) => {
																						var fragment_10 = root();
																						var node_13 = $.first_child(fragment_10);

																						$.component(node_13, () => Command.Input, ($$anchor, Command_Input) => {
																							Command_Input($$anchor, { placeholder: 'Search ticker...' });
																						});

																						var node_14 = $.sibling(node_13, 2);

																						$.component(node_14, () => Command.List, ($$anchor, Command_List) => {
																							Command_List($$anchor, {
																								children: ($$anchor, $$slotProps) => {
																									var fragment_11 = root();
																									var node_15 = $.first_child(fragment_11);

																									$.component(node_15, () => Command.Empty, ($$anchor, Command_Empty) => {
																										Command_Empty($$anchor, {
																											children: ($$anchor, $$slotProps) => {
																												$.next();

																												var text_4 = $.text('No tickers found.');

																												$.append($$anchor, text_4);
																											},
																											$$slots: { default: true }
																										});
																									});

																									var node_16 = $.sibling(node_15, 2);

																									$.component(node_16, () => Command.Group, ($$anchor, Command_Group) => {
																										Command_Group($$anchor, {
																											children: ($$anchor, $$slotProps) => {
																												var fragment_12 = $.comment();
																												var node_17 = $.first_child(fragment_12);

																												$.each(node_17, 16, () => TICKERS, (t) => t, ($$anchor, t) => {
																													var fragment_13 = $.comment();
																													var node_18 = $.first_child(fragment_13);

																													$.component(node_18, () => Command.Item, ($$anchor, Command_Item) => {
																														Command_Item($$anchor, {
																															get value() {
																																return t;
																															},

																															onSelect: () => {
																																$.set(ticker, t, true);
																																closeAndFocus();
																															},

																															children: ($$anchor, $$slotProps) => {
																																$.next();

																																var text_5 = $.text();

																																$.template_effect(() => $.set_text(text_5, t));
																																$.append($$anchor, text_5);
																															},
																															$$slots: { default: true }
																														});
																													});

																													$.append($$anchor, fragment_13);
																												});

																												$.append($$anchor, fragment_12);
																											},
																											$$slots: { default: true }
																										});
																									});

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

																			$.append($$anchor, fragment_9);
																		},
																		$$slots: { default: true }
																	});
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

										$.append($$anchor, fragment_4);
									},
									$$slots: { default: true }
								});
							});

							var node_19 = $.sibling(node_5, 2);

							Separator(node_19, {});

							var node_20 = $.sibling(node_19, 2);

							$.component(node_20, () => Chart.Container, ($$anchor, Chart_Container) => {
								Chart_Container($$anchor, {
									get config() {
										return chartConfig;
									},
									class: 'h-[200px] w-full',
									children: ($$anchor, $$slotProps) => {
										{
											const tooltip = ($$anchor) => {
												var fragment_16 = $.comment();
												var node_21 = $.first_child(fragment_16);

												$.component(node_21, () => Chart.Tooltip, ($$anchor, Chart_Tooltip) => {
													Chart_Tooltip($$anchor, { indicator: 'line', hideLabel: true });
												});

												$.append($$anchor, fragment_16);
											};

											let $0 = $.derived(scaleBand);

											let $1 = $.derived(() => [
												{
													key: "price",
													label: chartConfig.price.label,
													color: chartConfig.price.color
												}
											]);

											let $2 = $.derived(() => ({
												area: { curve: curveNatural, "fill-opacity": 0.25, motion: "tween" },
												xAxis: { format: (d) => d.slice(0, 3), tickLength: 0 }
											}));

											AreaChart($$anchor, {
												get data() {
													return $.get(data);
												},
												x: 'month',
												get xScale() {
													return $.get($0);
												},
												axis: 'x',
												get series() {
													return $.get($1);
												},

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