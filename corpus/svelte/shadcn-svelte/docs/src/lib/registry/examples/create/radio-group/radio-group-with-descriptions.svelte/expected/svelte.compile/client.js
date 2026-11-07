import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as Field from "$lib/registry/ui/field/index.js";
import * as RadioGroup from "$lib/registry/ui/radio-group/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

var root = $.from_html(`<div class="font-medium">Plus</div> <!>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);
var root_2 = $.from_html(`<div class="font-medium">Pro</div> <!>`, 1);
var root_3 = $.from_html(`<div class="font-medium">Enterprise</div> <!>`, 1);
var root_4 = $.from_html(`<!> <!> <!>`, 1);

export default function Radio_group_with_descriptions($$anchor) {
	Example($$anchor, {
		title: 'With Descriptions',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = $.comment();
			var node = $.first_child(fragment_1);

			$.component(node, () => RadioGroup.Root, ($$anchor, RadioGroup_Root) => {
				RadioGroup_Root($$anchor, {
					value: 'plus',
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = root_4();
						var node_1 = $.first_child(fragment_2);

						$.component(node_1, () => Field.Label, ($$anchor, Field_Label) => {
							Field_Label($$anchor, {
								for: 'plus-plan',
								children: ($$anchor, $$slotProps) => {
									var fragment_3 = $.comment();
									var node_2 = $.first_child(fragment_3);

									$.component(node_2, () => Field.Field, ($$anchor, Field_Field) => {
										Field_Field($$anchor, {
											orientation: 'horizontal',
											children: ($$anchor, $$slotProps) => {
												var fragment_4 = root_1();
												var node_3 = $.first_child(fragment_4);

												$.component(node_3, () => Field.Content, ($$anchor, Field_Content) => {
													Field_Content($$anchor, {
														children: ($$anchor, $$slotProps) => {
															var fragment_5 = root();
															var node_4 = $.sibling($.first_child(fragment_5), 2);

															$.component(node_4, () => Field.Description, ($$anchor, Field_Description) => {
																Field_Description($$anchor, {
																	children: ($$anchor, $$slotProps) => {
																		$.next();

																		var text = $.text('For individuals and small teams');

																		$.append($$anchor, text);
																	},
																	$$slots: { default: true }
																});
															});

															$.append($$anchor, fragment_5);
														},
														$$slots: { default: true }
													});
												});

												var node_5 = $.sibling(node_3, 2);

												$.component(node_5, () => RadioGroup.Item, ($$anchor, RadioGroup_Item) => {
													RadioGroup_Item($$anchor, { value: 'plus', id: 'plus-plan' });
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

						$.component(node_6, () => Field.Label, ($$anchor, Field_Label_1) => {
							Field_Label_1($$anchor, {
								for: 'pro-plan',
								children: ($$anchor, $$slotProps) => {
									var fragment_6 = $.comment();
									var node_7 = $.first_child(fragment_6);

									$.component(node_7, () => Field.Field, ($$anchor, Field_Field_1) => {
										Field_Field_1($$anchor, {
											orientation: 'horizontal',
											children: ($$anchor, $$slotProps) => {
												var fragment_7 = root_1();
												var node_8 = $.first_child(fragment_7);

												$.component(node_8, () => Field.Content, ($$anchor, Field_Content_1) => {
													Field_Content_1($$anchor, {
														children: ($$anchor, $$slotProps) => {
															var fragment_8 = root_2();
															var node_9 = $.sibling($.first_child(fragment_8), 2);

															$.component(node_9, () => Field.Description, ($$anchor, Field_Description_1) => {
																Field_Description_1($$anchor, {
																	children: ($$anchor, $$slotProps) => {
																		$.next();

																		var text_1 = $.text('For growing businesses');

																		$.append($$anchor, text_1);
																	},
																	$$slots: { default: true }
																});
															});

															$.append($$anchor, fragment_8);
														},
														$$slots: { default: true }
													});
												});

												var node_10 = $.sibling(node_8, 2);

												$.component(node_10, () => RadioGroup.Item, ($$anchor, RadioGroup_Item_1) => {
													RadioGroup_Item_1($$anchor, { value: 'pro', id: 'pro-plan' });
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

						$.component(node_11, () => Field.Label, ($$anchor, Field_Label_2) => {
							Field_Label_2($$anchor, {
								for: 'enterprise-plan',
								children: ($$anchor, $$slotProps) => {
									var fragment_9 = $.comment();
									var node_12 = $.first_child(fragment_9);

									$.component(node_12, () => Field.Field, ($$anchor, Field_Field_2) => {
										Field_Field_2($$anchor, {
											orientation: 'horizontal',
											children: ($$anchor, $$slotProps) => {
												var fragment_10 = root_1();
												var node_13 = $.first_child(fragment_10);

												$.component(node_13, () => Field.Content, ($$anchor, Field_Content_2) => {
													Field_Content_2($$anchor, {
														children: ($$anchor, $$slotProps) => {
															var fragment_11 = root_3();
															var node_14 = $.sibling($.first_child(fragment_11), 2);

															$.component(node_14, () => Field.Description, ($$anchor, Field_Description_2) => {
																Field_Description_2($$anchor, {
																	children: ($$anchor, $$slotProps) => {
																		$.next();

																		var text_2 = $.text('For large teams and enterprises');

																		$.append($$anchor, text_2);
																	},
																	$$slots: { default: true }
																});
															});

															$.append($$anchor, fragment_11);
														},
														$$slots: { default: true }
													});
												});

												var node_15 = $.sibling(node_13, 2);

												$.component(node_15, () => RadioGroup.Item, ($$anchor, RadioGroup_Item_2) => {
													RadioGroup_Item_2($$anchor, { value: 'enterprise', id: 'enterprise-plan' });
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