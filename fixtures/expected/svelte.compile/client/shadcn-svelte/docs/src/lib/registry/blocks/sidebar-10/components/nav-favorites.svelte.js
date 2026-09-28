import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import ArrowUpRightIcon from "@lucide/svelte/icons/arrow-up-right";
import EllipsisIcon from "@lucide/svelte/icons/ellipsis";
import LinkIcon from "@lucide/svelte/icons/link";
import StarOffIcon from "@lucide/svelte/icons/star-off";
import Trash2Icon from "@lucide/svelte/icons/trash-2";
import * as DropdownMenu from "$lib/registry/ui/dropdown-menu/index.js";
import * as Sidebar from "$lib/registry/ui/sidebar/index.js";
import { useSidebar } from "$lib/registry/ui/sidebar/index.js";

var root = $.from_html(`<a><span> </span> <span> </span></a>`);
var root_1 = $.from_html(`<!> <span class="sr-only">More</span>`, 1);
var root_2 = $.from_html(`<!> <span>Remove from Favorites</span>`, 1);
var root_3 = $.from_html(`<!> <span>Copy Link</span>`, 1);
var root_4 = $.from_html(`<!> <span>Open in New Tab</span>`, 1);
var root_5 = $.from_html(`<!> <span>Delete</span>`, 1);
var root_6 = $.from_html(`<!> <!> <!> <!> <!> <!>`, 1);
var root_7 = $.from_html(`<!> <!>`, 1);
var root_8 = $.from_html(`<!> <span>More</span>`, 1);

