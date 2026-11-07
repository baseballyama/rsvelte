import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
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

var root = $.from_html(`<!> <span>Library</span>`, 1);
var root_1 = $.from_html(`<!> <span>Marketplace</span>`, 1);
var root_2 = $.from_html(`<!> <!>`, 1);
var root_3 = $.from_html(`<button> </button>`);
var root_4 = $.from_html(`<div class="pointer-events-none absolute inset-0 bg-[#000000AA] flex items-center justify-center"><!></div>`);
var root_5 = $.from_html(`<div class="relative"><!> <!></div>`);
var root_6 = $.from_html(`<div class="h-full md:border-r col-span-1 overflow-auto"><div class="p-2 text-xs text-muted-foreground">Groups</div> <ul class="p-2 pt-0 flex flex-col gap-1"></ul></div> <!>`, 1);
var root_7 = $.from_html(`<li><button> </button></li>`);
var root_8 = $.from_html(`<div class="h-full md:border-r col-span-1 overflow-scroll"><div class="p-2 text-xs text-muted-foreground">Groups</div> <ul class="p-2 pt-0 flex flex-col gap-1"></ul></div> <!>`, 1);
var root_9 = $.from_html(`<span class="text-xs text-muted-foreground"> </span>`);
var root_10 = $.from_html(`<button class="text-xs underline">Clear</button>`);
var root_11 = $.from_html(`<div class="relative"><!> <button class="absolute top-2 right-2 text-xs bg-background/80 border rounded px-1">Remove</button></div>`);
var root_12 = $.from_html(`<div class="flex flex-col gap-3 sm:grid-cols-1 overflow-scroll mt-4 pb-3"></div>`);
var root_13 = $.from_html(`<div class="text-sm text-muted-foreground p-6 text-center my-auto">Nothing added yet — select additional blocks to include in your site.</div>`);
var root_14 = $.from_html(`<div class="col-span-5 md:col-span-4 flex flex-col overflow-hidden"><!> <!> <!></div> <div class="col-span-5 md:col-span-1 rounded-lg border h-full px-3 flex flex-col overflow-hidden"><div class="py-2 text-xs border-b text-muted-foreground flex items-center justify-between"><div><span>Selected Blocks</span> <!></div> <!></div> <!></div>`, 1);

