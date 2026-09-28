import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import EllipsisIcon from "@lucide/svelte/icons/ellipsis";
import * as DropdownMenu from "$lib/registry/ui/dropdown-menu/index.js";
import * as Sidebar from "$lib/registry/ui/sidebar/index.js";
import { useSidebar } from "$lib/registry/ui/sidebar/index.js";

var root = $.from_html(` <!>`, 1);
var root_1 = $.from_html(`<a> </a>`);
var root_2 = $.from_html(`<!> <!>`, 1);

export default function Nav_main($$anchor, $$props) {
	$.push($$props, true);

	const sidebar = useSidebar();
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => Sidebar.Group, ($$anchor, Sidebar_Group) => {
		Sidebar_Group($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = $.comment();
				var node_1 = $.first_child(fragment_1);

				$.component(node_1, () => Sidebar.Menu, ($$anchor, Sidebar_Menu) => {
					Sidebar_Menu($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_2 = $.comment();
							var node_2 = $.first_child(fragment_2);

							$.each(node_2, 17, () => $$props.items, (item) => item.title, ($$anchor, item) => {
								var fragment_3 = $.comment();
								var node_3 = $.first_child(fragment_3);

								$.component(node_3, () => DropdownMenu.Root, ($$anchor, DropdownMenu_Root) => {
									DropdownMenu_Root($$anchor, {
										children: ($$anchor, $$slotProps) => {
											var fragment_4 = $.comment();
											var node_4 = $.first_child(fragment_4);

											$.component(node_4, () => Sidebar.MenuItem, ($$anchor, Sidebar_MenuItem) => {
												Sidebar_MenuItem($$anchor, {
													children: ($$anchor, $$slotProps) => {
														var fragment_5 = root_2();
														var node_5 = $.first_child(fragment_5);

														{
															const child = ($$anchor, $$arg0) => {
																let props = () => ($$arg0?.()).props;
																var fragment_6 = $.comment();
																var node_6 = $.first_child(fragment_6);

																$.component(node_6, () => Sidebar.MenuButton, ($$anchor, Sidebar_MenuButton) => {
																	Sidebar_MenuButton($$anchor, $.spread_props(
																		{
																			class: 'data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground'
																		},
																		props,
																		{
																			children: ($$anchor, $$slotProps) => {
																				$.next();

																				var fragment_7 = root();
																				var text = $.first_child(fragment_7);
																				var node_7 = $.sibling(text);

																				EllipsisIcon(node_7, { class: 'ms-auto' });
																				$.template_effect(() => $.set_text(text, `${$.get(item).title ?? ''} `));
																				$.append($$anchor, fragment_7);
																			},
																			$$slots: { default: true }
																		}
																	));
																});

																$.append($$anchor, fragment_6);
															};

															$.component(node_5, () => DropdownMenu.Trigger, ($$anchor, DropdownMenu_Trigger) => {
																DropdownMenu_Trigger($$anchor, { child, $$slots: { child: true } });
															});
														}

														var node_8 = $.sibling(node_5, 2);

														{
															var consequent = ($$anchor) => {
																var fragment_8 = $.comment();
																var node_9 = $.first_child(fragment_8);

																{
																	let $0 = $.derived(() => sidebar.isMobile ? "bottom" : "right");
																	let $1 = $.derived(() => sidebar.isMobile ? "end" : "start");

																	$.component(node_9, () => DropdownMenu.Content, ($$anchor, DropdownMenu_Content) => {
																		DropdownMenu_Content($$anchor, {
																			get side() {
																				return $.get($0);
																			},

																			get align() {
																				return $.get($1);
																			},
																			class: 'min-w-56 rounded-lg',
																			children: ($$anchor, $$slotProps) => {
																				var fragment_9 = $.comment();
																				var node_10 = $.first_child(fragment_9);

																				$.each(node_10, 17, () => $.get(item).items, (subItem) => subItem.title, ($$anchor, subItem) => {
																					var fragment_10 = $.comment();
																					var node_11 = $.first_child(fragment_10);

																					{
																						const child = ($$anchor, $$arg0) => {
																							let props = () => ($$arg0?.()).props;
																							var a = root_1();

																							$.attribute_effect(a, () => ({ href: $.get(subItem).url, ...props() }));

																							var text_1 = $.only_child(a, true);

																							$.template_effect(() => $.set_text(text_1, $.get(subItem).title));
																							$.append($$anchor, a);
																						};

																						$.component(node_11, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item) => {
																							DropdownMenu_Item($$anchor, { child, $$slots: { child: true } });
																						});
																					}

																					$.append($$anchor, fragment_10);
																				});

																				$.append($$anchor, fragment_9);
																			},
																			$$slots: { default: true }
																		});
																	});
																}

																$.append($$anchor, fragment_8);
															};

															$.if(node_8, ($$render) => {
																if ($.get(item).items?.length) $$render(consequent);
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