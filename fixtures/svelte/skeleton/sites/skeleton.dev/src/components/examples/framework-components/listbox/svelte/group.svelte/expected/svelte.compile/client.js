import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Listbox, useListCollection } from '@skeletonlabs/skeleton-svelte';

var root = $.from_html(`<!> <!>`, 1);

export default function Group($$anchor, $$props) {
	$.push($$props, true);

	const data = [
		{ label: 'Apple', value: 'apple', type: 'Fruits' },
		{ label: 'Banana', value: 'banana', type: 'Fruits' },
		{ label: 'Orange', value: 'orange', type: 'Fruits' },
		{ label: 'Carrot', value: 'carrot', type: 'Vegetables' },
		{ label: 'Broccoli', value: 'broccoli', type: 'Vegetables' },
		{ label: 'Spinach', value: 'spinach', type: 'Vegetables' }
	];

	const collection = useListCollection({
		items: data,
		itemToString: (item) => item.label,
		itemToValue: (item) => item.value,
		groupBy: (item) => item.type
	});

	Listbox($$anchor, {
		class: 'w-full max-w-md',
		get collection() {
			return collection;
		},

		children: ($$anchor, $$slotProps) => {
			var fragment_1 = $.comment();
			var node = $.first_child(fragment_1);

			$.component(node, () => Listbox.Content, ($$anchor, Listbox_Content) => {
				Listbox_Content($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = $.comment();
						var node_1 = $.first_child(fragment_2);

						$.each(node_1, 17, () => collection.group(), ([type, items]) => type, ($$anchor, $$item) => {
							var $$array = $.derived(() => $.to_array($.get($$item), 2));
							let type = () => $.get($$array)[0];
							let items = () => $.get($$array)[1];
							var fragment_3 = $.comment();
							var node_2 = $.first_child(fragment_3);

							$.component(node_2, () => Listbox.ItemGroup, ($$anchor, Listbox_ItemGroup) => {
								Listbox_ItemGroup($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_4 = root();
										var node_3 = $.first_child(fragment_4);

										$.component(node_3, () => Listbox.ItemGroupLabel, ($$anchor, Listbox_ItemGroupLabel) => {
											Listbox_ItemGroupLabel($$anchor, {
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text = $.text();

													$.template_effect(() => $.set_text(text, type()));
													$.append($$anchor, text);
												},
												$$slots: { default: true }
											});
										});

										var node_4 = $.sibling(node_3, 2);

										$.each(node_4, 17, items, (item) => item.value, ($$anchor, item) => {
											var fragment_6 = $.comment();
											var node_5 = $.first_child(fragment_6);

											$.component(node_5, () => Listbox.Item, ($$anchor, Listbox_Item) => {
												Listbox_Item($$anchor, {
													get item() {
														return $.get(item);
													},

													children: ($$anchor, $$slotProps) => {
														var fragment_7 = root();
														var node_6 = $.first_child(fragment_7);

														$.component(node_6, () => Listbox.ItemText, ($$anchor, Listbox_ItemText) => {
															Listbox_ItemText($$anchor, {
																children: ($$anchor, $$slotProps) => {
																	$.next();

																	var text_1 = $.text();

																	$.template_effect(() => $.set_text(text_1, $.get(item).label));
																	$.append($$anchor, text_1);
																},
																$$slots: { default: true }
															});
														});

														var node_7 = $.sibling(node_6, 2);

														$.component(node_7, () => Listbox.ItemIndicator, ($$anchor, Listbox_ItemIndicator) => {
															Listbox_ItemIndicator($$anchor, {});
														});

														$.append($$anchor, fragment_7);
													},
													$$slots: { default: true }
												});
											});

											$.append($$anchor, fragment_6);
										});

										$.append($$anchor, fragment_4);
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_3);
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