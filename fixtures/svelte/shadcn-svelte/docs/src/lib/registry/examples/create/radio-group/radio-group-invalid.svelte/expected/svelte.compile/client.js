import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as Field from "$lib/registry/ui/field/index.js";
import * as RadioGroup from "$lib/registry/ui/radio-group/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!>`, 1);

export default function Radio_group_invalid($$anchor) {
	Example($$anchor, {
		title: 'Invalid',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = $.comment();
			var node = $.first_child(fragment_1);

			$.component(node, () => Field.Set, ($$anchor, Field_Set) => {
				Field_Set($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = root_1();
						var node_1 = $.first_child(fragment_2);

						$.component(node_1, () => Field.Legend, ($$anchor, Field_Legend) => {
							Field_Legend($$anchor, {
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text = $.text('Notification Preferences');

									$.append($$anchor, text);
								},
								$$slots: { default: true }
							});
						});

						var node_2 = $.sibling(node_1, 2);

						$.component(node_2, () => Field.Description, ($$anchor, Field_Description) => {
							Field_Description($$anchor, {
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_1 = $.text('Choose how you want to receive notifications.');

									$.append($$anchor, text_1);
								},
								$$slots: { default: true }
							});
						});

						var node_3 = $.sibling(node_2, 2);

						$.component(node_3, () => RadioGroup.Root, ($$anchor, RadioGroup_Root) => {
							RadioGroup_Root($$anchor, {
								value: 'email',
								children: ($$anchor, $$slotProps) => {
									var fragment_3 = root_1();
									var node_4 = $.first_child(fragment_3);

									$.component(node_4, () => Field.Field, ($$anchor, Field_Field) => {
										Field_Field($$anchor, {
											orientation: 'horizontal',
											'data-invalid': true,
											children: ($$anchor, $$slotProps) => {
												var fragment_4 = root();
												var node_5 = $.first_child(fragment_4);

												$.component(node_5, () => RadioGroup.Item, ($$anchor, RadioGroup_Item) => {
													RadioGroup_Item($$anchor, { value: 'email', id: 'invalid-email', 'aria-invalid': true });
												});

												var node_6 = $.sibling(node_5, 2);

												$.component(node_6, () => Field.Label, ($$anchor, Field_Label) => {
													Field_Label($$anchor, {
														for: 'invalid-email',
														class: 'font-normal',
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_2 = $.text('Email only');

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

									var node_7 = $.sibling(node_4, 2);

									$.component(node_7, () => Field.Field, ($$anchor, Field_Field_1) => {
										Field_Field_1($$anchor, {
											orientation: 'horizontal',
											'data-invalid': true,
											children: ($$anchor, $$slotProps) => {
												var fragment_5 = root();
												var node_8 = $.first_child(fragment_5);

												$.component(node_8, () => RadioGroup.Item, ($$anchor, RadioGroup_Item_1) => {
													RadioGroup_Item_1($$anchor, { value: 'sms', id: 'invalid-sms', 'aria-invalid': true });
												});

												var node_9 = $.sibling(node_8, 2);

												$.component(node_9, () => Field.Label, ($$anchor, Field_Label_1) => {
													Field_Label_1($$anchor, {
														for: 'invalid-sms',
														class: 'font-normal',
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_3 = $.text('SMS only');

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

									$.component(node_10, () => Field.Field, ($$anchor, Field_Field_2) => {
										Field_Field_2($$anchor, {
											orientation: 'horizontal',
											'data-invalid': true,
											children: ($$anchor, $$slotProps) => {
												var fragment_6 = root();
												var node_11 = $.first_child(fragment_6);

												$.component(node_11, () => RadioGroup.Item, ($$anchor, RadioGroup_Item_2) => {
													RadioGroup_Item_2($$anchor, { value: 'both', id: 'invalid-both', 'aria-invalid': true });
												});

												var node_12 = $.sibling(node_11, 2);

												$.component(node_12, () => Field.Label, ($$anchor, Field_Label_2) => {
													Field_Label_2($$anchor, {
														for: 'invalid-both',
														class: 'font-normal',
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_4 = $.text('Both Email & SMS');

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