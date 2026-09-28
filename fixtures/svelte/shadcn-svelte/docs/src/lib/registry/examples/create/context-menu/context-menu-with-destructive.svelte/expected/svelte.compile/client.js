import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as ContextMenu from "$lib/registry/ui/context-menu/index.js";
import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

var root = $.from_html(`<!> Edit`, 1);
var root_1 = $.from_html(`<!> Share`, 1);
var root_2 = $.from_html(`<!> <!>`, 1);
var root_3 = $.from_html(`<!> Archive`, 1);
var root_4 = $.from_html(`<!> Delete`, 1);
var root_5 = $.from_html(`<!> <!> <!>`, 1);

export default function Context_menu_with_destructive($$anchor) {
	Example($$anchor, {
		title: 'With Destructive Items',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = $.comment();
			var node = $.first_child(fragment_1);

			$.component(node, () => ContextMenu.Root, ($$anchor, ContextMenu_Root) => {
				ContextMenu_Root($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = root_2();
						var node_1 = $.first_child(fragment_2);

						$.component(node_1, () => ContextMenu.Trigger, ($$anchor, ContextMenu_Trigger) => {
							ContextMenu_Trigger($$anchor, {
								class: 'flex aspect-[2/0.5] w-full items-center justify-center rounded-lg border text-sm',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text = $.text('Right click here');

									$.append($$anchor, text);
								},
								$$slots: { default: true }
							});
						});

						var node_2 = $.sibling(node_1, 2);

						$.component(node_2, () => ContextMenu.Content, ($$anchor, ContextMenu_Content) => {
							ContextMenu_Content($$anchor, {
								children: ($$anchor, $$slotProps) => {
									var fragment_3 = root_5();
									var node_3 = $.first_child(fragment_3);

									$.component(node_3, () => ContextMenu.Group, ($$anchor, ContextMenu_Group) => {
										ContextMenu_Group($$anchor, {
											children: ($$anchor, $$slotProps) => {
												var fragment_4 = root_2();
												var node_4 = $.first_child(fragment_4);

												$.component(node_4, () => ContextMenu.Item, ($$anchor, ContextMenu_Item) => {
													ContextMenu_Item($$anchor, {
														children: ($$anchor, $$slotProps) => {
															var fragment_5 = root();
															var node_5 = $.first_child(fragment_5);

															IconPlaceholder(node_5, {
																lucide: 'PencilIcon',
																tabler: 'IconPencil',
																hugeicons: 'EditIcon',
																phosphor: 'PencilIcon',
																remixicon: 'RiPencilLine'
															});

															$.next();
															$.append($$anchor, fragment_5);
														},
														$$slots: { default: true }
													});
												});

												var node_6 = $.sibling(node_4, 2);

												$.component(node_6, () => ContextMenu.Item, ($$anchor, ContextMenu_Item_1) => {
													ContextMenu_Item_1($$anchor, {
														children: ($$anchor, $$slotProps) => {
															var fragment_6 = root_1();
															var node_7 = $.first_child(fragment_6);

															IconPlaceholder(node_7, {
																lucide: 'ShareIcon',
																tabler: 'IconShare',
																hugeicons: 'ShareIcon',
																phosphor: 'ShareIcon',
																remixicon: 'RiShareLine'
															});

															$.next();
															$.append($$anchor, fragment_6);
														},
														$$slots: { default: true }
													});
												});

												$.append($$anchor, fragment_4);
											},
											$$slots: { default: true }
										});
									});

									var node_8 = $.sibling(node_3, 2);

									$.component(node_8, () => ContextMenu.Separator, ($$anchor, ContextMenu_Separator) => {
										ContextMenu_Separator($$anchor, {});
									});

									var node_9 = $.sibling(node_8, 2);

									$.component(node_9, () => ContextMenu.Group, ($$anchor, ContextMenu_Group_1) => {
										ContextMenu_Group_1($$anchor, {
											children: ($$anchor, $$slotProps) => {
												var fragment_7 = root_2();
												var node_10 = $.first_child(fragment_7);

												$.component(node_10, () => ContextMenu.Item, ($$anchor, ContextMenu_Item_2) => {
													ContextMenu_Item_2($$anchor, {
														children: ($$anchor, $$slotProps) => {
															var fragment_8 = root_3();
															var node_11 = $.first_child(fragment_8);

															IconPlaceholder(node_11, {
																lucide: 'ArchiveIcon',
																tabler: 'IconArchive',
																hugeicons: 'Archive02Icon',
																phosphor: 'ArchiveIcon',
																remixicon: 'RiArchiveLine'
															});

															$.next();
															$.append($$anchor, fragment_8);
														},
														$$slots: { default: true }
													});
												});

												var node_12 = $.sibling(node_10, 2);

												$.component(node_12, () => ContextMenu.Item, ($$anchor, ContextMenu_Item_3) => {
													ContextMenu_Item_3($$anchor, {
														variant: 'destructive',
														children: ($$anchor, $$slotProps) => {
															var fragment_9 = root_4();
															var node_13 = $.first_child(fragment_9);

															IconPlaceholder(node_13, {
																lucide: 'TrashIcon',
																tabler: 'IconTrash',
																hugeicons: 'DeleteIcon',
																phosphor: 'TrashIcon',
																remixicon: 'RiDeleteBinLine'
															});

															$.next();
															$.append($$anchor, fragment_9);
														},
														$$slots: { default: true }
													});
												});

												$.append($$anchor, fragment_7);
											},
											$$slots: { default: true }
										});
									});

									$.append($$anchor, fragment_3);
								},
								$$slots: { default: true }
							});
						});

						$.append($$anchor, fragment_2);
					},
					$$slots: { default: true }
				});
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}