import * as $ from 'svelte/internal/server';
import { Combobox, Portal, useListCollection } from '@skeletonlabs/skeleton-svelte';

export default function Dir($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const data = [
			{ label: 'Apple', value: 'apple' },
			{ label: 'Banana', value: 'banana' },
			{ label: 'Orange', value: 'orange' },
			{ label: 'Carrot', value: 'carrot' },
			{ label: 'Broccoli', value: 'broccoli' },
			{ label: 'Spinach', value: 'spinach' }
		];

		let items = data;

		const collection = $.derived(() => useListCollection({
			items,
			itemToString: (item) => item.label,
			itemToValue: (item) => item.value
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
			dir: 'rtl',
			children: ($$renderer) => {
				if (Combobox.Label) {
					$$renderer.push('<!--[-->');

					Combobox.Label($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<!---->Label`);
						},
						$$slots: { default: true }
					});

					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}

				$$renderer.push(` `);

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

												const each_array = $.ensure_array_like(items);

												for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
													let item = each_array[$$index];

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