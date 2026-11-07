import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as Field from "$lib/registry/ui/field/index.js";
import * as Select from "$lib/registry/ui/select/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!>`, 1);
var root_2 = $.from_html(`<div class="flex flex-col gap-4"><!> <!></div>`);

export default function Select_invalid($$anchor, $$props) {
	$.push($$props, true);

	const items = [
		{ label: "Apple", value: "apple" },
		{ label: "Banana", value: "banana" },
		{ label: "Blueberry", value: "blueberry" },
		{ label: "Grapes", value: "grapes" },
		{ label: "Pineapple", value: "pineapple" }
	];

	let selectedValue = $.state(undefined);
	let selectedValueInvalid = $.state(undefined);
	const selectedLabel = $.derived(() => items.find((item) => item.value === $.get(selectedValue))?.label ?? "Select a fruit");
	const selectedLabelInvalid = $.derived(() => items.find((item) => item.value === $.get(selectedValueInvalid))?.label ?? "Select a fruit");

	Example($$anchor, {
		title: 'Invalid',
		children: ($$anchor, $$slotProps) => {
			var div = root_2();
			var node = $.child(div);

			$.component(node, () => Select.Root, ($$anchor, Select_Root) => {
				Select_Root($$anchor, {
					type: 'single',
					get value() {
						return $.get(selectedValue);
					},

					set value($$value) {
						$.set(selectedValue, $$value, true);
					},

					children: ($$anchor, $$slotProps) => {
						var fragment_1 = root();
						var node_1 = $.first_child(fragment_1);

						$.component(node_1, () => Select.Trigger, ($$anchor, Select_Trigger) => {
							Select_Trigger($$anchor, {
								'aria-invalid': 'true',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text = $.text();

									$.template_effect(() => $.set_text(text, $.get(selectedLabel)));
									$.append($$anchor, text);
								},
								$$slots: { default: true }
							});
						});

						var node_2 = $.sibling(node_1, 2);

						$.component(node_2, () => Select.Content, ($$anchor, Select_Content) => {
							Select_Content($$anchor, {
								children: ($$anchor, $$slotProps) => {
									var fragment_3 = $.comment();
									var node_3 = $.first_child(fragment_3);

									$.component(node_3, () => Select.Group, ($$anchor, Select_Group) => {
										Select_Group($$anchor, {
											children: ($$anchor, $$slotProps) => {
												var fragment_4 = $.comment();
												var node_4 = $.first_child(fragment_4);

												$.each(node_4, 17, () => items, (item) => item.value, ($$anchor, item) => {
													var fragment_5 = $.comment();
													var node_5 = $.first_child(fragment_5);

													$.component(node_5, () => Select.Item, ($$anchor, Select_Item) => {
														Select_Item($$anchor, {
															get value() {
																return $.get(item).value;
															},

															children: ($$anchor, $$slotProps) => {
																$.next();

																var text_1 = $.text();

																$.template_effect(() => $.set_text(text_1, $.get(item).label));
																$.append($$anchor, text_1);
															},
															$$slots: { default: true }
														});
													});

													$.append($$anchor, fragment_5);
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

						$.append($$anchor, fragment_1);
					},
					$$slots: { default: true }
				});
			});

			var node_6 = $.sibling(node, 2);

			$.component(node_6, () => Field.Field, ($$anchor, Field_Field) => {
				Field_Field($$anchor, {
					'data-invalid': true,
					children: ($$anchor, $$slotProps) => {
						var fragment_7 = root_1();
						var node_7 = $.first_child(fragment_7);

						$.component(node_7, () => Field.Label, ($$anchor, Field_Label) => {
							Field_Label($$anchor, {
								for: 'select-fruit-invalid',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_2 = $.text('Favorite Fruit');

									$.append($$anchor, text_2);
								},
								$$slots: { default: true }
							});
						});

						var node_8 = $.sibling(node_7, 2);

						$.component(node_8, () => Select.Root, ($$anchor, Select_Root_1) => {
							Select_Root_1($$anchor, {
								type: 'single',
								get value() {
									return $.get(selectedValueInvalid);
								},

								set value($$value) {
									$.set(selectedValueInvalid, $$value, true);
								},

								children: ($$anchor, $$slotProps) => {
									var fragment_8 = root();
									var node_9 = $.first_child(fragment_8);

									$.component(node_9, () => Select.Trigger, ($$anchor, Select_Trigger_1) => {
										Select_Trigger_1($$anchor, {
											id: 'select-fruit-invalid',
											'aria-invalid': true,
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_3 = $.text();

												$.template_effect(() => $.set_text(text_3, $.get(selectedLabelInvalid)));
												$.append($$anchor, text_3);
											},
											$$slots: { default: true }
										});
									});

									var node_10 = $.sibling(node_9, 2);

									$.component(node_10, () => Select.Content, ($$anchor, Select_Content_1) => {
										Select_Content_1($$anchor, {
											children: ($$anchor, $$slotProps) => {
												var fragment_10 = $.comment();
												var node_11 = $.first_child(fragment_10);

												$.component(node_11, () => Select.Group, ($$anchor, Select_Group_1) => {
													Select_Group_1($$anchor, {
														children: ($$anchor, $$slotProps) => {
															var fragment_11 = $.comment();
															var node_12 = $.first_child(fragment_11);

															$.each(node_12, 17, () => items, (item) => item.value, ($$anchor, item) => {
																var fragment_12 = $.comment();
																var node_13 = $.first_child(fragment_12);

																$.component(node_13, () => Select.Item, ($$anchor, Select_Item_1) => {
																	Select_Item_1($$anchor, {
																		get value() {
																			return $.get(item).value;
																		},

																		children: ($$anchor, $$slotProps) => {
																			$.next();

																			var text_4 = $.text();

																			$.template_effect(() => $.set_text(text_4, $.get(item).label));
																			$.append($$anchor, text_4);
																		},
																		$$slots: { default: true }
																	});
																});

																$.append($$anchor, fragment_12);
															});

															$.append($$anchor, fragment_11);
														},
														$$slots: { default: true }
													});
												});

												$.append($$anchor, fragment_10);
											},
											$$slots: { default: true }
										});
									});

									$.append($$anchor, fragment_8);
								},
								$$slots: { default: true }
							});
						});

						var node_14 = $.sibling(node_8, 2);

						$.component(node_14, () => Field.Error, ($$anchor, Field_Error) => {
							Field_Error($$anchor, { errors: [{ message: "Please select a valid fruit." }] });
						});

						$.append($$anchor, fragment_7);
					},
					$$slots: { default: true }
				});
			});

			$.reset(div);
			$.append($$anchor, div);
		},
		$$slots: { default: true }
	});

	$.pop();
}