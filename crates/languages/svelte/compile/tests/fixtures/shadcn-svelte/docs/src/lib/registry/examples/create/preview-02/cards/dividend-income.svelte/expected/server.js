import * as $ from 'svelte/internal/server';
import { scaleBand } from "d3-scale";
import { BarChart } from "layerchart";
import * as Card from "$lib/registry/ui/card/index.js";
import * as Chart from "$lib/registry/ui/chart/index.js";
import * as Item from "$lib/registry/ui/item/index.js";
import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
import { Button } from "$lib/registry/ui/button/index.js";

export default function Dividend_income($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
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
											$$renderer.push(`<!---->Q2 Dividend Income`);
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
											$$renderer.push(`<!---->Quarterly dividend payouts across your portfolio holdings.`);
										},
										$$slots: { default: true }
									});

									$$renderer.push('<!--]-->');
								} else {
									$$renderer.push('<!--[!-->');
									$$renderer.push('<!--]-->');
								}

								$$renderer.push(` `);

								if (Card.Action) {
									$$renderer.push('<!--[-->');

									Card.Action($$renderer, {
										children: ($$renderer) => {
											Button($$renderer, {
												variant: 'ghost',
												size: 'icon-sm',
												class: 'bg-muted',
												children: ($$renderer) => {
													IconPlaceholder($$renderer, {
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
							children: ($$renderer) => {
								if (Item.Group) {
									$$renderer.push('<!--[-->');

									Item.Group($$renderer, {
										children: ($$renderer) => {
											$$renderer.push(`<!--[-->`);

											const each_array = $.ensure_array_like(HOLDINGS);

											for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
												let holding = each_array[$$index];

												if (Item.Root) {
													$$renderer.push('<!--[-->');

													Item.Root($$renderer, {
														variant: 'muted',
														children: ($$renderer) => {
															if (Item.Content) {
																$$renderer.push('<!--[-->');

																Item.Content($$renderer, {
																	children: ($$renderer) => {
																		if (Item.Title) {
																			$$renderer.push('<!--[-->');

																			Item.Title($$renderer, {
																				children: ($$renderer) => {
																					$$renderer.push(`<!---->${$.escape(holding.name)}`);
																				},
																				$$slots: { default: true }
																			});

																			$$renderer.push('<!--]-->');
																		} else {
																			$$renderer.push('<!--[!-->');
																			$$renderer.push('<!--]-->');
																		}

																		$$renderer.push(` `);

																		if (Item.Description) {
																			$$renderer.push('<!--[-->');

																			Item.Description($$renderer, {
																				children: ($$renderer) => {
																					$$renderer.push(`<!---->${$.escape(holding.shares)}`);
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

															if (Chart.Container) {
																$$renderer.push('<!--[-->');

																Chart.Container($$renderer, {
																	config: miniChartConfig,
																	class: 'hidden h-8 w-24 md:block [&_[data-slot=chart]]:h-full',
																	children: ($$renderer) => {
																		{
																			function tooltip($$renderer) {
																				if (Chart.Tooltip) {
																					$$renderer.push('<!--[-->');
																					Chart.Tooltip($$renderer, { hideLabel: true });
																					$$renderer.push('<!--]-->');
																				} else {
																					$$renderer.push('<!--[!-->');
																					$$renderer.push('<!--]-->');
																				}
																			}

																			BarChart($$renderer, {
																				data: holding.data,
																				x: 'q',
																				xScale: scaleBand().padding(0.2),
																				axis: false,
																				rule: false,
																				series: [
																					{
																						key: "value",
																						label: miniChartConfig.value.label,
																						color: miniChartConfig.value.color
																					}
																				],
																				props: { bars: { rounded: "top" } },
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

															$$renderer.push(` <span class="hidden text-sm font-semibold tabular-nums md:block">${$.escape(holding.amount)}</span>`);
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
	});
}