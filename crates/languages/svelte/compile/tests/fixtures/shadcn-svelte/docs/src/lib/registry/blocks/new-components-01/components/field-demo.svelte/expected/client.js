import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as Field from "$lib/registry/ui/field/index.js";
import * as Select from "$lib/registry/ui/select/index.js";
import { Button } from "$lib/registry/ui/button/index.js";
import { Checkbox } from "$lib/registry/ui/checkbox/index.js";
import { Input } from "$lib/registry/ui/input/index.js";
import { Textarea } from "$lib/registry/ui/textarea/index.js";

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!>`, 1);
var root_2 = $.from_html(`<span> </span>`);
var root_3 = $.from_html(`<!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!>`, 1);
var root_4 = $.from_html(`<!> <!> <!> <!> <!> <!>`, 1);
var root_5 = $.from_html(`<!> <!> <div class="grid grid-cols-3 gap-4"><!> <!> <!></div>`, 1);
var root_6 = $.from_html(`<div class="w-full max-w-md"><form><!></form></div>`);

export default function Field_demo($$anchor) {
	let month = $.state(void 0);
	let year = $.state(void 0);
	var div = root_6();
	var form = $.child(div);
	var node = $.child(form);

	$.component(node, () => Field.Group, ($$anchor, Field_Group) => {
		Field_Group($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var fragment = root_4();
				var node_1 = $.first_child(fragment);

				$.component(node_1, () => Field.Set, ($$anchor, Field_Set) => {
					Field_Set($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_1 = root_1();
							var node_2 = $.first_child(fragment_1);

							$.component(node_2, () => Field.Legend, ($$anchor, Field_Legend) => {
								Field_Legend($$anchor, {
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text = $.text('Payment Method');

										$.append($$anchor, text);
									},
									$$slots: { default: true }
								});
							});

							var node_3 = $.sibling(node_2, 2);

							$.component(node_3, () => Field.Description, ($$anchor, Field_Description) => {
								Field_Description($$anchor, {
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_1 = $.text('All transactions are secure and encrypted');

										$.append($$anchor, text_1);
									},
									$$slots: { default: true }
								});
							});

							var node_4 = $.sibling(node_3, 2);

							$.component(node_4, () => Field.Group, ($$anchor, Field_Group_1) => {
								Field_Group_1($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_2 = root_5();
										var node_5 = $.first_child(fragment_2);

										$.component(node_5, () => Field.Field, ($$anchor, Field_Field) => {
											Field_Field($$anchor, {
												children: ($$anchor, $$slotProps) => {
													var fragment_3 = root();
													var node_6 = $.first_child(fragment_3);

													$.component(node_6, () => Field.Label, ($$anchor, Field_Label) => {
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

													var node_7 = $.sibling(node_6, 2);

													Input(node_7, {
														id: 'checkout-7j9-card-name-43j',
														placeholder: 'Evil Rabbit',
														required: true
													});

													$.append($$anchor, fragment_3);
												},
												$$slots: { default: true }
											});
										});

										var node_8 = $.sibling(node_5, 2);

										$.component(node_8, () => Field.Field, ($$anchor, Field_Field_1) => {
											Field_Field_1($$anchor, {
												children: ($$anchor, $$slotProps) => {
													var fragment_4 = root_1();
													var node_9 = $.first_child(fragment_4);

													$.component(node_9, () => Field.Label, ($$anchor, Field_Label_1) => {
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

													var node_10 = $.sibling(node_9, 2);

													Input(node_10, {
														id: 'checkout-7j9-card-number-uw1',
														placeholder: '1234 5678 9012 3456',
														required: true
													});

													var node_11 = $.sibling(node_10, 2);

													$.component(node_11, () => Field.Description, ($$anchor, Field_Description_1) => {
														Field_Description_1($$anchor, {
															children: ($$anchor, $$slotProps) => {
																$.next();

																var text_4 = $.text('Enter your 16-digit card number');

																$.append($$anchor, text_4);
															},
															$$slots: { default: true }
														});
													});

													$.append($$anchor, fragment_4);
												},
												$$slots: { default: true }
											});
										});

										var div_1 = $.sibling(node_8, 2);
										var node_12 = $.child(div_1);

										$.component(node_12, () => Field.Field, ($$anchor, Field_Field_2) => {
											Field_Field_2($$anchor, {
												children: ($$anchor, $$slotProps) => {
													var fragment_5 = root();
													var node_13 = $.first_child(fragment_5);

													$.component(node_13, () => Field.Label, ($$anchor, Field_Label_2) => {
														Field_Label_2($$anchor, {
															for: 'checkout-exp-month-ts6',
															children: ($$anchor, $$slotProps) => {
																$.next();

																var text_5 = $.text('Month');

																$.append($$anchor, text_5);
															},
															$$slots: { default: true }
														});
													});

													var node_14 = $.sibling(node_13, 2);

													$.component(node_14, () => Select.Root, ($$anchor, Select_Root) => {
														Select_Root($$anchor, {
															type: 'single',
															get value() {
																return $.get(month);
															},

															set value($$value) {
																$.set(month, $$value, true);
															},

															children: ($$anchor, $$slotProps) => {
																var fragment_6 = root();
																var node_15 = $.first_child(fragment_6);

																$.component(node_15, () => Select.Trigger, ($$anchor, Select_Trigger) => {
																	Select_Trigger($$anchor, {
																		id: 'checkout-exp-month-ts6',
																		children: ($$anchor, $$slotProps) => {
																			var span = root_2();
																			var text_6 = $.only_child(span, true);

																			$.template_effect(() => $.set_text(text_6, $.get(month) || "MM"));
																			$.append($$anchor, span);
																		},
																		$$slots: { default: true }
																	});
																});

																var node_16 = $.sibling(node_15, 2);

																$.component(node_16, () => Select.Content, ($$anchor, Select_Content) => {
																	Select_Content($$anchor, {
																		children: ($$anchor, $$slotProps) => {
																			var fragment_7 = root_3();
																			var node_17 = $.first_child(fragment_7);

																			$.component(node_17, () => Select.Item, ($$anchor, Select_Item) => {
																				Select_Item($$anchor, {
																					value: '01',
																					children: ($$anchor, $$slotProps) => {
																						$.next();

																						var text_7 = $.text('01');

																						$.append($$anchor, text_7);
																					},
																					$$slots: { default: true }
																				});
																			});

																			var node_18 = $.sibling(node_17, 2);

																			$.component(node_18, () => Select.Item, ($$anchor, Select_Item_1) => {
																				Select_Item_1($$anchor, {
																					value: '02',
																					children: ($$anchor, $$slotProps) => {
																						$.next();

																						var text_8 = $.text('02');

																						$.append($$anchor, text_8);
																					},
																					$$slots: { default: true }
																				});
																			});

																			var node_19 = $.sibling(node_18, 2);

																			$.component(node_19, () => Select.Item, ($$anchor, Select_Item_2) => {
																				Select_Item_2($$anchor, {
																					value: '03',
																					children: ($$anchor, $$slotProps) => {
																						$.next();

																						var text_9 = $.text('03');

																						$.append($$anchor, text_9);
																					},
																					$$slots: { default: true }
																				});
																			});

																			var node_20 = $.sibling(node_19, 2);

																			$.component(node_20, () => Select.Item, ($$anchor, Select_Item_3) => {
																				Select_Item_3($$anchor, {
																					value: '04',
																					children: ($$anchor, $$slotProps) => {
																						$.next();

																						var text_10 = $.text('04');

																						$.append($$anchor, text_10);
																					},
																					$$slots: { default: true }
																				});
																			});

																			var node_21 = $.sibling(node_20, 2);

																			$.component(node_21, () => Select.Item, ($$anchor, Select_Item_4) => {
																				Select_Item_4($$anchor, {
																					value: '05',
																					children: ($$anchor, $$slotProps) => {
																						$.next();

																						var text_11 = $.text('05');

																						$.append($$anchor, text_11);
																					},
																					$$slots: { default: true }
																				});
																			});

																			var node_22 = $.sibling(node_21, 2);

																			$.component(node_22, () => Select.Item, ($$anchor, Select_Item_5) => {
																				Select_Item_5($$anchor, {
																					value: '06',
																					children: ($$anchor, $$slotProps) => {
																						$.next();

																						var text_12 = $.text('06');

																						$.append($$anchor, text_12);
																					},
																					$$slots: { default: true }
																				});
																			});

																			var node_23 = $.sibling(node_22, 2);

																			$.component(node_23, () => Select.Item, ($$anchor, Select_Item_6) => {
																				Select_Item_6($$anchor, {
																					value: '07',
																					children: ($$anchor, $$slotProps) => {
																						$.next();

																						var text_13 = $.text('07');

																						$.append($$anchor, text_13);
																					},
																					$$slots: { default: true }
																				});
																			});

																			var node_24 = $.sibling(node_23, 2);

																			$.component(node_24, () => Select.Item, ($$anchor, Select_Item_7) => {
																				Select_Item_7($$anchor, {
																					value: '08',
																					children: ($$anchor, $$slotProps) => {
																						$.next();

																						var text_14 = $.text('08');

																						$.append($$anchor, text_14);
																					},
																					$$slots: { default: true }
																				});
																			});

																			var node_25 = $.sibling(node_24, 2);

																			$.component(node_25, () => Select.Item, ($$anchor, Select_Item_8) => {
																				Select_Item_8($$anchor, {
																					value: '09',
																					children: ($$anchor, $$slotProps) => {
																						$.next();

																						var text_15 = $.text('09');

																						$.append($$anchor, text_15);
																					},
																					$$slots: { default: true }
																				});
																			});

																			var node_26 = $.sibling(node_25, 2);

																			$.component(node_26, () => Select.Item, ($$anchor, Select_Item_9) => {
																				Select_Item_9($$anchor, {
																					value: '10',
																					children: ($$anchor, $$slotProps) => {
																						$.next();

																						var text_16 = $.text('10');

																						$.append($$anchor, text_16);
																					},
																					$$slots: { default: true }
																				});
																			});

																			var node_27 = $.sibling(node_26, 2);

																			$.component(node_27, () => Select.Item, ($$anchor, Select_Item_10) => {
																				Select_Item_10($$anchor, {
																					value: '11',
																					children: ($$anchor, $$slotProps) => {
																						$.next();

																						var text_17 = $.text('11');

																						$.append($$anchor, text_17);
																					},
																					$$slots: { default: true }
																				});
																			});

																			var node_28 = $.sibling(node_27, 2);

																			$.component(node_28, () => Select.Item, ($$anchor, Select_Item_11) => {
																				Select_Item_11($$anchor, {
																					value: '12',
																					children: ($$anchor, $$slotProps) => {
																						$.next();

																						var text_18 = $.text('12');

																						$.append($$anchor, text_18);
																					},
																					$$slots: { default: true }
																				});
																			});

																			$.append($$anchor, fragment_7);
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

										var node_29 = $.sibling(node_12, 2);

										$.component(node_29, () => Field.Field, ($$anchor, Field_Field_3) => {
											Field_Field_3($$anchor, {
												children: ($$anchor, $$slotProps) => {
													var fragment_8 = root();
													var node_30 = $.first_child(fragment_8);

													$.component(node_30, () => Field.Label, ($$anchor, Field_Label_3) => {
														Field_Label_3($$anchor, {
															for: 'checkout-7j9-exp-year-f59',
															children: ($$anchor, $$slotProps) => {
																$.next();

																var text_19 = $.text('Year');

																$.append($$anchor, text_19);
															},
															$$slots: { default: true }
														});
													});

													var node_31 = $.sibling(node_30, 2);

													$.component(node_31, () => Select.Root, ($$anchor, Select_Root_1) => {
														Select_Root_1($$anchor, {
															type: 'single',
															get value() {
																return $.get(year);
															},

															set value($$value) {
																$.set(year, $$value, true);
															},

															children: ($$anchor, $$slotProps) => {
																var fragment_9 = root();
																var node_32 = $.first_child(fragment_9);

																$.component(node_32, () => Select.Trigger, ($$anchor, Select_Trigger_1) => {
																	Select_Trigger_1($$anchor, {
																		id: 'checkout-7j9-exp-year-f59',
																		children: ($$anchor, $$slotProps) => {
																			var span_1 = root_2();
																			var text_20 = $.only_child(span_1, true);

																			$.template_effect(() => $.set_text(text_20, $.get(year) || "YYYY"));
																			$.append($$anchor, span_1);
																		},
																		$$slots: { default: true }
																	});
																});

																var node_33 = $.sibling(node_32, 2);

																$.component(node_33, () => Select.Content, ($$anchor, Select_Content_1) => {
																	Select_Content_1($$anchor, {
																		children: ($$anchor, $$slotProps) => {
																			var fragment_10 = root_4();
																			var node_34 = $.first_child(fragment_10);

																			$.component(node_34, () => Select.Item, ($$anchor, Select_Item_12) => {
																				Select_Item_12($$anchor, {
																					value: '2024',
																					children: ($$anchor, $$slotProps) => {
																						$.next();

																						var text_21 = $.text('2024');

																						$.append($$anchor, text_21);
																					},
																					$$slots: { default: true }
																				});
																			});

																			var node_35 = $.sibling(node_34, 2);

																			$.component(node_35, () => Select.Item, ($$anchor, Select_Item_13) => {
																				Select_Item_13($$anchor, {
																					value: '2025',
																					children: ($$anchor, $$slotProps) => {
																						$.next();

																						var text_22 = $.text('2025');

																						$.append($$anchor, text_22);
																					},
																					$$slots: { default: true }
																				});
																			});

																			var node_36 = $.sibling(node_35, 2);

																			$.component(node_36, () => Select.Item, ($$anchor, Select_Item_14) => {
																				Select_Item_14($$anchor, {
																					value: '2026',
																					children: ($$anchor, $$slotProps) => {
																						$.next();

																						var text_23 = $.text('2026');

																						$.append($$anchor, text_23);
																					},
																					$$slots: { default: true }
																				});
																			});

																			var node_37 = $.sibling(node_36, 2);

																			$.component(node_37, () => Select.Item, ($$anchor, Select_Item_15) => {
																				Select_Item_15($$anchor, {
																					value: '2027',
																					children: ($$anchor, $$slotProps) => {
																						$.next();

																						var text_24 = $.text('2027');

																						$.append($$anchor, text_24);
																					},
																					$$slots: { default: true }
																				});
																			});

																			var node_38 = $.sibling(node_37, 2);

																			$.component(node_38, () => Select.Item, ($$anchor, Select_Item_16) => {
																				Select_Item_16($$anchor, {
																					value: '2028',
																					children: ($$anchor, $$slotProps) => {
																						$.next();

																						var text_25 = $.text('2028');

																						$.append($$anchor, text_25);
																					},
																					$$slots: { default: true }
																				});
																			});

																			var node_39 = $.sibling(node_38, 2);

																			$.component(node_39, () => Select.Item, ($$anchor, Select_Item_17) => {
																				Select_Item_17($$anchor, {
																					value: '2029',
																					children: ($$anchor, $$slotProps) => {
																						$.next();

																						var text_26 = $.text('2029');

																						$.append($$anchor, text_26);
																					},
																					$$slots: { default: true }
																				});
																			});

																			$.append($$anchor, fragment_10);
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

										var node_40 = $.sibling(node_29, 2);

										$.component(node_40, () => Field.Field, ($$anchor, Field_Field_4) => {
											Field_Field_4($$anchor, {
												children: ($$anchor, $$slotProps) => {
													var fragment_11 = root();
													var node_41 = $.first_child(fragment_11);

													$.component(node_41, () => Field.Label, ($$anchor, Field_Label_4) => {
														Field_Label_4($$anchor, {
															for: 'checkout-7j9-cvv',
															children: ($$anchor, $$slotProps) => {
																$.next();

																var text_27 = $.text('CVV');

																$.append($$anchor, text_27);
															},
															$$slots: { default: true }
														});
													});

													var node_42 = $.sibling(node_41, 2);

													Input(node_42, { id: 'checkout-7j9-cvv', placeholder: '123', required: true });
													$.append($$anchor, fragment_11);
												},
												$$slots: { default: true }
											});
										});

										$.reset(div_1);
										$.append($$anchor, fragment_2);
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_1);
						},
						$$slots: { default: true }
					});
				});

				var node_43 = $.sibling(node_1, 2);

				$.component(node_43, () => Field.Separator, ($$anchor, Field_Separator) => {
					Field_Separator($$anchor, {});
				});

				var node_44 = $.sibling(node_43, 2);

				$.component(node_44, () => Field.Set, ($$anchor, Field_Set_1) => {
					Field_Set_1($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_12 = root_1();
							var node_45 = $.first_child(fragment_12);

							$.component(node_45, () => Field.Legend, ($$anchor, Field_Legend_1) => {
								Field_Legend_1($$anchor, {
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_28 = $.text('Billing Address');

										$.append($$anchor, text_28);
									},
									$$slots: { default: true }
								});
							});

							var node_46 = $.sibling(node_45, 2);

							$.component(node_46, () => Field.Description, ($$anchor, Field_Description_2) => {
								Field_Description_2($$anchor, {
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_29 = $.text('The billing address associated with your payment method');

										$.append($$anchor, text_29);
									},
									$$slots: { default: true }
								});
							});

							var node_47 = $.sibling(node_46, 2);

							$.component(node_47, () => Field.Group, ($$anchor, Field_Group_2) => {
								Field_Group_2($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_13 = $.comment();
										var node_48 = $.first_child(fragment_13);

										$.component(node_48, () => Field.Field, ($$anchor, Field_Field_5) => {
											Field_Field_5($$anchor, {
												orientation: 'horizontal',
												children: ($$anchor, $$slotProps) => {
													var fragment_14 = root();
													var node_49 = $.first_child(fragment_14);

													Checkbox(node_49, { id: 'checkout-7j9-same-as-shipping-wgm', checked: true });

													var node_50 = $.sibling(node_49, 2);

													$.component(node_50, () => Field.Label, ($$anchor, Field_Label_5) => {
														Field_Label_5($$anchor, {
															for: 'checkout-7j9-same-as-shipping-wgm',
															class: 'font-normal',
															children: ($$anchor, $$slotProps) => {
																$.next();

																var text_30 = $.text('Same as shipping address');

																$.append($$anchor, text_30);
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

							$.append($$anchor, fragment_12);
						},
						$$slots: { default: true }
					});
				});

				var node_51 = $.sibling(node_44, 2);

				$.component(node_51, () => Field.Separator, ($$anchor, Field_Separator_1) => {
					Field_Separator_1($$anchor, {});
				});

				var node_52 = $.sibling(node_51, 2);

				$.component(node_52, () => Field.Set, ($$anchor, Field_Set_2) => {
					Field_Set_2($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_15 = $.comment();
							var node_53 = $.first_child(fragment_15);

							$.component(node_53, () => Field.Group, ($$anchor, Field_Group_3) => {
								Field_Group_3($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_16 = $.comment();
										var node_54 = $.first_child(fragment_16);

										$.component(node_54, () => Field.Field, ($$anchor, Field_Field_6) => {
											Field_Field_6($$anchor, {
												children: ($$anchor, $$slotProps) => {
													var fragment_17 = root();
													var node_55 = $.first_child(fragment_17);

													$.component(node_55, () => Field.Label, ($$anchor, Field_Label_6) => {
														Field_Label_6($$anchor, {
															for: 'checkout-7j9-optional-comments',
															children: ($$anchor, $$slotProps) => {
																$.next();

																var text_31 = $.text('Comments');

																$.append($$anchor, text_31);
															},
															$$slots: { default: true }
														});
													});

													var node_56 = $.sibling(node_55, 2);

													Textarea(node_56, {
														id: 'checkout-7j9-optional-comments',
														placeholder: 'Add any additional comments',
														class: 'resize-none'
													});

													$.append($$anchor, fragment_17);
												},
												$$slots: { default: true }
											});
										});

										$.append($$anchor, fragment_16);
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_15);
						},
						$$slots: { default: true }
					});
				});

				var node_57 = $.sibling(node_52, 2);

				$.component(node_57, () => Field.Field, ($$anchor, Field_Field_7) => {
					Field_Field_7($$anchor, {
						orientation: 'horizontal',
						children: ($$anchor, $$slotProps) => {
							var fragment_18 = root();
							var node_58 = $.first_child(fragment_18);

							Button(node_58, {
								type: 'submit',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_32 = $.text('Submit');

									$.append($$anchor, text_32);
								},
								$$slots: { default: true }
							});

							var node_59 = $.sibling(node_58, 2);

							Button(node_59, {
								variant: 'outline',
								type: 'button',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_33 = $.text('Cancel');

									$.append($$anchor, text_33);
								},
								$$slots: { default: true }
							});

							$.append($$anchor, fragment_18);
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment);
			},
			$$slots: { default: true }
		});
	});

	$.reset(form);
	$.reset(div);
	$.append($$anchor, div);
}