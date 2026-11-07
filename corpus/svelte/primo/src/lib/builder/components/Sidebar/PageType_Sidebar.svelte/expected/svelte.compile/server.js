import * as $ from 'svelte/internal/server';
import * as Dialog from '$lib/components/ui/dialog';
import * as _ from 'lodash-es';
import { goto } from '$app/navigation';
import { browser } from '$app/environment';
import { Skeleton } from '$lib/components/ui/skeleton';
import Icon from '@iconify/svelte';
import BlockEditor from '$lib/builder/views/modal/BlockEditor.svelte';
import BlockPicker from '$lib/builder/views/modal/BlockPicker.svelte';
import Sidebar_Symbol from './Sidebar_Symbol.svelte';
import Fields from '$lib/builder/components/Fields/FieldsContent.svelte';
import { flip } from 'svelte/animate';
import { toast } from 'svelte-sonner';
import { dropTargetForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import { attachClosestEdge, extractClosestEdge } from '@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge';
import * as Tabs from '$lib/components/ui/tabs';
import { Cuboid, SquarePen, Loader } from 'lucide-svelte';
import { page } from '$app/state';

import {
	PageTypes,
	SiteSymbols,
	SiteSymbolFields,
	SiteSymbolEntries,
	PageTypeSymbols,
	PageTypeFields,
	PageTypeEntries,
	LibrarySymbols,
	LibrarySymbolEntries,
	LibrarySymbolFields
} from '$lib/pocketbase/collections';

import { self } from '$lib/pocketbase/managers';
import { site_html } from '$lib/builder/stores/app/page.js';
import { dragging_symbol } from '$lib/builder/stores/app/misc';
import DropZone from '$lib/components/DropZone.svelte';
import { Button } from '$lib/components/ui/button';
import { setFieldEntries } from '../Fields/FieldsContent.svelte';
import { current_user } from '$lib/pocketbase/user.js';
import { useImportSiteSymbol } from '$lib/workers/ImportSymbol.svelte.ts';

import {
	page_type_context,
	site_context,
	hide_page_field_field_type_context
} from '$lib/builder/stores/context';

import { tick } from 'svelte';

import {
	create_site_symbol_entries,
	create_site_symbol_fields,
	create_site_symbols
} from '$lib/workers/CopySymbols.svelte';

export default function PageType_Sidebar($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;

		// Icon component removed to prevent stack overflow issues
		const { value: site } = site_context.getOr({ value: null });

		const page_type_id = $.derived(() => page.params.page_type);
		const page_type = $.derived(() => PageTypes.one(page_type_id()));
		const fields = $.derived(() => page_type()?.fields() ?? []);
		const entries = $.derived(() => page_type()?.entries() ?? []);
		const page_type_symbols = $.derived(() => page_type()?.symbols() ?? []);
		const site_symbols = $.derived(() => site?.symbols() ?? []);

		// Set context so child components can access the page type (ie page-field field in sidebar symbol)
		const context = { value: page_type() };

		page_type_context.set(context);
		hide_page_field_field_type_context.set(true);

		// get the query param to set the tab when navigating from page (i.e. 'Manage Fields')
		let active_tab = page.url.searchParams.get('tab') === 'fields' ? 'CONTENT' : 'BLOCKS';

		if (browser) {
			const url = new URL(page.url);

			url.searchParams.delete('tab');
			goto(url, { replaceState: true });
		}

		async function create_block() {
			creating_block = true;
		}

		// Import/Export functionality
		let upload_dialog_open = false;

		let upload_file_invalid = false;
		let file = void 0;
		const importSiteSymbol = $.derived(() => useImportSiteSymbol(file, site?.id));
		let is_importing = $.derived(() => ['loading', 'working'].includes(importSiteSymbol().status));

		async function upload_block(newFile) {
			file = newFile;
			await tick();

			if (!file || !site) return;

			try {
				console.log('Importing file:', file.name, 'Size:', file.size);
				await importSiteSymbol().run();
				upload_dialog_open = false;
				upload_file_invalid = false;
				file = undefined;
				console.log('Import successful!');
			} catch(error) {
				console.error('Failed to import symbol:', error);
				console.error('Error details:', error.message, error.stack);
				upload_file_invalid = true;
				file = undefined;
			}
		}

		let active_block_id = null;
		let active_block = void 0;

		function edit_block(block, block_id) {
			active_block = block;
			active_block_id = block_id;
			editing_block = true;
		}

		async function show_block_picker() {
			adding_block = true;
		}

		function drag_target(element, block) {
			dropTargetForElements({
				element,
				getData({ input, element }) {
					return attachClosestEdge({ block }, { element, input, allowedEdges: ['top', 'bottom'] });
				},

				onDragStart() {
					$.store_set(dragging_symbol, true);
				},

				onDragEnd() {
					$.store_set(dragging_symbol, false);
				},

				onDrop({ self, source }) {
					if (!site) return;

					const closestEdgeOfTarget = extractClosestEdge(self.data);
					const block_dragged_over = self.data.block;
					const block_being_dragged = source.data.block;
					const block_dragged_over_index = site_symbols().findIndex((symbol) => symbol.id === block_dragged_over.id);

					const target_index = closestEdgeOfTarget === 'top'
						? block_dragged_over_index
						: block_dragged_over_index + 1;

					// TODO: reconfigure
					// data.symbols = [
					// 	...data.symbols.slice(0, target_index).filter((symbol) => symbol.id !== block_being_dragged.id),
					// 	block_being_dragged,
					// 	...data.symbols.slice(target_index).filter((symbol) => symbol.id !== block_being_dragged.id)
					// ]
				}
			});
		}

		let editing_block = false;
		let creating_block = false;
		let adding_block = false;
		let static_transition_dialog = false;
		let pending_symbol_toggle = null;

		// Handle unsaved changes for block editors
		let editing_block_has_unsaved_changes = false;

		let creating_block_has_unsaved_changes = false;
		let commit_task = void 0;
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			if (Dialog.Root) {
				$$renderer.push('<!--[-->');

				Dialog.Root($$renderer, {
					onOpenChange: (open) => {
						if (!open) {
							// Check for unsaved changes before closing
							if (editing_block_has_unsaved_changes) {
								if (!confirm('You have unsaved changes. Are you sure you want to close without saving?')) {
									// Prevent closing by reopening the dialog
									editing_block = true;

									return;
								}

								// User confirmed, discard changes
								self.discard();
							}
						}
					},

					get open() {
						return editing_block;
					},

					set open($$value) {
						editing_block = $$value;
						$$settled = false;
					},

					children: ($$renderer) => {
						if (Dialog.Content) {
							$$renderer.push('<!--[-->');

							Dialog.Content($$renderer, {
								class: 'z-[999] w-[calc(100vw_-_1rem)] max-w-none h-[calc(100vh_-_1rem)] flex flex-col p-2 gap-2',
								children: ($$renderer) => {
									BlockEditor($$renderer, {
										block: active_block,
										header: {
											title: `Edit ${active_block?.name || 'Block'}`,
											button: {
												label: 'Save',
												onclick: () => {
													editing_block = false;
													active_block_id = null;
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
										header: {
											button: {
												label: 'Create Block',
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
							self.discard();
						}
					},

					get open() {
						return adding_block;
					},

					set open($$value) {
						adding_block = $$value;
						$$settled = false;
					},

					children: ($$renderer) => {
						if (Dialog.Content) {
							$$renderer.push('<!--[-->');

							Dialog.Content($$renderer, {
								class: 'z-[999] w-[calc(100vw_-_1rem)] max-w-none h-[calc(100vh_-_1rem)] flex flex-col p-4',
								children: ($$renderer) => {
									BlockPicker($$renderer, {
										site,
										onsave: async (blocks) => {
											try {
												const {
													symbols: source_symbols,
													fields: source_symbol_fields,
													entries: source_symbol_entries
												} = blocks.reduce(
													(o, { symbol, fields, entries }) => {
														return {
															symbols: [...o.symbols ?? [], symbol],
															fields: [...o.fields ?? [], ...fields],
															entries: [...o.entries ?? [], ...entries]
														};
													},
													{ symbols: [], fields: [], entries: [] }
												);

												const site_symbol_map = create_site_symbols({ source_symbols, site });
												const site_symbol_field_map = create_site_symbol_fields({ source_symbol_fields, site_symbol_map });
												const site_symbol_entry_map = create_site_symbol_entries({ source_symbol_entries, site_symbol_field_map });
											} catch(error) {
												console.error('Error copying symbols:', error);
											}

											await self.commit();
											adding_block = false;
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
						return static_transition_dialog;
					},

					set open($$value) {
						static_transition_dialog = $$value;
						$$settled = false;
					},

					children: ($$renderer) => {
						if (Dialog.Content) {
							$$renderer.push('<!--[-->');

							Dialog.Content($$renderer, {
								class: 'sm:max-w-[500px] p-6 pt-12',
								children: ($$renderer) => {
									$$renderer.push(`<div class="mb-6"><h2 class="text-lg font-semibold mb-2">Page Type Becoming Static</h2> <p class="text-sm text-gray-400 leading-relaxed">This page type will become static. Existing pages will keep their current sections but you won't be able to add to, remove, or reorder them. New pages will use the current template.</p></div> <div class="flex gap-2 justify-end">`);

									Button($$renderer, {
										variant: 'outline',
										onclick: () => {
											static_transition_dialog = false;
											pending_symbol_toggle = null;
										},

										children: ($$renderer) => {
											$$renderer.push(`<!---->Cancel`);
										},
										$$slots: { default: true }
									});

									$$renderer.push(`<!----> `);

									Button($$renderer, {
										onclick: () => {
											if (pending_symbol_toggle) {
												PageTypeSymbols.delete(pending_symbol_toggle.relation.id);
												self.commit();
											}

											static_transition_dialog = false;
											pending_symbol_toggle = null;
										},

										children: ($$renderer) => {
											$$renderer.push(`<!---->Continue`);
										},
										$$slots: { default: true }
									});

									$$renderer.push(`<!----></div>`);
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

			$$renderer.push(` <div class="sidebar primo-reset svelte-176akpr">`);

			if (Tabs.Root) {
				$$renderer.push('<!--[-->');

				Tabs.Root($$renderer, {
					value: active_tab === 'CONTENT' ? 'content' : 'blocks',
					class: 'p-2',
					children: ($$renderer) => {
						if (Tabs.List) {
							$$renderer.push('<!--[-->');

							Tabs.List($$renderer, {
								class: 'w-full mb-2',
								children: ($$renderer) => {
									if (Tabs.Trigger) {
										$$renderer.push('<!--[-->');

										Tabs.Trigger($$renderer, {
											value: 'blocks',
											class: 'flex-1 flex gap-1',
											children: ($$renderer) => {
												Cuboid($$renderer, { class: 'w-3' });
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
											value: 'content',
											class: 'flex-1 flex gap-1',
											children: ($$renderer) => {
												SquarePen($$renderer, { class: 'w-3' });
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
								value: 'blocks',
								class: 'px-1',
								children: ($$renderer) => {
									if (site_symbols().length > 0) {
										$$renderer.push('<!--[0-->');

										if ($.store_get($$store_subs ??= {}, '$current_user', current_user)?.siteRole === 'developer') {
											$$renderer.push(`<!--[0--><div class="primo-buttons svelte-176akpr"><button class="primo-button svelte-176akpr">`);
											Icon($$renderer, { icon: 'mdi:plus' });
											$$renderer.push(`<!----> <span>Add</span></button> `);

											if ($.store_get($$store_subs ??= {}, '$current_user', current_user)?.siteRole === 'developer') {
												$$renderer.push(`<!--[0--><button class="primo-button svelte-176akpr">`);
												Icon($$renderer, { icon: 'mdi:code' });
												$$renderer.push(`<!----> <span>Create</span></button> <button class="primo-button svelte-176akpr">`);
												Icon($$renderer, { icon: 'mdi:upload' });
												$$renderer.push(`<!----> <span>Import</span></button>`);
											} else {
												$$renderer.push('<!--[-1-->');
											}

											$$renderer.push(`<!--]--></div>`);
										} else {
											$$renderer.push('<!--[-1-->');
										}

										$$renderer.push(`<!--]--> `);

										if ($.store_get($$store_subs ??= {}, '$site_html', site_html) !== null) {
											$$renderer.push(`<!--[0--><div class="block-list svelte-176akpr"><!--[-->`);

											const each_array = $.ensure_array_like(site_symbols());

											for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
												let symbol = each_array[$$index];
												const relation = page_type_symbols().find((relation) => relation.symbol === symbol.id);
												const toggled = !!relation;

												$$renderer.push(`<div class="block svelte-176akpr">`);

												Sidebar_Symbol($$renderer, {
													symbol,
													head: $.store_get($$store_subs ??= {}, '$site_html', site_html),
													active_page_type_id: page_type()?.id,
													show_toggle: true,
													toggled,
													controls_enabled: $.store_get($$store_subs ??= {}, '$current_user', current_user)?.siteRole === 'developer'
												});

												$$renderer.push(`<!----></div>`);
											}

											$$renderer.push(`<!--]--></div>`);
										} else {
											$$renderer.push(`<!--[-1--><div class="block-list svelte-176akpr"><!--[-->`);

											const each_array_1 = $.ensure_array_like(site_symbols());

											for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
												let _ = each_array_1[$$index_1];

												$$renderer.push(`<div class="block svelte-176akpr"><div class="flex items-center justify-between pb-2">`);
												Skeleton($$renderer, { class: 'h-4 w-32' });
												$$renderer.push(`<!----> `);
												Skeleton($$renderer, { class: 'h-4 w-12' });
												$$renderer.push(`<!----></div> `);
												Skeleton($$renderer, { class: 'h-24 w-full rounded-md' });
												$$renderer.push(`<!----></div>`);
											}

											$$renderer.push(`<!--]--></div>`);
										}

										$$renderer.push(`<!--]-->`);
									} else {
										$$renderer.push(`<!--[-1--><div class="empty svelte-176akpr">Add a Block to your site to use it on your pages.</div> <div class="primo-buttons svelte-176akpr"><button class="primo-button svelte-176akpr">`);
										Icon($$renderer, { icon: 'mdi:plus' });
										$$renderer.push(`<!----> <span>Add</span></button> <button class="primo-button svelte-176akpr">`);
										Icon($$renderer, { icon: 'mdi:code' });
										$$renderer.push(`<!----> <span>Create</span></button> <button class="primo-button svelte-176akpr">`);
										Icon($$renderer, { icon: 'mdi:upload' });
										$$renderer.push(`<!----> <span>Import</span></button></div>`);
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
								value: 'content',
								class: 'px-1',
								children: ($$renderer) => {
									$$renderer.push(`<div class="page-type-fields">`);

									if (page_type()) {
										$$renderer.push('<!--[0-->');

										Fields($$renderer, {
											entity: page_type(),
											fields: fields(),
											entries: entries(),
											create_field: async (data) => {
												// Get the highest index for fields at this level
												const siblingFields = (fields() ?? []).filter((f) => data?.parent ? f.parent === data.parent : !f.parent);

												const nextIndex = Math.max(...siblingFields.map((f) => f.index || 0), -1) + 1;

												PageTypeFields.create({
													type: 'text',
													key: '',
													label: '',
													config: null,
													page_type: page_type().id,
													...data,
													index: nextIndex
												});
											},

											oninput: (values) => {
												setFieldEntries({
													fields: fields(),
													entries: entries(),
													updateEntry: PageTypeEntries.update,
													createEntry: PageTypeEntries.create,
													values
												});

												clearTimeout(commit_task);
												commit_task = setTimeout(() => self.commit(), 500);
											},

											onchange: ({ id, data }) => {
												PageTypeFields.update(id, data);

												const field = fields().find((field) => field.id === id);

												if (field?.key) {
													clearTimeout(commit_task);
													commit_task = setTimeout(() => self.commit(), 500);
												}
											},

											ondelete: async (field) => {
												PageTypeFields.delete(field.id);
												toast.success(`Deleted ${field.type} field${field.label ? `: ${field.label}` : ``}`);
												await self.commit();
											},

											ondelete_entry: (entry_id) => {
												PageTypeEntries.delete(entry_id);
												clearTimeout(commit_task);
												commit_task = setTimeout(() => self.commit(), 500);
											}
										});
									} else {
										$$renderer.push('<!--[-1-->');
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
					},
					$$slots: { default: true }
				});

				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}

			$$renderer.push(`</div> `);

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

									if (is_importing()) {
										$$renderer.push(`<!--[0--><div class="flex items-center justify-center py-8"><div class="animate-spin">`);
										Loader($$renderer, { class: 'h-8 w-8' });
										$$renderer.push(`<!----></div> <span class="ml-3">Importing block...</span></div>`);
									} else {
										$$renderer.push('<!--[-1-->');

										DropZone($$renderer, {
											onupload: upload_block,
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
													disabled: is_importing(),
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
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}