import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as Field from "$lib/registry/ui/field/index.js";
import * as Select from "$lib/registry/ui/select/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!>`, 1);

export default function Select_with_field($$anchor, $$props) {
	$.push($$props, true);

	const items = [
		{ label: "Apple", value: "apple" },
		{ label: "Banana", value: "banana" },
		{ label: "Blueberry", value: "blueberry" },
		{ label: "Grapes", value: "grapes" },
		{ label: "Pineapple", value: "pineapple" }
	];

	let selectedValue = $.state(undefined);
	const selectedLabel = $.derived(() => items.find((item) => item.value === $.get(selectedValue))?.label ?? "Select a fruit");

	Example($$anchor, {
		title: 'With Field',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = $.comment();
			var node = $.first_child(fragment_1);

			$.component(node, () => Field.Field, ($$anchor, Field_Field) => {
				Field_Field($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = root_1();
						var node_1 = $.first_child(fragment_2);

						$.component(node_1, () => Field.Label, ($$anchor, Field_Label) => {
							Field_Label($$anchor, {
								for: 'select-fruit',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text = $.text('Favorite Fruit');

									$.append($$anchor, text);
								},
								$$slots: { default: true }
							});
						});

						var node_2 = $.sibling(node_1, 2);

						$.component(node_2, () => Select.Root, ($$anchor, Select_Root) => {
							Select_Root($$anchor, {
								type: 'single',
								get value() {
									return $.get(selectedValue);
								},

								set value($$value) {
									$.set(selectedValue, $$value, true);
								},

								children: ($$anchor, $$slotProps) => {
									var fragment_3 = root();
									var node_3 = $.first_child(fragment_3);

									$.component(node_3, () => Select.Trigger, ($$anchor, Select_Trigger) => {
										Select_Trigger($$anchor, {
											id: 'select-fruit',
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_1 = $.text();

												$.template_effect(() => $.set_text(text_1, $.get(selectedLabel)));
												$.append($$anchor, text_1);
											},
											$$slots: { default: true }
										});
									});

									var node_4 = $.sibling(node_3, 2);

									$.component(node_4, () => Select.Content, ($$anchor, Select_Content) => {
										Select_Content($$anchor, {
											children: ($$anchor, $$slotProps) => {
												var fragment_5 = $.comment();
												var node_5 = $.first_child(fragment_5);

												$.component(node_5, () => Select.Group, ($$anchor, Select_Group) => {
													Select_Group($$anchor, {
														children: ($$anchor, $$slotProps) => {
															var fragment_6 = $.comment();
															var node_6 = $.first_child(fragment_6);

															$.each(node_6, 17, () => items, (item) => item.value, ($$anchor, item) => {
																var fragment_7 = $.comment();
																var node_7 = $.first_child(fragment_7);

																$.component(node_7, () => Select.Item, ($$anchor, Select_Item) => {
																	Select_Item($$anchor, {
																		get value() {
																			return $.get(item).value;
																		},

																		children: ($$anchor, $$slotProps) => {
																			$.next();

																			var text_2 = $.text();

																			$.template_effect(() => $.set_text(text_2, $.get(item).label));
																			$.append($$anchor, text_2);
																		},
																		$$slots: { default: true }
																	});
																});

																$.append($$anchor, fragment_7);
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

									$.append($$anchor, fragment_3);
								},
								$$slots: { default: true }
							});
						});

						var node_8 = $.sibling(node_2, 2);

						$.component(node_8, () => Field.Description, ($$anchor, Field_Description) => {
							Field_Description($$anchor, {
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_3 = $.text('Choose your favorite fruit from the list.');

									$.append($$anchor, text_3);
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

	$.pop();
}