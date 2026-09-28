import * as $ from 'svelte/internal/server';
import CheckIcon from '@lucide/svelte/icons/check';
import { Menu, Portal } from '@skeletonlabs/skeleton-svelte';

export default function Option($$renderer) {
	const sortOptions = [
		{ value: 'newest', label: 'Newest' },
		{ value: 'popular', label: 'Most Popular' },
		{ value: 'rating', label: 'Highest Rated' }
	];

	const filterOptions = [
		{ value: 'free-shipping', label: 'Free Shipping' },
		{ value: 'in-stock', label: 'In Stock' },
		{ value: 'on-sale', label: 'On Sale' }
	];

	let sort = 'newest';
	let filters = ['free-shipping', 'in-stock'];

	Menu($$renderer, {
		closeOnSelect: false,
		children: ($$renderer) => {
			if (Menu.Trigger) {
				$$renderer.push('<!--[-->');

				Menu.Trigger($$renderer, {
					class: 'btn preset-filled',
					children: ($$renderer) => {
						$$renderer.push(`<!---->Open Menu`);
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
					if (Menu.Positioner) {
						$$renderer.push('<!--[-->');

						Menu.Positioner($$renderer, {
							children: ($$renderer) => {
								if (Menu.Content) {
									$$renderer.push('<!--[-->');

									Menu.Content($$renderer, {
										children: ($$renderer) => {
											$$renderer.push(`<!--[-->`);

											const each_array = $.ensure_array_like(sortOptions);

											for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
												let item = each_array[$$index];

												if (Menu.OptionItem) {
													$$renderer.push('<!--[-->');

													Menu.OptionItem($$renderer, {
														type: 'radio',
														checked: sort === item.value,
														onCheckedChange: (checked) => sort = checked ? item.value : '',
														value: item.value,
														children: ($$renderer) => {
															if (Menu.ItemText) {
																$$renderer.push('<!--[-->');

																Menu.ItemText($$renderer, {
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

															if (Menu.ItemIndicator) {
																$$renderer.push('<!--[-->');

																Menu.ItemIndicator($$renderer, {
																	class: 'hidden data-[state=checked]:block',
																	children: ($$renderer) => {
																		CheckIcon($$renderer, { class: 'size-4' });
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
											}

											$$renderer.push(`<!--]--> `);

											if (Menu.Separator) {
												$$renderer.push('<!--[-->');
												Menu.Separator($$renderer, {});
												$$renderer.push('<!--]-->');
											} else {
												$$renderer.push('<!--[!-->');
												$$renderer.push('<!--]-->');
											}

											$$renderer.push(` <!--[-->`);

											const each_array_1 = $.ensure_array_like(filterOptions);

											for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
												let item = each_array_1[$$index_1];

												if (Menu.OptionItem) {
													$$renderer.push('<!--[-->');

													Menu.OptionItem($$renderer, {
														type: 'checkbox',
														checked: filters.includes(item.value),
														onCheckedChange: (checked) => filters = checked
															? [...filters, item.value]
															: filters.filter((x) => x !== item.value),
														value: item.value,
														children: ($$renderer) => {
															if (Menu.ItemText) {
																$$renderer.push('<!--[-->');

																Menu.ItemText($$renderer, {
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

															if (Menu.ItemIndicator) {
																$$renderer.push('<!--[-->');

																Menu.ItemIndicator($$renderer, {
																	class: 'hidden data-[state=checked]:block',
																	children: ($$renderer) => {
																		CheckIcon($$renderer, { class: 'size-4' });
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
}