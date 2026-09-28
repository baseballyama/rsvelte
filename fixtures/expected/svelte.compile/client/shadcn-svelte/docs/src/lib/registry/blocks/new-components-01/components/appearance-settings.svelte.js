import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import CheckIcon from "@lucide/svelte/icons/check";
import MinusIcon from "@tabler/icons-svelte/icons/minus";
import PlusIcon from "@tabler/icons-svelte/icons/plus";
import * as ButtonGroup from "$lib/registry/ui/button-group/index.js";
import * as Field from "$lib/registry/ui/field/index.js";
import * as RadioGroup from "$lib/registry/ui/radio-group/index.js";
import { Button } from "$lib/registry/ui/button/index.js";
import { Input } from "$lib/registry/ui/input/index.js";
import { Label } from "$lib/registry/ui/label/index.js";
import { Switch } from "$lib/registry/ui/switch/index.js";

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!>`, 1);
var root_2 = $.from_html(`<!> <!> <!> <!> <!> <!> <!>`, 1);

export default function Appearance_settings($$anchor) {
	const accents = [
		{ name: "Blue", value: "blue" },
		{ name: "Amber", value: "amber" },
		{ name: "Green", value: "green" },
		{ name: "Rose", value: "rose" }
	];

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
																				RadioGroup_Item($$anchor, { value: 'kubernetes', id: 'kubernetes-r2h' });
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
																				RadioGroup_Item_1($$anchor, { value: 'vm', id: 'vm-z4k' });
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

													$.component(node_21, () => Field.Title, ($$anchor, Field_Title_2) => {
														Field_Title_2($$anchor, {
															children: ($$anchor, $$slotProps) => {
																$.next();

																var text_6 = $.text('Accent');

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

																var text_7 = $.text('Select the accent color to use.');

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

										$.component(node_23, () => Field.Set, ($$anchor, Field_Set_2) => {
											Field_Set_2($$anchor, {
												'aria-label': 'Accent',
												children: ($$anchor, $$slotProps) => {
													var fragment_13 = $.comment();
													var node_24 = $.first_child(fragment_13);

													$.component(node_24, () => RadioGroup.Root, ($$anchor, RadioGroup_Root_1) => {
														RadioGroup_Root_1($$anchor, {
															class: 'flex flex-wrap gap-2',
															value: 'blue',
															children: ($$anchor, $$slotProps) => {
																var fragment_14 = $.comment();
																var node_25 = $.first_child(fragment_14);

																$.each(node_25, 17, () => accents, (accent) => accent.value, ($$anchor, accent) => {
																	Label($$anchor, {
																		get for() {
																			return $.get(accent).value;
																		},

																		get 'data-theme'() {
																			return $.get(accent).value;
																		},
																		class: 'flex size-6 items-center justify-center rounded-full data-[theme=amber]:bg-amber-600 data-[theme=blue]:bg-blue-700 data-[theme=green]:bg-green-600 data-[theme=rose]:bg-rose-600',
																		children: ($$anchor, $$slotProps) => {
																			var fragment_16 = root();
																			var node_26 = $.first_child(fragment_16);

																			$.component(node_26, () => RadioGroup.Item, ($$anchor, RadioGroup_Item_2) => {
																				RadioGroup_Item_2($$anchor, {
																					get id() {
																						return $.get(accent).value;
																					},

																					get value() {
																						return $.get(accent).value;
																					},

																					get 'aria-label'() {
																						return $.get(accent).name;
																					},
																					class: 'peer sr-only'
																				});
																			});

																			var node_27 = $.sibling(node_26, 2);

																			CheckIcon(node_27, {
																				class: 'hidden size-4 stroke-white peer-data-[state=checked]:block'
																			});

																			$.append($$anchor, fragment_16);
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

										$.append($$anchor, fragment_11);
									},
									$$slots: { default: true }
								});
							});

							var node_28 = $.sibling(node_19, 2);

							$.component(node_28, () => Field.Separator, ($$anchor, Field_Separator_1) => {
								Field_Separator_1($$anchor, {});
							});

							var node_29 = $.sibling(node_28, 2);

							$.component(node_29, () => Field.Field, ($$anchor, Field_Field_3) => {
								Field_Field_3($$anchor, {
									orientation: 'horizontal',
									children: ($$anchor, $$slotProps) => {
										var fragment_17 = root();
										var node_30 = $.first_child(fragment_17);

										$.component(node_30, () => Field.Content, ($$anchor, Field_Content_3) => {
											Field_Content_3($$anchor, {
												children: ($$anchor, $$slotProps) => {
													var fragment_18 = root();
													var node_31 = $.first_child(fragment_18);

													$.component(node_31, () => Field.Label, ($$anchor, Field_Label_2) => {
														Field_Label_2($$anchor, {
															for: 'number-of-gpus-f6l',
															children: ($$anchor, $$slotProps) => {
																$.next();

																var text_8 = $.text('Number of GPUs');

																$.append($$anchor, text_8);
															},
															$$slots: { default: true }
														});
													});

													var node_32 = $.sibling(node_31, 2);

													$.component(node_32, () => Field.Description, ($$anchor, Field_Description_4) => {
														Field_Description_4($$anchor, {
															children: ($$anchor, $$slotProps) => {
																$.next();

																var text_9 = $.text('You can add more later.');

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

										var node_33 = $.sibling(node_30, 2);

										$.component(node_33, () => ButtonGroup.Root, ($$anchor, ButtonGroup_Root) => {
											ButtonGroup_Root($$anchor, {
												children: ($$anchor, $$slotProps) => {
													var fragment_19 = root_1();
													var node_34 = $.first_child(fragment_19);

													Input(node_34, {
														id: 'number-of-gpus-f6l',
														placeholder: '8',
														size: 3,
														class: 'w-14! font-mono',
														maxlength: 3
													});

													var node_35 = $.sibling(node_34, 2);

													Button(node_35, {
														variant: 'outline',
														size: 'icon-sm',
														type: 'button',
														children: ($$anchor, $$slotProps) => {
															MinusIcon($$anchor, {});
														},
														$$slots: { default: true }
													});

													var node_36 = $.sibling(node_35, 2);

													Button(node_36, {
														variant: 'outline',
														size: 'icon-sm',
														type: 'button',
														children: ($$anchor, $$slotProps) => {
															PlusIcon($$anchor, {});
														},
														$$slots: { default: true }
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

							var node_37 = $.sibling(node_29, 2);

							$.component(node_37, () => Field.Separator, ($$anchor, Field_Separator_2) => {
								Field_Separator_2($$anchor, {});
							});

							var node_38 = $.sibling(node_37, 2);

							$.component(node_38, () => Field.Field, ($$anchor, Field_Field_4) => {
								Field_Field_4($$anchor, {
									orientation: 'horizontal',
									children: ($$anchor, $$slotProps) => {
										var fragment_22 = root();
										var node_39 = $.first_child(fragment_22);

										$.component(node_39, () => Field.Content, ($$anchor, Field_Content_4) => {
											Field_Content_4($$anchor, {
												children: ($$anchor, $$slotProps) => {
													var fragment_23 = root();
													var node_40 = $.first_child(fragment_23);

													$.component(node_40, () => Field.Label, ($$anchor, Field_Label_3) => {
														Field_Label_3($$anchor, {
															for: 'tinting',
															children: ($$anchor, $$slotProps) => {
																$.next();

																var text_10 = $.text('Wallpaper Tinting');

																$.append($$anchor, text_10);
															},
															$$slots: { default: true }
														});
													});

													var node_41 = $.sibling(node_40, 2);

													$.component(node_41, () => Field.Description, ($$anchor, Field_Description_5) => {
														Field_Description_5($$anchor, {
															children: ($$anchor, $$slotProps) => {
																$.next();

																var text_11 = $.text('Allow the wallpaper to be tinted.');

																$.append($$anchor, text_11);
															},
															$$slots: { default: true }
														});
													});

													$.append($$anchor, fragment_23);
												},
												$$slots: { default: true }
											});
										});

										var node_42 = $.sibling(node_39, 2);

										Switch(node_42, { id: 'tinting', checked: true });
										$.append($$anchor, fragment_22);
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