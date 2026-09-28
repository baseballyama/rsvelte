import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as Card from "$lib/registry/ui/card/index.js";
import * as Field from "$lib/registry/ui/field/index.js";
import * as Select from "$lib/registry/ui/select/index.js";
import { Button } from "$lib/registry/ui/button/index.js";
import { Checkbox } from "$lib/registry/ui/checkbox/index.js";
import { Input } from "$lib/registry/ui/input/index.js";
import { Textarea } from "$lib/registry/ui/textarea/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!>`, 1);
var root_2 = $.from_html(`<!> <div class="grid grid-cols-3 gap-4"><!> <!></div> <div class="grid grid-cols-2 gap-4"><!> <!></div>`, 1);
var root_3 = $.from_html(`<!> <!> <!> <!> <!> <!>`, 1);
var root_4 = $.from_html(`<form><!></form>`);

export default function Form_example($$anchor, $$props) {
	$.push($$props, true);

	const monthItems = [
		{ label: "01", value: "01" },
		{ label: "02", value: "02" },
		{ label: "03", value: "03" },
		{ label: "04", value: "04" },
		{ label: "05", value: "05" },
		{ label: "06", value: "06" },
		{ label: "07", value: "07" },
		{ label: "08", value: "08" },
		{ label: "09", value: "09" },
		{ label: "10", value: "10" },
		{ label: "11", value: "11" },
		{ label: "12", value: "12" }
	];

	const yearItems = [
		{ label: "2024", value: "2024" },
		{ label: "2025", value: "2025" },
		{ label: "2026", value: "2026" },
		{ label: "2027", value: "2027" },
		{ label: "2028", value: "2028" },
		{ label: "2029", value: "2029" }
	];

	let month = $.state(undefined);
	let year = $.state(undefined);
	const monthLabel = $.derived(() => monthItems.find((item) => item.value === $.get(month))?.label ?? "MM");
	const yearLabel = $.derived(() => yearItems.find((item) => item.value === $.get(year))?.label ?? "YYYY");

	Example($$anchor, {
		title: 'Complex Form',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = $.comment();
			var node = $.first_child(fragment_1);

			$.component(node, () => Card.Root, ($$anchor, Card_Root) => {
				Card_Root($$anchor, {
					class: 'w-full max-w-md',
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = root();
						var node_1 = $.first_child(fragment_2);

						$.component(node_1, () => Card.Header, ($$anchor, Card_Header) => {
							Card_Header($$anchor, {
								children: ($$anchor, $$slotProps) => {
									var fragment_3 = root();
									var node_2 = $.first_child(fragment_3);

									$.component(node_2, () => Card.Title, ($$anchor, Card_Title) => {
										Card_Title($$anchor, {
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text = $.text('Payment Method');

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

												var text_1 = $.text('All transactions are secure and encrypted');

												$.append($$anchor, text_1);
											},
											$$slots: { default: true }
										});
									});

									$.append($$anchor, fragment_3);
								},
								$$slots: { default: true }
							});
						});

						var node_4 = $.sibling(node_1, 2);

						$.component(node_4, () => Card.Content, ($$anchor, Card_Content) => {
							Card_Content($$anchor, {
								children: ($$anchor, $$slotProps) => {
									var form = root_4();
									var node_5 = $.child(form);

									$.component(node_5, () => Field.Group, ($$anchor, Field_Group) => {
										Field_Group($$anchor, {
											children: ($$anchor, $$slotProps) => {
												var fragment_4 = root_3();
												var node_6 = $.first_child(fragment_4);

												$.component(node_6, () => Field.Set, ($$anchor, Field_Set) => {
													Field_Set($$anchor, {
														children: ($$anchor, $$slotProps) => {
															var fragment_5 = $.comment();
															var node_7 = $.first_child(fragment_5);

															$.component(node_7, () => Field.Group, ($$anchor, Field_Group_1) => {
																Field_Group_1($$anchor, {
																	children: ($$anchor, $$slotProps) => {
																		var fragment_6 = root_2();
																		var node_8 = $.first_child(fragment_6);

																		$.component(node_8, () => Field.Field, ($$anchor, Field_Field) => {
																			Field_Field($$anchor, {
																				children: ($$anchor, $$slotProps) => {
																					var fragment_7 = root();
																					var node_9 = $.first_child(fragment_7);

																					$.component(node_9, () => Field.Label, ($$anchor, Field_Label) => {
																						Field_Label($$anchor, {
																							for: 'checkout-7j9-card-name-43j',
																							children: ($$anchor, $$slotProps) => {
																								$.next();

																								var text_2 = $.text('Name on Card');

																								$.append($$anchor, text_2);
																							},
																							$$slots: { default: true }
																						});
																					});

																					var node_10 = $.sibling(node_9, 2);

																					Input(node_10, {
																						id: 'checkout-7j9-card-name-43j',
																						placeholder: 'John Doe',
																						required: true
																					});

																					$.append($$anchor, fragment_7);
																				},
																				$$slots: { default: true }
																			});
																		});

																		var div = $.sibling(node_8, 2);
																		var node_11 = $.child(div);

																		$.component(node_11, () => Field.Field, ($$anchor, Field_Field_1) => {
																			Field_Field_1($$anchor, {
																				class: 'col-span-2',
																				children: ($$anchor, $$slotProps) => {
																					var fragment_8 = root_1();
																					var node_12 = $.first_child(fragment_8);

																					$.component(node_12, () => Field.Label, ($$anchor, Field_Label_1) => {
																						Field_Label_1($$anchor, {
																							for: 'checkout-7j9-card-number-uw1',
																							children: ($$anchor, $$slotProps) => {
																								$.next();

																								var text_3 = $.text('Card Number');

																								$.append($$anchor, text_3);
																							},
																							$$slots: { default: true }
																						});
																					});

																					var node_13 = $.sibling(node_12, 2);

																					Input(node_13, {
																						id: 'checkout-7j9-card-number-uw1',
																						placeholder: '1234 5678 9012 3456',
																						required: true
																					});

																					var node_14 = $.sibling(node_13, 2);

																					$.component(node_14, () => Field.Description, ($$anchor, Field_Description) => {
																						Field_Description($$anchor, {
																							children: ($$anchor, $$slotProps) => {
																								$.next();

																								var text_4 = $.text('Enter your 16-digit number.');

																								$.append($$anchor, text_4);
																							},
																							$$slots: { default: true }
																						});
																					});

																					$.append($$anchor, fragment_8);
																				},
																				$$slots: { default: true }
																			});
																		});

																		var node_15 = $.sibling(node_11, 2);

																		$.component(node_15, () => Field.Field, ($$anchor, Field_Field_2) => {
																			Field_Field_2($$anchor, {
																				class: 'col-span-1',
																				children: ($$anchor, $$slotProps) => {
																					var fragment_9 = root();
																					var node_16 = $.first_child(fragment_9);

																					$.component(node_16, () => Field.Label, ($$anchor, Field_Label_2) => {
																						Field_Label_2($$anchor, {
																							for: 'checkout-7j9-cvv',
																							children: ($$anchor, $$slotProps) => {
																								$.next();

																								var text_5 = $.text('CVV');

																								$.append($$anchor, text_5);
																							},
																							$$slots: { default: true }
																						});
																					});

																					var node_17 = $.sibling(node_16, 2);

																					Input(node_17, { id: 'checkout-7j9-cvv', placeholder: '123', required: true });
																					$.append($$anchor, fragment_9);
																				},
																				$$slots: { default: true }
																			});
																		});

																		$.reset(div);

																		var div_1 = $.sibling(div, 2);
																		var node_18 = $.child(div_1);

																		$.component(node_18, () => Field.Field, ($$anchor, Field_Field_3) => {
																			Field_Field_3($$anchor, {
																				children: ($$anchor, $$slotProps) => {
																					var fragment_10 = root();
																					var node_19 = $.first_child(fragment_10);

																					$.component(node_19, () => Field.Label, ($$anchor, Field_Label_3) => {
																						Field_Label_3($$anchor, {
																							for: 'checkout-7j9-exp-month-ts6',
																							children: ($$anchor, $$slotProps) => {
																								$.next();

																								var text_6 = $.text('Month');

																								$.append($$anchor, text_6);
																							},
																							$$slots: { default: true }
																						});
																					});

																					var node_20 = $.sibling(node_19, 2);

																					$.component(node_20, () => Select.Root, ($$anchor, Select_Root) => {
																						Select_Root($$anchor, {
																							type: 'single',
																							get value() {
																								return $.get(month);
																							},

																							set value($$value) {
																								$.set(month, $$value, true);
																							},

																							children: ($$anchor, $$slotProps) => {
																								var fragment_11 = root();
																								var node_21 = $.first_child(fragment_11);

																								$.component(node_21, () => Select.Trigger, ($$anchor, Select_Trigger) => {
																									Select_Trigger($$anchor, {
																										id: 'checkout-7j9-exp-month-ts6',
																										children: ($$anchor, $$slotProps) => {
																											$.next();

																											var text_7 = $.text();

																											$.template_effect(() => $.set_text(text_7, $.get(monthLabel)));
																											$.append($$anchor, text_7);
																										},
																										$$slots: { default: true }
																									});
																								});

																								var node_22 = $.sibling(node_21, 2);

																								$.component(node_22, () => Select.Content, ($$anchor, Select_Content) => {
																									Select_Content($$anchor, {
																										children: ($$anchor, $$slotProps) => {
																											var fragment_13 = $.comment();
																											var node_23 = $.first_child(fragment_13);

																											$.component(node_23, () => Select.Group, ($$anchor, Select_Group) => {
																												Select_Group($$anchor, {
																													children: ($$anchor, $$slotProps) => {
																														var fragment_14 = $.comment();
																														var node_24 = $.first_child(fragment_14);

																														$.each(node_24, 17, () => monthItems, (item) => item.value, ($$anchor, item) => {
																															var fragment_15 = $.comment();
																															var node_25 = $.first_child(fragment_15);

																															$.component(node_25, () => Select.Item, ($$anchor, Select_Item) => {
																																Select_Item($$anchor, {
																																	get value() {
																																		return $.get(item).value;
																																	},

																																	children: ($$anchor, $$slotProps) => {
																																		$.next();

																																		var text_8 = $.text();

																																		$.template_effect(() => $.set_text(text_8, $.get(item).label));
																																		$.append($$anchor, text_8);
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

																		var node_26 = $.sibling(node_18, 2);

																		$.component(node_26, () => Field.Field, ($$anchor, Field_Field_4) => {
																			Field_Field_4($$anchor, {
																				children: ($$anchor, $$slotProps) => {
																					var fragment_17 = root();
																					var node_27 = $.first_child(fragment_17);

																					$.component(node_27, () => Field.Label, ($$anchor, Field_Label_4) => {
																						Field_Label_4($$anchor, {
																							for: 'checkout-7j9-exp-year-f59',
																							children: ($$anchor, $$slotProps) => {
																								$.next();

																								var text_9 = $.text('Year');

																								$.append($$anchor, text_9);
																							},
																							$$slots: { default: true }
																						});
																					});

																					var node_28 = $.sibling(node_27, 2);

																					$.component(node_28, () => Select.Root, ($$anchor, Select_Root_1) => {
																						Select_Root_1($$anchor, {
																							type: 'single',
																							get value() {
																								return $.get(year);
																							},

																							set value($$value) {
																								$.set(year, $$value, true);
																							},

																							children: ($$anchor, $$slotProps) => {
																								var fragment_18 = root();
																								var node_29 = $.first_child(fragment_18);

																								$.component(node_29, () => Select.Trigger, ($$anchor, Select_Trigger_1) => {
																									Select_Trigger_1($$anchor, {
																										id: 'checkout-7j9-exp-year-f59',
																										children: ($$anchor, $$slotProps) => {
																											$.next();

																											var text_10 = $.text();

																											$.template_effect(() => $.set_text(text_10, $.get(yearLabel)));
																											$.append($$anchor, text_10);
																										},
																										$$slots: { default: true }
																									});
																								});

																								var node_30 = $.sibling(node_29, 2);

																								$.component(node_30, () => Select.Content, ($$anchor, Select_Content_1) => {
																									Select_Content_1($$anchor, {
																										children: ($$anchor, $$slotProps) => {
																											var fragment_20 = $.comment();
																											var node_31 = $.first_child(fragment_20);

																											$.component(node_31, () => Select.Group, ($$anchor, Select_Group_1) => {
																												Select_Group_1($$anchor, {
																													children: ($$anchor, $$slotProps) => {
																														var fragment_21 = $.comment();
																														var node_32 = $.first_child(fragment_21);

																														$.each(node_32, 17, () => yearItems, (item) => item.value, ($$anchor, item) => {
																															var fragment_22 = $.comment();
																															var node_33 = $.first_child(fragment_22);

																															$.component(node_33, () => Select.Item, ($$anchor, Select_Item_1) => {
																																Select_Item_1($$anchor, {
																																	get value() {
																																		return $.get(item).value;
																																	},

																																	children: ($$anchor, $$slotProps) => {
																																		$.next();

																																		var text_11 = $.text();

																																		$.template_effect(() => $.set_text(text_11, $.get(item).label));
																																		$.append($$anchor, text_11);
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

																		$.reset(div_1);
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

												var node_34 = $.sibling(node_6, 2);

												$.component(node_34, () => Field.Separator, ($$anchor, Field_Separator) => {
													Field_Separator($$anchor, {});
												});

												var node_35 = $.sibling(node_34, 2);

												$.component(node_35, () => Field.Set, ($$anchor, Field_Set_1) => {
													Field_Set_1($$anchor, {
														children: ($$anchor, $$slotProps) => {
															var fragment_24 = root_1();
															var node_36 = $.first_child(fragment_24);

															$.component(node_36, () => Field.Legend, ($$anchor, Field_Legend) => {
																Field_Legend($$anchor, {
																	children: ($$anchor, $$slotProps) => {
																		$.next();

																		var text_12 = $.text('Billing Address');

																		$.append($$anchor, text_12);
																	},
																	$$slots: { default: true }
																});
															});

															var node_37 = $.sibling(node_36, 2);

															$.component(node_37, () => Field.Description, ($$anchor, Field_Description_1) => {
																Field_Description_1($$anchor, {
																	children: ($$anchor, $$slotProps) => {
																		$.next();

																		var text_13 = $.text('The billing address associated with your payment.');

																		$.append($$anchor, text_13);
																	},
																	$$slots: { default: true }
																});
															});

															var node_38 = $.sibling(node_37, 2);

															$.component(node_38, () => Field.Group, ($$anchor, Field_Group_2) => {
																Field_Group_2($$anchor, {
																	children: ($$anchor, $$slotProps) => {
																		var fragment_25 = $.comment();
																		var node_39 = $.first_child(fragment_25);

																		$.component(node_39, () => Field.Field, ($$anchor, Field_Field_5) => {
																			Field_Field_5($$anchor, {
																				orientation: 'horizontal',
																				children: ($$anchor, $$slotProps) => {
																					var fragment_26 = root();
																					var node_40 = $.first_child(fragment_26);

																					Checkbox(node_40, { id: 'checkout-7j9-same-as-shipping-wgm', checked: true });

																					var node_41 = $.sibling(node_40, 2);

																					$.component(node_41, () => Field.Label, ($$anchor, Field_Label_5) => {
																						Field_Label_5($$anchor, {
																							for: 'checkout-7j9-same-as-shipping-wgm',
																							class: 'font-normal',
																							children: ($$anchor, $$slotProps) => {
																								$.next();

																								var text_14 = $.text('Same as shipping address');

																								$.append($$anchor, text_14);
																							},
																							$$slots: { default: true }
																						});
																					});

																					$.append($$anchor, fragment_26);
																				},
																				$$slots: { default: true }
																			});
																		});

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

												var node_42 = $.sibling(node_35, 2);

												$.component(node_42, () => Field.Separator, ($$anchor, Field_Separator_1) => {
													Field_Separator_1($$anchor, {});
												});

												var node_43 = $.sibling(node_42, 2);

												$.component(node_43, () => Field.Set, ($$anchor, Field_Set_2) => {
													Field_Set_2($$anchor, {
														children: ($$anchor, $$slotProps) => {
															var fragment_27 = $.comment();
															var node_44 = $.first_child(fragment_27);

															$.component(node_44, () => Field.Group, ($$anchor, Field_Group_3) => {
																Field_Group_3($$anchor, {
																	children: ($$anchor, $$slotProps) => {
																		var fragment_28 = $.comment();
																		var node_45 = $.first_child(fragment_28);

																		$.component(node_45, () => Field.Field, ($$anchor, Field_Field_6) => {
																			Field_Field_6($$anchor, {
																				children: ($$anchor, $$slotProps) => {
																					var fragment_29 = root();
																					var node_46 = $.first_child(fragment_29);

																					$.component(node_46, () => Field.Label, ($$anchor, Field_Label_6) => {
																						Field_Label_6($$anchor, {
																							for: 'checkout-7j9-optional-comments',
																							children: ($$anchor, $$slotProps) => {
																								$.next();

																								var text_15 = $.text('Comments');

																								$.append($$anchor, text_15);
																							},
																							$$slots: { default: true }
																						});
																					});

																					var node_47 = $.sibling(node_46, 2);

																					Textarea(node_47, {
																						id: 'checkout-7j9-optional-comments',
																						placeholder: 'Add any additional comments'
																					});

																					$.append($$anchor, fragment_29);
																				},
																				$$slots: { default: true }
																			});
																		});

																		$.append($$anchor, fragment_28);
																	},
																	$$slots: { default: true }
																});
															});

															$.append($$anchor, fragment_27);
														},
														$$slots: { default: true }
													});
												});

												var node_48 = $.sibling(node_43, 2);

												$.component(node_48, () => Field.Field, ($$anchor, Field_Field_7) => {
													Field_Field_7($$anchor, {
														orientation: 'horizontal',
														children: ($$anchor, $$slotProps) => {
															var fragment_30 = root();
															var node_49 = $.first_child(fragment_30);

															Button(node_49, {
																type: 'submit',
																children: ($$anchor, $$slotProps) => {
																	$.next();

																	var text_16 = $.text('Submit');

																	$.append($$anchor, text_16);
																},
																$$slots: { default: true }
															});

															var node_50 = $.sibling(node_49, 2);

															Button(node_50, {
																variant: 'outline',
																type: 'button',
																children: ($$anchor, $$slotProps) => {
																	$.next();

																	var text_17 = $.text('Cancel');

																	$.append($$anchor, text_17);
																},
																$$slots: { default: true }
															});

															$.append($$anchor, fragment_30);
														},
														$$slots: { default: true }
													});
												});

												$.append($$anchor, fragment_4);
											},
											$$slots: { default: true }
										});
									});

									$.reset(form);
									$.append($$anchor, form);
								},
								$$slots: { default: true }
							});
						});

						$.append($$anchor, fragment_2);
					},
					$$slots: { default: true }
				});
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	$.pop();
}