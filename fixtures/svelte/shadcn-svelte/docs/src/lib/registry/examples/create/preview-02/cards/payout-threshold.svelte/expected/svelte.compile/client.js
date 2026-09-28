import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as Card from "$lib/registry/ui/card/index.js";
import * as Field from "$lib/registry/ui/field/index.js";
import * as Select from "$lib/registry/ui/select/index.js";
import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
import { Button } from "$lib/registry/ui/button/index.js";
import { Slider } from "$lib/registry/ui/slider/index.js";
import { Textarea } from "$lib/registry/ui/textarea/index.js";

var root = $.from_html(`<!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);
var root_2 = $.from_html(`<div class="flex items-baseline justify-between"><!> <span class="text-2xl font-semibold tabular-nums"> </span></div> <!> <div class="flex items-center justify-between"><!> <!></div>`, 1);

export default function Payout_threshold($$anchor, $$props) {
	$.push($$props, true);

	const CURRENCIES = [
		{ label: "USD — United States Dollar", value: "usd" },
		{ label: "EUR — Euro", value: "eur" },
		{ label: "GBP — British Pound", value: "gbp" },
		{ label: "JPY — Japanese Yen", value: "jpy" }
	];

	let amount = $.state($.proxy([3000]));
	let currency = $.state("usd");
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

										var text = $.text('Payout Threshold');

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

										var text_1 = $.text('Set the minimum balance required before a payout is triggered.');

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
										var fragment_6 = root();
										var node_7 = $.first_child(fragment_6);

										$.component(node_7, () => Field.Field, ($$anchor, Field_Field) => {
											Field_Field($$anchor, {
												children: ($$anchor, $$slotProps) => {
													var fragment_7 = root_1();
													var node_8 = $.first_child(fragment_7);

													$.component(node_8, () => Field.Label, ($$anchor, Field_Label) => {
														Field_Label($$anchor, {
															for: 'preferred-currency',
															children: ($$anchor, $$slotProps) => {
																$.next();

																var text_2 = $.text('Preferred Currency');

																$.append($$anchor, text_2);
															},
															$$slots: { default: true }
														});
													});

													var node_9 = $.sibling(node_8, 2);

													$.component(node_9, () => Select.Root, ($$anchor, Select_Root) => {
														Select_Root($$anchor, {
															type: 'single',
															get value() {
																return $.get(currency);
															},

															set value($$value) {
																$.set(currency, $$value, true);
															},

															children: ($$anchor, $$slotProps) => {
																var fragment_8 = root_1();
																var node_10 = $.first_child(fragment_8);

																$.component(node_10, () => Select.Trigger, ($$anchor, Select_Trigger) => {
																	Select_Trigger($$anchor, {
																		id: 'preferred-currency',
																		class: 'w-full',
																		children: ($$anchor, $$slotProps) => {
																			$.next();

																			var text_3 = $.text();

																			$.template_effect(($0) => $.set_text(text_3, $0), [
																				() => CURRENCIES.find((c) => c.value === $.get(currency))?.label
																			]);

																			$.append($$anchor, text_3);
																		},
																		$$slots: { default: true }
																	});
																});

																var node_11 = $.sibling(node_10, 2);

																$.component(node_11, () => Select.Content, ($$anchor, Select_Content) => {
																	Select_Content($$anchor, {
																		children: ($$anchor, $$slotProps) => {
																			var fragment_10 = $.comment();
																			var node_12 = $.first_child(fragment_10);

																			$.component(node_12, () => Select.Group, ($$anchor, Select_Group) => {
																				Select_Group($$anchor, {
																					children: ($$anchor, $$slotProps) => {
																						var fragment_11 = $.comment();
																						var node_13 = $.first_child(fragment_11);

																						$.each(node_13, 17, () => CURRENCIES, (item) => item.value, ($$anchor, item) => {
																							var fragment_12 = $.comment();
																							var node_14 = $.first_child(fragment_12);

																							$.component(node_14, () => Select.Item, ($$anchor, Select_Item) => {
																								Select_Item($$anchor, {
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

																							$.append($$anchor, fragment_12);
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

										var node_15 = $.sibling(node_7, 2);

										$.component(node_15, () => Field.Field, ($$anchor, Field_Field_1) => {
											Field_Field_1($$anchor, {
												children: ($$anchor, $$slotProps) => {
													var fragment_14 = root_2();
													var div = $.first_child(fragment_14);
													var node_16 = $.child(div);

													$.component(node_16, () => Field.Label, ($$anchor, Field_Label_1) => {
														Field_Label_1($$anchor, {
															for: 'min-payout',
															children: ($$anchor, $$slotProps) => {
																$.next();

																var text_5 = $.text('Minimum Payout Amount');

																$.append($$anchor, text_5);
															},
															$$slots: { default: true }
														});
													});

													var span = $.sibling(node_16, 2);
													var text_6 = $.only_child(span);

													$.reset(div);

													var node_17 = $.sibling(div, 2);

													Slider(node_17, {
														type: 'multiple',
														id: 'min-payout',
														min: 50,
														max: 10000,
														step: 50,
														get value() {
															return $.get(amount);
														},

														set value($$value) {
															$.set(amount, $$value, true);
														}
													});

													var div_1 = $.sibling(node_17, 2);
													var node_18 = $.child(div_1);

													$.component(node_18, () => Field.Description, ($$anchor, Field_Description) => {
														Field_Description($$anchor, {
															children: ($$anchor, $$slotProps) => {
																$.next();

																var text_7 = $.text('$50 (MIN)');

																$.append($$anchor, text_7);
															},
															$$slots: { default: true }
														});
													});

													var node_19 = $.sibling(node_18, 2);

													$.component(node_19, () => Field.Description, ($$anchor, Field_Description_1) => {
														Field_Description_1($$anchor, {
															children: ($$anchor, $$slotProps) => {
																$.next();

																var text_8 = $.text('$10,000 (MAX)');

																$.append($$anchor, text_8);
															},
															$$slots: { default: true }
														});
													});

													$.reset(div_1);
													$.template_effect(($0) => $.set_text(text_6, `$${$0 ?? ''}`), [() => $.get(amount)[0].toFixed(2)]);
													$.append($$anchor, fragment_14);
												},
												$$slots: { default: true }
											});
										});

										var node_20 = $.sibling(node_15, 2);

										$.component(node_20, () => Field.Field, ($$anchor, Field_Field_2) => {
											Field_Field_2($$anchor, {
												children: ($$anchor, $$slotProps) => {
													var fragment_15 = root_1();
													var node_21 = $.first_child(fragment_15);

													$.component(node_21, () => Field.Label, ($$anchor, Field_Label_2) => {
														Field_Label_2($$anchor, {
															for: 'payout-notes',
															children: ($$anchor, $$slotProps) => {
																$.next();

																var text_9 = $.text('Notes');

																$.append($$anchor, text_9);
															},
															$$slots: { default: true }
														});
													});

													var node_22 = $.sibling(node_21, 2);

													Textarea(node_22, {
														id: 'payout-notes',
														placeholder: 'Add any notes for this payout configuration...',
														class: 'min-h-[100px]'
													});

													$.append($$anchor, fragment_15);
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

				var node_23 = $.sibling(node_5, 2);

				$.component(node_23, () => Card.Footer, ($$anchor, Card_Footer) => {
					Card_Footer($$anchor, {
						children: ($$anchor, $$slotProps) => {
							Button($$anchor, {
								class: 'w-full',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_10 = $.text('Save Threshold');

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