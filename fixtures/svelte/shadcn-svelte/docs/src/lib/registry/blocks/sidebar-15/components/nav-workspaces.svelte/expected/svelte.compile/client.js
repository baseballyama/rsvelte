import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import ChevronRightIcon from "@lucide/svelte/icons/chevron-right";
import EllipsisIcon from "@lucide/svelte/icons/ellipsis";
import PlusIcon from "@lucide/svelte/icons/plus";
import * as Collapsible from "$lib/registry/ui/collapsible/index.js";
import * as Sidebar from "$lib/registry/ui/sidebar/index.js";

var root = $.from_html(`<a><span> </span> <span> </span></a>`);
var root_1 = $.from_html(`<span> </span> <span> </span>`, 1);
var root_2 = $.from_html(`<!> <!> <!> <!>`, 1);
var root_3 = $.from_html(`<!> <span>More</span>`, 1);
var root_4 = $.from_html(`<!> <!>`, 1);

export default function Nav_workspaces($$anchor, $$props) {
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => Sidebar.Group, ($$anchor, Sidebar_Group) => {
		Sidebar_Group($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root_4();
				var node_1 = $.first_child(fragment_1);

				$.component(node_1, () => Sidebar.GroupLabel, ($$anchor, Sidebar_GroupLabel) => {
					Sidebar_GroupLabel($$anchor, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text = $.text('Workspaces');

							$.append($$anchor, text);
						},
						$$slots: { default: true }
					});
				});

				var node_2 = $.sibling(node_1, 2);

				$.component(node_2, () => Sidebar.GroupContent, ($$anchor, Sidebar_GroupContent) => {
					Sidebar_GroupContent($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_2 = $.comment();
							var node_3 = $.first_child(fragment_2);

							$.component(node_3, () => Sidebar.Menu, ($$anchor, Sidebar_Menu) => {
								Sidebar_Menu($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_3 = root_4();
										var node_4 = $.first_child(fragment_3);

										$.each(node_4, 17, () => $$props.workspaces, (workspace) => workspace.name, ($$anchor, workspace) => {
											var fragment_4 = $.comment();
											var node_5 = $.first_child(fragment_4);

											$.component(node_5, () => Collapsible.Root, ($$anchor, Collapsible_Root) => {
												Collapsible_Root($$anchor, {
													children: ($$anchor, $$slotProps) => {
														var fragment_5 = $.comment();
														var node_6 = $.first_child(fragment_5);

														$.component(node_6, () => Sidebar.MenuItem, ($$anchor, Sidebar_MenuItem) => {
															Sidebar_MenuItem($$anchor, {
																children: ($$anchor, $$slotProps) => {
																	var fragment_6 = root_2();
																	var node_7 = $.first_child(fragment_6);

																	{
																		const child = ($$anchor, $$arg0) => {
																			let props = () => ($$arg0?.()).props;
																			var a = root();

																			$.attribute_effect(a, () => ({ href: '##', ...props() }));

																			var span = $.child(a);
																			var text_1 = $.only_child(span, true);
																			var span_1 = $.sibling(span, 2);
																			var text_2 = $.only_child(span_1, true);

																			$.reset(a);

																			$.template_effect(() => {
																				$.set_text(text_1, $.get(workspace).emoji);
																				$.set_text(text_2, $.get(workspace).name);
																			});

																			$.append($$anchor, a);
																		};

																		$.component(node_7, () => Sidebar.MenuButton, ($$anchor, Sidebar_MenuButton) => {
																			Sidebar_MenuButton($$anchor, { child, $$slots: { child: true } });
																		});
																	}

																	var node_8 = $.sibling(node_7, 2);

																	{
																		const child = ($$anchor, $$arg0) => {
																			let props = () => ($$arg0?.()).props;
																			var fragment_7 = $.comment();
																			var node_9 = $.first_child(fragment_7);

																			$.component(node_9, () => Sidebar.MenuAction, ($$anchor, Sidebar_MenuAction) => {
																				Sidebar_MenuAction($$anchor, $.spread_props(props, {
																					class: 'start-2 bg-sidebar-accent text-sidebar-accent-foreground data-[state=open]:rotate-90',
																					showOnHover: true,
																					children: ($$anchor, $$slotProps) => {
																						ChevronRightIcon($$anchor, {});
																					},
																					$$slots: { default: true }
																				}));
																			});

																			$.append($$anchor, fragment_7);
																		};

																		$.component(node_8, () => Collapsible.Trigger, ($$anchor, Collapsible_Trigger) => {
																			Collapsible_Trigger($$anchor, { child, $$slots: { child: true } });
																		});
																	}

																	var node_10 = $.sibling(node_8, 2);

																	$.component(node_10, () => Sidebar.MenuAction, ($$anchor, Sidebar_MenuAction_1) => {
																		Sidebar_MenuAction_1($$anchor, {
																			showOnHover: true,
																			children: ($$anchor, $$slotProps) => {
																				PlusIcon($$anchor, {});
																			},
																			$$slots: { default: true }
																		});
																	});

																	var node_11 = $.sibling(node_10, 2);

																	$.component(node_11, () => Collapsible.Content, ($$anchor, Collapsible_Content) => {
																		Collapsible_Content($$anchor, {
																			children: ($$anchor, $$slotProps) => {
																				var fragment_10 = $.comment();
																				var node_12 = $.first_child(fragment_10);

																				$.component(node_12, () => Sidebar.MenuSub, ($$anchor, Sidebar_MenuSub) => {
																					Sidebar_MenuSub($$anchor, {
																						children: ($$anchor, $$slotProps) => {
																							var fragment_11 = $.comment();
																							var node_13 = $.first_child(fragment_11);

																							$.each(node_13, 17, () => $.get(workspace).pages, (page) => page.name, ($$anchor, page) => {
																								var fragment_12 = $.comment();
																								var node_14 = $.first_child(fragment_12);

																								$.component(node_14, () => Sidebar.MenuSubItem, ($$anchor, Sidebar_MenuSubItem) => {
																									Sidebar_MenuSubItem($$anchor, {
																										children: ($$anchor, $$slotProps) => {
																											var fragment_13 = $.comment();
																											var node_15 = $.first_child(fragment_13);

																											$.component(node_15, () => Sidebar.MenuSubButton, ($$anchor, Sidebar_MenuSubButton) => {
																												Sidebar_MenuSubButton($$anchor, {
																													href: '##',
																													children: ($$anchor, $$slotProps) => {
																														var fragment_14 = root_1();
																														var span_2 = $.first_child(fragment_14);
																														var text_3 = $.only_child(span_2, true);
																														var span_3 = $.sibling(span_2, 2);
																														var text_4 = $.only_child(span_3, true);

																														$.template_effect(() => {
																															$.set_text(text_3, $.get(page).emoji);
																															$.set_text(text_4, $.get(page).name);
																														});

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

																								$.append($$anchor, fragment_12);
																							});

																							$.append($$anchor, fragment_11);
																						},
																						$$slots: { default: true }
																					});
																				});

																				$.append($$anchor, fragment_10);
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
										});

										var node_16 = $.sibling(node_4, 2);

										$.component(node_16, () => Sidebar.MenuItem, ($$anchor, Sidebar_MenuItem_1) => {
											Sidebar_MenuItem_1($$anchor, {
												children: ($$anchor, $$slotProps) => {
													var fragment_15 = $.comment();
													var node_17 = $.first_child(fragment_15);

													$.component(node_17, () => Sidebar.MenuButton, ($$anchor, Sidebar_MenuButton_1) => {
														Sidebar_MenuButton_1($$anchor, {
															class: 'text-sidebar-foreground/70',
															children: ($$anchor, $$slotProps) => {
																var fragment_16 = root_3();
																var node_18 = $.first_child(fragment_16);

																EllipsisIcon(node_18, {});
																$.next(2);
																$.append($$anchor, fragment_16);
															},
															$$slots: { default: true }
														});
													});

													$.append($$anchor, fragment_15);
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