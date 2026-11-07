import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as Field from "$lib/registry/ui/field/index.js";
import * as InputGroup from "$lib/registry/ui/input-group/index.js";
import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
import { ButtonGroup } from "$lib/registry/ui/button-group/index.js";
import { Button } from "$lib/registry/ui/button/index.js";
import { Label } from "$lib/registry/ui/label/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

var root = $.from_html(`<!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);

export default function Button_group_with_fields($$anchor) {
	Example($$anchor, {
		title: 'With Fields',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = $.comment();
			var node = $.first_child(fragment_1);

			$.component(node, () => Field.Group, ($$anchor, Field_Group) => {
				Field_Group($$anchor, {
					class: 'grid grid-cols-3 gap-4',
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = $.comment();
						var node_1 = $.first_child(fragment_2);

						$.component(node_1, () => Field.Field, ($$anchor, Field_Field) => {
							Field_Field($$anchor, {
								class: 'col-span-2',
								children: ($$anchor, $$slotProps) => {
									var fragment_3 = root_1();
									var node_2 = $.first_child(fragment_3);

									Label(node_2, {
										for: 'width',
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text = $.text('Width');

											$.append($$anchor, text);
										},
										$$slots: { default: true }
									});

									var node_3 = $.sibling(node_2, 2);

									ButtonGroup(node_3, {
										children: ($$anchor, $$slotProps) => {
											var fragment_4 = root();
											var node_4 = $.first_child(fragment_4);

											$.component(node_4, () => InputGroup.Root, ($$anchor, InputGroup_Root) => {
												InputGroup_Root($$anchor, {
													children: ($$anchor, $$slotProps) => {
														var fragment_5 = root();
														var node_5 = $.first_child(fragment_5);

														$.component(node_5, () => InputGroup.Input, ($$anchor, InputGroup_Input) => {
															InputGroup_Input($$anchor, { id: 'width' });
														});

														var node_6 = $.sibling(node_5, 2);

														$.component(node_6, () => InputGroup.Addon, ($$anchor, InputGroup_Addon) => {
															InputGroup_Addon($$anchor, {
																class: 'text-muted-foreground',
																children: ($$anchor, $$slotProps) => {
																	$.next();

																	var text_1 = $.text('W');

																	$.append($$anchor, text_1);
																},
																$$slots: { default: true }
															});
														});

														var node_7 = $.sibling(node_6, 2);

														$.component(node_7, () => InputGroup.Addon, ($$anchor, InputGroup_Addon_1) => {
															InputGroup_Addon_1($$anchor, {
																align: 'inline-end',
																class: 'text-muted-foreground',
																children: ($$anchor, $$slotProps) => {
																	$.next();

																	var text_2 = $.text('px');

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

											var node_8 = $.sibling(node_4, 2);

											Button(node_8, {
												variant: 'outline',
												size: 'icon',
												children: ($$anchor, $$slotProps) => {
													IconPlaceholder($$anchor, {
														lucide: 'MinusIcon',
														tabler: 'IconMinus',
														hugeicons: 'MinusSignIcon',
														phosphor: 'MinusIcon',
														remixicon: 'RiSubtractLine'
													});
												},
												$$slots: { default: true }
											});

											var node_9 = $.sibling(node_8, 2);

											Button(node_9, {
												variant: 'outline',
												size: 'icon',
												children: ($$anchor, $$slotProps) => {
													IconPlaceholder($$anchor, {
														lucide: 'PlusIcon',
														tabler: 'IconPlus',
														hugeicons: 'PlusSignIcon',
														phosphor: 'PlusIcon',
														remixicon: 'RiAddLine'
													});
												},
												$$slots: { default: true }
											});

											$.append($$anchor, fragment_4);
										},
										$$slots: { default: true }
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