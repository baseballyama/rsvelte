import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import MinusIcon from "@lucide/svelte/icons/minus";
import PlusIcon from "@lucide/svelte/icons/plus";
import * as ButtonGroup from "$lib/registry/ui/button-group/index.js";
import * as Field from "$lib/registry/ui/field/index.js";
import * as RadioGroup from "$lib/registry/ui/radio-group/index.js";
import { Button } from "$lib/registry/ui/button/index.js";
import { Input } from "$lib/registry/ui/input/index.js";
import { Switch } from "$lib/registry/ui/switch/index.js";

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!>`, 1);
var root_2 = $.from_html(`<!> <!> <!> <!> <!>`, 1);

export default function Appearance_settings($$anchor) {
	let gpuCount = $.state(8);

	function handleGpuCountChange(event) {
		const target = event.target;
		let inputValue = target.value;
		const previousValue = $.get(gpuCount).toString();

		// Remove any non-numeric characters
		let cleanedValue = inputValue.replace(/[^0-9]/g, "");

		// Prevent deletion of a single digit
		if (cleanedValue === "" && previousValue.length === 1) {
			target.value = previousValue;

			return;
		}

		// Handle input cases
		if (cleanedValue !== "") {
			const numValue = parseInt(cleanedValue, 10);

			// If we already have 2 digits and user is trying to type more, keep the original value
			if (previousValue.length === 2 && cleanedValue !== previousValue && cleanedValue.length === 3) {
				target.value = previousValue;

				return;
			}

			// Ensure value is within valid range (1-99)
			if (numValue < 1) {
				cleanedValue = "1";
			} else if (numValue > 99) {
				cleanedValue = "99";
			}

			// Update both the input value and the state
			target.value = cleanedValue;

			$.set(gpuCount, parseInt(cleanedValue, 10), true);
		}
	}

	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => Field.Set, ($$anchor, Field_Set) => {
		Field_Set($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = $.comment();
				var node_1 = $.first_child(fragment_1);

				$.component(node_1, () => Field.Group, ($$anchor, Field_Group) => {
					Field_Group($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_2 = root_2();
							var node_2 = $.first_child(fragment_2);

							$.component(node_2, () => Field.Set, ($$anchor, Field_Set_1) => {
								Field_Set_1($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_3 = root_1();
										var node_3 = $.first_child(fragment_3);

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
													var fragment_4 = root();
													var node_6 = $.first_child(fragment_4);

													$.component(node_6, () => Field.Label, ($$anchor, Field_Label) => {
														Field_Label($$anchor, {
															for: 'kubernetes-r2h',
															children: ($$anchor, $$slotProps) => {
																var fragment_5 = $.comment();
																var node_7 = $.first_child(fragment_5);

																$.component(node_7, () => Field.Field, ($$anchor, Field_Field) => {
																	Field_Field($$anchor, {
																		orientation: 'horizontal',
																		children: ($$anchor, $$slotProps) => {
																			var fragment_6 = root();
																			var node_8 = $.first_child(fragment_6);

																			$.component(node_8, () => Field.Content, ($$anchor, Field_Content) => {
																				Field_Content($$anchor, {
																					children: ($$anchor, $$slotProps) => {
																						var fragment_7 = root();
																						var node_9 = $.first_child(fragment_7);

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

																						$.append($$anchor, fragment_7);
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

													var node_12 = $.sibling(node_6, 2);

													$.component(node_12, () => Field.Label, ($$anchor, Field_Label_1) => {
														Field_Label_1($$anchor, {
															for: 'vm-z4k',
															children: ($$anchor, $$slotProps) => {
																var fragment_8 = $.comment();
																var node_13 = $.first_child(fragment_8);

																$.component(node_13, () => Field.Field, ($$anchor, Field_Field_1) => {
																	Field_Field_1($$anchor, {
																		orientation: 'horizontal',
																		children: ($$anchor, $$slotProps) => {
																			var fragment_9 = root();
																			var node_14 = $.first_child(fragment_9);

																			$.component(node_14, () => Field.Content, ($$anchor, Field_Content_1) => {
																				Field_Content_1($$anchor, {
																					children: ($$anchor, $$slotProps) => {
																						var fragment_10 = root();
																						var node_15 = $.first_child(fragment_10);

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

																						$.append($$anchor, fragment_10);
																					},
																					$$slots: { default: true }
																				});
																			});

																			var node_17 = $.sibling(node_14, 2);

																			$.component(node_17, () => RadioGroup.Item, ($$anchor, RadioGroup_Item_1) => {
																				RadioGroup_Item_1($$anchor, { value: 'vm', id: 'vm-z4k', 'aria-label': 'Virtual Machine' });
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

							var node_18 = $.sibling(node_2, 2);

							$.component(node_18, () => Field.Separator, ($$anchor, Field_Separator) => {
								Field_Separator($$anchor, {});
							});

							var node_19 = $.sibling(node_18, 2);

							$.component(node_19, () => Field.Field, ($$anchor, Field_Field_2) => {
								Field_Field_2($$anchor, {
									orientation: 'horizontal',
									children: ($$anchor, $$slotProps) => {
										var fragment_11 = root();
										var node_20 = $.first_child(fragment_11);

										$.component(node_20, () => Field.Content, ($$anchor, Field_Content_2) => {
											Field_Content_2($$anchor, {
												children: ($$anchor, $$slotProps) => {
													var fragment_12 = root();
													var node_21 = $.first_child(fragment_12);

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

													$.append($$anchor, fragment_12);
												},
												$$slots: { default: true }
											});
										});

										var node_23 = $.sibling(node_20, 2);

										$.component(node_23, () => ButtonGroup.Root, ($$anchor, ButtonGroup_Root) => {
											ButtonGroup_Root($$anchor, {
												children: ($$anchor, $$slotProps) => {
													var fragment_13 = root_1();
													var node_24 = $.first_child(fragment_13);

													Input(node_24, {
														id: 'number-of-gpus-f6l',
														size: 3,
														class: 'font-mono style-vega:h-8 style-nova:h-7 style-lyra:h-7 style-maia:h-8 style-mira:h-6 style-luma:h-8 style-sera:h-9',
														maxlength: 3,
														oninput: handleGpuCountChange,
														type: 'text',
														inputmode: 'numeric',
														pattern: '[0-9]*',
														get value() {
															return $.get(gpuCount);
														},

														set value($$value) {
															$.set(gpuCount, $$value, true);
														}
													});

													var node_25 = $.sibling(node_24, 2);

													{
														let $0 = $.derived(() => $.get(gpuCount) <= 1);

														Button(node_25, {
															onclick: () => $.update(gpuCount, -1),
															variant: 'outline',
															size: 'icon-sm',
															type: 'button',
															'aria-label': 'Decrement',
															get disabled() {
																return $.get($0);
															},

															children: ($$anchor, $$slotProps) => {
																MinusIcon($$anchor, {});
															},
															$$slots: { default: true }
														});
													}

													var node_26 = $.sibling(node_25, 2);

													{
														let $0 = $.derived(() => $.get(gpuCount) >= 99);

														Button(node_26, {
															onclick: () => $.update(gpuCount),
															variant: 'outline',
															size: 'icon-sm',
															type: 'button',
															'aria-label': 'Increment',
															get disabled() {
																return $.get($0);
															},

															children: ($$anchor, $$slotProps) => {
																PlusIcon($$anchor, {});
															},
															$$slots: { default: true }
														});
													}

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

							var node_27 = $.sibling(node_19, 2);

							$.component(node_27, () => Field.Separator, ($$anchor, Field_Separator_1) => {
								Field_Separator_1($$anchor, {});
							});

							var node_28 = $.sibling(node_27, 2);

							$.component(node_28, () => Field.Field, ($$anchor, Field_Field_3) => {
								Field_Field_3($$anchor, {
									orientation: 'horizontal',
									children: ($$anchor, $$slotProps) => {
										var fragment_16 = root();
										var node_29 = $.first_child(fragment_16);

										$.component(node_29, () => Field.Content, ($$anchor, Field_Content_3) => {
											Field_Content_3($$anchor, {
												children: ($$anchor, $$slotProps) => {
													var fragment_17 = root();
													var node_30 = $.first_child(fragment_17);

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

													$.append($$anchor, fragment_17);
												},
												$$slots: { default: true }
											});
										});

										var node_32 = $.sibling(node_29, 2);

										Switch(node_32, { id: 'tinting', checked: true });
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
	});

	$.append($$anchor, fragment);
}