import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Combobox, Portal, useListCollection } from '@skeletonlabs/skeleton-svelte';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	const data = [
		{ label: 'Apple', value: 'apple', type: 'Fruits' },
		{ label: 'Banana', value: 'banana', type: 'Fruits' },
		{ label: 'Orange', value: 'orange', type: 'Fruits' },
		{ label: 'Carrot', value: 'carrot', type: 'Vegetables' },
		{ label: 'Broccoli', value: 'broccoli', type: 'Vegetables' },
		{ label: 'Spinach', value: 'spinach', type: 'Vegetables' }
	];

	let items = $.state($.proxy(data));

	const collection = $.derived(() => useListCollection({
		items: $.get(items),
		itemToString: (item) => item.label,
		itemToValue: (item) => item.value,
		groupBy: (item) => item.type
	}));

	const onOpenChange = () => {
		$.set(items, data, true);
	};

	const onInputValueChange = (event) => {
		const filtered = data.filter((item) => item.value.toLowerCase().includes(event.inputValue.toLowerCase()));

		$.set(items, filtered.length > 0 ? filtered : data, true);
	};

	Combobox($$anchor, {
		get collection() {
			return $.get(collection);
		},
		onOpenChange,
		onInputValueChange,
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_1();
			var node = $.first_child(fragment_1);

			$.component(node, () => Combobox.Label, ($$anchor, Combobox_Label) => {
				Combobox_Label($$anchor, {
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text = $.text('Label');

						$.append($$anchor, text);
					},
					$$slots: { default: true }
				});
			});

			var node_1 = $.sibling(node, 2);

			$.component(node_1, () => Combobox.Control, ($$anchor, Combobox_Control) => {
				Combobox_Control($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = root();
						var node_2 = $.first_child(fragment_2);

						$.component(node_2, () => Combobox.Input, ($$anchor, Combobox_Input) => {
							Combobox_Input($$anchor, {});
						});

						var node_3 = $.sibling(node_2, 2);

						$.component(node_3, () => Combobox.Trigger, ($$anchor, Combobox_Trigger) => {
							Combobox_Trigger($$anchor, {});
						});

						$.append($$anchor, fragment_2);
					},
					$$slots: { default: true }
				});
			});

			var node_4 = $.sibling(node_1, 2);

			Portal(node_4, {
				children: ($$anchor, $$slotProps) => {
					var fragment_3 = $.comment();
					var node_5 = $.first_child(fragment_3);

					$.component(node_5, () => Combobox.Positioner, ($$anchor, Combobox_Positioner) => {
						Combobox_Positioner($$anchor, {
							children: ($$anchor, $$slotProps) => {
								var fragment_4 = $.comment();
								var node_6 = $.first_child(fragment_4);

								$.component(node_6, () => Combobox.Content, ($$anchor, Combobox_Content) => {
									Combobox_Content($$anchor, {
										children: ($$anchor, $$slotProps) => {
											var fragment_5 = $.comment();
											var node_7 = $.first_child(fragment_5);

											$.each(node_7, 17, () => $.get(collection).group(), ([type, items]) => type, ($$anchor, $$item, $$index_1, $$array) => {
												var $$array_1 = $.derived(() => $.to_array($.get($$item), 2));
												let type = () => $.get($$array_1)[0];
												let items = () => $.get($$array_1)[1];
												var fragment_6 = $.comment();
												var node_8 = $.first_child(fragment_6);

												$.component(node_8, () => Combobox.ItemGroup, ($$anchor, Combobox_ItemGroup) => {
													Combobox_ItemGroup($$anchor, {
														children: ($$anchor, $$slotProps) => {
															var fragment_7 = root();
															var node_9 = $.first_child(fragment_7);

															$.component(node_9, () => Combobox.ItemGroupLabel, ($$anchor, Combobox_ItemGroupLabel) => {
																Combobox_ItemGroupLabel($$anchor, {
																	children: ($$anchor, $$slotProps) => {
																		$.next();

																		var text_1 = $.text();

																		$.template_effect(() => $.set_text(text_1, type()));
																		$.append($$anchor, text_1);
																	},
																	$$slots: { default: true }
																});
															});

															var node_10 = $.sibling(node_9, 2);

															$.each(node_10, 17, items, (item) => item.value, ($$anchor, item) => {
																var fragment_9 = $.comment();
																var node_11 = $.first_child(fragment_9);

																$.component(node_11, () => Combobox.Item, ($$anchor, Combobox_Item) => {
																	Combobox_Item($$anchor, {
																		get item() {
																			return $.get(item);
																		},

																		children: ($$anchor, $$slotProps) => {
																			var fragment_10 = root();
																			var node_12 = $.first_child(fragment_10);

																			$.component(node_12, () => Combobox.ItemText, ($$anchor, Combobox_ItemText) => {
																				Combobox_ItemText($$anchor, {
																					children: ($$anchor, $$slotProps) => {
																						$.next();

																						var text_2 = $.text();

																						$.template_effect(() => $.set_text(text_2, $.get(item).label));
																						$.append($$anchor, text_2);
																					},
																					$$slots: { default: true }
																				});
																			});

																			var node_13 = $.sibling(node_12, 2);

																			$.component(node_13, () => Combobox.ItemIndicator, ($$anchor, Combobox_ItemIndicator) => {
																				Combobox_ItemIndicator($$anchor, {});
																			});

																			$.append($$anchor, fragment_10);
																		},
																		$$slots: { default: true }
																	});
																});

																$.append($$anchor, fragment_9);
															});

															$.append($$anchor, fragment_7);
														},
														$$slots: { default: true }
													});
												});

												$.append($$anchor, fragment_6);
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

					$.append($$anchor, fragment_3);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	$.pop();
}