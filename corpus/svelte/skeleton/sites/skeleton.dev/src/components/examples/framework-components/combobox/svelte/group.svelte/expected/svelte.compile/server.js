import * as $ from 'svelte/internal/server';
import { Combobox, Portal, useListCollection } from '@skeletonlabs/skeleton-svelte';

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

		let items = data;

		const collection = $.derived(() => useListCollection({
			items,
			itemToString: (item) => item.label,
			itemToValue: (item) => item.value,
			groupBy: (item) => item.type
		}));

		const onOpenChange = () => {
			items = data;
		};

		const onInputValueChange = (event) => {
			const filtered = data.filter((item) => item.value.toLowerCase().includes(event.inputValue.toLowerCase()));

			if (filtered.length > 0) {
				items = filtered;
			} else {
				items = data;
			}
		};

		Combobox($$renderer, {
			class: 'max-w-md',
			placeholder: 'Search...',
			collection: collection(),
			onOpenChange,
			onInputValueChange,
			children: ($$renderer) => {
				if (Combobox.Control) {
					$$renderer.push('<!--[-->');

					Combobox.Control($$renderer, {
						children: ($$renderer) => {
							if (Combobox.Input) {
								$$renderer.push('<!--[-->');
								Combobox.Input($$renderer, {});
								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}

							$$renderer.push(` `);

							if (Combobox.Trigger) {
								$$renderer.push('<!--[-->');
								Combobox.Trigger($$renderer, {});
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

				$$renderer.push(` `);

				Portal($$renderer, {
					children: ($$renderer) => {
						if (Combobox.Positioner) {
							$$renderer.push('<!--[-->');

							Combobox.Positioner($$renderer, {
								children: ($$renderer) => {
									if (Combobox.Content) {
										$$renderer.push('<!--[-->');

										Combobox.Content($$renderer, {
											children: ($$renderer) => {
												$$renderer.push(`<!--[-->`);

												const each_array = $.ensure_array_like(collection().group());

												for (let $$index_1 = 0, $$length = each_array.length; $$index_1 < $$length; $$index_1++) {
													let [type, items] = each_array[$$index_1];

													if (Combobox.ItemGroup) {
														$$renderer.push('<!--[-->');

														Combobox.ItemGroup($$renderer, {
															children: ($$renderer) => {
																if (Combobox.ItemGroupLabel) {
																	$$renderer.push('<!--[-->');

																	Combobox.ItemGroupLabel($$renderer, {
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

																	if (Combobox.Item) {
																		$$renderer.push('<!--[-->');

																		Combobox.Item($$renderer, {
																			item,
																			children: ($$renderer) => {
																				if (Combobox.ItemText) {
																					$$renderer.push('<!--[-->');

																					Combobox.ItemText($$renderer, {
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

																				if (Combobox.ItemIndicator) {
																					$$renderer.push('<!--[-->');
																					Combobox.ItemIndicator($$renderer, {});
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

							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!---->`);
			},
			$$slots: { default: true }
		});
	});
}