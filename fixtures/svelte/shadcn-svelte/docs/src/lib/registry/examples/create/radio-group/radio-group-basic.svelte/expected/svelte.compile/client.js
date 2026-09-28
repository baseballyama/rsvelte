import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as Field from "$lib/registry/ui/field/index.js";
import * as RadioGroup from "$lib/registry/ui/radio-group/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!>`, 1);

export default function Radio_group_basic($$anchor) {
	Example($$anchor, {
		title: 'Basic',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = $.comment();
			var node = $.first_child(fragment_1);

			$.component(node, () => RadioGroup.Root, ($$anchor, RadioGroup_Root) => {
				RadioGroup_Root($$anchor, {
					value: 'comfortable',
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = root_1();
						var node_1 = $.first_child(fragment_2);

						$.component(node_1, () => Field.Field, ($$anchor, Field_Field) => {
							Field_Field($$anchor, {
								orientation: 'horizontal',
								children: ($$anchor, $$slotProps) => {
									var fragment_3 = root();
									var node_2 = $.first_child(fragment_3);

									$.component(node_2, () => RadioGroup.Item, ($$anchor, RadioGroup_Item) => {
										RadioGroup_Item($$anchor, { value: 'default', id: 'r1' });
									});

									var node_3 = $.sibling(node_2, 2);

									$.component(node_3, () => Field.Label, ($$anchor, Field_Label) => {
										Field_Label($$anchor, {
											for: 'r1',
											class: 'font-normal',
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text = $.text('Default');

												$.append($$anchor, text);
											},
											$$slots: { default: true }
										});
									});

									$.append($$anchor, fragment_3);
								},
								$$slots: { default: true }
							});
						});

						var node_4 = $.sibling(node_1, 2);

						$.component(node_4, () => Field.Field, ($$anchor, Field_Field_1) => {
							Field_Field_1($$anchor, {
								orientation: 'horizontal',
								children: ($$anchor, $$slotProps) => {
									var fragment_4 = root();
									var node_5 = $.first_child(fragment_4);

									$.component(node_5, () => RadioGroup.Item, ($$anchor, RadioGroup_Item_1) => {
										RadioGroup_Item_1($$anchor, { value: 'comfortable', id: 'r2' });
									});

									var node_6 = $.sibling(node_5, 2);

									$.component(node_6, () => Field.Label, ($$anchor, Field_Label_1) => {
										Field_Label_1($$anchor, {
											for: 'r2',
											class: 'font-normal',
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_1 = $.text('Comfortable');

												$.append($$anchor, text_1);
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

						$.component(node_7, () => Field.Field, ($$anchor, Field_Field_2) => {
							Field_Field_2($$anchor, {
								orientation: 'horizontal',
								children: ($$anchor, $$slotProps) => {
									var fragment_5 = root();
									var node_8 = $.first_child(fragment_5);

									$.component(node_8, () => RadioGroup.Item, ($$anchor, RadioGroup_Item_2) => {
										RadioGroup_Item_2($$anchor, { value: 'compact', id: 'r3' });
									});

									var node_9 = $.sibling(node_8, 2);

									$.component(node_9, () => Field.Label, ($$anchor, Field_Label_2) => {
										Field_Label_2($$anchor, {
											for: 'r3',
											class: 'font-normal',
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_2 = $.text('Compact');

												$.append($$anchor, text_2);
											},
											$$slots: { default: true }
										});
									});

									$.append($$anchor, fragment_5);
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