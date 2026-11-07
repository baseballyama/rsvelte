import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import ChevronDownIcon from "@lucide/svelte/icons/chevron-down";
import * as DropdownMenu from "$lib/registry/ui/dropdown-menu/index.js";
import * as Sidebar from "$lib/registry/ui/sidebar/index.js";

var root = $.from_html(`Select Workspace <!>`, 1);
var root_1 = $.from_html(`<span>Acme Inc</span>`);
var root_2 = $.from_html(`<span>Acme Corp.</span>`);
var root_3 = $.from_html(`<!> <!>`, 1);
var root_4 = $.from_html(`<header class="flex h-12 items-center justify-between px-4"><!></header>`);

export default function Demo_sidebar_header($$anchor) {
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => Sidebar.Provider, ($$anchor, Sidebar_Provider) => {
		Sidebar_Provider($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root_3();
				var node_1 = $.first_child(fragment_1);

				$.component(node_1, () => Sidebar.Root, ($$anchor, Sidebar_Root) => {
					Sidebar_Root($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_2 = $.comment();
							var node_2 = $.first_child(fragment_2);

							$.component(node_2, () => Sidebar.Header, ($$anchor, Sidebar_Header) => {
								Sidebar_Header($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_3 = $.comment();
										var node_3 = $.first_child(fragment_3);

										$.component(node_3, () => Sidebar.Menu, ($$anchor, Sidebar_Menu) => {
											Sidebar_Menu($$anchor, {
												children: ($$anchor, $$slotProps) => {
													var fragment_4 = $.comment();
													var node_4 = $.first_child(fragment_4);

													$.component(node_4, () => Sidebar.MenuItem, ($$anchor, Sidebar_MenuItem) => {
														Sidebar_MenuItem($$anchor, {
															children: ($$anchor, $$slotProps) => {
																var fragment_5 = $.comment();
																var node_5 = $.first_child(fragment_5);

																$.component(node_5, () => DropdownMenu.Root, ($$anchor, DropdownMenu_Root) => {
																	DropdownMenu_Root($$anchor, {
																		children: ($$anchor, $$slotProps) => {
																			var fragment_6 = root_3();
																			var node_6 = $.first_child(fragment_6);

																			{
																				const child = ($$anchor, $$arg0) => {
																					let props = () => ($$arg0?.()).props;
																					var fragment_7 = $.comment();
																					var node_7 = $.first_child(fragment_7);

																					$.component(node_7, () => Sidebar.MenuButton, ($$anchor, Sidebar_MenuButton) => {
																						Sidebar_MenuButton($$anchor, $.spread_props(props, {
																							class: 'data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground',
																							children: ($$anchor, $$slotProps) => {
																								$.next();

																								var fragment_8 = root();
																								var node_8 = $.sibling($.first_child(fragment_8));

																								ChevronDownIcon(node_8, { class: 'ms-auto' });
																								$.append($$anchor, fragment_8);
																							},
																							$$slots: { default: true }
																						}));
																					});

																					$.append($$anchor, fragment_7);
																				};

																				$.component(node_6, () => DropdownMenu.Trigger, ($$anchor, DropdownMenu_Trigger) => {
																					DropdownMenu_Trigger($$anchor, { child, $$slots: { child: true } });
																				});
																			}

																			var node_9 = $.sibling(node_6, 2);

																			$.component(node_9, () => DropdownMenu.Content, ($$anchor, DropdownMenu_Content) => {
																				DropdownMenu_Content($$anchor, {
																					class: 'w-(--bits-dropdown-menu-anchor-width)',
																					children: ($$anchor, $$slotProps) => {
																						var fragment_9 = root_3();
																						var node_10 = $.first_child(fragment_9);

																						$.component(node_10, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item) => {
																							DropdownMenu_Item($$anchor, {
																								children: ($$anchor, $$slotProps) => {
																									var span = root_1();

																									$.append($$anchor, span);
																								},
																								$$slots: { default: true }
																							});
																						});

																						var node_11 = $.sibling(node_10, 2);

																						$.component(node_11, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item_1) => {
																							DropdownMenu_Item_1($$anchor, {
																								children: ($$anchor, $$slotProps) => {
																									var span_1 = root_2();

																									$.append($$anchor, span_1);
																								},
																								$$slots: { default: true }
																							});
																						});

																						$.append($$anchor, fragment_9);
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

				var node_12 = $.sibling(node_1, 2);

				$.component(node_12, () => Sidebar.Inset, ($$anchor, Sidebar_Inset) => {
					Sidebar_Inset($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var header = root_4();
							var node_13 = $.child(header);

							$.component(node_13, () => Sidebar.Trigger, ($$anchor, Sidebar_Trigger) => {
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