import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as Field from "$lib/registry/ui/field/index.js";
import * as Input from "$lib/registry/ui/input/index.js";
import { Badge } from "$lib/registry/ui/badge/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!>`, 1);
var root_2 = $.from_html(`Required Field <span class="text-destructive">*</span>`, 1);
var root_3 = $.from_html(`Input with Badge <!>`, 1);
var root_4 = $.from_html(`<!> <!> <!> <!> <!> <!> <!> <!>`, 1);

export default function Field_input_fields($$anchor) {
	Example($$anchor, {
		title: 'Input Fields',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = $.comment();
			var node = $.first_child(fragment_1);

			$.component(node, () => Field.Group, ($$anchor, Field_Group) => {
				Field_Group($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = root_4();
						var node_1 = $.first_child(fragment_2);

						$.component(node_1, () => Field.Field, ($$anchor, Field_Field) => {
							Field_Field($$anchor, {
								children: ($$anchor, $$slotProps) => {
									var fragment_3 = root();
									var node_2 = $.first_child(fragment_3);

									$.component(node_2, () => Field.Label, ($$anchor, Field_Label) => {
										Field_Label($$anchor, {
											for: 'input-basic',
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text = $.text('Basic Input');

												$.append($$anchor, text);
											},
											$$slots: { default: true }
										});
									});

									var node_3 = $.sibling(node_2, 2);

									$.component(node_3, () => Input.Root, ($$anchor, Input_Root) => {
										Input_Root($$anchor, { id: 'input-basic', placeholder: 'Enter text' });
									});

									$.append($$anchor, fragment_3);
								},
								$$slots: { default: true }
							});
						});

						var node_4 = $.sibling(node_1, 2);

						$.component(node_4, () => Field.Field, ($$anchor, Field_Field_1) => {
							Field_Field_1($$anchor, {
								children: ($$anchor, $$slotProps) => {
									var fragment_4 = root_1();
									var node_5 = $.first_child(fragment_4);

									$.component(node_5, () => Field.Label, ($$anchor, Field_Label_1) => {
										Field_Label_1($$anchor, {
											for: 'input-with-desc',
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_1 = $.text('Input with Description');

												$.append($$anchor, text_1);
											},
											$$slots: { default: true }
										});
									});

									var node_6 = $.sibling(node_5, 2);

									$.component(node_6, () => Input.Root, ($$anchor, Input_Root_1) => {
										Input_Root_1($$anchor, { id: 'input-with-desc', placeholder: 'Enter your username' });
									});

									var node_7 = $.sibling(node_6, 2);

									$.component(node_7, () => Field.Description, ($$anchor, Field_Description) => {
										Field_Description($$anchor, {
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_2 = $.text('Choose a unique username for your account.');

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

						var node_8 = $.sibling(node_4, 2);

						$.component(node_8, () => Field.Field, ($$anchor, Field_Field_2) => {
							Field_Field_2($$anchor, {
								children: ($$anchor, $$slotProps) => {
									var fragment_5 = root_1();
									var node_9 = $.first_child(fragment_5);

									$.component(node_9, () => Field.Label, ($$anchor, Field_Label_2) => {
										Field_Label_2($$anchor, {
											for: 'input-desc-first',
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_3 = $.text('Email Address');

												$.append($$anchor, text_3);
											},
											$$slots: { default: true }
										});
									});

									var node_10 = $.sibling(node_9, 2);

									$.component(node_10, () => Field.Description, ($$anchor, Field_Description_1) => {
										Field_Description_1($$anchor, {
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_4 = $.text('We\'ll never share your email with anyone.');

												$.append($$anchor, text_4);
											},
											$$slots: { default: true }
										});
									});

									var node_11 = $.sibling(node_10, 2);

									$.component(node_11, () => Input.Root, ($$anchor, Input_Root_2) => {
										Input_Root_2($$anchor, {
											id: 'input-desc-first',
											type: 'email',
											placeholder: 'email@example.com'
										});
									});

									$.append($$anchor, fragment_5);
								},
								$$slots: { default: true }
							});
						});

						var node_12 = $.sibling(node_8, 2);

						$.component(node_12, () => Field.Field, ($$anchor, Field_Field_3) => {
							Field_Field_3($$anchor, {
								children: ($$anchor, $$slotProps) => {
									var fragment_6 = root_1();
									var node_13 = $.first_child(fragment_6);

									$.component(node_13, () => Field.Label, ($$anchor, Field_Label_3) => {
										Field_Label_3($$anchor, {
											for: 'input-required',
											children: ($$anchor, $$slotProps) => {
												$.next();

												var fragment_7 = root_2();

												$.next();
												$.append($$anchor, fragment_7);
											},
											$$slots: { default: true }
										});
									});

									var node_14 = $.sibling(node_13, 2);

									$.component(node_14, () => Input.Root, ($$anchor, Input_Root_3) => {
										Input_Root_3($$anchor, {
											id: 'input-required',
											placeholder: 'This field is required',
											required: true
										});
									});

									var node_15 = $.sibling(node_14, 2);

									$.component(node_15, () => Field.Description, ($$anchor, Field_Description_2) => {
										Field_Description_2($$anchor, {
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_5 = $.text('This field must be filled out.');

												$.append($$anchor, text_5);
											},
											$$slots: { default: true }
										});
									});

									$.append($$anchor, fragment_6);
								},
								$$slots: { default: true }
							});
						});

						var node_16 = $.sibling(node_12, 2);

						$.component(node_16, () => Field.Field, ($$anchor, Field_Field_4) => {
							Field_Field_4($$anchor, {
								children: ($$anchor, $$slotProps) => {
									var fragment_8 = root_1();
									var node_17 = $.first_child(fragment_8);

									$.component(node_17, () => Field.Label, ($$anchor, Field_Label_4) => {
										Field_Label_4($$anchor, {
											for: 'input-disabled',
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_6 = $.text('Disabled Input');

												$.append($$anchor, text_6);
											},
											$$slots: { default: true }
										});
									});

									var node_18 = $.sibling(node_17, 2);

									$.component(node_18, () => Input.Root, ($$anchor, Input_Root_4) => {
										Input_Root_4($$anchor, {
											id: 'input-disabled',
											placeholder: 'Cannot edit',
											disabled: true
										});
									});

									var node_19 = $.sibling(node_18, 2);

									$.component(node_19, () => Field.Description, ($$anchor, Field_Description_3) => {
										Field_Description_3($$anchor, {
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_7 = $.text('This field is currently disabled.');

												$.append($$anchor, text_7);
											},
											$$slots: { default: true }
										});
									});

									$.append($$anchor, fragment_8);
								},
								$$slots: { default: true }
							});
						});

						var node_20 = $.sibling(node_16, 2);

						$.component(node_20, () => Field.Field, ($$anchor, Field_Field_5) => {
							Field_Field_5($$anchor, {
								children: ($$anchor, $$slotProps) => {
									var fragment_9 = root();
									var node_21 = $.first_child(fragment_9);

									$.component(node_21, () => Field.Label, ($$anchor, Field_Label_5) => {
										Field_Label_5($$anchor, {
											for: 'input-badge',
											children: ($$anchor, $$slotProps) => {
												$.next();

												var fragment_10 = root_3();
												var node_22 = $.sibling($.first_child(fragment_10));

												Badge(node_22, {
													variant: 'secondary',
													class: 'ml-auto',
													children: ($$anchor, $$slotProps) => {
														$.next();

														var text_8 = $.text('Recommended');

														$.append($$anchor, text_8);
													},
													$$slots: { default: true }
												});

												$.append($$anchor, fragment_10);
											},
											$$slots: { default: true }
										});
									});

									var node_23 = $.sibling(node_21, 2);

									$.component(node_23, () => Input.Root, ($$anchor, Input_Root_5) => {
										Input_Root_5($$anchor, { id: 'input-badge', placeholder: 'Enter value' });
									});

									$.append($$anchor, fragment_9);
								},
								$$slots: { default: true }
							});
						});

						var node_24 = $.sibling(node_20, 2);

						$.component(node_24, () => Field.Field, ($$anchor, Field_Field_6) => {
							Field_Field_6($$anchor, {
								'data-invalid': true,
								children: ($$anchor, $$slotProps) => {
									var fragment_11 = root_1();
									var node_25 = $.first_child(fragment_11);

									$.component(node_25, () => Field.Label, ($$anchor, Field_Label_6) => {
										Field_Label_6($$anchor, {
											for: 'input-invalid',
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_9 = $.text('Invalid Input');

												$.append($$anchor, text_9);
											},
											$$slots: { default: true }
										});
									});

									var node_26 = $.sibling(node_25, 2);

									$.component(node_26, () => Input.Root, ($$anchor, Input_Root_6) => {
										Input_Root_6($$anchor, {
											id: 'input-invalid',
											placeholder: 'This field has an error',
											'aria-invalid': true
										});
									});

									var node_27 = $.sibling(node_26, 2);

									$.component(node_27, () => Field.Description, ($$anchor, Field_Description_4) => {
										Field_Description_4($$anchor, {
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_10 = $.text('This field contains validation errors.');

												$.append($$anchor, text_10);
											},
											$$slots: { default: true }
										});
									});

									$.append($$anchor, fragment_11);
								},
								$$slots: { default: true }
							});
						});

						var node_28 = $.sibling(node_24, 2);

						$.component(node_28, () => Field.Field, ($$anchor, Field_Field_7) => {
							Field_Field_7($$anchor, {
								'data-disabled': true,
								children: ($$anchor, $$slotProps) => {
									var fragment_12 = root_1();
									var node_29 = $.first_child(fragment_12);

									$.component(node_29, () => Field.Label, ($$anchor, Field_Label_7) => {
										Field_Label_7($$anchor, {
											for: 'input-disabled-field',
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_11 = $.text('Disabled Field');

												$.append($$anchor, text_11);
											},
											$$slots: { default: true }
										});
									});

									var node_30 = $.sibling(node_29, 2);

									$.component(node_30, () => Input.Root, ($$anchor, Input_Root_7) => {
										Input_Root_7($$anchor, {
											id: 'input-disabled-field',
											placeholder: 'Cannot edit',
											disabled: true
										});
									});

									var node_31 = $.sibling(node_30, 2);

									$.component(node_31, () => Field.Description, ($$anchor, Field_Description_5) => {
										Field_Description_5($$anchor, {
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_12 = $.text('This field is currently disabled.');

												$.append($$anchor, text_12);
											},
											$$slots: { default: true }
										});
									});

									$.append($$anchor, fragment_12);
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