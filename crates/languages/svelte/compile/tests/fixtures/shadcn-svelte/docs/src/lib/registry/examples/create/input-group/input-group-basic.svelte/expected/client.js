import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as Field from "$lib/registry/ui/field/index.js";
import * as InputGroup from "$lib/registry/ui/input-group/index.js";
import { Input } from "$lib/registry/ui/input/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!> <!>`, 1);

export default function Input_group_basic($$anchor) {
	Example($$anchor, {
		title: 'Basic',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = $.comment();
			var node = $.first_child(fragment_1);

			$.component(node, () => Field.Group, ($$anchor, Field_Group) => {
				Field_Group($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = root_1();
						var node_1 = $.first_child(fragment_2);

						$.component(node_1, () => Field.Field, ($$anchor, Field_Field) => {
							Field_Field($$anchor, {
								children: ($$anchor, $$slotProps) => {
									var fragment_3 = root();
									var node_2 = $.first_child(fragment_3);

									$.component(node_2, () => Field.Label, ($$anchor, Field_Label) => {
										Field_Label($$anchor, {
											for: 'input-default-01',
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text = $.text('Default (No Input Group)');

												$.append($$anchor, text);
											},
											$$slots: { default: true }
										});
									});

									var node_3 = $.sibling(node_2, 2);

									Input(node_3, { placeholder: 'Placeholder', id: 'input-default-01' });
									$.append($$anchor, fragment_3);
								},
								$$slots: { default: true }
							});
						});

						var node_4 = $.sibling(node_1, 2);

						$.component(node_4, () => Field.Field, ($$anchor, Field_Field_1) => {
							Field_Field_1($$anchor, {
								children: ($$anchor, $$slotProps) => {
									var fragment_4 = root();
									var node_5 = $.first_child(fragment_4);

									$.component(node_5, () => Field.Label, ($$anchor, Field_Label_1) => {
										Field_Label_1($$anchor, {
											for: 'input-group-02',
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_1 = $.text('Input Group');

												$.append($$anchor, text_1);
											},
											$$slots: { default: true }
										});
									});

									var node_6 = $.sibling(node_5, 2);

									$.component(node_6, () => InputGroup.Root, ($$anchor, InputGroup_Root) => {
										InputGroup_Root($$anchor, {
											children: ($$anchor, $$slotProps) => {
												var fragment_5 = $.comment();
												var node_7 = $.first_child(fragment_5);

												$.component(node_7, () => InputGroup.Input, ($$anchor, InputGroup_Input) => {
													InputGroup_Input($$anchor, { id: 'input-group-02', placeholder: 'Placeholder' });
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

						var node_8 = $.sibling(node_4, 2);

						$.component(node_8, () => Field.Field, ($$anchor, Field_Field_2) => {
							Field_Field_2($$anchor, {
								'data-disabled': 'true',
								children: ($$anchor, $$slotProps) => {
									var fragment_6 = root();
									var node_9 = $.first_child(fragment_6);

									$.component(node_9, () => Field.Label, ($$anchor, Field_Label_2) => {
										Field_Label_2($$anchor, {
											for: 'input-disabled-03',
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_2 = $.text('Disabled');

												$.append($$anchor, text_2);
											},
											$$slots: { default: true }
										});
									});

									var node_10 = $.sibling(node_9, 2);

									$.component(node_10, () => InputGroup.Root, ($$anchor, InputGroup_Root_1) => {
										InputGroup_Root_1($$anchor, {
											children: ($$anchor, $$slotProps) => {
												var fragment_7 = $.comment();
												var node_11 = $.first_child(fragment_7);

												$.component(node_11, () => InputGroup.Input, ($$anchor, InputGroup_Input_1) => {
													InputGroup_Input_1($$anchor, {
														id: 'input-disabled-03',
														placeholder: 'This field is disabled',
														disabled: true
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

						var node_12 = $.sibling(node_8, 2);

						$.component(node_12, () => Field.Field, ($$anchor, Field_Field_3) => {
							Field_Field_3($$anchor, {
								'data-invalid': 'true',
								children: ($$anchor, $$slotProps) => {
									var fragment_8 = root();
									var node_13 = $.first_child(fragment_8);

									$.component(node_13, () => Field.Label, ($$anchor, Field_Label_3) => {
										Field_Label_3($$anchor, {
											for: 'input-invalid-04',
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_3 = $.text('Invalid');

												$.append($$anchor, text_3);
											},
											$$slots: { default: true }
										});
									});

									var node_14 = $.sibling(node_13, 2);

									$.component(node_14, () => InputGroup.Root, ($$anchor, InputGroup_Root_2) => {
										InputGroup_Root_2($$anchor, {
											children: ($$anchor, $$slotProps) => {
												var fragment_9 = $.comment();
												var node_15 = $.first_child(fragment_9);

												$.component(node_15, () => InputGroup.Input, ($$anchor, InputGroup_Input_2) => {
													InputGroup_Input_2($$anchor, {
														id: 'input-invalid-04',
														placeholder: 'This field is invalid',
														'aria-invalid': 'true'
													});
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