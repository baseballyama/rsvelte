import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as Field from "$lib/registry/ui/field/index.js";
import * as NativeSelect from "$lib/registry/ui/native-select/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

var root = $.from_html(`<!> <!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);
var root_2 = $.from_html(`<!> <!> <!>`, 1);
var root_3 = $.from_html(`<!> <!> <!> <!> <!> <!>`, 1);

export default function Field_native_select_fields($$anchor) {
	Example($$anchor, {
		title: 'Native Select Fields',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = $.comment();
			var node = $.first_child(fragment_1);

			$.component(node, () => Field.Group, ($$anchor, Field_Group) => {
				Field_Group($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = root_3();
						var node_1 = $.first_child(fragment_2);

						$.component(node_1, () => Field.Field, ($$anchor, Field_Field) => {
							Field_Field($$anchor, {
								children: ($$anchor, $$slotProps) => {
									var fragment_3 = root_1();
									var node_2 = $.first_child(fragment_3);

									$.component(node_2, () => Field.Label, ($$anchor, Field_Label) => {
										Field_Label($$anchor, {
											for: 'native-select-basic',
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text = $.text('Basic Native Select');

												$.append($$anchor, text);
											},
											$$slots: { default: true }
										});
									});

									var node_3 = $.sibling(node_2, 2);

									$.component(node_3, () => NativeSelect.Root, ($$anchor, NativeSelect_Root) => {
										NativeSelect_Root($$anchor, {
											id: 'native-select-basic',
											children: ($$anchor, $$slotProps) => {
												var fragment_4 = root();
												var node_4 = $.first_child(fragment_4);

												$.component(node_4, () => NativeSelect.Option, ($$anchor, NativeSelect_Option) => {
													NativeSelect_Option($$anchor, {
														value: '',
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_1 = $.text('Choose an option');

															$.append($$anchor, text_1);
														},
														$$slots: { default: true }
													});
												});

												var node_5 = $.sibling(node_4, 2);

												$.component(node_5, () => NativeSelect.Option, ($$anchor, NativeSelect_Option_1) => {
													NativeSelect_Option_1($$anchor, {
														value: 'option1',
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_2 = $.text('Option 1');

															$.append($$anchor, text_2);
														},
														$$slots: { default: true }
													});
												});

												var node_6 = $.sibling(node_5, 2);

												$.component(node_6, () => NativeSelect.Option, ($$anchor, NativeSelect_Option_2) => {
													NativeSelect_Option_2($$anchor, {
														value: 'option2',
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_3 = $.text('Option 2');

															$.append($$anchor, text_3);
														},
														$$slots: { default: true }
													});
												});

												var node_7 = $.sibling(node_6, 2);

												$.component(node_7, () => NativeSelect.Option, ($$anchor, NativeSelect_Option_3) => {
													NativeSelect_Option_3($$anchor, {
														value: 'option3',
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_4 = $.text('Option 3');

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

									$.append($$anchor, fragment_3);
								},
								$$slots: { default: true }
							});
						});

						var node_8 = $.sibling(node_1, 2);

						$.component(node_8, () => Field.Field, ($$anchor, Field_Field_1) => {
							Field_Field_1($$anchor, {
								children: ($$anchor, $$slotProps) => {
									var fragment_5 = root_2();
									var node_9 = $.first_child(fragment_5);

									$.component(node_9, () => Field.Label, ($$anchor, Field_Label_1) => {
										Field_Label_1($$anchor, {
											for: 'native-select-country',
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_5 = $.text('Country');

												$.append($$anchor, text_5);
											},
											$$slots: { default: true }
										});
									});

									var node_10 = $.sibling(node_9, 2);

									$.component(node_10, () => NativeSelect.Root, ($$anchor, NativeSelect_Root_1) => {
										NativeSelect_Root_1($$anchor, {
											id: 'native-select-country',
											children: ($$anchor, $$slotProps) => {
												var fragment_6 = root();
												var node_11 = $.first_child(fragment_6);

												$.component(node_11, () => NativeSelect.Option, ($$anchor, NativeSelect_Option_4) => {
													NativeSelect_Option_4($$anchor, {
														value: '',
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_6 = $.text('Select your country');

															$.append($$anchor, text_6);
														},
														$$slots: { default: true }
													});
												});

												var node_12 = $.sibling(node_11, 2);

												$.component(node_12, () => NativeSelect.Option, ($$anchor, NativeSelect_Option_5) => {
													NativeSelect_Option_5($$anchor, {
														value: 'us',
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_7 = $.text('United States');

															$.append($$anchor, text_7);
														},
														$$slots: { default: true }
													});
												});

												var node_13 = $.sibling(node_12, 2);

												$.component(node_13, () => NativeSelect.Option, ($$anchor, NativeSelect_Option_6) => {
													NativeSelect_Option_6($$anchor, {
														value: 'uk',
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_8 = $.text('United Kingdom');

															$.append($$anchor, text_8);
														},
														$$slots: { default: true }
													});
												});

												var node_14 = $.sibling(node_13, 2);

												$.component(node_14, () => NativeSelect.Option, ($$anchor, NativeSelect_Option_7) => {
													NativeSelect_Option_7($$anchor, {
														value: 'ca',
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_9 = $.text('Canada');

															$.append($$anchor, text_9);
														},
														$$slots: { default: true }
													});
												});

												$.append($$anchor, fragment_6);
											},
											$$slots: { default: true }
										});
									});

									var node_15 = $.sibling(node_10, 2);

									$.component(node_15, () => Field.Description, ($$anchor, Field_Description) => {
										Field_Description($$anchor, {
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_10 = $.text('Select the country where you currently reside.');

												$.append($$anchor, text_10);
											},
											$$slots: { default: true }
										});
									});

									$.append($$anchor, fragment_5);
								},
								$$slots: { default: true }
							});
						});

						var node_16 = $.sibling(node_8, 2);

						$.component(node_16, () => Field.Field, ($$anchor, Field_Field_2) => {
							Field_Field_2($$anchor, {
								children: ($$anchor, $$slotProps) => {
									var fragment_7 = root_2();
									var node_17 = $.first_child(fragment_7);

									$.component(node_17, () => Field.Label, ($$anchor, Field_Label_2) => {
										Field_Label_2($$anchor, {
											for: 'native-select-timezone',
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_11 = $.text('Timezone');

												$.append($$anchor, text_11);
											},
											$$slots: { default: true }
										});
									});

									var node_18 = $.sibling(node_17, 2);

									$.component(node_18, () => Field.Description, ($$anchor, Field_Description_1) => {
										Field_Description_1($$anchor, {
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_12 = $.text('Choose your local timezone for accurate scheduling.');

												$.append($$anchor, text_12);
											},
											$$slots: { default: true }
										});
									});

									var node_19 = $.sibling(node_18, 2);

									$.component(node_19, () => NativeSelect.Root, ($$anchor, NativeSelect_Root_2) => {
										NativeSelect_Root_2($$anchor, {
											id: 'native-select-timezone',
											children: ($$anchor, $$slotProps) => {
												var fragment_8 = root();
												var node_20 = $.first_child(fragment_8);

												$.component(node_20, () => NativeSelect.Option, ($$anchor, NativeSelect_Option_8) => {
													NativeSelect_Option_8($$anchor, {
														value: '',
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_13 = $.text('Select timezone');

															$.append($$anchor, text_13);
														},
														$$slots: { default: true }
													});
												});

												var node_21 = $.sibling(node_20, 2);

												$.component(node_21, () => NativeSelect.Option, ($$anchor, NativeSelect_Option_9) => {
													NativeSelect_Option_9($$anchor, {
														value: 'utc',
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_14 = $.text('UTC');

															$.append($$anchor, text_14);
														},
														$$slots: { default: true }
													});
												});

												var node_22 = $.sibling(node_21, 2);

												$.component(node_22, () => NativeSelect.Option, ($$anchor, NativeSelect_Option_10) => {
													NativeSelect_Option_10($$anchor, {
														value: 'est',
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_15 = $.text('Eastern Time');

															$.append($$anchor, text_15);
														},
														$$slots: { default: true }
													});
												});

												var node_23 = $.sibling(node_22, 2);

												$.component(node_23, () => NativeSelect.Option, ($$anchor, NativeSelect_Option_11) => {
													NativeSelect_Option_11($$anchor, {
														value: 'pst',
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_16 = $.text('Pacific Time');

															$.append($$anchor, text_16);
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

						var node_24 = $.sibling(node_16, 2);

						$.component(node_24, () => Field.Field, ($$anchor, Field_Field_3) => {
							Field_Field_3($$anchor, {
								children: ($$anchor, $$slotProps) => {
									var fragment_9 = root_2();
									var node_25 = $.first_child(fragment_9);

									$.component(node_25, () => Field.Label, ($$anchor, Field_Label_3) => {
										Field_Label_3($$anchor, {
											for: 'native-select-grouped',
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_17 = $.text('Grouped Options');

												$.append($$anchor, text_17);
											},
											$$slots: { default: true }
										});
									});

									var node_26 = $.sibling(node_25, 2);

									$.component(node_26, () => NativeSelect.Root, ($$anchor, NativeSelect_Root_3) => {
										NativeSelect_Root_3($$anchor, {
											id: 'native-select-grouped',
											children: ($$anchor, $$slotProps) => {
												var fragment_10 = root_2();
												var node_27 = $.first_child(fragment_10);

												$.component(node_27, () => NativeSelect.Option, ($$anchor, NativeSelect_Option_12) => {
													NativeSelect_Option_12($$anchor, {
														value: '',
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_18 = $.text('Select a region');

															$.append($$anchor, text_18);
														},
														$$slots: { default: true }
													});
												});

												var node_28 = $.sibling(node_27, 2);

												$.component(node_28, () => NativeSelect.OptGroup, ($$anchor, NativeSelect_OptGroup) => {
													NativeSelect_OptGroup($$anchor, {
														label: 'North America',
														children: ($$anchor, $$slotProps) => {
															var fragment_11 = root_2();
															var node_29 = $.first_child(fragment_11);

															$.component(node_29, () => NativeSelect.Option, ($$anchor, NativeSelect_Option_13) => {
																NativeSelect_Option_13($$anchor, {
																	value: 'us',
																	children: ($$anchor, $$slotProps) => {
																		$.next();

																		var text_19 = $.text('United States');

																		$.append($$anchor, text_19);
																	},
																	$$slots: { default: true }
																});
															});

															var node_30 = $.sibling(node_29, 2);

															$.component(node_30, () => NativeSelect.Option, ($$anchor, NativeSelect_Option_14) => {
																NativeSelect_Option_14($$anchor, {
																	value: 'ca',
																	children: ($$anchor, $$slotProps) => {
																		$.next();

																		var text_20 = $.text('Canada');

																		$.append($$anchor, text_20);
																	},
																	$$slots: { default: true }
																});
															});

															var node_31 = $.sibling(node_30, 2);

															$.component(node_31, () => NativeSelect.Option, ($$anchor, NativeSelect_Option_15) => {
																NativeSelect_Option_15($$anchor, {
																	value: 'mx',
																	children: ($$anchor, $$slotProps) => {
																		$.next();

																		var text_21 = $.text('Mexico');

																		$.append($$anchor, text_21);
																	},
																	$$slots: { default: true }
																});
															});

															$.append($$anchor, fragment_11);
														},
														$$slots: { default: true }
													});
												});

												var node_32 = $.sibling(node_28, 2);

												$.component(node_32, () => NativeSelect.OptGroup, ($$anchor, NativeSelect_OptGroup_1) => {
													NativeSelect_OptGroup_1($$anchor, {
														label: 'Europe',
														children: ($$anchor, $$slotProps) => {
															var fragment_12 = root_2();
															var node_33 = $.first_child(fragment_12);

															$.component(node_33, () => NativeSelect.Option, ($$anchor, NativeSelect_Option_16) => {
																NativeSelect_Option_16($$anchor, {
																	value: 'uk',
																	children: ($$anchor, $$slotProps) => {
																		$.next();

																		var text_22 = $.text('United Kingdom');

																		$.append($$anchor, text_22);
																	},
																	$$slots: { default: true }
																});
															});

															var node_34 = $.sibling(node_33, 2);

															$.component(node_34, () => NativeSelect.Option, ($$anchor, NativeSelect_Option_17) => {
																NativeSelect_Option_17($$anchor, {
																	value: 'fr',
																	children: ($$anchor, $$slotProps) => {
																		$.next();

																		var text_23 = $.text('France');

																		$.append($$anchor, text_23);
																	},
																	$$slots: { default: true }
																});
															});

															var node_35 = $.sibling(node_34, 2);

															$.component(node_35, () => NativeSelect.Option, ($$anchor, NativeSelect_Option_18) => {
																NativeSelect_Option_18($$anchor, {
																	value: 'de',
																	children: ($$anchor, $$slotProps) => {
																		$.next();

																		var text_24 = $.text('Germany');

																		$.append($$anchor, text_24);
																	},
																	$$slots: { default: true }
																});
															});

															$.append($$anchor, fragment_12);
														},
														$$slots: { default: true }
													});
												});

												$.append($$anchor, fragment_10);
											},
											$$slots: { default: true }
										});
									});

									var node_36 = $.sibling(node_26, 2);

									$.component(node_36, () => Field.Description, ($$anchor, Field_Description_2) => {
										Field_Description_2($$anchor, {
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_25 = $.text('Native select with grouped options using optgroup.');

												$.append($$anchor, text_25);
											},
											$$slots: { default: true }
										});
									});

									$.append($$anchor, fragment_9);
								},
								$$slots: { default: true }
							});
						});

						var node_37 = $.sibling(node_24, 2);

						$.component(node_37, () => Field.Field, ($$anchor, Field_Field_4) => {
							Field_Field_4($$anchor, {
								'data-invalid': true,
								children: ($$anchor, $$slotProps) => {
									var fragment_13 = root_2();
									var node_38 = $.first_child(fragment_13);

									$.component(node_38, () => Field.Label, ($$anchor, Field_Label_4) => {
										Field_Label_4($$anchor, {
											for: 'native-select-invalid',
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_26 = $.text('Invalid Native Select');

												$.append($$anchor, text_26);
											},
											$$slots: { default: true }
										});
									});

									var node_39 = $.sibling(node_38, 2);

									$.component(node_39, () => NativeSelect.Root, ($$anchor, NativeSelect_Root_4) => {
										NativeSelect_Root_4($$anchor, {
											id: 'native-select-invalid',
											'aria-invalid': true,
											children: ($$anchor, $$slotProps) => {
												var fragment_14 = root();
												var node_40 = $.first_child(fragment_14);

												$.component(node_40, () => NativeSelect.Option, ($$anchor, NativeSelect_Option_19) => {
													NativeSelect_Option_19($$anchor, {
														value: '',
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_27 = $.text('This field has an error');

															$.append($$anchor, text_27);
														},
														$$slots: { default: true }
													});
												});

												var node_41 = $.sibling(node_40, 2);

												$.component(node_41, () => NativeSelect.Option, ($$anchor, NativeSelect_Option_20) => {
													NativeSelect_Option_20($$anchor, {
														value: 'option1',
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_28 = $.text('Option 1');

															$.append($$anchor, text_28);
														},
														$$slots: { default: true }
													});
												});

												var node_42 = $.sibling(node_41, 2);

												$.component(node_42, () => NativeSelect.Option, ($$anchor, NativeSelect_Option_21) => {
													NativeSelect_Option_21($$anchor, {
														value: 'option2',
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_29 = $.text('Option 2');

															$.append($$anchor, text_29);
														},
														$$slots: { default: true }
													});
												});

												var node_43 = $.sibling(node_42, 2);

												$.component(node_43, () => NativeSelect.Option, ($$anchor, NativeSelect_Option_22) => {
													NativeSelect_Option_22($$anchor, {
														value: 'option3',
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_30 = $.text('Option 3');

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

									var node_44 = $.sibling(node_39, 2);

									$.component(node_44, () => Field.Description, ($$anchor, Field_Description_3) => {
										Field_Description_3($$anchor, {
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_31 = $.text('This field contains validation errors.');

												$.append($$anchor, text_31);
											},
											$$slots: { default: true }
										});
									});

									$.append($$anchor, fragment_13);
								},
								$$slots: { default: true }
							});
						});

						var node_45 = $.sibling(node_37, 2);

						$.component(node_45, () => Field.Field, ($$anchor, Field_Field_5) => {
							Field_Field_5($$anchor, {
								'data-disabled': true,
								children: ($$anchor, $$slotProps) => {
									var fragment_15 = root_2();
									var node_46 = $.first_child(fragment_15);

									$.component(node_46, () => Field.Label, ($$anchor, Field_Label_5) => {
										Field_Label_5($$anchor, {
											for: 'native-select-disabled-field',
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_32 = $.text('Disabled Field');

												$.append($$anchor, text_32);
											},
											$$slots: { default: true }
										});
									});

									var node_47 = $.sibling(node_46, 2);

									$.component(node_47, () => NativeSelect.Root, ($$anchor, NativeSelect_Root_5) => {
										NativeSelect_Root_5($$anchor, {
											id: 'native-select-disabled-field',
											disabled: true,
											children: ($$anchor, $$slotProps) => {
												var fragment_16 = root();
												var node_48 = $.first_child(fragment_16);

												$.component(node_48, () => NativeSelect.Option, ($$anchor, NativeSelect_Option_23) => {
													NativeSelect_Option_23($$anchor, {
														value: '',
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_33 = $.text('Cannot select');

															$.append($$anchor, text_33);
														},
														$$slots: { default: true }
													});
												});

												var node_49 = $.sibling(node_48, 2);

												$.component(node_49, () => NativeSelect.Option, ($$anchor, NativeSelect_Option_24) => {
													NativeSelect_Option_24($$anchor, {
														value: 'option1',
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_34 = $.text('Option 1');

															$.append($$anchor, text_34);
														},
														$$slots: { default: true }
													});
												});

												var node_50 = $.sibling(node_49, 2);

												$.component(node_50, () => NativeSelect.Option, ($$anchor, NativeSelect_Option_25) => {
													NativeSelect_Option_25($$anchor, {
														value: 'option2',
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_35 = $.text('Option 2');

															$.append($$anchor, text_35);
														},
														$$slots: { default: true }
													});
												});

												var node_51 = $.sibling(node_50, 2);

												$.component(node_51, () => NativeSelect.Option, ($$anchor, NativeSelect_Option_26) => {
													NativeSelect_Option_26($$anchor, {
														value: 'option3',
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_36 = $.text('Option 3');

															$.append($$anchor, text_36);
														},
														$$slots: { default: true }
													});
												});

												$.append($$anchor, fragment_16);
											},
											$$slots: { default: true }
										});
									});

									var node_52 = $.sibling(node_47, 2);

									$.component(node_52, () => Field.Description, ($$anchor, Field_Description_4) => {
										Field_Description_4($$anchor, {
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_37 = $.text('This field is currently disabled.');

												$.append($$anchor, text_37);
											},
											$$slots: { default: true }
										});
									});

									$.append($$anchor, fragment_15);
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