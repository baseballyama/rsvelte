import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import DotsIcon from "@tabler/icons-svelte/icons/dots";
import FolderIcon from "@tabler/icons-svelte/icons/folder";
import Share3Icon from "@tabler/icons-svelte/icons/share-3";
import TrashIcon from "@tabler/icons-svelte/icons/trash";
import * as DropdownMenu from "$lib/registry/ui/dropdown-menu/index.js";
import * as Sidebar from "$lib/registry/ui/sidebar/index.js";

var root = $.from_html(`<a><!> <span> </span></a>`);
var root_1 = $.from_html(`<!> <span class="sr-only">More</span>`, 1);
var root_2 = $.from_html(`<!> <span>Open</span>`, 1);
var root_3 = $.from_html(`<!> <span>Share</span>`, 1);
var root_4 = $.from_html(`<!> <span>Delete</span>`, 1);
var root_5 = $.from_html(`<!> <!> <!> <!>`, 1);
var root_6 = $.from_html(`<!> <!>`, 1);
var root_7 = $.from_html(`<!> <span>More</span>`, 1);

export default function Nav_documents($$anchor, $$props) {
	$.push($$props, true);

	const sidebar = Sidebar.useSidebar();
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => Sidebar.Group, ($$anchor, Sidebar_Group) => {
		Sidebar_Group($$anchor, {
			class: 'group-data-[collapsible=icon]:hidden',
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root_6();
				var node_1 = $.first_child(fragment_1);

				$.component(node_1, () => Sidebar.GroupLabel, ($$anchor, Sidebar_GroupLabel) => {
					Sidebar_GroupLabel($$anchor, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text = $.text('Documents');

							$.append($$anchor, text);
						},
						$$slots: { default: true }
					});
				});

				var node_2 = $.sibling(node_1, 2);

				$.component(node_2, () => Sidebar.Menu, ($$anchor, Sidebar_Menu) => {
					Sidebar_Menu($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_2 = root_6();
							var node_3 = $.first_child(fragment_2);

							$.each(node_3, 17, () => $$props.items, (item) => item.name, ($$anchor, item) => {
								var fragment_3 = $.comment();
								var node_4 = $.first_child(fragment_3);

								$.component(node_4, () => Sidebar.MenuItem, ($$anchor, Sidebar_MenuItem) => {
									Sidebar_MenuItem($$anchor, {
										children: ($$anchor, $$slotProps) => {
											var fragment_4 = root_6();
											var node_5 = $.first_child(fragment_4);

											{
												const child = ($$anchor, $$arg0) => {
													let props = () => ($$arg0?.()).props;
													var a = root();

													$.attribute_effect(a, () => ({ href: $.get(item).url, ...props() }));

													var node_6 = $.child(a);

													$.component(node_6, () => $.get(item).icon, ($$anchor, item_icon) => {
														item_icon($$anchor, {});
													});

													var span = $.sibling(node_6, 2);
													var text_1 = $.only_child(span, true);

													$.reset(a);
													$.template_effect(() => $.set_text(text_1, $.get(item).name));
													$.append($$anchor, a);
												};

												$.component(node_5, () => Sidebar.MenuButton, ($$anchor, Sidebar_MenuButton) => {
													Sidebar_MenuButton($$anchor, { child, $$slots: { child: true } });
												});
											}

											var node_7 = $.sibling(node_5, 2);

											$.component(node_7, () => DropdownMenu.Root, ($$anchor, DropdownMenu_Root) => {
												DropdownMenu_Root($$anchor, {
													children: ($$anchor, $$slotProps) => {
														var fragment_5 = root_6();
														var node_8 = $.first_child(fragment_5);

														$.component(node_8, () => DropdownMenu.Trigger, ($$anchor, DropdownMenu_Trigger) => {
															DropdownMenu_Trigger($$anchor, {
																children: ($$anchor, $$slotProps) => {
																	var fragment_6 = $.comment();
																	var node_9 = $.first_child(fragment_6);

																	$.component(node_9, () => Sidebar.MenuAction, ($$anchor, Sidebar_MenuAction) => {
																		Sidebar_MenuAction($$anchor, {
																			showOnHover: true,
																			class: 'rounded-sm data-[state=open]:bg-accent',
																			children: ($$anchor, $$slotProps) => {
																				var fragment_7 = root_1();
																				var node_10 = $.first_child(fragment_7);

																				DotsIcon(node_10, {});
																				$.next(2);
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

														{
															let $0 = $.derived(() => sidebar.isMobile ? "bottom" : "right");
															let $1 = $.derived(() => sidebar.isMobile ? "end" : "start");

															$.component(node_11, () => DropdownMenu.Content, ($$anchor, DropdownMenu_Content) => {
																DropdownMenu_Content($$anchor, {
																	class: 'w-24 rounded-lg',
																	get side() {
																		return $.get($0);
																	},

																	get align() {
																		return $.get($1);
																	},

																	children: ($$anchor, $$slotProps) => {
																		var fragment_8 = root_5();
																		var node_12 = $.first_child(fragment_8);

																		$.component(node_12, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item) => {
																			DropdownMenu_Item($$anchor, {
																				children: ($$anchor, $$slotProps) => {
																					var fragment_9 = root_2();
																					var node_13 = $.first_child(fragment_9);

																					FolderIcon(node_13, {});
																					$.next(2);
																					$.append($$anchor, fragment_9);
																				},
																				$$slots: { default: true }
																			});
																		});

																		var node_14 = $.sibling(node_12, 2);

																		$.component(node_14, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item_1) => {
																			DropdownMenu_Item_1($$anchor, {
																				children: ($$anchor, $$slotProps) => {
																					var fragment_10 = root_3();
																					var node_15 = $.first_child(fragment_10);

																					Share3Icon(node_15, {});
																					$.next(2);
																					$.append($$anchor, fragment_10);
																				},
																				$$slots: { default: true }
																			});
																		});

																		var node_16 = $.sibling(node_14, 2);

																		$.component(node_16, () => DropdownMenu.Separator, ($$anchor, DropdownMenu_Separator) => {
																			DropdownMenu_Separator($$anchor, {});
																		});

																		var node_17 = $.sibling(node_16, 2);

																		$.component(node_17, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item_2) => {
																			DropdownMenu_Item_2($$anchor, {
																				variant: 'destructive',
																				children: ($$anchor, $$slotProps) => {
																					var fragment_11 = root_4();
																					var node_18 = $.first_child(fragment_11);

																					TrashIcon(node_18, {});
																					$.next(2);
																					$.append($$anchor, fragment_11);
																				},
																				$$slots: { default: true }
																			});
																		});

																		$.append($$anchor, fragment_8);
																	},
																	$$slots: { default: true }
																});
															});
														}

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

								$.append($$anchor, fragment_3);
							});

							var node_19 = $.sibling(node_3, 2);

							$.component(node_19, () => Sidebar.MenuItem, ($$anchor, Sidebar_MenuItem_1) => {
								Sidebar_MenuItem_1($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_12 = $.comment();
										var node_20 = $.first_child(fragment_12);

										$.component(node_20, () => Sidebar.MenuButton, ($$anchor, Sidebar_MenuButton_1) => {
											Sidebar_MenuButton_1($$anchor, {
												class: 'text-sidebar-foreground/70',
												children: ($$anchor, $$slotProps) => {
													var fragment_13 = root_7();
													var node_21 = $.first_child(fragment_13);

													DotsIcon(node_21, { class: 'text-sidebar-foreground/70' });
													$.next(2);
													$.append($$anchor, fragment_13);
												},
												$$slots: { default: true }
											});
										});

										$.append($$anchor, fragment_12);
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
	$.pop();
}