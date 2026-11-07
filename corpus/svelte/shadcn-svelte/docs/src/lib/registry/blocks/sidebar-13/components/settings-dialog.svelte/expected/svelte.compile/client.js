import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import BellIcon from "@lucide/svelte/icons/bell";
import CheckIcon from "@lucide/svelte/icons/check";
import GlobeIcon from "@lucide/svelte/icons/globe";
import HouseIcon from "@lucide/svelte/icons/house";
import KeyboardIcon from "@lucide/svelte/icons/keyboard";
import LinkIcon from "@lucide/svelte/icons/link";
import LockIcon from "@lucide/svelte/icons/lock";
import MenuIcon from "@lucide/svelte/icons/menu";
import MessageCircleIcon from "@lucide/svelte/icons/message-circle";
import PaintbrushIcon from "@lucide/svelte/icons/paintbrush";
import SettingsIcon from "@lucide/svelte/icons/settings";
import VideoIcon from "@lucide/svelte/icons/video";
import * as Breadcrumb from "$lib/registry/ui/breadcrumb/index.js";
import * as Dialog from "$lib/registry/ui/dialog/index.js";
import * as Sidebar from "$lib/registry/ui/sidebar/index.js";
import { Button } from "$lib/registry/ui/button/index.js";

var root = $.from_html(`<a><!> <span> </span></a>`);
var root_1 = $.from_html(`<!> <!> <!>`, 1);
var root_2 = $.from_html(`<div class="aspect-video max-w-3xl rounded-xl bg-muted/50"></div>`);
var root_3 = $.from_html(`<!> <main class="flex h-[480px] flex-1 flex-col overflow-hidden"><header class="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12"><div class="flex items-center gap-2 px-4"><!></div></header> <div class="flex flex-1 flex-col gap-4 overflow-y-auto p-4 pt-0"></div></main>`, 1);
var root_4 = $.from_html(`<!> <!>`, 1);

