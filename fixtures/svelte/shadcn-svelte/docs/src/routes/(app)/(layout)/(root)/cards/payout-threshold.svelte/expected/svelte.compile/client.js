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

import { Field, FieldDescription, FieldGroup, FieldLabel } from "$lib/registry/ui/field/index.js";
import { Progress } from "$lib/registry/ui/progress/index.js";

import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectTrigger
} from "$lib/registry/ui/select/index.js";

import { Textarea } from "$lib/registry/ui/textarea/index.js";

var root = $.from_html(`<!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);
var root_2 = $.from_html(`<div class="flex items-baseline justify-between"><!> <span class="text-2xl font-semibold tabular-nums">$2500.00</span></div> <!> <div class="flex items-center justify-between"><!> <!></div>`, 1);

export default function Payout_threshold($$anchor) {
	const CURRENCIES = [
		{ label: "USD — United States Dollar", value: "usd" },
		{ label: "EUR — Euro", value: "eur" },
		{ label: "GBP — British Pound", value: "gbp" },
		{ label: "JPY — Japanese Yen", value: "jpy" }
	];

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

							var text = $.text('Payout Threshold');

							$.append($$anchor, text);
						},
						$$slots: { default: true }
					});

					var node_2 = $.sibling(node_1, 2);

					CardDescription(node_2, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_1 = $.text('Set the minimum balance required before a payout is triggered.');

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
								'aria-label': 'Dismiss payout threshold',
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
							var fragment_6 = root();
							var node_5 = $.first_child(fragment_6);

							Field(node_5, {
								children: ($$anchor, $$slotProps) => {
									var fragment_7 = root_1();
									var node_6 = $.first_child(fragment_7);

									FieldLabel(node_6, {
										for: 'preferred-currency',
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_2 = $.text('Preferred Currency');

											$.append($$anchor, text_2);
										},
										$$slots: { default: true }
									});

									var node_7 = $.sibling(node_6, 2);

									Select(node_7, {
										type: 'single',
										get items() {
											return CURRENCIES;
										},
										value: 'usd',
										children: ($$anchor, $$slotProps) => {
											var fragment_8 = root_1();
											var node_8 = $.first_child(fragment_8);

											SelectTrigger(node_8, {
												id: 'preferred-currency',
												class: 'w-full',
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_3 = $.text('USD — United States Dollar');

													$.append($$anchor, text_3);
												},
												$$slots: { default: true }
											});

											var node_9 = $.sibling(node_8, 2);

											SelectContent(node_9, {
												class: 'w-(--bits-select-anchor-width)',
												children: ($$anchor, $$slotProps) => {
													SelectGroup($$anchor, {
														children: ($$anchor, $$slotProps) => {
															var fragment_10 = $.comment();
															var node_10 = $.first_child(fragment_10);

															$.each(node_10, 17, () => CURRENCIES, (item) => item.value, ($$anchor, item) => {
																SelectItem($$anchor, {
																	get value() {
																		return $.get(item).value;
																	},

																	children: ($$anchor, $$slotProps) => {
																		$.next();

																		var text_4 = $.text();

																		$.template_effect(() => $.set_text(text_4, $.get(item).label));
																		$.append($$anchor, text_4);
																	},
																	$$slots: { default: true }
																});
															});

															$.append($$anchor, fragment_10);
														},
														$$slots: { default: true }
													});
												},
												$$slots: { default: true }
											});

											$.append($$anchor, fragment_8);
										},
										$$slots: { default: true }
									});

									$.append($$anchor, fragment_7);
								},
								$$slots: { default: true }
							});

							var node_11 = $.sibling(node_5, 2);

							Field(node_11, {
								children: ($$anchor, $$slotProps) => {
									var fragment_13 = root_2();
									var div = $.first_child(fragment_13);
									var node_12 = $.child(div);

									FieldLabel(node_12, {
										id: 'min-payout-label',
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_5 = $.text('Minimum Payout Amount');

											$.append($$anchor, text_5);
										},
										$$slots: { default: true }
									});

									$.next(2);
									$.reset(div);

									var node_13 = $.sibling(div, 2);

									Progress(node_13, {
										value: 25,
										'aria-labelledby': 'min-payout-label',
										'aria-valuetext': '$2,500 of $10,000'
									});

									var div_1 = $.sibling(node_13, 2);
									var node_14 = $.child(div_1);

									FieldDescription(node_14, {
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_6 = $.text('$50 (MIN)');

											$.append($$anchor, text_6);
										},
										$$slots: { default: true }
									});

									var node_15 = $.sibling(node_14, 2);

									FieldDescription(node_15, {
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_7 = $.text('$10,000 (MAX)');

											$.append($$anchor, text_7);
										},
										$$slots: { default: true }
									});

									$.reset(div_1);
									$.append($$anchor, fragment_13);
								},
								$$slots: { default: true }
							});

							var node_16 = $.sibling(node_11, 2);

							Field(node_16, {
								children: ($$anchor, $$slotProps) => {
									var fragment_14 = root_1();
									var node_17 = $.first_child(fragment_14);

									FieldLabel(node_17, {
										for: 'payout-notes',
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_8 = $.text('Notes');

											$.append($$anchor, text_8);
										},
										$$slots: { default: true }
									});

									var node_18 = $.sibling(node_17, 2);

									Textarea(node_18, {
										id: 'payout-notes',
										placeholder: 'Add any notes for this payout configuration...',
										class: 'min-h-[100px]'
									});

									$.append($$anchor, fragment_14);
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

			var node_19 = $.sibling(node_4, 2);

			CardFooter(node_19, {
				children: ($$anchor, $$slotProps) => {
					Button($$anchor, {
						class: 'w-full',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_9 = $.text('Save Threshold');

							$.append($$anchor, text_9);
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