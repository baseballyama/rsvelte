import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Combobox, Portal, useListCollection } from '@skeletonlabs/skeleton-svelte';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<span class="badge preset-filled"> </span>`);
var root_2 = $.from_html(`<div class="grid gap-2 w-full max-w-md"><!> <div class="flex flex-wrap gap-2"></div></div>`);

export default function Multiple($$anchor, $$props) {
	$.push($$props, true);

	const data = [
		{ label: 'Apple', value: 'apple' },
		{ label: 'Banana', value: 'banana' },
		{ label: 'Orange', value: 'orange' },
		{ label: 'Carrot', value: 'carrot' },
		{ label: 'Broccoli', value: 'broccoli' },
		{ label: 'Spinach', value: 'spinach' }
	];

	let value = $.state($.proxy([]));
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

	const onValueChange = (event) => {
		$.set(value, event.value, true);
	};

	var div = root_2();
	var node = $.child(div);

	Combobox(node, {
		placeholder: 'Search...',
		get collection() {
			return $.get(collection);
		},
		onOpenChange,
		onInputValueChange,
		get value() {
			return $.get(value);
		},
		onValueChange,
		multiple: true,
		children: ($$anchor, $$slotProps) => {
			var fragment = root();
			var node_1 = $.first_child(fragment);

			$.component(node_1, () => Combobox.Control, ($$anchor, Combobox_Control) => {
				Combobox_Control($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_1 = root();
						var node_2 = $.first_child(fragment_1);

						$.component(node_2, () => Combobox.Input, ($$anchor, Combobox_Input) => {
							Combobox_Input($$anchor, {});
						});

						var node_3 = $.sibling(node_2, 2);

						$.component(node_3, () => Combobox.Trigger, ($$anchor, Combobox_Trigger) => {
							Combobox_Trigger($$anchor, {});
						});

						$.append($$anchor, fragment_1);
					},
					$$slots: { default: true }
				});
			});

			var node_4 = $.sibling(node_1, 2);

			Portal(node_4, {
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = $.comment();
					var node_5 = $.first_child(fragment_2);

					$.component(node_5, () => Combobox.Positioner, ($$anchor, Combobox_Positioner) => {
						Combobox_Positioner($$anchor, {
							children: ($$anchor, $$slotProps) => {
								var fragment_3 = $.comment();
								var node_6 = $.first_child(fragment_3);

								$.component(node_6, () => Combobox.Content, ($$anchor, Combobox_Content) => {
									Combobox_Content($$anchor, {
										children: ($$anchor, $$slotProps) => {
											var fragment_4 = $.comment();
											var node_7 = $.first_child(fragment_4);

											$.each(node_7, 17, () => $.get(items), (item) => item.value, ($$anchor, item) => {
												var fragment_5 = $.comment();
												var node_8 = $.first_child(fragment_5);

												$.component(node_8, () => Combobox.Item, ($$anchor, Combobox_Item) => {
													Combobox_Item($$anchor, {
														get item() {
															return $.get(item);
														},

														children: ($$anchor, $$slotProps) => {
															var fragment_6 = root();
															var node_9 = $.first_child(fragment_6);

															$.component(node_9, () => Combobox.ItemText, ($$anchor, Combobox_ItemText) => {
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

															var node_10 = $.sibling(node_9, 2);

															$.component(node_10, () => Combobox.ItemIndicator, ($$anchor, Combobox_ItemIndicator) => {
																Combobox_ItemIndicator($$anchor, {});
															});

															$.append($$anchor, fragment_6);
														},
														$$slots: { default: true }
													});
												});

												$.append($$anchor, fragment_5);
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
					});

					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment);
		},
		$$slots: { default: true }
	});

	var div_1 = $.sibling(node, 2);

	$.each(div_1, 20, () => $.get(value), (item) => item, ($$anchor, item) => {
		var span = root_1();
		var text_1 = $.only_child(span, true);

		$.template_effect(() => $.set_text(text_1, item));
		$.append($$anchor, span);
	});

	$.reset(div_1);
	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}