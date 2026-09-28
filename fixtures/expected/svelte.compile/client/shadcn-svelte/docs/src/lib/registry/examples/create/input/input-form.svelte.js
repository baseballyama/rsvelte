import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as Button from "$lib/registry/ui/button/index.js";
import * as Field from "$lib/registry/ui/field/index.js";
import * as Input from "$lib/registry/ui/input/index.js";
import * as Select from "$lib/registry/ui/select/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!>`, 1);
var root_2 = $.from_html(`<!> <!> <div class="grid grid-cols-2 gap-4"><!> <!></div> <!> <!>`, 1);
var root_3 = $.from_html(`<form class="w-full"><!></form>`);

export default function Input_form($$anchor, $$props) {
	$.push($$props, true);

	const countryItems = [
		{ label: "United States", value: "us" },
		{ label: "United Kingdom", value: "uk" },
		{ label: "Canada", value: "ca" }
	];

	let country = $.state($.proxy(countryItems[0].value));
	const countryLabel = $.derived(() => countryItems.find((item) => item.value === $.get(country))?.label ?? "United States");

	Example($$anchor, {
		title: 'Form',
		children: ($$anchor, $$slotProps) => {
			var form = root_3();
			var node = $.child(form);

			$.component(node, () => Field.Group, ($$anchor, Field_Group) => {
				Field_Group($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_1 = root_2();
						var node_1 = $.first_child(fragment_1);

						$.component(node_1, () => Field.Field, ($$anchor, Field_Field) => {
							Field_Field($$anchor, {
								children: ($$anchor, $$slotProps) => {
									var fragment_2 = root();
									var node_2 = $.first_child(fragment_2);

									$.component(node_2, () => Field.Label, ($$anchor, Field_Label) => {
										Field_Label($$anchor, {
											for: 'form-name',
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text = $.text('Name');

												$.append($$anchor, text);
											},
											$$slots: { default: true }
										});
									});

									var node_3 = $.sibling(node_2, 2);

									$.component(node_3, () => Input.Root, ($$anchor, Input_Root) => {
										Input_Root($$anchor, { id: 'form-name', type: 'text', placeholder: 'John Doe' });
									});

									$.append($$anchor, fragment_2);
								},
								$$slots: { default: true }
							});
						});

						var node_4 = $.sibling(node_1, 2);

						$.component(node_4, () => Field.Field, ($$anchor, Field_Field_1) => {
							Field_Field_1($$anchor, {
								children: ($$anchor, $$slotProps) => {
									var fragment_3 = root_1();
									var node_5 = $.first_child(fragment_3);

									$.component(node_5, () => Field.Label, ($$anchor, Field_Label_1) => {
										Field_Label_1($$anchor, {
											for: 'form-email',
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_1 = $.text('Email');

												$.append($$anchor, text_1);
											},
											$$slots: { default: true }
										});
									});

									var node_6 = $.sibling(node_5, 2);

									$.component(node_6, () => Input.Root, ($$anchor, Input_Root_1) => {
										Input_Root_1($$anchor, {
											id: 'form-email',
											type: 'email',
											placeholder: 'john@example.com'
										});
									});

									var node_7 = $.sibling(node_6, 2);

									$.component(node_7, () => Field.Description, ($$anchor, Field_Description) => {
										Field_Description($$anchor, {
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_2 = $.text('We\'ll never share your email with anyone.');

												$.append($$anchor, text_2);
											},
											$$slots: { default: true }
										});
									});

									$.append($$anchor, fragment_3);
								},
								$$slots: { default: true }
							});
						});

						var div = $.sibling(node_4, 2);
						var node_8 = $.child(div);

						$.component(node_8, () => Field.Field, ($$anchor, Field_Field_2) => {
							Field_Field_2($$anchor, {
								children: ($$anchor, $$slotProps) => {
									var fragment_4 = root();
									var node_9 = $.first_child(fragment_4);

									$.component(node_9, () => Field.Label, ($$anchor, Field_Label_2) => {
										Field_Label_2($$anchor, {
											for: 'form-phone',
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_3 = $.text('Phone');

												$.append($$anchor, text_3);
											},
											$$slots: { default: true }
										});
									});

									var node_10 = $.sibling(node_9, 2);

									$.component(node_10, () => Input.Root, ($$anchor, Input_Root_2) => {
										Input_Root_2($$anchor, {
											id: 'form-phone',
											type: 'tel',
											placeholder: '+1 (555) 123-4567'
										});
									});

									$.append($$anchor, fragment_4);
								},
								$$slots: { default: true }
							});
						});

						var node_11 = $.sibling(node_8, 2);

						$.component(node_11, () => Field.Field, ($$anchor, Field_Field_3) => {
							Field_Field_3($$anchor, {
								children: ($$anchor, $$slotProps) => {
									var fragment_5 = root();
									var node_12 = $.first_child(fragment_5);

									$.component(node_12, () => Field.Label, ($$anchor, Field_Label_3) => {
										Field_Label_3($$anchor, {
											for: 'form-country',
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_4 = $.text('Country');

												$.append($$anchor, text_4);
											},
											$$slots: { default: true }
										});
									});

									var node_13 = $.sibling(node_12, 2);

									$.component(node_13, () => Select.Root, ($$anchor, Select_Root) => {
										Select_Root($$anchor, {
											type: 'single',
											get value() {
												return $.get(country);
											},

											set value($$value) {
												$.set(country, $$value, true);
											},

											children: ($$anchor, $$slotProps) => {
												var fragment_6 = root();
												var node_14 = $.first_child(fragment_6);

												$.component(node_14, () => Select.Trigger, ($$anchor, Select_Trigger) => {
													Select_Trigger($$anchor, {
														id: 'form-country',
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_5 = $.text();

															$.template_effect(() => $.set_text(text_5, $.get(countryLabel)));
															$.append($$anchor, text_5);
														},
														$$slots: { default: true }
													});
												});

												var node_15 = $.sibling(node_14, 2);

												$.component(node_15, () => Select.Content, ($$anchor, Select_Content) => {
													Select_Content($$anchor, {
														children: ($$anchor, $$slotProps) => {
															var fragment_8 = root_1();
															var node_16 = $.first_child(fragment_8);

															$.component(node_16, () => Select.Item, ($$anchor, Select_Item) => {
																Select_Item($$anchor, {
																	value: 'us',
																	children: ($$anchor, $$slotProps) => {
																		$.next();

																		var text_6 = $.text('United States');

																		$.append($$anchor, text_6);
																	},
																	$$slots: { default: true }
																});
															});

															var node_17 = $.sibling(node_16, 2);

															$.component(node_17, () => Select.Item, ($$anchor, Select_Item_1) => {
																Select_Item_1($$anchor, {
																	value: 'uk',
																	children: ($$anchor, $$slotProps) => {
																		$.next();

																		var text_7 = $.text('United Kingdom');

																		$.append($$anchor, text_7);
																	},
																	$$slots: { default: true }
																});
															});

															var node_18 = $.sibling(node_17, 2);

															$.component(node_18, () => Select.Item, ($$anchor, Select_Item_2) => {
																Select_Item_2($$anchor, {
																	value: 'ca',
																	children: ($$anchor, $$slotProps) => {
																		$.next();

																		var text_8 = $.text('Canada');

																		$.append($$anchor, text_8);
																	},
																	$$slots: { default: true }
																});
															});

															$.append($$anchor, fragment_8);
														},
														$$slots: { default: true }
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

						$.reset(div);

						var node_19 = $.sibling(div, 2);

						$.component(node_19, () => Field.Field, ($$anchor, Field_Field_4) => {
							Field_Field_4($$anchor, {
								children: ($$anchor, $$slotProps) => {
									var fragment_9 = root();
									var node_20 = $.first_child(fragment_9);

									$.component(node_20, () => Field.Label, ($$anchor, Field_Label_4) => {
										Field_Label_4($$anchor, {
											for: 'form-address',
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_9 = $.text('Address');

												$.append($$anchor, text_9);
											},
											$$slots: { default: true }
										});
									});

									var node_21 = $.sibling(node_20, 2);

									$.component(node_21, () => Input.Root, ($$anchor, Input_Root_3) => {
										Input_Root_3($$anchor, { id: 'form-address', type: 'text', placeholder: '123 Main St' });
									});

									$.append($$anchor, fragment_9);
								},
								$$slots: { default: true }
							});
						});

						var node_22 = $.sibling(node_19, 2);

						$.component(node_22, () => Field.Field, ($$anchor, Field_Field_5) => {
							Field_Field_5($$anchor, {
								orientation: 'horizontal',
								children: ($$anchor, $$slotProps) => {
									var fragment_10 = root();
									var node_23 = $.first_child(fragment_10);

									$.component(node_23, () => Button.Root, ($$anchor, Button_Root) => {
										Button_Root($$anchor, {
											type: 'button',
											variant: 'outline',
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_10 = $.text('Cancel');

												$.append($$anchor, text_10);
											},
											$$slots: { default: true }
										});
									});

									var node_24 = $.sibling(node_23, 2);

									$.component(node_24, () => Button.Root, ($$anchor, Button_Root_1) => {
										Button_Root_1($$anchor, {
											type: 'submit',
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_11 = $.text('Submit');

												$.append($$anchor, text_11);
											},
											$$slots: { default: true }
										});
									});

									$.append($$anchor, fragment_10);
								},
								$$slots: { default: true }
							});
						});

						$.append($$anchor, fragment_1);
					},
					$$slots: { default: true }
				});
			});

			$.reset(form);
			$.append($$anchor, form);
		},
		$$slots: { default: true }
	});

	$.pop();
}