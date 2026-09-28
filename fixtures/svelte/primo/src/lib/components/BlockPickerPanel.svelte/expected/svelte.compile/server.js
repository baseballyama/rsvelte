import * as $ from 'svelte/internal/server';
import { tick } from 'svelte';
import { flip } from 'svelte/animate';
import { watch } from 'runed';
import { Store, Library as LibraryIcon, Check } from 'lucide-svelte';
import * as Tabs from '$lib/components/ui/tabs';
import Masonry from '$lib/components/Masonry.svelte';
import EmptyState from '$lib/components/EmptyState.svelte';
import SymbolButton from '$lib/components/SymbolButton.svelte';
import { LibrarySymbolGroups, LibrarySymbols } from '$lib/pocketbase/collections';
import { marketplace } from '$lib/pocketbase/managers';

export default function BlockPickerPanel($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { selected = [] } = $$props;
		let blocks_tab = 'library';
		const library_symbol_groups = $.derived(() => LibrarySymbolGroups.list({ sort: 'index' }) ?? []);
		const marketplace_symbol_groups = $.derived(() => LibrarySymbolGroups.from(marketplace).list({ sort: 'index' }) ?? []);
		let active_library_blocks_group_id = '';
		let active_marketplace_blocks_group_id = '';

		watch(() => (library_symbol_groups() ?? []).map((g) => g.id), (ids) => {
			if (!active_library_blocks_group_id && ids.length > 0) {
				const groups = library_symbol_groups() ?? [];

				active_library_blocks_group_id = groups.find((g) => g.name === 'Featured')?.id ?? ids[0];
			}
		});

		watch(() => (marketplace_symbol_groups() ?? []).map((g) => g.id), (ids) => {
			if (!active_marketplace_blocks_group_id && ids.length > 0) {
				const groups = marketplace_symbol_groups() ?? [];

				active_marketplace_blocks_group_id = groups.find((g) => g.name === 'Featured')?.id ?? ids[0];
			}
		});

		const active_library_blocks_group = $.derived(() => active_library_blocks_group_id
			? LibrarySymbolGroups.one(active_library_blocks_group_id)
			: undefined);

		const active_library_blocks_group_symbols = $.derived(() => active_library_blocks_group()?.symbols() ?? undefined);

		const active_marketplace_blocks_group = $.derived(() => active_marketplace_blocks_group_id
			? LibrarySymbolGroups.from(marketplace).one(active_marketplace_blocks_group_id)
			: undefined);

		const active_marketplace_blocks_group_symbols = $.derived(() => active_marketplace_blocks_group()?.symbols() ?? undefined);

		const selected_symbols = $.derived(() => selected.map(({ id, source }) => source === 'library'
			? LibrarySymbols.one(id)
			: LibrarySymbols.from(marketplace).one(id)).filter((symbol) => Boolean(symbol)));

		async function toggle_block(id, source) {
			const isSelected = selected.some((block) => block.id === id);

			if (isSelected) {
				selected = selected.filter((block) => block.id !== id);
			} else {
				selected = [{ id, source }, ...selected];
				await tick();
			}
		}

		function remove_block(id) {
			selected = selected.filter((block) => block.id !== id);
		}

		function handleTabChange(value) {
			if (value === 'library') {
				blocks_tab = 'library';
			} else if (value === 'marketplace') {
				blocks_tab = 'marketplace';
			}
		}

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			if (Tabs.Root) {
				$$renderer.push('<!--[-->');

				Tabs.Root($$renderer, {
					onValueChange: handleTabChange,
					class: 'h-[75vh] min-h-[30rem] w-full grid grid-cols-5 gap-4 flex-1 rounded-lg border bg-[#111] p-3 shadow-sm overflow-hidden',
					get value() {
						return blocks_tab;
					},

					set value($$value) {
						blocks_tab = $$value;
						$$settled = false;
					},

					children: ($$renderer) => {
						$$renderer.push(`<div class="col-span-5 md:col-span-4 flex flex-col overflow-hidden">`);

						if (Tabs.List) {
							$$renderer.push('<!--[-->');

							Tabs.List($$renderer, {
								class: 'rounded-9px bg-dark-10 shadow-mini-inset dark:bg-background grid w-full h-11 grid-cols-2 gap-1 p-1 text-sm font-semibold leading-[0.01em] dark:border dark:border-neutral-600/30',
								children: ($$renderer) => {
									if (Tabs.Trigger) {
										$$renderer.push('<!--[-->');

										Tabs.Trigger($$renderer, {
											value: 'library',
											class: 'data-[state=active]:shadow-mini dark:data-[state=active]:bg-muted h-8 rounded-[4px] bg-transparent py-2 data-[state=active]:bg-white flex gap-2',
											children: ($$renderer) => {
												LibraryIcon($$renderer, { class: 'h-4 w-4' });
												$$renderer.push(`<!----> <span>Library</span>`);
											},
											$$slots: { default: true }
										});

										$$renderer.push('<!--]-->');
									} else {
										$$renderer.push('<!--[!-->');
										$$renderer.push('<!--]-->');
									}

									$$renderer.push(` `);

									if (Tabs.Trigger) {
										$$renderer.push('<!--[-->');

										Tabs.Trigger($$renderer, {
											value: 'marketplace',
											class: 'data-[state=active]:shadow-mini dark:data-[state=active]:bg-muted h-8 rounded-[4px] bg-transparent py-2 data-[state=active]:bg-white flex gap-2',
											children: ($$renderer) => {
												Store($$renderer, { class: 'h-4 w-4' });
												$$renderer.push(`<!----> <span>Marketplace</span>`);
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

						$$renderer.push(` `);

						if (Tabs.Content) {
							$$renderer.push('<!--[-->');

							Tabs.Content($$renderer, {
								value: 'library',
								class: 'grid grid-cols-4 flex-1 min-h-0 overflow-hidden',
								children: ($$renderer) => {
									if (library_symbol_groups().length === 0) {
										$$renderer.push('<!--[0-->');

										EmptyState($$renderer, {
											class: 'col-span-4',
											icon: LibraryIcon,
											title: 'Your Library is empty',
											description: 'Curate and create blocks in your Library. Add blocks from the Marketplace or create your own to reuse across sites.',
											button: {
												label: 'Open Marketplace',
												icon: Store,
												onclick: () => blocks_tab = 'marketplace'
											}
										});
									} else {
										$$renderer.push(`<!--[-1--><div class="h-full md:border-r col-span-1 overflow-auto"><div class="p-2 text-xs text-muted-foreground">Groups</div> <ul class="p-2 pt-0 flex flex-col gap-1"><!--[-->`);

										const each_array = $.ensure_array_like(library_symbol_groups() ?? []);

										for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
											let group = each_array[$$index];

											$$renderer.push(`<button${$.attr_class(`w-full text-left px-2 py-1 rounded-md hover:bg-accent hover:text-accent-foreground ${active_library_blocks_group_id === group.id ? 'bg-accent text-accent-foreground' : ''}`)}>${$.escape(group.name)}</button>`);
										}

										$$renderer.push(`<!--]--></ul></div> `);

										{
											function children($$renderer, symbol) {
												$$renderer.push(`<div class="relative">`);
												SymbolButton($$renderer, { symbol, onclick: () => toggle_block(symbol.id, 'library') });
												$$renderer.push(`<!----> `);

												if (selected.some((block) => block.id === symbol.id)) {
													$$renderer.push(`<!--[0--><div class="pointer-events-none absolute inset-0 bg-[#000000AA] flex items-center justify-center">`);
													Check($$renderer, { class: 'text-primary' });
													$$renderer.push(`<!----></div>`);
												} else {
													$$renderer.push('<!--[-1-->');
												}

												$$renderer.push(`<!--]--></div>`);
											}

											Masonry($$renderer, {
												columnCount: 2,
												class: 'col-span-3 min-h-0 p-3 pr-0 overflow-auto',
												items: active_library_blocks_group_symbols(),
												loading: active_library_blocks_group_symbols() === undefined,
												children,
												$$slots: { default: true }
											});
										}

										$$renderer.push(`<!---->`);
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

						if (Tabs.Content) {
							$$renderer.push('<!--[-->');

							Tabs.Content($$renderer, {
								value: 'marketplace',
								class: 'grid grid-cols-4 flex-1 min-h-0 overflow-hidden',
								children: ($$renderer) => {
									$$renderer.push(`<div class="h-full md:border-r col-span-1 overflow-scroll"><div class="p-2 text-xs text-muted-foreground">Groups</div> <ul class="p-2 pt-0 flex flex-col gap-1"><!--[-->`);

									const each_array_1 = $.ensure_array_like(marketplace_symbol_groups() ?? []);

									for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
										let group = each_array_1[$$index_1];

										$$renderer.push(`<li><button${$.attr_class(`w-full text-left px-2 py-1 rounded-md hover:bg-accent hover:text-accent-foreground ${active_marketplace_blocks_group_id === group.id ? 'bg-accent text-accent-foreground' : ''}`)}>${$.escape(group.name)}</button></li>`);
									}

									$$renderer.push(`<!--]--></ul></div> `);

									{
										function children($$renderer, symbol) {
											$$renderer.push(`<div class="relative">`);

											SymbolButton($$renderer, {
												symbol,
												show_price: true,
												onclick: () => toggle_block(symbol.id, 'marketplace')
											});

											$$renderer.push(`<!----> `);

											if (selected.some((block) => block.id === symbol.id)) {
												$$renderer.push(`<!--[0--><div class="pointer-events-none absolute inset-0 bg-[#000000AA] flex items-center justify-center">`);
												Check($$renderer, { class: 'text-primary' });
												$$renderer.push(`<!----></div>`);
											} else {
												$$renderer.push('<!--[-1-->');
											}

											$$renderer.push(`<!--]--></div>`);
										}

										Masonry($$renderer, {
											columnCount: 2,
											class: 'col-span-3 min-h-0 p-3 pr-0 overflow-auto',
											items: active_marketplace_blocks_group_symbols(),
											loading: active_marketplace_blocks_group_symbols() === undefined,
											children,
											$$slots: { default: true }
										});
									}

									$$renderer.push(`<!---->`);
								},
								$$slots: { default: true }
							});

							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}

						$$renderer.push(`</div> <div class="col-span-5 md:col-span-1 rounded-lg border h-full px-3 flex flex-col overflow-hidden"><div class="py-2 text-xs border-b text-muted-foreground flex items-center justify-between"><div><span>Selected Blocks</span> `);

						if (selected_symbols().length > 0) {
							$$renderer.push(`<!--[0--><span class="text-xs text-muted-foreground">(${$.escape(selected_symbols().length)})</span>`);
						} else {
							$$renderer.push('<!--[-1-->');
						}

						$$renderer.push(`<!--]--></div> `);

						if (selected_symbols().length > 0) {
							$$renderer.push(`<!--[0--><button class="text-xs underline">Clear</button>`);
						} else {
							$$renderer.push('<!--[-1-->');
						}

						$$renderer.push(`<!--]--></div> `);

						if (selected_symbols().length > 0) {
							$$renderer.push(`<!--[0--><div class="flex flex-col gap-3 sm:grid-cols-1 overflow-scroll mt-4 pb-3"><!--[-->`);

							const each_array_2 = $.ensure_array_like(selected_symbols());

							for (let $$index_2 = 0, $$length = each_array_2.length; $$index_2 < $$length; $$index_2++) {
								let symbol = each_array_2[$$index_2];

								$$renderer.push(`<div class="relative">`);
								SymbolButton($$renderer, { symbol });
								$$renderer.push(`<!----> <button class="absolute top-2 right-2 text-xs bg-background/80 border rounded px-1">Remove</button></div>`);
							}

							$$renderer.push(`<!--]--></div>`);
						} else {
							$$renderer.push(`<!--[-1--><div class="text-sm text-muted-foreground p-6 text-center my-auto">Nothing added yet — select additional blocks to include in your site.</div>`);
						}

						$$renderer.push(`<!--]--></div>`);
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
		$.bind_props($$props, { selected });
	});
}