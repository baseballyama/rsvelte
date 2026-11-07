import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Combobox, Portal, useListCollection } from '@skeletonlabs/skeleton-svelte';

var root = $.from_html(`<!> <!>`, 1);

export default function Auto_highlight($$anchor, $$props) {
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
		inputBehavior: 'autohighlight',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node = $.first_child(fragment_1);

			$.component(node, () => Combobox.Control, ($$anchor, Combobox_Control) => {
				Combobox_Control($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = root();
						var node_1 = $.first_child(fragment_2);

						$.component(node_1, () => Combobox.Input, ($$anchor, Combobox_Input) => {
							Combobox_Input($$anchor, {});
						});

						var node_2 = $.sibling(node_1, 2);

						$.component(node_2, () => Combobox.Trigger, ($$anchor, Combobox_Trigger) => {
							Combobox_Trigger($$anchor, {});
						});

						$.append($$anchor, fragment_2);
					},
					$$slots: { default: true }
				});
			});

			var node_3 = $.sibling(node, 2);

			Portal(node_3, {
				children: ($$anchor, $$slotProps) => {
					var fragment_3 = $.comment();
					var node_4 = $.first_child(fragment_3);

					$.component(node_4, () => Combobox.Positioner, ($$anchor, Combobox_Positioner) => {
						Combobox_Positioner($$anchor, {
							children: ($$anchor, $$slotProps) => {
								var fragment_4 = $.comment();
								var node_5 = $.first_child(fragment_4);

								$.component(node_5, () => Combobox.Content, ($$anchor, Combobox_Content) => {
									Combobox_Content($$anchor, {
										children: ($$anchor, $$slotProps) => {
											var fragment_5 = $.comment();
											var node_6 = $.first_child(fragment_5);

											$.each(node_6, 17, () => $.get(items), (item) => item.value, ($$anchor, item) => {
												var fragment_6 = $.comment();
												var node_7 = $.first_child(fragment_6);

												$.component(node_7, () => Combobox.Item, ($$anchor, Combobox_Item) => {
													Combobox_Item($$anchor, {
														get item() {
															return $.get(item);
														},

														children: ($$anchor, $$slotProps) => {
															var fragment_7 = root();
															var node_8 = $.first_child(fragment_7);

															$.component(node_8, () => Combobox.ItemText, ($$anchor, Combobox_ItemText) => {
																Combobox_ItemText($$anchor, {
																	children: ($$anchor, $$slotProps) => {
																		$.next();

																		var text = $.text();

																		$.template_effect(() => $.set_text(text, $.get(item).label));
																		$.append($$anchor, text);
																	},
																	$$slots: { default: true }
																});
															});

															var node_9 = $.sibling(node_8, 2);

															$.component(node_9, () => Combobox.ItemIndicator, ($$anchor, Combobox_ItemIndicator) => {
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