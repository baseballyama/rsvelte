import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
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

var root = $.from_html(`<div class="flex items-center space-x-2"><!> <!></div>`);
var root_1 = $.from_html(`<div class="grid gap-4"><div class="space-y-2"><h4 class="font-medium leading-none">Add to Library</h4> <p class="text-muted-foreground text-sm">Select a group for this block</p></div> <!> <div class="flex justify-end"><!></div></div>`);
var root_2 = $.from_html(`<!> <!>`, 1);
var root_3 = $.from_html(`<header class="flex h-14 shrink-0 items-center gap-2"><div class="flex flex-1 items-center gap-2 px-3"><!> <!> <div class="text-sm">Blocks</div></div></header> <div class="flex flex-1 flex-col gap-4 px-4 pb-4 overflow-hidden"><!></div>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	const group_id = $.derived(() => page.url.searchParams.get('group') ?? undefined);

	const marketplace_symbol_group = $.derived(() => $.get(group_id)
		? LibrarySymbolGroups.from(marketplace).one($.get(group_id))
		: undefined);

	const marketplace_symbols = $.derived(() => $.get(marketplace_symbol_group)?.symbols() ?? undefined);
	const library_symbol_groups = $.derived(() => LibrarySymbolGroups.list() ?? []);
	const marketplace_symbol_groups = $.derived(() => LibrarySymbolGroups.from(marketplace).list({ sort: 'index' }) ?? []);

	// Auto-select first marketplace group if none is selected
	$.user_effect(() => {
		if (!$.get(group_id) && $.get(marketplace_symbol_groups).length > 0) {
			const url = new URL(page.url);

			url.searchParams.set('group', $.get(marketplace_symbol_groups)[0].id);
			goto(url, { replaceState: true });
		}
	});

	// Prefer last-used group (persisted), fallback to first available
	let selected_group_id = $.state($.proxy((get(last_library_group_id) || LibrarySymbolGroups.list()?.[0]?.id) ?? ''));

	let selected_symbol_id = $.state(void 0);

	let selected_symbol = $.derived(() => $.get(selected_symbol_id)
		? LibrarySymbols.from(marketplace).one($.get(selected_symbol_id))
		: null);

	let added_to_library = $.state(false);

	async function add_to_library(sym) {
		const symbolToAdd = typeof sym === 'string'
			? LibrarySymbols.from(marketplace).one(sym)
			: sym || $.get(selected_symbol);

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
				group: $.get(selected_group_id)
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
	watch(() => $.get(selected_group_id), (val) => {
		if (val) last_library_group_id.set(val);
	});

	// If groups list updates and none selected, pick first available
	watch(() => (LibrarySymbolGroups.list() ?? []).map((g) => g.id), (ids) => {
		if (!$.get(selected_group_id) && ids.length > 0) {
			$.set(selected_group_id, ids[0], true);
		}
	});

	var fragment = root_3();
	var header = $.first_child(fragment);
	var div = $.child(header);
	var node = $.child(div);

	$.component(node, () => Sidebar.Trigger, ($$anchor, Sidebar_Trigger) => {
		Sidebar_Trigger($$anchor, {});
	});

	var node_1 = $.sibling(node, 2);

	Separator(node_1, { orientation: 'vertical', class: 'mr-2 h-4' });
	$.next(2);
	$.reset(div);
	$.reset(header);

	var div_1 = $.sibling(header, 2);
	var node_2 = $.child(div_1);

	$.key(node_2, () => $.get(group_id), ($$anchor) => {
		var fragment_1 = $.comment();
		var node_3 = $.first_child(fragment_1);

		{
			var consequent_1 = ($$anchor) => {
				{
					const children = ($$anchor, symbol = $.noop) => {
						SymbolButton($$anchor, {
							get symbol() {
								return symbol();
							},
							show_price: true,
							onclick: () => {
								$.set(selected_symbol_id, symbol().id, true);
							},

							children: ($$anchor, $$slotProps) => {
								var fragment_4 = $.comment();
								var node_4 = $.first_child(fragment_4);

								{
									let $0 = $.derived(() => $.get(selected_symbol_id) === symbol().id);

									$.component(node_4, () => Popover.Root, ($$anchor, Popover_Root) => {
										Popover_Root($$anchor, {
											get open() {
												return $.get($0);
											},

											onOpenChange: (open) => {
												if (!open) {
													$.set(selected_symbol_id, undefined);
												}
											},

											children: ($$anchor, $$slotProps) => {
												var fragment_5 = root_2();
												var node_5 = $.first_child(fragment_5);

												{
													let $0 = $.derived(() => buttonVariants({ variant: 'ghost', class: 'h-4 p-0' }));

													$.component(node_5, () => Popover.Trigger, ($$anchor, Popover_Trigger) => {
														Popover_Trigger($$anchor, {
															get class() {
																return $.get($0);
															},

															onclick: (event) => {
																event.preventDefault();
																$.set(selected_symbol_id, symbol().id, true);
															},

															children: ($$anchor, $$slotProps) => {
																var fragment_6 = $.comment();
																var node_6 = $.first_child(fragment_6);

																{
																	var consequent = ($$anchor) => {
																		CircleCheck($$anchor, {});
																	};

																	var alternate = ($$anchor) => {
																		CirclePlus($$anchor, {});
																	};

																	$.if(node_6, ($$render) => {
																		if ($.get(added_to_library)) $$render(consequent); else $$render(alternate, -1);
																	});
																}

																$.append($$anchor, fragment_6);
															},
															$$slots: { default: true }
														});
													});
												}

												var node_7 = $.sibling(node_5, 2);

												$.component(node_7, () => Popover.Content, ($$anchor, Popover_Content) => {
													Popover_Content($$anchor, {
														class: 'w-80',
														children: ($$anchor, $$slotProps) => {
															var div_2 = root_1();
															var node_8 = $.sibling($.child(div_2), 2);

															$.component(node_8, () => RadioGroup.Root, ($$anchor, RadioGroup_Root) => {
																RadioGroup_Root($$anchor, {
																	get value() {
																		return $.get(selected_group_id);
																	},

																	set value($$value) {
																		$.set(selected_group_id, $$value, true);
																	},

																	children: ($$anchor, $$slotProps) => {
																		var fragment_9 = $.comment();
																		var node_9 = $.first_child(fragment_9);

																		$.each(node_9, 17, () => $.get(library_symbol_groups) ?? [], $.index, ($$anchor, group) => {
																			var div_3 = root();
																			var node_10 = $.child(div_3);

																			$.component(node_10, () => RadioGroup.Item, ($$anchor, RadioGroup_Item) => {
																				RadioGroup_Item($$anchor, {
																					get value() {
																						return $.get(group).id;
																					},

																					get id() {
																						return $.get(group).id;
																					}
																				});
																			});

																			var node_11 = $.sibling(node_10, 2);

																			Label(node_11, {
																				get for() {
																					return $.get(group).id;
																				},

																				children: ($$anchor, $$slotProps) => {
																					$.next();

																					var text = $.text();

																					$.template_effect(() => $.set_text(text, $.get(group).name));
																					$.append($$anchor, text);
																				},
																				$$slots: { default: true }
																			});

																			$.reset(div_3);
																			$.append($$anchor, div_3);
																		});

																		$.append($$anchor, fragment_9);
																	},
																	$$slots: { default: true }
																});
															});

															var div_4 = $.sibling(node_8, 2);
															var node_12 = $.child(div_4);

															Button(node_12, {
																onclick: () => {
																	const grp = LibrarySymbolGroups.one($.get(selected_group_id));
																	const displayName = (symbol()?.name || '').trim() || 'Block';

																	toast.success(`Added ${displayName} to ${grp?.name ?? 'Library'}`);
																	$.set(selected_symbol_id, undefined);
																	$.set(added_to_library, true);

																	// Fire-and-forget background add
																	add_to_library(symbol()).catch((e) => {
																		console.error(e);
																		toast.error('Failed to add block. Please try again.');
																		$.set(added_to_library, false);
																	});
																},

																children: ($$anchor, $$slotProps) => {
																	$.next();

																	var text_1 = $.text('Add to Library');

																	$.append($$anchor, text_1);
																},
																$$slots: { default: true }
															});

															$.reset(div_4);
															$.reset(div_2);
															$.append($$anchor, div_2);
														},
														$$slots: { default: true }
													});
												});

												$.append($$anchor, fragment_5);
											},
											$$slots: { default: true }
										});
									});
								}

								$.append($$anchor, fragment_4);
							},
							$$slots: { default: true }
						});
					};

					let $0 = $.derived(() => $.get(marketplace_symbols) === undefined);

					Masonry($$anchor, {
						get items() {
							return $.get(marketplace_symbols);
						},

						get loading() {
							return $.get($0);
						},
						skeletonCount: 12,
						children,
						$$slots: { default: true }
					});
				}
			};

			var alternate_1 = ($$anchor) => {
				EmptyState($$anchor, {
					class: 'h-[50vh]',
					get icon() {
						return Cuboid;
					},
					title: 'No Blocks to display',
					description: 'Blocks are components you can add to any site. When you create one it\'ll show up here.'
				});
			};

			$.if(node_3, ($$render) => {
				if ($.get(marketplace_symbols)?.length || $.get(marketplace_symbols) === undefined) $$render(consequent_1); else $$render(alternate_1, -1);
			});
		}

		$.append($$anchor, fragment_1);
	});

	$.reset(div_1);
	$.append($$anchor, fragment);
	$.pop();
}