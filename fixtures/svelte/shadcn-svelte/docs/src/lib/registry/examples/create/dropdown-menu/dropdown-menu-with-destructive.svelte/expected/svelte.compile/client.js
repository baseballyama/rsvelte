import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as DropdownMenu from "$lib/registry/ui/dropdown-menu/index.js";
import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
import { Button } from "$lib/registry/ui/button/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

var root = $.from_html(`<!> Edit`, 1);
var root_1 = $.from_html(`<!> Share`, 1);
var root_2 = $.from_html(`<!> Archive`, 1);
var root_3 = $.from_html(`<!> Delete`, 1);
var root_4 = $.from_html(`<!> <!> <!> <!> <!>`, 1);
var root_5 = $.from_html(`<!> <!>`, 1);

export default function Dropdown_menu_with_destructive($$anchor) {
	Example($$anchor, {
		title: 'With Destructive Items',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = $.comment();
			var node = $.first_child(fragment_1);

			$.component(node, () => DropdownMenu.Root, ($$anchor, DropdownMenu_Root) => {
				DropdownMenu_Root($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = root_5();
						var node_1 = $.first_child(fragment_2);

						{
							const child = ($$anchor, $$arg0) => {
								let props = () => ($$arg0?.()).props;

								Button($$anchor, $.spread_props({ variant: 'outline', class: 'w-fit' }, props, {
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text = $.text('Actions');

										$.append($$anchor, text);
									},
									$$slots: { default: true }
								}));
							};

							$.component(node_1, () => DropdownMenu.Trigger, ($$anchor, DropdownMenu_Trigger) => {
								DropdownMenu_Trigger($$anchor, { child, $$slots: { child: true } });
							});
						}

						var node_2 = $.sibling(node_1, 2);

						$.component(node_2, () => DropdownMenu.Content, ($$anchor, DropdownMenu_Content) => {
							DropdownMenu_Content($$anchor, {
								children: ($$anchor, $$slotProps) => {
									var fragment_4 = root_4();
									var node_3 = $.first_child(fragment_4);

									$.component(node_3, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item) => {
										DropdownMenu_Item($$anchor, {
											children: ($$anchor, $$slotProps) => {
												var fragment_5 = root();
												var node_4 = $.first_child(fragment_5);

												IconPlaceholder(node_4, {
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

									var node_5 = $.sibling(node_3, 2);

									$.component(node_5, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item_1) => {
										DropdownMenu_Item_1($$anchor, {
											children: ($$anchor, $$slotProps) => {
												var fragment_6 = root_1();
												var node_6 = $.first_child(fragment_6);

												IconPlaceholder(node_6, {
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

									var node_7 = $.sibling(node_5, 2);

									$.component(node_7, () => DropdownMenu.Separator, ($$anchor, DropdownMenu_Separator) => {
										DropdownMenu_Separator($$anchor, {});
									});

									var node_8 = $.sibling(node_7, 2);

									$.component(node_8, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item_2) => {
										DropdownMenu_Item_2($$anchor, {
											children: ($$anchor, $$slotProps) => {
												var fragment_7 = root_2();
												var node_9 = $.first_child(fragment_7);

												IconPlaceholder(node_9, {
													lucide: 'ArchiveIcon',
													tabler: 'IconArchive',
													hugeicons: 'Archive02Icon',
													phosphor: 'ArchiveIcon',
													remixicon: 'RiArchiveLine'
												});

												$.next();
												$.append($$anchor, fragment_7);
											},
											$$slots: { default: true }
										});
									});

									var node_10 = $.sibling(node_8, 2);

									$.component(node_10, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item_3) => {
										DropdownMenu_Item_3($$anchor, {
											variant: 'destructive',
											children: ($$anchor, $$slotProps) => {
												var fragment_8 = root_3();
												var node_11 = $.first_child(fragment_8);

												IconPlaceholder(node_11, {
													lucide: 'TrashIcon',
													tabler: 'IconTrash',
													hugeicons: 'DeleteIcon',
													phosphor: 'TrashIcon',
													remixicon: 'RiDeleteBinLine'
												});

												$.next();
												$.append($$anchor, fragment_8);
											},
											$$slots: { default: true }
										});
									});

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

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}