export default function BlockPickerPanel($$anchor, $$props) {
	$.push($$props, true);

	let selected = $.prop($$props, 'selected', 31, () => $.proxy([]));
	let blocks_tab = $.state('library');
	const library_symbol_groups = $.derived(() => LibrarySymbolGroups.list({ sort: 'index' }) ?? []);
	const marketplace_symbol_groups = $.derived(() => LibrarySymbolGroups.from(marketplace).list({ sort: 'index' }) ?? []);
	let active_library_blocks_group_id = $.state('');
	let active_marketplace_blocks_group_id = $.state('');

	watch(() => ($.get(library_symbol_groups) ?? []).map((g) => g.id), (ids) => {
		if (!$.get(active_library_blocks_group_id) && ids.length > 0) {
			const groups = $.get(library_symbol_groups) ?? [];

			$.set(active_library_blocks_group_id, groups.find((g) => g.name === 'Featured')?.id ?? ids[0], true);
		}
	});

	watch(() => ($.get(marketplace_symbol_groups) ?? []).map((g) => g.id), (ids) => {
		if (!$.get(active_marketplace_blocks_group_id) && ids.length > 0) {
			const groups = $.get(marketplace_symbol_groups) ?? [];

			$.set(active_marketplace_blocks_group_id, groups.find((g) => g.name === 'Featured')?.id ?? ids[0], true);
		}
	});

	const active_library_blocks_group = $.derived(() => $.get(active_library_blocks_group_id)
		? LibrarySymbolGroups.one($.get(active_library_blocks_group_id))
		: undefined);

	const active_library_blocks_group_symbols = $.derived(() => $.get(active_library_blocks_group)?.symbols() ?? undefined);

	const active_marketplace_blocks_group = $.derived(() => $.get(active_marketplace_blocks_group_id)
		? LibrarySymbolGroups.from(marketplace).one($.get(active_marketplace_blocks_group_id))
		: undefined);

	const active_marketplace_blocks_group_symbols = $.derived(() => $.get(active_marketplace_blocks_group)?.symbols() ?? undefined);

	const selected_symbols = $.derived(() => selected().map(({ id, source }) => source === 'library'
		? LibrarySymbols.one(id)
		: LibrarySymbols.from(marketplace).one(id)).filter((symbol) => Boolean(symbol)));

	async function toggle_block(id, source) {
		const isSelected = selected().some((block) => block.id === id);

		if (isSelected) {
			selected(selected().filter((block) => block.id !== id));
		} else {
			selected([{ id, source }, ...selected()]);
			await tick();
		}
	}

	function remove_block(id) {
		selected(selected().filter((block) => block.id !== id));
	}

	function handleTabChange(value) {
		if (value === 'library') {
			$.set(blocks_tab, 'library');
		} else if (value === 'marketplace') {
			$.set(blocks_tab, 'marketplace');
		}
	}

	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => Tabs.Root, ($$anchor, Tabs_Root) => {
		Tabs_Root($$anchor, {
			onValueChange: handleTabChange,
			class: 'h-[75vh] min-h-[30rem] w-full grid grid-cols-5 gap-4 flex-1 rounded-lg border bg-[#111] p-3 shadow-sm overflow-hidden',
			get value() {
				return $.get(blocks_tab);
			},

			set value($$value) {
				$.set(blocks_tab, $$value, true);
			},

			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root_14();
				var div = $.first_child(fragment_1);
				var node_1 = $.child(div);

				$.component(node_1, () => Tabs.List, ($$anchor, Tabs_List) => {
					Tabs_List($$anchor, {
						class: 'rounded-9px bg-dark-10 shadow-mini-inset dark:bg-background grid w-full h-11 grid-cols-2 gap-1 p-1 text-sm font-semibold leading-[0.01em] dark:border dark:border-neutral-600/30',
						children: ($$anchor, $$slotProps) => {
							var fragment_2 = root_2();
							var node_2 = $.first_child(fragment_2);

							$.component(node_2, () => Tabs.Trigger, ($$anchor, Tabs_Trigger) => {
								Tabs_Trigger($$anchor, {
									value: 'library',
									class: 'data-[state=active]:shadow-mini dark:data-[state=active]:bg-muted h-8 rounded-[4px] bg-transparent py-2 data-[state=active]:bg-white flex gap-2',
									children: ($$anchor, $$slotProps) => {
										var fragment_3 = root();
										var node_3 = $.first_child(fragment_3);

										LibraryIcon(node_3, { class: 'h-4 w-4' });
										$.next(2);
										$.append($$anchor, fragment_3);
									},
									$$slots: { default: true }
								});
							});

							var node_4 = $.sibling(node_2, 2);

							$.component(node_4, () => Tabs.Trigger, ($$anchor, Tabs_Trigger_1) => {
								Tabs_Trigger_1($$anchor, {
									value: 'marketplace',
									class: 'data-[state=active]:shadow-mini dark:data-[state=active]:bg-muted h-8 rounded-[4px] bg-transparent py-2 data-[state=active]:bg-white flex gap-2',
									children: ($$anchor, $$slotProps) => {
										var fragment_4 = root_1();
										var node_5 = $.first_child(fragment_4);

										Store(node_5, { class: 'h-4 w-4' });
										$.next(2);
										$.append($$anchor, fragment_4);
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_2);
						},
						$$slots: { default: true }
					});
				});

				var node_6 = $.sibling(node_1, 2);

				$.component(node_6, () => Tabs.Content, ($$anchor, Tabs_Content) => {
					Tabs_Content($$anchor, {
						value: 'library',
						class: 'grid grid-cols-4 flex-1 min-h-0 overflow-hidden',
						children: ($$anchor, $$slotProps) => {
							var fragment_5 = $.comment();
							var node_7 = $.first_child(fragment_5);

							{
								var consequent = ($$anchor) => {
									{
										let $0 = $.derived(() => ({
											label: 'Open Marketplace',
											icon: Store,
											onclick: () => $.set(blocks_tab, 'marketplace')
										}));

										EmptyState($$anchor, {
											class: 'col-span-4',
											get icon() {
												return LibraryIcon;
											},
											title: 'Your Library is empty',
											description: 'Curate and create blocks in your Library. Add blocks from the Marketplace or create your own to reuse across sites.',
											get button() {
												return $.get($0);
											}
										});
									}
								};

								var alternate = ($$anchor) => {
									var fragment_7 = root_6();
									var div_1 = $.first_child(fragment_7);
									var ul = $.sibling($.child(div_1), 2);

									$.each(ul, 21, () => $.get(library_symbol_groups) ?? [], (group) => group.id, ($$anchor, group) => {
										var button = root_3();
										var text = $.only_child(button, true);

										$.template_effect(() => {
											$.set_class(button, 1, `w-full text-left px-2 py-1 rounded-md hover:bg-accent hover:text-accent-foreground ${$.get(active_library_blocks_group_id) === $.get(group).id ? 'bg-accent text-accent-foreground' : ''}`);
											$.set_text(text, $.get(group).name);
										});

										$.delegated('click', button, () => $.set(active_library_blocks_group_id, $.get(group).id, true));
										$.append($$anchor, button);
									});

									$.reset(ul);
									$.reset(div_1);

									var node_8 = $.sibling(div_1, 2);

									{
										const children = ($$anchor, symbol = $.noop) => {
											var div_2 = root_5();
											var node_9 = $.child(div_2);

											SymbolButton(node_9, {
												get symbol() {
													return symbol();
												},
												onclick: () => toggle_block(symbol().id, 'library')
											});

											var node_10 = $.sibling(node_9, 2);

											{
												var consequent_1 = ($$anchor) => {
													var div_3 = root_4();
													var node_11 = $.child(div_3);

													Check(node_11, { class: 'text-primary' });
													$.reset(div_3);
													$.append($$anchor, div_3);
												};

												var d = $.derived(() => selected().some((block) => block.id === symbol().id));

												$.if(node_10, ($$render) => {
													if ($.get(d)) $$render(consequent_1);
												});
											}

											$.reset(div_2);
											$.append($$anchor, div_2);
										};

										let $0 = $.derived(() => $.get(active_library_blocks_group_symbols) === undefined);

										Masonry(node_8, {
											columnCount: 2,
											class: 'col-span-3 min-h-0 p-3 pr-0 overflow-auto',
											get items() {
												return $.get(active_library_blocks_group_symbols);
											},

											get loading() {
												return $.get($0);
											},
											children,
											$$slots: { default: true }
										});
									}

									$.append($$anchor, fragment_7);
								};

								$.if(node_7, ($$render) => {
									if ($.get(library_symbol_groups).length === 0) $$render(consequent); else $$render(alternate, -1);
								});
							}

							$.append($$anchor, fragment_5);
						},
						$$slots: { default: true }
					});
				});

				var node_12 = $.sibling(node_6, 2);

				$.component(node_12, () => Tabs.Content, ($$anchor, Tabs_Content_1) => {
					Tabs_Content_1($$anchor, {
						value: 'marketplace',
						class: 'grid grid-cols-4 flex-1 min-h-0 overflow-hidden',
						children: ($$anchor, $$slotProps) => {
							var fragment_8 = root_8();
							var div_4 = $.first_child(fragment_8);
							var ul_1 = $.sibling($.child(div_4), 2);

							$.each(ul_1, 21, () => $.get(marketplace_symbol_groups) ?? [], (group) => group.id, ($$anchor, group) => {
								var li = root_7();
								var button_1 = $.child(li);
								var text_1 = $.only_child(button_1, true);

								$.reset(li);

								$.template_effect(() => {
									$.set_class(button_1, 1, `w-full text-left px-2 py-1 rounded-md hover:bg-accent hover:text-accent-foreground ${$.get(active_marketplace_blocks_group_id) === $.get(group).id ? 'bg-accent text-accent-foreground' : ''}`);
									$.set_text(text_1, $.get(group).name);
								});

								$.delegated('click', button_1, () => $.set(active_marketplace_blocks_group_id, $.get(group).id, true));
								$.append($$anchor, li);
							});

							$.reset(ul_1);
							$.reset(div_4);

							var node_13 = $.sibling(div_4, 2);

							{
								const children = ($$anchor, symbol = $.noop) => {
									var div_5 = root_5();
									var node_14 = $.child(div_5);

									SymbolButton(node_14, {
										get symbol() {
											return symbol();
										},
										show_price: true,
										onclick: () => toggle_block(symbol().id, 'marketplace')
									});

									var node_15 = $.sibling(node_14, 2);

									{
										var consequent_2 = ($$anchor) => {
											var div_6 = root_4();
											var node_16 = $.child(div_6);

											Check(node_16, { class: 'text-primary' });
											$.reset(div_6);
											$.append($$anchor, div_6);
										};

										var d_1 = $.derived(() => selected().some((block) => block.id === symbol().id));

										$.if(node_15, ($$render) => {
											if ($.get(d_1)) $$render(consequent_2);
										});
									}

									$.reset(div_5);
									$.append($$anchor, div_5);
								};

								let $0 = $.derived(() => $.get(active_marketplace_blocks_group_symbols) === undefined);

								Masonry(node_13, {
									columnCount: 2,
									class: 'col-span-3 min-h-0 p-3 pr-0 overflow-auto',
									get items() {
										return $.get(active_marketplace_blocks_group_symbols);
									},

									get loading() {
										return $.get($0);
									},
									children,
									$$slots: { default: true }
								});
							}

							$.append($$anchor, fragment_8);
						},
						$$slots: { default: true }
					});
				});

				$.reset(div);

				var div_7 = $.sibling(div, 2);
				var div_8 = $.child(div_7);
				var div_9 = $.child(div_8);
				var node_17 = $.sibling($.child(div_9), 2);

				{
					var consequent_3 = ($$anchor) => {
						var span = root_9();
						var text_2 = $.only_child(span);

						$.template_effect(() => $.set_text(text_2, `(${$.get(selected_symbols).length ?? ''})`));
						$.append($$anchor, span);
					};

					$.if(node_17, ($$render) => {
						if ($.get(selected_symbols).length > 0) $$render(consequent_3);
					});
				}

				$.reset(div_9);

				var node_18 = $.sibling(div_9, 2);

				{
					var consequent_4 = ($$anchor) => {
						var button_2 = root_10();

						$.delegated('click', button_2, () => selected([]));
						$.append($$anchor, button_2);
					};

					$.if(node_18, ($$render) => {
						if ($.get(selected_symbols).length > 0) $$render(consequent_4);
					});
				}

				$.reset(div_8);

				var node_19 = $.sibling(div_8, 2);

				{
					var consequent_5 = ($$anchor) => {
						var div_10 = root_12();

						$.each(div_10, 29, () => $.get(selected_symbols), (symbol) => symbol?.id, ($$anchor, symbol) => {
							var div_11 = root_11();
							var node_20 = $.child(div_11);

							SymbolButton(node_20, {
								get symbol() {
									return $.get(symbol);
								}
							});

							var button_3 = $.sibling(node_20, 2);

							$.reset(div_11);
							$.delegated('click', button_3, () => remove_block($.get(symbol).id));
							$.animation(div_11, () => flip, () => ({ duration: 100 }));
							$.append($$anchor, div_11);
						});

						$.reset(div_10);
						$.append($$anchor, div_10);
					};

					var alternate_1 = ($$anchor) => {
						var div_12 = root_13();

						$.append($$anchor, div_12);
					};

					$.if(node_19, ($$render) => {
						if ($.get(selected_symbols).length > 0) $$render(consequent_5); else $$render(alternate_1, -1);
					});
				}

				$.reset(div_7);
				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		});
	});

	$.append($$anchor, fragment);
	$.pop();
}

$.delegate(['click']);