import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as Field from "$lib/registry/ui/field/index.js";
import * as Textarea from "$lib/registry/ui/textarea/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!>`, 1);
var root_2 = $.from_html(`<!> <!> <!> <!> <!> <!>`, 1);

export default function Field_textarea_fields($$anchor) {
	Example($$anchor, {
		title: 'Textarea Fields',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = $.comment();
			var node = $.first_child(fragment_1);

			$.component(node, () => Field.Group, ($$anchor, Field_Group) => {
				Field_Group($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = root_2();
						var node_1 = $.first_child(fragment_2);

						$.component(node_1, () => Field.Field, ($$anchor, Field_Field) => {
							Field_Field($$anchor, {
								children: ($$anchor, $$slotProps) => {
									var fragment_3 = root();
									var node_2 = $.first_child(fragment_3);

									$.component(node_2, () => Field.Label, ($$anchor, Field_Label) => {
										Field_Label($$anchor, {
											for: 'textarea-basic',
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text = $.text('Basic Textarea');

												$.append($$anchor, text);
											},
											$$slots: { default: true }
										});
									});

									var node_3 = $.sibling(node_2, 2);

									$.component(node_3, () => Textarea.Root, ($$anchor, Textarea_Root) => {
										Textarea_Root($$anchor, { id: 'textarea-basic', placeholder: 'Enter your message' });
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
											for: 'textarea-comments',
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_1 = $.text('Comments');

												$.append($$anchor, text_1);
											},
											$$slots: { default: true }
										});
									});

									var node_6 = $.sibling(node_5, 2);

									$.component(node_6, () => Textarea.Root, ($$anchor, Textarea_Root_1) => {
										Textarea_Root_1($$anchor, {
											id: 'textarea-comments',
											placeholder: 'Share your thoughts...',
											class: 'min-h-[100px]'
										});
									});

									var node_7 = $.sibling(node_6, 2);

									$.component(node_7, () => Field.Description, ($$anchor, Field_Description) => {
										Field_Description($$anchor, {
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_2 = $.text('Maximum 500 characters allowed.');

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
											for: 'textarea-bio',
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_3 = $.text('Bio');

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

												var text_4 = $.text('Tell us about yourself in a few sentences.');

												$.append($$anchor, text_4);
											},
											$$slots: { default: true }
										});
									});

									var node_11 = $.sibling(node_10, 2);

									$.component(node_11, () => Textarea.Root, ($$anchor, Textarea_Root_2) => {
										Textarea_Root_2($$anchor, {
											id: 'textarea-bio',
											placeholder: 'I am a...',
											class: 'min-h-[120px]'
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
											for: 'textarea-desc-after',
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_5 = $.text('Message');

												$.append($$anchor, text_5);
											},
											$$slots: { default: true }
										});
									});

									var node_14 = $.sibling(node_13, 2);

									$.component(node_14, () => Textarea.Root, ($$anchor, Textarea_Root_3) => {
										Textarea_Root_3($$anchor, { id: 'textarea-desc-after', placeholder: 'Enter your message' });
									});

									var node_15 = $.sibling(node_14, 2);

									$.component(node_15, () => Field.Description, ($$anchor, Field_Description_2) => {
										Field_Description_2($$anchor, {
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_6 = $.text('Enter your message so it is long enough to test the layout.');

												$.append($$anchor, text_6);
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
								'data-invalid': true,
								children: ($$anchor, $$slotProps) => {
									var fragment_7 = root_1();
									var node_17 = $.first_child(fragment_7);

									$.component(node_17, () => Field.Label, ($$anchor, Field_Label_4) => {
										Field_Label_4($$anchor, {
											for: 'textarea-invalid',
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_7 = $.text('Invalid Textarea');

												$.append($$anchor, text_7);
											},
											$$slots: { default: true }
										});
									});

									var node_18 = $.sibling(node_17, 2);

									$.component(node_18, () => Textarea.Root, ($$anchor, Textarea_Root_4) => {
										Textarea_Root_4($$anchor, {
											id: 'textarea-invalid',
											placeholder: 'This field has an error',
											'aria-invalid': true
										});
									});

									var node_19 = $.sibling(node_18, 2);

									$.component(node_19, () => Field.Description, ($$anchor, Field_Description_3) => {
										Field_Description_3($$anchor, {
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_8 = $.text('This field contains validation errors.');

												$.append($$anchor, text_8);
											},
											$$slots: { default: true }
										});
									});

									$.append($$anchor, fragment_7);
								},
								$$slots: { default: true }
							});
						});

						var node_20 = $.sibling(node_16, 2);

						$.component(node_20, () => Field.Field, ($$anchor, Field_Field_5) => {
							Field_Field_5($$anchor, {
								'data-disabled': true,
								children: ($$anchor, $$slotProps) => {
									var fragment_8 = root_1();
									var node_21 = $.first_child(fragment_8);

									$.component(node_21, () => Field.Label, ($$anchor, Field_Label_5) => {
										Field_Label_5($$anchor, {
											for: 'textarea-disabled-field',
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_9 = $.text('Disabled Field');

												$.append($$anchor, text_9);
											},
											$$slots: { default: true }
										});
									});

									var node_22 = $.sibling(node_21, 2);

									$.component(node_22, () => Textarea.Root, ($$anchor, Textarea_Root_5) => {
										Textarea_Root_5($$anchor, {
											id: 'textarea-disabled-field',
											placeholder: 'Cannot edit',
											disabled: true
										});
									});

									var node_23 = $.sibling(node_22, 2);

									$.component(node_23, () => Field.Description, ($$anchor, Field_Description_4) => {
										Field_Description_4($$anchor, {
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_10 = $.text('This field is currently disabled.');

												$.append($$anchor, text_10);
											},
											$$slots: { default: true }
										});
									});

									$.append($$anchor, fragment_8);
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