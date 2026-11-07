import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import CheckIcon from "@lucide/svelte/icons/check";
import ChevronsUpDownIcon from "@lucide/svelte/icons/chevrons-up-down";
import GalleryVerticalEndIcon from "@lucide/svelte/icons/gallery-vertical-end";
import * as DropdownMenu from "$lib/registry/ui/dropdown-menu/index.js";
import * as Sidebar from "$lib/registry/ui/sidebar/index.js";

var root = $.from_html(`<div class="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground"><!></div> <div class="flex flex-col gap-0.5 leading-none"><span class="font-semibold">Documentation</span> <span> </span></div> <!>`, 1);
var root_1 = $.from_html(` <!>`, 1);
var root_2 = $.from_html(`<!> <!>`, 1);

export default function Version_switcher($$anchor, $$props) {
	// svelte-ignore state_referenced_locally
	let selectedVersion = $.state($.proxy($$props.defaultVersion));

	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => Sidebar.Menu, ($$anchor, Sidebar_Menu) => {
		Sidebar_Menu($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = $.comment();
				var node_1 = $.first_child(fragment_1);

				$.component(node_1, () => Sidebar.MenuItem, ($$anchor, Sidebar_MenuItem) => {
					Sidebar_MenuItem($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_2 = $.comment();
							var node_2 = $.first_child(fragment_2);

							$.component(node_2, () => DropdownMenu.Root, ($$anchor, DropdownMenu_Root) => {
								DropdownMenu_Root($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_3 = root_2();
										var node_3 = $.first_child(fragment_3);

										{
											const child = ($$anchor, $$arg0) => {
												let props = () => ($$arg0?.()).props;
												var fragment_4 = $.comment();
												var node_4 = $.first_child(fragment_4);

												$.component(node_4, () => Sidebar.MenuButton, ($$anchor, Sidebar_MenuButton) => {
													Sidebar_MenuButton($$anchor, $.spread_props(
														{
															size: 'lg',
															class: 'data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground'
														},
														props,
														{
															children: ($$anchor, $$slotProps) => {
																var fragment_5 = root();
																var div = $.first_child(fragment_5);
																var node_5 = $.child(div);

																GalleryVerticalEndIcon(node_5, { class: 'size-4' });
																$.reset(div);

																var div_1 = $.sibling(div, 2);
																var span = $.sibling($.child(div_1), 2);
																var text = $.only_child(span);

																$.reset(div_1);

																var node_6 = $.sibling(div_1, 2);

																ChevronsUpDownIcon(node_6, { class: 'ms-auto' });
																$.template_effect(() => $.set_text(text, `v${$.get(selectedVersion) ?? ''}`));
																$.append($$anchor, fragment_5);
															},
															$$slots: { default: true }
														}
													));
												});

												$.append($$anchor, fragment_4);
											};

											$.component(node_3, () => DropdownMenu.Trigger, ($$anchor, DropdownMenu_Trigger) => {
												DropdownMenu_Trigger($$anchor, { child, $$slots: { child: true } });
											});
										}

										var node_7 = $.sibling(node_3, 2);

										$.component(node_7, () => DropdownMenu.Content, ($$anchor, DropdownMenu_Content) => {
											DropdownMenu_Content($$anchor, {
												class: 'w-(--bits-dropdown-menu-anchor-width)',
												align: 'start',
												children: ($$anchor, $$slotProps) => {
													var fragment_6 = $.comment();
													var node_8 = $.first_child(fragment_6);

													$.each(node_8, 16, () => $$props.versions, (version) => version, ($$anchor, version) => {
														var fragment_7 = $.comment();
														var node_9 = $.first_child(fragment_7);

														$.component(node_9, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item) => {
															DropdownMenu_Item($$anchor, {
																onSelect: () => $.set(selectedVersion, version, true),
																children: ($$anchor, $$slotProps) => {
																	$.next();

																	var fragment_8 = root_1();
																	var text_1 = $.first_child(fragment_8);
																	var node_10 = $.sibling(text_1);

																	{
																		var consequent = ($$anchor) => {
																			CheckIcon($$anchor, { class: 'ms-auto' });
																		};

																		$.if(node_10, ($$render) => {
																			if (version === $.get(selectedVersion)) $$render(consequent);
																		});
																	}

																	$.template_effect(() => $.set_text(text_1, `v${version ?? ''} `));
																	$.append($$anchor, fragment_8);
																},
																$$slots: { default: true }
															});
														});

														$.append($$anchor, fragment_7);
													});

													$.append($$anchor, fragment_6);
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
	});

	$.append($$anchor, fragment);
}