export default function Nav_favorites($$anchor, $$props) {
	$.push($$props, true);

	const sidebar = useSidebar();
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => Sidebar.Group, ($$anchor, Sidebar_Group) => {
		Sidebar_Group($$anchor, {
			class: 'group-data-[collapsible=icon]:hidden',
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root_7();
				var node_1 = $.first_child(fragment_1);

				$.component(node_1, () => Sidebar.GroupLabel, ($$anchor, Sidebar_GroupLabel) => {
					Sidebar_GroupLabel($$anchor, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text = $.text('Favorites');

							$.append($$anchor, text);
						},
						$$slots: { default: true }
					});
				});

				var node_2 = $.sibling(node_1, 2);

				$.component(node_2, () => Sidebar.Menu, ($$anchor, Sidebar_Menu) => {
					Sidebar_Menu($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_2 = root_7();
							var node_3 = $.first_child(fragment_2);

							$.each(node_3, 17, () => $$props.favorites, (item) => item.name, ($$anchor, item) => {
								var fragment_3 = $.comment();
								var node_4 = $.first_child(fragment_3);

								$.component(node_4, () => Sidebar.MenuItem, ($$anchor, Sidebar_MenuItem) => {
									Sidebar_MenuItem($$anchor, {
										children: ($$anchor, $$slotProps) => {
											var fragment_4 = root_7();
											var node_5 = $.first_child(fragment_4);

											{
												const child = ($$anchor, $$arg0) => {
													let props = () => ($$arg0?.()).props;
													var a = root();

													$.attribute_effect(a, () => ({ href: $.get(item).url, title: $.get(item).name, ...props() }));

													var span = $.child(a);
													var text_1 = $.only_child(span, true);
													var span_1 = $.sibling(span, 2);
													var text_2 = $.only_child(span_1, true);

													$.reset(a);

													$.template_effect(() => {
														$.set_text(text_1, $.get(item).emoji);
														$.set_text(text_2, $.get(item).name);
													});

													$.append($$anchor, a);
												};

												$.component(node_5, () => Sidebar.MenuButton, ($$anchor, Sidebar_MenuButton) => {
													Sidebar_MenuButton($$anchor, { child, $$slots: { child: true } });
												});
											}

											var node_6 = $.sibling(node_5, 2);

											$.component(node_6, () => DropdownMenu.Root, ($$anchor, DropdownMenu_Root) => {
												DropdownMenu_Root($$anchor, {
													children: ($$anchor, $$slotProps) => {
														var fragment_5 = root_7();
														var node_7 = $.first_child(fragment_5);

														{
															const child = ($$anchor, $$arg0) => {
																let props = () => ($$arg0?.()).props;
																var fragment_6 = $.comment();
																var node_8 = $.first_child(fragment_6);

																$.component(node_8, () => Sidebar.MenuAction, ($$anchor, Sidebar_MenuAction) => {
																	Sidebar_MenuAction($$anchor, $.spread_props({ showOnHover: true }, props, {
																		children: ($$anchor, $$slotProps) => {
																			var fragment_7 = root_1();
																			var node_9 = $.first_child(fragment_7);

																			EllipsisIcon(node_9, {});
																			$.next(2);
																			$.append($$anchor, fragment_7);
																		},
																		$$slots: { default: true }
																	}));
																});

																$.append($$anchor, fragment_6);
															};

															$.component(node_7, () => DropdownMenu.Trigger, ($$anchor, DropdownMenu_Trigger) => {
																DropdownMenu_Trigger($$anchor, { child, $$slots: { child: true } });
															});
														}

														var node_10 = $.sibling(node_7, 2);

														{
															let $0 = $.derived(() => sidebar.isMobile ? "bottom" : "right");
															let $1 = $.derived(() => sidebar.isMobile ? "end" : "start");

															$.component(node_10, () => DropdownMenu.Content, ($$anchor, DropdownMenu_Content) => {
																DropdownMenu_Content($$anchor, {
																	class: 'w-56 rounded-lg',
																	get side() {
																		return $.get($0);
																	},

																	get align() {
																		return $.get($1);
																	},

																	children: ($$anchor, $$slotProps) => {
																		var fragment_8 = root_6();
																		var node_11 = $.first_child(fragment_8);

																		$.component(node_11, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item) => {
																			DropdownMenu_Item($$anchor, {
																				children: ($$anchor, $$slotProps) => {
																					var fragment_9 = root_2();
																					var node_12 = $.first_child(fragment_9);

																					StarOffIcon(node_12, { class: 'text-muted-foreground' });
																					$.next(2);
																					$.append($$anchor, fragment_9);
																				},
																				$$slots: { default: true }
																			});
																		});

																		var node_13 = $.sibling(node_11, 2);

																		$.component(node_13, () => DropdownMenu.Separator, ($$anchor, DropdownMenu_Separator) => {
																			DropdownMenu_Separator($$anchor, {});
																		});

																		var node_14 = $.sibling(node_13, 2);

																		$.component(node_14, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item_1) => {
																			DropdownMenu_Item_1($$anchor, {
																				children: ($$anchor, $$slotProps) => {
																					var fragment_10 = root_3();
																					var node_15 = $.first_child(fragment_10);

																					LinkIcon(node_15, { class: 'text-muted-foreground' });
																					$.next(2);
																					$.append($$anchor, fragment_10);
																				},
																				$$slots: { default: true }
																			});
																		});

																		var node_16 = $.sibling(node_14, 2);

																		$.component(node_16, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item_2) => {
																			DropdownMenu_Item_2($$anchor, {
																				children: ($$anchor, $$slotProps) => {
																					var fragment_11 = root_4();
																					var node_17 = $.first_child(fragment_11);

																					ArrowUpRightIcon(node_17, { class: 'text-muted-foreground' });
																					$.next(2);
																					$.append($$anchor, fragment_11);
																				},
																				$$slots: { default: true }
																			});
																		});

																		var node_18 = $.sibling(node_16, 2);

																		$.component(node_18, () => DropdownMenu.Separator, ($$anchor, DropdownMenu_Separator_1) => {
																			DropdownMenu_Separator_1($$anchor, {});
																		});

																		var node_19 = $.sibling(node_18, 2);

																		$.component(node_19, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item_3) => {
																			DropdownMenu_Item_3($$anchor, {
																				children: ($$anchor, $$slotProps) => {
																					var fragment_12 = root_5();
																					var node_20 = $.first_child(fragment_12);

																					Trash2Icon(node_20, { class: 'text-muted-foreground' });
																					$.next(2);
																					$.append($$anchor, fragment_12);
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

							var node_21 = $.sibling(node_3, 2);

							$.component(node_21, () => Sidebar.MenuItem, ($$anchor, Sidebar_MenuItem_1) => {
								Sidebar_MenuItem_1($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_13 = $.comment();
										var node_22 = $.first_child(fragment_13);

										$.component(node_22, () => Sidebar.MenuButton, ($$anchor, Sidebar_MenuButton_1) => {
											Sidebar_MenuButton_1($$anchor, {
												class: 'text-sidebar-foreground/70',
												children: ($$anchor, $$slotProps) => {
													var fragment_14 = root_8();
													var node_23 = $.first_child(fragment_14);

													EllipsisIcon(node_23, {});
													$.next(2);
													$.append($$anchor, fragment_14);
												},
												$$slots: { default: true }
											});
										});

										$.append($$anchor, fragment_13);
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