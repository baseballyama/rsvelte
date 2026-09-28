import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as Field from "$lib/registry/ui/field/index.js";
import * as RadioGroup from "$lib/registry/ui/radio-group/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

var root = $.from_html(`<!> <div class="font-medium">Small</div>`, 1);
var root_1 = $.from_html(`<!> <div class="font-medium">Medium</div>`, 1);
var root_2 = $.from_html(`<!> <div class="font-medium">Large</div>`, 1);
var root_3 = $.from_html(`<!> <div class="font-medium">X-Large</div>`, 1);
var root_4 = $.from_html(`<!> <!> <!> <!>`, 1);

export default function Radio_group_grid($$anchor) {
	Example($$anchor, {
		title: 'Grid Layout',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = $.comment();
			var node = $.first_child(fragment_1);

			$.component(node, () => RadioGroup.Root, ($$anchor, RadioGroup_Root) => {
				RadioGroup_Root($$anchor, {
					value: 'medium',
					class: 'grid grid-cols-2 gap-2',
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = root_4();
						var node_1 = $.first_child(fragment_2);

						$.component(node_1, () => Field.Label, ($$anchor, Field_Label) => {
							Field_Label($$anchor, {
								for: 'size-small',
								children: ($$anchor, $$slotProps) => {
									var fragment_3 = $.comment();
									var node_2 = $.first_child(fragment_3);

									$.component(node_2, () => Field.Field, ($$anchor, Field_Field) => {
										Field_Field($$anchor, {
											orientation: 'horizontal',
											children: ($$anchor, $$slotProps) => {
												var fragment_4 = root();
												var node_3 = $.first_child(fragment_4);

												$.component(node_3, () => RadioGroup.Item, ($$anchor, RadioGroup_Item) => {
													RadioGroup_Item($$anchor, { value: 'small', id: 'size-small' });
												});

												$.next(2);
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

						var node_4 = $.sibling(node_1, 2);

						$.component(node_4, () => Field.Label, ($$anchor, Field_Label_1) => {
							Field_Label_1($$anchor, {
								for: 'size-medium',
								children: ($$anchor, $$slotProps) => {
									var fragment_5 = $.comment();
									var node_5 = $.first_child(fragment_5);

									$.component(node_5, () => Field.Field, ($$anchor, Field_Field_1) => {
										Field_Field_1($$anchor, {
											orientation: 'horizontal',
											children: ($$anchor, $$slotProps) => {
												var fragment_6 = root_1();
												var node_6 = $.first_child(fragment_6);

												$.component(node_6, () => RadioGroup.Item, ($$anchor, RadioGroup_Item_1) => {
													RadioGroup_Item_1($$anchor, { value: 'medium', id: 'size-medium' });
												});

												$.next(2);
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

						var node_7 = $.sibling(node_4, 2);

						$.component(node_7, () => Field.Label, ($$anchor, Field_Label_2) => {
							Field_Label_2($$anchor, {
								for: 'size-large',
								children: ($$anchor, $$slotProps) => {
									var fragment_7 = $.comment();
									var node_8 = $.first_child(fragment_7);

									$.component(node_8, () => Field.Field, ($$anchor, Field_Field_2) => {
										Field_Field_2($$anchor, {
											orientation: 'horizontal',
											children: ($$anchor, $$slotProps) => {
												var fragment_8 = root_2();
												var node_9 = $.first_child(fragment_8);

												$.component(node_9, () => RadioGroup.Item, ($$anchor, RadioGroup_Item_2) => {
													RadioGroup_Item_2($$anchor, { value: 'large', id: 'size-large' });
												});

												$.next(2);
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

						var node_10 = $.sibling(node_7, 2);

						$.component(node_10, () => Field.Label, ($$anchor, Field_Label_3) => {
							Field_Label_3($$anchor, {
								for: 'size-xlarge',
								children: ($$anchor, $$slotProps) => {
									var fragment_9 = $.comment();
									var node_11 = $.first_child(fragment_9);

									$.component(node_11, () => Field.Field, ($$anchor, Field_Field_3) => {
										Field_Field_3($$anchor, {
											orientation: 'horizontal',
											children: ($$anchor, $$slotProps) => {
												var fragment_10 = root_3();
												var node_12 = $.first_child(fragment_10);

												$.component(node_12, () => RadioGroup.Item, ($$anchor, RadioGroup_Item_3) => {
													RadioGroup_Item_3($$anchor, { value: 'xlarge', id: 'size-xlarge' });
												});

												$.next(2);
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