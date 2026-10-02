import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as Card from "$lib/registry/ui/card/index.js";
import * as InputGroup from "$lib/registry/ui/input-group/index.js";
import * as Item from "$lib/registry/ui/item/index.js";
import * as ToggleGroup from "$lib/registry/ui/toggle-group/index.js";
import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
import { Badge } from "$lib/registry/ui/badge/index.js";

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!>`, 1);
var root_2 = $.from_html(`<div class="flex items-center justify-between gap-3"><!> <!></div>`);
var root_3 = $.from_html(`<div class="flex size-12 items-center justify-center rounded-lg border text-sm font-semibold"> </div>`);
var root_4 = $.from_html(`<!> <!> <div class="flex shrink-0 items-center gap-6"><!> <div class="flex flex-col items-end gap-0.5"><span class="text-xs tracking-wider text-muted-foreground uppercase">Value</span> <span class="font-medium tabular-nums"> </span></div></div>`, 1);

export default function Release_catalog($$anchor) {
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

	let filters = $.state($.proxy(["etfs"]));
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
							var div = root_2();
							var node_2 = $.child(div);

							$.component(node_2, () => InputGroup.Root, ($$anchor, InputGroup_Root) => {
								InputGroup_Root($$anchor, {
									class: 'max-w-sm',
									children: ($$anchor, $$slotProps) => {
										var fragment_2 = root();
										var node_3 = $.first_child(fragment_2);

										$.component(node_3, () => InputGroup.Addon, ($$anchor, InputGroup_Addon) => {
											InputGroup_Addon($$anchor, {
												children: ($$anchor, $$slotProps) => {
													IconPlaceholder($$anchor, {
														lucide: 'SearchIcon',
														tabler: 'IconSearch',
														hugeicons: 'Search01Icon',
														phosphor: 'MagnifyingGlassIcon',
														remixicon: 'RiSearchLine'
													});
												},
												$$slots: { default: true }
											});
										});

										var node_4 = $.sibling(node_3, 2);

										$.component(node_4, () => InputGroup.Input, ($$anchor, InputGroup_Input) => {
											InputGroup_Input($$anchor, { placeholder: 'Search holdings or tickers...' });
										});

										$.append($$anchor, fragment_2);
									},
									$$slots: { default: true }
								});
							});

							var node_5 = $.sibling(node_2, 2);

							$.component(node_5, () => ToggleGroup.Root, ($$anchor, ToggleGroup_Root) => {
								ToggleGroup_Root($$anchor, {
									type: 'multiple',
									variant: 'outline',
									spacing: 1,
									get value() {
										return $.get(filters);
									},

									set value($$value) {
										$.set(filters, $$value, true);
									},

									children: ($$anchor, $$slotProps) => {
										var fragment_4 = root_1();
										var node_6 = $.first_child(fragment_4);

										$.component(node_6, () => ToggleGroup.Item, ($$anchor, ToggleGroup_Item) => {
											ToggleGroup_Item($$anchor, {
												value: 'stocks',
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text = $.text('Stocks');

													$.append($$anchor, text);
												},
												$$slots: { default: true }
											});
										});

										var node_7 = $.sibling(node_6, 2);

										$.component(node_7, () => ToggleGroup.Item, ($$anchor, ToggleGroup_Item_1) => {
											ToggleGroup_Item_1($$anchor, {
												value: 'etfs',
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_1 = $.text('ETFs');

													$.append($$anchor, text_1);
												},
												$$slots: { default: true }
											});
										});

										var node_8 = $.sibling(node_7, 2);

										$.component(node_8, () => ToggleGroup.Item, ($$anchor, ToggleGroup_Item_2) => {
											ToggleGroup_Item_2($$anchor, {
												value: 'reits',
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_2 = $.text('REITs');

													$.append($$anchor, text_2);
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
						},
						$$slots: { default: true }
					});
				});

				var node_9 = $.sibling(node_1, 2);

				$.component(node_9, () => Card.Content, ($$anchor, Card_Content) => {
					Card_Content($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_5 = $.comment();
							var node_10 = $.first_child(fragment_5);

							$.component(node_10, () => Item.Group, ($$anchor, Item_Group) => {
								Item_Group($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_6 = $.comment();
										var node_11 = $.first_child(fragment_6);

										$.each(node_11, 17, () => HOLDINGS, (holding) => holding.ticker, ($$anchor, holding) => {
											var fragment_7 = $.comment();
											var node_12 = $.first_child(fragment_7);

											$.component(node_12, () => Item.Root, ($$anchor, Item_Root) => {
												Item_Root($$anchor, {
													variant: 'muted',
													children: ($$anchor, $$slotProps) => {
														var fragment_8 = root_4();
														var node_13 = $.first_child(fragment_8);

														$.component(node_13, () => Item.Media, ($$anchor, Item_Media) => {
															Item_Media($$anchor, {
																children: ($$anchor, $$slotProps) => {
																	var div_1 = root_3();
																	var text_3 = $.only_child(div_1, true);

																	$.template_effect(() => $.set_text(text_3, $.get(holding).ticker));
																	$.append($$anchor, div_1);
																},
																$$slots: { default: true }
															});
														});

														var node_14 = $.sibling(node_13, 2);

														$.component(node_14, () => Item.Content, ($$anchor, Item_Content) => {
															Item_Content($$anchor, {
																children: ($$anchor, $$slotProps) => {
																	var fragment_9 = root();
																	var node_15 = $.first_child(fragment_9);

																	$.component(node_15, () => Item.Title, ($$anchor, Item_Title) => {
																		Item_Title($$anchor, {
																			children: ($$anchor, $$slotProps) => {
																				$.next();

																				var text_4 = $.text();

																				$.template_effect(() => $.set_text(text_4, $.get(holding).name));
																				$.append($$anchor, text_4);
																			},
																			$$slots: { default: true }
																		});
																	});

																	var node_16 = $.sibling(node_15, 2);

																	$.component(node_16, () => Item.Description, ($$anchor, Item_Description) => {
																		Item_Description($$anchor, {
																			class: 'text-xs tracking-wider uppercase',
																			children: ($$anchor, $$slotProps) => {
																				$.next();

																				var text_5 = $.text();

																				$.template_effect(() => $.set_text(text_5, `${$.get(holding).shares ?? ''} Shares · ${$.get(holding).added ?? ''}`));
																				$.append($$anchor, text_5);
																			},
																			$$slots: { default: true }
																		});
																	});

																	$.append($$anchor, fragment_9);
																},
																$$slots: { default: true }
															});
														});

														var div_2 = $.sibling(node_14, 2);
														var node_17 = $.child(div_2);

														Badge(node_17, {
															variant: 'outline',
															children: ($$anchor, $$slotProps) => {
																$.next();

																var text_6 = $.text();

																$.template_effect(() => $.set_text(text_6, $.get(holding).type));
																$.append($$anchor, text_6);
															},
															$$slots: { default: true }
														});

														var div_3 = $.sibling(node_17, 2);
														var span = $.sibling($.child(div_3), 2);
														var text_7 = $.only_child(span, true);

														$.reset(div_3);
														$.reset(div_2);
														$.template_effect(() => $.set_text(text_7, $.get(holding).value));
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
}