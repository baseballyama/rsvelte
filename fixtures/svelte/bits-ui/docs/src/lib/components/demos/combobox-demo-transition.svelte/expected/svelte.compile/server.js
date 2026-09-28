import * as $ from 'svelte/internal/server';
import { Combobox } from "bits-ui";
import CaretUpDown from "phosphor-svelte/lib/CaretUpDown";
import Check from "phosphor-svelte/lib/Check";
import OrangeSlice from "phosphor-svelte/lib/OrangeSlice";
import CaretDoubleUp from "phosphor-svelte/lib/CaretDoubleUp";
import CaretDoubleDown from "phosphor-svelte/lib/CaretDoubleDown";
import { fly } from "svelte/transition";

export default function Combobox_demo_transition($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const fruits = [
			{ value: "mango", label: "Mango" },
			{ value: "watermelon", label: "Watermelon" },
			{ value: "apple", label: "Apple" },
			{ value: "pineapple", label: "Pineapple" },
			{ value: "orange", label: "Orange" },
			{ value: "grape", label: "Grape" },
			{ value: "strawberry", label: "Strawberry" },
			{ value: "banana", label: "Banana" },
			{ value: "kiwi", label: "Kiwi" },
			{ value: "peach", label: "Peach" },
			{ value: "cherry", label: "Cherry" },
			{ value: "blueberry", label: "Blueberry" },
			{ value: "raspberry", label: "Raspberry" },
			{ value: "blackberry", label: "Blackberry" },
			{ value: "plum", label: "Plum" },
			{ value: "apricot", label: "Apricot" },
			{ value: "pear", label: "Pear" },
			{ value: "grapefruit", label: "Grapefruit" }
		];

		let searchValue = "";

		const filteredFruits = $.derived(() => searchValue === ""
			? fruits
			: fruits.filter((fruit) => fruit.label.toLowerCase().includes(searchValue.toLowerCase())));

		if (Combobox.Root) {
			$$renderer.push('<!--[-->');

			Combobox.Root($$renderer, {
				type: 'single',
				name: 'favoriteFruit',
				onOpenChangeComplete: (o) => {
					if (!o) searchValue = "";
				},

				children: ($$renderer) => {
					$$renderer.push(`<div class="relative">`);

					OrangeSlice($$renderer, {
						class: 'text-muted-foreground absolute start-3 top-1/2 size-6 -translate-y-1/2'
					});

					$$renderer.push(`<!----> `);

					if (Combobox.Input) {
						$$renderer.push('<!--[-->');

						Combobox.Input($$renderer, {
							oninput: (e) => searchValue = e.currentTarget.value,
							class: 'h-input rounded-9px border-border-input bg-background placeholder:text-foreground-alt/50 focus:ring-foreground focus:ring-offset-background focus:outline-hidden inline-flex w-[296px] truncate border px-11 text-base transition-colors focus:ring-2 focus:ring-offset-2 sm:text-sm',
							placeholder: 'Search a fruit',
							'aria-label': 'Search a fruit'
						});

						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}

					$$renderer.push(` `);

					if (Combobox.Trigger) {
						$$renderer.push('<!--[-->');

						Combobox.Trigger($$renderer, {
							class: 'absolute end-3 top-1/2 size-6 -translate-y-1/2',
							children: ($$renderer) => {
								CaretUpDown($$renderer, { class: 'text-muted-foreground size-6' });
							},
							$$slots: { default: true }
						});

						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}

					$$renderer.push(`</div> `);

					if (Combobox.Portal) {
						$$renderer.push('<!--[-->');

						Combobox.Portal($$renderer, {
							children: ($$renderer) => {
								{
									function child($$renderer, { wrapperProps, props, open }) {
										if (open) {
											$$renderer.push(`<!--[0--><div${$.attributes({ ...wrapperProps })}><div${$.attributes({ ...props })}>`);

											if (Combobox.ScrollUpButton) {
												$$renderer.push('<!--[-->');

												Combobox.ScrollUpButton($$renderer, {
													class: 'flex w-full items-center justify-center',
													children: ($$renderer) => {
														CaretDoubleUp($$renderer, { class: 'size-3' });
													},
													$$slots: { default: true }
												});

												$$renderer.push('<!--]-->');
											} else {
												$$renderer.push('<!--[!-->');
												$$renderer.push('<!--]-->');
											}

											$$renderer.push(` `);

											if (Combobox.Viewport) {
												$$renderer.push('<!--[-->');

												Combobox.Viewport($$renderer, {
													class: 'p-1',
													children: ($$renderer) => {
														const each_array = $.ensure_array_like(filteredFruits());

														if (each_array.length !== 0) {
															$$renderer.push('<!--[-->');

															for (let i = 0, $$length = each_array.length; i < $$length; i++) {
																let fruit = each_array[i];

																{
																	function children($$renderer, { selected }) {
																		$$renderer.push(`<!---->${$.escape(fruit.label)} `);

																		if (selected) {
																			$$renderer.push(`<!--[0--><div class="ml-auto">`);
																			Check($$renderer, {});
																			$$renderer.push(`<!----></div>`);
																		} else {
																			$$renderer.push('<!--[-1-->');
																		}

																		$$renderer.push(`<!--]-->`);
																	}

																	if (Combobox.Item) {
																		$$renderer.push('<!--[-->');

																		Combobox.Item($$renderer, {
																			class: 'rounded-button data-highlighted:bg-muted outline-hidden flex h-10 w-full select-none items-center py-3 pl-5 pr-1.5 text-sm  capitalize',
																			value: fruit.value,
																			label: fruit.label,
																			children,
																			$$slots: { default: true }
																		});

																		$$renderer.push('<!--]-->');
																	} else {
																		$$renderer.push('<!--[!-->');
																		$$renderer.push('<!--]-->');
																	}
																}
															}
														} else {
															$$renderer.push(`<!--[!--><span class="block px-5 py-2 text-sm text-muted-foreground">No results found, try again.</span>`);
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

											$$renderer.push(` `);

											if (Combobox.ScrollDownButton) {
												$$renderer.push('<!--[-->');

												Combobox.ScrollDownButton($$renderer, {
													class: 'flex w-full items-center justify-center',
													children: ($$renderer) => {
														CaretDoubleDown($$renderer, { class: 'size-3' });
													},
													$$slots: { default: true }
												});

												$$renderer.push('<!--]-->');
											} else {
												$$renderer.push('<!--[!-->');
												$$renderer.push('<!--]-->');
											}

											$$renderer.push(`</div></div>`);
										} else {
											$$renderer.push('<!--[-1-->');
										}

										$$renderer.push(`<!--]-->`);
									}

									if (Combobox.Content) {
										$$renderer.push('<!--[-->');

										Combobox.Content($$renderer, {
											class: 'border-muted bg-background shadow-popover outline-hidden h-96 max-h-[var(--bits-combobox-content-available-height)] w-[var(--bits-combobox-anchor-width)] min-w-[var(--bits-combobox-anchor-width)] rounded-xl border px-1 py-3',
											sideOffset: 10,
											forceMount: true,
											child,
											$$slots: { child: true }
										});

										$$renderer.push('<!--]-->');
									} else {
										$$renderer.push('<!--[!-->');
										$$renderer.push('<!--]-->');
									}
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
	});
}