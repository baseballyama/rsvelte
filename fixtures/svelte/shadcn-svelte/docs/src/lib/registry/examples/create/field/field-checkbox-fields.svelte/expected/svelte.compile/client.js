import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as Field from "$lib/registry/ui/field/index.js";
import { Checkbox } from "$lib/registry/ui/checkbox/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!>`, 1);
var root_2 = $.from_html(`<!> <!> <!> <!> <!> <!> <!>`, 1);

export default function Field_checkbox_fields($$anchor) {
	Example($$anchor, {
		title: 'Checkbox Fields',
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
								orientation: 'horizontal',
								children: ($$anchor, $$slotProps) => {
									var fragment_3 = root();
									var node_2 = $.first_child(fragment_3);

									Checkbox(node_2, { id: 'checkbox-basic', checked: true });

									var node_3 = $.sibling(node_2, 2);

									$.component(node_3, () => Field.Label, ($$anchor, Field_Label) => {
										Field_Label($$anchor, {
											for: 'checkbox-basic',
											class: 'font-normal',
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text = $.text('I agree to the terms and conditions');

												$.append($$anchor, text);
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

						$.component(node_4, () => Field.Field, ($$anchor, Field_Field_1) => {
							Field_Field_1($$anchor, {
								orientation: 'horizontal',
								children: ($$anchor, $$slotProps) => {
									var fragment_4 = root();
									var node_5 = $.first_child(fragment_4);

									$.component(node_5, () => Field.Label, ($$anchor, Field_Label_1) => {
										Field_Label_1($$anchor, {
											for: 'checkbox-right',
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_1 = $.text('Accept terms and conditions');

												$.append($$anchor, text_1);
											},
											$$slots: { default: true }
										});
									});

									var node_6 = $.sibling(node_5, 2);

									Checkbox(node_6, { id: 'checkbox-right' });
									$.append($$anchor, fragment_4);
								},
								$$slots: { default: true }
							});
						});

						var node_7 = $.sibling(node_4, 2);

						$.component(node_7, () => Field.Field, ($$anchor, Field_Field_2) => {
							Field_Field_2($$anchor, {
								orientation: 'horizontal',
								children: ($$anchor, $$slotProps) => {
									var fragment_5 = root();
									var node_8 = $.first_child(fragment_5);

									Checkbox(node_8, { id: 'checkbox-with-desc' });

									var node_9 = $.sibling(node_8, 2);

									$.component(node_9, () => Field.Content, ($$anchor, Field_Content) => {
										Field_Content($$anchor, {
											children: ($$anchor, $$slotProps) => {
												var fragment_6 = root();
												var node_10 = $.first_child(fragment_6);

												$.component(node_10, () => Field.Label, ($$anchor, Field_Label_2) => {
													Field_Label_2($$anchor, {
														for: 'checkbox-with-desc',
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_2 = $.text('Subscribe to newsletter');

															$.append($$anchor, text_2);
														},
														$$slots: { default: true }
													});
												});

												var node_11 = $.sibling(node_10, 2);

												$.component(node_11, () => Field.Description, ($$anchor, Field_Description) => {
													Field_Description($$anchor, {
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_3 = $.text('Receive weekly updates about new features and promotions.');

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

									$.append($$anchor, fragment_5);
								},
								$$slots: { default: true }
							});
						});

						var node_12 = $.sibling(node_7, 2);

						$.component(node_12, () => Field.Label, ($$anchor, Field_Label_3) => {
							Field_Label_3($$anchor, {
								for: 'checkbox-with-title',
								children: ($$anchor, $$slotProps) => {
									var fragment_7 = $.comment();
									var node_13 = $.first_child(fragment_7);

									$.component(node_13, () => Field.Field, ($$anchor, Field_Field_3) => {
										Field_Field_3($$anchor, {
											orientation: 'horizontal',
											children: ($$anchor, $$slotProps) => {
												var fragment_8 = root();
												var node_14 = $.first_child(fragment_8);

												Checkbox(node_14, { id: 'checkbox-with-title' });

												var node_15 = $.sibling(node_14, 2);

												$.component(node_15, () => Field.Content, ($$anchor, Field_Content_1) => {
													Field_Content_1($$anchor, {
														children: ($$anchor, $$slotProps) => {
															var fragment_9 = root();
															var node_16 = $.first_child(fragment_9);

															$.component(node_16, () => Field.Title, ($$anchor, Field_Title) => {
																Field_Title($$anchor, {
																	children: ($$anchor, $$slotProps) => {
																		$.next();

																		var text_4 = $.text('Enable Touch ID');

																		$.append($$anchor, text_4);
																	},
																	$$slots: { default: true }
																});
															});

															var node_17 = $.sibling(node_16, 2);

															$.component(node_17, () => Field.Description, ($$anchor, Field_Description_1) => {
																Field_Description_1($$anchor, {
																	children: ($$anchor, $$slotProps) => {
																		$.next();

																		var text_5 = $.text('Enable Touch ID to quickly unlock your device.');

																		$.append($$anchor, text_5);
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

									$.append($$anchor, fragment_7);
								},
								$$slots: { default: true }
							});
						});

						var node_18 = $.sibling(node_12, 2);

						$.component(node_18, () => Field.Set, ($$anchor, Field_Set) => {
							Field_Set($$anchor, {
								children: ($$anchor, $$slotProps) => {
									var fragment_10 = root_1();
									var node_19 = $.first_child(fragment_10);

									$.component(node_19, () => Field.Legend, ($$anchor, Field_Legend) => {
										Field_Legend($$anchor, {
											variant: 'label',
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_6 = $.text('Preferences');

												$.append($$anchor, text_6);
											},
											$$slots: { default: true }
										});
									});

									var node_20 = $.sibling(node_19, 2);

									$.component(node_20, () => Field.Description, ($$anchor, Field_Description_2) => {
										Field_Description_2($$anchor, {
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_7 = $.text('Select all that apply to customize your experience.');

												$.append($$anchor, text_7);
											},
											$$slots: { default: true }
										});
									});

									var node_21 = $.sibling(node_20, 2);

									$.component(node_21, () => Field.Group, ($$anchor, Field_Group_1) => {
										Field_Group_1($$anchor, {
											class: 'gap-3',
											children: ($$anchor, $$slotProps) => {
												var fragment_11 = root_1();
												var node_22 = $.first_child(fragment_11);

												$.component(node_22, () => Field.Field, ($$anchor, Field_Field_4) => {
													Field_Field_4($$anchor, {
														orientation: 'horizontal',
														children: ($$anchor, $$slotProps) => {
															var fragment_12 = root();
															var node_23 = $.first_child(fragment_12);

															Checkbox(node_23, { id: 'pref-dark' });

															var node_24 = $.sibling(node_23, 2);

															$.component(node_24, () => Field.Label, ($$anchor, Field_Label_4) => {
																Field_Label_4($$anchor, {
																	for: 'pref-dark',
																	class: 'font-normal',
																	children: ($$anchor, $$slotProps) => {
																		$.next();

																		var text_8 = $.text('Dark mode');

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

												var node_25 = $.sibling(node_22, 2);

												$.component(node_25, () => Field.Field, ($$anchor, Field_Field_5) => {
													Field_Field_5($$anchor, {
														orientation: 'horizontal',
														children: ($$anchor, $$slotProps) => {
															var fragment_13 = root();
															var node_26 = $.first_child(fragment_13);

															Checkbox(node_26, { id: 'pref-compact' });

															var node_27 = $.sibling(node_26, 2);

															$.component(node_27, () => Field.Label, ($$anchor, Field_Label_5) => {
																Field_Label_5($$anchor, {
																	for: 'pref-compact',
																	class: 'font-normal',
																	children: ($$anchor, $$slotProps) => {
																		$.next();

																		var text_9 = $.text('Compact view');

																		$.append($$anchor, text_9);
																	},
																	$$slots: { default: true }
																});
															});

															$.append($$anchor, fragment_13);
														},
														$$slots: { default: true }
													});
												});

												var node_28 = $.sibling(node_25, 2);

												$.component(node_28, () => Field.Field, ($$anchor, Field_Field_6) => {
													Field_Field_6($$anchor, {
														orientation: 'horizontal',
														children: ($$anchor, $$slotProps) => {
															var fragment_14 = root();
															var node_29 = $.first_child(fragment_14);

															Checkbox(node_29, { id: 'pref-notifications' });

															var node_30 = $.sibling(node_29, 2);

															$.component(node_30, () => Field.Label, ($$anchor, Field_Label_6) => {
																Field_Label_6($$anchor, {
																	for: 'pref-notifications',
																	class: 'font-normal',
																	children: ($$anchor, $$slotProps) => {
																		$.next();

																		var text_10 = $.text('Enable notifications');

																		$.append($$anchor, text_10);
																	},
																	$$slots: { default: true }
																});
															});

															$.append($$anchor, fragment_14);
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

						var node_31 = $.sibling(node_18, 2);

						$.component(node_31, () => Field.Field, ($$anchor, Field_Field_7) => {
							Field_Field_7($$anchor, {
								'data-invalid': true,
								orientation: 'horizontal',
								children: ($$anchor, $$slotProps) => {
									var fragment_15 = root();
									var node_32 = $.first_child(fragment_15);

									Checkbox(node_32, { id: 'checkbox-invalid', 'aria-invalid': true });

									var node_33 = $.sibling(node_32, 2);

									$.component(node_33, () => Field.Label, ($$anchor, Field_Label_7) => {
										Field_Label_7($$anchor, {
											for: 'checkbox-invalid',
											class: 'font-normal',
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_11 = $.text('Invalid checkbox');

												$.append($$anchor, text_11);
											},
											$$slots: { default: true }
										});
									});

									$.append($$anchor, fragment_15);
								},
								$$slots: { default: true }
							});
						});

						var node_34 = $.sibling(node_31, 2);

						$.component(node_34, () => Field.Field, ($$anchor, Field_Field_8) => {
							Field_Field_8($$anchor, {
								'data-disabled': true,
								orientation: 'horizontal',
								children: ($$anchor, $$slotProps) => {
									var fragment_16 = root();
									var node_35 = $.first_child(fragment_16);

									Checkbox(node_35, { id: 'checkbox-disabled-field', disabled: true });

									var node_36 = $.sibling(node_35, 2);

									$.component(node_36, () => Field.Label, ($$anchor, Field_Label_8) => {
										Field_Label_8($$anchor, {
											for: 'checkbox-disabled-field',
											class: 'font-normal',
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_12 = $.text('Disabled checkbox');

												$.append($$anchor, text_12);
											},
											$$slots: { default: true }
										});
									});

									$.append($$anchor, fragment_16);
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