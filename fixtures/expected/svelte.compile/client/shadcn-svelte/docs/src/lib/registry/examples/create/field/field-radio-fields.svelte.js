import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as Field from "$lib/registry/ui/field/index.js";
import * as RadioGroup from "$lib/registry/ui/radio-group/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!>`, 1);
var root_2 = $.from_html(`<!> <!> <!> <!> <!> <!>`, 1);

export default function Field_radio_fields($$anchor) {
	Example($$anchor, {
		title: 'Radio Fields',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = $.comment();
			var node = $.first_child(fragment_1);

			$.component(node, () => Field.Group, ($$anchor, Field_Group) => {
				Field_Group($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = root_2();
						var node_1 = $.first_child(fragment_2);

						$.component(node_1, () => Field.Set, ($$anchor, Field_Set) => {
							Field_Set($$anchor, {
								children: ($$anchor, $$slotProps) => {
									var fragment_3 = root();
									var node_2 = $.first_child(fragment_3);

									$.component(node_2, () => Field.Legend, ($$anchor, Field_Legend) => {
										Field_Legend($$anchor, {
											variant: 'label',
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text = $.text('Subscription Plan');

												$.append($$anchor, text);
											},
											$$slots: { default: true }
										});
									});

									var node_3 = $.sibling(node_2, 2);

									$.component(node_3, () => RadioGroup.Root, ($$anchor, RadioGroup_Root) => {
										RadioGroup_Root($$anchor, {
											value: 'free',
											children: ($$anchor, $$slotProps) => {
												var fragment_4 = root_1();
												var node_4 = $.first_child(fragment_4);

												$.component(node_4, () => Field.Field, ($$anchor, Field_Field) => {
													Field_Field($$anchor, {
														orientation: 'horizontal',
														children: ($$anchor, $$slotProps) => {
															var fragment_5 = root();
															var node_5 = $.first_child(fragment_5);

															$.component(node_5, () => RadioGroup.Item, ($$anchor, RadioGroup_Item) => {
																RadioGroup_Item($$anchor, { value: 'free', id: 'radio-free' });
															});

															var node_6 = $.sibling(node_5, 2);

															$.component(node_6, () => Field.Label, ($$anchor, Field_Label) => {
																Field_Label($$anchor, {
																	for: 'radio-free',
																	class: 'font-normal',
																	children: ($$anchor, $$slotProps) => {
																		$.next();

																		var text_1 = $.text('Free Plan');

																		$.append($$anchor, text_1);
																	},
																	$$slots: { default: true }
																});
															});

															$.append($$anchor, fragment_5);
														},
														$$slots: { default: true }
													});
												});

												var node_7 = $.sibling(node_4, 2);

												$.component(node_7, () => Field.Field, ($$anchor, Field_Field_1) => {
													Field_Field_1($$anchor, {
														orientation: 'horizontal',
														children: ($$anchor, $$slotProps) => {
															var fragment_6 = root();
															var node_8 = $.first_child(fragment_6);

															$.component(node_8, () => RadioGroup.Item, ($$anchor, RadioGroup_Item_1) => {
																RadioGroup_Item_1($$anchor, { value: 'pro', id: 'radio-pro' });
															});

															var node_9 = $.sibling(node_8, 2);

															$.component(node_9, () => Field.Label, ($$anchor, Field_Label_1) => {
																Field_Label_1($$anchor, {
																	for: 'radio-pro',
																	class: 'font-normal',
																	children: ($$anchor, $$slotProps) => {
																		$.next();

																		var text_2 = $.text('Pro Plan');

																		$.append($$anchor, text_2);
																	},
																	$$slots: { default: true }
																});
															});

															$.append($$anchor, fragment_6);
														},
														$$slots: { default: true }
													});
												});

												var node_10 = $.sibling(node_7, 2);

												$.component(node_10, () => Field.Field, ($$anchor, Field_Field_2) => {
													Field_Field_2($$anchor, {
														orientation: 'horizontal',
														children: ($$anchor, $$slotProps) => {
															var fragment_7 = root();
															var node_11 = $.first_child(fragment_7);

															$.component(node_11, () => RadioGroup.Item, ($$anchor, RadioGroup_Item_2) => {
																RadioGroup_Item_2($$anchor, { value: 'enterprise', id: 'radio-enterprise' });
															});

															var node_12 = $.sibling(node_11, 2);

															$.component(node_12, () => Field.Label, ($$anchor, Field_Label_2) => {
																Field_Label_2($$anchor, {
																	for: 'radio-enterprise',
																	class: 'font-normal',
																	children: ($$anchor, $$slotProps) => {
																		$.next();

																		var text_3 = $.text('Enterprise');

																		$.append($$anchor, text_3);
																	},
																	$$slots: { default: true }
																});
															});

															$.append($$anchor, fragment_7);
														},
														$$slots: { default: true }
													});
												});

												$.append($$anchor, fragment_4);
											},
											$$slots: { default: true }
										});
									});

									$.append($$anchor, fragment_3);
								},
								$$slots: { default: true }
							});
						});

						var node_13 = $.sibling(node_1, 2);

						$.component(node_13, () => Field.Set, ($$anchor, Field_Set_1) => {
							Field_Set_1($$anchor, {
								children: ($$anchor, $$slotProps) => {
									var fragment_8 = root_1();
									var node_14 = $.first_child(fragment_8);

									$.component(node_14, () => Field.Legend, ($$anchor, Field_Legend_1) => {
										Field_Legend_1($$anchor, {
											variant: 'label',
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_4 = $.text('Battery Level');

												$.append($$anchor, text_4);
											},
											$$slots: { default: true }
										});
									});

									var node_15 = $.sibling(node_14, 2);

									$.component(node_15, () => Field.Description, ($$anchor, Field_Description) => {
										Field_Description($$anchor, {
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_5 = $.text('Choose your preferred battery level.');

												$.append($$anchor, text_5);
											},
											$$slots: { default: true }
										});
									});

									var node_16 = $.sibling(node_15, 2);

									$.component(node_16, () => RadioGroup.Root, ($$anchor, RadioGroup_Root_1) => {
										RadioGroup_Root_1($$anchor, {
											children: ($$anchor, $$slotProps) => {
												var fragment_9 = root_1();
												var node_17 = $.first_child(fragment_9);

												$.component(node_17, () => Field.Field, ($$anchor, Field_Field_3) => {
													Field_Field_3($$anchor, {
														orientation: 'horizontal',
														children: ($$anchor, $$slotProps) => {
															var fragment_10 = root();
															var node_18 = $.first_child(fragment_10);

															$.component(node_18, () => RadioGroup.Item, ($$anchor, RadioGroup_Item_3) => {
																RadioGroup_Item_3($$anchor, { value: 'high', id: 'battery-high' });
															});

															var node_19 = $.sibling(node_18, 2);

															$.component(node_19, () => Field.Label, ($$anchor, Field_Label_3) => {
																Field_Label_3($$anchor, {
																	for: 'battery-high',
																	children: ($$anchor, $$slotProps) => {
																		$.next();

																		var text_6 = $.text('High');

																		$.append($$anchor, text_6);
																	},
																	$$slots: { default: true }
																});
															});

															$.append($$anchor, fragment_10);
														},
														$$slots: { default: true }
													});
												});

												var node_20 = $.sibling(node_17, 2);

												$.component(node_20, () => Field.Field, ($$anchor, Field_Field_4) => {
													Field_Field_4($$anchor, {
														orientation: 'horizontal',
														children: ($$anchor, $$slotProps) => {
															var fragment_11 = root();
															var node_21 = $.first_child(fragment_11);

															$.component(node_21, () => RadioGroup.Item, ($$anchor, RadioGroup_Item_4) => {
																RadioGroup_Item_4($$anchor, { value: 'medium', id: 'battery-medium' });
															});

															var node_22 = $.sibling(node_21, 2);

															$.component(node_22, () => Field.Label, ($$anchor, Field_Label_4) => {
																Field_Label_4($$anchor, {
																	for: 'battery-medium',
																	children: ($$anchor, $$slotProps) => {
																		$.next();

																		var text_7 = $.text('Medium');

																		$.append($$anchor, text_7);
																	},
																	$$slots: { default: true }
																});
															});

															$.append($$anchor, fragment_11);
														},
														$$slots: { default: true }
													});
												});

												var node_23 = $.sibling(node_20, 2);

												$.component(node_23, () => Field.Field, ($$anchor, Field_Field_5) => {
													Field_Field_5($$anchor, {
														orientation: 'horizontal',
														children: ($$anchor, $$slotProps) => {
															var fragment_12 = root();
															var node_24 = $.first_child(fragment_12);

															$.component(node_24, () => RadioGroup.Item, ($$anchor, RadioGroup_Item_5) => {
																RadioGroup_Item_5($$anchor, { value: 'low', id: 'battery-low' });
															});

															var node_25 = $.sibling(node_24, 2);

															$.component(node_25, () => Field.Label, ($$anchor, Field_Label_5) => {
																Field_Label_5($$anchor, {
																	for: 'battery-low',
																	children: ($$anchor, $$slotProps) => {
																		$.next();

																		var text_8 = $.text('Low');

																		$.append($$anchor, text_8);
																	},
																	$$slots: { default: true }
																});
															});

															$.append($$anchor, fragment_12);
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

						var node_26 = $.sibling(node_13, 2);

						$.component(node_26, () => RadioGroup.Root, ($$anchor, RadioGroup_Root_2) => {
							RadioGroup_Root_2($$anchor, {
								class: 'gap-6',
								children: ($$anchor, $$slotProps) => {
									var fragment_13 = root();
									var node_27 = $.first_child(fragment_13);

									$.component(node_27, () => Field.Field, ($$anchor, Field_Field_6) => {
										Field_Field_6($$anchor, {
											orientation: 'horizontal',
											children: ($$anchor, $$slotProps) => {
												var fragment_14 = root();
												var node_28 = $.first_child(fragment_14);

												$.component(node_28, () => RadioGroup.Item, ($$anchor, RadioGroup_Item_6) => {
													RadioGroup_Item_6($$anchor, { value: 'option1', id: 'radio-content-1' });
												});

												var node_29 = $.sibling(node_28, 2);

												$.component(node_29, () => Field.Content, ($$anchor, Field_Content) => {
													Field_Content($$anchor, {
														children: ($$anchor, $$slotProps) => {
															var fragment_15 = root();
															var node_30 = $.first_child(fragment_15);

															$.component(node_30, () => Field.Label, ($$anchor, Field_Label_6) => {
																Field_Label_6($$anchor, {
																	for: 'radio-content-1',
																	children: ($$anchor, $$slotProps) => {
																		$.next();

																		var text_9 = $.text('Enable Touch ID');

																		$.append($$anchor, text_9);
																	},
																	$$slots: { default: true }
																});
															});

															var node_31 = $.sibling(node_30, 2);

															$.component(node_31, () => Field.Description, ($$anchor, Field_Description_1) => {
																Field_Description_1($$anchor, {
																	children: ($$anchor, $$slotProps) => {
																		$.next();

																		var text_10 = $.text('Enable Touch ID to quickly unlock your device.');

																		$.append($$anchor, text_10);
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

									var node_32 = $.sibling(node_27, 2);

									$.component(node_32, () => Field.Field, ($$anchor, Field_Field_7) => {
										Field_Field_7($$anchor, {
											orientation: 'horizontal',
											children: ($$anchor, $$slotProps) => {
												var fragment_16 = root();
												var node_33 = $.first_child(fragment_16);

												$.component(node_33, () => RadioGroup.Item, ($$anchor, RadioGroup_Item_7) => {
													RadioGroup_Item_7($$anchor, { value: 'option2', id: 'radio-content-2' });
												});

												var node_34 = $.sibling(node_33, 2);

												$.component(node_34, () => Field.Content, ($$anchor, Field_Content_1) => {
													Field_Content_1($$anchor, {
														children: ($$anchor, $$slotProps) => {
															var fragment_17 = root();
															var node_35 = $.first_child(fragment_17);

															$.component(node_35, () => Field.Label, ($$anchor, Field_Label_7) => {
																Field_Label_7($$anchor, {
																	for: 'radio-content-2',
																	children: ($$anchor, $$slotProps) => {
																		$.next();

																		var text_11 = $.text('Enable Touch ID and Face ID to make it even faster to unlock your device. This is a long\n						label to test the layout.');

																		$.append($$anchor, text_11);
																	},
																	$$slots: { default: true }
																});
															});

															var node_36 = $.sibling(node_35, 2);

															$.component(node_36, () => Field.Description, ($$anchor, Field_Description_2) => {
																Field_Description_2($$anchor, {
																	children: ($$anchor, $$slotProps) => {
																		$.next();

																		var text_12 = $.text('Enable Touch ID to quickly unlock your device.');

																		$.append($$anchor, text_12);
																	},
																	$$slots: { default: true }
																});
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

									$.append($$anchor, fragment_13);
								},
								$$slots: { default: true }
							});
						});

						var node_37 = $.sibling(node_26, 2);

						$.component(node_37, () => RadioGroup.Root, ($$anchor, RadioGroup_Root_3) => {
							RadioGroup_Root_3($$anchor, {
								class: 'gap-3',
								children: ($$anchor, $$slotProps) => {
									var fragment_18 = root();
									var node_38 = $.first_child(fragment_18);

									$.component(node_38, () => Field.Label, ($$anchor, Field_Label_8) => {
										Field_Label_8($$anchor, {
											for: 'radio-title-1',
											children: ($$anchor, $$slotProps) => {
												var fragment_19 = $.comment();
												var node_39 = $.first_child(fragment_19);

												$.component(node_39, () => Field.Field, ($$anchor, Field_Field_8) => {
													Field_Field_8($$anchor, {
														orientation: 'horizontal',
														children: ($$anchor, $$slotProps) => {
															var fragment_20 = root();
															var node_40 = $.first_child(fragment_20);

															$.component(node_40, () => RadioGroup.Item, ($$anchor, RadioGroup_Item_8) => {
																RadioGroup_Item_8($$anchor, { value: 'title1', id: 'radio-title-1' });
															});

															var node_41 = $.sibling(node_40, 2);

															$.component(node_41, () => Field.Content, ($$anchor, Field_Content_2) => {
																Field_Content_2($$anchor, {
																	children: ($$anchor, $$slotProps) => {
																		var fragment_21 = root();
																		var node_42 = $.first_child(fragment_21);

																		$.component(node_42, () => Field.Title, ($$anchor, Field_Title) => {
																			Field_Title($$anchor, {
																				children: ($$anchor, $$slotProps) => {
																					$.next();

																					var text_13 = $.text('Enable Touch ID');

																					$.append($$anchor, text_13);
																				},
																				$$slots: { default: true }
																			});
																		});

																		var node_43 = $.sibling(node_42, 2);

																		$.component(node_43, () => Field.Description, ($$anchor, Field_Description_3) => {
																			Field_Description_3($$anchor, {
																				children: ($$anchor, $$slotProps) => {
																					$.next();

																					var text_14 = $.text('Enable Touch ID to quickly unlock your device.');

																					$.append($$anchor, text_14);
																				},
																				$$slots: { default: true }
																			});
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

												$.append($$anchor, fragment_19);
											},
											$$slots: { default: true }
										});
									});

									var node_44 = $.sibling(node_38, 2);

									$.component(node_44, () => Field.Label, ($$anchor, Field_Label_9) => {
										Field_Label_9($$anchor, {
											for: 'radio-title-2',
											children: ($$anchor, $$slotProps) => {
												var fragment_22 = $.comment();
												var node_45 = $.first_child(fragment_22);

												$.component(node_45, () => Field.Field, ($$anchor, Field_Field_9) => {
													Field_Field_9($$anchor, {
														orientation: 'horizontal',
														children: ($$anchor, $$slotProps) => {
															var fragment_23 = root();
															var node_46 = $.first_child(fragment_23);

															$.component(node_46, () => RadioGroup.Item, ($$anchor, RadioGroup_Item_9) => {
																RadioGroup_Item_9($$anchor, { value: 'title2', id: 'radio-title-2' });
															});

															var node_47 = $.sibling(node_46, 2);

															$.component(node_47, () => Field.Content, ($$anchor, Field_Content_3) => {
																Field_Content_3($$anchor, {
																	children: ($$anchor, $$slotProps) => {
																		var fragment_24 = root();
																		var node_48 = $.first_child(fragment_24);

																		$.component(node_48, () => Field.Title, ($$anchor, Field_Title_1) => {
																			Field_Title_1($$anchor, {
																				children: ($$anchor, $$slotProps) => {
																					$.next();

																					var text_15 = $.text('Enable Touch ID and Face ID to make it even faster to unlock your device. This is a\n							long label to test the layout.');

																					$.append($$anchor, text_15);
																				},
																				$$slots: { default: true }
																			});
																		});

																		var node_49 = $.sibling(node_48, 2);

																		$.component(node_49, () => Field.Description, ($$anchor, Field_Description_4) => {
																			Field_Description_4($$anchor, {
																				children: ($$anchor, $$slotProps) => {
																					$.next();

																					var text_16 = $.text('Enable Touch ID to quickly unlock your device.');

																					$.append($$anchor, text_16);
																				},
																				$$slots: { default: true }
																			});
																		});

																		$.append($$anchor, fragment_24);
																	},
																	$$slots: { default: true }
																});
															});

															$.append($$anchor, fragment_23);
														},
														$$slots: { default: true }
													});
												});

												$.append($$anchor, fragment_22);
											},
											$$slots: { default: true }
										});
									});

									$.append($$anchor, fragment_18);
								},
								$$slots: { default: true }
							});
						});

						var node_50 = $.sibling(node_37, 2);

						$.component(node_50, () => Field.Set, ($$anchor, Field_Set_2) => {
							Field_Set_2($$anchor, {
								children: ($$anchor, $$slotProps) => {
									var fragment_25 = root();
									var node_51 = $.first_child(fragment_25);

									$.component(node_51, () => Field.Legend, ($$anchor, Field_Legend_2) => {
										Field_Legend_2($$anchor, {
											variant: 'label',
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_17 = $.text('Invalid Radio Group');

												$.append($$anchor, text_17);
											},
											$$slots: { default: true }
										});
									});

									var node_52 = $.sibling(node_51, 2);

									$.component(node_52, () => RadioGroup.Root, ($$anchor, RadioGroup_Root_4) => {
										RadioGroup_Root_4($$anchor, {
											children: ($$anchor, $$slotProps) => {
												var fragment_26 = root();
												var node_53 = $.first_child(fragment_26);

												$.component(node_53, () => Field.Field, ($$anchor, Field_Field_10) => {
													Field_Field_10($$anchor, {
														'data-invalid': true,
														orientation: 'horizontal',
														children: ($$anchor, $$slotProps) => {
															var fragment_27 = root();
															var node_54 = $.first_child(fragment_27);

															$.component(node_54, () => RadioGroup.Item, ($$anchor, RadioGroup_Item_10) => {
																RadioGroup_Item_10($$anchor, {
																	value: 'invalid1',
																	id: 'radio-invalid-1',
																	'aria-invalid': true
																});
															});

															var node_55 = $.sibling(node_54, 2);

															$.component(node_55, () => Field.Label, ($$anchor, Field_Label_10) => {
																Field_Label_10($$anchor, {
																	for: 'radio-invalid-1',
																	children: ($$anchor, $$slotProps) => {
																		$.next();

																		var text_18 = $.text('Invalid Option 1');

																		$.append($$anchor, text_18);
																	},
																	$$slots: { default: true }
																});
															});

															$.append($$anchor, fragment_27);
														},
														$$slots: { default: true }
													});
												});

												var node_56 = $.sibling(node_53, 2);

												$.component(node_56, () => Field.Field, ($$anchor, Field_Field_11) => {
													Field_Field_11($$anchor, {
														'data-invalid': true,
														orientation: 'horizontal',
														children: ($$anchor, $$slotProps) => {
															var fragment_28 = root();
															var node_57 = $.first_child(fragment_28);

															$.component(node_57, () => RadioGroup.Item, ($$anchor, RadioGroup_Item_11) => {
																RadioGroup_Item_11($$anchor, {
																	value: 'invalid2',
																	id: 'radio-invalid-2',
																	'aria-invalid': true
																});
															});

															var node_58 = $.sibling(node_57, 2);

															$.component(node_58, () => Field.Label, ($$anchor, Field_Label_11) => {
																Field_Label_11($$anchor, {
																	for: 'radio-invalid-2',
																	children: ($$anchor, $$slotProps) => {
																		$.next();

																		var text_19 = $.text('Invalid Option 2');

																		$.append($$anchor, text_19);
																	},
																	$$slots: { default: true }
																});
															});

															$.append($$anchor, fragment_28);
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

						var node_59 = $.sibling(node_50, 2);

						$.component(node_59, () => Field.Set, ($$anchor, Field_Set_3) => {
							Field_Set_3($$anchor, {
								children: ($$anchor, $$slotProps) => {
									var fragment_29 = root();
									var node_60 = $.first_child(fragment_29);

									$.component(node_60, () => Field.Legend, ($$anchor, Field_Legend_3) => {
										Field_Legend_3($$anchor, {
											variant: 'label',
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_20 = $.text('Disabled Radio Group');

												$.append($$anchor, text_20);
											},
											$$slots: { default: true }
										});
									});

									var node_61 = $.sibling(node_60, 2);

									$.component(node_61, () => RadioGroup.Root, ($$anchor, RadioGroup_Root_5) => {
										RadioGroup_Root_5($$anchor, {
											disabled: true,
											children: ($$anchor, $$slotProps) => {
												var fragment_30 = root();
												var node_62 = $.first_child(fragment_30);

												$.component(node_62, () => Field.Field, ($$anchor, Field_Field_12) => {
													Field_Field_12($$anchor, {
														'data-disabled': true,
														orientation: 'horizontal',
														children: ($$anchor, $$slotProps) => {
															var fragment_31 = root();
															var node_63 = $.first_child(fragment_31);

															$.component(node_63, () => RadioGroup.Item, ($$anchor, RadioGroup_Item_12) => {
																RadioGroup_Item_12($$anchor, { value: 'disabled1', id: 'radio-disabled-1', disabled: true });
															});

															var node_64 = $.sibling(node_63, 2);

															$.component(node_64, () => Field.Label, ($$anchor, Field_Label_12) => {
																Field_Label_12($$anchor, {
																	for: 'radio-disabled-1',
																	children: ($$anchor, $$slotProps) => {
																		$.next();

																		var text_21 = $.text('Disabled Option 1');

																		$.append($$anchor, text_21);
																	},
																	$$slots: { default: true }
																});
															});

															$.append($$anchor, fragment_31);
														},
														$$slots: { default: true }
													});
												});

												var node_65 = $.sibling(node_62, 2);

												$.component(node_65, () => Field.Field, ($$anchor, Field_Field_13) => {
													Field_Field_13($$anchor, {
														'data-disabled': true,
														orientation: 'horizontal',
														children: ($$anchor, $$slotProps) => {
															var fragment_32 = root();
															var node_66 = $.first_child(fragment_32);

															$.component(node_66, () => RadioGroup.Item, ($$anchor, RadioGroup_Item_13) => {
																RadioGroup_Item_13($$anchor, { value: 'disabled2', id: 'radio-disabled-2', disabled: true });
															});

															var node_67 = $.sibling(node_66, 2);

															$.component(node_67, () => Field.Label, ($$anchor, Field_Label_13) => {
																Field_Label_13($$anchor, {
																	for: 'radio-disabled-2',
																	children: ($$anchor, $$slotProps) => {
																		$.next();

																		var text_22 = $.text('Disabled Option 2');

																		$.append($$anchor, text_22);
																	},
																	$$slots: { default: true }
																});
															});

															$.append($$anchor, fragment_32);
														},
														$$slots: { default: true }
													});
												});

												$.append($$anchor, fragment_30);
											},
											$$slots: { default: true }
										});
									});

									$.append($$anchor, fragment_29);
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
}