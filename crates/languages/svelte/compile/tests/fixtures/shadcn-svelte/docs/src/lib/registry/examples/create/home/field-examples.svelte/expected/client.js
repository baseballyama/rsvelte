import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as ButtonGroup from "$lib/registry/ui/button-group/index.js";
import * as Field from "$lib/registry/ui/field/index.js";
import * as RadioGroup from "$lib/registry/ui/radio-group/index.js";
import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
import { Button } from "$lib/registry/ui/button/index.js";
import { Checkbox } from "$lib/registry/ui/checkbox/index.js";
import { Input } from "$lib/registry/ui/input/index.js";
import { Slider } from "$lib/registry/ui/slider/index.js";
import { Switch } from "$lib/registry/ui/switch/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!>`, 1);
var root_2 = $.from_html(`Set your budget range ($ <span class="font-medium tabular-nums"> </span> - <span class="font-medium tabular-nums"> </span>).`, 1);
var root_3 = $.from_html(`<!> <!> <!> <!> <!> <!> <!> <!> <!>`, 1);

export default function Field_examples($$anchor) {
	let gpuCount = $.state(8);
	let value = $.state($.proxy([200, 800]));

	function handleGpuAdjustment(adjustment) {
		$.set(gpuCount, Math.max(1, Math.min(99, $.get(gpuCount) + adjustment)), true);
	}

	function handleGpuInputChange(e) {
		const target = e.target;
		const val = parseInt(target.value, 10);

		if (!isNaN(val) && val >= 1 && val <= 99) {
			$.set(gpuCount, val, true);
		}
	}

	Example($$anchor, {
		title: 'Fields',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = $.comment();
			var node = $.first_child(fragment_1);

			$.component(node, () => Field.Set, ($$anchor, Field_Set) => {
				Field_Set($$anchor, {
					class: 'w-full max-w-md',
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = $.comment();
						var node_1 = $.first_child(fragment_2);

						$.component(node_1, () => Field.Group, ($$anchor, Field_Group) => {
							Field_Group($$anchor, {
								children: ($$anchor, $$slotProps) => {
									var fragment_3 = root_3();
									var node_2 = $.first_child(fragment_3);

									$.component(node_2, () => Field.Set, ($$anchor, Field_Set_1) => {
										Field_Set_1($$anchor, {
											children: ($$anchor, $$slotProps) => {
												var fragment_4 = root_1();
												var node_3 = $.first_child(fragment_4);

												$.component(node_3, () => Field.Legend, ($$anchor, Field_Legend) => {
													Field_Legend($$anchor, {
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text = $.text('Compute Environment');

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

															var text_1 = $.text('Select the compute environment for your cluster.');

															$.append($$anchor, text_1);
														},
														$$slots: { default: true }
													});
												});

												var node_5 = $.sibling(node_4, 2);

												$.component(node_5, () => RadioGroup.Root, ($$anchor, RadioGroup_Root) => {
													RadioGroup_Root($$anchor, {
														value: 'kubernetes',
														children: ($$anchor, $$slotProps) => {
															var fragment_5 = root();
															var node_6 = $.first_child(fragment_5);

															$.component(node_6, () => Field.Label, ($$anchor, Field_Label) => {
																Field_Label($$anchor, {
																	for: 'kubernetes-r2h',
																	children: ($$anchor, $$slotProps) => {
																		var fragment_6 = $.comment();
																		var node_7 = $.first_child(fragment_6);

																		$.component(node_7, () => Field.Field, ($$anchor, Field_Field) => {
																			Field_Field($$anchor, {
																				orientation: 'horizontal',
																				children: ($$anchor, $$slotProps) => {
																					var fragment_7 = root();
																					var node_8 = $.first_child(fragment_7);

																					$.component(node_8, () => Field.Content, ($$anchor, Field_Content) => {
																						Field_Content($$anchor, {
																							children: ($$anchor, $$slotProps) => {
																								var fragment_8 = root();
																								var node_9 = $.first_child(fragment_8);

																								$.component(node_9, () => Field.Title, ($$anchor, Field_Title) => {
																									Field_Title($$anchor, {
																										children: ($$anchor, $$slotProps) => {
																											$.next();

																											var text_2 = $.text('Kubernetes');

																											$.append($$anchor, text_2);
																										},
																										$$slots: { default: true }
																									});
																								});

																								var node_10 = $.sibling(node_9, 2);

																								$.component(node_10, () => Field.Description, ($$anchor, Field_Description_1) => {
																									Field_Description_1($$anchor, {
																										children: ($$anchor, $$slotProps) => {
																											$.next();

																											var text_3 = $.text('Run GPU workloads on a K8s configured cluster. This is the default.');

																											$.append($$anchor, text_3);
																										},
																										$$slots: { default: true }
																									});
																								});

																								$.append($$anchor, fragment_8);
																							},
																							$$slots: { default: true }
																						});
																					});

																					var node_11 = $.sibling(node_8, 2);

																					$.component(node_11, () => RadioGroup.Item, ($$anchor, RadioGroup_Item) => {
																						RadioGroup_Item($$anchor, {
																							value: 'kubernetes',
																							id: 'kubernetes-r2h',
																							'aria-label': 'Kubernetes'
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

															var node_12 = $.sibling(node_6, 2);

															$.component(node_12, () => Field.Label, ($$anchor, Field_Label_1) => {
																Field_Label_1($$anchor, {
																	for: 'vm-z4k',
																	children: ($$anchor, $$slotProps) => {
																		var fragment_9 = $.comment();
																		var node_13 = $.first_child(fragment_9);

																		$.component(node_13, () => Field.Field, ($$anchor, Field_Field_1) => {
																			Field_Field_1($$anchor, {
																				orientation: 'horizontal',
																				children: ($$anchor, $$slotProps) => {
																					var fragment_10 = root();
																					var node_14 = $.first_child(fragment_10);

																					$.component(node_14, () => Field.Content, ($$anchor, Field_Content_1) => {
																						Field_Content_1($$anchor, {
																							children: ($$anchor, $$slotProps) => {
																								var fragment_11 = root();
																								var node_15 = $.first_child(fragment_11);

																								$.component(node_15, () => Field.Title, ($$anchor, Field_Title_1) => {
																									Field_Title_1($$anchor, {
																										children: ($$anchor, $$slotProps) => {
																											$.next();

																											var text_4 = $.text('Virtual Machine');

																											$.append($$anchor, text_4);
																										},
																										$$slots: { default: true }
																									});
																								});

																								var node_16 = $.sibling(node_15, 2);

																								$.component(node_16, () => Field.Description, ($$anchor, Field_Description_2) => {
																									Field_Description_2($$anchor, {
																										children: ($$anchor, $$slotProps) => {
																											$.next();

																											var text_5 = $.text('Access a VM configured cluster to run workloads. (Coming soon)');

																											$.append($$anchor, text_5);
																										},
																										$$slots: { default: true }
																									});
																								});

																								$.append($$anchor, fragment_11);
																							},
																							$$slots: { default: true }
																						});
																					});

																					var node_17 = $.sibling(node_14, 2);

																					$.component(node_17, () => RadioGroup.Item, ($$anchor, RadioGroup_Item_1) => {
																						RadioGroup_Item_1($$anchor, { value: 'vm', id: 'vm-z4k', 'aria-label': 'Virtual Machine' });
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

									var node_18 = $.sibling(node_2, 2);

									$.component(node_18, () => Field.Separator, ($$anchor, Field_Separator) => {
										Field_Separator($$anchor, {});
									});

									var node_19 = $.sibling(node_18, 2);

									$.component(node_19, () => Field.Field, ($$anchor, Field_Field_2) => {
										Field_Field_2($$anchor, {
											orientation: 'horizontal',
											children: ($$anchor, $$slotProps) => {
												var fragment_12 = root();
												var node_20 = $.first_child(fragment_12);

												$.component(node_20, () => Field.Content, ($$anchor, Field_Content_2) => {
													Field_Content_2($$anchor, {
														children: ($$anchor, $$slotProps) => {
															var fragment_13 = root();
															var node_21 = $.first_child(fragment_13);

															$.component(node_21, () => Field.Label, ($$anchor, Field_Label_2) => {
																Field_Label_2($$anchor, {
																	for: 'number-of-gpus-f6l',
																	children: ($$anchor, $$slotProps) => {
																		$.next();

																		var text_6 = $.text('Number of GPUs');

																		$.append($$anchor, text_6);
																	},
																	$$slots: { default: true }
																});
															});

															var node_22 = $.sibling(node_21, 2);

															$.component(node_22, () => Field.Description, ($$anchor, Field_Description_3) => {
																Field_Description_3($$anchor, {
																	children: ($$anchor, $$slotProps) => {
																		$.next();

																		var text_7 = $.text('You can add more later.');

																		$.append($$anchor, text_7);
																	},
																	$$slots: { default: true }
																});
															});

															$.append($$anchor, fragment_13);
														},
														$$slots: { default: true }
													});
												});

												var node_23 = $.sibling(node_20, 2);

												$.component(node_23, () => ButtonGroup.Root, ($$anchor, ButtonGroup_Root) => {
													ButtonGroup_Root($$anchor, {
														children: ($$anchor, $$slotProps) => {
															var fragment_14 = root_1();
															var node_24 = $.first_child(fragment_14);

															Input(node_24, {
																id: 'number-of-gpus-f6l',
																get value() {
																	return $.get(gpuCount);
																},
																oninput: handleGpuInputChange,
																size: 3,
																maxlength: 3
															});

															var node_25 = $.sibling(node_24, 2);

															{
																let $0 = $.derived(() => $.get(gpuCount) <= 1);

																Button(node_25, {
																	variant: 'outline',
																	size: 'icon',
																	type: 'button',
																	'aria-label': 'Decrement',
																	onclick: () => handleGpuAdjustment(-1),
																	get disabled() {
																		return $.get($0);
																	},

																	children: ($$anchor, $$slotProps) => {
																		IconPlaceholder($$anchor, {
																			lucide: 'MinusIcon',
																			tabler: 'IconMinus',
																			hugeicons: 'MinusSignIcon',
																			phosphor: 'MinusIcon',
																			remixicon: 'RiSubtractLine'
																		});
																	},
																	$$slots: { default: true }
																});
															}

															var node_26 = $.sibling(node_25, 2);

															{
																let $0 = $.derived(() => $.get(gpuCount) >= 99);

																Button(node_26, {
																	variant: 'outline',
																	size: 'icon',
																	type: 'button',
																	'aria-label': 'Increment',
																	onclick: () => handleGpuAdjustment(1),
																	get disabled() {
																		return $.get($0);
																	},

																	children: ($$anchor, $$slotProps) => {
																		IconPlaceholder($$anchor, {
																			lucide: 'PlusIcon',
																			tabler: 'IconPlus',
																			hugeicons: 'PlusSignIcon',
																			phosphor: 'PlusIcon',
																			remixicon: 'RiAddLine'
																		});
																	},
																	$$slots: { default: true }
																});
															}

															$.append($$anchor, fragment_14);
														},
														$$slots: { default: true }
													});
												});

												$.append($$anchor, fragment_12);
											},
											$$slots: { default: true }
										});
									});

									var node_27 = $.sibling(node_19, 2);

									$.component(node_27, () => Field.Separator, ($$anchor, Field_Separator_1) => {
										Field_Separator_1($$anchor, {});
									});

									var node_28 = $.sibling(node_27, 2);

									$.component(node_28, () => Field.Field, ($$anchor, Field_Field_3) => {
										Field_Field_3($$anchor, {
											orientation: 'horizontal',
											children: ($$anchor, $$slotProps) => {
												var fragment_17 = root();
												var node_29 = $.first_child(fragment_17);

												$.component(node_29, () => Field.Content, ($$anchor, Field_Content_3) => {
													Field_Content_3($$anchor, {
														children: ($$anchor, $$slotProps) => {
															var fragment_18 = root();
															var node_30 = $.first_child(fragment_18);

															$.component(node_30, () => Field.Label, ($$anchor, Field_Label_3) => {
																Field_Label_3($$anchor, {
																	for: 'tinting',
																	children: ($$anchor, $$slotProps) => {
																		$.next();

																		var text_8 = $.text('Wallpaper Tinting');

																		$.append($$anchor, text_8);
																	},
																	$$slots: { default: true }
																});
															});

															var node_31 = $.sibling(node_30, 2);

															$.component(node_31, () => Field.Description, ($$anchor, Field_Description_4) => {
																Field_Description_4($$anchor, {
																	children: ($$anchor, $$slotProps) => {
																		$.next();

																		var text_9 = $.text('Allow the wallpaper to be tinted.');

																		$.append($$anchor, text_9);
																	},
																	$$slots: { default: true }
																});
															});

															$.append($$anchor, fragment_18);
														},
														$$slots: { default: true }
													});
												});

												var node_32 = $.sibling(node_29, 2);

												Switch(node_32, { id: 'tinting', checked: true });
												$.append($$anchor, fragment_17);
											},
											$$slots: { default: true }
										});
									});

									var node_33 = $.sibling(node_28, 2);

									$.component(node_33, () => Field.Separator, ($$anchor, Field_Separator_2) => {
										Field_Separator_2($$anchor, {});
									});

									var node_34 = $.sibling(node_33, 2);

									$.component(node_34, () => Field.Label, ($$anchor, Field_Label_4) => {
										Field_Label_4($$anchor, {
											for: 'checkbox-demo',
											children: ($$anchor, $$slotProps) => {
												var fragment_19 = $.comment();
												var node_35 = $.first_child(fragment_19);

												$.component(node_35, () => Field.Field, ($$anchor, Field_Field_4) => {
													Field_Field_4($$anchor, {
														orientation: 'horizontal',
														children: ($$anchor, $$slotProps) => {
															var fragment_20 = root();
															var node_36 = $.first_child(fragment_20);

															Checkbox(node_36, { id: 'checkbox-demo', checked: true });

															var node_37 = $.sibling(node_36, 2);

															$.component(node_37, () => Field.Label, ($$anchor, Field_Label_5) => {
																Field_Label_5($$anchor, {
																	for: 'checkbox-demo',
																	class: 'line-clamp-1',
																	children: ($$anchor, $$slotProps) => {
																		$.next();

																		var text_10 = $.text('I agree to the terms and conditions');

																		$.append($$anchor, text_10);
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

									var node_38 = $.sibling(node_34, 2);

									$.component(node_38, () => Field.Field, ($$anchor, Field_Field_5) => {
										Field_Field_5($$anchor, {
											children: ($$anchor, $$slotProps) => {
												var fragment_21 = root_1();
												var node_39 = $.first_child(fragment_21);

												$.component(node_39, () => Field.Title, ($$anchor, Field_Title_2) => {
													Field_Title_2($$anchor, {
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_11 = $.text('Price Range');

															$.append($$anchor, text_11);
														},
														$$slots: { default: true }
													});
												});

												var node_40 = $.sibling(node_39, 2);

												$.component(node_40, () => Field.Description, ($$anchor, Field_Description_5) => {
													Field_Description_5($$anchor, {
														children: ($$anchor, $$slotProps) => {
															$.next();

															var fragment_22 = root_2();
															var span = $.sibling($.first_child(fragment_22));
															var text_12 = $.only_child(span, true);
															var span_1 = $.sibling(span, 2);
															var text_13 = $.only_child(span_1, true);

															$.next();

															$.template_effect(() => {
																$.set_text(text_12, $.get(value)[0]);
																$.set_text(text_13, $.get(value)[1]);
															});

															$.append($$anchor, fragment_22);
														},
														$$slots: { default: true }
													});
												});

												var node_41 = $.sibling(node_40, 2);

												Slider(node_41, {
													type: 'multiple',
													max: 1000,
													min: 0,
													step: 10,
													class: 'mt-2 w-full',
													'aria-label': 'Price Range',
													get value() {
														return $.get(value);
													},

													set value($$value) {
														$.set(value, $$value, true);
													}
												});

												$.append($$anchor, fragment_21);
											},
											$$slots: { default: true }
										});
									});

									var node_42 = $.sibling(node_38, 2);

									$.component(node_42, () => Field.Field, ($$anchor, Field_Field_6) => {
										Field_Field_6($$anchor, {
											orientation: 'horizontal',
											children: ($$anchor, $$slotProps) => {
												var fragment_23 = root();
												var node_43 = $.first_child(fragment_23);

												Button(node_43, {
													type: 'submit',
													children: ($$anchor, $$slotProps) => {
														$.next();

														var text_14 = $.text('Submit');

														$.append($$anchor, text_14);
													},
													$$slots: { default: true }
												});

												var node_44 = $.sibling(node_43, 2);

												Button(node_44, {
													variant: 'outline',
													type: 'button',
													children: ($$anchor, $$slotProps) => {
														$.next();

														var text_15 = $.text('Cancel');

														$.append($$anchor, text_15);
													},
													$$slots: { default: true }
												});

												$.append($$anchor, fragment_23);
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