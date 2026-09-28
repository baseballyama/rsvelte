import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as ContextMenu from "$lib/registry/ui/context-menu/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

var root = $.from_html(`<!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);

export default function Context_menu_with_checkboxes($$anchor) {
	Example($$anchor, {
		title: 'With Checkboxes',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = $.comment();
			var node = $.first_child(fragment_1);

			$.component(node, () => ContextMenu.Root, ($$anchor, ContextMenu_Root) => {
				ContextMenu_Root($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = root_1();
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
									var fragment_3 = $.comment();
									var node_3 = $.first_child(fragment_3);

									$.component(node_3, () => ContextMenu.Group, ($$anchor, ContextMenu_Group) => {
										ContextMenu_Group($$anchor, {
											children: ($$anchor, $$slotProps) => {
												var fragment_4 = root();
												var node_4 = $.first_child(fragment_4);

												$.component(node_4, () => ContextMenu.CheckboxItem, ($$anchor, ContextMenu_CheckboxItem) => {
													ContextMenu_CheckboxItem($$anchor, {
														checked: true,
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_1 = $.text('Show Bookmarks Bar');

															$.append($$anchor, text_1);
														},
														$$slots: { default: true }
													});
												});

												var node_5 = $.sibling(node_4, 2);

												$.component(node_5, () => ContextMenu.CheckboxItem, ($$anchor, ContextMenu_CheckboxItem_1) => {
													ContextMenu_CheckboxItem_1($$anchor, {
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_2 = $.text('Show Full URLs');

															$.append($$anchor, text_2);
														},
														$$slots: { default: true }
													});
												});

												var node_6 = $.sibling(node_5, 2);

												$.component(node_6, () => ContextMenu.CheckboxItem, ($$anchor, ContextMenu_CheckboxItem_2) => {
													ContextMenu_CheckboxItem_2($$anchor, {
														checked: true,
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_3 = $.text('Show Developer Tools');

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