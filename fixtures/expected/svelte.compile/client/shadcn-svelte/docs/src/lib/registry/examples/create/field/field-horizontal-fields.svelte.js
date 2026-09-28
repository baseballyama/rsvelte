import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as Field from "$lib/registry/ui/field/index.js";
import * as Input from "$lib/registry/ui/input/index.js";
import * as NativeSelect from "$lib/registry/ui/native-select/index.js";
import * as Select from "$lib/registry/ui/select/index.js";
import * as Textarea from "$lib/registry/ui/textarea/index.js";
import { Slider } from "$lib/registry/ui/slider/index.js";
import { Switch } from "$lib/registry/ui/switch/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!> <!>`, 1);
var root_2 = $.from_html(`<!> <!> <!> <!> <!> <!>`, 1);

export default function Field_horizontal_fields($$anchor, $$props) {
	$.push($$props, true);

	const basicItems = [
		{ label: "Select a fruit", value: undefined },
		{ label: "Apple", value: "apple" },
		{ label: "Banana", value: "banana" },
		{ label: "Orange", value: "orange" }
	];

	let fruitValue = $.state(undefined);
	const fruitLabel = $.derived(() => basicItems.find((item) => item.value === $.get(fruitValue))?.label ?? "Select a fruit");

	Example($$anchor, {
		title: 'Horizontal Fields',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = $.comment();
			var node = $.first_child(fragment_1);

			$.component(node, () => Field.Group, ($$anchor, Field_Group) => {
				Field_Group($$anchor, {
					class: '**:data-[slot=field-content]:min-w-48',
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = root_2();
						var node_1 = $.first_child(fragment_2);

						$.component(node_1, () => Field.Field, ($$anchor, Field_Field) => {
							Field_Field($$anchor, {
								orientation: 'horizontal',
								children: ($$anchor, $$slotProps) => {
									var fragment_3 = root();
									var node_2 = $.first_child(fragment_3);

									$.component(node_2, () => Field.Content, ($$anchor, Field_Content) => {
										Field_Content($$anchor, {
											children: ($$anchor, $$slotProps) => {
												var fragment_4 = root();
												var node_3 = $.first_child(fragment_4);

												$.component(node_3, () => Field.Label, ($$anchor, Field_Label) => {
													Field_Label($$anchor, {
														for: 'horizontal-input',
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text = $.text('Username');

															$.append($$anchor, text);
														},
														$$slots: { default: true }
													});
												});

												var node_4 = $.sibling(node_3, 2);

												$.component(node_4, () => Field.Description, ($$anchor, Field_Description) => {
													Field_Description($$anchor, {
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_1 = $.text('Enter your preferred username.');

															$.append($$anchor, text_1);
														},
														$$slots: { default: true }
													});
												});

												$.append($$anchor, fragment_4);
											},
											$$slots: { default: true }
										});
									});

									var node_5 = $.sibling(node_2, 2);

									$.component(node_5, () => Input.Root, ($$anchor, Input_Root) => {
										Input_Root($$anchor, { id: 'horizontal-input', placeholder: 'johndoe' });
									});

									$.append($$anchor, fragment_3);
								},
								$$slots: { default: true }
							});
						});

						var node_6 = $.sibling(node_1, 2);

						$.component(node_6, () => Field.Field, ($$anchor, Field_Field_1) => {
							Field_Field_1($$anchor, {
								orientation: 'horizontal',
								children: ($$anchor, $$slotProps) => {
									var fragment_5 = root();
									var node_7 = $.first_child(fragment_5);

									$.component(node_7, () => Field.Content, ($$anchor, Field_Content_1) => {
										Field_Content_1($$anchor, {
											children: ($$anchor, $$slotProps) => {
												var fragment_6 = root();
												var node_8 = $.first_child(fragment_6);

												$.component(node_8, () => Field.Label, ($$anchor, Field_Label_1) => {
													Field_Label_1($$anchor, {
														for: 'horizontal-textarea',
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_2 = $.text('Bio');

															$.append($$anchor, text_2);
														},
														$$slots: { default: true }
													});
												});

												var node_9 = $.sibling(node_8, 2);

												$.component(node_9, () => Field.Description, ($$anchor, Field_Description_1) => {
													Field_Description_1($$anchor, {
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_3 = $.text('Write a short description about yourself.');

															$.append($$anchor, text_3);
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

									$.component(node_10, () => Textarea.Root, ($$anchor, Textarea_Root) => {
										Textarea_Root($$anchor, {
											id: 'horizontal-textarea',
											placeholder: 'Tell us about yourself...'
										});
									});

									$.append($$anchor, fragment_5);
								},
								$$slots: { default: true }
							});
						});

						var node_11 = $.sibling(node_6, 2);

						$.component(node_11, () => Field.Field, ($$anchor, Field_Field_2) => {
							Field_Field_2($$anchor, {
								orientation: 'horizontal',
								children: ($$anchor, $$slotProps) => {
									var fragment_7 = root();
									var node_12 = $.first_child(fragment_7);

									$.component(node_12, () => Field.Content, ($$anchor, Field_Content_2) => {
										Field_Content_2($$anchor, {
											children: ($$anchor, $$slotProps) => {
												var fragment_8 = root();
												var node_13 = $.first_child(fragment_8);

												$.component(node_13, () => Field.Label, ($$anchor, Field_Label_2) => {
													Field_Label_2($$anchor, {
														for: 'horizontal-switch',
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_4 = $.text('Email Notifications');

															$.append($$anchor, text_4);
														},
														$$slots: { default: true }
													});
												});

												var node_14 = $.sibling(node_13, 2);

												$.component(node_14, () => Field.Description, ($$anchor, Field_Description_2) => {
													Field_Description_2($$anchor, {
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_5 = $.text('Receive email updates about your account.');

															$.append($$anchor, text_5);
														},
														$$slots: { default: true }
													});
												});

												$.append($$anchor, fragment_8);
											},
											$$slots: { default: true }
										});
									});

									var node_15 = $.sibling(node_12, 2);

									Switch(node_15, { id: 'horizontal-switch' });
									$.append($$anchor, fragment_7);
								},
								$$slots: { default: true }
							});
						});

						var node_16 = $.sibling(node_11, 2);

						$.component(node_16, () => Field.Field, ($$anchor, Field_Field_3) => {
							Field_Field_3($$anchor, {
								orientation: 'horizontal',
								children: ($$anchor, $$slotProps) => {
									var fragment_9 = root();
									var node_17 = $.first_child(fragment_9);

									$.component(node_17, () => Field.Content, ($$anchor, Field_Content_3) => {
										Field_Content_3($$anchor, {
											children: ($$anchor, $$slotProps) => {
												var fragment_10 = root();
												var node_18 = $.first_child(fragment_10);

												$.component(node_18, () => Field.Label, ($$anchor, Field_Label_3) => {
													Field_Label_3($$anchor, {
														for: 'horizontal-select',
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_6 = $.text('Favorite Fruit');

															$.append($$anchor, text_6);
														},
														$$slots: { default: true }
													});
												});

												var node_19 = $.sibling(node_18, 2);

												$.component(node_19, () => Field.Description, ($$anchor, Field_Description_3) => {
													Field_Description_3($$anchor, {
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_7 = $.text('Choose your favorite fruit.');

															$.append($$anchor, text_7);
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

									$.component(node_20, () => Select.Root, ($$anchor, Select_Root) => {
										Select_Root($$anchor, {
											type: 'single',
											get value() {
												return $.get(fruitValue);
											},

											set value($$value) {
												$.set(fruitValue, $$value, true);
											},

											children: ($$anchor, $$slotProps) => {
												var fragment_11 = root();
												var node_21 = $.first_child(fragment_11);

												$.component(node_21, () => Select.Trigger, ($$anchor, Select_Trigger) => {
													Select_Trigger($$anchor, {
														id: 'horizontal-select',
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_8 = $.text();

															$.template_effect(() => $.set_text(text_8, $.get(fruitLabel)));
															$.append($$anchor, text_8);
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

																		$.each(node_24, 17, () => basicItems.filter((i) => i.value !== undefined), (item) => item.value, ($$anchor, item) => {
																			var fragment_15 = $.comment();
																			var node_25 = $.first_child(fragment_15);

																			$.component(node_25, () => Select.Item, ($$anchor, Select_Item) => {
																				Select_Item($$anchor, {
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

									$.append($$anchor, fragment_9);
								},
								$$slots: { default: true }
							});
						});

						var node_26 = $.sibling(node_16, 2);

						$.component(node_26, () => Field.Field, ($$anchor, Field_Field_4) => {
							Field_Field_4($$anchor, {
								orientation: 'horizontal',
								children: ($$anchor, $$slotProps) => {
									var fragment_17 = root();
									var node_27 = $.first_child(fragment_17);

									$.component(node_27, () => Field.Content, ($$anchor, Field_Content_4) => {
										Field_Content_4($$anchor, {
											children: ($$anchor, $$slotProps) => {
												var fragment_18 = root();
												var node_28 = $.first_child(fragment_18);

												$.component(node_28, () => Field.Label, ($$anchor, Field_Label_4) => {
													Field_Label_4($$anchor, {
														for: 'horizontal-native-select',
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_10 = $.text('Country');

															$.append($$anchor, text_10);
														},
														$$slots: { default: true }
													});
												});

												var node_29 = $.sibling(node_28, 2);

												$.component(node_29, () => Field.Description, ($$anchor, Field_Description_4) => {
													Field_Description_4($$anchor, {
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_11 = $.text('Select your country.');

															$.append($$anchor, text_11);
														},
														$$slots: { default: true }
													});
												});

												$.append($$anchor, fragment_18);
											},
											$$slots: { default: true }
										});
									});

									var node_30 = $.sibling(node_27, 2);

									$.component(node_30, () => NativeSelect.Root, ($$anchor, NativeSelect_Root) => {
										NativeSelect_Root($$anchor, {
											id: 'horizontal-native-select',
											children: ($$anchor, $$slotProps) => {
												var fragment_19 = root_1();
												var node_31 = $.first_child(fragment_19);

												$.component(node_31, () => NativeSelect.Option, ($$anchor, NativeSelect_Option) => {
													NativeSelect_Option($$anchor, {
														value: '',
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_12 = $.text('Select a country');

															$.append($$anchor, text_12);
														},
														$$slots: { default: true }
													});
												});

												var node_32 = $.sibling(node_31, 2);

												$.component(node_32, () => NativeSelect.Option, ($$anchor, NativeSelect_Option_1) => {
													NativeSelect_Option_1($$anchor, {
														value: 'us',
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_13 = $.text('United States');

															$.append($$anchor, text_13);
														},
														$$slots: { default: true }
													});
												});

												var node_33 = $.sibling(node_32, 2);

												$.component(node_33, () => NativeSelect.Option, ($$anchor, NativeSelect_Option_2) => {
													NativeSelect_Option_2($$anchor, {
														value: 'uk',
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_14 = $.text('United Kingdom');

															$.append($$anchor, text_14);
														},
														$$slots: { default: true }
													});
												});

												var node_34 = $.sibling(node_33, 2);

												$.component(node_34, () => NativeSelect.Option, ($$anchor, NativeSelect_Option_3) => {
													NativeSelect_Option_3($$anchor, {
														value: 'ca',
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_15 = $.text('Canada');

															$.append($$anchor, text_15);
														},
														$$slots: { default: true }
													});
												});

												$.append($$anchor, fragment_19);
											},
											$$slots: { default: true }
										});
									});

									$.append($$anchor, fragment_17);
								},
								$$slots: { default: true }
							});
						});

						var node_35 = $.sibling(node_26, 2);

						$.component(node_35, () => Field.Field, ($$anchor, Field_Field_5) => {
							Field_Field_5($$anchor, {
								orientation: 'horizontal',
								children: ($$anchor, $$slotProps) => {
									var fragment_20 = root();
									var node_36 = $.first_child(fragment_20);

									$.component(node_36, () => Field.Content, ($$anchor, Field_Content_5) => {
										Field_Content_5($$anchor, {
											children: ($$anchor, $$slotProps) => {
												var fragment_21 = root();
												var node_37 = $.first_child(fragment_21);

												$.component(node_37, () => Field.Label, ($$anchor, Field_Label_5) => {
													Field_Label_5($$anchor, {
														for: 'horizontal-slider',
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_16 = $.text('Volume');

															$.append($$anchor, text_16);
														},
														$$slots: { default: true }
													});
												});

												var node_38 = $.sibling(node_37, 2);

												$.component(node_38, () => Field.Description, ($$anchor, Field_Description_5) => {
													Field_Description_5($$anchor, {
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_17 = $.text('Adjust the volume level.');

															$.append($$anchor, text_17);
														},
														$$slots: { default: true }
													});
												});

												$.append($$anchor, fragment_21);
											},
											$$slots: { default: true }
										});
									});

									var node_39 = $.sibling(node_36, 2);

									Slider(node_39, { type: 'single', id: 'horizontal-slider', value: 50, max: 100 });
									$.append($$anchor, fragment_20);
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