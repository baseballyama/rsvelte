import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import ChevronDownIcon from "@lucide/svelte/icons/chevron-down";
import LifeBuoyIcon from "@lucide/svelte/icons/life-buoy";
import SendIcon from "@lucide/svelte/icons/send";
import * as Collapsible from "$lib/registry/ui/collapsible/index.js";
import * as Sidebar from "$lib/registry/ui/sidebar/index.js";

var root = $.from_html(`Help <!>`, 1);
var root_1 = $.from_html(`<!> Support`, 1);
var root_2 = $.from_html(`<!> Feedback`, 1);
var root_3 = $.from_html(`<!> <!>`, 1);

export default function Demo_sidebar_group_collapsible($$anchor) {
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => Sidebar.Provider, ($$anchor, Sidebar_Provider) => {
		Sidebar_Provider($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = $.comment();
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

										$.component(node_3, () => Collapsible.Root, ($$anchor, Collapsible_Root) => {
											Collapsible_Root($$anchor, {
												open: true,
												class: 'group/collapsible',
												children: ($$anchor, $$slotProps) => {
													var fragment_4 = $.comment();
													var node_4 = $.first_child(fragment_4);

													$.component(node_4, () => Sidebar.Group, ($$anchor, Sidebar_Group) => {
														Sidebar_Group($$anchor, {
															children: ($$anchor, $$slotProps) => {
																var fragment_5 = root_3();
																var node_5 = $.first_child(fragment_5);

																{
																	const child = ($$anchor, $$arg0) => {
																		let props = () => ($$arg0?.()).props;
																		var fragment_6 = $.comment();
																		var node_6 = $.first_child(fragment_6);

																		$.component(node_6, () => Collapsible.Trigger, ($$anchor, Collapsible_Trigger) => {
																			Collapsible_Trigger($$anchor, $.spread_props(props, {
																				children: ($$anchor, $$slotProps) => {
																					$.next();

																					var fragment_7 = root();
																					var node_7 = $.sibling($.first_child(fragment_7));

																					ChevronDownIcon(node_7, {
																						class: 'ms-auto transition-transform group-data-[state=open]/collapsible:rotate-180'
																					});

																					$.append($$anchor, fragment_7);
																				},
																				$$slots: { default: true }
																			}));
																		});

																		$.append($$anchor, fragment_6);
																	};

																	$.component(node_5, () => Sidebar.GroupLabel, ($$anchor, Sidebar_GroupLabel) => {
																		Sidebar_GroupLabel($$anchor, {
																			class: 'text-sm hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
																			child,
																			$$slots: { child: true }
																		});
																	});
																}

																var node_8 = $.sibling(node_5, 2);

																$.component(node_8, () => Collapsible.Content, ($$anchor, Collapsible_Content) => {
																	Collapsible_Content($$anchor, {
																		children: ($$anchor, $$slotProps) => {
																			var fragment_8 = $.comment();
																			var node_9 = $.first_child(fragment_8);

																			$.component(node_9, () => Sidebar.GroupContent, ($$anchor, Sidebar_GroupContent) => {
																				Sidebar_GroupContent($$anchor, {
																					children: ($$anchor, $$slotProps) => {
																						var fragment_9 = $.comment();
																						var node_10 = $.first_child(fragment_9);

																						$.component(node_10, () => Sidebar.Menu, ($$anchor, Sidebar_Menu) => {
																							Sidebar_Menu($$anchor, {
																								children: ($$anchor, $$slotProps) => {
																									var fragment_10 = root_3();
																									var node_11 = $.first_child(fragment_10);

																									$.component(node_11, () => Sidebar.MenuItem, ($$anchor, Sidebar_MenuItem) => {
																										Sidebar_MenuItem($$anchor, {
																											children: ($$anchor, $$slotProps) => {
																												var fragment_11 = $.comment();
																												var node_12 = $.first_child(fragment_11);

																												$.component(node_12, () => Sidebar.MenuButton, ($$anchor, Sidebar_MenuButton) => {
																													Sidebar_MenuButton($$anchor, {
																														children: ($$anchor, $$slotProps) => {
																															var fragment_12 = root_1();
																															var node_13 = $.first_child(fragment_12);

																															LifeBuoyIcon(node_13, {});
																															$.next();
																															$.append($$anchor, fragment_12);
																														},
																														$$slots: { default: true }
																													});
																												});

																												$.append($$anchor, fragment_11);
																											},
																											$$slots: { default: true }
																										});
																									});

																									var node_14 = $.sibling(node_11, 2);

																									$.component(node_14, () => Sidebar.MenuItem, ($$anchor, Sidebar_MenuItem_1) => {
																										Sidebar_MenuItem_1($$anchor, {
																											children: ($$anchor, $$slotProps) => {
																												var fragment_13 = $.comment();
																												var node_15 = $.first_child(fragment_13);

																												$.component(node_15, () => Sidebar.MenuButton, ($$anchor, Sidebar_MenuButton_1) => {
																													Sidebar_MenuButton_1($$anchor, {
																														children: ($$anchor, $$slotProps) => {
																															var fragment_14 = root_2();
																															var node_16 = $.first_child(fragment_14);

																															SendIcon(node_16, {});
																															$.next();
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

																									$.append($$anchor, fragment_10);
																								},
																								$$slots: { default: true }
																							});
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

				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		});
	});

	$.append($$anchor, fragment);
}