import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as Card from "$lib/registry/ui/card/index.js";
import * as Field from "$lib/registry/ui/field/index.js";
import * as RadioGroup from "$lib/registry/ui/radio-group/index.js";
import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
import { Button } from "$lib/registry/ui/button/index.js";
import { Input } from "$lib/registry/ui/input/index.js";

var root = $.from_html(`<!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);

export default function Receiving_method($$anchor) {
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

							$.component(node_2, () => Card.Description, ($$anchor, Card_Description) => {
								Card_Description($$anchor, {
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text = $.text('Payout Preferences');

										$.append($$anchor, text);
									},
									$$slots: { default: true }
								});
							});

							var node_3 = $.sibling(node_2, 2);

							$.component(node_3, () => Card.Title, ($$anchor, Card_Title) => {
								Card_Title($$anchor, {
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_1 = $.text('Receiving Method');

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
															for: 'account-holder',
															children: ($$anchor, $$slotProps) => {
																$.next();

																var text_2 = $.text('Account Holder Name');

																$.append($$anchor, text_2);
															},
															$$slots: { default: true }
														});
													});

													var node_9 = $.sibling(node_8, 2);

													Input(node_9, { id: 'account-holder', value: 'Synthetic Horizons Music LLC' });
													$.append($$anchor, fragment_7);
												},
												$$slots: { default: true }
											});
										});

										var node_10 = $.sibling(node_7, 2);

										$.component(node_10, () => Field.Set, ($$anchor, Field_Set) => {
											Field_Set($$anchor, {
												children: ($$anchor, $$slotProps) => {
													var fragment_8 = root_1();
													var node_11 = $.first_child(fragment_8);

													$.component(node_11, () => Field.Legend, ($$anchor, Field_Legend) => {
														Field_Legend($$anchor, {
															variant: 'label',
															children: ($$anchor, $$slotProps) => {
																$.next();

																var text_3 = $.text('Receiving Method');

																$.append($$anchor, text_3);
															},
															$$slots: { default: true }
														});
													});

													var node_12 = $.sibling(node_11, 2);

													$.component(node_12, () => RadioGroup.Root, ($$anchor, RadioGroup_Root) => {
														RadioGroup_Root($$anchor, {
															value: 'bank',
															class: 'grid grid-cols-1 items-start gap-3 md:grid-cols-2',
															children: ($$anchor, $$slotProps) => {
																var fragment_9 = root_1();
																var node_13 = $.first_child(fragment_9);

																$.component(node_13, () => Field.Label, ($$anchor, Field_Label_1) => {
																	Field_Label_1($$anchor, {
																		for: 'method-bank',
																		children: ($$anchor, $$slotProps) => {
																			var fragment_10 = $.comment();
																			var node_14 = $.first_child(fragment_10);

																			$.component(node_14, () => Field.Field, ($$anchor, Field_Field_1) => {
																				Field_Field_1($$anchor, {
																					orientation: 'horizontal',
																					class: 'pb-2.5',
																					children: ($$anchor, $$slotProps) => {
																						var fragment_11 = root_1();
																						var node_15 = $.first_child(fragment_11);

																						$.component(node_15, () => RadioGroup.Item, ($$anchor, RadioGroup_Item) => {
																							RadioGroup_Item($$anchor, { value: 'bank', id: 'method-bank' });
																						});

																						var node_16 = $.sibling(node_15, 2);

																						$.component(node_16, () => Field.Content, ($$anchor, Field_Content) => {
																							Field_Content($$anchor, {
																								children: ($$anchor, $$slotProps) => {
																									var fragment_12 = root_1();
																									var node_17 = $.first_child(fragment_12);

																									$.component(node_17, () => Field.Description, ($$anchor, Field_Description) => {
																										Field_Description($$anchor, {
																											class: 'font-medium text-foreground',
																											children: ($$anchor, $$slotProps) => {
																												$.next();

																												var text_4 = $.text('Bank Transfer');

																												$.append($$anchor, text_4);
																											},
																											$$slots: { default: true }
																										});
																									});

																									var node_18 = $.sibling(node_17, 2);

																									$.component(node_18, () => Field.Description, ($$anchor, Field_Description_1) => {
																										Field_Description_1($$anchor, {
																											children: ($$anchor, $$slotProps) => {
																												$.next();

																												var text_5 = $.text('SWIFT / IBAN');

																												$.append($$anchor, text_5);
																											},
																											$$slots: { default: true }
																										});
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

																var node_19 = $.sibling(node_13, 2);

																$.component(node_19, () => Field.Label, ($$anchor, Field_Label_2) => {
																	Field_Label_2($$anchor, {
																		for: 'method-paypal',
																		children: ($$anchor, $$slotProps) => {
																			var fragment_13 = $.comment();
																			var node_20 = $.first_child(fragment_13);

																			$.component(node_20, () => Field.Field, ($$anchor, Field_Field_2) => {
																				Field_Field_2($$anchor, {
																					orientation: 'horizontal',
																					class: 'pb-2.5',
																					children: ($$anchor, $$slotProps) => {
																						var fragment_14 = root_1();
																						var node_21 = $.first_child(fragment_14);

																						$.component(node_21, () => RadioGroup.Item, ($$anchor, RadioGroup_Item_1) => {
																							RadioGroup_Item_1($$anchor, { value: 'paypal', id: 'method-paypal' });
																						});

																						var node_22 = $.sibling(node_21, 2);

																						$.component(node_22, () => Field.Content, ($$anchor, Field_Content_1) => {
																							Field_Content_1($$anchor, {
																								children: ($$anchor, $$slotProps) => {
																									var fragment_15 = root_1();
																									var node_23 = $.first_child(fragment_15);

																									$.component(node_23, () => Field.Description, ($$anchor, Field_Description_2) => {
																										Field_Description_2($$anchor, {
																											class: 'font-medium text-foreground',
																											children: ($$anchor, $$slotProps) => {
																												$.next();

																												var text_6 = $.text('PayPal');

																												$.append($$anchor, text_6);
																											},
																											$$slots: { default: true }
																										});
																									});

																									var node_24 = $.sibling(node_23, 2);

																									$.component(node_24, () => Field.Description, ($$anchor, Field_Description_3) => {
																										Field_Description_3($$anchor, {
																											class: 'line-clamp-1',
																											children: ($$anchor, $$slotProps) => {
																												$.next();

																												var text_7 = $.text('Instant Payout');

																												$.append($$anchor, text_7);
																											},
																											$$slots: { default: true }
																										});
																									});

																									$.append($$anchor, fragment_15);
																								},
																								$$slots: { default: true }
																							});
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

																$.append($$anchor, fragment_9);
															},
															$$slots: { default: true }
														});
													});

													$.append($$anchor, fragment_8);
												},
												$$slots: { default: true }
											});
										});

										var node_25 = $.sibling(node_10, 2);

										$.component(node_25, () => Field.Field, ($$anchor, Field_Field_3) => {
											Field_Field_3($$anchor, {
												children: ($$anchor, $$slotProps) => {
													var fragment_16 = root_1();
													var node_26 = $.first_child(fragment_16);

													$.component(node_26, () => Field.Label, ($$anchor, Field_Label_3) => {
														Field_Label_3($$anchor, {
															for: 'iban',
															children: ($$anchor, $$slotProps) => {
																$.next();

																var text_8 = $.text('IBAN / Account Number');

																$.append($$anchor, text_8);
															},
															$$slots: { default: true }
														});
													});

													var node_27 = $.sibling(node_26, 2);

													Input(node_27, { id: 'iban', placeholder: 'DE89 3704 0044 ....' });
													$.append($$anchor, fragment_16);
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

				var node_28 = $.sibling(node_5, 2);

				$.component(node_28, () => Card.Footer, ($$anchor, Card_Footer) => {
					Card_Footer($$anchor, {
						children: ($$anchor, $$slotProps) => {
							Button($$anchor, {
								class: 'w-full',
								disabled: true,
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_9 = $.text('Save Payout Settings');

									$.append($$anchor, text_9);
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
}