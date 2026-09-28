import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as Checkbox from "$lib/registry/ui/checkbox/index.js";
import * as Field from "$lib/registry/ui/field/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

var root = $.from_html(`<!> <!>`, 1);

export default function Checkbox_with_title($$anchor) {
	Example($$anchor, {
		title: 'With Title',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = $.comment();
			var node = $.first_child(fragment_1);

			$.component(node, () => Field.Group, ($$anchor, Field_Group) => {
				Field_Group($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = root();
						var node_1 = $.first_child(fragment_2);

						$.component(node_1, () => Field.Label, ($$anchor, Field_Label) => {
							Field_Label($$anchor, {
								for: 'toggle-2',
								children: ($$anchor, $$slotProps) => {
									var fragment_3 = $.comment();
									var node_2 = $.first_child(fragment_3);

									$.component(node_2, () => Field.Field, ($$anchor, Field_Field) => {
										Field_Field($$anchor, {
											orientation: 'horizontal',
											children: ($$anchor, $$slotProps) => {
												var fragment_4 = root();
												var node_3 = $.first_child(fragment_4);

												$.component(node_3, () => Checkbox.Root, ($$anchor, Checkbox_Root) => {
													Checkbox_Root($$anchor, { id: 'toggle-2', checked: true });
												});

												var node_4 = $.sibling(node_3, 2);

												$.component(node_4, () => Field.Content, ($$anchor, Field_Content) => {
													Field_Content($$anchor, {
														children: ($$anchor, $$slotProps) => {
															var fragment_5 = root();
															var node_5 = $.first_child(fragment_5);

															$.component(node_5, () => Field.Title, ($$anchor, Field_Title) => {
																Field_Title($$anchor, {
																	children: ($$anchor, $$slotProps) => {
																		$.next();

																		var text = $.text('Enable notifications');

																		$.append($$anchor, text);
																	},
																	$$slots: { default: true }
																});
															});

															var node_6 = $.sibling(node_5, 2);

															$.component(node_6, () => Field.Description, ($$anchor, Field_Description) => {
																Field_Description($$anchor, {
																	children: ($$anchor, $$slotProps) => {
																		$.next();

																		var text_1 = $.text('You can enable or disable notifications at any time.');

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

									$.append($$anchor, fragment_3);
								},
								$$slots: { default: true }
							});
						});

						var node_7 = $.sibling(node_1, 2);

						$.component(node_7, () => Field.Label, ($$anchor, Field_Label_1) => {
							Field_Label_1($$anchor, {
								for: 'toggle-4',
								children: ($$anchor, $$slotProps) => {
									var fragment_6 = $.comment();
									var node_8 = $.first_child(fragment_6);

									$.component(node_8, () => Field.Field, ($$anchor, Field_Field_1) => {
										Field_Field_1($$anchor, {
											orientation: 'horizontal',
											'data-disabled': true,
											children: ($$anchor, $$slotProps) => {
												var fragment_7 = root();
												var node_9 = $.first_child(fragment_7);

												$.component(node_9, () => Checkbox.Root, ($$anchor, Checkbox_Root_1) => {
													Checkbox_Root_1($$anchor, { id: 'toggle-4', disabled: true });
												});

												var node_10 = $.sibling(node_9, 2);

												$.component(node_10, () => Field.Content, ($$anchor, Field_Content_1) => {
													Field_Content_1($$anchor, {
														children: ($$anchor, $$slotProps) => {
															var fragment_8 = root();
															var node_11 = $.first_child(fragment_8);

															$.component(node_11, () => Field.Title, ($$anchor, Field_Title_1) => {
																Field_Title_1($$anchor, {
																	children: ($$anchor, $$slotProps) => {
																		$.next();

																		var text_2 = $.text('Enable notifications');

																		$.append($$anchor, text_2);
																	},
																	$$slots: { default: true }
																});
															});

															var node_12 = $.sibling(node_11, 2);

															$.component(node_12, () => Field.Description, ($$anchor, Field_Description_1) => {
																Field_Description_1($$anchor, {
																	children: ($$anchor, $$slotProps) => {
																		$.next();

																		var text_3 = $.text('You can enable or disable notifications at any time.');

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
}