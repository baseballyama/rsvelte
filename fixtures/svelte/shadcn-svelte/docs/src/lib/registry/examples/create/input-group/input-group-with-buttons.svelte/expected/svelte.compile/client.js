import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as Field from "$lib/registry/ui/field/index.js";
import * as InputGroup from "$lib/registry/ui/input-group/index.js";
import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!> <!> <!> <!> <!>`, 1);

export default function Input_group_with_buttons($$anchor) {
	Example($$anchor, {
		title: 'With Buttons',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = $.comment();
			var node = $.first_child(fragment_1);

			$.component(node, () => Field.Group, ($$anchor, Field_Group) => {
				Field_Group($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = $.comment();
						var node_1 = $.first_child(fragment_2);

						$.component(node_1, () => Field.Field, ($$anchor, Field_Field) => {
							Field_Field($$anchor, {
								children: ($$anchor, $$slotProps) => {
									var fragment_3 = root_1();
									var node_2 = $.first_child(fragment_3);

									$.component(node_2, () => Field.Label, ($$anchor, Field_Label) => {
										Field_Label($$anchor, {
											for: 'input-button-13',
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text = $.text('Button');

												$.append($$anchor, text);
											},
											$$slots: { default: true }
										});
									});

									var node_3 = $.sibling(node_2, 2);

									$.component(node_3, () => InputGroup.Root, ($$anchor, InputGroup_Root) => {
										InputGroup_Root($$anchor, {
											children: ($$anchor, $$slotProps) => {
												var fragment_4 = root();
												var node_4 = $.first_child(fragment_4);

												$.component(node_4, () => InputGroup.Input, ($$anchor, InputGroup_Input) => {
													InputGroup_Input($$anchor, { id: 'input-button-13' });
												});

												var node_5 = $.sibling(node_4, 2);

												$.component(node_5, () => InputGroup.Addon, ($$anchor, InputGroup_Addon) => {
													InputGroup_Addon($$anchor, {
														children: ($$anchor, $$slotProps) => {
															var fragment_5 = $.comment();
															var node_6 = $.first_child(fragment_5);

															$.component(node_6, () => InputGroup.Button, ($$anchor, InputGroup_Button) => {
																InputGroup_Button($$anchor, {
																	children: ($$anchor, $$slotProps) => {
																		$.next();

																		var text_1 = $.text('Default');

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

												$.append($$anchor, fragment_4);
											},
											$$slots: { default: true }
										});
									});

									var node_7 = $.sibling(node_3, 2);

									$.component(node_7, () => InputGroup.Root, ($$anchor, InputGroup_Root_1) => {
										InputGroup_Root_1($$anchor, {
											children: ($$anchor, $$slotProps) => {
												var fragment_6 = root();
												var node_8 = $.first_child(fragment_6);

												$.component(node_8, () => InputGroup.Input, ($$anchor, InputGroup_Input_1) => {
													InputGroup_Input_1($$anchor, { id: 'input-button-14' });
												});

												var node_9 = $.sibling(node_8, 2);

												$.component(node_9, () => InputGroup.Addon, ($$anchor, InputGroup_Addon_1) => {
													InputGroup_Addon_1($$anchor, {
														children: ($$anchor, $$slotProps) => {
															var fragment_7 = $.comment();
															var node_10 = $.first_child(fragment_7);

															$.component(node_10, () => InputGroup.Button, ($$anchor, InputGroup_Button_1) => {
																InputGroup_Button_1($$anchor, {
																	variant: 'outline',
																	children: ($$anchor, $$slotProps) => {
																		$.next();

																		var text_2 = $.text('Outline');

																		$.append($$anchor, text_2);
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

									var node_11 = $.sibling(node_7, 2);

									$.component(node_11, () => InputGroup.Root, ($$anchor, InputGroup_Root_2) => {
										InputGroup_Root_2($$anchor, {
											children: ($$anchor, $$slotProps) => {
												var fragment_8 = root();
												var node_12 = $.first_child(fragment_8);

												$.component(node_12, () => InputGroup.Input, ($$anchor, InputGroup_Input_2) => {
													InputGroup_Input_2($$anchor, { id: 'input-button-15' });
												});

												var node_13 = $.sibling(node_12, 2);

												$.component(node_13, () => InputGroup.Addon, ($$anchor, InputGroup_Addon_2) => {
													InputGroup_Addon_2($$anchor, {
														children: ($$anchor, $$slotProps) => {
															var fragment_9 = $.comment();
															var node_14 = $.first_child(fragment_9);

															$.component(node_14, () => InputGroup.Button, ($$anchor, InputGroup_Button_2) => {
																InputGroup_Button_2($$anchor, {
																	variant: 'secondary',
																	children: ($$anchor, $$slotProps) => {
																		$.next();

																		var text_3 = $.text('Secondary');

																		$.append($$anchor, text_3);
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

									var node_15 = $.sibling(node_11, 2);

									$.component(node_15, () => InputGroup.Root, ($$anchor, InputGroup_Root_3) => {
										InputGroup_Root_3($$anchor, {
											children: ($$anchor, $$slotProps) => {
												var fragment_10 = root();
												var node_16 = $.first_child(fragment_10);

												$.component(node_16, () => InputGroup.Input, ($$anchor, InputGroup_Input_3) => {
													InputGroup_Input_3($$anchor, { id: 'input-button-16' });
												});

												var node_17 = $.sibling(node_16, 2);

												$.component(node_17, () => InputGroup.Addon, ($$anchor, InputGroup_Addon_3) => {
													InputGroup_Addon_3($$anchor, {
														align: 'inline-end',
														children: ($$anchor, $$slotProps) => {
															var fragment_11 = $.comment();
															var node_18 = $.first_child(fragment_11);

															$.component(node_18, () => InputGroup.Button, ($$anchor, InputGroup_Button_3) => {
																InputGroup_Button_3($$anchor, {
																	variant: 'secondary',
																	children: ($$anchor, $$slotProps) => {
																		$.next();

																		var text_4 = $.text('Button');

																		$.append($$anchor, text_4);
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

									var node_19 = $.sibling(node_15, 2);

									$.component(node_19, () => InputGroup.Root, ($$anchor, InputGroup_Root_4) => {
										InputGroup_Root_4($$anchor, {
											children: ($$anchor, $$slotProps) => {
												var fragment_12 = root();
												var node_20 = $.first_child(fragment_12);

												$.component(node_20, () => InputGroup.Input, ($$anchor, InputGroup_Input_4) => {
													InputGroup_Input_4($$anchor, { id: 'input-button-17' });
												});

												var node_21 = $.sibling(node_20, 2);

												$.component(node_21, () => InputGroup.Addon, ($$anchor, InputGroup_Addon_4) => {
													InputGroup_Addon_4($$anchor, {
														align: 'inline-end',
														children: ($$anchor, $$slotProps) => {
															var fragment_13 = $.comment();
															var node_22 = $.first_child(fragment_13);

															$.component(node_22, () => InputGroup.Button, ($$anchor, InputGroup_Button_4) => {
																InputGroup_Button_4($$anchor, {
																	size: 'icon-xs',
																	children: ($$anchor, $$slotProps) => {
																		IconPlaceholder($$anchor, {
																			lucide: 'CopyIcon',
																			tabler: 'IconCopy',
																			hugeicons: 'CopyIcon',
																			phosphor: 'CopyIcon',
																			remixicon: 'RiFileCopyLine'
																		});
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

									var node_23 = $.sibling(node_19, 2);

									$.component(node_23, () => InputGroup.Root, ($$anchor, InputGroup_Root_5) => {
										InputGroup_Root_5($$anchor, {
											children: ($$anchor, $$slotProps) => {
												var fragment_15 = root();
												var node_24 = $.first_child(fragment_15);

												$.component(node_24, () => InputGroup.Input, ($$anchor, InputGroup_Input_5) => {
													InputGroup_Input_5($$anchor, { id: 'input-button-18' });
												});

												var node_25 = $.sibling(node_24, 2);

												$.component(node_25, () => InputGroup.Addon, ($$anchor, InputGroup_Addon_5) => {
													InputGroup_Addon_5($$anchor, {
														align: 'inline-end',
														children: ($$anchor, $$slotProps) => {
															var fragment_16 = $.comment();
															var node_26 = $.first_child(fragment_16);

															$.component(node_26, () => InputGroup.Button, ($$anchor, InputGroup_Button_5) => {
																InputGroup_Button_5($$anchor, {
																	variant: 'secondary',
																	size: 'icon-xs',
																	children: ($$anchor, $$slotProps) => {
																		IconPlaceholder($$anchor, {
																			lucide: 'TrashIcon',
																			tabler: 'IconTrash',
																			hugeicons: 'DeleteIcon',
																			phosphor: 'TrashIcon',
																			remixicon: 'RiDeleteBinLine'
																		});
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

									$.append($$anchor, fragment_3);
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