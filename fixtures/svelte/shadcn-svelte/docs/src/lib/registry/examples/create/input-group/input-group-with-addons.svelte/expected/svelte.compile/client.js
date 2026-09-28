import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as Field from "$lib/registry/ui/field/index.js";
import * as InputGroup from "$lib/registry/ui/input-group/index.js";
import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!>`, 1);
var root_2 = $.from_html(`<!> <!> <!> <!> <!> <!> <!> <!>`, 1);

export default function Input_group_with_addons($$anchor) {
	Example($$anchor, {
		title: 'With Addons',
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
											for: 'input-icon-left-05',
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text = $.text('Addon (inline-start)');

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
													InputGroup_Input($$anchor, { id: 'input-icon-left-05' });
												});

												var node_5 = $.sibling(node_4, 2);

												$.component(node_5, () => InputGroup.Addon, ($$anchor, InputGroup_Addon) => {
													InputGroup_Addon($$anchor, {
														children: ($$anchor, $$slotProps) => {
															IconPlaceholder($$anchor, {
																lucide: 'SearchIcon',
																tabler: 'IconSearch',
																hugeicons: 'SearchIcon',
																phosphor: 'MagnifyingGlassIcon',
																remixicon: 'RiSearchLine',
																class: 'text-muted-foreground'
															});
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

						var node_6 = $.sibling(node_1, 2);

						$.component(node_6, () => Field.Field, ($$anchor, Field_Field_1) => {
							Field_Field_1($$anchor, {
								children: ($$anchor, $$slotProps) => {
									var fragment_6 = root();
									var node_7 = $.first_child(fragment_6);

									$.component(node_7, () => Field.Label, ($$anchor, Field_Label_1) => {
										Field_Label_1($$anchor, {
											for: 'input-icon-right-07',
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_1 = $.text('Addon (inline-end)');

												$.append($$anchor, text_1);
											},
											$$slots: { default: true }
										});
									});

									var node_8 = $.sibling(node_7, 2);

									$.component(node_8, () => InputGroup.Root, ($$anchor, InputGroup_Root_1) => {
										InputGroup_Root_1($$anchor, {
											children: ($$anchor, $$slotProps) => {
												var fragment_7 = root();
												var node_9 = $.first_child(fragment_7);

												$.component(node_9, () => InputGroup.Input, ($$anchor, InputGroup_Input_1) => {
													InputGroup_Input_1($$anchor, { id: 'input-icon-right-07' });
												});

												var node_10 = $.sibling(node_9, 2);

												$.component(node_10, () => InputGroup.Addon, ($$anchor, InputGroup_Addon_1) => {
													InputGroup_Addon_1($$anchor, {
														align: 'inline-end',
														children: ($$anchor, $$slotProps) => {
															IconPlaceholder($$anchor, {
																lucide: 'EyeOffIcon',
																tabler: 'IconEyeClosed',
																hugeicons: 'ViewOffIcon',
																phosphor: 'EyeSlashIcon',
																remixicon: 'RiEyeOffLine'
															});
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

						var node_11 = $.sibling(node_6, 2);

						$.component(node_11, () => Field.Field, ($$anchor, Field_Field_2) => {
							Field_Field_2($$anchor, {
								children: ($$anchor, $$slotProps) => {
									var fragment_9 = root();
									var node_12 = $.first_child(fragment_9);

									$.component(node_12, () => Field.Label, ($$anchor, Field_Label_2) => {
										Field_Label_2($$anchor, {
											for: 'input-icon-both-09',
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_2 = $.text('Addon (inline-start and inline-end)');

												$.append($$anchor, text_2);
											},
											$$slots: { default: true }
										});
									});

									var node_13 = $.sibling(node_12, 2);

									$.component(node_13, () => InputGroup.Root, ($$anchor, InputGroup_Root_2) => {
										InputGroup_Root_2($$anchor, {
											children: ($$anchor, $$slotProps) => {
												var fragment_10 = root_1();
												var node_14 = $.first_child(fragment_10);

												$.component(node_14, () => InputGroup.Input, ($$anchor, InputGroup_Input_2) => {
													InputGroup_Input_2($$anchor, { id: 'input-icon-both-09' });
												});

												var node_15 = $.sibling(node_14, 2);

												$.component(node_15, () => InputGroup.Addon, ($$anchor, InputGroup_Addon_2) => {
													InputGroup_Addon_2($$anchor, {
														children: ($$anchor, $$slotProps) => {
															IconPlaceholder($$anchor, {
																lucide: 'MicIcon',
																tabler: 'IconMicrophone',
																hugeicons: 'VoiceIcon',
																phosphor: 'MicrophoneIcon',
																remixicon: 'RiMicLine',
																class: 'text-muted-foreground'
															});
														},
														$$slots: { default: true }
													});
												});

												var node_16 = $.sibling(node_15, 2);

												$.component(node_16, () => InputGroup.Addon, ($$anchor, InputGroup_Addon_3) => {
													InputGroup_Addon_3($$anchor, {
														align: 'inline-end',
														children: ($$anchor, $$slotProps) => {
															IconPlaceholder($$anchor, {
																lucide: 'RadioIcon',
																tabler: 'IconPlayerRecordFilled',
																hugeicons: 'RecordIcon',
																phosphor: 'RecordIcon',
																remixicon: 'RiRecordCircleLine',
																class: 'animate-pulse text-red-500'
															});
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

						var node_17 = $.sibling(node_11, 2);

						$.component(node_17, () => Field.Field, ($$anchor, Field_Field_3) => {
							Field_Field_3($$anchor, {
								children: ($$anchor, $$slotProps) => {
									var fragment_13 = root();
									var node_18 = $.first_child(fragment_13);

									$.component(node_18, () => Field.Label, ($$anchor, Field_Label_3) => {
										Field_Label_3($$anchor, {
											for: 'input-addon-20',
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_3 = $.text('Addon (block-start)');

												$.append($$anchor, text_3);
											},
											$$slots: { default: true }
										});
									});

									var node_19 = $.sibling(node_18, 2);

									$.component(node_19, () => InputGroup.Root, ($$anchor, InputGroup_Root_3) => {
										InputGroup_Root_3($$anchor, {
											class: 'h-auto',
											children: ($$anchor, $$slotProps) => {
												var fragment_14 = root();
												var node_20 = $.first_child(fragment_14);

												$.component(node_20, () => InputGroup.Input, ($$anchor, InputGroup_Input_3) => {
													InputGroup_Input_3($$anchor, { id: 'input-addon-20' });
												});

												var node_21 = $.sibling(node_20, 2);

												$.component(node_21, () => InputGroup.Addon, ($$anchor, InputGroup_Addon_4) => {
													InputGroup_Addon_4($$anchor, {
														align: 'block-start',
														children: ($$anchor, $$slotProps) => {
															var fragment_15 = root();
															var node_22 = $.first_child(fragment_15);

															$.component(node_22, () => InputGroup.Text, ($$anchor, InputGroup_Text) => {
																InputGroup_Text($$anchor, {
																	children: ($$anchor, $$slotProps) => {
																		$.next();

																		var text_4 = $.text('First Name');

																		$.append($$anchor, text_4);
																	},
																	$$slots: { default: true }
																});
															});

															var node_23 = $.sibling(node_22, 2);

															IconPlaceholder(node_23, {
																lucide: 'InfoIcon',
																tabler: 'IconInfoCircle',
																hugeicons: 'AlertCircleIcon',
																phosphor: 'InfoIcon',
																remixicon: 'RiInformationLine',
																class: 'ml-auto text-muted-foreground'
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

						var node_24 = $.sibling(node_17, 2);

						$.component(node_24, () => Field.Field, ($$anchor, Field_Field_4) => {
							Field_Field_4($$anchor, {
								children: ($$anchor, $$slotProps) => {
									var fragment_16 = root();
									var node_25 = $.first_child(fragment_16);

									$.component(node_25, () => Field.Label, ($$anchor, Field_Label_4) => {
										Field_Label_4($$anchor, {
											for: 'input-addon-21',
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_5 = $.text('Addon (block-end)');

												$.append($$anchor, text_5);
											},
											$$slots: { default: true }
										});
									});

									var node_26 = $.sibling(node_25, 2);

									$.component(node_26, () => InputGroup.Root, ($$anchor, InputGroup_Root_4) => {
										InputGroup_Root_4($$anchor, {
											class: 'h-auto',
											children: ($$anchor, $$slotProps) => {
												var fragment_17 = root();
												var node_27 = $.first_child(fragment_17);

												$.component(node_27, () => InputGroup.Input, ($$anchor, InputGroup_Input_4) => {
													InputGroup_Input_4($$anchor, { id: 'input-addon-21' });
												});

												var node_28 = $.sibling(node_27, 2);

												$.component(node_28, () => InputGroup.Addon, ($$anchor, InputGroup_Addon_5) => {
													InputGroup_Addon_5($$anchor, {
														align: 'block-end',
														children: ($$anchor, $$slotProps) => {
															var fragment_18 = root();
															var node_29 = $.first_child(fragment_18);

															$.component(node_29, () => InputGroup.Text, ($$anchor, InputGroup_Text_1) => {
																InputGroup_Text_1($$anchor, {
																	children: ($$anchor, $$slotProps) => {
																		$.next();

																		var text_6 = $.text('20/240 characters');

																		$.append($$anchor, text_6);
																	},
																	$$slots: { default: true }
																});
															});

															var node_30 = $.sibling(node_29, 2);

															IconPlaceholder(node_30, {
																lucide: 'InfoIcon',
																tabler: 'IconInfoCircle',
																hugeicons: 'AlertCircleIcon',
																phosphor: 'InfoIcon',
																remixicon: 'RiInformationLine',
																class: 'ml-auto text-muted-foreground'
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

									$.append($$anchor, fragment_16);
								},
								$$slots: { default: true }
							});
						});

						var node_31 = $.sibling(node_24, 2);

						$.component(node_31, () => Field.Field, ($$anchor, Field_Field_5) => {
							Field_Field_5($$anchor, {
								children: ($$anchor, $$slotProps) => {
									var fragment_19 = root();
									var node_32 = $.first_child(fragment_19);

									$.component(node_32, () => Field.Label, ($$anchor, Field_Label_5) => {
										Field_Label_5($$anchor, {
											for: 'input-icon-both-10',
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_7 = $.text('Multiple Icons');

												$.append($$anchor, text_7);
											},
											$$slots: { default: true }
										});
									});

									var node_33 = $.sibling(node_32, 2);

									$.component(node_33, () => InputGroup.Root, ($$anchor, InputGroup_Root_5) => {
										InputGroup_Root_5($$anchor, {
											children: ($$anchor, $$slotProps) => {
												var fragment_20 = root_1();
												var node_34 = $.first_child(fragment_20);

												$.component(node_34, () => InputGroup.Input, ($$anchor, InputGroup_Input_5) => {
													InputGroup_Input_5($$anchor, { id: 'input-icon-both-10' });
												});

												var node_35 = $.sibling(node_34, 2);

												$.component(node_35, () => InputGroup.Addon, ($$anchor, InputGroup_Addon_6) => {
													InputGroup_Addon_6($$anchor, {
														align: 'inline-end',
														children: ($$anchor, $$slotProps) => {
															var fragment_21 = root();
															var node_36 = $.first_child(fragment_21);

															IconPlaceholder(node_36, {
																lucide: 'StarIcon',
																tabler: 'IconStar',
																hugeicons: 'StarIcon',
																phosphor: 'StarIcon',
																remixicon: 'RiStarLine'
															});

															var node_37 = $.sibling(node_36, 2);

															$.component(node_37, () => InputGroup.Button, ($$anchor, InputGroup_Button) => {
																InputGroup_Button($$anchor, {
																	size: 'icon-xs',
																	onclick: () => {},
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

															$.append($$anchor, fragment_21);
														},
														$$slots: { default: true }
													});
												});

												var node_38 = $.sibling(node_35, 2);

												$.component(node_38, () => InputGroup.Addon, ($$anchor, InputGroup_Addon_7) => {
													InputGroup_Addon_7($$anchor, {
														children: ($$anchor, $$slotProps) => {
															IconPlaceholder($$anchor, {
																lucide: 'RadioIcon',
																tabler: 'IconPlayerRecordFilled',
																hugeicons: 'RecordIcon',
																phosphor: 'RecordIcon',
																remixicon: 'RiRecordCircleLine',
																class: 'animate-pulse text-red-500'
															});
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

						var node_39 = $.sibling(node_31, 2);

						$.component(node_39, () => Field.Field, ($$anchor, Field_Field_6) => {
							Field_Field_6($$anchor, {
								children: ($$anchor, $$slotProps) => {
									var fragment_24 = root_1();
									var node_40 = $.first_child(fragment_24);

									$.component(node_40, () => Field.Label, ($$anchor, Field_Label_6) => {
										Field_Label_6($$anchor, {
											for: 'input-description-10',
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_8 = $.text('Description');

												$.append($$anchor, text_8);
											},
											$$slots: { default: true }
										});
									});

									var node_41 = $.sibling(node_40, 2);

									$.component(node_41, () => InputGroup.Root, ($$anchor, InputGroup_Root_6) => {
										InputGroup_Root_6($$anchor, {
											children: ($$anchor, $$slotProps) => {
												var fragment_25 = root();
												var node_42 = $.first_child(fragment_25);

												$.component(node_42, () => InputGroup.Input, ($$anchor, InputGroup_Input_6) => {
													InputGroup_Input_6($$anchor, { id: 'input-description-10' });
												});

												var node_43 = $.sibling(node_42, 2);

												$.component(node_43, () => InputGroup.Addon, ($$anchor, InputGroup_Addon_8) => {
													InputGroup_Addon_8($$anchor, {
														align: 'inline-end',
														children: ($$anchor, $$slotProps) => {
															IconPlaceholder($$anchor, {
																lucide: 'InfoIcon',
																tabler: 'IconInfoCircle',
																hugeicons: 'AlertCircleIcon',
																phosphor: 'InfoIcon',
																remixicon: 'RiInformationLine'
															});
														},
														$$slots: { default: true }
													});
												});

												$.append($$anchor, fragment_25);
											},
											$$slots: { default: true }
										});
									});

									var node_44 = $.sibling(node_41, 2);

									$.component(node_44, () => Field.Description, ($$anchor, Field_Description) => {
										Field_Description($$anchor, {
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_9 = $.text('This is a description of the input group.');

												$.append($$anchor, text_9);
											},
											$$slots: { default: true }
										});
									});

									$.append($$anchor, fragment_24);
								},
								$$slots: { default: true }
							});
						});

						var node_45 = $.sibling(node_39, 2);

						$.component(node_45, () => Field.Field, ($$anchor, Field_Field_7) => {
							Field_Field_7($$anchor, {
								children: ($$anchor, $$slotProps) => {
									var fragment_27 = root_1();
									var node_46 = $.first_child(fragment_27);

									$.component(node_46, () => Field.Label, ($$anchor, Field_Label_7) => {
										Field_Label_7($$anchor, {
											for: 'input-label-10',
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_10 = $.text('Label');

												$.append($$anchor, text_10);
											},
											$$slots: { default: true }
										});
									});

									var node_47 = $.sibling(node_46, 2);

									$.component(node_47, () => InputGroup.Root, ($$anchor, InputGroup_Root_7) => {
										InputGroup_Root_7($$anchor, {
											children: ($$anchor, $$slotProps) => {
												var fragment_28 = root();
												var node_48 = $.first_child(fragment_28);

												$.component(node_48, () => InputGroup.Addon, ($$anchor, InputGroup_Addon_9) => {
													InputGroup_Addon_9($$anchor, {
														children: ($$anchor, $$slotProps) => {
															var fragment_29 = $.comment();
															var node_49 = $.first_child(fragment_29);

															$.component(node_49, () => Field.Label, ($$anchor, Field_Label_8) => {
																Field_Label_8($$anchor, {
																	for: 'input-label-10',
																	children: ($$anchor, $$slotProps) => {
																		$.next();

																		var text_11 = $.text('Label');

																		$.append($$anchor, text_11);
																	},
																	$$slots: { default: true }
																});
															});

															$.append($$anchor, fragment_29);
														},
														$$slots: { default: true }
													});
												});

												var node_50 = $.sibling(node_48, 2);

												$.component(node_50, () => InputGroup.Input, ($$anchor, InputGroup_Input_7) => {
													InputGroup_Input_7($$anchor, { id: 'input-label-10' });
												});

												$.append($$anchor, fragment_28);
											},
											$$slots: { default: true }
										});
									});

									var node_51 = $.sibling(node_47, 2);

									$.component(node_51, () => InputGroup.Root, ($$anchor, InputGroup_Root_8) => {
										InputGroup_Root_8($$anchor, {
											children: ($$anchor, $$slotProps) => {
												var fragment_30 = root();
												var node_52 = $.first_child(fragment_30);

												$.component(node_52, () => InputGroup.Input, ($$anchor, InputGroup_Input_8) => {
													InputGroup_Input_8($$anchor, { id: 'input-optional-12', 'aria-label': 'Optional' });
												});

												var node_53 = $.sibling(node_52, 2);

												$.component(node_53, () => InputGroup.Addon, ($$anchor, InputGroup_Addon_10) => {
													InputGroup_Addon_10($$anchor, {
														align: 'inline-end',
														children: ($$anchor, $$slotProps) => {
															var fragment_31 = $.comment();
															var node_54 = $.first_child(fragment_31);

															$.component(node_54, () => InputGroup.Text, ($$anchor, InputGroup_Text_2) => {
																InputGroup_Text_2($$anchor, {
																	children: ($$anchor, $$slotProps) => {
																		$.next();

																		var text_12 = $.text('(optional)');

																		$.append($$anchor, text_12);
																	},
																	$$slots: { default: true }
																});
															});

															$.append($$anchor, fragment_31);
														},
														$$slots: { default: true }
													});
												});

												$.append($$anchor, fragment_30);
											},
											$$slots: { default: true }
										});
									});

									$.append($$anchor, fragment_27);
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