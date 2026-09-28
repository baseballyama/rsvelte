import * as $ from 'svelte/internal/server';
import * as Popover from '$lib/components/ui/popover';
import * as Sidebar from '$lib/components/ui/sidebar';
import { Separator } from '$lib/components/ui/separator';
import EmptyState from '$lib/components/EmptyState.svelte';
import { Cuboid, CirclePlus, CircleCheck } from 'lucide-svelte';
import SymbolButton from '$lib/components/SymbolButton.svelte';
import Masonry from '$lib/components/Masonry.svelte';
import { Button, buttonVariants } from '$lib/components/ui/button';
import { toast } from 'svelte-sonner';
import * as RadioGroup from '$lib/components/ui/radio-group';
import { Label } from '$lib/components/ui/label';
import { page } from '$app/state';
import { goto } from '$app/navigation';

import {
	LibrarySymbolEntries,
	LibrarySymbolFields,
	LibrarySymbolGroups,
	LibrarySymbols
} from '$lib/pocketbase/collections';

import { marketplace, self } from '$lib/pocketbase/managers';
import { last_library_group_id } from '$lib/builder/stores/app/misc';
import { get } from 'svelte/store';
import { watch } from 'runed';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const group_id = $.derived(() => page.url.searchParams.get('group') ?? undefined);

		const marketplace_symbol_group = $.derived(() => group_id()
			? LibrarySymbolGroups.from(marketplace).one(group_id())
			: undefined);

		const marketplace_symbols = $.derived(() => marketplace_symbol_group()?.symbols() ?? undefined);
		const library_symbol_groups = $.derived(() => LibrarySymbolGroups.list() ?? []);
		const marketplace_symbol_groups = $.derived(() => LibrarySymbolGroups.from(marketplace).list({ sort: 'index' }) ?? []);

		// Auto-select first marketplace group if none is selected
		// Prefer last-used group (persisted), fallback to first available
		let selected_group_id = (get(last_library_group_id) || LibrarySymbolGroups.list()?.[0]?.id) ?? '';

		let selected_symbol_id = void 0;

		let selected_symbol = $.derived(() => selected_symbol_id
			? LibrarySymbols.from(marketplace).one(selected_symbol_id)
			: null);

		let added_to_library = false;

		async function add_to_library(sym) {
			const symbolToAdd = typeof sym === 'string'
				? LibrarySymbols.from(marketplace).one(sym)
				: sym || selected_symbol();

			if (!symbolToAdd) {
				throw new Error('Selected symbol not loaded');
			}

			// Copy marketplace symbols to library symbols
			try {
				// Create library symbol from marketplace symbol
				const site_symbol = LibrarySymbols.create({
					name: symbolToAdd.name,
					html: symbolToAdd.html,
					css: symbolToAdd.css,
					js: symbolToAdd.js,
					group: selected_group_id
				});

				// Get marketplace fields using pb directly to avoid effect context issues
				const marketplace_fields = await marketplace.instance?.collection('library_symbol_fields').getFullList({ filter: `symbol = "${symbolToAdd.id}"`, sort: 'index' });

				if (marketplace_fields?.length > 0) {
					const field_map = new Map();

					// Create fields in order, handling parent relationships
					const sorted_fields = [...marketplace_fields].sort((a, b) => {
						// Fields without parents come first
						if (!a.parent && b.parent) return -1;

						if (a.parent && !b.parent) return 1;

						return (a.index || 0) - (b.index || 0);
					});

					for (const marketplace_field of sorted_fields) {
						const parent_library_field = marketplace_field.parent ? field_map.get(marketplace_field.parent) : undefined;

						const library_field = LibrarySymbolFields.create({
							key: marketplace_field.key,
							label: marketplace_field.label,
							type: marketplace_field.type,
							config: marketplace_field.config,
							index: marketplace_field.index,
							symbol: site_symbol.id,
							parent: parent_library_field?.id || undefined
						});

						field_map.set(marketplace_field.id, library_field);
					}

					// Get library entries using pb directly
					const field_ids = marketplace_fields.map((f) => f.id);

					const marketplace_entries = field_ids.length > 0
						? await marketplace.instance?.collection('library_symbol_entries').getFullList({
							filter: field_ids.map((id) => `field = "${id}"`).join(' || '),
							sort: 'index'
						})
						: [];

					if (marketplace_entries?.length > 0) {
						const entry_map = new Map();

						// Create entries in order, handling parent relationships
						const sorted_entries = [...marketplace_entries].sort((a, b) => {
							// Entries without parents come first
							if (!a.parent && b.parent) return -1;

							if (a.parent && !b.parent) return 1;

							return (a.index || 0) - (b.index || 0);
						});

						for (const marketplace_entry of sorted_entries) {
							const library_field = field_map.get(marketplace_entry.field);
							const parent_library_entry = marketplace_entry.parent ? entry_map.get(marketplace_entry.parent) : undefined;

							if (library_field) {
								const site_entry = LibrarySymbolEntries.create({
									field: library_field.id,
									value: marketplace_entry.value,
									index: marketplace_entry.index,
									locale: marketplace_entry.locale,
									parent: parent_library_entry?.id || undefined
								});

								entry_map.set(marketplace_entry.id, site_entry);
							}
						}
					}
				}

				await self.commit();
			} catch(error) {
				console.error('Error copying marketplace symbol:', error);

				throw error;
			}
		}

		// Keep last selected group in session store (watch explicit source)
		watch(() => selected_group_id, (val) => {
			if (val) last_library_group_id.set(val);
		});

		// If groups list updates and none selected, pick first available
		watch(() => (LibrarySymbolGroups.list() ?? []).map((g) => g.id), (ids) => {
			if (!selected_group_id && ids.length > 0) {
				selected_group_id = ids[0];
			}
		});

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$$renderer.push(`<header class="flex h-14 shrink-0 items-center gap-2"><div class="flex flex-1 items-center gap-2 px-3">`);

			if (Sidebar.Trigger) {
				$$renderer.push('<!--[-->');
				Sidebar.Trigger($$renderer, {});
				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}

			$$renderer.push(` `);
			Separator($$renderer, { orientation: 'vertical', class: 'mr-2 h-4' });
			$$renderer.push(`<!----> <div class="text-sm">Blocks</div></div></header> <div class="flex flex-1 flex-col gap-4 px-4 pb-4 overflow-hidden"><!---->`);

			{
				if (marketplace_symbols()?.length || marketplace_symbols() === undefined) {
					$$renderer.push('<!--[0-->');

					{
						function children($$renderer, symbol) {
							SymbolButton($$renderer, {
								symbol,
								show_price: true,
								onclick: () => {
									selected_symbol_id = symbol.id;
								},

								children: ($$renderer) => {
									if (Popover.Root) {
										$$renderer.push('<!--[-->');

										Popover.Root($$renderer, {
											open: selected_symbol_id === symbol.id,
											onOpenChange: (open) => {
												if (!open) {
													selected_symbol_id = undefined;
												}
											},

											children: ($$renderer) => {
												if (Popover.Trigger) {
													$$renderer.push('<!--[-->');

													Popover.Trigger($$renderer, {
														class: buttonVariants({ variant: 'ghost', class: 'h-4 p-0' }),
														onclick: (event) => {
															event.preventDefault();
															selected_symbol_id = symbol.id;
														},

														children: ($$renderer) => {
															if (added_to_library) {
																$$renderer.push('<!--[0-->');
																CircleCheck($$renderer, {});
															} else {
																$$renderer.push('<!--[-1-->');
																CirclePlus($$renderer, {});
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

												if (Popover.Content) {
													$$renderer.push('<!--[-->');

													Popover.Content($$renderer, {
														class: 'w-80',
														children: ($$renderer) => {
															$$renderer.push(`<div class="grid gap-4"><div class="space-y-2"><h4 class="font-medium leading-none">Add to Library</h4> <p class="text-muted-foreground text-sm">Select a group for this block</p></div> `);

															if (RadioGroup.Root) {
																$$renderer.push('<!--[-->');

																RadioGroup.Root($$renderer, {
																	get value() {
																		return selected_group_id;
																	},

																	set value($$value) {
																		selected_group_id = $$value;
																		$$settled = false;
																	},

																	children: ($$renderer) => {
																		$$renderer.push(`<!--[-->`);

																		const each_array = $.ensure_array_like(library_symbol_groups() ?? []);

																		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
																			let group = each_array[$$index];

																			$$renderer.push(`<div class="flex items-center space-x-2">`);

																			if (RadioGroup.Item) {
																				$$renderer.push('<!--[-->');
																				RadioGroup.Item($$renderer, { value: group.id, id: group.id });
																				$$renderer.push('<!--]-->');
																			} else {
																				$$renderer.push('<!--[!-->');
																				$$renderer.push('<!--]-->');
																			}

																			$$renderer.push(` `);

																			Label($$renderer, {
																				for: group.id,
																				children: ($$renderer) => {
																					$$renderer.push(`<!---->${$.escape(group.name)}`);
																				},
																				$$slots: { default: true }
																			});

																			$$renderer.push(`<!----></div>`);
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

															$$renderer.push(` <div class="flex justify-end">`);

															Button($$renderer, {
																onclick: () => {
																	const grp = LibrarySymbolGroups.one(selected_group_id);
																	const displayName = (symbol?.name || '').trim() || 'Block';

																	toast.success(`Added ${displayName} to ${grp?.name ?? 'Library'}`);
																	selected_symbol_id = undefined;
																	added_to_library = true;

																	// Fire-and-forget background add
																	add_to_library(symbol).catch((e) => {
																		console.error(e);
																		toast.error('Failed to add block. Please try again.');
																		added_to_library = false;
																	});
																},

																children: ($$renderer) => {
																	$$renderer.push(`<!---->Add to Library`);
																},
																$$slots: { default: true }
															});

															$$renderer.push(`<!----></div></div>`);
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
						}

						Masonry($$renderer, {
							items: marketplace_symbols(),
							loading: marketplace_symbols() === undefined,
							skeletonCount: 12,
							children,
							$$slots: { default: true }
						});
					}
				} else {
					$$renderer.push('<!--[-1-->');

					EmptyState($$renderer, {
						class: 'h-[50vh]',
						icon: Cuboid,
						title: 'No Blocks to display',
						description: 'Blocks are components you can add to any site. When you create one it\'ll show up here.'
					});
				}

				$$renderer.push(`<!--]-->`);
			}

			$$renderer.push(`<!----></div>`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}