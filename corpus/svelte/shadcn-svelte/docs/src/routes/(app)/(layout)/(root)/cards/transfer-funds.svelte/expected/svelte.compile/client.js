import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
import { Button } from "$lib/registry/ui/button/index.js";

import {
	Card,
	CardAction,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle
} from "$lib/registry/ui/card/index.js";

import { Field, FieldGroup, FieldLabel } from "$lib/registry/ui/field/index.js";
import { InputGroup, InputGroupAddon, InputGroupInput, InputGroupText } from "$lib/registry/ui/input-group/index.js";
import { Item, ItemContent } from "$lib/registry/ui/item/index.js";

import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectTrigger
} from "$lib/registry/ui/select/index.js";

import { Separator } from "$lib/registry/ui/separator/index.js";

var root = $.from_html(`<!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);
var root_2 = $.from_html(`<div class="flex items-center justify-between"><span class="text-sm text-muted-foreground">Estimated arrival</span> <span class="text-sm font-medium">Today, Apr 14</span></div> <!> <div class="flex items-center justify-between"><span class="text-sm text-muted-foreground">Transaction fee</span> <span class="text-sm font-medium tabular-nums">$0.00</span></div> <!> <div class="flex items-center justify-between"><span class="text-sm font-medium">Total amount</span> <span class="text-sm font-semibold tabular-nums">$1,200.00</span></div>`, 1);
var root_3 = $.from_html(`<!> <!> <!> <!>`, 1);

export default function Transfer_funds($$anchor) {
	const FROM_ACCOUNTS = [
		{
			label: "Main Checking (··8402) — $12,450.00",
			value: "checking"
		},
		{ label: "Business (··7731) — $8,920.00", value: "business" }
	];

	const TO_ACCOUNTS = [
		{
			label: "High Yield Savings (··1192) — $42,100.00",
			value: "savings"
		},

		{
			label: "Investment (··3349) — $18,200.00",
			value: "investment"
		}
	];

	let fromAccount = $.state("checking");
	let toAccount = $.state("savings");
	const selectedFromAccount = $.derived(() => FROM_ACCOUNTS.find((account) => account.value === $.get(fromAccount)));
	const selectedToAccount = $.derived(() => TO_ACCOUNTS.find((account) => account.value === $.get(toAccount)));

	Card($$anchor, {
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node = $.first_child(fragment_1);

			CardHeader(node, {
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root();
					var node_1 = $.first_child(fragment_2);

					CardTitle(node_1, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text = $.text('Transfer Funds');

							$.append($$anchor, text);
						},
						$$slots: { default: true }
					});

					var node_2 = $.sibling(node_1, 2);

					CardDescription(node_2, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_1 = $.text('Move money between your connected accounts.');

							$.append($$anchor, text_1);
						},
						$$slots: { default: true }
					});

					var node_3 = $.sibling(node_2, 2);

					CardAction(node_3, {
						children: ($$anchor, $$slotProps) => {
							Button($$anchor, {
								variant: 'ghost',
								size: 'icon-sm',
								class: 'bg-muted',
								'aria-label': 'Dismiss transfer funds',
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

					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});

			var node_4 = $.sibling(node, 2);

			CardContent(node_4, {
				children: ($$anchor, $$slotProps) => {
					FieldGroup($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_6 = root_3();
							var node_5 = $.first_child(fragment_6);

							Field(node_5, {
								children: ($$anchor, $$slotProps) => {
									var fragment_7 = root_1();
									var node_6 = $.first_child(fragment_7);

									FieldLabel(node_6, {
										for: 'transfer-amount',
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_2 = $.text('Amount to Transfer');

											$.append($$anchor, text_2);
										},
										$$slots: { default: true }
									});

									var node_7 = $.sibling(node_6, 2);

									InputGroup(node_7, {
										children: ($$anchor, $$slotProps) => {
											var fragment_8 = root_1();
											var node_8 = $.first_child(fragment_8);

											InputGroupAddon(node_8, {
												children: ($$anchor, $$slotProps) => {
													InputGroupText($$anchor, {
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_3 = $.text('$');

															$.append($$anchor, text_3);
														},
														$$slots: { default: true }
													});
												},
												$$slots: { default: true }
											});

											var node_9 = $.sibling(node_8, 2);

											InputGroupInput(node_9, { id: 'transfer-amount', value: '1,200.00' });
											$.append($$anchor, fragment_8);
										},
										$$slots: { default: true }
									});

									$.append($$anchor, fragment_7);
								},
								$$slots: { default: true }
							});

							var node_10 = $.sibling(node_5, 2);

							Field(node_10, {
								children: ($$anchor, $$slotProps) => {
									var fragment_10 = root_1();
									var node_11 = $.first_child(fragment_10);

									FieldLabel(node_11, {
										for: 'from-account',
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_4 = $.text('From Account');

											$.append($$anchor, text_4);
										},
										$$slots: { default: true }
									});

									var node_12 = $.sibling(node_11, 2);

									Select(node_12, {
										type: 'single',
										get items() {
											return FROM_ACCOUNTS;
										},

										get value() {
											return $.get(fromAccount);
										},

										set value($$value) {
											$.set(fromAccount, $$value, true);
										},

										children: ($$anchor, $$slotProps) => {
											var fragment_11 = root_1();
											var node_13 = $.first_child(fragment_11);

											SelectTrigger(node_13, {
												id: 'from-account',
												class: 'w-full',
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_5 = $.text();

													$.template_effect(() => $.set_text(text_5, $.get(selectedFromAccount)?.label));
													$.append($$anchor, text_5);
												},
												$$slots: { default: true }
											});

											var node_14 = $.sibling(node_13, 2);

											SelectContent(node_14, {
												class: 'w-(--bits-select-anchor-width)',
												children: ($$anchor, $$slotProps) => {
													SelectGroup($$anchor, {
														children: ($$anchor, $$slotProps) => {
															var fragment_14 = $.comment();
															var node_15 = $.first_child(fragment_14);

															$.each(node_15, 17, () => FROM_ACCOUNTS, (item) => item.value, ($$anchor, item) => {
																SelectItem($$anchor, {
																	get value() {
																		return $.get(item).value;
																	},

																	children: ($$anchor, $$slotProps) => {
																		$.next();

																		var text_6 = $.text();

																		$.template_effect(() => $.set_text(text_6, $.get(item).label));
																		$.append($$anchor, text_6);
																	},
																	$$slots: { default: true }
																});
															});

															$.append($$anchor, fragment_14);
														},
														$$slots: { default: true }
													});
												},
												$$slots: { default: true }
											});

											$.append($$anchor, fragment_11);
										},
										$$slots: { default: true }
									});

									$.append($$anchor, fragment_10);
								},
								$$slots: { default: true }
							});

							var node_16 = $.sibling(node_10, 2);

							Field(node_16, {
								children: ($$anchor, $$slotProps) => {
									var fragment_17 = root_1();
									var node_17 = $.first_child(fragment_17);

									FieldLabel(node_17, {
										for: 'to-account',
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_7 = $.text('To Account');

											$.append($$anchor, text_7);
										},
										$$slots: { default: true }
									});

									var node_18 = $.sibling(node_17, 2);

									Select(node_18, {
										type: 'single',
										get items() {
											return TO_ACCOUNTS;
										},

										get value() {
											return $.get(toAccount);
										},

										set value($$value) {
											$.set(toAccount, $$value, true);
										},

										children: ($$anchor, $$slotProps) => {
											var fragment_18 = root_1();
											var node_19 = $.first_child(fragment_18);

											SelectTrigger(node_19, {
												id: 'to-account',
												class: 'w-full',
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_8 = $.text();

													$.template_effect(() => $.set_text(text_8, $.get(selectedToAccount)?.label));
													$.append($$anchor, text_8);
												},
												$$slots: { default: true }
											});

											var node_20 = $.sibling(node_19, 2);

											SelectContent(node_20, {
												class: 'w-(--bits-select-anchor-width)',
												children: ($$anchor, $$slotProps) => {
													SelectGroup($$anchor, {
														children: ($$anchor, $$slotProps) => {
															var fragment_21 = $.comment();
															var node_21 = $.first_child(fragment_21);

															$.each(node_21, 17, () => TO_ACCOUNTS, (item) => item.value, ($$anchor, item) => {
																SelectItem($$anchor, {
																	get value() {
																		return $.get(item).value;
																	},

																	children: ($$anchor, $$slotProps) => {
																		$.next();

																		var text_9 = $.text();

																		$.template_effect(() => $.set_text(text_9, $.get(item).label));
																		$.append($$anchor, text_9);
																	},
																	$$slots: { default: true }
																});
															});

															$.append($$anchor, fragment_21);
														},
														$$slots: { default: true }
													});
												},
												$$slots: { default: true }
											});

											$.append($$anchor, fragment_18);
										},
										$$slots: { default: true }
									});

									$.append($$anchor, fragment_17);
								},
								$$slots: { default: true }
							});

							var node_22 = $.sibling(node_16, 2);

							Item(node_22, {
								variant: 'muted',
								class: 'flex-col items-stretch',
								children: ($$anchor, $$slotProps) => {
									ItemContent($$anchor, {
										class: 'gap-3',
										children: ($$anchor, $$slotProps) => {
											var fragment_25 = root_2();
											var node_23 = $.sibling($.first_child(fragment_25), 2);

											Separator(node_23, {});

											var node_24 = $.sibling(node_23, 4);

											Separator(node_24, {});
											$.next(2);
											$.append($$anchor, fragment_25);
										},
										$$slots: { default: true }
									});
								},
								$$slots: { default: true }
							});

							$.append($$anchor, fragment_6);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});

			var node_25 = $.sibling(node_4, 2);

			CardFooter(node_25, {
				children: ($$anchor, $$slotProps) => {
					Button($$anchor, {
						class: 'w-full',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_10 = $.text('Confirm Transfer');

							$.append($$anchor, text_10);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}