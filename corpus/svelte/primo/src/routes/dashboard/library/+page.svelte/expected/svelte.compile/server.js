import * as $ from 'svelte/internal/server';
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

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
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
			if (!browser || !active_symbol_id()) return;
			if (!navigation.to || navigation.to.url.pathname === page.url.pathname) return;

			const url = new URL(page.url);

			url.searchParams.delete('block');
			window.history.replaceState(window.history.state, '', url);
		});

		// Auto-select first group if none selected and groups exist
		const active_symbol_group = $.derived(() => active_symbol_group_id()
			? LibrarySymbolGroups.one(active_symbol_group_id())
			: undefined);

		// Get symbols for the active group using direct query instead of relationship method
		const group_symbols = $.derived(() => active_symbol_group()?.symbols() ?? []);

		const sidebar = useSidebar();
		let creating_block = false;
		let is_info_dialog_open = false;

		function open_create_block() {
			creating_block = true;
		}

		async function create_first_group() {
			const group = LibrarySymbolGroups.create({ name: 'Default', index: 0 });

			await self.commit();

			const url = new URL(page.url);

			url.searchParams.set('group', group.id);
			goto(url, { replaceState: true });
		}

		let file = void 0;
		let is_importing = false;
		const importLibrarySymbol = $.derived(() => useImportLibrarySymbol(file, active_symbol_group_id() ?? undefined));

		async function upload_block_file(newFile) {
			file = newFile;
			await tick();

			if (!file) return;

			if (!active_symbol_group_id()) {
				console.error('No active symbol group selected');

				return;
			}

			is_importing = true;

			try {
				await importLibrarySymbol().run();
				upload_dialog_open = false;
				upload_file_invalid = false;
				file = undefined;
			} catch(error) {
				console.error('Failed to import symbol:', error);

				// Show more detailed error message
				if (error.response?.data) {
					console.error('PocketBase error details:', error.response.data);
				}

				upload_file_invalid = true;
				file = undefined;
			} finally {
				is_importing = false;
			}
		}

		let is_rename_open = false;
		let new_name = '';

		async function handle_rename(e) {
			e.preventDefault();

			if (!active_symbol_group_id()) return;

			LibrarySymbolGroups.update(active_symbol_group_id(), { name: new_name });
			await self.commit();
			is_rename_open = false;
		}

		let is_delete_open = false;
		let deleting = false;

		// Upload dialog state
		let upload_dialog_open = false;

		let upload_file_invalid = false;

		// Export symbol
		let symbol_to_export = void 0;

		const exportSymbol = $.derived(() => useExportLibrarySymbol(symbol_to_export?.id));

		async function export_symbol(symbol) {
			symbol_to_export = symbol;
			await tick();
			await exportSymbol().run();
		}

		async function handle_delete() {
			deleting = true;

			if (!active_symbol_group_id()) return;

			LibrarySymbolGroups.delete(active_symbol_group_id());
			await self.commit();
			await goto('/admin/dashboard/library');
			deleting = false;
			is_delete_open = false;
		}

		let symbol_being_edited = void 0;
		let is_symbol_editor_open = false;

		function begin_symbol_edit(symbol) {
			update_library_url({ group: symbol.group, block: symbol.id });
		}

		// Symbol rename
		let symbol_being_renamed = null;

		let is_symbol_renamer_open = false;
		let symbol_new_name = '';

		function begin_symbol_rename(symbol) {
			symbol_being_renamed = symbol;
			symbol_new_name = symbol.name;
			is_symbol_renamer_open = true;
		}

		async function handle_symbol_rename(e) {
			e.preventDefault();

			if (!symbol_being_renamed) return;

			LibrarySymbols.update(symbol_being_renamed.id, { name: symbol_new_name });
			await self.commit();
			is_symbol_renamer_open = false;
			symbol_being_renamed = null;
		}

		// Symbol move
		let symbol_being_moved = null;

		let is_symbol_move_open = false;
		let selected_group_id = '';

		function begin_symbol_move(symbol) {
			symbol_being_moved = symbol;

			const original_group_id = symbol.group;

			selected_group_id = original_group_id ?? '';
			is_symbol_move_open = true;
		}

		async function move_symbol() {
			if (!symbol_being_moved) return;

			LibrarySymbols.update(symbol_being_moved.id, { group: selected_group_id });
			await self.commit();
			is_symbol_move_open = false;
			symbol_being_moved = null;
		}

		// Symbol delete
		let symbol_being_deleted = null;

		let is_delete_symbol_open = false;

		function begin_symbol_delete(symbol) {
			symbol_being_deleted = symbol;
			is_delete_symbol_open = true;
		}

		async function delete_library_symbol() {
			if (!symbol_being_deleted) return;

			deleting = true;
			LibrarySymbols.delete(symbol_being_deleted.id);
			await self.commit();
			is_delete_symbol_open = false;
			symbol_being_deleted = null;
			deleting = false;
		}

		let creating_block_has_unsaved_changes = false;
		let editing_block_has_unsaved_changes = false;
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			if (Dialog.Root) {
				$$renderer.push('<!--[-->');

				Dialog.Root($$renderer, {
					get open() {
						return is_rename_open;
					},

					set open($$value) {
						is_rename_open = $$value;
						$$settled = false;
					},

					children: ($$renderer) => {
						if (Dialog.Content) {
							$$renderer.push('<!--[-->');

							Dialog.Content($$renderer, {
								class: 'sm:max-w-[425px] pt-12 gap-0',
								children: ($$renderer) => {
									$$renderer.push(`<h2 class="text-lg font-semibold leading-none tracking-tight">Rename group</h2> <p class="text-muted-foreground text-sm">Enter a new name for your group</p> <form>`);

									Input($$renderer, {
										placeholder: 'Enter new group name',
										class: 'my-4',
										get value() {
											return new_name;
										},

										set value($$value) {
											new_name = $$value;
											$$settled = false;
										}
									});

									$$renderer.push(`<!----> `);

									if (Dialog.Footer) {
										$$renderer.push('<!--[-->');

										Dialog.Footer($$renderer, {
											children: ($$renderer) => {
												Button($$renderer, {
													type: 'button',
													variant: 'outline',
													onclick: () => is_rename_open = false,
													children: ($$renderer) => {
														$$renderer.push(`<!---->Cancel`);
													},
													$$slots: { default: true }
												});

												$$renderer.push(`<!----> `);

												Button($$renderer, {
													type: 'submit',
													children: ($$renderer) => {
														$$renderer.push(`<!---->Rename`);
													},
													$$slots: { default: true }
												});

												$$renderer.push(`<!---->`);
											},
											$$slots: { default: true }
										});

										$$renderer.push('<!--]-->');
									} else {
										$$renderer.push('<!--[!-->');
										$$renderer.push('<!--]-->');
									}

									$$renderer.push(`</form>`);
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

			if (AlertDialog.Root) {
				$$renderer.push('<!--[-->');

				AlertDialog.Root($$renderer, {
					get open() {
						return is_delete_open;
					},

					set open($$value) {
						is_delete_open = $$value;
						$$settled = false;
					},

					children: ($$renderer) => {
						if (AlertDialog.Content) {
							$$renderer.push('<!--[-->');

							AlertDialog.Content($$renderer, {
								children: ($$renderer) => {
									if (AlertDialog.Header) {
										$$renderer.push('<!--[-->');

										AlertDialog.Header($$renderer, {
											children: ($$renderer) => {
												if (AlertDialog.Title) {
													$$renderer.push('<!--[-->');

													AlertDialog.Title($$renderer, {
														children: ($$renderer) => {
															$$renderer.push(`<!---->Are you sure?`);
														},
														$$slots: { default: true }
													});

													$$renderer.push('<!--]-->');
												} else {
													$$renderer.push('<!--[!-->');
													$$renderer.push('<!--]-->');
												}

												$$renderer.push(` `);

												if (AlertDialog.Description) {
													$$renderer.push('<!--[-->');

													AlertDialog.Description($$renderer, {
														children: ($$renderer) => {
															$$renderer.push(`<!---->This action cannot be undone. This will permanently delete <strong>${$.escape(active_symbol_group()?.name)}</strong> and <strong>all</strong> it's blocks.`);
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

									if (AlertDialog.Footer) {
										$$renderer.push('<!--[-->');

										AlertDialog.Footer($$renderer, {
											children: ($$renderer) => {
												if (AlertDialog.Cancel) {
													$$renderer.push('<!--[-->');

													AlertDialog.Cancel($$renderer, {
														children: ($$renderer) => {
															$$renderer.push(`<!---->Cancel`);
														},
														$$slots: { default: true }
													});

													$$renderer.push('<!--]-->');
												} else {
													$$renderer.push('<!--[!-->');
													$$renderer.push('<!--]-->');
												}

												$$renderer.push(` `);

												if (AlertDialog.Action) {
													$$renderer.push('<!--[-->');

													AlertDialog.Action($$renderer, {
														onclick: handle_delete,
														class: 'bg-red-600 hover:bg-red-700',
														children: ($$renderer) => {
															if (deleting) {
																$$renderer.push(`<!--[0--><div class="animate-spin absolute">`);
																Loader($$renderer, {});
																$$renderer.push(`<!----></div>`);
															} else {
																$$renderer.push(`<!--[-1-->Delete ${$.escape(active_symbol_group()?.name)}`);
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

			$$renderer.push(` <header class="flex h-14 shrink-0 items-center gap-2"><div class="flex flex-1 items-center gap-2 px-3">`);

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
			$$renderer.push(`<!----> <div class="text-sm">${$.escape(active_symbol_group()?.name)}</div> `);

			if (DropdownMenu.Root) {
				$$renderer.push('<!--[-->');

				DropdownMenu.Root($$renderer, {
					children: ($$renderer) => {
						{
							function child($$renderer, { props }) {
								$$renderer.push(`<button${$.attributes({ ...props })}>`);
								ChevronDown($$renderer, { class: 'h-4' });
								$$renderer.push(`<!----> <span class="sr-only">More</span></button>`);
							}

							if (DropdownMenu.Trigger) {
								$$renderer.push('<!--[-->');
								DropdownMenu.Trigger($$renderer, { child, $$slots: { child: true } });
								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}
						}

						$$renderer.push(` `);

						if (DropdownMenu.Content) {
							$$renderer.push('<!--[-->');

							DropdownMenu.Content($$renderer, {
								class: 'w-56 rounded-lg',
								side: 'bottom',
								align: sidebar.isMobile ? 'end' : 'start',
								children: ($$renderer) => {
									if (DropdownMenu.Item) {
										$$renderer.push('<!--[-->');

										DropdownMenu.Item($$renderer, {
											onclick: () => is_rename_open = true,
											children: ($$renderer) => {
												SquarePen($$renderer, { class: 'text-muted-foreground' });
												$$renderer.push(`<!----> <span>Rename</span>`);
											},
											$$slots: { default: true }
										});

										$$renderer.push('<!--]-->');
									} else {
										$$renderer.push('<!--[!-->');
										$$renderer.push('<!--]-->');
									}

									$$renderer.push(` `);

									if (DropdownMenu.Item) {
										$$renderer.push('<!--[-->');

										DropdownMenu.Item($$renderer, {
											onclick: () => is_delete_open = true,
											children: ($$renderer) => {
												Trash2($$renderer, { class: 'text-muted-foreground' });
												$$renderer.push(`<!----> <span>Delete</span>`);
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

			$$renderer.push(`</div> <div class="ml-auto mr-4 flex gap-2">`);

			Button($$renderer, {
				size: 'sm',
				variant: 'ghost',
				onclick: () => is_info_dialog_open = true,
				children: ($$renderer) => {
					Info($$renderer, { class: 'h-4 w-4' });
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			if (active_symbol_group_id()) {
				$$renderer.push('<!--[0-->');

				Button($$renderer, {
					size: 'sm',
					variant: 'outline',
					onclick: open_create_block,
					children: ($$renderer) => {
						CirclePlus($$renderer, { class: 'h-4 w-4' });
						$$renderer.push(`<!----> Create Block`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Button($$renderer, {
					size: 'sm',
					variant: 'outline',
					onclick: () => upload_dialog_open = true,
					children: ($$renderer) => {
						Upload($$renderer, { class: 'h-4 w-4' });
						$$renderer.push(`<!----> Import Block`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!---->`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></div></header> <div class="flex flex-1 flex-col gap-4 px-4 pb-4 overflow-hidden">`);

			if (symbol_groups().length === 0) {
				$$renderer.push('<!--[0-->');

				EmptyState($$renderer, {
					class: 'h-[50vh]',
					icon: Cuboid,
					title: 'No Block Groups',
					description: 'Create your first block group to start organizing your components.',
					button: {
						label: 'Create First Group',
						icon: CirclePlus,
						onclick: create_first_group
					}
				});
			} else {
				$$renderer.push(`<!--[-1--><!---->`);

				{
					if (group_symbols() === undefined) {
						$$renderer.push(`<!--[0--><div class="flex flex-col items-center justify-center gap-4 py-8">`);
						Loader2($$renderer, { class: 'h-8 w-8 animate-spin text-muted-foreground' });
						$$renderer.push(`<!----> <p class="text-sm text-muted-foreground">Loading blocks...</p></div>`);
					} else if (group_symbols().length) {
						$$renderer.push('<!--[1-->');

						{
							function children($$renderer, symbol) {
								SymbolButton($$renderer, {
									symbol,
									onclick: () => begin_symbol_edit(symbol),
									children: ($$renderer) => {
										if (DropdownMenu.Root) {
											$$renderer.push('<!--[-->');

											DropdownMenu.Root($$renderer, {
												children: ($$renderer) => {
													if (DropdownMenu.Trigger) {
														$$renderer.push('<!--[-->');

														DropdownMenu.Trigger($$renderer, {
															children: ($$renderer) => {
																EllipsisVertical($$renderer, { size: 14 });
															},
															$$slots: { default: true }
														});

														$$renderer.push('<!--]-->');
													} else {
														$$renderer.push('<!--[!-->');
														$$renderer.push('<!--]-->');
													}

													$$renderer.push(` `);

													if (DropdownMenu.Content) {
														$$renderer.push('<!--[-->');

														DropdownMenu.Content($$renderer, {
															children: ($$renderer) => {
																if (DropdownMenu.Item) {
																	$$renderer.push('<!--[-->');

																	DropdownMenu.Item($$renderer, {
																		onclick: () => begin_symbol_edit(symbol),
																		children: ($$renderer) => {
																			Code($$renderer, { class: 'h-4 w-4' });
																			$$renderer.push(`<!----> <span>Edit</span>`);
																		},
																		$$slots: { default: true }
																	});

																	$$renderer.push('<!--]-->');
																} else {
																	$$renderer.push('<!--[!-->');
																	$$renderer.push('<!--]-->');
																}

																$$renderer.push(` `);

																if (DropdownMenu.Item) {
																	$$renderer.push('<!--[-->');

																	DropdownMenu.Item($$renderer, {
																		onclick: () => export_symbol(symbol),
																		children: ($$renderer) => {
																			Download($$renderer, { class: 'h-4 w-4' });
																			$$renderer.push(`<!----> <span>Export</span>`);
																		},
																		$$slots: { default: true }
																	});

																	$$renderer.push('<!--]-->');
																} else {
																	$$renderer.push('<!--[!-->');
																	$$renderer.push('<!--]-->');
																}

																$$renderer.push(` `);

																if (DropdownMenu.Item) {
																	$$renderer.push('<!--[-->');

																	DropdownMenu.Item($$renderer, {
																		onclick: () => begin_symbol_move(symbol),
																		children: ($$renderer) => {
																			ArrowLeftRight($$renderer, { class: 'h-4 w-4' });
																			$$renderer.push(`<!----> <span>Move</span>`);
																		},
																		$$slots: { default: true }
																	});

																	$$renderer.push('<!--]-->');
																} else {
																	$$renderer.push('<!--[!-->');
																	$$renderer.push('<!--]-->');
																}

																$$renderer.push(` `);

																if (DropdownMenu.Item) {
																	$$renderer.push('<!--[-->');

																	DropdownMenu.Item($$renderer, {
																		onclick: () => begin_symbol_rename(symbol),
																		children: ($$renderer) => {
																			SquarePen($$renderer, { class: 'h-4 w-4' });
																			$$renderer.push(`<!----> <span>Rename</span>`);
																		},
																		$$slots: { default: true }
																	});

																	$$renderer.push('<!--]-->');
																} else {
																	$$renderer.push('<!--[!-->');
																	$$renderer.push('<!--]-->');
																}

																$$renderer.push(` `);

																if (DropdownMenu.Item) {
																	$$renderer.push('<!--[-->');

																	DropdownMenu.Item($$renderer, {
																		onclick: () => begin_symbol_delete(symbol),
																		class: 'text-red-500 hover:text-red-600 focus:text-red-600',
																		children: ($$renderer) => {
																			Trash2($$renderer, { class: 'h-4 w-4' });
																			$$renderer.push(`<!----> <span>Delete</span>`);
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
							}

							Masonry($$renderer, { items: group_symbols(), children, $$slots: { default: true } });
						}
					} else {
						$$renderer.push(`<!--[-1--><div class="flex flex-col items-center justify-center gap-6 flex-1 h-[50vh]"><div class="flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full dark:bg-gray-800">`);
						Cuboid($$renderer, { class: 'w-10 h-10 text-gray-500 dark:text-gray-400' });
						$$renderer.push(`<!----></div> <div class="space-y-2 text-center"><h2 class="text-2xl font-bold tracking-tight">No Blocks to display</h2> <p class="text-gray-500 dark:text-gray-400 text-balance max-w-[30rem]">Blocks are components you can add to any site. When you create one it'll show up here.</p></div> <div class="flex gap-3">`);

						Button($$renderer, {
							onclick: open_create_block,
							variant: 'outline',
							children: ($$renderer) => {
								CirclePlus($$renderer, { class: 'h-4 w-4' });
								$$renderer.push(`<!----> <span>Create Block</span>`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						Button($$renderer, {
							onclick: () => goto('/admin/dashboard/marketplace/blocks'),
							variant: 'outline',
							children: ($$renderer) => {
								Store($$renderer, { class: 'h-4 w-4' });
								$$renderer.push(`<!----> <span>Browse Marketplace</span>`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----></div></div>`);
					}

					$$renderer.push(`<!--]-->`);
				}

				$$renderer.push(`<!---->`);
			}

			$$renderer.push(`<!--]--></div> `);

			if (Dialog.Root) {
				$$renderer.push('<!--[-->');

				Dialog.Root($$renderer, {
					get open() {
						return is_symbol_move_open;
					},

					set open($$value) {
						is_symbol_move_open = $$value;
						$$settled = false;
					},

					children: ($$renderer) => {
						if (Dialog.Content) {
							$$renderer.push('<!--[-->');

							Dialog.Content($$renderer, {
								class: 'sm:max-w-[425px] pt-12 gap-0',
								children: ($$renderer) => {
									$$renderer.push(`<div class="grid gap-4"><div class="space-y-2"><h4 class="font-medium leading-none">Move to group</h4> <p class="text-muted-foreground text-sm">Select a group for this block</p></div> `);

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

												const each_array = $.ensure_array_like(symbol_groups() ?? []);

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
										onclick: move_symbol,
										children: ($$renderer) => {
											$$renderer.push(`<!---->Move`);
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

			$$renderer.push(` `);

			if (Dialog.Root) {
				$$renderer.push('<!--[-->');

				Dialog.Root($$renderer, {
					onOpenChange: (open) => {
						if (!open) {
							// Check for unsaved changes before closing
							if (creating_block_has_unsaved_changes) {
								if (!confirm('You have unsaved changes. Are you sure you want to close without saving?')) {
									// Prevent closing by reopening the dialog
									creating_block = true;

									return;
								}

								// User confirmed, discard changes
								self.discard();
							}
						}
					},

					get open() {
						return creating_block;
					},

					set open($$value) {
						creating_block = $$value;
						$$settled = false;
					},

					children: ($$renderer) => {
						if (Dialog.Content) {
							$$renderer.push('<!--[-->');

							Dialog.Content($$renderer, {
								class: 'z-[999] w-[calc(100vw_-_1rem)] max-w-none h-[calc(100vh_-_1rem)] flex flex-col p-2 gap-2',
								children: ($$renderer) => {
									BlockEditor($$renderer, {
										symbol_type: 'library',
										header: {
											title: `New Block`,
											button: {
												label: 'Save',
												onclick: () => {
													creating_block = false;
												}
											}
										},

										get has_unsaved_changes() {
											return creating_block_has_unsaved_changes;
										},

										set has_unsaved_changes($$value) {
											creating_block_has_unsaved_changes = $$value;
											$$settled = false;
										}
									});
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

			if (Dialog.Root) {
				$$renderer.push('<!--[-->');

				Dialog.Root($$renderer, {
					onOpenChange: (open) => {
						if (!open) {
							// Check for unsaved changes before closing
							if (editing_block_has_unsaved_changes) {
								if (!confirm('You have unsaved changes. Are you sure you want to close without saving?')) {
									// Prevent closing by reopening the dialog
									is_symbol_editor_open = true;

									return;
								}

								// User confirmed, discard changes
								self.discard();
							}

							update_library_url({ block: null });
							symbol_being_edited = undefined;
						}
					},

					get open() {
						return is_symbol_editor_open;
					},

					set open($$value) {
						is_symbol_editor_open = $$value;
						$$settled = false;
					},

					children: ($$renderer) => {
						if (Dialog.Content) {
							$$renderer.push('<!--[-->');

							Dialog.Content($$renderer, {
								class: 'z-[999] w-[calc(100vw_-_1rem)] max-w-none h-[calc(100vh_-_1rem)] flex flex-col p-2 gap-2',
								children: ($$renderer) => {
									BlockEditor($$renderer, {
										block: symbol_being_edited,
										symbol_type: 'library',
										header: {
											title: `Edit ${symbol_being_edited?.name || 'Block'}`,
											button: {
												label: 'Save',
												onclick: () => {
													update_library_url({ block: null });
												}
											}
										},

										get has_unsaved_changes() {
											return editing_block_has_unsaved_changes;
										},

										set has_unsaved_changes($$value) {
											editing_block_has_unsaved_changes = $$value;
											$$settled = false;
										}
									});
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

			if (Dialog.Root) {
				$$renderer.push('<!--[-->');

				Dialog.Root($$renderer, {
					get open() {
						return is_symbol_renamer_open;
					},

					set open($$value) {
						is_symbol_renamer_open = $$value;
						$$settled = false;
					},

					children: ($$renderer) => {
						if (Dialog.Content) {
							$$renderer.push('<!--[-->');

							Dialog.Content($$renderer, {
								class: 'sm:max-w-[425px] pt-12 gap-0',
								children: ($$renderer) => {
									$$renderer.push(`<h2 class="text-lg font-semibold leading-none tracking-tight">Rename Block</h2> <p class="text-muted-foreground text-sm">Enter a new name for your Block</p> <form>`);

									Input($$renderer, {
										placeholder: 'Enter new Block name',
										class: 'my-4',
										get value() {
											return symbol_new_name;
										},

										set value($$value) {
											symbol_new_name = $$value;
											$$settled = false;
										}
									});

									$$renderer.push(`<!----> `);

									if (Dialog.Footer) {
										$$renderer.push('<!--[-->');

										Dialog.Footer($$renderer, {
											children: ($$renderer) => {
												Button($$renderer, {
													type: 'button',
													variant: 'outline',
													onclick: () => is_symbol_renamer_open = false,
													children: ($$renderer) => {
														$$renderer.push(`<!---->Cancel`);
													},
													$$slots: { default: true }
												});

												$$renderer.push(`<!----> `);

												Button($$renderer, {
													type: 'submit',
													children: ($$renderer) => {
														$$renderer.push(`<!---->Rename`);
													},
													$$slots: { default: true }
												});

												$$renderer.push(`<!---->`);
											},
											$$slots: { default: true }
										});

										$$renderer.push('<!--]-->');
									} else {
										$$renderer.push('<!--[!-->');
										$$renderer.push('<!--]-->');
									}

									$$renderer.push(`</form>`);
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

			if (AlertDialog.Root) {
				$$renderer.push('<!--[-->');

				AlertDialog.Root($$renderer, {
					get open() {
						return is_delete_symbol_open;
					},

					set open($$value) {
						is_delete_symbol_open = $$value;
						$$settled = false;
					},

					children: ($$renderer) => {
						if (AlertDialog.Content) {
							$$renderer.push('<!--[-->');

							AlertDialog.Content($$renderer, {
								children: ($$renderer) => {
									if (AlertDialog.Header) {
										$$renderer.push('<!--[-->');

										AlertDialog.Header($$renderer, {
											children: ($$renderer) => {
												if (AlertDialog.Title) {
													$$renderer.push('<!--[-->');

													AlertDialog.Title($$renderer, {
														children: ($$renderer) => {
															$$renderer.push(`<!---->Are you sure?`);
														},
														$$slots: { default: true }
													});

													$$renderer.push('<!--]-->');
												} else {
													$$renderer.push('<!--[!-->');
													$$renderer.push('<!--]-->');
												}

												$$renderer.push(` `);

												if (AlertDialog.Description) {
													$$renderer.push('<!--[-->');

													AlertDialog.Description($$renderer, {
														children: ($$renderer) => {
															$$renderer.push(`<!---->This action cannot be undone. This will permanently delete <strong>${$.escape(symbol_being_deleted?.name)}</strong> and remove all associated data.`);
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

									if (AlertDialog.Footer) {
										$$renderer.push('<!--[-->');

										AlertDialog.Footer($$renderer, {
											children: ($$renderer) => {
												if (AlertDialog.Cancel) {
													$$renderer.push('<!--[-->');

													AlertDialog.Cancel($$renderer, {
														children: ($$renderer) => {
															$$renderer.push(`<!---->Cancel`);
														},
														$$slots: { default: true }
													});

													$$renderer.push('<!--]-->');
												} else {
													$$renderer.push('<!--[!-->');
													$$renderer.push('<!--]-->');
												}

												$$renderer.push(` `);

												if (AlertDialog.Action) {
													$$renderer.push('<!--[-->');

													AlertDialog.Action($$renderer, {
														onclick: delete_library_symbol,
														class: 'bg-red-600 hover:bg-red-700',
														children: ($$renderer) => {
															if (deleting) {
																$$renderer.push(`<!--[0--><div class="animate-spin absolute">`);
																Loader($$renderer, {});
																$$renderer.push(`<!----></div>`);
															} else {
																$$renderer.push(`<!--[-1-->Delete ${$.escape(symbol_being_deleted?.name)}`);
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

			$$renderer.push(` `);

			if (Dialog.Root) {
				$$renderer.push('<!--[-->');

				Dialog.Root($$renderer, {
					get open() {
						return upload_dialog_open;
					},

					set open($$value) {
						upload_dialog_open = $$value;
						$$settled = false;
					},

					children: ($$renderer) => {
						if (Dialog.Content) {
							$$renderer.push('<!--[-->');

							Dialog.Content($$renderer, {
								class: 'sm:max-w-[500px] pt-12 gap-0',
								children: ($$renderer) => {
									$$renderer.push(`<h2 class="text-lg font-semibold leading-none tracking-tight">Import Block</h2> <p class="text-muted-foreground text-sm mb-4">Import a block from a JSON file exported from another site.</p> `);

									if (is_importing) {
										$$renderer.push(`<!--[0--><div class="flex items-center justify-center py-8"><div class="animate-spin">`);
										Loader($$renderer, { class: 'h-8 w-8' });
										$$renderer.push(`<!----></div> <span class="ml-3">Importing block...</span></div>`);
									} else {
										$$renderer.push('<!--[-1-->');

										DropZone($$renderer, {
											onupload: upload_block_file,
											invalid: upload_file_invalid,
											drop_text: 'Drop your block file here or click to browse',
											accept: '.json',
											class: 'mb-4'
										});
									}

									$$renderer.push(`<!--]--> `);

									if (Dialog.Footer) {
										$$renderer.push('<!--[-->');

										Dialog.Footer($$renderer, {
											children: ($$renderer) => {
												Button($$renderer, {
													type: 'button',
													variant: 'outline',
													onclick: () => {
														upload_dialog_open = false;
														upload_file_invalid = false;
													},
													disabled: is_importing,
													children: ($$renderer) => {
														$$renderer.push(`<!---->Cancel`);
													},
													$$slots: { default: true }
												});
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

			$$renderer.push(` `);

			if (Dialog.Root) {
				$$renderer.push('<!--[-->');

				Dialog.Root($$renderer, {
					get open() {
						return is_info_dialog_open;
					},

					set open($$value) {
						is_info_dialog_open = $$value;
						$$settled = false;
					},

					children: ($$renderer) => {
						if (Dialog.Content) {
							$$renderer.push('<!--[-->');

							Dialog.Content($$renderer, {
								class: 'sm:max-w-[525px] pt-12 gap-0',
								children: ($$renderer) => {
									$$renderer.push(`<h2 class="text-lg font-semibold leading-none tracking-tight">How Blocks Work in Primo</h2> <p class="text-muted-foreground text-sm mb-6">Blocks are reusable components that you can add to any page on your sites.</p> <div class="space-y-4"><div class="flex gap-4"><div class="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center">`);
									Plus($$renderer, { class: 'w-3 h-3' });
									$$renderer.push(`<!----></div> <div><h3 class="font-medium text-sm mb-1">Create or Import Blocks</h3> <p class="text-muted-foreground text-sm">Build custom blocks using the visual editor or import blocks from other sites. Organize them into groups for easy management.</p></div></div> <div class="flex gap-4"><div class="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center">`);
									MousePointer($$renderer, { class: 'w-3 h-3' });
									$$renderer.push(`<!----></div> <div><h3 class="font-medium text-sm mb-1">Add Blocks to Pages</h3> <p class="text-muted-foreground text-sm">When editing a page, drag blocks from the sidebar into your page layout. Blocks can be positioned anywhere and customized with different content.</p></div></div> <div class="flex gap-4"><div class="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center">`);
									Edit3($$renderer, { class: 'w-3 h-3' });
									$$renderer.push(`<!----></div> <div><h3 class="font-medium text-sm mb-1">Customize Content</h3> <p class="text-muted-foreground text-sm">Each block can have different content on different pages. Edit text, images, and other content directly in the page editor.</p></div></div> <div class="flex gap-4"><div class="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center">`);
									Share($$renderer, { class: 'w-3 h-3' });
									$$renderer.push(`<!----></div> <div><h3 class="font-medium text-sm mb-1">Reuse Across Sites</h3> <p class="text-muted-foreground text-sm">Export blocks to share with other sites or import blocks from the marketplace to expand your component library.</p></div></div></div> `);

									if (Dialog.Footer) {
										$$renderer.push('<!--[-->');

										Dialog.Footer($$renderer, {
											class: 'mt-6',
											children: ($$renderer) => {
												Button($$renderer, {
													type: 'button',
													onclick: () => is_info_dialog_open = false,
													children: ($$renderer) => {
														$$renderer.push(`<!---->Got it`);
													},
													$$slots: { default: true }
												});
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