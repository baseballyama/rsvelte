import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as Field from "$lib/registry/ui/field/index.js";
import * as Select from "$lib/registry/ui/select/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!>`, 1);
var root_2 = $.from_html(`<!> <!> <!> <!> <!>`, 1);

export default function Field_select_fields($$anchor, $$props) {
	$.push($$props, true);

	const basicItems = [
		{ label: "Option 1", value: "option1" },
		{ label: "Option 2", value: "option2" },
		{ label: "Option 3", value: "option3" }
	];

	const countryItems = [
		{ label: "United States", value: "us" },
		{ label: "United Kingdom", value: "uk" },
		{ label: "Canada", value: "ca" }
	];

	const timezoneItems = [
		{ label: "UTC", value: "utc" },
		{ label: "Eastern Time", value: "est" },
		{ label: "Pacific Time", value: "pst" }
	];

	const invalidItems = [
		{ label: "Option 1", value: "option1" },
		{ label: "Option 2", value: "option2" },
		{ label: "Option 3", value: "option3" }
	];

	const disabledItems = [
		{ label: "Option 1", value: "option1" },
		{ label: "Option 2", value: "option2" },
		{ label: "Option 3", value: "option3" }
	];

	let basicValue = $.state(undefined);
	let countryValue = $.state(undefined);
	let timezoneValue = $.state(undefined);
	let invalidValue = $.state(undefined);
	let disabledValue = $.state(undefined);
	const basicLabel = $.derived(() => basicItems.find((item) => item.value === $.get(basicValue))?.label ?? "Choose an option");
	const countryLabel = $.derived(() => countryItems.find((item) => item.value === $.get(countryValue))?.label ?? "Select your country");
	const timezoneLabel = $.derived(() => timezoneItems.find((item) => item.value === $.get(timezoneValue))?.label ?? "Select timezone");
	const invalidLabel = $.derived(() => invalidItems.find((item) => item.value === $.get(invalidValue))?.label ?? "This field has an error");
	const disabledLabel = $.derived(() => disabledItems.find((item) => item.value === $.get(disabledValue))?.label ?? "Cannot select");

	Example($$anchor, {
		title: 'Select Fields',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = $.comment();
			var node = $.first_child(fragment_1);

			$.component(node, () => Field.Group, ($$anchor, Field_Group) => {
				Field_Group($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = root_2();
						var node_1 = $.first_child(fragment_2);

						$.component(node_1, () => Field.Field, ($$anchor, Field_Field) => {
							Field_Field($$anchor, {
								children: ($$anchor, $$slotProps) => {
									var fragment_3 = root();
									var node_2 = $.first_child(fragment_3);

									$.component(node_2, () => Field.Label, ($$anchor, Field_Label) => {
										Field_Label($$anchor, {
											for: 'select-basic',
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text = $.text('Basic Select');

												$.append($$anchor, text);
											},
											$$slots: { default: true }
										});
									});

									var node_3 = $.sibling(node_2, 2);

									$.component(node_3, () => Select.Root, ($$anchor, Select_Root) => {
										Select_Root($$anchor, {
											type: 'single',
											get value() {
												return $.get(basicValue);
											},

											set value($$value) {
												$.set(basicValue, $$value, true);
											},

											children: ($$anchor, $$slotProps) => {
												var fragment_4 = root();
												var node_4 = $.first_child(fragment_4);

												$.component(node_4, () => Select.Trigger, ($$anchor, Select_Trigger) => {
													Select_Trigger($$anchor, {
														id: 'select-basic',
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_1 = $.text();

															$.template_effect(() => $.set_text(text_1, $.get(basicLabel)));
															$.append($$anchor, text_1);
														},
														$$slots: { default: true }
													});
												});

												var node_5 = $.sibling(node_4, 2);

												$.component(node_5, () => Select.Content, ($$anchor, Select_Content) => {
													Select_Content($$anchor, {
														children: ($$anchor, $$slotProps) => {
															var fragment_6 = $.comment();
															var node_6 = $.first_child(fragment_6);

															$.component(node_6, () => Select.Group, ($$anchor, Select_Group) => {
																Select_Group($$anchor, {
																	children: ($$anchor, $$slotProps) => {
																		var fragment_7 = $.comment();
																		var node_7 = $.first_child(fragment_7);

																		$.each(node_7, 17, () => basicItems, (item) => item.value, ($$anchor, item) => {
																			var fragment_8 = $.comment();
																			var node_8 = $.first_child(fragment_8);

																			$.component(node_8, () => Select.Item, ($$anchor, Select_Item) => {
																				Select_Item($$anchor, {
																					get value() {
																						return $.get(item).value;
																					},

																					children: ($$anchor, $$slotProps) => {
																						$.next();

																						var text_2 = $.text();

																						$.template_effect(() => $.set_text(text_2, $.get(item).label));
																						$.append($$anchor, text_2);
																					},
																					$$slots: { default: true }
																				});
																			});

																			$.append($$anchor, fragment_8);
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

						var node_9 = $.sibling(node_1, 2);

						$.component(node_9, () => Field.Field, ($$anchor, Field_Field_1) => {
							Field_Field_1($$anchor, {
								children: ($$anchor, $$slotProps) => {
									var fragment_10 = root_1();
									var node_10 = $.first_child(fragment_10);

									$.component(node_10, () => Field.Label, ($$anchor, Field_Label_1) => {
										Field_Label_1($$anchor, {
											for: 'select-country',
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_3 = $.text('Country');

												$.append($$anchor, text_3);
											},
											$$slots: { default: true }
										});
									});

									var node_11 = $.sibling(node_10, 2);

									$.component(node_11, () => Select.Root, ($$anchor, Select_Root_1) => {
										Select_Root_1($$anchor, {
											type: 'single',
											get value() {
												return $.get(countryValue);
											},

											set value($$value) {
												$.set(countryValue, $$value, true);
											},

											children: ($$anchor, $$slotProps) => {
												var fragment_11 = root();
												var node_12 = $.first_child(fragment_11);

												$.component(node_12, () => Select.Trigger, ($$anchor, Select_Trigger_1) => {
													Select_Trigger_1($$anchor, {
														id: 'select-country',
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_4 = $.text();

															$.template_effect(() => $.set_text(text_4, $.get(countryLabel)));
															$.append($$anchor, text_4);
														},
														$$slots: { default: true }
													});
												});

												var node_13 = $.sibling(node_12, 2);

												$.component(node_13, () => Select.Content, ($$anchor, Select_Content_1) => {
													Select_Content_1($$anchor, {
														children: ($$anchor, $$slotProps) => {
															var fragment_13 = $.comment();
															var node_14 = $.first_child(fragment_13);

															$.component(node_14, () => Select.Group, ($$anchor, Select_Group_1) => {
																Select_Group_1($$anchor, {
																	children: ($$anchor, $$slotProps) => {
																		var fragment_14 = $.comment();
																		var node_15 = $.first_child(fragment_14);

																		$.each(node_15, 17, () => countryItems, (item) => item.value, ($$anchor, item) => {
																			var fragment_15 = $.comment();
																			var node_16 = $.first_child(fragment_15);

																			$.component(node_16, () => Select.Item, ($$anchor, Select_Item_1) => {
																				Select_Item_1($$anchor, {
																					get value() {
																						return $.get(item).value;
																					},

																					children: ($$anchor, $$slotProps) => {
																						$.next();

																						var text_5 = $.text();

																						$.template_effect(() => $.set_text(text_5, $.get(item).label));
																						$.append($$anchor, text_5);
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

									var node_17 = $.sibling(node_11, 2);

									$.component(node_17, () => Field.Description, ($$anchor, Field_Description) => {
										Field_Description($$anchor, {
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_6 = $.text('Select the country where you currently reside.');

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

						var node_18 = $.sibling(node_9, 2);

						$.component(node_18, () => Field.Field, ($$anchor, Field_Field_2) => {
							Field_Field_2($$anchor, {
								children: ($$anchor, $$slotProps) => {
									var fragment_17 = root_1();
									var node_19 = $.first_child(fragment_17);

									$.component(node_19, () => Field.Label, ($$anchor, Field_Label_2) => {
										Field_Label_2($$anchor, {
											for: 'select-timezone',
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_7 = $.text('Timezone');

												$.append($$anchor, text_7);
											},
											$$slots: { default: true }
										});
									});

									var node_20 = $.sibling(node_19, 2);

									$.component(node_20, () => Field.Description, ($$anchor, Field_Description_1) => {
										Field_Description_1($$anchor, {
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_8 = $.text('Choose your local timezone for accurate scheduling.');

												$.append($$anchor, text_8);
											},
											$$slots: { default: true }
										});
									});

									var node_21 = $.sibling(node_20, 2);

									$.component(node_21, () => Select.Root, ($$anchor, Select_Root_2) => {
										Select_Root_2($$anchor, {
											type: 'single',
											get value() {
												return $.get(timezoneValue);
											},

											set value($$value) {
												$.set(timezoneValue, $$value, true);
											},

											children: ($$anchor, $$slotProps) => {
												var fragment_18 = root();
												var node_22 = $.first_child(fragment_18);

												$.component(node_22, () => Select.Trigger, ($$anchor, Select_Trigger_2) => {
													Select_Trigger_2($$anchor, {
														id: 'select-timezone',
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_9 = $.text();

															$.template_effect(() => $.set_text(text_9, $.get(timezoneLabel)));
															$.append($$anchor, text_9);
														},
														$$slots: { default: true }
													});
												});

												var node_23 = $.sibling(node_22, 2);

												$.component(node_23, () => Select.Content, ($$anchor, Select_Content_2) => {
													Select_Content_2($$anchor, {
														children: ($$anchor, $$slotProps) => {
															var fragment_20 = $.comment();
															var node_24 = $.first_child(fragment_20);

															$.component(node_24, () => Select.Group, ($$anchor, Select_Group_2) => {
																Select_Group_2($$anchor, {
																	children: ($$anchor, $$slotProps) => {
																		var fragment_21 = $.comment();
																		var node_25 = $.first_child(fragment_21);

																		$.each(node_25, 17, () => timezoneItems, (item) => item.value, ($$anchor, item) => {
																			var fragment_22 = $.comment();
																			var node_26 = $.first_child(fragment_22);

																			$.component(node_26, () => Select.Item, ($$anchor, Select_Item_2) => {
																				Select_Item_2($$anchor, {
																					get value() {
																						return $.get(item).value;
																					},

																					children: ($$anchor, $$slotProps) => {
																						$.next();

																						var text_10 = $.text();

																						$.template_effect(() => $.set_text(text_10, $.get(item).label));
																						$.append($$anchor, text_10);
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

						var node_27 = $.sibling(node_18, 2);

						$.component(node_27, () => Field.Field, ($$anchor, Field_Field_3) => {
							Field_Field_3($$anchor, {
								'data-invalid': true,
								children: ($$anchor, $$slotProps) => {
									var fragment_24 = root_1();
									var node_28 = $.first_child(fragment_24);

									$.component(node_28, () => Field.Label, ($$anchor, Field_Label_3) => {
										Field_Label_3($$anchor, {
											for: 'select-invalid',
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_11 = $.text('Invalid Select');

												$.append($$anchor, text_11);
											},
											$$slots: { default: true }
										});
									});

									var node_29 = $.sibling(node_28, 2);

									$.component(node_29, () => Select.Root, ($$anchor, Select_Root_3) => {
										Select_Root_3($$anchor, {
											type: 'single',
											get value() {
												return $.get(invalidValue);
											},

											set value($$value) {
												$.set(invalidValue, $$value, true);
											},

											children: ($$anchor, $$slotProps) => {
												var fragment_25 = root();
												var node_30 = $.first_child(fragment_25);

												$.component(node_30, () => Select.Trigger, ($$anchor, Select_Trigger_3) => {
													Select_Trigger_3($$anchor, {
														id: 'select-invalid',
														'aria-invalid': true,
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_12 = $.text();

															$.template_effect(() => $.set_text(text_12, $.get(invalidLabel)));
															$.append($$anchor, text_12);
														},
														$$slots: { default: true }
													});
												});

												var node_31 = $.sibling(node_30, 2);

												$.component(node_31, () => Select.Content, ($$anchor, Select_Content_3) => {
													Select_Content_3($$anchor, {
														children: ($$anchor, $$slotProps) => {
															var fragment_27 = $.comment();
															var node_32 = $.first_child(fragment_27);

															$.component(node_32, () => Select.Group, ($$anchor, Select_Group_3) => {
																Select_Group_3($$anchor, {
																	children: ($$anchor, $$slotProps) => {
																		var fragment_28 = $.comment();
																		var node_33 = $.first_child(fragment_28);

																		$.each(node_33, 17, () => invalidItems, (item) => item.value, ($$anchor, item) => {
																			var fragment_29 = $.comment();
																			var node_34 = $.first_child(fragment_29);

																			$.component(node_34, () => Select.Item, ($$anchor, Select_Item_3) => {
																				Select_Item_3($$anchor, {
																					get value() {
																						return $.get(item).value;
																					},

																					children: ($$anchor, $$slotProps) => {
																						$.next();

																						var text_13 = $.text();

																						$.template_effect(() => $.set_text(text_13, $.get(item).label));
																						$.append($$anchor, text_13);
																					},
																					$$slots: { default: true }
																				});
																			});

																			$.append($$anchor, fragment_29);
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

												$.append($$anchor, fragment_25);
											},
											$$slots: { default: true }
										});
									});

									var node_35 = $.sibling(node_29, 2);

									$.component(node_35, () => Field.Description, ($$anchor, Field_Description_2) => {
										Field_Description_2($$anchor, {
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_14 = $.text('This field contains validation errors.');

												$.append($$anchor, text_14);
											},
											$$slots: { default: true }
										});
									});

									$.append($$anchor, fragment_24);
								},
								$$slots: { default: true }
							});
						});

						var node_36 = $.sibling(node_27, 2);

						$.component(node_36, () => Field.Field, ($$anchor, Field_Field_4) => {
							Field_Field_4($$anchor, {
								'data-disabled': true,
								children: ($$anchor, $$slotProps) => {
									var fragment_31 = root_1();
									var node_37 = $.first_child(fragment_31);

									$.component(node_37, () => Field.Label, ($$anchor, Field_Label_4) => {
										Field_Label_4($$anchor, {
											for: 'select-disabled-field',
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_15 = $.text('Disabled Field');

												$.append($$anchor, text_15);
											},
											$$slots: { default: true }
										});
									});

									var node_38 = $.sibling(node_37, 2);

									$.component(node_38, () => Select.Root, ($$anchor, Select_Root_4) => {
										Select_Root_4($$anchor, {
											type: 'single',
											disabled: true,
											get value() {
												return $.get(disabledValue);
											},

											set value($$value) {
												$.set(disabledValue, $$value, true);
											},

											children: ($$anchor, $$slotProps) => {
												var fragment_32 = root();
												var node_39 = $.first_child(fragment_32);

												$.component(node_39, () => Select.Trigger, ($$anchor, Select_Trigger_4) => {
													Select_Trigger_4($$anchor, {
														id: 'select-disabled-field',
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_16 = $.text();

															$.template_effect(() => $.set_text(text_16, $.get(disabledLabel)));
															$.append($$anchor, text_16);
														},
														$$slots: { default: true }
													});
												});

												var node_40 = $.sibling(node_39, 2);

												$.component(node_40, () => Select.Content, ($$anchor, Select_Content_4) => {
													Select_Content_4($$anchor, {
														children: ($$anchor, $$slotProps) => {
															var fragment_34 = $.comment();
															var node_41 = $.first_child(fragment_34);

															$.component(node_41, () => Select.Group, ($$anchor, Select_Group_4) => {
																Select_Group_4($$anchor, {
																	children: ($$anchor, $$slotProps) => {
																		var fragment_35 = $.comment();
																		var node_42 = $.first_child(fragment_35);

																		$.each(node_42, 17, () => disabledItems, (item) => item.value, ($$anchor, item) => {
																			var fragment_36 = $.comment();
																			var node_43 = $.first_child(fragment_36);

																			$.component(node_43, () => Select.Item, ($$anchor, Select_Item_4) => {
																				Select_Item_4($$anchor, {
																					get value() {
																						return $.get(item).value;
																					},

																					children: ($$anchor, $$slotProps) => {
																						$.next();

																						var text_17 = $.text();

																						$.template_effect(() => $.set_text(text_17, $.get(item).label));
																						$.append($$anchor, text_17);
																					},
																					$$slots: { default: true }
																				});
																			});

																			$.append($$anchor, fragment_36);
																		});

																		$.append($$anchor, fragment_35);
																	},
																	$$slots: { default: true }
																});
															});

															$.append($$anchor, fragment_34);
														},
														$$slots: { default: true }
													});
												});

												$.append($$anchor, fragment_32);
											},
											$$slots: { default: true }
										});
									});

									var node_44 = $.sibling(node_38, 2);

									$.component(node_44, () => Field.Description, ($$anchor, Field_Description_3) => {
										Field_Description_3($$anchor, {
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_18 = $.text('This field is currently disabled.');

												$.append($$anchor, text_18);
											},
											$$slots: { default: true }
										});
									});

									$.append($$anchor, fragment_31);
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