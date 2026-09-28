import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as Sidebar from '$lib/components/ui/sidebar';
import * as Dialog from '$lib/components/ui/dialog';
import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
import * as AlertDialog from '$lib/components/ui/alert-dialog';
import { Input } from '$lib/components/ui/input';
import * as RadioGroup from '$lib/components/ui/radio-group';
import { Label } from '$lib/components/ui/label';
import { Separator } from '$lib/components/ui/separator';
import { Button } from '$lib/components/ui/button';
import EmptyState from '$lib/components/EmptyState.svelte';
import DropZone from '$lib/components/DropZone.svelte';
import Masonry from '$lib/components/Masonry.svelte';

import {
	CirclePlus,
	Cuboid,
	Code,
	Upload,
	Download,
	SquarePen,
	Trash2,
	ChevronDown,
	Loader,
	Loader2,
	EllipsisVertical,
	ArrowLeftRight,
	Info,
	Plus,
	MousePointer,
	Edit3,
	Share,
	Store
} from 'lucide-svelte';

import SymbolButton from '$lib/components/SymbolButton.svelte';
import { browser } from '$app/environment';
import { page } from '$app/state';
import { beforeNavigate, goto } from '$app/navigation';
import { useSidebar } from '$lib/components/ui/sidebar';

import {
	LibrarySymbolGroups,
	LibrarySymbols,
	LibrarySymbolFields,
	LibrarySymbolEntries,
	SiteSymbols
} from '$lib/pocketbase/collections';

