import * as $ from 'svelte/internal/server';
import * as Card from "$lib/registry/ui/card/index.js";
import * as InputGroup from "$lib/registry/ui/input-group/index.js";
import * as Item from "$lib/registry/ui/item/index.js";
import * as ToggleGroup from "$lib/registry/ui/toggle-group/index.js";
import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
import { Badge } from "$lib/registry/ui/badge/index.js";

export default function Release_catalog($$renderer) {
	const HOLDINGS = [
		{
			ticker: "VOO",
			name: "Vanguard S&P 500 ETF",
			type: "ETF",
			added: "Jan 2021",
			shares: "112",
			value: "$48,230.40"
		},

		{
			ticker: "VIG",
			name: "Vanguard Dividend Appreciation",
			type: "ETF",
			added: "Mar 2022",
			shares: "450",
			value: "$26,033.79"
		},

		{
			ticker: "AAPL",
			name: "Apple Inc.",
			type: "Stock",
			added: "Nov 2020",
			shares: "85",
			value: "$18,488.90"
		},

		{
			ticker: "O",
			name: "Realty Income Corp",
			type: "REIT",
			added: "Jun 2023",
			shares: "320",
			value: "$15,136.59"
		}
	];

	let filters = ["etfs"];
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
								$$renderer.push(`<div class="flex items-center justify-between gap-3">`);

								if (InputGroup.Root) {
									$$renderer.push('<!--[-->');

									InputGroup.Root($$renderer, {
										class: 'max-w-sm',
										children: ($$renderer) => {
											if (InputGroup.Addon) {
												$$renderer.push('<!--[-->');

												InputGroup.Addon($$renderer, {
													children: ($$renderer) => {
														IconPlaceholder($$renderer, {
															lucide: 'SearchIcon',
															tabler: 'IconSearch',
															hugeicons: 'Search01Icon',
															phosphor: 'MagnifyingGlassIcon',
															remixicon: 'RiSearchLine'
														});
													},
													$$slots: { default: true }
												});

												$$renderer.push('<!--]-->');
											} else {
												$$renderer.push('<!--[!-->');
												$$renderer.push('<!--]-->');
											}

											$$renderer.push(` `);

											if (InputGroup.Input) {
												$$renderer.push('<!--[-->');
												InputGroup.Input($$renderer, { placeholder: 'Search holdings or tickers...' });
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

								if (ToggleGroup.Root) {
									$$renderer.push('<!--[-->');

									ToggleGroup.Root($$renderer, {
										type: 'multiple',
										variant: 'outline',
										spacing: 1,
										get value() {
											return filters;
										},

										set value($$value) {
											filters = $$value;
											$$settled = false;
										},

										children: ($$renderer) => {
											if (ToggleGroup.Item) {
												$$renderer.push('<!--[-->');

												ToggleGroup.Item($$renderer, {
													value: 'stocks',
													children: ($$renderer) => {
														$$renderer.push(`<!---->Stocks`);
													},
													$$slots: { default: true }
												});

												$$renderer.push('<!--]-->');
											} else {
												$$renderer.push('<!--[!-->');
												$$renderer.push('<!--]-->');
											}

											$$renderer.push(` `);

											if (ToggleGroup.Item) {
												$$renderer.push('<!--[-->');

												ToggleGroup.Item($$renderer, {
													value: 'etfs',
													children: ($$renderer) => {
														$$renderer.push(`<!---->ETFs`);
													},
													$$slots: { default: true }
												});

												$$renderer.push('<!--]-->');
											} else {
												$$renderer.push('<!--[!-->');
												$$renderer.push('<!--]-->');
											}

											$$renderer.push(` `);

											if (ToggleGroup.Item) {
												$$renderer.push('<!--[-->');

												ToggleGroup.Item($$renderer, {
													value: 'reits',
													children: ($$renderer) => {
														$$renderer.push(`<!---->REITs`);
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

								$$renderer.push(`</div>`);
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
															if (Item.Media) {
																$$renderer.push('<!--[-->');

																Item.Media($$renderer, {
																	children: ($$renderer) => {
																		$$renderer.push(`<div class="flex size-12 items-center justify-center rounded-lg border text-sm font-semibold">${$.escape(holding.ticker)}</div>`);
																	},
																	$$slots: { default: true }
																});

																$$renderer.push('<!--]-->');
															} else {
																$$renderer.push('<!--[!-->');
																$$renderer.push('<!--]-->');
															}

															$$renderer.push(` `);

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
																				class: 'text-xs tracking-wider uppercase',
																				children: ($$renderer) => {
																					$$renderer.push(`<!---->${$.escape(holding.shares)} Shares · ${$.escape(holding.added)}`);
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

															$$renderer.push(` <div class="flex shrink-0 items-center gap-6">`);

															Badge($$renderer, {
																variant: 'outline',
																children: ($$renderer) => {
																	$$renderer.push(`<!---->${$.escape(holding.type)}`);
																},
																$$slots: { default: true }
															});

															$$renderer.push(`<!----> <div class="flex flex-col items-end gap-0.5"><span class="text-xs tracking-wider text-muted-foreground uppercase">Value</span> <span class="font-medium tabular-nums">${$.escape(holding.value)}</span></div></div>`);
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
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}