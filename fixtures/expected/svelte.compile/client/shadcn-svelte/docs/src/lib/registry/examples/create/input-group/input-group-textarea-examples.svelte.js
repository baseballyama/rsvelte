import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as Field from "$lib/registry/ui/field/index.js";
import * as InputGroup from "$lib/registry/ui/input-group/index.js";
import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
import { Textarea } from "$lib/registry/ui/textarea/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!>`, 1);
var root_2 = $.from_html(`<!> <span class="sr-only">Send</span>`, 1);
var root_3 = $.from_html(`<!> script.js`, 1);
var root_4 = $.from_html(`<!> <!> <!> <!> <!> <!> <!> <!>`, 1);

export default function Input_group_textarea_examples($$anchor) {
	Example($$anchor, {
		title: 'Textarea',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = $.comment();
			var node = $.first_child(fragment_1);

			$.component(node, () => Field.Group, ($$anchor, Field_Group) => {
				Field_Group($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = root_4();
						var node_1 = $.first_child(fragment_2);

						$.component(node_1, () => Field.Field, ($$anchor, Field_Field) => {
							Field_Field($$anchor, {
								children: ($$anchor, $$slotProps) => {
									var fragment_3 = root();
									var node_2 = $.first_child(fragment_3);

									$.component(node_2, () => Field.Label, ($$anchor, Field_Label) => {
										Field_Label($$anchor, {
											for: 'textarea-header-footer-12',
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text = $.text('Default Textarea (No Input Group)');

												$.append($$anchor, text);
											},
											$$slots: { default: true }
										});
									});

									var node_3 = $.sibling(node_2, 2);

									Textarea(node_3, {
										id: 'textarea-header-footer-12',
										placeholder: 'Enter your text here...'
									});

									$.append($$anchor, fragment_3);
								},
								$$slots: { default: true }
							});
						});

						var node_4 = $.sibling(node_1, 2);

						$.component(node_4, () => Field.Field, ($$anchor, Field_Field_1) => {
							Field_Field_1($$anchor, {
								children: ($$anchor, $$slotProps) => {
									var fragment_4 = root_1();
									var node_5 = $.first_child(fragment_4);

									$.component(node_5, () => Field.Label, ($$anchor, Field_Label_1) => {
										Field_Label_1($$anchor, {
											for: 'textarea-header-footer-13',
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_1 = $.text('Input Group');

												$.append($$anchor, text_1);
											},
											$$slots: { default: true }
										});
									});

									var node_6 = $.sibling(node_5, 2);

									$.component(node_6, () => InputGroup.Root, ($$anchor, InputGroup_Root) => {
										InputGroup_Root($$anchor, {
											children: ($$anchor, $$slotProps) => {
												var fragment_5 = $.comment();
												var node_7 = $.first_child(fragment_5);

												$.component(node_7, () => InputGroup.Textarea, ($$anchor, InputGroup_Textarea) => {
													InputGroup_Textarea($$anchor, {
														id: 'textarea-header-footer-13',
														placeholder: 'Enter your text here...'
													});
												});

												$.append($$anchor, fragment_5);
											},
											$$slots: { default: true }
										});
									});

									var node_8 = $.sibling(node_6, 2);

									$.component(node_8, () => Field.Description, ($$anchor, Field_Description) => {
										Field_Description($$anchor, {
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_2 = $.text('This is a description of the input group.');

												$.append($$anchor, text_2);
											},
											$$slots: { default: true }
										});
									});

									$.append($$anchor, fragment_4);
								},
								$$slots: { default: true }
							});
						});

						var node_9 = $.sibling(node_4, 2);

						$.component(node_9, () => Field.Field, ($$anchor, Field_Field_2) => {
							Field_Field_2($$anchor, {
								'data-invalid': 'true',
								children: ($$anchor, $$slotProps) => {
									var fragment_6 = root_1();
									var node_10 = $.first_child(fragment_6);

									$.component(node_10, () => Field.Label, ($$anchor, Field_Label_2) => {
										Field_Label_2($$anchor, {
											for: 'textarea-header-footer-14',
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_3 = $.text('Invalid');

												$.append($$anchor, text_3);
											},
											$$slots: { default: true }
										});
									});

									var node_11 = $.sibling(node_10, 2);

									$.component(node_11, () => InputGroup.Root, ($$anchor, InputGroup_Root_1) => {
										InputGroup_Root_1($$anchor, {
											children: ($$anchor, $$slotProps) => {
												var fragment_7 = $.comment();
												var node_12 = $.first_child(fragment_7);

												$.component(node_12, () => InputGroup.Textarea, ($$anchor, InputGroup_Textarea_1) => {
													InputGroup_Textarea_1($$anchor, {
														id: 'textarea-header-footer-14',
														placeholder: 'Enter your text here...',
														'aria-invalid': 'true'
													});
												});

												$.append($$anchor, fragment_7);
											},
											$$slots: { default: true }
										});
									});

									var node_13 = $.sibling(node_11, 2);

									$.component(node_13, () => Field.Description, ($$anchor, Field_Description_1) => {
										Field_Description_1($$anchor, {
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_4 = $.text('This is a description of the input group.');

												$.append($$anchor, text_4);
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
								'data-disabled': 'true',
								children: ($$anchor, $$slotProps) => {
									var fragment_8 = root_1();
									var node_15 = $.first_child(fragment_8);

									$.component(node_15, () => Field.Label, ($$anchor, Field_Label_3) => {
										Field_Label_3($$anchor, {
											for: 'textarea-header-footer-15',
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_5 = $.text('Disabled');

												$.append($$anchor, text_5);
											},
											$$slots: { default: true }
										});
									});

									var node_16 = $.sibling(node_15, 2);

									$.component(node_16, () => InputGroup.Root, ($$anchor, InputGroup_Root_2) => {
										InputGroup_Root_2($$anchor, {
											children: ($$anchor, $$slotProps) => {
												var fragment_9 = $.comment();
												var node_17 = $.first_child(fragment_9);

												$.component(node_17, () => InputGroup.Textarea, ($$anchor, InputGroup_Textarea_2) => {
													InputGroup_Textarea_2($$anchor, {
														id: 'textarea-header-footer-15',
														placeholder: 'Enter your text here...',
														disabled: true
													});
												});

												$.append($$anchor, fragment_9);
											},
											$$slots: { default: true }
										});
									});

									var node_18 = $.sibling(node_16, 2);

									$.component(node_18, () => Field.Description, ($$anchor, Field_Description_2) => {
										Field_Description_2($$anchor, {
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_6 = $.text('This is a description of the input group.');

												$.append($$anchor, text_6);
											},
											$$slots: { default: true }
										});
									});

									$.append($$anchor, fragment_8);
								},
								$$slots: { default: true }
							});
						});

						var node_19 = $.sibling(node_14, 2);

						$.component(node_19, () => Field.Field, ($$anchor, Field_Field_4) => {
							Field_Field_4($$anchor, {
								children: ($$anchor, $$slotProps) => {
									var fragment_10 = root_1();
									var node_20 = $.first_child(fragment_10);

									$.component(node_20, () => Field.Label, ($$anchor, Field_Label_4) => {
										Field_Label_4($$anchor, {
											for: 'prompt-31',
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_7 = $.text('Addon (block-start)');

												$.append($$anchor, text_7);
											},
											$$slots: { default: true }
										});
									});

									var node_21 = $.sibling(node_20, 2);

									$.component(node_21, () => InputGroup.Root, ($$anchor, InputGroup_Root_3) => {
										InputGroup_Root_3($$anchor, {
											children: ($$anchor, $$slotProps) => {
												var fragment_11 = root();
												var node_22 = $.first_child(fragment_11);

												$.component(node_22, () => InputGroup.Textarea, ($$anchor, InputGroup_Textarea_3) => {
													InputGroup_Textarea_3($$anchor, { id: 'prompt-31' });
												});

												var node_23 = $.sibling(node_22, 2);

												$.component(node_23, () => InputGroup.Addon, ($$anchor, InputGroup_Addon) => {
													InputGroup_Addon($$anchor, {
														align: 'block-start',
														children: ($$anchor, $$slotProps) => {
															var fragment_12 = root();
															var node_24 = $.first_child(fragment_12);

															$.component(node_24, () => InputGroup.Text, ($$anchor, InputGroup_Text) => {
																InputGroup_Text($$anchor, {
																	children: ($$anchor, $$slotProps) => {
																		$.next();

																		var text_8 = $.text('Ask, Search or Chat...');

																		$.append($$anchor, text_8);
																	},
																	$$slots: { default: true }
																});
															});

															var node_25 = $.sibling(node_24, 2);

															IconPlaceholder(node_25, {
																lucide: 'InfoIcon',
																tabler: 'IconInfoCircle',
																hugeicons: 'AlertCircleIcon',
																phosphor: 'InfoIcon',
																remixicon: 'RiInformationLine',
																class: 'ml-auto text-muted-foreground'
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

									var node_26 = $.sibling(node_21, 2);

									$.component(node_26, () => Field.Description, ($$anchor, Field_Description_3) => {
										Field_Description_3($$anchor, {
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_9 = $.text('This is a description of the input group.');

												$.append($$anchor, text_9);
											},
											$$slots: { default: true }
										});
									});

									$.append($$anchor, fragment_10);
								},
								$$slots: { default: true }
							});
						});

						var node_27 = $.sibling(node_19, 2);

						$.component(node_27, () => Field.Field, ($$anchor, Field_Field_5) => {
							Field_Field_5($$anchor, {
								children: ($$anchor, $$slotProps) => {
									var fragment_13 = root();
									var node_28 = $.first_child(fragment_13);

									$.component(node_28, () => Field.Label, ($$anchor, Field_Label_5) => {
										Field_Label_5($$anchor, {
											for: 'textarea-header-footer-30',
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_10 = $.text('Addon (block-end)');

												$.append($$anchor, text_10);
											},
											$$slots: { default: true }
										});
									});

									var node_29 = $.sibling(node_28, 2);

									$.component(node_29, () => InputGroup.Root, ($$anchor, InputGroup_Root_4) => {
										InputGroup_Root_4($$anchor, {
											children: ($$anchor, $$slotProps) => {
												var fragment_14 = root();
												var node_30 = $.first_child(fragment_14);

												$.component(node_30, () => InputGroup.Textarea, ($$anchor, InputGroup_Textarea_4) => {
													InputGroup_Textarea_4($$anchor, {
														id: 'textarea-header-footer-30',
														placeholder: 'Enter your text here...'
													});
												});

												var node_31 = $.sibling(node_30, 2);

												$.component(node_31, () => InputGroup.Addon, ($$anchor, InputGroup_Addon_1) => {
													InputGroup_Addon_1($$anchor, {
														align: 'block-end',
														children: ($$anchor, $$slotProps) => {
															var fragment_15 = root();
															var node_32 = $.first_child(fragment_15);

															$.component(node_32, () => InputGroup.Text, ($$anchor, InputGroup_Text_1) => {
																InputGroup_Text_1($$anchor, {
																	children: ($$anchor, $$slotProps) => {
																		$.next();

																		var text_11 = $.text('0/280 characters');

																		$.append($$anchor, text_11);
																	},
																	$$slots: { default: true }
																});
															});

															var node_33 = $.sibling(node_32, 2);

															$.component(node_33, () => InputGroup.Button, ($$anchor, InputGroup_Button) => {
																InputGroup_Button($$anchor, {
																	variant: 'default',
																	size: 'icon-xs',
																	class: 'ml-auto rounded-full',
																	children: ($$anchor, $$slotProps) => {
																		var fragment_16 = root_2();
																		var node_34 = $.first_child(fragment_16);

																		IconPlaceholder(node_34, {
																			lucide: 'ArrowUpIcon',
																			tabler: 'IconArrowUp',
																			hugeicons: 'ArrowUpIcon',
																			phosphor: 'ArrowUpIcon',
																			remixicon: 'RiArrowUpLine'
																		});

																		$.next(2);
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

						var node_35 = $.sibling(node_27, 2);

						$.component(node_35, () => Field.Field, ($$anchor, Field_Field_6) => {
							Field_Field_6($$anchor, {
								children: ($$anchor, $$slotProps) => {
									var fragment_17 = root();
									var node_36 = $.first_child(fragment_17);

									$.component(node_36, () => Field.Label, ($$anchor, Field_Label_6) => {
										Field_Label_6($$anchor, {
											for: 'textarea-comment-31',
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_12 = $.text('Addon (Buttons)');

												$.append($$anchor, text_12);
											},
											$$slots: { default: true }
										});
									});

									var node_37 = $.sibling(node_36, 2);

									$.component(node_37, () => InputGroup.Root, ($$anchor, InputGroup_Root_5) => {
										InputGroup_Root_5($$anchor, {
											children: ($$anchor, $$slotProps) => {
												var fragment_18 = root();
												var node_38 = $.first_child(fragment_18);

												$.component(node_38, () => InputGroup.Textarea, ($$anchor, InputGroup_Textarea_5) => {
													InputGroup_Textarea_5($$anchor, {
														id: 'textarea-comment-31',
														placeholder: 'Share your thoughts...',
														class: 'min-h-[120px]'
													});
												});

												var node_39 = $.sibling(node_38, 2);

												$.component(node_39, () => InputGroup.Addon, ($$anchor, InputGroup_Addon_2) => {
													InputGroup_Addon_2($$anchor, {
														align: 'block-end',
														children: ($$anchor, $$slotProps) => {
															var fragment_19 = root();
															var node_40 = $.first_child(fragment_19);

															$.component(node_40, () => InputGroup.Button, ($$anchor, InputGroup_Button_1) => {
																InputGroup_Button_1($$anchor, {
																	variant: 'ghost',
																	class: 'ml-auto',
																	size: 'sm',
																	children: ($$anchor, $$slotProps) => {
																		$.next();

																		var text_13 = $.text('Cancel');

																		$.append($$anchor, text_13);
																	},
																	$$slots: { default: true }
																});
															});

															var node_41 = $.sibling(node_40, 2);

															$.component(node_41, () => InputGroup.Button, ($$anchor, InputGroup_Button_2) => {
																InputGroup_Button_2($$anchor, {
																	variant: 'default',
																	size: 'sm',
																	children: ($$anchor, $$slotProps) => {
																		$.next();

																		var text_14 = $.text('Post Comment');

																		$.append($$anchor, text_14);
																	},
																	$$slots: { default: true }
																});
															});

															$.append($$anchor, fragment_19);
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

						var node_42 = $.sibling(node_35, 2);

						$.component(node_42, () => Field.Field, ($$anchor, Field_Field_7) => {
							Field_Field_7($$anchor, {
								children: ($$anchor, $$slotProps) => {
									var fragment_20 = root();
									var node_43 = $.first_child(fragment_20);

									$.component(node_43, () => Field.Label, ($$anchor, Field_Label_7) => {
										Field_Label_7($$anchor, {
											for: 'textarea-code-32',
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_15 = $.text('Code Editor');

												$.append($$anchor, text_15);
											},
											$$slots: { default: true }
										});
									});

									var node_44 = $.sibling(node_43, 2);

									$.component(node_44, () => InputGroup.Root, ($$anchor, InputGroup_Root_6) => {
										InputGroup_Root_6($$anchor, {
											children: ($$anchor, $$slotProps) => {
												var fragment_21 = root_1();
												var node_45 = $.first_child(fragment_21);

												$.component(node_45, () => InputGroup.Textarea, ($$anchor, InputGroup_Textarea_6) => {
													InputGroup_Textarea_6($$anchor, {
														id: 'textarea-code-32',
														placeholder: 'console.log(\'Hello, world!\');',
														class: 'min-h-[300px] py-3'
													});
												});

												var node_46 = $.sibling(node_45, 2);

												$.component(node_46, () => InputGroup.Addon, ($$anchor, InputGroup_Addon_3) => {
													InputGroup_Addon_3($$anchor, {
														align: 'block-start',
														class: 'border-b',
														children: ($$anchor, $$slotProps) => {
															var fragment_22 = root_1();
															var node_47 = $.first_child(fragment_22);

															$.component(node_47, () => InputGroup.Text, ($$anchor, InputGroup_Text_2) => {
																InputGroup_Text_2($$anchor, {
																	class: 'font-mono font-medium',
																	children: ($$anchor, $$slotProps) => {
																		var fragment_23 = root_3();
																		var node_48 = $.first_child(fragment_23);

																		IconPlaceholder(node_48, {
																			lucide: 'CodeIcon',
																			tabler: 'IconBrandJavascript',
																			hugeicons: 'CodeIcon',
																			phosphor: 'CodeIcon',
																			remixicon: 'RiCodeLine'
																		});

																		$.next();
																		$.append($$anchor, fragment_23);
																	},
																	$$slots: { default: true }
																});
															});

															var node_49 = $.sibling(node_47, 2);

															$.component(node_49, () => InputGroup.Button, ($$anchor, InputGroup_Button_3) => {
																InputGroup_Button_3($$anchor, {
																	size: 'icon-xs',
																	class: 'ml-auto',
																	children: ($$anchor, $$slotProps) => {
																		IconPlaceholder($$anchor, {
																			lucide: 'RefreshCwIcon',
																			tabler: 'IconRefresh',
																			hugeicons: 'RefreshIcon',
																			phosphor: 'ArrowClockwiseIcon',
																			remixicon: 'RiRefreshLine'
																		});
																	},
																	$$slots: { default: true }
																});
															});

															var node_50 = $.sibling(node_49, 2);

															$.component(node_50, () => InputGroup.Button, ($$anchor, InputGroup_Button_4) => {
																InputGroup_Button_4($$anchor, {
																	size: 'icon-xs',
																	variant: 'ghost',
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

															$.append($$anchor, fragment_22);
														},
														$$slots: { default: true }
													});
												});

												var node_51 = $.sibling(node_46, 2);

												$.component(node_51, () => InputGroup.Addon, ($$anchor, InputGroup_Addon_4) => {
													InputGroup_Addon_4($$anchor, {
														align: 'block-end',
														class: 'border-t',
														children: ($$anchor, $$slotProps) => {
															var fragment_26 = root();
															var node_52 = $.first_child(fragment_26);

															$.component(node_52, () => InputGroup.Text, ($$anchor, InputGroup_Text_3) => {
																InputGroup_Text_3($$anchor, {
																	children: ($$anchor, $$slotProps) => {
																		$.next();

																		var text_16 = $.text('Line 1, Column 1');

																		$.append($$anchor, text_16);
																	},
																	$$slots: { default: true }
																});
															});

															var node_53 = $.sibling(node_52, 2);

															$.component(node_53, () => InputGroup.Text, ($$anchor, InputGroup_Text_4) => {
																InputGroup_Text_4($$anchor, {
																	class: 'ml-auto',
																	children: ($$anchor, $$slotProps) => {
																		$.next();

																		var text_17 = $.text('JavaScript');

																		$.append($$anchor, text_17);
																	},
																	$$slots: { default: true }
																});
															});

															$.append($$anchor, fragment_26);
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