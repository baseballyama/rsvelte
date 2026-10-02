import * as $ from 'svelte/internal/server';
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

export default function Stock_performance($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
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
		let ticker = "VOO";
		let open = false;
		let triggerRef = null;
		const data = $.derived(() => CHART_DATA[ticker] ?? DEFAULT_DATA);

		function closeAndFocus() {
			open = false;
			tick().then(() => triggerRef?.focus());
		}

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			if (Card.Root) {
				$$renderer.push('<!--[-->');

				Card.Root($$renderer, {
					children: ($$renderer) => {
						if (Card.Header) {
							$$renderer.push('<!--[-->');

							Card.Header($$renderer, {
								children: ($$renderer) => {
									if (Card.Title) {
										$$renderer.push('<!--[-->');

										Card.Title($$renderer, {
											children: ($$renderer) => {
												$$renderer.push(`<!---->Stock Performance`);
											},
											$$slots: { default: true }
										});

										$$renderer.push('<!--]-->');
									} else {
										$$renderer.push('<!--[!-->');
										$$renderer.push('<!--]-->');
									}

									$$renderer.push(` `);

									if (Card.Description) {
										$$renderer.push('<!--[-->');

										Card.Description($$renderer, {
											children: ($$renderer) => {
												$$renderer.push(`<!---->6-month price history.`);
											},
											$$slots: { default: true }
										});

										$$renderer.push('<!--]-->');
									} else {
										$$renderer.push('<!--[!-->');
										$$renderer.push('<!--]-->');
									}
								},
								$$slots: { default: true }
							});

							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}

						$$renderer.push(` `);

						if (Card.Content) {
							$$renderer.push('<!--[-->');

							Card.Content($$renderer, {
								class: 'flex flex-col gap-4',
								children: ($$renderer) => {
									if (Field.Group) {
										$$renderer.push('<!--[-->');

										Field.Group($$renderer, {
											children: ($$renderer) => {
												if (Field.Field) {
													$$renderer.push('<!--[-->');

													Field.Field($$renderer, {
														children: ($$renderer) => {
															if (Field.Label) {
																$$renderer.push('<!--[-->');

																Field.Label($$renderer, {
																	for: 'ticker-select',
																	children: ($$renderer) => {
																		$$renderer.push(`<!---->Ticker`);
																	},
																	$$slots: { default: true }
																});

																$$renderer.push('<!--]-->');
															} else {
																$$renderer.push('<!--[!-->');
																$$renderer.push('<!--]-->');
															}

															$$renderer.push(` `);

															if (Popover.Root) {
																$$renderer.push('<!--[-->');

																Popover.Root($$renderer, {
																	get open() {
																		return open;
																	},

																	set open($$value) {
																		open = $$value;
																		$$settled = false;
																	},

																	children: ($$renderer) => {
																		{
																			function child($$renderer, { props }) {
																				Button($$renderer, $.spread_props([
																					props,
																					{
																						variant: 'outline',
																						id: 'ticker-select',
																						class: 'w-full justify-between bg-muted font-normal',
																						role: 'combobox',
																						'aria-expanded': open,
																						children: ($$renderer) => {
																							$$renderer.push(`<!---->${$.escape(ticker)} `);

																							IconPlaceholder($$renderer, {
																								lucide: 'ChevronDownIcon',
																								tabler: 'IconChevronDown',
																								hugeicons: 'ArrowDown01Icon',
																								phosphor: 'CaretDownIcon',
																								remixicon: 'RiArrowDownSLine',
																								class: 'size-4 text-muted-foreground opacity-50'
																							});

																							$$renderer.push(`<!---->`);
																						},
																						$$slots: { default: true }
																					}
																				]));
																			}

																			if (Popover.Trigger) {
																				$$renderer.push('<!--[-->');

																				Popover.Trigger($$renderer, {
																					get ref() {
																						return triggerRef;
																					},

																					set ref($$value) {
																						triggerRef = $$value;
																						$$settled = false;
																					},
																					child,
																					$$slots: { child: true }
																				});

																				$$renderer.push('<!--]-->');
																			} else {
																				$$renderer.push('<!--[!-->');
																				$$renderer.push('<!--]-->');
																			}
																		}

																		$$renderer.push(` `);

																		if (Popover.Content) {
																			$$renderer.push('<!--[-->');

																			Popover.Content($$renderer, {
																				class: 'w-[var(--bits-popover-anchor-width)] p-0',
																				align: 'start',
																				children: ($$renderer) => {
																					if (Command.Root) {
																						$$renderer.push('<!--[-->');

																						Command.Root($$renderer, {
																							children: ($$renderer) => {
																								if (Command.Input) {
																									$$renderer.push('<!--[-->');
																									Command.Input($$renderer, { placeholder: 'Search ticker...' });
																									$$renderer.push('<!--]-->');
																								} else {
																									$$renderer.push('<!--[!-->');
																									$$renderer.push('<!--]-->');
																								}

																								$$renderer.push(` `);

																								if (Command.List) {
																									$$renderer.push('<!--[-->');

																									Command.List($$renderer, {
																										children: ($$renderer) => {
																											if (Command.Empty) {
																												$$renderer.push('<!--[-->');

																												Command.Empty($$renderer, {
																													children: ($$renderer) => {
																														$$renderer.push(`<!---->No tickers found.`);
																													},
																													$$slots: { default: true }
																												});

																												$$renderer.push('<!--]-->');
																											} else {
																												$$renderer.push('<!--[!-->');
																												$$renderer.push('<!--]-->');
																											}

																											$$renderer.push(` `);

																											if (Command.Group) {
																												$$renderer.push('<!--[-->');

																												Command.Group($$renderer, {
																													children: ($$renderer) => {
																														$$renderer.push(`<!--[-->`);

																														const each_array = $.ensure_array_like(TICKERS);

																														for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
																															let t = each_array[$$index];

																															if (Command.Item) {
																																$$renderer.push('<!--[-->');

																																Command.Item($$renderer, {
																																	value: t,
																																	onSelect: () => {
																																		ticker = t;
																																		closeAndFocus();
																																	},

																																	children: ($$renderer) => {
																																		$$renderer.push(`<!---->${$.escape(t)}`);
																																	},
																																	$$slots: { default: true }
																																});

																																$$renderer.push('<!--]-->');
																															} else {
																																$$renderer.push('<!--[!-->');
																																$$renderer.push('<!--]-->');
																															}
																														}

																														$$renderer.push(`<!--]-->`);
																													},
																													$$slots: { default: true }
																												});

																												$$renderer.push('<!--]-->');
																											} else {
																												$$renderer.push('<!--[!-->');
																												$$renderer.push('<!--]-->');
																											}
																										},
																										$$slots: { default: true }
																									});

																									$$renderer.push('<!--]-->');
																								} else {
																									$$renderer.push('<!--[!-->');
																									$$renderer.push('<!--]-->');
																								}
																							},
																							$$slots: { default: true }
																						});

																						$$renderer.push('<!--]-->');
																					} else {
																						$$renderer.push('<!--[!-->');
																						$$renderer.push('<!--]-->');
																					}
																				},
																				$$slots: { default: true }
																			});

																			$$renderer.push('<!--]-->');
																		} else {
																			$$renderer.push('<!--[!-->');
																			$$renderer.push('<!--]-->');
																		}
																	},
																	$$slots: { default: true }
																});

																$$renderer.push('<!--]-->');
															} else {
																$$renderer.push('<!--[!-->');
																$$renderer.push('<!--]-->');
															}
														},
														$$slots: { default: true }
													});

													$$renderer.push('<!--]-->');
												} else {
													$$renderer.push('<!--[!-->');
													$$renderer.push('<!--]-->');
												}
											},
											$$slots: { default: true }
										});

										$$renderer.push('<!--]-->');
									} else {
										$$renderer.push('<!--[!-->');
										$$renderer.push('<!--]-->');
									}

									$$renderer.push(` `);
									Separator($$renderer, {});
									$$renderer.push(`<!----> `);

									if (Chart.Container) {
										$$renderer.push('<!--[-->');

										Chart.Container($$renderer, {
											config: chartConfig,
											class: 'h-[200px] w-full',
											children: ($$renderer) => {
												{
													function tooltip($$renderer) {
														if (Chart.Tooltip) {
															$$renderer.push('<!--[-->');
															Chart.Tooltip($$renderer, { indicator: 'line', hideLabel: true });
															$$renderer.push('<!--]-->');
														} else {
															$$renderer.push('<!--[!-->');
															$$renderer.push('<!--]-->');
														}
													}

													AreaChart($$renderer, {
														data: data(),
														x: 'month',
														xScale: scaleBand(),
														axis: 'x',
														series: [
															{
																key: "price",
																label: chartConfig.price.label,
																color: chartConfig.price.color
															}
														],
														props: {
															area: { curve: curveNatural, "fill-opacity": 0.25, motion: "tween" },
															xAxis: { format: (d) => d.slice(0, 3), tickLength: 0 }
														},
														tooltip,
														$$slots: { tooltip: true }
													});
												}
											},
											$$slots: { default: true }
										});

										$$renderer.push('<!--]-->');
									} else {
										$$renderer.push('<!--[!-->');
										$$renderer.push('<!--]-->');
									}
								},
								$$slots: { default: true }
							});

							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}
					},
					$$slots: { default: true }
				});

				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}