import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as Field from "$lib/registry/ui/field/index.js";
import * as RadioGroup from "$lib/registry/ui/radio-group/index.js";

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!>`, 1);
var root_2 = $.from_html(`<div class="w-full max-w-md"><!></div>`);

export default function Field_choice_card($$anchor) {
	let computeEnvironment = $.state("kubernetes");
	var div = root_2();
	var node = $.child(div);

	$.component(node, () => Field.Group, ($$anchor, Field_Group) => {
		Field_Group($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var fragment = $.comment();
				var node_1 = $.first_child(fragment);

				$.component(node_1, () => Field.Set, ($$anchor, Field_Set) => {
					Field_Set($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_1 = root_1();
							var node_2 = $.first_child(fragment_1);

							$.component(node_2, () => Field.Label, ($$anchor, Field_Label) => {
								Field_Label($$anchor, {
									for: 'compute-environment-p8w',
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text = $.text('Compute Environment');

										$.append($$anchor, text);
									},
									$$slots: { default: true }
								});
							});

							var node_3 = $.sibling(node_2, 2);

							$.component(node_3, () => Field.Description, ($$anchor, Field_Description) => {
								Field_Description($$anchor, {
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_1 = $.text('Select the compute environment for your cluster.');

										$.append($$anchor, text_1);
									},
									$$slots: { default: true }
								});
							});

							var node_4 = $.sibling(node_3, 2);

							$.component(node_4, () => RadioGroup.Root, ($$anchor, RadioGroup_Root) => {
								RadioGroup_Root($$anchor, {
									get value() {
										return $.get(computeEnvironment);
									},

									set value($$value) {
										$.set(computeEnvironment, $$value, true);
									},

									children: ($$anchor, $$slotProps) => {
										var fragment_2 = root();
										var node_5 = $.first_child(fragment_2);

										$.component(node_5, () => Field.Label, ($$anchor, Field_Label_1) => {
											Field_Label_1($$anchor, {
												for: 'kubernetes-r2h',
												children: ($$anchor, $$slotProps) => {
													var fragment_3 = $.comment();
													var node_6 = $.first_child(fragment_3);

													$.component(node_6, () => Field.Field, ($$anchor, Field_Field) => {
														Field_Field($$anchor, {
															orientation: 'horizontal',
															children: ($$anchor, $$slotProps) => {
																var fragment_4 = root();
																var node_7 = $.first_child(fragment_4);

																$.component(node_7, () => Field.Content, ($$anchor, Field_Content) => {
																	Field_Content($$anchor, {
																		children: ($$anchor, $$slotProps) => {
																			var fragment_5 = root();
																			var node_8 = $.first_child(fragment_5);

																			$.component(node_8, () => Field.Title, ($$anchor, Field_Title) => {
																				Field_Title($$anchor, {
																					children: ($$anchor, $$slotProps) => {
																						$.next();

																						var text_2 = $.text('Kubernetes');

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

																						var text_3 = $.text('Run GPU workloads on a K8s configured cluster.');

																						$.append($$anchor, text_3);
																					},
																					$$slots: { default: true }
																				});
																			});

																			$.append($$anchor, fragment_5);
																		},
																		$$slots: { default: true }
																	});
																});

																var node_10 = $.sibling(node_7, 2);

																$.component(node_10, () => RadioGroup.Item, ($$anchor, RadioGroup_Item) => {
																	RadioGroup_Item($$anchor, { value: 'kubernetes', id: 'kubernetes-r2h' });
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

										var node_11 = $.sibling(node_5, 2);

										$.component(node_11, () => Field.Label, ($$anchor, Field_Label_2) => {
											Field_Label_2($$anchor, {
												for: 'vm-z4k',
												children: ($$anchor, $$slotProps) => {
													var fragment_6 = $.comment();
													var node_12 = $.first_child(fragment_6);

													$.component(node_12, () => Field.Field, ($$anchor, Field_Field_1) => {
														Field_Field_1($$anchor, {
															orientation: 'horizontal',
															children: ($$anchor, $$slotProps) => {
																var fragment_7 = root();
																var node_13 = $.first_child(fragment_7);

																$.component(node_13, () => Field.Content, ($$anchor, Field_Content_1) => {
																	Field_Content_1($$anchor, {
																		children: ($$anchor, $$slotProps) => {
																			var fragment_8 = root();
																			var node_14 = $.first_child(fragment_8);

																			$.component(node_14, () => Field.Title, ($$anchor, Field_Title_1) => {
																				Field_Title_1($$anchor, {
																					children: ($$anchor, $$slotProps) => {
																						$.next();

																						var text_4 = $.text('Virtual Machine');

																						$.append($$anchor, text_4);
																					},
																					$$slots: { default: true }
																				});
																			});

																			var node_15 = $.sibling(node_14, 2);

																			$.component(node_15, () => Field.Description, ($$anchor, Field_Description_2) => {
																				Field_Description_2($$anchor, {
																					children: ($$anchor, $$slotProps) => {
																						$.next();

																						var text_5 = $.text('Access a VM configured cluster to run GPU workloads.');

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

																var node_16 = $.sibling(node_13, 2);

																$.component(node_16, () => RadioGroup.Item, ($$anchor, RadioGroup_Item_1) => {
																	RadioGroup_Item_1($$anchor, { value: 'vm', id: 'vm-z4k' });
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
			},
			$$slots: { default: true }
		});
	});

	$.reset(div);
	$.append($$anchor, div);
}