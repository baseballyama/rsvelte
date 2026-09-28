import * as $ from 'svelte/internal/server';
import { Listbox, useListCollection } from '@skeletonlabs/skeleton-svelte';

export default function Group($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
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

		Listbox($$renderer, {
			class: 'w-full max-w-md',
			collection,
			children: ($$renderer) => {
				if (Listbox.Content) {
					$$renderer.push('<!--[-->');

					Listbox.Content($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<!--[-->`);

							const each_array = $.ensure_array_like(collection.group());

							for (let $$index_1 = 0, $$length = each_array.length; $$index_1 < $$length; $$index_1++) {
								let [type, items] = each_array[$$index_1];

								if (Listbox.ItemGroup) {
									$$renderer.push('<!--[-->');

									Listbox.ItemGroup($$renderer, {
										children: ($$renderer) => {
											if (Listbox.ItemGroupLabel) {
												$$renderer.push('<!--[-->');

												Listbox.ItemGroupLabel($$renderer, {
													children: ($$renderer) => {
														$$renderer.push(`<!---->${$.escape(type)}`);
													},
													$$slots: { default: true }
												});

												$$renderer.push('<!--]-->');
											} else {
												$$renderer.push('<!--[!-->');
												$$renderer.push('<!--]-->');
											}

											$$renderer.push(` <!--[-->`);

											const each_array_1 = $.ensure_array_like(items);

											for (let $$index = 0, $$length = each_array_1.length; $$index < $$length; $$index++) {
												let item = each_array_1[$$index];

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