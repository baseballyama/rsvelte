import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as Card from "$lib/registry/ui/card/index.js";
import * as Field from "$lib/registry/ui/field/index.js";
import * as InputGroup from "$lib/registry/ui/input-group/index.js";
import * as Item from "$lib/registry/ui/item/index.js";
import * as Select from "$lib/registry/ui/select/index.js";
import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
import { Button } from "$lib/registry/ui/button/index.js";
import { Separator } from "$lib/registry/ui/separator/index.js";

var root = $.from_html(`<!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);
var root_2 = $.from_html(`<div class="flex items-center justify-between"><span class="text-sm text-muted-foreground">Estimated arrival</span> <span class="text-sm font-medium">Today, Apr 14</span></div> <!> <div class="flex items-center justify-between"><span class="text-sm text-muted-foreground">Transaction fee</span> <span class="text-sm font-medium tabular-nums">$0.00</span></div> <!> <div class="flex items-center justify-between"><span class="text-sm font-medium">Total amount</span> <span class="text-sm font-semibold tabular-nums">$1,200.00</span></div>`, 1);
var root_3 = $.from_html(`<!> <!> <!> <!>`, 1);

export default function Transfer_funds($$anchor, $$props) {
	$.push($$props, true);

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

										var text = $.text('Transfer Funds');

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

										var text_1 = $.text('Move money between your connected accounts.');

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

							$.component(node_6, () => Field.Group, ($$anchor, Field_Group) => {
								Field_Group($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_6 = root_3();
										var node_7 = $.first_child(fragment_6);

										$.component(node_7, () => Field.Field, ($$anchor, Field_Field) => {
											Field_Field($$anchor, {
												children: ($$anchor, $$slotProps) => {
													var fragment_7 = root_1();
													var node_8 = $.first_child(fragment_7);

													$.component(node_8, () => Field.Label, ($$anchor, Field_Label) => {
														Field_Label($$anchor, {
															for: 'transfer-amount',
															children: ($$anchor, $$slotProps) => {
																$.next();

																var text_2 = $.text('Amount to Transfer');

																$.append($$anchor, text_2);
															},
															$$slots: { default: true }
														});
													});

													var node_9 = $.sibling(node_8, 2);

													$.component(node_9, () => InputGroup.Root, ($$anchor, InputGroup_Root) => {
														InputGroup_Root($$anchor, {
															children: ($$anchor, $$slotProps) => {
																var fragment_8 = root_1();
																var node_10 = $.first_child(fragment_8);

																$.component(node_10, () => InputGroup.Addon, ($$anchor, InputGroup_Addon) => {
																	InputGroup_Addon($$anchor, {
																		children: ($$anchor, $$slotProps) => {
																			var fragment_9 = $.comment();
																			var node_11 = $.first_child(fragment_9);

																			$.component(node_11, () => InputGroup.Text, ($$anchor, InputGroup_Text) => {
																				InputGroup_Text($$anchor, {
																					children: ($$anchor, $$slotProps) => {
																						$.next();

																						var text_3 = $.text('$');

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

																var node_12 = $.sibling(node_10, 2);

																$.component(node_12, () => InputGroup.Input, ($$anchor, InputGroup_Input) => {
																	InputGroup_Input($$anchor, { id: 'transfer-amount', value: '1,200.00' });
																});

																$.append($$anchor, fragment_8);
															},
															$$slots: { default: true }
														});
													});

													$.append($$anchor, fragment_7);
												},
												$$slots: { default: true }
											});
										});

										var node_13 = $.sibling(node_7, 2);

										$.component(node_13, () => Field.Field, ($$anchor, Field_Field_1) => {
											Field_Field_1($$anchor, {
												children: ($$anchor, $$slotProps) => {
													var fragment_10 = root_1();
													var node_14 = $.first_child(fragment_10);

													$.component(node_14, () => Field.Label, ($$anchor, Field_Label_1) => {
														Field_Label_1($$anchor, {
															for: 'from-account',
															children: ($$anchor, $$slotProps) => {
																$.next();

																var text_4 = $.text('From Account');

																$.append($$anchor, text_4);
															},
															$$slots: { default: true }
														});
													});

													var node_15 = $.sibling(node_14, 2);

													$.component(node_15, () => Select.Root, ($$anchor, Select_Root) => {
														Select_Root($$anchor, {
															type: 'single',
															get value() {
																return $.get(fromAccount);
															},

															set value($$value) {
																$.set(fromAccount, $$value, true);
															},

															children: ($$anchor, $$slotProps) => {
																var fragment_11 = root_1();
																var node_16 = $.first_child(fragment_11);

																$.component(node_16, () => Select.Trigger, ($$anchor, Select_Trigger) => {
																	Select_Trigger($$anchor, {
																		id: 'from-account',
																		class: 'w-full',
																		children: ($$anchor, $$slotProps) => {
																			$.next();

																			var text_5 = $.text();

																			$.template_effect(($0) => $.set_text(text_5, $0), [
																				() => FROM_ACCOUNTS.find((a) => a.value === $.get(fromAccount))?.label
																			]);

																			$.append($$anchor, text_5);
																		},
																		$$slots: { default: true }
																	});
																});

																var node_17 = $.sibling(node_16, 2);

																$.component(node_17, () => Select.Content, ($$anchor, Select_Content) => {
																	Select_Content($$anchor, {
																		children: ($$anchor, $$slotProps) => {
																			var fragment_13 = $.comment();
																			var node_18 = $.first_child(fragment_13);

																			$.component(node_18, () => Select.Group, ($$anchor, Select_Group) => {
																				Select_Group($$anchor, {
																					children: ($$anchor, $$slotProps) => {
																						var fragment_14 = $.comment();
																						var node_19 = $.first_child(fragment_14);

																						$.each(node_19, 17, () => FROM_ACCOUNTS, (item) => item.value, ($$anchor, item) => {
																							var fragment_15 = $.comment();
																							var node_20 = $.first_child(fragment_15);

																							$.component(node_20, () => Select.Item, ($$anchor, Select_Item) => {
																								Select_Item($$anchor, {
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

																							$.append($$anchor, fragment_15);
																						});

																						$.append($$anchor, fragment_14);
																					},
																					$$slots: { default: true }
																				});
																			});

																			$.append($$anchor, fragment_13);
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

										var node_21 = $.sibling(node_13, 2);

										$.component(node_21, () => Field.Field, ($$anchor, Field_Field_2) => {
											Field_Field_2($$anchor, {
												children: ($$anchor, $$slotProps) => {
													var fragment_17 = root_1();
													var node_22 = $.first_child(fragment_17);

													$.component(node_22, () => Field.Label, ($$anchor, Field_Label_2) => {
														Field_Label_2($$anchor, {
															for: 'to-account',
															children: ($$anchor, $$slotProps) => {
																$.next();

																var text_7 = $.text('To Account');

																$.append($$anchor, text_7);
															},
															$$slots: { default: true }
														});
													});

													var node_23 = $.sibling(node_22, 2);

													$.component(node_23, () => Select.Root, ($$anchor, Select_Root_1) => {
														Select_Root_1($$anchor, {
															type: 'single',
															get value() {
																return $.get(toAccount);
															},

															set value($$value) {
																$.set(toAccount, $$value, true);
															},

															children: ($$anchor, $$slotProps) => {
																var fragment_18 = root_1();
																var node_24 = $.first_child(fragment_18);

																$.component(node_24, () => Select.Trigger, ($$anchor, Select_Trigger_1) => {
																	Select_Trigger_1($$anchor, {
																		id: 'to-account',
																		class: 'w-full',
																		children: ($$anchor, $$slotProps) => {
																			$.next();

																			var text_8 = $.text();

																			$.template_effect(($0) => $.set_text(text_8, $0), [
																				() => TO_ACCOUNTS.find((a) => a.value === $.get(toAccount))?.label
																			]);

																			$.append($$anchor, text_8);
																		},
																		$$slots: { default: true }
																	});
																});

																var node_25 = $.sibling(node_24, 2);

																$.component(node_25, () => Select.Content, ($$anchor, Select_Content_1) => {
																	Select_Content_1($$anchor, {
																		children: ($$anchor, $$slotProps) => {
																			var fragment_20 = $.comment();
																			var node_26 = $.first_child(fragment_20);

																			$.component(node_26, () => Select.Group, ($$anchor, Select_Group_1) => {
																				Select_Group_1($$anchor, {
																					children: ($$anchor, $$slotProps) => {
																						var fragment_21 = $.comment();
																						var node_27 = $.first_child(fragment_21);

																						$.each(node_27, 17, () => TO_ACCOUNTS, (item) => item.value, ($$anchor, item) => {
																							var fragment_22 = $.comment();
																							var node_28 = $.first_child(fragment_22);

																							$.component(node_28, () => Select.Item, ($$anchor, Select_Item_1) => {
																								Select_Item_1($$anchor, {
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

																							$.append($$anchor, fragment_22);
																						});

																						$.append($$anchor, fragment_21);
																					},
																					$$slots: { default: true }
																				});
																			});

																			$.append($$anchor, fragment_20);
																		},
																		$$slots: { default: true }
																	});
																});

																$.append($$anchor, fragment_18);
															},
															$$slots: { default: true }
														});
													});

													$.append($$anchor, fragment_17);
												},
												$$slots: { default: true }
											});
										});

										var node_29 = $.sibling(node_21, 2);

										$.component(node_29, () => Item.Root, ($$anchor, Item_Root) => {
											Item_Root($$anchor, {
												variant: 'muted',
												class: 'flex-col items-stretch',
												children: ($$anchor, $$slotProps) => {
													var fragment_24 = $.comment();
													var node_30 = $.first_child(fragment_24);

													$.component(node_30, () => Item.Content, ($$anchor, Item_Content) => {
														Item_Content($$anchor, {
															class: 'gap-3',
															children: ($$anchor, $$slotProps) => {
																var fragment_25 = root_2();
																var node_31 = $.sibling($.first_child(fragment_25), 2);

																Separator(node_31, {});

																var node_32 = $.sibling(node_31, 4);

																Separator(node_32, {});
																$.next(2);
																$.append($$anchor, fragment_25);
															},
															$$slots: { default: true }
														});
													});

													$.append($$anchor, fragment_24);
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

				var node_33 = $.sibling(node_5, 2);

				$.component(node_33, () => Card.Footer, ($$anchor, Card_Footer) => {
					Card_Footer($$anchor, {
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
				});

				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		});
	});

	$.append($$anchor, fragment);
	$.pop();
}