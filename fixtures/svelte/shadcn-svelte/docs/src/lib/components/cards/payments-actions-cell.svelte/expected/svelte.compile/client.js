import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import EllipsisIcon from "@lucide/svelte/icons/ellipsis";
import * as DropdownMenu from "$lib/registry/ui/dropdown-menu/index.js";
import { Button } from "$lib/registry/ui/button/index.js";

var root = $.from_html(`<span class="sr-only">Open menu</span> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!> <!> <!>`, 1);
var root_2 = $.from_html(`<!> <!>`, 1);

export default function Payments_actions_cell($$anchor, $$props) {
	$.push($$props, true);

	const payment = $.derived(() => $$props.row.original);
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

						Button($$anchor, $.spread_props({ variant: 'ghost', class: 'size-8 p-0' }, props, {
							children: ($$anchor, $$slotProps) => {
								var fragment_3 = root();
								var node_2 = $.sibling($.first_child(fragment_3), 2);

								EllipsisIcon(node_2, {});
								$.append($$anchor, fragment_3);
							},
							$$slots: { default: true }
						}));
					};

					$.component(node_1, () => DropdownMenu.Trigger, ($$anchor, DropdownMenu_Trigger) => {
						DropdownMenu_Trigger($$anchor, { child, $$slots: { child: true } });
					});
				}

				var node_3 = $.sibling(node_1, 2);

				$.component(node_3, () => DropdownMenu.Content, ($$anchor, DropdownMenu_Content) => {
					DropdownMenu_Content($$anchor, {
						align: 'end',
						children: ($$anchor, $$slotProps) => {
							var fragment_4 = root_1();
							var node_4 = $.first_child(fragment_4);

							$.component(node_4, () => DropdownMenu.Label, ($$anchor, DropdownMenu_Label) => {
								DropdownMenu_Label($$anchor, {
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text = $.text('Actions');

										$.append($$anchor, text);
									},
									$$slots: { default: true }
								});
							});

							var node_5 = $.sibling(node_4, 2);

							$.component(node_5, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item) => {
								DropdownMenu_Item($$anchor, {
									onclick: () => navigator.clipboard.writeText($.get(payment).id),
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_1 = $.text('Copy payment ID');

										$.append($$anchor, text_1);
									},
									$$slots: { default: true }
								});
							});

							var node_6 = $.sibling(node_5, 2);

							$.component(node_6, () => DropdownMenu.Separator, ($$anchor, DropdownMenu_Separator) => {
								DropdownMenu_Separator($$anchor, {});
							});

							var node_7 = $.sibling(node_6, 2);

							$.component(node_7, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item_1) => {
								DropdownMenu_Item_1($$anchor, {
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_2 = $.text('View customer');

										$.append($$anchor, text_2);
									},
									$$slots: { default: true }
								});
							});

							var node_8 = $.sibling(node_7, 2);

							$.component(node_8, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item_2) => {
								DropdownMenu_Item_2($$anchor, {
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_3 = $.text('View payment details');

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
	$.pop();
}