export default function Settings_dialog($$anchor) {
	const data = {
		nav: [
			{ name: "Notifications", icon: BellIcon },
			{ name: "Navigation", icon: MenuIcon },
			{ name: "Home", icon: HouseIcon },
			{ name: "Appearance", icon: PaintbrushIcon },
			{ name: "Messages & media", icon: MessageCircleIcon },
			{ name: "Language & region", icon: GlobeIcon },
			{ name: "Accessibility", icon: KeyboardIcon },
			{ name: "Mark as read", icon: CheckIcon },
			{ name: "Audio & video", icon: VideoIcon },
			{ name: "Connected accounts", icon: LinkIcon },
			{ name: "Privacy & visibility", icon: LockIcon },
			{ name: "Advanced", icon: SettingsIcon }
		]
	};

	let open = $.state(true);
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => Dialog.Root, ($$anchor, Dialog_Root) => {
		Dialog_Root($$anchor, {
			get open() {
				return $.get(open);
			},

			set open($$value) {
				$.set(open, $$value, true);
			},

			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root_4();
				var node_1 = $.first_child(fragment_1);

				{
					const child = ($$anchor, $$arg0) => {
						let props = () => ($$arg0?.()).props;

						Button($$anchor, $.spread_props({ size: 'sm' }, props, {
							children: ($$anchor, $$slotProps) => {
								$.next();

								var text = $.text('Open Dialog');

								$.append($$anchor, text);
							},
							$$slots: { default: true }
						}));
					};

					$.component(node_1, () => Dialog.Trigger, ($$anchor, Dialog_Trigger) => {
						Dialog_Trigger($$anchor, { child, $$slots: { child: true } });
					});
				}

				var node_2 = $.sibling(node_1, 2);

				$.component(node_2, () => Dialog.Content, ($$anchor, Dialog_Content) => {
					Dialog_Content($$anchor, {
						class: 'overflow-hidden p-0 md:max-h-[500px] md:max-w-[700px] lg:max-w-[800px]',
						trapFocus: false,
						children: ($$anchor, $$slotProps) => {
							var fragment_3 = root_1();
							var node_3 = $.first_child(fragment_3);

							$.component(node_3, () => Dialog.Title, ($$anchor, Dialog_Title) => {
								Dialog_Title($$anchor, {
									class: 'sr-only',
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_1 = $.text('Settings');

										$.append($$anchor, text_1);
									},
									$$slots: { default: true }
								});
							});

							var node_4 = $.sibling(node_3, 2);

							$.component(node_4, () => Dialog.Description, ($$anchor, Dialog_Description) => {
								Dialog_Description($$anchor, {
									class: 'sr-only',
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_2 = $.text('Customize your settings here.');

										$.append($$anchor, text_2);
									},
									$$slots: { default: true }
								});
							});

							var node_5 = $.sibling(node_4, 2);

							$.component(node_5, () => Sidebar.Provider, ($$anchor, Sidebar_Provider) => {
								Sidebar_Provider($$anchor, {
									class: 'items-start',
									children: ($$anchor, $$slotProps) => {
										var fragment_4 = root_3();
										var node_6 = $.first_child(fragment_4);

										$.component(node_6, () => Sidebar.Root, ($$anchor, Sidebar_Root) => {
											Sidebar_Root($$anchor, {
												collapsible: 'none',
												class: 'hidden md:flex',
												children: ($$anchor, $$slotProps) => {
													var fragment_5 = $.comment();
													var node_7 = $.first_child(fragment_5);

													$.component(node_7, () => Sidebar.Content, ($$anchor, Sidebar_Content) => {
														Sidebar_Content($$anchor, {
															children: ($$anchor, $$slotProps) => {
																var fragment_6 = $.comment();
																var node_8 = $.first_child(fragment_6);

																$.component(node_8, () => Sidebar.Group, ($$anchor, Sidebar_Group) => {
																	Sidebar_Group($$anchor, {
																		children: ($$anchor, $$slotProps) => {
																			var fragment_7 = $.comment();
																			var node_9 = $.first_child(fragment_7);

																			$.component(node_9, () => Sidebar.GroupContent, ($$anchor, Sidebar_GroupContent) => {
																				Sidebar_GroupContent($$anchor, {
																					children: ($$anchor, $$slotProps) => {
																						var fragment_8 = $.comment();
																						var node_10 = $.first_child(fragment_8);

																						$.component(node_10, () => Sidebar.Menu, ($$anchor, Sidebar_Menu) => {
																							Sidebar_Menu($$anchor, {
																								children: ($$anchor, $$slotProps) => {
																									var fragment_9 = $.comment();
																									var node_11 = $.first_child(fragment_9);

																									$.each(node_11, 17, () => data.nav, (item) => item.name, ($$anchor, item) => {
																										var fragment_10 = $.comment();
																										var node_12 = $.first_child(fragment_10);

																										$.component(node_12, () => Sidebar.MenuItem, ($$anchor, Sidebar_MenuItem) => {
																											Sidebar_MenuItem($$anchor, {
																												children: ($$anchor, $$slotProps) => {
																													var fragment_11 = $.comment();
																													var node_13 = $.first_child(fragment_11);

																													{
																														const child = ($$anchor, $$arg0) => {
																															let props = () => ($$arg0?.()).props;
																															var a = root();

																															$.attribute_effect(a, () => ({ href: '##', ...props() }));

																															var node_14 = $.child(a);

																															$.component(node_14, () => $.get(item).icon, ($$anchor, item_icon) => {
																																item_icon($$anchor, {});
																															});

																															var span = $.sibling(node_14, 2);
																															var text_3 = $.only_child(span, true);

																															$.reset(a);
																															$.template_effect(() => $.set_text(text_3, $.get(item).name));
																															$.append($$anchor, a);
																														};

																														let $0 = $.derived(() => $.get(item).name === "Messages & media");

																														$.component(node_13, () => Sidebar.MenuButton, ($$anchor, Sidebar_MenuButton) => {
																															Sidebar_MenuButton($$anchor, {
																																get isActive() {
																																	return $.get($0);
																																},
																																child,
																																$$slots: { child: true }
																															});
																														});
																													}

																													$.append($$anchor, fragment_11);
																												},
																												$$slots: { default: true }
																											});
																										});

																										$.append($$anchor, fragment_10);
																									});

																									$.append($$anchor, fragment_9);
																								},
																								$$slots: { default: true }
																							});
																						});

																						$.append($$anchor, fragment_8);
																					},
																					$$slots: { default: true }
																				});
																			});

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

													$.append($$anchor, fragment_5);
												},
												$$slots: { default: true }
											});
										});

										var main = $.sibling(node_6, 2);
										var header = $.child(main);
										var div = $.child(header);
										var node_15 = $.child(div);

										$.component(node_15, () => Breadcrumb.Root, ($$anchor, Breadcrumb_Root) => {
											Breadcrumb_Root($$anchor, {
												children: ($$anchor, $$slotProps) => {
													var fragment_12 = $.comment();
													var node_16 = $.first_child(fragment_12);

													$.component(node_16, () => Breadcrumb.List, ($$anchor, Breadcrumb_List) => {
														Breadcrumb_List($$anchor, {
															children: ($$anchor, $$slotProps) => {
																var fragment_13 = root_1();
																var node_17 = $.first_child(fragment_13);

																$.component(node_17, () => Breadcrumb.Item, ($$anchor, Breadcrumb_Item) => {
																	Breadcrumb_Item($$anchor, {
																		class: 'hidden md:block',
																		children: ($$anchor, $$slotProps) => {
																			var fragment_14 = $.comment();
																			var node_18 = $.first_child(fragment_14);

																			$.component(node_18, () => Breadcrumb.Link, ($$anchor, Breadcrumb_Link) => {
																				Breadcrumb_Link($$anchor, {
																					href: '##',
																					children: ($$anchor, $$slotProps) => {
																						$.next();

																						var text_4 = $.text('Settings');

																						$.append($$anchor, text_4);
																					},
																					$$slots: { default: true }
																				});
																			});

																			$.append($$anchor, fragment_14);
																		},
																		$$slots: { default: true }
																	});
																});

																var node_19 = $.sibling(node_17, 2);

																$.component(node_19, () => Breadcrumb.Separator, ($$anchor, Breadcrumb_Separator) => {
																	Breadcrumb_Separator($$anchor, { class: 'hidden md:block' });
																});

																var node_20 = $.sibling(node_19, 2);

																$.component(node_20, () => Breadcrumb.Item, ($$anchor, Breadcrumb_Item_1) => {
																	Breadcrumb_Item_1($$anchor, {
																		children: ($$anchor, $$slotProps) => {
																			var fragment_15 = $.comment();
																			var node_21 = $.first_child(fragment_15);

																			$.component(node_21, () => Breadcrumb.Page, ($$anchor, Breadcrumb_Page) => {
																				Breadcrumb_Page($$anchor, {
																					children: ($$anchor, $$slotProps) => {
																						$.next();

																						var text_5 = $.text('Messages & media');

																						$.append($$anchor, text_5);
																					},
																					$$slots: { default: true }
																				});
																			});

																			$.append($$anchor, fragment_15);
																		},
																		$$slots: { default: true }
																	});
																});

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

										$.reset(div);
										$.reset(header);

										var div_1 = $.sibling(header, 2);

										$.each(div_1, 20, () => Array.from({ length: 10 }), $.index, ($$anchor, _) => {
											var div_2 = root_2();

											$.append($$anchor, div_2);
										});

										$.reset(div_1);
										$.reset(main);
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

				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		});
	});

	$.append($$anchor, fragment);
}