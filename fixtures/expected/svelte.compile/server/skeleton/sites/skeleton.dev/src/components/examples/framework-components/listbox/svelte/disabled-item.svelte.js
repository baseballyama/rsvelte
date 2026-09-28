import * as $ from 'svelte/internal/server';
import { Listbox, useListCollection } from '@skeletonlabs/skeleton-svelte';

export default function Disabled_item($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
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
			itemToValue: (item) => item.value,
			isItemDisabled: (item) => item.value === 'banana'
		});

		Listbox($$renderer, {
			class: 'w-full max-w-md',
			collection,
			children: ($$renderer) => {
				if (Listbox.Content) {
					$$renderer.push('<!--[-->');

					Listbox.Content($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<!--[-->`);

							const each_array = $.ensure_array_like(collection.items);

							for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
								let item = each_array[$$index];

								if (Listbox.Item) {
									$$renderer.push('<!--[-->');

									Listbox.Item($$renderer, {
										item,
										children: ($$renderer) => {
											if (Listbox.ItemText) {
												$$renderer.push('<!--[-->');

												Listbox.ItemText($$renderer, {
													children: ($$renderer) => {
														$$renderer.push(`<!---->${$.escape(item.label)}`);
													},
													$$slots: { default: true }
												});

												$$renderer.push('<!--]-->');
											} else {
												$$renderer.push('<!--[!-->');
												$$renderer.push('<!--]-->');
											}

											$$renderer.push(` `);

											if (Listbox.ItemIndicator) {
												$$renderer.push('<!--[-->');
												Listbox.ItemIndicator($$renderer, {});
												$$renderer.push('<!--]-->');
											} else {
												$$renderer.push('<!--[!-->');
												$$renderer.push('<!--]-->');
											}
										},
										$$slots: { default: true }
									});

									$$renderer.push('<!--]-->');
								} else {
									$$renderer.push('<!--[!-->');
									$$renderer.push('<!--]-->');
								}
							}

							$$renderer.push(`<!--]-->`);
						},
						$$slots: { default: true }
					});

					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}
			},
			$$slots: { default: true }
		});
	});
}