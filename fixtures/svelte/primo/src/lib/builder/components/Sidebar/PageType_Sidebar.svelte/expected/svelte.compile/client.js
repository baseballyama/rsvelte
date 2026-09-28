import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
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

var root = $.from_html(`<div class="mb-6"><h2 class="text-lg font-semibold mb-2">Page Type Becoming Static</h2> <p class="text-sm text-gray-400 leading-relaxed">This page type will become static. Existing pages will keep their current sections but you won't be able to add to, remove, or reorder them. New pages will use the current template.</p></div> <div class="flex gap-2 justify-end"><!> <!></div>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);
var root_2 = $.from_html(`<button class="primo-button svelte-176akpr"><!> <span>Create</span></button> <button class="primo-button svelte-176akpr"><!> <span>Import</span></button>`, 1);
var root_3 = $.from_html(`<div class="primo-buttons svelte-176akpr"><button class="primo-button svelte-176akpr"><!> <span>Add</span></button> <!></div>`);
var root_4 = $.from_html(`<div class="block svelte-176akpr"><!></div>`);
var root_5 = $.from_html(`<div class="block-list svelte-176akpr"></div>`);
var root_6 = $.from_html(`<div class="block svelte-176akpr"><div class="flex items-center justify-between pb-2"><!> <!></div> <!></div>`);
var root_7 = $.from_html(`<div class="empty svelte-176akpr">Add a Block to your site to use it on your pages.</div> <div class="primo-buttons svelte-176akpr"><button class="primo-button svelte-176akpr"><!> <span>Add</span></button> <button class="primo-button svelte-176akpr"><!> <span>Create</span></button> <button class="primo-button svelte-176akpr"><!> <span>Import</span></button></div>`, 1);
var root_8 = $.from_html(`<div class="page-type-fields"><!></div>`);
var root_9 = $.from_html(`<!> <!> <!>`, 1);
var root_10 = $.from_html(`<div class="flex items-center justify-center py-8"><div class="animate-spin"><!></div> <span class="ml-3">Importing block...</span></div>`);
var root_11 = $.from_html(`<h2 class="text-lg font-semibold leading-none tracking-tight">Import Block</h2> <p class="text-muted-foreground text-sm mb-4">Import a block from a JSON file exported from another site.</p> <!> <!>`, 1);
var root_12 = $.from_html(`<!> <!> <!> <!> <div class="sidebar primo-reset svelte-176akpr"><!></div> <!>`, 1);

export default function PageType_Sidebar($$anchor, $$props) {
	$.push($$props, true);

	const $dragging_symbol = () => $.store_get(dragging_symbol, '$dragging_symbol', $$stores);
	const $current_user = () => $.store_get(current_user, '$current_user', $$stores);
	const $site_html = () => $.store_get(site_html, '$site_html', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();

	// Icon component removed to prevent stack overflow issues
	const { value: site } = site_context.getOr({ value: null });

	const page_type_id = $.derived(() => page.params.page_type);
	const page_type = $.derived(() => PageTypes.one($.get(page_type_id)));
	const fields = $.derived(() => $.get(page_type)?.fields() ?? []);
	const entries = $.derived(() => $.get(page_type)?.entries() ?? []);
	const page_type_symbols = $.derived(() => $.get(page_type)?.symbols() ?? []);
	const site_symbols = $.derived(() => site?.symbols() ?? []);

	// Set context so child components can access the page type (ie page-field field in sidebar symbol)
	const context = $.proxy({ value: $.get(page_type) });

	page_type_context.set(context);

	$.user_effect(() => {
		context.value = $.get(page_type);
	});

	hide_page_field_field_type_context.set(true);

	// get the query param to set the tab when navigating from page (i.e. 'Manage Fields')
	let active_tab = $.proxy(page.url.searchParams.get('tab') === 'fields' ? 'CONTENT' : 'BLOCKS');

	if (browser) {
		const url = new URL(page.url);

		url.searchParams.delete('tab');
		goto(url, { replaceState: true });
	}

	async function create_block() {
		$.set(creating_block, true);
	}

	// Import/Export functionality
	let upload_dialog_open = $.state(false);

	let upload_file_invalid = $.state(false);
	let file = $.state(void 0);
	const importSiteSymbol = $.derived(() => useImportSiteSymbol($.get(file), site?.id));
	let is_importing = $.derived(() => ['loading', 'working'].includes($.get(importSiteSymbol).status));

	async function upload_block(newFile) {
		$.set(file, newFile, true);
		await tick();

		if (!$.get(file) || !site) return;

		try {
			console.log('Importing file:', $.get(file).name, 'Size:', $.get(file).size);
			await $.get(importSiteSymbol).run();
			$.set(upload_dialog_open, false);
			$.set(upload_file_invalid, false);
			$.set(file, undefined);
			console.log('Import successful!');
		} catch(error) {
			console.error('Failed to import symbol:', error);
			console.error('Error details:', error.message, error.stack);
			$.set(upload_file_invalid, true);
			$.set(file, undefined);
		}
	}

	let active_block_id = $.state(null);
	let active_block = $.state(void 0);

	function edit_block(block, block_id) {
		$.set(active_block, block, true);
		$.set(active_block_id, block_id, true);
		$.set(editing_block, true);
	}

	async function show_block_picker() {
		$.set(adding_block, true);
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
				const block_dragged_over_index = $.get(site_symbols).findIndex((symbol) => symbol.id === block_dragged_over.id);

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

	let editing_block = $.state(false);
	let creating_block = $.state(false);
	let adding_block = $.state(false);
	let static_transition_dialog = $.state(false);
	let pending_symbol_toggle = $.state(null);

	// Handle unsaved changes for block editors
	let editing_block_has_unsaved_changes = $.state(false);

	let creating_block_has_unsaved_changes = $.state(false);
	let commit_task = $.state(void 0);
	var fragment = root_12();
	var node = $.first_child(fragment);

	$.component(node, () => Dialog.Root, ($$anchor, Dialog_Root) => {
		Dialog_Root($$anchor, {
			onOpenChange: (open) => {
				if (!open) {
					// Check for unsaved changes before closing
					if ($.get(editing_block_has_unsaved_changes)) {
						if (!confirm('You have unsaved changes. Are you sure you want to close without saving?')) {
							// Prevent closing by reopening the dialog
							$.set(editing_block, true);

							return;
						}

						// User confirmed, discard changes
						self.discard();
					}
				}
			},

			get open() {
				return $.get(editing_block);
			},

			set open($$value) {
				$.set(editing_block, $$value, true);
			},

			children: ($$anchor, $$slotProps) => {
				var fragment_1 = $.comment();
				var node_1 = $.first_child(fragment_1);

				$.component(node_1, () => Dialog.Content, ($$anchor, Dialog_Content) => {
					Dialog_Content($$anchor, {
						class: 'z-[999] w-[calc(100vw_-_1rem)] max-w-none h-[calc(100vh_-_1rem)] flex flex-col p-2 gap-2',
						children: ($$anchor, $$slotProps) => {
							{
								let $0 = $.derived(() => ({
									title: `Edit ${$.get(active_block)?.name || 'Block'}`,
									button: {
										label: 'Save',
										onclick: () => {
											$.set(editing_block, false);
											$.set(active_block_id, null);
										}
									}
								}));

								BlockEditor($$anchor, {
									get block() {
										return $.get(active_block);
									},

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

				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		});
	});

	var node_2 = $.sibling(node, 2);

	$.component(node_2, () => Dialog.Root, ($$anchor, Dialog_Root_1) => {
		Dialog_Root_1($$anchor, {
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
				var fragment_3 = $.comment();
				var node_3 = $.first_child(fragment_3);

				$.component(node_3, () => Dialog.Content, ($$anchor, Dialog_Content_1) => {
					Dialog_Content_1($$anchor, {
						class: 'z-[999] w-[calc(100vw_-_1rem)] max-w-none h-[calc(100vh_-_1rem)] flex flex-col p-2 gap-2',
						children: ($$anchor, $$slotProps) => {
							BlockEditor($$anchor, {
								header: {
									button: {
										label: 'Create Block',
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

				$.append($$anchor, fragment_3);
			},
			$$slots: { default: true }
		});
	});

	var node_4 = $.sibling(node_2, 2);

	$.component(node_4, () => Dialog.Root, ($$anchor, Dialog_Root_2) => {
		Dialog_Root_2($$anchor, {
			onOpenChange: (open) => {
				if (!open) {
					self.discard();
				}
			},

			get open() {
				return $.get(adding_block);
			},

			set open($$value) {
				$.set(adding_block, $$value, true);
			},

			children: ($$anchor, $$slotProps) => {
				var fragment_5 = $.comment();
				var node_5 = $.first_child(fragment_5);

				$.component(node_5, () => Dialog.Content, ($$anchor, Dialog_Content_2) => {
					Dialog_Content_2($$anchor, {
						class: 'z-[999] w-[calc(100vw_-_1rem)] max-w-none h-[calc(100vh_-_1rem)] flex flex-col p-4',
						children: ($$anchor, $$slotProps) => {
							BlockPicker($$anchor, {
								get site() {
									return site;
								},

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
									$.set(adding_block, false);
								}
							});
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment_5);
			},
			$$slots: { default: true }
		});
	});

	var node_6 = $.sibling(node_4, 2);

	$.component(node_6, () => Dialog.Root, ($$anchor, Dialog_Root_3) => {
		Dialog_Root_3($$anchor, {
			get open() {
				return $.get(static_transition_dialog);
			},

			set open($$value) {
				$.set(static_transition_dialog, $$value, true);
			},

			children: ($$anchor, $$slotProps) => {
				var fragment_7 = $.comment();
				var node_7 = $.first_child(fragment_7);

				$.component(node_7, () => Dialog.Content, ($$anchor, Dialog_Content_3) => {
					Dialog_Content_3($$anchor, {
						class: 'sm:max-w-[500px] p-6 pt-12',
						children: ($$anchor, $$slotProps) => {
							var fragment_8 = root();
							var div = $.sibling($.first_child(fragment_8), 2);
							var node_8 = $.child(div);

							Button(node_8, {
								variant: 'outline',
								onclick: () => {
									$.set(static_transition_dialog, false);
									$.set(pending_symbol_toggle, null);
								},

								children: ($$anchor, $$slotProps) => {
									$.next();

									var text = $.text('Cancel');

									$.append($$anchor, text);
								},
								$$slots: { default: true }
							});

							var node_9 = $.sibling(node_8, 2);

							Button(node_9, {
								onclick: () => {
									if ($.get(pending_symbol_toggle)) {
										PageTypeSymbols.delete($.get(pending_symbol_toggle).relation.id);
										self.commit();
									}

									$.set(static_transition_dialog, false);
									$.set(pending_symbol_toggle, null);
								},

								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_1 = $.text('Continue');

									$.append($$anchor, text_1);
								},
								$$slots: { default: true }
							});

							$.reset(div);
							$.append($$anchor, fragment_8);
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment_7);
			},
			$$slots: { default: true }
		});
	});

	var div_1 = $.sibling(node_6, 2);
	var node_10 = $.child(div_1);

	{
		let $0 = $.derived(() => active_tab === 'CONTENT' ? 'content' : 'blocks');

		$.component(node_10, () => Tabs.Root, ($$anchor, Tabs_Root) => {
			Tabs_Root($$anchor, {
				get value() {
					return $.get($0);
				},
				class: 'p-2',
				children: ($$anchor, $$slotProps) => {
					var fragment_9 = root_9();
					var node_11 = $.first_child(fragment_9);

					$.component(node_11, () => Tabs.List, ($$anchor, Tabs_List) => {
						Tabs_List($$anchor, {
							class: 'w-full mb-2',
							children: ($$anchor, $$slotProps) => {
								var fragment_10 = root_1();
								var node_12 = $.first_child(fragment_10);

								$.component(node_12, () => Tabs.Trigger, ($$anchor, Tabs_Trigger) => {
									Tabs_Trigger($$anchor, {
										value: 'blocks',
										class: 'flex-1 flex gap-1',
										children: ($$anchor, $$slotProps) => {
											Cuboid($$anchor, { class: 'w-3' });
										},
										$$slots: { default: true }
									});
								});

								var node_13 = $.sibling(node_12, 2);

								$.component(node_13, () => Tabs.Trigger, ($$anchor, Tabs_Trigger_1) => {
									Tabs_Trigger_1($$anchor, {
										value: 'content',
										class: 'flex-1 flex gap-1',
										children: ($$anchor, $$slotProps) => {
											SquarePen($$anchor, { class: 'w-3' });
										},
										$$slots: { default: true }
									});
								});

								$.append($$anchor, fragment_10);
							},
							$$slots: { default: true }
						});
					});

					var node_14 = $.sibling(node_11, 2);

					$.component(node_14, () => Tabs.Content, ($$anchor, Tabs_Content) => {
						Tabs_Content($$anchor, {
							value: 'blocks',
							class: 'px-1',
							children: ($$anchor, $$slotProps) => {
								var fragment_13 = $.comment();
								var node_15 = $.first_child(fragment_13);

								{
									var consequent_3 = ($$anchor) => {
										var fragment_14 = root_1();
										var node_16 = $.first_child(fragment_14);

										{
											var consequent_1 = ($$anchor) => {
												var div_2 = root_3();
												var button = $.child(div_2);
												var node_17 = $.child(button);

												Icon(node_17, { icon: 'mdi:plus' });
												$.next(2);
												$.reset(button);

												var node_18 = $.sibling(button, 2);

												{
													var consequent = ($$anchor) => {
														var fragment_15 = root_2();
														var button_1 = $.first_child(fragment_15);
														var node_19 = $.child(button_1);

														Icon(node_19, { icon: 'mdi:code' });
														$.next(2);
														$.reset(button_1);

														var button_2 = $.sibling(button_1, 2);
														var node_20 = $.child(button_2);

														Icon(node_20, { icon: 'mdi:upload' });
														$.next(2);
														$.reset(button_2);
														$.delegated('click', button_1, create_block);
														$.delegated('click', button_2, () => $.set(upload_dialog_open, true));
														$.append($$anchor, fragment_15);
													};

													$.if(node_18, ($$render) => {
														if ($current_user()?.siteRole === 'developer') $$render(consequent);
													});
												}

												$.reset(div_2);
												$.delegated('click', button, show_block_picker);
												$.append($$anchor, div_2);
											};

											$.if(node_16, ($$render) => {
												if ($current_user()?.siteRole === 'developer') $$render(consequent_1);
											});
										}

										var node_21 = $.sibling(node_16, 2);

										{
											var consequent_2 = ($$anchor) => {
												var div_3 = root_5();

												$.each(div_3, 29, () => $.get(site_symbols), (symbol) => symbol.id, ($$anchor, symbol) => {
													const relation = $.derived(() => $.get(page_type_symbols).find((relation) => relation.symbol === $.get(symbol).id));
													const toggled = $.derived(() => !!$.get(relation));
													var div_4 = root_4();
													var node_22 = $.child(div_4);

													{
														let $0 = $.derived(() => $.get(page_type)?.id);
														let $1 = $.derived(() => $current_user()?.siteRole === 'developer');

														Sidebar_Symbol(node_22, {
															get symbol() {
																return $.get(symbol);
															},

															get head() {
																return $site_html();
															},

															get active_page_type_id() {
																return $.get($0);
															},
															show_toggle: true,
															get toggled() {
																return $.get(toggled);
															},

															get controls_enabled() {
																return $.get($1);
															},

															$$events: {
																toggle: ({ detail }) => {
																	if (!$.get(page_type // dispatches on creation for some reason
																	) || detail === $.get(toggled)) return;

																	// Check if this toggle would make the page type static
																	const current_symbol_count = $.get(page_type_symbols).length;

																	const will_be_static = $.get(toggled // removing last symbol
																	) && current_symbol_count === 1;

																	if ($.get(toggled)) {
																		// Show dialog before making static
																		if (will_be_static) {
																			$.set(pending_symbol_toggle, { relation: $.get(relation), symbol: $.get(symbol) }, true);
																			$.set(static_transition_dialog, true);
																		} else {
																			PageTypeSymbols.delete($.get(relation).id);
																			self.commit();
																		}
																	} else {
																		PageTypeSymbols.create({ page_type: $.get(page_type).id, symbol: $.get(symbol).id });
																		self.commit();
																	}
																},
																edit: () => edit_block($.get(symbol), $.get(symbol).id),
																delete: () => {
																	SiteSymbols.delete($.get(symbol).id);
																	self.commit();
																}
															}
														});
													}

													$.reset(div_4);
													$.action(div_4, ($$node, $$action_arg) => drag_target?.($$node, $$action_arg), () => $.get(symbol));
													$.animation(div_4, () => flip, () => ({ duration: 200 }));
													$.append($$anchor, div_4);
												});

												$.reset(div_3);
												$.append($$anchor, div_3);
											};

											var alternate = ($$anchor) => {
												var div_5 = root_5();

												$.each(div_5, 21, () => $.get(site_symbols), $.index, ($$anchor, _, $$index_1, $$array) => {
													var div_6 = root_6();
													var div_7 = $.child(div_6);
													var node_23 = $.child(div_7);

													Skeleton(node_23, { class: 'h-4 w-32' });

													var node_24 = $.sibling(node_23, 2);

													Skeleton(node_24, { class: 'h-4 w-12' });
													$.reset(div_7);

													var node_25 = $.sibling(div_7, 2);

													Skeleton(node_25, { class: 'h-24 w-full rounded-md' });
													$.reset(div_6);
													$.append($$anchor, div_6);
												});

												$.reset(div_5);
												$.append($$anchor, div_5);
											};

											$.if(node_21, ($$render) => {
												if ($site_html() !== null) $$render(consequent_2); else $$render(alternate, -1);
											});
										}

										$.append($$anchor, fragment_14);
									};

									var alternate_1 = ($$anchor) => {
										var fragment_16 = root_7();
										var div_8 = $.sibling($.first_child(fragment_16), 2);
										var button_3 = $.child(div_8);
										var node_26 = $.child(button_3);

										Icon(node_26, { icon: 'mdi:plus' });
										$.next(2);
										$.reset(button_3);

										var button_4 = $.sibling(button_3, 2);
										var node_27 = $.child(button_4);

										Icon(node_27, { icon: 'mdi:code' });
										$.next(2);
										$.reset(button_4);

										var button_5 = $.sibling(button_4, 2);
										var node_28 = $.child(button_5);

										Icon(node_28, { icon: 'mdi:upload' });
										$.next(2);
										$.reset(button_5);
										$.reset(div_8);
										$.delegated('click', button_3, show_block_picker);
										$.delegated('click', button_4, create_block);
										$.delegated('click', button_5, () => $.set(upload_dialog_open, true));
										$.append($$anchor, fragment_16);
									};

									$.if(node_15, ($$render) => {
										if ($.get(site_symbols).length > 0) $$render(consequent_3); else $$render(alternate_1, -1);
									});
								}

								$.append($$anchor, fragment_13);
							},
							$$slots: { default: true }
						});
					});

					var node_29 = $.sibling(node_14, 2);

					$.component(node_29, () => Tabs.Content, ($$anchor, Tabs_Content_1) => {
						Tabs_Content_1($$anchor, {
							value: 'content',
							class: 'px-1',
							children: ($$anchor, $$slotProps) => {
								var div_9 = root_8();
								var node_30 = $.child(div_9);

								{
									var consequent_4 = ($$anchor) => {
										Fields($$anchor, {
											get entity() {
												return $.get(page_type);
											},

											get fields() {
												return $.get(fields);
											},

											get entries() {
												return $.get(entries);
											},

											create_field: async (data) => {
												// Get the highest index for fields at this level
												const siblingFields = ($.get(fields) ?? []).filter((f) => data?.parent ? f.parent === data.parent : !f.parent);

												const nextIndex = Math.max(...siblingFields.map((f) => f.index || 0), -1) + 1;

												PageTypeFields.create({
													type: 'text',
													key: '',
													label: '',
													config: null,
													page_type: $.get(page_type).id,
													...data,
													index: nextIndex
												});
											},

											oninput: (values) => {
												setFieldEntries({
													fields: $.get(fields),
													entries: $.get(entries),
													updateEntry: PageTypeEntries.update,
													createEntry: PageTypeEntries.create,
													values
												});

												clearTimeout($.get(commit_task));
												$.set(commit_task, setTimeout(() => self.commit(), 500), true);
											},

											onchange: ({ id, data }) => {
												PageTypeFields.update(id, data);

												const field = $.get(fields).find((field) => field.id === id);

												if (field?.key) {
													clearTimeout($.get(commit_task));
													$.set(commit_task, setTimeout(() => self.commit(), 500), true);
												}
											},

											ondelete: async (field) => {
												PageTypeFields.delete(field.id);
												toast.success(`Deleted ${field.type} field${field.label ? `: ${field.label}` : ``}`);
												await self.commit();
											},

											ondelete_entry: (entry_id) => {
												PageTypeEntries.delete(entry_id);
												clearTimeout($.get(commit_task));
												$.set(commit_task, setTimeout(() => self.commit(), 500), true);
											}
										});
									};

									$.if(node_30, ($$render) => {
										if ($.get(page_type)) $$render(consequent_4);
									});
								}

								$.reset(div_9);
								$.append($$anchor, div_9);
							},
							$$slots: { default: true }
						});
					});

					$.append($$anchor, fragment_9);
				},
				$$slots: { default: true }
			});
		});
	}

	$.reset(div_1);

	var node_31 = $.sibling(div_1, 2);

	$.component(node_31, () => Dialog.Root, ($$anchor, Dialog_Root_4) => {
		Dialog_Root_4($$anchor, {
			get open() {
				return $.get(upload_dialog_open);
			},

			set open($$value) {
				$.set(upload_dialog_open, $$value, true);
			},

			children: ($$anchor, $$slotProps) => {
				var fragment_18 = $.comment();
				var node_32 = $.first_child(fragment_18);

				$.component(node_32, () => Dialog.Content, ($$anchor, Dialog_Content_4) => {
					Dialog_Content_4($$anchor, {
						class: 'sm:max-w-[500px] pt-12 gap-0',
						children: ($$anchor, $$slotProps) => {
							var fragment_19 = root_11();
							var node_33 = $.sibling($.first_child(fragment_19), 4);

							{
								var consequent_5 = ($$anchor) => {
									var div_10 = root_10();
									var div_11 = $.child(div_10);
									var node_34 = $.child(div_11);

									Loader(node_34, { class: 'h-8 w-8' });
									$.reset(div_11);
									$.next(2);
									$.reset(div_10);
									$.append($$anchor, div_10);
								};

								var alternate_2 = ($$anchor) => {
									DropZone($$anchor, {
										onupload: upload_block,
										get invalid() {
											return $.get(upload_file_invalid);
										},
										drop_text: 'Drop your block file here or click to browse',
										accept: '.json',
										class: 'mb-4'
									});
								};

								$.if(node_33, ($$render) => {
									if ($.get(is_importing)) $$render(consequent_5); else $$render(alternate_2, -1);
								});
							}

							var node_35 = $.sibling(node_33, 2);

							$.component(node_35, () => Dialog.Footer, ($$anchor, Dialog_Footer) => {
								Dialog_Footer($$anchor, {
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

												var text_2 = $.text('Cancel');

												$.append($$anchor, text_2);
											},
											$$slots: { default: true }
										});
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_19);
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment_18);
			},
			$$slots: { default: true }
		});
	});

	$.append($$anchor, fragment);
	$.pop();
	$$cleanup();
}

$.delegate(['click']);