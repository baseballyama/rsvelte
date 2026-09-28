import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as Field from "$lib/registry/ui/field/index.js";
import * as Select from "$lib/registry/ui/select/index.js";
import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
import { ButtonGroup } from "$lib/registry/ui/button-group/index.js";
import { Button } from "$lib/registry/ui/button/index.js";
import { Input } from "$lib/registry/ui/input/index.js";
import { Label } from "$lib/registry/ui/label/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!>`, 1);

export default function Button_group_with_select($$anchor, $$props) {
	$.push($$props, true);

	const currencyItems = [
		{ label: "$", value: "$" },
		{ label: "€", value: "€" },
		{ label: "£", value: "£" }
	];

	let currency = $.state($.proxy(currencyItems[0].value));
	const currencyLabel = $.derived(() => currencyItems.find((item) => item.value === $.get(currency))?.label ?? "$");

	Example($$anchor, {
		title: 'With Select',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = $.comment();
			var node = $.first_child(fragment_1);

			$.component(node, () => Field.Field, ($$anchor, Field_Field) => {
				Field_Field($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = root();
						var node_1 = $.first_child(fragment_2);

						Label(node_1, {
							for: 'amount',
							children: ($$anchor, $$slotProps) => {
								$.next();

								var text = $.text('Amount');

								$.append($$anchor, text);
							},
							$$slots: { default: true }
						});

						var node_2 = $.sibling(node_1, 2);

						ButtonGroup(node_2, {
							children: ($$anchor, $$slotProps) => {
								var fragment_3 = root_1();
								var node_3 = $.first_child(fragment_3);

								$.component(node_3, () => Select.Root, ($$anchor, Select_Root) => {
									Select_Root($$anchor, {
										type: 'single',
										get value() {
											return $.get(currency);
										},

										set value($$value) {
											$.set(currency, $$value, true);
										},

										children: ($$anchor, $$slotProps) => {
											var fragment_4 = root();
											var node_4 = $.first_child(fragment_4);

											$.component(node_4, () => Select.Trigger, ($$anchor, Select_Trigger) => {
												Select_Trigger($$anchor, {
													children: ($$anchor, $$slotProps) => {
														$.next();

														var text_1 = $.text();

														$.template_effect(() => $.set_text(text_1, $.get(currencyLabel)));
														$.append($$anchor, text_1);
													},
													$$slots: { default: true }
												});
											});

											var node_5 = $.sibling(node_4, 2);

											$.component(node_5, () => Select.Content, ($$anchor, Select_Content) => {
												Select_Content($$anchor, {
													children: ($$anchor, $$slotProps) => {
														var fragment_6 = $.comment();
														var node_6 = $.first_child(fragment_6);

														$.component(node_6, () => Select.Group, ($$anchor, Select_Group) => {
															Select_Group($$anchor, {
																children: ($$anchor, $$slotProps) => {
																	var fragment_7 = $.comment();
																	var node_7 = $.first_child(fragment_7);

																	$.each(node_7, 17, () => currencyItems, (item) => item.value, ($$anchor, item) => {
																		var fragment_8 = $.comment();
																		var node_8 = $.first_child(fragment_8);

																		$.component(node_8, () => Select.Item, ($$anchor, Select_Item) => {
																			Select_Item($$anchor, {
																				get value() {
																					return $.get(item).value;
																				},

																				get label() {
																					return $.get(item).label;
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

																		$.append($$anchor, fragment_8);
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

											$.append($$anchor, fragment_4);
										},
										$$slots: { default: true }
									});
								});

								var node_9 = $.sibling(node_3, 2);

								Input(node_9, { placeholder: 'Enter amount to send' });

								var node_10 = $.sibling(node_9, 2);

								Button(node_10, {
									variant: 'outline',
									children: ($$anchor, $$slotProps) => {
										IconPlaceholder($$anchor, {
											lucide: 'ArrowRightIcon',
											tabler: 'IconArrowRight',
											hugeicons: 'ArrowRight01Icon',
											phosphor: 'ArrowRightIcon',
											remixicon: 'RiArrowRightLine'
										});
									},
									$$slots: { default: true }
								});

								$.append($$anchor, fragment_3);
							},
							$$slots: { default: true }
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