import { useImportLibrarySymbol } from '$lib/workers/ImportSymbol.svelte';
import { tick } from 'svelte';
import { BlockEditor } from '$lib/builder/views/modal';
import { useExportLibrarySymbol } from '$lib/workers/ExportSymbol.svelte';
import { self } from '$lib/pocketbase/managers';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<h2 class="text-lg font-semibold leading-none tracking-tight">Rename group</h2> <p class="text-muted-foreground text-sm">Enter a new name for your group</p> <form><!> <!></form>`, 1);
var root_2 = $.from_html(`This action cannot be undone. This will permanently delete <strong> </strong> and <strong>all</strong> it's blocks.`, 1);
var root_3 = $.from_html(`<div class="animate-spin absolute"><!></div>`);
var root_4 = $.from_html(`<button><!> <span class="sr-only">More</span></button>`);
var root_5 = $.from_html(`<!> <span>Rename</span>`, 1);
var root_6 = $.from_html(`<!> <span>Delete</span>`, 1);
var root_7 = $.from_html(`<!> Create Block`, 1);
var root_8 = $.from_html(`<!> Import Block`, 1);
var root_9 = $.from_html(`<div class="flex flex-col items-center justify-center gap-4 py-8"><!> <p class="text-sm text-muted-foreground">Loading blocks...</p></div>`);
var root_10 = $.from_html(`<!> <span>Edit</span>`, 1);
var root_11 = $.from_html(`<!> <span>Export</span>`, 1);
var root_12 = $.from_html(`<!> <span>Move</span>`, 1);
var root_13 = $.from_html(`<!> <!> <!> <!> <!>`, 1);
var root_14 = $.from_html(`<!> <span>Create Block</span>`, 1);
var root_15 = $.from_html(`<!> <span>Browse Marketplace</span>`, 1);
var root_16 = $.from_html(`<div class="flex flex-col items-center justify-center gap-6 flex-1 h-[50vh]"><div class="flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full dark:bg-gray-800"><!></div> <div class="space-y-2 text-center"><h2 class="text-2xl font-bold tracking-tight">No Blocks to display</h2> <p class="text-gray-500 dark:text-gray-400 text-balance max-w-[30rem]">Blocks are components you can add to any site. When you create one it'll show up here.</p></div> <div class="flex gap-3"><!> <!></div></div>`);
var root_17 = $.from_html(`<div class="flex items-center space-x-2"><!> <!></div>`);
var root_18 = $.from_html(`<div class="grid gap-4"><div class="space-y-2"><h4 class="font-medium leading-none">Move to group</h4> <p class="text-muted-foreground text-sm">Select a group for this block</p></div> <!> <div class="flex justify-end"><!></div></div>`);
var root_19 = $.from_html(`<h2 class="text-lg font-semibold leading-none tracking-tight">Rename Block</h2> <p class="text-muted-foreground text-sm">Enter a new name for your Block</p> <form><!> <!></form>`, 1);
var root_20 = $.from_html(`This action cannot be undone. This will permanently delete <strong> </strong> and remove all associated data.`, 1);
var root_21 = $.from_html(`<div class="flex items-center justify-center py-8"><div class="animate-spin"><!></div> <span class="ml-3">Importing block...</span></div>`);
var root_22 = $.from_html(`<h2 class="text-lg font-semibold leading-none tracking-tight">Import Block</h2> <p class="text-muted-foreground text-sm mb-4">Import a block from a JSON file exported from another site.</p> <!> <!>`, 1);
var root_23 = $.from_html(`<h2 class="text-lg font-semibold leading-none tracking-tight">How Blocks Work in Primo</h2> <p class="text-muted-foreground text-sm mb-6">Blocks are reusable components that you can add to any page on your sites.</p> <div class="space-y-4"><div class="flex gap-4"><div class="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center"><!></div> <div><h3 class="font-medium text-sm mb-1">Create or Import Blocks</h3> <p class="text-muted-foreground text-sm">Build custom blocks using the visual editor or import blocks from other sites. Organize them into groups for easy management.</p></div></div> <div class="flex gap-4"><div class="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center"><!></div> <div><h3 class="font-medium text-sm mb-1">Add Blocks to Pages</h3> <p class="text-muted-foreground text-sm">When editing a page, drag blocks from the sidebar into your page layout. Blocks can be positioned anywhere and customized with different content.</p></div></div> <div class="flex gap-4"><div class="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center"><!></div> <div><h3 class="font-medium text-sm mb-1">Customize Content</h3> <p class="text-muted-foreground text-sm">Each block can have different content on different pages. Edit text, images, and other content directly in the page editor.</p></div></div> <div class="flex gap-4"><div class="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center"><!></div> <div><h3 class="font-medium text-sm mb-1">Reuse Across Sites</h3> <p class="text-muted-foreground text-sm">Export blocks to share with other sites or import blocks from the marketplace to expand your component library.</p></div></div></div> <!>`, 1);
var root_24 = $.from_html(`<!> <!> <header class="flex h-14 shrink-0 items-center gap-2"><div class="flex flex-1 items-center gap-2 px-3"><!> <!> <div class="text-sm"> </div> <!></div> <div class="ml-auto mr-4 flex gap-2"><!> <!></div></header> <div class="flex flex-1 flex-col gap-4 px-4 pb-4 overflow-hidden"><!></div> <!> <!> <!> <!> <!> <!> <!>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	const active_symbol_group_id = $.derived(() => page.url.searchParams.get('group'));
	const active_symbol_id = $.derived(() => page.url.searchParams.get('block'));
	const symbol_groups = $.derived(() => LibrarySymbolGroups.list() ?? []);

	function update_library_url(search_params) {
		const url = new URL(page.url);

		for (const [key, value] of Object.entries(search_params)) {
			if (value) {
				url.searchParams.set(key, value);
			} else {
				url.searchParams.delete(key);
			}
		}

		goto(url, { replaceState: true, keepFocus: true, noScroll: true });
	}

	beforeNavigate((navigation) => {
		if (!browser || !$.get(active_symbol_id)) return;
		if (!navigation.to || navigation.to.url.pathname === page.url.pathname) return;

		const url = new URL(page.url);

		url.searchParams.delete('block');
		window.history.replaceState(window.history.state, '', url);
	});

	// Auto-select first group if none selected and groups exist
	$.user_effect(() => {
		if (!$.get(active_symbol_group_id) && $.get(symbol_groups).length > 0) {
			update_library_url({ group: $.get(symbol_groups)[0].id });
		}
	});

	const active_symbol_group = $.derived(() => $.get(active_symbol_group_id)
		? LibrarySymbolGroups.one($.get(active_symbol_group_id))
		: undefined);

	// Get symbols for the active group using direct query instead of relationship method
	const group_symbols = $.derived(() => $.get(active_symbol_group)?.symbols() ?? []);

	const sidebar = useSidebar();
	let creating_block = $.state(false);
	let is_info_dialog_open = $.state(false);

	function open_create_block() {
		$.set(creating_block, true);
	}

	async function create_first_group() {
		const group = LibrarySymbolGroups.create({ name: 'Default', index: 0 });

		await self.commit();

		const url = new URL(page.url);

		url.searchParams.set('group', group.id);
		goto(url, { replaceState: true });
	}

	let file = $.state(void 0);
	let is_importing = $.state(false);
	const importLibrarySymbol = $.derived(() => useImportLibrarySymbol($.get(file), $.get(active_symbol_group_id) ?? undefined));

	async function upload_block_file(newFile) {
		$.set(file, newFile, true);
		await tick();

		if (!$.get(file)) return;

		if (!$.get(active_symbol_group_id)) {
			console.error('No active symbol group selected');

			return;
		}

		$.set(is_importing, true);

		try {
			await $.get(importLibrarySymbol).run();
			$.set(upload_dialog_open, false);
			$.set(upload_file_invalid, false);
			$.set(file, undefined);
		} catch(error) {
			console.error('Failed to import symbol:', error);

			// Show more detailed error message
			if (error.response?.data) {
				console.error('PocketBase error details:', error.response.data);
			}

			$.set(upload_file_invalid, true);
			$.set(file, undefined);
		} finally {
			$.set(is_importing, false);
		}
	}

	let is_rename_open = $.state(false);
	let new_name = $.state('');

	$.user_effect(() => {
		if ($.get(active_symbol_group)) {
			$.set(new_name, $.get(active_symbol_group).name, true);
		}
	});

	async function handle_rename(e) {
		e.preventDefault();

		if (!$.get(active_symbol_group_id)) return;

		LibrarySymbolGroups.update($.get(active_symbol_group_id), { name: $.get(new_name) });
		await self.commit();
		$.set(is_rename_open, false);
	}

	let is_delete_open = $.state(false);
	let deleting = $.state(false);

	// Upload dialog state
	let upload_dialog_open = $.state(false);

	let upload_file_invalid = $.state(false);

	// Export symbol
	let symbol_to_export = $.state(void 0);

	const exportSymbol = $.derived(() => useExportLibrarySymbol($.get(symbol_to_export)?.id));

	async function export_symbol(symbol) {
		$.set(symbol_to_export, symbol, true);
		await tick();
		await $.get(exportSymbol).run();
	}

	async function handle_delete() {
		$.set(deleting, true);

		if (!$.get(active_symbol_group_id)) return;

		LibrarySymbolGroups.delete($.get(active_symbol_group_id));
		await self.commit();
		await goto('/admin/dashboard/library');
		$.set(deleting, false);
		$.set(is_delete_open, false);
	}

	let symbol_being_edited = $.state(void 0);
	let is_symbol_editor_open = $.state(false);

	function begin_symbol_edit(symbol) {
		update_library_url({ group: symbol.group, block: symbol.id });
	}

	$.user_effect(() => {
		if (!$.get(active_symbol_id)) {
			$.set(symbol_being_edited, undefined);
			$.set(is_symbol_editor_open, false);

			return;
		}

		const symbol = LibrarySymbols.one($.get(active_symbol_id));

		if (!symbol) return;

		$.set(symbol_being_edited, symbol, true);
		$.set(is_symbol_editor_open, true);

		if ($.get(active_symbol_group_id) !== symbol.group) {
			update_library_url({ group: symbol.group });
		}
	});

	// Symbol rename
	let symbol_being_renamed = $.state(null);

	let is_symbol_renamer_open = $.state(false);
	let symbol_new_name = $.state('');

	function begin_symbol_rename(symbol) {
		$.set(symbol_being_renamed, symbol, true);
		$.set(symbol_new_name, symbol.name, true);
		$.set(is_symbol_renamer_open, true);
	}

	async function handle_symbol_rename(e) {
		e.preventDefault();

		if (!$.get(symbol_being_renamed)) return;

		LibrarySymbols.update($.get(symbol_being_renamed).id, { name: $.get(symbol_new_name) });
		await self.commit();
		$.set(is_symbol_renamer_open, false);
		$.set(symbol_being_renamed, null);
	}

	// Symbol move
	let symbol_being_moved = $.state(null);

	let is_symbol_move_open = $.state(false);
	let selected_group_id = $.state('');

	function begin_symbol_move(symbol) {
		$.set(symbol_being_moved, symbol, true);

		const original_group_id = symbol.group;

		$.set(selected_group_id, original_group_id ?? '', true);
		$.set(is_symbol_move_open, true);
	}

	async function move_symbol() {
		if (!$.get(symbol_being_moved)) return;

		LibrarySymbols.update($.get(symbol_being_moved).id, { group: $.get(selected_group_id) });
		await self.commit();
		$.set(is_symbol_move_open, false);
		$.set(symbol_being_moved, null);
	}

	// Symbol delete
	let symbol_being_deleted = $.state(null);

	let is_delete_symbol_open = $.state(false);

	function begin_symbol_delete(symbol) {
		$.set(symbol_being_deleted, symbol, true);
		$.set(is_delete_symbol_open, true);
	}

	async function delete_library_symbol() {
		if (!$.get(symbol_being_deleted)) return;

		$.set(deleting, true);
		LibrarySymbols.delete($.get(symbol_being_deleted).id);
		await self.commit();
		$.set(is_delete_symbol_open, false);
		$.set(symbol_being_deleted, null);
		$.set(deleting, false);
	}

	let creating_block_has_unsaved_changes = $.state(false);
	let editing_block_has_unsaved_changes = $.state(false);
	var fragment = root_24();
	var node = $.first_child(fragment);

	$.component(node, () => Dialog.Root, ($$anchor, Dialog_Root) => {
		Dialog_Root($$anchor, {
			get open() {
				return $.get(is_rename_open);
			},

			set open($$value) {
				$.set(is_rename_open, $$value, true);
			},

			children: ($$anchor, $$slotProps) => {
				var fragment_1 = $.comment();
				var node_1 = $.first_child(fragment_1);

				$.component(node_1, () => Dialog.Content, ($$anchor, Dialog_Content) => {
					Dialog_Content($$anchor, {
						class: 'sm:max-w-[425px] pt-12 gap-0',
						children: ($$anchor, $$slotProps) => {
							var fragment_2 = root_1();
							var form = $.sibling($.first_child(fragment_2), 4);
							var node_2 = $.child(form);

							Input(node_2, {
								placeholder: 'Enter new group name',
								class: 'my-4',
								get value() {
									return $.get(new_name);
								},

								set value($$value) {
									$.set(new_name, $$value, true);
								}
							});

							var node_3 = $.sibling(node_2, 2);

							$.component(node_3, () => Dialog.Footer, ($$anchor, Dialog_Footer) => {
								Dialog_Footer($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_3 = root();
										var node_4 = $.first_child(fragment_3);

										Button(node_4, {
											type: 'button',
											variant: 'outline',
											onclick: () => $.set(is_rename_open, false),
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text = $.text('Cancel');

												$.append($$anchor, text);
											},
											$$slots: { default: true }
										});

										var node_5 = $.sibling(node_4, 2);

										Button(node_5, {
											type: 'submit',
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_1 = $.text('Rename');

												$.append($$anchor, text_1);
											},
											$$slots: { default: true }
										});

										$.append($$anchor, fragment_3);
									},
									$$slots: { default: true }
								});
							});

							$.reset(form);
							$.event('submit', form, handle_rename);
							$.append($$anchor, fragment_2);
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		});
	});

	var node_6 = $.sibling(node, 2);

	$.component(node_6, () => AlertDialog.Root, ($$anchor, AlertDialog_Root) => {
		AlertDialog_Root($$anchor, {
			get open() {
				return $.get(is_delete_open);
			},

			set open($$value) {
				$.set(is_delete_open, $$value, true);
			},

			children: ($$anchor, $$slotProps) => {
				var fragment_4 = $.comment();
				var node_7 = $.first_child(fragment_4);

				$.component(node_7, () => AlertDialog.Content, ($$anchor, AlertDialog_Content) => {
					AlertDialog_Content($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_5 = root();
							var node_8 = $.first_child(fragment_5);

							$.component(node_8, () => AlertDialog.Header, ($$anchor, AlertDialog_Header) => {
								AlertDialog_Header($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_6 = root();
										var node_9 = $.first_child(fragment_6);

										$.component(node_9, () => AlertDialog.Title, ($$anchor, AlertDialog_Title) => {
											AlertDialog_Title($$anchor, {
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_2 = $.text('Are you sure?');

													$.append($$anchor, text_2);
												},
												$$slots: { default: true }
											});
										});

										var node_10 = $.sibling(node_9, 2);

										$.component(node_10, () => AlertDialog.Description, ($$anchor, AlertDialog_Description) => {
											AlertDialog_Description($$anchor, {
												children: ($$anchor, $$slotProps) => {
													$.next();

													var fragment_7 = root_2();
													var strong = $.sibling($.first_child(fragment_7));
													var text_3 = $.only_child(strong, true);

													$.next(3);
													$.template_effect(() => $.set_text(text_3, $.get(active_symbol_group)?.name));
													$.append($$anchor, fragment_7);
												},
												$$slots: { default: true }
											});
										});

										$.append($$anchor, fragment_6);
									},
									$$slots: { default: true }
								});
							});

							var node_11 = $.sibling(node_8, 2);

							$.component(node_11, () => AlertDialog.Footer, ($$anchor, AlertDialog_Footer) => {
								AlertDialog_Footer($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_8 = root();
										var node_12 = $.first_child(fragment_8);

										$.component(node_12, () => AlertDialog.Cancel, ($$anchor, AlertDialog_Cancel) => {
											AlertDialog_Cancel($$anchor, {
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_4 = $.text('Cancel');

													$.append($$anchor, text_4);
												},
												$$slots: { default: true }
											});
										});

										var node_13 = $.sibling(node_12, 2);

										$.component(node_13, () => AlertDialog.Action, ($$anchor, AlertDialog_Action) => {
											AlertDialog_Action($$anchor, {
												onclick: handle_delete,
												class: 'bg-red-600 hover:bg-red-700',
												children: ($$anchor, $$slotProps) => {
													var fragment_9 = $.comment();
													var node_14 = $.first_child(fragment_9);

													{
														var consequent = ($$anchor) => {
															var div = root_3();
															var node_15 = $.child(div);

															Loader(node_15, {});
															$.reset(div);
															$.append($$anchor, div);
														};

														var alternate = ($$anchor) => {
															var text_5 = $.text();

															$.template_effect(() => $.set_text(text_5, `Delete ${$.get(active_symbol_group)?.name ?? ''}`));
															$.append($$anchor, text_5);
														};

														$.if(node_14, ($$render) => {
															if ($.get(deleting)) $$render(consequent); else $$render(alternate, -1);
														});
													}

													$.append($$anchor, fragment_9);
												},
												$$slots: { default: true }
											});
										});

										$.append($$anchor, fragment_8);
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_5);
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment_4);
			},
			$$slots: { default: true }
		});
	});

	var header = $.sibling(node_6, 2);
	var div_1 = $.child(header);
	var node_16 = $.child(div_1);

	$.component(node_16, () => Sidebar.Trigger, ($$anchor, Sidebar_Trigger) => {
		Sidebar_Trigger($$anchor, {});
	});

	var node_17 = $.sibling(node_16, 2);

	Separator(node_17, { orientation: 'vertical', class: 'mr-2 h-4' });

	var div_2 = $.sibling(node_17, 2);
	var text_6 = $.only_child(div_2, true);
	var node_18 = $.sibling(div_2, 2);

	$.component(node_18, () => DropdownMenu.Root, ($$anchor, DropdownMenu_Root) => {
		DropdownMenu_Root($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var fragment_11 = root();
				var node_19 = $.first_child(fragment_11);

				{
					const child = ($$anchor, $$arg0) => {
						let props = () => ($$arg0?.()).props;
						var button = root_4();

						$.attribute_effect(button, () => ({ ...props() }));

						var node_20 = $.child(button);

						ChevronDown(node_20, { class: 'h-4' });
						$.next(2);
						$.reset(button);
						$.append($$anchor, button);
					};

					$.component(node_19, () => DropdownMenu.Trigger, ($$anchor, DropdownMenu_Trigger) => {
						DropdownMenu_Trigger($$anchor, { child, $$slots: { child: true } });
					});
				}

				var node_21 = $.sibling(node_19, 2);

				{
					let $0 = $.derived(() => sidebar.isMobile ? 'end' : 'start');

					$.component(node_21, () => DropdownMenu.Content, ($$anchor, DropdownMenu_Content) => {
						DropdownMenu_Content($$anchor, {
							class: 'w-56 rounded-lg',
							side: 'bottom',
							get align() {
								return $.get($0);
							},

							children: ($$anchor, $$slotProps) => {
								var fragment_12 = root();
								var node_22 = $.first_child(fragment_12);

								$.component(node_22, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item) => {
									DropdownMenu_Item($$anchor, {
										onclick: () => $.set(is_rename_open, true),
										children: ($$anchor, $$slotProps) => {
											var fragment_13 = root_5();
											var node_23 = $.first_child(fragment_13);

											SquarePen(node_23, { class: 'text-muted-foreground' });
											$.next(2);
											$.append($$anchor, fragment_13);
										},
										$$slots: { default: true }
									});
								});

								var node_24 = $.sibling(node_22, 2);

								$.component(node_24, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item_1) => {
									DropdownMenu_Item_1($$anchor, {
										onclick: () => $.set(is_delete_open, true),
										children: ($$anchor, $$slotProps) => {
											var fragment_14 = root_6();
											var node_25 = $.first_child(fragment_14);

											Trash2(node_25, { class: 'text-muted-foreground' });
											$.next(2);
											$.append($$anchor, fragment_14);
										},
										$$slots: { default: true }
									});
								});

								$.append($$anchor, fragment_12);
							},
							$$slots: { default: true }
						});
					});
				}

				$.append($$anchor, fragment_11);
			},
			$$slots: { default: true }
		});
	});

	$.reset(div_1);

	var div_3 = $.sibling(div_1, 2);
	var node_26 = $.child(div_3);

	Button(node_26, {
		size: 'sm',
		variant: 'ghost',
		onclick: () => $.set(is_info_dialog_open, true),
		children: ($$anchor, $$slotProps) => {
			Info($$anchor, { class: 'h-4 w-4' });
		},
		$$slots: { default: true }
	});

	var node_27 = $.sibling(node_26, 2);

	{
		var consequent_1 = ($$anchor) => {
			var fragment_16 = root();
			var node_28 = $.first_child(fragment_16);

			Button(node_28, {
				size: 'sm',
				variant: 'outline',
				onclick: open_create_block,
				children: ($$anchor, $$slotProps) => {
					var fragment_17 = root_7();
					var node_29 = $.first_child(fragment_17);

					CirclePlus(node_29, { class: 'h-4 w-4' });
					$.next();
					$.append($$anchor, fragment_17);
				},
				$$slots: { default: true }
			});

			var node_30 = $.sibling(node_28, 2);

			Button(node_30, {
				size: 'sm',
				variant: 'outline',
				onclick: () => $.set(upload_dialog_open, true),
				children: ($$anchor, $$slotProps) => {
					var fragment_18 = root_8();
					var node_31 = $.first_child(fragment_18);

					Upload(node_31, { class: 'h-4 w-4' });
					$.next();
					$.append($$anchor, fragment_18);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_16);
		};

		$.if(node_27, ($$render) => {
			if ($.get(active_symbol_group_id)) $$render(consequent_1);
		});
	}

	$.reset(div_3);
	$.reset(header);

	var div_4 = $.sibling(header, 2);
	var node_32 = $.child(div_4);

	{
		var consequent_2 = ($$anchor) => {
			{
				let $0 = $.derived(() => ({
					label: 'Create First Group',
					icon: CirclePlus,
					onclick: create_first_group
				}));

				EmptyState($$anchor, {
					class: 'h-[50vh]',
					get icon() {
						return Cuboid;
					},
					title: 'No Block Groups',
					description: 'Create your first block group to start organizing your components.',
					get button() {
						return $.get($0);
					}
				});
			}
		};

		var alternate_2 = ($$anchor) => {
			var fragment_20 = $.comment();
			var node_33 = $.first_child(fragment_20);

			$.key(node_33, () => $.get(active_symbol_group_id), ($$anchor) => {
				var fragment_21 = $.comment();
				var node_34 = $.first_child(fragment_21);

				{
					var consequent_3 = ($$anchor) => {
						var div_5 = root_9();
						var node_35 = $.child(div_5);

						Loader2(node_35, { class: 'h-8 w-8 animate-spin text-muted-foreground' });
						$.next(2);
						$.reset(div_5);
						$.append($$anchor, div_5);
					};

					var consequent_4 = ($$anchor) => {
						{
							const children = ($$anchor, symbol = $.noop) => {
								SymbolButton($$anchor, {
									get symbol() {
										return symbol();
									},
									onclick: () => begin_symbol_edit(symbol()),
									children: ($$anchor, $$slotProps) => {
										var fragment_24 = $.comment();
										var node_36 = $.first_child(fragment_24);

										$.component(node_36, () => DropdownMenu.Root, ($$anchor, DropdownMenu_Root_1) => {
											DropdownMenu_Root_1($$anchor, {
												children: ($$anchor, $$slotProps) => {
													var fragment_25 = root();
													var node_37 = $.first_child(fragment_25);

													$.component(node_37, () => DropdownMenu.Trigger, ($$anchor, DropdownMenu_Trigger_1) => {
														DropdownMenu_Trigger_1($$anchor, {
															children: ($$anchor, $$slotProps) => {
																EllipsisVertical($$anchor, { size: 14 });
															},
															$$slots: { default: true }
														});
													});

													var node_38 = $.sibling(node_37, 2);

													$.component(node_38, () => DropdownMenu.Content, ($$anchor, DropdownMenu_Content_1) => {
														DropdownMenu_Content_1($$anchor, {
															children: ($$anchor, $$slotProps) => {
																var fragment_27 = root_13();
																var node_39 = $.first_child(fragment_27);

																$.component(node_39, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item_2) => {
																	DropdownMenu_Item_2($$anchor, {
																		onclick: () => begin_symbol_edit(symbol()),
																		children: ($$anchor, $$slotProps) => {
																			var fragment_28 = root_10();
																			var node_40 = $.first_child(fragment_28);

																			Code(node_40, { class: 'h-4 w-4' });
																			$.next(2);
																			$.append($$anchor, fragment_28);
																		},
																		$$slots: { default: true }
																	});
																});

																var node_41 = $.sibling(node_39, 2);

																$.component(node_41, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item_3) => {
																	DropdownMenu_Item_3($$anchor, {
																		onclick: () => export_symbol(symbol()),
																		children: ($$anchor, $$slotProps) => {
																			var fragment_29 = root_11();
																			var node_42 = $.first_child(fragment_29);

																			Download(node_42, { class: 'h-4 w-4' });
																			$.next(2);
																			$.append($$anchor, fragment_29);
																		},
																		$$slots: { default: true }
																	});
																});

																var node_43 = $.sibling(node_41, 2);

																$.component(node_43, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item_4) => {
																	DropdownMenu_Item_4($$anchor, {
																		onclick: () => begin_symbol_move(symbol()),
																		children: ($$anchor, $$slotProps) => {
																			var fragment_30 = root_12();
																			var node_44 = $.first_child(fragment_30);

																			ArrowLeftRight(node_44, { class: 'h-4 w-4' });
																			$.next(2);
																			$.append($$anchor, fragment_30);
																		},
																		$$slots: { default: true }
																	});
																});

																var node_45 = $.sibling(node_43, 2);

																$.component(node_45, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item_5) => {
																	DropdownMenu_Item_5($$anchor, {
																		onclick: () => begin_symbol_rename(symbol()),
																		children: ($$anchor, $$slotProps) => {
																			var fragment_31 = root_5();
																			var node_46 = $.first_child(fragment_31);

																			SquarePen(node_46, { class: 'h-4 w-4' });
																			$.next(2);
																			$.append($$anchor, fragment_31);
																		},
																		$$slots: { default: true }
																	});
																});

																var node_47 = $.sibling(node_45, 2);

																$.component(node_47, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item_6) => {
																	DropdownMenu_Item_6($$anchor, {
																		onclick: () => begin_symbol_delete(symbol()),
																		class: 'text-red-500 hover:text-red-600 focus:text-red-600',
																		children: ($$anchor, $$slotProps) => {
																			var fragment_32 = root_6();
																			var node_48 = $.first_child(fragment_32);

																			Trash2(node_48, { class: 'h-4 w-4' });
																			$.next(2);
																			$.append($$anchor, fragment_32);
																		},
																		$$slots: { default: true }
																	});
																});

																$.append($$anchor, fragment_27);
															},
															$$slots: { default: true }
														});
													});

													$.append($$anchor, fragment_25);
												},
												$$slots: { default: true }
											});
										});

										$.append($$anchor, fragment_24);
									},
									$$slots: { default: true }
								});
							};

							Masonry($$anchor, {
								get items() {
									return $.get(group_symbols);
								},
								children,
								$$slots: { default: true }
							});
						}
					};

					var alternate_1 = ($$anchor) => {
						var div_6 = root_16();
						var div_7 = $.child(div_6);
						var node_49 = $.child(div_7);

						Cuboid(node_49, { class: 'w-10 h-10 text-gray-500 dark:text-gray-400' });
						$.reset(div_7);

						var div_8 = $.sibling(div_7, 4);
						var node_50 = $.child(div_8);

						Button(node_50, {
							onclick: open_create_block,
							variant: 'outline',
							children: ($$anchor, $$slotProps) => {
								var fragment_33 = root_14();
								var node_51 = $.first_child(fragment_33);

								CirclePlus(node_51, { class: 'h-4 w-4' });
								$.next(2);
								$.append($$anchor, fragment_33);
							},
							$$slots: { default: true }
						});

						var node_52 = $.sibling(node_50, 2);

						Button(node_52, {
							onclick: () => goto('/admin/dashboard/marketplace/blocks'),
							variant: 'outline',
							children: ($$anchor, $$slotProps) => {
								var fragment_34 = root_15();
								var node_53 = $.first_child(fragment_34);

								Store(node_53, { class: 'h-4 w-4' });
								$.next(2);
								$.append($$anchor, fragment_34);
							},
							$$slots: { default: true }
						});

						$.reset(div_8);
						$.reset(div_6);
						$.append($$anchor, div_6);
					};

					$.if(node_34, ($$render) => {
						if ($.get(group_symbols) === undefined) $$render(consequent_3); else if ($.get(group_symbols).length) $$render(consequent_4, 1); else $$render(alternate_1, -1);
					});
				}

				$.append($$anchor, fragment_21);
			});

			$.append($$anchor, fragment_20);
		};

		$.if(node_32, ($$render) => {
			if ($.get(symbol_groups).length === 0) $$render(consequent_2); else $$render(alternate_2, -1);
		});
	}

	$.reset(div_4);

	var node_54 = $.sibling(div_4, 2);

	$.component(node_54, () => Dialog.Root, ($$anchor, Dialog_Root_1) => {
		Dialog_Root_1($$anchor, {
			get open() {
				return $.get(is_symbol_move_open);
			},

			set open($$value) {
				$.set(is_symbol_move_open, $$value, true);
			},

			children: ($$anchor, $$slotProps) => {
				var fragment_35 = $.comment();
				var node_55 = $.first_child(fragment_35);

				$.component(node_55, () => Dialog.Content, ($$anchor, Dialog_Content_1) => {
					Dialog_Content_1($$anchor, {
						class: 'sm:max-w-[425px] pt-12 gap-0',
						children: ($$anchor, $$slotProps) => {
							var div_9 = root_18();
							var node_56 = $.sibling($.child(div_9), 2);

							$.component(node_56, () => RadioGroup.Root, ($$anchor, RadioGroup_Root) => {
								RadioGroup_Root($$anchor, {
									get value() {
										return $.get(selected_group_id);
									},

									set value($$value) {
										$.set(selected_group_id, $$value, true);
									},

									children: ($$anchor, $$slotProps) => {
										var fragment_36 = $.comment();
										var node_57 = $.first_child(fragment_36);

										$.each(node_57, 17, () => $.get(symbol_groups) ?? [], $.index, ($$anchor, group) => {
											var div_10 = root_17();
											var node_58 = $.child(div_10);

											$.component(node_58, () => RadioGroup.Item, ($$anchor, RadioGroup_Item) => {
												RadioGroup_Item($$anchor, {
													get value() {
														return $.get(group).id;
													},

													get id() {
														return $.get(group).id;
													}
												});
											});

											var node_59 = $.sibling(node_58, 2);

											Label(node_59, {
												get for() {
													return $.get(group).id;
												},

												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_7 = $.text();

													$.template_effect(() => $.set_text(text_7, $.get(group).name));
													$.append($$anchor, text_7);
												},
												$$slots: { default: true }
											});

											$.reset(div_10);
											$.append($$anchor, div_10);
										});

										$.append($$anchor, fragment_36);
									},
									$$slots: { default: true }
								});
							});

							var div_11 = $.sibling(node_56, 2);
							var node_60 = $.child(div_11);

							Button(node_60, {
								onclick: move_symbol,
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_8 = $.text('Move');

									$.append($$anchor, text_8);
								},
								$$slots: { default: true }
							});

							$.reset(div_11);
							$.reset(div_9);
							$.append($$anchor, div_9);
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment_35);
			},
			$$slots: { default: true }
		});
	});

	var node_61 = $.sibling(node_54, 2);

	$.component(node_61, () => Dialog.Root, ($$anchor, Dialog_Root_2) => {
		Dialog_Root_2($$anchor, {
			onOpenChange: (open) => {
				if (!open) {
					// Check for unsaved changes before closing
					if ($.get(creating_block_has_unsaved_changes)) {
						if (!confirm('You have unsaved changes. Are you sure you want to close without saving?')) {
							// Prevent closing by reopening the dialog
							$.set(creating_block, true);

							return;
						}

						// User confirmed, discard changes
						self.discard();
					}
				}
			},

			get open() {
				return $.get(creating_block);
			},

			set open($$value) {
				$.set(creating_block, $$value, true);
			},

			children: ($$anchor, $$slotProps) => {
				var fragment_38 = $.comment();
				var node_62 = $.first_child(fragment_38);

				$.component(node_62, () => Dialog.Content, ($$anchor, Dialog_Content_2) => {
					Dialog_Content_2($$anchor, {
						class: 'z-[999] w-[calc(100vw_-_1rem)] max-w-none h-[calc(100vh_-_1rem)] flex flex-col p-2 gap-2',
						children: ($$anchor, $$slotProps) => {
							BlockEditor($$anchor, {
								symbol_type: 'library',
								header: {
									title: `New Block`,
									button: {
										label: 'Save',
										onclick: () => {
											$.set(creating_block, false);
										}
									}
								},

								get has_unsaved_changes() {
									return $.get(creating_block_has_unsaved_changes);
								},

								set has_unsaved_changes($$value) {
									$.set(creating_block_has_unsaved_changes, $$value, true);
								}
							});
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment_38);
			},
			$$slots: { default: true }
		});
	});

	var node_63 = $.sibling(node_61, 2);

	$.component(node_63, () => Dialog.Root, ($$anchor, Dialog_Root_3) => {
		Dialog_Root_3($$anchor, {
			onOpenChange: (open) => {
				if (!open) {
					// Check for unsaved changes before closing
					if ($.get(editing_block_has_unsaved_changes)) {
						if (!confirm('You have unsaved changes. Are you sure you want to close without saving?')) {
							// Prevent closing by reopening the dialog
							$.set(is_symbol_editor_open, true);

							return;
						}

						// User confirmed, discard changes
						self.discard();
					}

					update_library_url({ block: null });
					$.set(symbol_being_edited, undefined);
				}
			},

			get open() {
				return $.get(is_symbol_editor_open);
			},

			set open($$value) {
				$.set(is_symbol_editor_open, $$value, true);
			},

			children: ($$anchor, $$slotProps) => {
				var fragment_40 = $.comment();
				var node_64 = $.first_child(fragment_40);

				$.component(node_64, () => Dialog.Content, ($$anchor, Dialog_Content_3) => {
					Dialog_Content_3($$anchor, {
						class: 'z-[999] w-[calc(100vw_-_1rem)] max-w-none h-[calc(100vh_-_1rem)] flex flex-col p-2 gap-2',
						children: ($$anchor, $$slotProps) => {
							{
								let $0 = $.derived(() => ({
									title: `Edit ${$.get(symbol_being_edited)?.name || 'Block'}`,
									button: {
										label: 'Save',
										onclick: () => {
											update_library_url({ block: null });
										}
									}
								}));

								BlockEditor($$anchor, {
									get block() {
										return $.get(symbol_being_edited);
									},
									symbol_type: 'library',
									get header() {
										return $.get($0);
									},

									get has_unsaved_changes() {
										return $.get(editing_block_has_unsaved_changes);
									},

									set has_unsaved_changes($$value) {
										$.set(editing_block_has_unsaved_changes, $$value, true);
									}
								});
							}
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment_40);
			},
			$$slots: { default: true }
		});
	});

	var node_65 = $.sibling(node_63, 2);

	$.component(node_65, () => Dialog.Root, ($$anchor, Dialog_Root_4) => {
		Dialog_Root_4($$anchor, {
			get open() {
				return $.get(is_symbol_renamer_open);
			},

			set open($$value) {
				$.set(is_symbol_renamer_open, $$value, true);
			},

			children: ($$anchor, $$slotProps) => {
				var fragment_42 = $.comment();
				var node_66 = $.first_child(fragment_42);

				$.component(node_66, () => Dialog.Content, ($$anchor, Dialog_Content_4) => {
					Dialog_Content_4($$anchor, {
						class: 'sm:max-w-[425px] pt-12 gap-0',
						children: ($$anchor, $$slotProps) => {
							var fragment_43 = root_19();
							var form_1 = $.sibling($.first_child(fragment_43), 4);
							var node_67 = $.child(form_1);

							Input(node_67, {
								placeholder: 'Enter new Block name',
								class: 'my-4',
								get value() {
									return $.get(symbol_new_name);
								},

								set value($$value) {
									$.set(symbol_new_name, $$value, true);
								}
							});

							var node_68 = $.sibling(node_67, 2);

							$.component(node_68, () => Dialog.Footer, ($$anchor, Dialog_Footer_1) => {
								Dialog_Footer_1($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_44 = root();
										var node_69 = $.first_child(fragment_44);

										Button(node_69, {
											type: 'button',
											variant: 'outline',
											onclick: () => $.set(is_symbol_renamer_open, false),
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_9 = $.text('Cancel');

												$.append($$anchor, text_9);
											},
											$$slots: { default: true }
										});

										var node_70 = $.sibling(node_69, 2);

										Button(node_70, {
											type: 'submit',
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_10 = $.text('Rename');

												$.append($$anchor, text_10);
											},
											$$slots: { default: true }
										});

										$.append($$anchor, fragment_44);
									},
									$$slots: { default: true }
								});
							});

							$.reset(form_1);
							$.event('submit', form_1, handle_symbol_rename);
							$.append($$anchor, fragment_43);
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment_42);
			},
			$$slots: { default: true }
		});
	});

	var node_71 = $.sibling(node_65, 2);

	$.component(node_71, () => AlertDialog.Root, ($$anchor, AlertDialog_Root_1) => {
		AlertDialog_Root_1($$anchor, {
			get open() {
				return $.get(is_delete_symbol_open);
			},

			set open($$value) {
				$.set(is_delete_symbol_open, $$value, true);
			},

			children: ($$anchor, $$slotProps) => {
				var fragment_45 = $.comment();
				var node_72 = $.first_child(fragment_45);

				$.component(node_72, () => AlertDialog.Content, ($$anchor, AlertDialog_Content_1) => {
					AlertDialog_Content_1($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_46 = root();
							var node_73 = $.first_child(fragment_46);

							$.component(node_73, () => AlertDialog.Header, ($$anchor, AlertDialog_Header_1) => {
								AlertDialog_Header_1($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_47 = root();
										var node_74 = $.first_child(fragment_47);

										$.component(node_74, () => AlertDialog.Title, ($$anchor, AlertDialog_Title_1) => {
											AlertDialog_Title_1($$anchor, {
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_11 = $.text('Are you sure?');

													$.append($$anchor, text_11);
												},
												$$slots: { default: true }
											});
										});

										var node_75 = $.sibling(node_74, 2);

										$.component(node_75, () => AlertDialog.Description, ($$anchor, AlertDialog_Description_1) => {
											AlertDialog_Description_1($$anchor, {
												children: ($$anchor, $$slotProps) => {
													$.next();

													var fragment_48 = root_20();
													var strong_1 = $.sibling($.first_child(fragment_48));
													var text_12 = $.only_child(strong_1, true);

													$.next();
													$.template_effect(() => $.set_text(text_12, $.get(symbol_being_deleted)?.name));
													$.append($$anchor, fragment_48);
												},
												$$slots: { default: true }
											});
										});

										$.append($$anchor, fragment_47);
									},
									$$slots: { default: true }
								});
							});

							var node_76 = $.sibling(node_73, 2);

							$.component(node_76, () => AlertDialog.Footer, ($$anchor, AlertDialog_Footer_1) => {
								AlertDialog_Footer_1($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_49 = root();
										var node_77 = $.first_child(fragment_49);

										$.component(node_77, () => AlertDialog.Cancel, ($$anchor, AlertDialog_Cancel_1) => {
											AlertDialog_Cancel_1($$anchor, {
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_13 = $.text('Cancel');

													$.append($$anchor, text_13);
												},
												$$slots: { default: true }
											});
										});

										var node_78 = $.sibling(node_77, 2);

										$.component(node_78, () => AlertDialog.Action, ($$anchor, AlertDialog_Action_1) => {
											AlertDialog_Action_1($$anchor, {
												onclick: delete_library_symbol,
												class: 'bg-red-600 hover:bg-red-700',
												children: ($$anchor, $$slotProps) => {
													var fragment_50 = $.comment();
													var node_79 = $.first_child(fragment_50);

													{
														var consequent_5 = ($$anchor) => {
															var div_12 = root_3();
															var node_80 = $.child(div_12);

															Loader(node_80, {});
															$.reset(div_12);
															$.append($$anchor, div_12);
														};

														var alternate_3 = ($$anchor) => {
															var text_14 = $.text();

															$.template_effect(() => $.set_text(text_14, `Delete ${$.get(symbol_being_deleted)?.name ?? ''}`));
															$.append($$anchor, text_14);
														};

														$.if(node_79, ($$render) => {
															if ($.get(deleting)) $$render(consequent_5); else $$render(alternate_3, -1);
														});
													}

													$.append($$anchor, fragment_50);
												},
												$$slots: { default: true }
											});
										});

										$.append($$anchor, fragment_49);
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_46);
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment_45);
			},
			$$slots: { default: true }
		});
	});

	var node_81 = $.sibling(node_71, 2);

	$.component(node_81, () => Dialog.Root, ($$anchor, Dialog_Root_5) => {
		Dialog_Root_5($$anchor, {
			get open() {
				return $.get(upload_dialog_open);
			},

			set open($$value) {
				$.set(upload_dialog_open, $$value, true);
			},

			children: ($$anchor, $$slotProps) => {
				var fragment_52 = $.comment();
				var node_82 = $.first_child(fragment_52);

				$.component(node_82, () => Dialog.Content, ($$anchor, Dialog_Content_5) => {
					Dialog_Content_5($$anchor, {
						class: 'sm:max-w-[500px] pt-12 gap-0',
						children: ($$anchor, $$slotProps) => {
							var fragment_53 = root_22();
							var node_83 = $.sibling($.first_child(fragment_53), 4);

							{
								var consequent_6 = ($$anchor) => {
									var div_13 = root_21();
									var div_14 = $.child(div_13);
									var node_84 = $.child(div_14);

									Loader(node_84, { class: 'h-8 w-8' });
									$.reset(div_14);
									$.next(2);
									$.reset(div_13);
									$.append($$anchor, div_13);
								};

								var alternate_4 = ($$anchor) => {
									DropZone($$anchor, {
										onupload: upload_block_file,
										get invalid() {
											return $.get(upload_file_invalid);
										},
										drop_text: 'Drop your block file here or click to browse',
										accept: '.json',
										class: 'mb-4'
									});
								};

								$.if(node_83, ($$render) => {
									if ($.get(is_importing)) $$render(consequent_6); else $$render(alternate_4, -1);
								});
							}

							var node_85 = $.sibling(node_83, 2);

							$.component(node_85, () => Dialog.Footer, ($$anchor, Dialog_Footer_2) => {
								Dialog_Footer_2($$anchor, {
									children: ($$anchor, $$slotProps) => {
										Button($$anchor, {
											type: 'button',
											variant: 'outline',
											onclick: () => {
												$.set(upload_dialog_open, false);
												$.set(upload_file_invalid, false);
											},

											get disabled() {
												return $.get(is_importing);
											},

											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_15 = $.text('Cancel');

												$.append($$anchor, text_15);
											},
											$$slots: { default: true }
										});
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_53);
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment_52);
			},
			$$slots: { default: true }
		});
	});

	var node_86 = $.sibling(node_81, 2);

	$.component(node_86, () => Dialog.Root, ($$anchor, Dialog_Root_6) => {
		Dialog_Root_6($$anchor, {
			get open() {
				return $.get(is_info_dialog_open);
			},

			set open($$value) {
				$.set(is_info_dialog_open, $$value, true);
			},

			children: ($$anchor, $$slotProps) => {
				var fragment_56 = $.comment();
				var node_87 = $.first_child(fragment_56);

				$.component(node_87, () => Dialog.Content, ($$anchor, Dialog_Content_6) => {
					Dialog_Content_6($$anchor, {
						class: 'sm:max-w-[525px] pt-12 gap-0',
						children: ($$anchor, $$slotProps) => {
							var fragment_57 = root_23();
							var div_15 = $.sibling($.first_child(fragment_57), 4);
							var div_16 = $.child(div_15);
							var div_17 = $.child(div_16);
							var node_88 = $.child(div_17);

							Plus(node_88, { class: 'w-3 h-3' });
							$.reset(div_17);
							$.next(2);
							$.reset(div_16);

							var div_18 = $.sibling(div_16, 2);
							var div_19 = $.child(div_18);
							var node_89 = $.child(div_19);

							MousePointer(node_89, { class: 'w-3 h-3' });
							$.reset(div_19);
							$.next(2);
							$.reset(div_18);

							var div_20 = $.sibling(div_18, 2);
							var div_21 = $.child(div_20);
							var node_90 = $.child(div_21);

							Edit3(node_90, { class: 'w-3 h-3' });
							$.reset(div_21);
							$.next(2);
							$.reset(div_20);

							var div_22 = $.sibling(div_20, 2);
							var div_23 = $.child(div_22);
							var node_91 = $.child(div_23);

							Share(node_91, { class: 'w-3 h-3' });
							$.reset(div_23);
							$.next(2);
							$.reset(div_22);
							$.reset(div_15);

							var node_92 = $.sibling(div_15, 2);

							$.component(node_92, () => Dialog.Footer, ($$anchor, Dialog_Footer_3) => {
								Dialog_Footer_3($$anchor, {
									class: 'mt-6',
									children: ($$anchor, $$slotProps) => {
										Button($$anchor, {
											type: 'button',
											onclick: () => $.set(is_info_dialog_open, false),
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_16 = $.text('Got it');

												$.append($$anchor, text_16);
											},
											$$slots: { default: true }
										});
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_57);
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment_56);
			},
			$$slots: { default: true }
		});
	});

	$.template_effect(() => $.set_text(text_6, $.get(active_symbol_group)?.name));
	$.append($$anchor, fragment);
	$.pop();
}