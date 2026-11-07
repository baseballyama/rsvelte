import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Combobox, Portal, useListCollection } from '@skeletonlabs/skeleton-svelte';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!> <!>`, 1);

export default function Default($$anchor, $$props) {
	$.push($$props, true);

	const data = [
		{ label: 'Apple', value: 'apple' },
		{ label: 'Banana', value: 'banana' },
		{ label: 'Orange', value: 'orange' },
		{ label: 'Carrot', value: 'carrot' },
		{ label: 'Broccoli', value: 'broccoli' },
		{ label: 'Spinach', value: 'spinach' }
	];

	let items = $.state($.proxy(data));

	const collection = $.derived(() => useListCollection({
		items: $.get(items),
		itemToString: (item) => item.label,
		itemToValue: (item) => item.value
	}));

	const onOpenChange = () => {
		$.set(items, data, true);
	};

	const onInputValueChange = (event) => {
		const filtered = data.filter((item) => item.value.toLowerCase().includes(event.inputValue.toLowerCase()));

		if (filtered.length > 0) {
			$.set(items, filtered, true);
		} else {
			$.set(items, data, true);
		}
	};

	Combobox($$anchor, {
		class: 'max-w-md',
		placeholder: 'Search...',
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

			$.component(node_4, () => Combobox.ClearTrigger, ($$anchor, Combobox_ClearTrigger) => {
				Combobox_ClearTrigger($$anchor, {
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_1 = $.text('Clear All');

						$.append($$anchor, text_1);
					},
					$$slots: { default: true }
				});
			});

			var node_5 = $.sibling(node_4, 2);

			Portal(node_5, {
				children: ($$anchor, $$slotProps) => {
					var fragment_3 = $.comment();
					var node_6 = $.first_child(fragment_3);

					$.component(node_6, () => Combobox.Positioner, ($$anchor, Combobox_Positioner) => {
						Combobox_Positioner($$anchor, {
							children: ($$anchor, $$slotProps) => {
								var fragment_4 = $.comment();
								var node_7 = $.first_child(fragment_4);

								$.component(node_7, () => Combobox.Content, ($$anchor, Combobox_Content) => {
									Combobox_Content($$anchor, {
										children: ($$anchor, $$slotProps) => {
											var fragment_5 = $.comment();
											var node_8 = $.first_child(fragment_5);

											$.each(node_8, 17, () => $.get(items), (item) => item.value, ($$anchor, item) => {
												var fragment_6 = $.comment();
												var node_9 = $.first_child(fragment_6);

												$.component(node_9, () => Combobox.Item, ($$anchor, Combobox_Item) => {
													Combobox_Item($$anchor, {
														get item() {
															return $.get(item);
														},

														children: ($$anchor, $$slotProps) => {
															var fragment_7 = root();
															var node_10 = $.first_child(fragment_7);

															$.component(node_10, () => Combobox.ItemText, ($$anchor, Combobox_ItemText) => {
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

															var node_11 = $.sibling(node_10, 2);

															$.component(node_11, () => Combobox.ItemIndicator, ($$anchor, Combobox_ItemIndicator) => {
																Combobox_ItemIndicator($$anchor, {});
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