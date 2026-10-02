import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as Field from "$lib/registry/ui/field/index.js";
import * as InputGroup from "$lib/registry/ui/input-group/index.js";
import * as Kbd from "$lib/registry/ui/kbd/index.js";
import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
import { Spinner } from "$lib/registry/ui/spinner/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!>`, 1);
var root_2 = $.from_html(`<!> <!> <!> <!> <!>`, 1);
var root_3 = $.from_html(`<div class="flex size-4 items-center justify-center rounded-full bg-green-500 dark:bg-green-800"><!></div>`);
var root_4 = $.from_html(`<!> <!> <!> <!> <!> <!>`, 1);

export default function Input_group_with_kbd($$anchor) {
	Example($$anchor, {
		title: 'With Kbd',
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
									var fragment_3 = root_2();
									var node_2 = $.first_child(fragment_3);

									$.component(node_2, () => Field.Label, ($$anchor, Field_Label) => {
										Field_Label($$anchor, {
											for: 'input-kbd-22',
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text = $.text('Input Group with Kbd');

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
													InputGroup_Input($$anchor, { id: 'input-kbd-22' });
												});

												var node_5 = $.sibling(node_4, 2);

												$.component(node_5, () => InputGroup.Addon, ($$anchor, InputGroup_Addon) => {
													InputGroup_Addon($$anchor, {
														children: ($$anchor, $$slotProps) => {
															var fragment_5 = $.comment();
															var node_6 = $.first_child(fragment_5);

															$.component(node_6, () => Kbd.Root, ($$anchor, Kbd_Root) => {
																Kbd_Root($$anchor, {
																	children: ($$anchor, $$slotProps) => {
																		$.next();

																		var text_1 = $.text('⌘K');

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
													InputGroup_Input_1($$anchor, { id: 'input-kbd-23' });
												});

												var node_9 = $.sibling(node_8, 2);

												$.component(node_9, () => InputGroup.Addon, ($$anchor, InputGroup_Addon_1) => {
													InputGroup_Addon_1($$anchor, {
														align: 'inline-end',
														children: ($$anchor, $$slotProps) => {
															var fragment_7 = $.comment();
															var node_10 = $.first_child(fragment_7);

															$.component(node_10, () => Kbd.Root, ($$anchor, Kbd_Root_1) => {
																Kbd_Root_1($$anchor, {
																	children: ($$anchor, $$slotProps) => {
																		$.next();

																		var text_2 = $.text('⌘K');

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
												var fragment_8 = root_1();
												var node_12 = $.first_child(fragment_8);

												$.component(node_12, () => InputGroup.Input, ($$anchor, InputGroup_Input_2) => {
													InputGroup_Input_2($$anchor, {
														id: 'input-search-apps-24',
														placeholder: 'Search for Apps...'
													});
												});

												var node_13 = $.sibling(node_12, 2);

												$.component(node_13, () => InputGroup.Addon, ($$anchor, InputGroup_Addon_2) => {
													InputGroup_Addon_2($$anchor, {
														align: 'inline-end',
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_3 = $.text('Ask AI');

															$.append($$anchor, text_3);
														},
														$$slots: { default: true }
													});
												});

												var node_14 = $.sibling(node_13, 2);

												$.component(node_14, () => InputGroup.Addon, ($$anchor, InputGroup_Addon_3) => {
													InputGroup_Addon_3($$anchor, {
														align: 'inline-end',
														children: ($$anchor, $$slotProps) => {
															var fragment_9 = $.comment();
															var node_15 = $.first_child(fragment_9);

															$.component(node_15, () => Kbd.Root, ($$anchor, Kbd_Root_2) => {
																Kbd_Root_2($$anchor, {
																	children: ($$anchor, $$slotProps) => {
																		$.next();

																		var text_4 = $.text('Tab');

																		$.append($$anchor, text_4);
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

									var node_16 = $.sibling(node_11, 2);

									$.component(node_16, () => InputGroup.Root, ($$anchor, InputGroup_Root_3) => {
										InputGroup_Root_3($$anchor, {
											children: ($$anchor, $$slotProps) => {
												var fragment_10 = root_1();
												var node_17 = $.first_child(fragment_10);

												$.component(node_17, () => InputGroup.Input, ($$anchor, InputGroup_Input_3) => {
													InputGroup_Input_3($$anchor, { id: 'input-search-type-25', placeholder: 'Type to search...' });
												});

												var node_18 = $.sibling(node_17, 2);

												$.component(node_18, () => InputGroup.Addon, ($$anchor, InputGroup_Addon_4) => {
													InputGroup_Addon_4($$anchor, {
														align: 'inline-start',
														children: ($$anchor, $$slotProps) => {
															IconPlaceholder($$anchor, {
																lucide: 'SparklesIcon',
																tabler: 'IconServerSpark',
																hugeicons: 'SparklesIcon',
																phosphor: 'SparkleIcon',
																remixicon: 'RiSparklingLine'
															});
														},
														$$slots: { default: true }
													});
												});

												var node_19 = $.sibling(node_18, 2);

												$.component(node_19, () => InputGroup.Addon, ($$anchor, InputGroup_Addon_5) => {
													InputGroup_Addon_5($$anchor, {
														align: 'inline-end',
														children: ($$anchor, $$slotProps) => {
															var fragment_12 = $.comment();
															var node_20 = $.first_child(fragment_12);

															$.component(node_20, () => Kbd.Group, ($$anchor, Kbd_Group) => {
																Kbd_Group($$anchor, {
																	children: ($$anchor, $$slotProps) => {
																		var fragment_13 = root();
																		var node_21 = $.first_child(fragment_13);

																		$.component(node_21, () => Kbd.Root, ($$anchor, Kbd_Root_3) => {
																			Kbd_Root_3($$anchor, {
																				children: ($$anchor, $$slotProps) => {
																					$.next();

																					var text_5 = $.text('Ctrl');

																					$.append($$anchor, text_5);
																				},
																				$$slots: { default: true }
																			});
																		});

																		var node_22 = $.sibling(node_21, 2);

																		$.component(node_22, () => Kbd.Root, ($$anchor, Kbd_Root_4) => {
																			Kbd_Root_4($$anchor, {
																				children: ($$anchor, $$slotProps) => {
																					$.next();

																					var text_6 = $.text('C');

																					$.append($$anchor, text_6);
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

												$.append($$anchor, fragment_10);
											},
											$$slots: { default: true }
										});
									});

									$.append($$anchor, fragment_3);
								},
								$$slots: { default: true }
							});
						});

						var node_23 = $.sibling(node_1, 2);

						$.component(node_23, () => Field.Field, ($$anchor, Field_Field_1) => {
							Field_Field_1($$anchor, {
								children: ($$anchor, $$slotProps) => {
									var fragment_14 = root_1();
									var node_24 = $.first_child(fragment_14);

									$.component(node_24, () => Field.Label, ($$anchor, Field_Label_1) => {
										Field_Label_1($$anchor, {
											for: 'input-username-26',
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_7 = $.text('Username');

												$.append($$anchor, text_7);
											},
											$$slots: { default: true }
										});
									});

									var node_25 = $.sibling(node_24, 2);

									$.component(node_25, () => InputGroup.Root, ($$anchor, InputGroup_Root_4) => {
										InputGroup_Root_4($$anchor, {
											children: ($$anchor, $$slotProps) => {
												var fragment_15 = root();
												var node_26 = $.first_child(fragment_15);

												$.component(node_26, () => InputGroup.Input, ($$anchor, InputGroup_Input_4) => {
													InputGroup_Input_4($$anchor, { id: 'input-username-26', value: 'shadcn' });
												});

												var node_27 = $.sibling(node_26, 2);

												$.component(node_27, () => InputGroup.Addon, ($$anchor, InputGroup_Addon_6) => {
													InputGroup_Addon_6($$anchor, {
														align: 'inline-end',
														children: ($$anchor, $$slotProps) => {
															var div = root_3();
															var node_28 = $.child(div);

															IconPlaceholder(node_28, {
																lucide: 'CheckIcon',
																tabler: 'IconCheck',
																hugeicons: 'Tick02Icon',
																phosphor: 'CheckIcon',
																remixicon: 'RiCheckLine',
																class: 'size-3 text-white'
															});

															$.reset(div);
															$.append($$anchor, div);
														},
														$$slots: { default: true }
													});
												});

												$.append($$anchor, fragment_15);
											},
											$$slots: { default: true }
										});
									});

									var node_29 = $.sibling(node_25, 2);

									$.component(node_29, () => Field.Description, ($$anchor, Field_Description) => {
										Field_Description($$anchor, {
											class: 'text-green-700',
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_8 = $.text('This username is available.');

												$.append($$anchor, text_8);
											},
											$$slots: { default: true }
										});
									});

									$.append($$anchor, fragment_14);
								},
								$$slots: { default: true }
							});
						});

						var node_30 = $.sibling(node_23, 2);

						$.component(node_30, () => InputGroup.Root, ($$anchor, InputGroup_Root_5) => {
							InputGroup_Root_5($$anchor, {
								children: ($$anchor, $$slotProps) => {
									var fragment_16 = root_1();
									var node_31 = $.first_child(fragment_16);

									$.component(node_31, () => InputGroup.Input, ($$anchor, InputGroup_Input_5) => {
										InputGroup_Input_5($$anchor, {
											id: 'input-search-docs-27',
											placeholder: 'Search documentation...'
										});
									});

									var node_32 = $.sibling(node_31, 2);

									$.component(node_32, () => InputGroup.Addon, ($$anchor, InputGroup_Addon_7) => {
										InputGroup_Addon_7($$anchor, {
											children: ($$anchor, $$slotProps) => {
												IconPlaceholder($$anchor, {
													lucide: 'SearchIcon',
													tabler: 'IconSearch',
													hugeicons: 'SearchIcon',
													phosphor: 'MagnifyingGlassIcon',
													remixicon: 'RiSearchLine'
												});
											},
											$$slots: { default: true }
										});
									});

									var node_33 = $.sibling(node_32, 2);

									$.component(node_33, () => InputGroup.Addon, ($$anchor, InputGroup_Addon_8) => {
										InputGroup_Addon_8($$anchor, {
											align: 'inline-end',
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_9 = $.text('12 results');

												$.append($$anchor, text_9);
											},
											$$slots: { default: true }
										});
									});

									$.append($$anchor, fragment_16);
								},
								$$slots: { default: true }
							});
						});

						var node_34 = $.sibling(node_30, 2);

						$.component(node_34, () => InputGroup.Root, ($$anchor, InputGroup_Root_6) => {
							InputGroup_Root_6($$anchor, {
								'data-disabled': 'true',
								children: ($$anchor, $$slotProps) => {
									var fragment_18 = root_1();
									var node_35 = $.first_child(fragment_18);

									$.component(node_35, () => InputGroup.Input, ($$anchor, InputGroup_Input_6) => {
										InputGroup_Input_6($$anchor, {
											id: 'input-search-disabled-28',
											placeholder: 'Search documentation...',
											disabled: true
										});
									});

									var node_36 = $.sibling(node_35, 2);

									$.component(node_36, () => InputGroup.Addon, ($$anchor, InputGroup_Addon_9) => {
										InputGroup_Addon_9($$anchor, {
											children: ($$anchor, $$slotProps) => {
												IconPlaceholder($$anchor, {
													lucide: 'SearchIcon',
													tabler: 'IconSearch',
													hugeicons: 'SearchIcon',
													phosphor: 'MagnifyingGlassIcon',
													remixicon: 'RiSearchLine'
												});
											},
											$$slots: { default: true }
										});
									});

									var node_37 = $.sibling(node_36, 2);

									$.component(node_37, () => InputGroup.Addon, ($$anchor, InputGroup_Addon_10) => {
										InputGroup_Addon_10($$anchor, {
											align: 'inline-end',
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_10 = $.text('Disabled');

												$.append($$anchor, text_10);
											},
											$$slots: { default: true }
										});
									});

									$.append($$anchor, fragment_18);
								},
								$$slots: { default: true }
							});
						});

						var node_38 = $.sibling(node_34, 2);

						$.component(node_38, () => Field.Group, ($$anchor, Field_Group_1) => {
							Field_Group_1($$anchor, {
								class: 'grid grid-cols-2 gap-4',
								children: ($$anchor, $$slotProps) => {
									var fragment_20 = root();
									var node_39 = $.first_child(fragment_20);

									$.component(node_39, () => Field.Field, ($$anchor, Field_Field_2) => {
										Field_Field_2($$anchor, {
											children: ($$anchor, $$slotProps) => {
												var fragment_21 = root();
												var node_40 = $.first_child(fragment_21);

												$.component(node_40, () => Field.Label, ($$anchor, Field_Label_2) => {
													Field_Label_2($$anchor, {
														for: 'input-group-11',
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_11 = $.text('First Name');

															$.append($$anchor, text_11);
														},
														$$slots: { default: true }
													});
												});

												var node_41 = $.sibling(node_40, 2);

												$.component(node_41, () => InputGroup.Root, ($$anchor, InputGroup_Root_7) => {
													InputGroup_Root_7($$anchor, {
														children: ($$anchor, $$slotProps) => {
															var fragment_22 = root();
															var node_42 = $.first_child(fragment_22);

															$.component(node_42, () => InputGroup.Input, ($$anchor, InputGroup_Input_7) => {
																InputGroup_Input_7($$anchor, { id: 'input-group-11', placeholder: 'First Name' });
															});

															var node_43 = $.sibling(node_42, 2);

															$.component(node_43, () => InputGroup.Addon, ($$anchor, InputGroup_Addon_11) => {
																InputGroup_Addon_11($$anchor, {
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

															$.append($$anchor, fragment_22);
														},
														$$slots: { default: true }
													});
												});

												$.append($$anchor, fragment_21);
											},
											$$slots: { default: true }
										});
									});

									var node_44 = $.sibling(node_39, 2);

									$.component(node_44, () => Field.Field, ($$anchor, Field_Field_3) => {
										Field_Field_3($$anchor, {
											children: ($$anchor, $$slotProps) => {
												var fragment_24 = root();
												var node_45 = $.first_child(fragment_24);

												$.component(node_45, () => Field.Label, ($$anchor, Field_Label_3) => {
													Field_Label_3($$anchor, {
														for: 'input-group-12',
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_12 = $.text('Last Name');

															$.append($$anchor, text_12);
														},
														$$slots: { default: true }
													});
												});

												var node_46 = $.sibling(node_45, 2);

												$.component(node_46, () => InputGroup.Root, ($$anchor, InputGroup_Root_8) => {
													InputGroup_Root_8($$anchor, {
														children: ($$anchor, $$slotProps) => {
															var fragment_25 = root();
															var node_47 = $.first_child(fragment_25);

															$.component(node_47, () => InputGroup.Input, ($$anchor, InputGroup_Input_8) => {
																InputGroup_Input_8($$anchor, { id: 'input-group-12', placeholder: 'Last Name' });
															});

															var node_48 = $.sibling(node_47, 2);

															$.component(node_48, () => InputGroup.Addon, ($$anchor, InputGroup_Addon_12) => {
																InputGroup_Addon_12($$anchor, {
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

												$.append($$anchor, fragment_24);
											},
											$$slots: { default: true }
										});
									});

									$.append($$anchor, fragment_20);
								},
								$$slots: { default: true }
							});
						});

						var node_49 = $.sibling(node_38, 2);

						$.component(node_49, () => Field.Field, ($$anchor, Field_Field_4) => {
							Field_Field_4($$anchor, {
								'data-disabled': 'true',
								children: ($$anchor, $$slotProps) => {
									var fragment_27 = root_1();
									var node_50 = $.first_child(fragment_27);

									$.component(node_50, () => Field.Label, ($$anchor, Field_Label_4) => {
										Field_Label_4($$anchor, {
											for: 'input-group-29',
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_13 = $.text('Loading ("data-disabled="true")');

												$.append($$anchor, text_13);
											},
											$$slots: { default: true }
										});
									});

									var node_51 = $.sibling(node_50, 2);

									$.component(node_51, () => InputGroup.Root, ($$anchor, InputGroup_Root_9) => {
										InputGroup_Root_9($$anchor, {
											children: ($$anchor, $$slotProps) => {
												var fragment_28 = root();
												var node_52 = $.first_child(fragment_28);

												$.component(node_52, () => InputGroup.Input, ($$anchor, InputGroup_Input_9) => {
													InputGroup_Input_9($$anchor, { id: 'input-group-29', disabled: true, value: 'shadcn' });
												});

												var node_53 = $.sibling(node_52, 2);

												$.component(node_53, () => InputGroup.Addon, ($$anchor, InputGroup_Addon_13) => {
													InputGroup_Addon_13($$anchor, {
														align: 'inline-end',
														children: ($$anchor, $$slotProps) => {
															Spinner($$anchor, {});
														},
														$$slots: { default: true }
													});
												});

												$.append($$anchor, fragment_28);
											},
											$$slots: { default: true }
										});
									});

									var node_54 = $.sibling(node_51, 2);

									$.component(node_54, () => Field.Description, ($$anchor, Field_Description_1) => {
										Field_Description_1($$anchor, {
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_14 = $.text('This is a description of the input group.');

												$.append($$anchor, text_14);
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