import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import CalendarIcon from "@lucide/svelte/icons/calendar";
import HouseIcon from "@lucide/svelte/icons/house";
import InboxIcon from "@lucide/svelte/icons/inbox";
import SearchIcon from "@lucide/svelte/icons/search";
import SettingsIcon from "@lucide/svelte/icons/settings";
import * as Sidebar from "$lib/registry/ui/sidebar/index.js";

var root = $.from_html(`<a><!> <span> </span></a>`);
var root_1 = $.from_html(`<!> <!>`, 1);
var root_2 = $.from_html(`<header class="flex h-12 items-center justify-between px-4"><!></header>`);

export default function Demo_sidebar($$anchor) {
	// Menu items.
	const items = [
		{ title: "Home", url: "#", icon: HouseIcon },
		{ title: "Inbox", url: "#", icon: InboxIcon },
		{ title: "Calendar", url: "#", icon: CalendarIcon },
		{ title: "Search", url: "#", icon: SearchIcon },
		{ title: "Settings", url: "#", icon: SettingsIcon }
	];

	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => Sidebar.Provider, ($$anchor, Sidebar_Provider) => {
		Sidebar_Provider($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root_1();
				var node_1 = $.first_child(fragment_1);

				$.component(node_1, () => Sidebar.Root, ($$anchor, Sidebar_Root) => {
					Sidebar_Root($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_2 = $.comment();
							var node_2 = $.first_child(fragment_2);

							$.component(node_2, () => Sidebar.Content, ($$anchor, Sidebar_Content) => {
								Sidebar_Content($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_3 = $.comment();
										var node_3 = $.first_child(fragment_3);

										$.component(node_3, () => Sidebar.Group, ($$anchor, Sidebar_Group) => {
											Sidebar_Group($$anchor, {
												children: ($$anchor, $$slotProps) => {
													var fragment_4 = root_1();
													var node_4 = $.first_child(fragment_4);

													$.component(node_4, () => Sidebar.GroupLabel, ($$anchor, Sidebar_GroupLabel) => {
														Sidebar_GroupLabel($$anchor, {
															children: ($$anchor, $$slotProps) => {
																$.next();

																var text = $.text('Application');

																$.append($$anchor, text);
															},
															$$slots: { default: true }
														});
													});

													var node_5 = $.sibling(node_4, 2);

													$.component(node_5, () => Sidebar.GroupContent, ($$anchor, Sidebar_GroupContent) => {
														Sidebar_GroupContent($$anchor, {
															children: ($$anchor, $$slotProps) => {
																var fragment_5 = $.comment();
																var node_6 = $.first_child(fragment_5);

																$.component(node_6, () => Sidebar.Menu, ($$anchor, Sidebar_Menu) => {
																	Sidebar_Menu($$anchor, {
																		children: ($$anchor, $$slotProps) => {
																			var fragment_6 = $.comment();
																			var node_7 = $.first_child(fragment_6);

																			$.each(node_7, 17, () => items, (item) => item.title, ($$anchor, item) => {
																				var fragment_7 = $.comment();
																				var node_8 = $.first_child(fragment_7);

																				$.component(node_8, () => Sidebar.MenuItem, ($$anchor, Sidebar_MenuItem) => {
																					Sidebar_MenuItem($$anchor, {
																						children: ($$anchor, $$slotProps) => {
																							var fragment_8 = $.comment();
																							var node_9 = $.first_child(fragment_8);

																							{
																								const child = ($$anchor, $$arg0) => {
																									let props = () => ($$arg0?.()).props;
																									var a = root();

																									$.attribute_effect(a, () => ({ href: $.get(item).url, ...props() }));

																									var node_10 = $.child(a);

																									$.component(node_10, () => $.get(item).icon, ($$anchor, item_icon) => {
																										item_icon($$anchor, {});
																									});

																									var span = $.sibling(node_10, 2);
																									var text_1 = $.only_child(span, true);

																									$.reset(a);
																									$.template_effect(() => $.set_text(text_1, $.get(item).title));
																									$.append($$anchor, a);
																								};

																								$.component(node_9, () => Sidebar.MenuButton, ($$anchor, Sidebar_MenuButton) => {
																									Sidebar_MenuButton($$anchor, { child, $$slots: { child: true } });
																								});
																							}

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
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_2);
						},
						$$slots: { default: true }
					});
				});

				var node_11 = $.sibling(node_1, 2);

				$.component(node_11, () => Sidebar.Inset, ($$anchor, Sidebar_Inset) => {
					Sidebar_Inset($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var header = root_2();
							var node_12 = $.child(header);

							$.component(node_12, () => Sidebar.Trigger, ($$anchor, Sidebar_Trigger) => {
								Sidebar_Trigger($$anchor, {});
							});

							$.reset(header);
							$.append($$anchor, header);
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