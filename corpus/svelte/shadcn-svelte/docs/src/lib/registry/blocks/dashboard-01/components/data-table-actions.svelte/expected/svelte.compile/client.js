import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import DotsVerticalIcon from "@tabler/icons-svelte/icons/dots-vertical";
import * as DropdownMenu from "$lib/registry/ui/dropdown-menu/index.js";
import { Button } from "$lib/registry/ui/button/index.js";

var root = $.from_html(`<!> <span class="sr-only">Open menu</span>`, 1);
var root_1 = $.from_html(`<!> <!> <!> <!> <!>`, 1);
var root_2 = $.from_html(`<!> <!>`, 1);

export default function Data_table_actions($$anchor) {
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => DropdownMenu.Root, ($$anchor, DropdownMenu_Root) => {
		DropdownMenu_Root($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root_2();
				var node_1 = $.first_child(fragment_1);

				{
					const child = ($$anchor, $$arg0) => {
						let props = () => ($$arg0?.()).props;

						Button($$anchor, $.spread_props({ variant: 'ghost', size: 'icon' }, props, {
							children: ($$anchor, $$slotProps) => {
								var fragment_3 = root();
								var node_2 = $.first_child(fragment_3);

								DotsVerticalIcon(node_2, {});
								$.next(2);
								$.append($$anchor, fragment_3);
							},
							$$slots: { default: true }
						}));
					};

					$.component(node_1, () => DropdownMenu.Trigger, ($$anchor, DropdownMenu_Trigger) => {
						DropdownMenu_Trigger($$anchor, {
							class: 'flex size-8 text-muted-foreground data-[state=open]:bg-muted',
							child,
							$$slots: { child: true }
						});
					});
				}

				var node_3 = $.sibling(node_1, 2);

				$.component(node_3, () => DropdownMenu.Content, ($$anchor, DropdownMenu_Content) => {
					DropdownMenu_Content($$anchor, {
						align: 'end',
						class: 'w-32',
						children: ($$anchor, $$slotProps) => {
							var fragment_4 = root_1();
							var node_4 = $.first_child(fragment_4);

							$.component(node_4, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item) => {
								DropdownMenu_Item($$anchor, {
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text = $.text('Edit');

										$.append($$anchor, text);
									},
									$$slots: { default: true }
								});
							});

							var node_5 = $.sibling(node_4, 2);

							$.component(node_5, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item_1) => {
								DropdownMenu_Item_1($$anchor, {
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_1 = $.text('Make a copy');

										$.append($$anchor, text_1);
									},
									$$slots: { default: true }
								});
							});

							var node_6 = $.sibling(node_5, 2);

							$.component(node_6, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item_2) => {
								DropdownMenu_Item_2($$anchor, {
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_2 = $.text('Favorite');

										$.append($$anchor, text_2);
									},
									$$slots: { default: true }
								});
							});

							var node_7 = $.sibling(node_6, 2);

							$.component(node_7, () => DropdownMenu.Separator, ($$anchor, DropdownMenu_Separator) => {
								DropdownMenu_Separator($$anchor, {});
							});

							var node_8 = $.sibling(node_7, 2);

							$.component(node_8, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item_3) => {
								DropdownMenu_Item_3($$anchor, {
									variant: 'destructive',
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_3 = $.text('Delete');

										$.append($$anchor, text_3);
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_4);
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		});
	});

	$.append($$anchor, fragment);
}