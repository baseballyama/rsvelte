import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Listbox, useListCollection } from '@skeletonlabs/skeleton-svelte';

var root = $.from_html(`<!> <!>`, 1);

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

	const collection = useListCollection({
		items: data,
		itemToString: (item) => item.label,
		itemToValue: (item) => item.value
	});

	Listbox($$anchor, {
		class: 'w-full max-w-md',
		get collection() {
			return collection;
		},

		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node = $.first_child(fragment_1);

			$.component(node, () => Listbox.Label, ($$anchor, Listbox_Label) => {
				Listbox_Label($$anchor, {
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text = $.text('Select a food');

						$.append($$anchor, text);
					},
					$$slots: { default: true }
				});
			});

			var node_1 = $.sibling(node, 2);

			$.component(node_1, () => Listbox.Content, ($$anchor, Listbox_Content) => {
				Listbox_Content($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = $.comment();
						var node_2 = $.first_child(fragment_2);

						$.each(node_2, 17, () => collection.items, (item) => item.value, ($$anchor, item) => {
							var fragment_3 = $.comment();
							var node_3 = $.first_child(fragment_3);

							$.component(node_3, () => Listbox.Item, ($$anchor, Listbox_Item) => {
								Listbox_Item($$anchor, {
									get item() {
										return $.get(item);
									},

									children: ($$anchor, $$slotProps) => {
										var fragment_4 = root();
										var node_4 = $.first_child(fragment_4);

										$.component(node_4, () => Listbox.ItemText, ($$anchor, Listbox_ItemText) => {
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

										var node_5 = $.sibling(node_4, 2);

										$.component(node_5, () => Listbox.ItemIndicator, ($$anchor, Listbox_ItemIndicator) => {
											Listbox_ItemIndicator($$anchor, {});
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