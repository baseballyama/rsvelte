import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import ChartPieIcon from "@lucide/svelte/icons/chart-pie";
import FrameIcon from "@lucide/svelte/icons/frame";
import MapIcon from "@lucide/svelte/icons/map";
import PlusIcon from "@lucide/svelte/icons/plus";
import { toast } from "svelte-sonner";
import * as Sidebar from "$lib/registry/ui/sidebar/index.js";
import { Toaster } from "$lib/registry/ui/sonner/index.js";

var root = $.from_html(`<!> <span class="sr-only">Add Project</span>`, 1);
var root_1 = $.from_html(`<a><!> <span>Design Engineering</span></a>`);
var root_2 = $.from_html(`<a><!> <span>Sales & Marketing</span></a>`);
var root_3 = $.from_html(`<a><!> <span>Travel</span></a>`);
var root_4 = $.from_html(`<!> <!> <!>`, 1);
var root_5 = $.from_html(`<!> <!>`, 1);

export default function Demo_sidebar_group_action($$anchor, $$props) {
	$.push($$props, true);

	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => Sidebar.Provider, ($$anchor, Sidebar_Provider) => {
		Sidebar_Provider($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root_5();
				var node_1 = $.first_child(fragment_1);

				Toaster(node_1, {
					position: 'bottom-left',
					toastOptions: { class: "ms-[160px]" }
				});

				var node_2 = $.sibling(node_1, 2);

				$.component(node_2, () => Sidebar.Root, ($$anchor, Sidebar_Root) => {
					Sidebar_Root($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_2 = $.comment();
							var node_3 = $.first_child(fragment_2);

							$.component(node_3, () => Sidebar.Content, ($$anchor, Sidebar_Content) => {
								Sidebar_Content($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_3 = $.comment();
										var node_4 = $.first_child(fragment_3);

										$.component(node_4, () => Sidebar.Group, ($$anchor, Sidebar_Group) => {
											Sidebar_Group($$anchor, {
												children: ($$anchor, $$slotProps) => {
													var fragment_4 = root_4();
													var node_5 = $.first_child(fragment_4);

													$.component(node_5, () => Sidebar.GroupLabel, ($$anchor, Sidebar_GroupLabel) => {
														Sidebar_GroupLabel($$anchor, {
															children: ($$anchor, $$slotProps) => {
																$.next();

																var text = $.text('Projects');

																$.append($$anchor, text);
															},
															$$slots: { default: true }
														});
													});

													var node_6 = $.sibling(node_5, 2);

													$.component(node_6, () => Sidebar.GroupAction, ($$anchor, Sidebar_GroupAction) => {
														Sidebar_GroupAction($$anchor, {
															title: 'Add Project',
															onclick: () => toast("You clicked the group action!"),
															children: ($$anchor, $$slotProps) => {
																var fragment_5 = root();
																var node_7 = $.first_child(fragment_5);

																PlusIcon(node_7, {});
																$.next(2);
																$.append($$anchor, fragment_5);
															},
															$$slots: { default: true }
														});
													});

													var node_8 = $.sibling(node_6, 2);

													$.component(node_8, () => Sidebar.GroupContent, ($$anchor, Sidebar_GroupContent) => {
														Sidebar_GroupContent($$anchor, {
															children: ($$anchor, $$slotProps) => {
																var fragment_6 = $.comment();
																var node_9 = $.first_child(fragment_6);

																$.component(node_9, () => Sidebar.Menu, ($$anchor, Sidebar_Menu) => {
																	Sidebar_Menu($$anchor, {
																		children: ($$anchor, $$slotProps) => {
																			var fragment_7 = root_4();
																			var node_10 = $.first_child(fragment_7);

																			$.component(node_10, () => Sidebar.MenuItem, ($$anchor, Sidebar_MenuItem) => {
																				Sidebar_MenuItem($$anchor, {
																					children: ($$anchor, $$slotProps) => {
																						var fragment_8 = $.comment();
																						var node_11 = $.first_child(fragment_8);

																						{
																							const child = ($$anchor, $$arg0) => {
																								let props = () => ($$arg0?.()).props;
																								var a = root_1();

																								$.attribute_effect(a, () => ({ href: '##', ...props() }));

																								var node_12 = $.child(a);

																								FrameIcon(node_12, {});
																								$.next(2);
																								$.reset(a);
																								$.append($$anchor, a);
																							};

																							$.component(node_11, () => Sidebar.MenuButton, ($$anchor, Sidebar_MenuButton) => {
																								Sidebar_MenuButton($$anchor, { child, $$slots: { child: true } });
																							});
																						}

																						$.append($$anchor, fragment_8);
																					},
																					$$slots: { default: true }
																				});
																			});

																			var node_13 = $.sibling(node_10, 2);

																			$.component(node_13, () => Sidebar.MenuItem, ($$anchor, Sidebar_MenuItem_1) => {
																				Sidebar_MenuItem_1($$anchor, {
																					children: ($$anchor, $$slotProps) => {
																						var fragment_9 = $.comment();
																						var node_14 = $.first_child(fragment_9);

																						{
																							const child = ($$anchor, $$arg0) => {
																								let props = () => ($$arg0?.()).props;
																								var a_1 = root_2();

																								$.attribute_effect(a_1, () => ({ href: '##', ...props() }));

																								var node_15 = $.child(a_1);

																								ChartPieIcon(node_15, {});
																								$.next(2);
																								$.reset(a_1);
																								$.append($$anchor, a_1);
																							};

																							$.component(node_14, () => Sidebar.MenuButton, ($$anchor, Sidebar_MenuButton_1) => {
																								Sidebar_MenuButton_1($$anchor, { child, $$slots: { child: true } });
																							});
																						}

																						$.append($$anchor, fragment_9);
																					},
																					$$slots: { default: true }
																				});
																			});

																			var node_16 = $.sibling(node_13, 2);

																			$.component(node_16, () => Sidebar.MenuItem, ($$anchor, Sidebar_MenuItem_2) => {
																				Sidebar_MenuItem_2($$anchor, {
																					children: ($$anchor, $$slotProps) => {
																						var fragment_10 = $.comment();
																						var node_17 = $.first_child(fragment_10);

																						{
																							const child = ($$anchor, $$arg0) => {
																								let props = () => ($$arg0?.()).props;
																								var a_2 = root_3();

																								$.attribute_effect(a_2, () => ({ href: '##', ...props() }));

																								var node_18 = $.child(a_2);

																								MapIcon(node_18, {});
																								$.next(2);
																								$.reset(a_2);
																								$.append($$anchor, a_2);
																							};

																							$.component(node_17, () => Sidebar.MenuButton, ($$anchor, Sidebar_MenuButton_2) => {
																								Sidebar_MenuButton_2($$anchor, { child, $$slots: { child: true } });
																							});
																						}

																						$.append($$anchor, fragment_10);
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
	$.pop();
}