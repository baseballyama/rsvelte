import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as Field from "$lib/registry/ui/field/index.js";
import { Switch } from "$lib/registry/ui/switch/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!> <!>`, 1);
var root_2 = $.from_html(`<!> <!> <!> <!> <!> <!>`, 1);

export default function Field_switch_fields($$anchor) {
	Example($$anchor, {
		title: 'Switch Fields',
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

									$.component(node_2, () => Field.Content, ($$anchor, Field_Content) => {
										Field_Content($$anchor, {
											children: ($$anchor, $$slotProps) => {
												var fragment_4 = root();
												var node_3 = $.first_child(fragment_4);

												$.component(node_3, () => Field.Label, ($$anchor, Field_Label) => {
													Field_Label($$anchor, {
														for: 'switch-airplane',
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text = $.text('Airplane Mode');

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

															var text_1 = $.text('Turn on airplane mode to disable all connections.');

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

									Switch(node_5, { id: 'switch-airplane' });
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

									$.component(node_7, () => Field.Label, ($$anchor, Field_Label_1) => {
										Field_Label_1($$anchor, {
											for: 'switch-dark',
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_2 = $.text('Dark Mode');

												$.append($$anchor, text_2);
											},
											$$slots: { default: true }
										});
									});

									var node_8 = $.sibling(node_7, 2);

									Switch(node_8, { id: 'switch-dark' });
									$.append($$anchor, fragment_5);
								},
								$$slots: { default: true }
							});
						});

						var node_9 = $.sibling(node_6, 2);

						$.component(node_9, () => Field.Field, ($$anchor, Field_Field_2) => {
							Field_Field_2($$anchor, {
								orientation: 'horizontal',
								children: ($$anchor, $$slotProps) => {
									var fragment_6 = root();
									var node_10 = $.first_child(fragment_6);

									Switch(node_10, { id: 'switch-marketing' });

									var node_11 = $.sibling(node_10, 2);

									$.component(node_11, () => Field.Content, ($$anchor, Field_Content_1) => {
										Field_Content_1($$anchor, {
											children: ($$anchor, $$slotProps) => {
												var fragment_7 = root();
												var node_12 = $.first_child(fragment_7);

												$.component(node_12, () => Field.Label, ($$anchor, Field_Label_2) => {
													Field_Label_2($$anchor, {
														for: 'switch-marketing',
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_3 = $.text('Marketing Emails');

															$.append($$anchor, text_3);
														},
														$$slots: { default: true }
													});
												});

												var node_13 = $.sibling(node_12, 2);

												$.component(node_13, () => Field.Description, ($$anchor, Field_Description_1) => {
													Field_Description_1($$anchor, {
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_4 = $.text('Receive emails about new products, features, and more.');

															$.append($$anchor, text_4);
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

						var node_14 = $.sibling(node_9, 2);

						$.component(node_14, () => Field.Field, ($$anchor, Field_Field_3) => {
							Field_Field_3($$anchor, {
								children: ($$anchor, $$slotProps) => {
									var fragment_8 = root_1();
									var node_15 = $.first_child(fragment_8);

									$.component(node_15, () => Field.Label, ($$anchor, Field_Label_3) => {
										Field_Label_3($$anchor, {
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_5 = $.text('Privacy Settings');

												$.append($$anchor, text_5);
											},
											$$slots: { default: true }
										});
									});

									var node_16 = $.sibling(node_15, 2);

									$.component(node_16, () => Field.Description, ($$anchor, Field_Description_2) => {
										Field_Description_2($$anchor, {
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_6 = $.text('Manage your privacy preferences.');

												$.append($$anchor, text_6);
											},
											$$slots: { default: true }
										});
									});

									var node_17 = $.sibling(node_16, 2);

									$.component(node_17, () => Field.Field, ($$anchor, Field_Field_4) => {
										Field_Field_4($$anchor, {
											orientation: 'horizontal',
											children: ($$anchor, $$slotProps) => {
												var fragment_9 = root();
												var node_18 = $.first_child(fragment_9);

												Switch(node_18, { id: 'switch-profile', checked: true });

												var node_19 = $.sibling(node_18, 2);

												$.component(node_19, () => Field.Content, ($$anchor, Field_Content_2) => {
													Field_Content_2($$anchor, {
														children: ($$anchor, $$slotProps) => {
															var fragment_10 = $.comment();
															var node_20 = $.first_child(fragment_10);

															$.component(node_20, () => Field.Label, ($$anchor, Field_Label_4) => {
																Field_Label_4($$anchor, {
																	for: 'switch-profile',
																	class: 'font-normal',
																	children: ($$anchor, $$slotProps) => {
																		$.next();

																		var text_7 = $.text('Make profile visible to others');

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

												$.append($$anchor, fragment_9);
											},
											$$slots: { default: true }
										});
									});

									var node_21 = $.sibling(node_17, 2);

									$.component(node_21, () => Field.Field, ($$anchor, Field_Field_5) => {
										Field_Field_5($$anchor, {
											orientation: 'horizontal',
											children: ($$anchor, $$slotProps) => {
												var fragment_11 = root();
												var node_22 = $.first_child(fragment_11);

												Switch(node_22, { id: 'switch-email' });

												var node_23 = $.sibling(node_22, 2);

												$.component(node_23, () => Field.Content, ($$anchor, Field_Content_3) => {
													Field_Content_3($$anchor, {
														children: ($$anchor, $$slotProps) => {
															var fragment_12 = $.comment();
															var node_24 = $.first_child(fragment_12);

															$.component(node_24, () => Field.Label, ($$anchor, Field_Label_5) => {
																Field_Label_5($$anchor, {
																	for: 'switch-email',
																	class: 'font-normal',
																	children: ($$anchor, $$slotProps) => {
																		$.next();

																		var text_8 = $.text('Show email on profile');

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

												$.append($$anchor, fragment_11);
											},
											$$slots: { default: true }
										});
									});

									$.append($$anchor, fragment_8);
								},
								$$slots: { default: true }
							});
						});

						var node_25 = $.sibling(node_14, 2);

						$.component(node_25, () => Field.Field, ($$anchor, Field_Field_6) => {
							Field_Field_6($$anchor, {
								'data-invalid': true,
								orientation: 'horizontal',
								children: ($$anchor, $$slotProps) => {
									var fragment_13 = root();
									var node_26 = $.first_child(fragment_13);

									$.component(node_26, () => Field.Content, ($$anchor, Field_Content_4) => {
										Field_Content_4($$anchor, {
											children: ($$anchor, $$slotProps) => {
												var fragment_14 = root();
												var node_27 = $.first_child(fragment_14);

												$.component(node_27, () => Field.Label, ($$anchor, Field_Label_6) => {
													Field_Label_6($$anchor, {
														for: 'switch-invalid',
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_9 = $.text('Invalid Switch');

															$.append($$anchor, text_9);
														},
														$$slots: { default: true }
													});
												});

												var node_28 = $.sibling(node_27, 2);

												$.component(node_28, () => Field.Description, ($$anchor, Field_Description_3) => {
													Field_Description_3($$anchor, {
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_10 = $.text('This switch has validation errors.');

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

									var node_29 = $.sibling(node_26, 2);

									Switch(node_29, { id: 'switch-invalid', 'aria-invalid': true });
									$.append($$anchor, fragment_13);
								},
								$$slots: { default: true }
							});
						});

						var node_30 = $.sibling(node_25, 2);

						$.component(node_30, () => Field.Field, ($$anchor, Field_Field_7) => {
							Field_Field_7($$anchor, {
								'data-disabled': true,
								orientation: 'horizontal',
								children: ($$anchor, $$slotProps) => {
									var fragment_15 = root();
									var node_31 = $.first_child(fragment_15);

									$.component(node_31, () => Field.Content, ($$anchor, Field_Content_5) => {
										Field_Content_5($$anchor, {
											children: ($$anchor, $$slotProps) => {
												var fragment_16 = root();
												var node_32 = $.first_child(fragment_16);

												$.component(node_32, () => Field.Label, ($$anchor, Field_Label_7) => {
													Field_Label_7($$anchor, {
														for: 'switch-disabled-field',
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_11 = $.text('Disabled Switch');

															$.append($$anchor, text_11);
														},
														$$slots: { default: true }
													});
												});

												var node_33 = $.sibling(node_32, 2);

												$.component(node_33, () => Field.Description, ($$anchor, Field_Description_4) => {
													Field_Description_4($$anchor, {
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_12 = $.text('This switch is currently disabled.');

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

									var node_34 = $.sibling(node_31, 2);

									Switch(node_34, { id: 'switch-disabled-field', disabled: true });
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