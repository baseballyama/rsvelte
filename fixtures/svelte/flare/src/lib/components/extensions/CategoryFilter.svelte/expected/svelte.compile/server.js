import * as $ from 'svelte/internal/server';
import { Button } from '$lib/components/ui/button';
import * as Popover from '$lib/components/ui/popover';
import * as Command from '$lib/components/ui/command';
import { ChevronsUpDown, Check } from '@lucide/svelte';
import { extensionsStore } from './store.svelte';
import { focusManager } from '$lib/focus.svelte';

export default function CategoryFilter($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let categoryPopoverOpen = false;
		const scopeId = `category-filter-${crypto.randomUUID()}`;
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			if (Popover.Root) {
				$$renderer.push('<!--[-->');

				Popover.Root($$renderer, {
					get open() {
						return categoryPopoverOpen;
					},

					set open($$value) {
						categoryPopoverOpen = $$value;
						$$settled = false;
					},

					children: ($$renderer) => {
						{
							function child($$renderer, { props }) {
								Button($$renderer, $.spread_props([
									{
										variant: 'ghost',
										role: 'combobox',
										'aria-expanded': categoryPopoverOpen,
										class: 'w-48 justify-between'
									},
									props,
									{
										children: ($$renderer) => {
											$$renderer.push(`<!---->${$.escape(extensionsStore.selectedCategory)} `);
											ChevronsUpDown($$renderer, { class: 'ml-2 size-4 shrink-0 opacity-50' });
											$$renderer.push(`<!---->`);
										},
										$$slots: { default: true }
									}
								]));
							}

							if (Popover.Trigger) {
								$$renderer.push('<!--[-->');
								Popover.Trigger($$renderer, { child, $$slots: { child: true } });
								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}
						}

						$$renderer.push(` `);

						if (Popover.Content) {
							$$renderer.push('<!--[-->');

							Popover.Content($$renderer, {
								class: 'w-48 p-0',
								children: ($$renderer) => {
									if (Command.Root) {
										$$renderer.push('<!--[-->');

										Command.Root($$renderer, {
											children: ($$renderer) => {
												if (Command.Input) {
													$$renderer.push('<!--[-->');
													Command.Input($$renderer, { placeholder: 'Search category...' });
													$$renderer.push('<!--]-->');
												} else {
													$$renderer.push('<!--[!-->');
													$$renderer.push('<!--]-->');
												}

												$$renderer.push(` `);

												if (Command.Empty) {
													$$renderer.push('<!--[-->');

													Command.Empty($$renderer, {
														children: ($$renderer) => {
															$$renderer.push(`<!---->No category found.`);
														},
														$$slots: { default: true }
													});

													$$renderer.push('<!--]-->');
												} else {
													$$renderer.push('<!--[!-->');
													$$renderer.push('<!--]-->');
												}

												$$renderer.push(` `);

												if (Command.List) {
													$$renderer.push('<!--[-->');

													Command.List($$renderer, {
														children: ($$renderer) => {
															$$renderer.push(`<!--[-->`);

															const each_array = $.ensure_array_like(extensionsStore.allCategories);

															for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
																let category = each_array[$$index];

																if (Command.Item) {
																	$$renderer.push('<!--[-->');

																	Command.Item($$renderer, {
																		value: category,
																		onSelect: () => {
																			extensionsStore.selectedCategory = category;
																			extensionsStore.selectedIndex = 0;
																			categoryPopoverOpen = false;
																		},

																		children: ($$renderer) => {
																			Check($$renderer, {
																				class: extensionsStore.selectedCategory !== category ? 'text-transparent' : ''
																			});

																			$$renderer.push(`<!----> ${$.escape(category)}`);
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

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}