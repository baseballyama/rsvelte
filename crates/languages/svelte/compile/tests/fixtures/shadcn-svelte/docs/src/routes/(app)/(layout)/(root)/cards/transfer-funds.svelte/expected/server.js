import * as $ from 'svelte/internal/server';
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

export default function Transfer_funds($$renderer) {
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

	let fromAccount = "checking";
	let toAccount = "savings";
	const selectedFromAccount = $.derived(() => FROM_ACCOUNTS.find((account) => account.value === fromAccount));
	const selectedToAccount = $.derived(() => TO_ACCOUNTS.find((account) => account.value === toAccount));
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		Card($$renderer, {
			children: ($$renderer) => {
				CardHeader($$renderer, {
					children: ($$renderer) => {
						CardTitle($$renderer, {
							children: ($$renderer) => {
								$$renderer.push(`<!---->Transfer Funds`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						CardDescription($$renderer, {
							children: ($$renderer) => {
								$$renderer.push(`<!---->Move money between your connected accounts.`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						CardAction($$renderer, {
							children: ($$renderer) => {
								Button($$renderer, {
									variant: 'ghost',
									size: 'icon-sm',
									class: 'bg-muted',
									'aria-label': 'Dismiss transfer funds',
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

						$$renderer.push(`<!---->`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				CardContent($$renderer, {
					children: ($$renderer) => {
						FieldGroup($$renderer, {
							children: ($$renderer) => {
								Field($$renderer, {
									children: ($$renderer) => {
										FieldLabel($$renderer, {
											for: 'transfer-amount',
											children: ($$renderer) => {
												$$renderer.push(`<!---->Amount to Transfer`);
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!----> `);

										InputGroup($$renderer, {
											children: ($$renderer) => {
												InputGroupAddon($$renderer, {
													children: ($$renderer) => {
														InputGroupText($$renderer, {
															children: ($$renderer) => {
																$$renderer.push(`<!---->$`);
															},
															$$slots: { default: true }
														});
													},
													$$slots: { default: true }
												});

												$$renderer.push(`<!----> `);
												InputGroupInput($$renderer, { id: 'transfer-amount', value: '1,200.00' });
												$$renderer.push(`<!---->`);
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!---->`);
									},
									$$slots: { default: true }
								});

								$$renderer.push(`<!----> `);

								Field($$renderer, {
									children: ($$renderer) => {
										FieldLabel($$renderer, {
											for: 'from-account',
											children: ($$renderer) => {
												$$renderer.push(`<!---->From Account`);
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!----> `);

										Select($$renderer, {
											type: 'single',
											items: FROM_ACCOUNTS,
											get value() {
												return fromAccount;
											},

											set value($$value) {
												fromAccount = $$value;
												$$settled = false;
											},

											children: ($$renderer) => {
												SelectTrigger($$renderer, {
													id: 'from-account',
													class: 'w-full',
													children: ($$renderer) => {
														$$renderer.push(`<!---->${$.escape(selectedFromAccount()?.label)}`);
													},
													$$slots: { default: true }
												});

												$$renderer.push(`<!----> `);

												SelectContent($$renderer, {
													class: 'w-(--bits-select-anchor-width)',
													children: ($$renderer) => {
														SelectGroup($$renderer, {
															children: ($$renderer) => {
																$$renderer.push(`<!--[-->`);

																const each_array = $.ensure_array_like(FROM_ACCOUNTS);

																for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
																	let item = each_array[$$index];

																	SelectItem($$renderer, {
																		value: item.value,
																		children: ($$renderer) => {
																			$$renderer.push(`<!---->${$.escape(item.label)}`);
																		},
																		$$slots: { default: true }
																	});
																}

																$$renderer.push(`<!--]-->`);
															},
															$$slots: { default: true }
														});
													},
													$$slots: { default: true }
												});

												$$renderer.push(`<!---->`);
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!---->`);
									},
									$$slots: { default: true }
								});

								$$renderer.push(`<!----> `);

								Field($$renderer, {
									children: ($$renderer) => {
										FieldLabel($$renderer, {
											for: 'to-account',
											children: ($$renderer) => {
												$$renderer.push(`<!---->To Account`);
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!----> `);

										Select($$renderer, {
											type: 'single',
											items: TO_ACCOUNTS,
											get value() {
												return toAccount;
											},

											set value($$value) {
												toAccount = $$value;
												$$settled = false;
											},

											children: ($$renderer) => {
												SelectTrigger($$renderer, {
													id: 'to-account',
													class: 'w-full',
													children: ($$renderer) => {
														$$renderer.push(`<!---->${$.escape(selectedToAccount()?.label)}`);
													},
													$$slots: { default: true }
												});

												$$renderer.push(`<!----> `);

												SelectContent($$renderer, {
													class: 'w-(--bits-select-anchor-width)',
													children: ($$renderer) => {
														SelectGroup($$renderer, {
															children: ($$renderer) => {
																$$renderer.push(`<!--[-->`);

																const each_array_1 = $.ensure_array_like(TO_ACCOUNTS);

																for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
																	let item = each_array_1[$$index_1];

																	SelectItem($$renderer, {
																		value: item.value,
																		children: ($$renderer) => {
																			$$renderer.push(`<!---->${$.escape(item.label)}`);
																		},
																		$$slots: { default: true }
																	});
																}

																$$renderer.push(`<!--]-->`);
															},
															$$slots: { default: true }
														});
													},
													$$slots: { default: true }
												});

												$$renderer.push(`<!---->`);
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!---->`);
									},
									$$slots: { default: true }
								});

								$$renderer.push(`<!----> `);

								Item($$renderer, {
									variant: 'muted',
									class: 'flex-col items-stretch',
									children: ($$renderer) => {
										ItemContent($$renderer, {
											class: 'gap-3',
											children: ($$renderer) => {
												$$renderer.push(`<div class="flex items-center justify-between"><span class="text-sm text-muted-foreground">Estimated arrival</span> <span class="text-sm font-medium">Today, Apr 14</span></div> `);
												Separator($$renderer, {});
												$$renderer.push(`<!----> <div class="flex items-center justify-between"><span class="text-sm text-muted-foreground">Transaction fee</span> <span class="text-sm font-medium tabular-nums">$0.00</span></div> `);
												Separator($$renderer, {});
												$$renderer.push(`<!----> <div class="flex items-center justify-between"><span class="text-sm font-medium">Total amount</span> <span class="text-sm font-semibold tabular-nums">$1,200.00</span></div>`);
											},
											$$slots: { default: true }
										});
									},
									$$slots: { default: true }
								});

								$$renderer.push(`<!---->`);
							},
							$$slots: { default: true }
						});
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				CardFooter($$renderer, {
					children: ($$renderer) => {
						Button($$renderer, {
							class: 'w-full',
							children: ($$renderer) => {
								$$renderer.push(`<!---->Confirm Transfer`);
							},
							$$slots: { default: true }
						});
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!---->`);
			},
			$$slots: { default: true }
		});
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}