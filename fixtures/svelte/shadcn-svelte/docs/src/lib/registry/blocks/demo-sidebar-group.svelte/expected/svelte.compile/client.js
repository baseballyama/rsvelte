import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import LifeBuoyIcon from "@lucide/svelte/icons/life-buoy";
import SendIcon from "@lucide/svelte/icons/send";
import * as Sidebar from "$lib/registry/ui/sidebar/index.js";

var root = $.from_html(`<!> Support`, 1);
var root_1 = $.from_html(`<!> Feedback`, 1);
var root_2 = $.from_html(`<!> <!>`, 1);

export default function Demo_sidebar_group($$anchor) {
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

										$.component(node_3, () => Sidebar.Group, ($$anchor, Sidebar_Group) => {
											Sidebar_Group($$anchor, {
												children: ($$anchor, $$slotProps) => {
													var fragment_4 = root_2();
													var node_4 = $.first_child(fragment_4);

													$.component(node_4, () => Sidebar.GroupLabel, ($$anchor, Sidebar_GroupLabel) => {
														Sidebar_GroupLabel($$anchor, {
															children: ($$anchor, $$slotProps) => {
																$.next();

																var text = $.text('Help');

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
																			var fragment_6 = root_2();
																			var node_7 = $.first_child(fragment_6);

																			$.component(node_7, () => Sidebar.MenuItem, ($$anchor, Sidebar_MenuItem) => {
																				Sidebar_MenuItem($$anchor, {
																					children: ($$anchor, $$slotProps) => {
																						var fragment_7 = $.comment();
																						var node_8 = $.first_child(fragment_7);

																						$.component(node_8, () => Sidebar.MenuButton, ($$anchor, Sidebar_MenuButton) => {
																							Sidebar_MenuButton($$anchor, {
																								children: ($$anchor, $$slotProps) => {
																									var fragment_8 = root();
																									var node_9 = $.first_child(fragment_8);

																									LifeBuoyIcon(node_9, {});
																									$.next();
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

																			var node_10 = $.sibling(node_7, 2);

																			$.component(node_10, () => Sidebar.MenuItem, ($$anchor, Sidebar_MenuItem_1) => {
																				Sidebar_MenuItem_1($$anchor, {
																					children: ($$anchor, $$slotProps) => {
																						var fragment_9 = $.comment();
																						var node_11 = $.first_child(fragment_9);

																						$.component(node_11, () => Sidebar.MenuButton, ($$anchor, Sidebar_MenuButton_1) => {
																							Sidebar_MenuButton_1($$anchor, {
																								children: ($$anchor, $$slotProps) => {
																									var fragment_10 = root_1();
																									var node_12 = $.first_child(fragment_10);

																									SendIcon(node_12, {});
																									$.next();
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

				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		});
	});

	$.append($$anchor, fragment);
}