import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import ChartPieIcon from "@lucide/svelte/icons/chart-pie";
import EllipsisIcon from "@lucide/svelte/icons/ellipsis";
import FrameIcon from "@lucide/svelte/icons/frame";
import LifeBuoyIcon from "@lucide/svelte/icons/life-buoy";
import MapIcon from "@lucide/svelte/icons/map";
import SendIcon from "@lucide/svelte/icons/send";
import * as DropdownMenu from "$lib/registry/ui/dropdown-menu/index.js";
import * as Sidebar from "$lib/registry/ui/sidebar/index.js";

var root = $.from_html(`<a><!> <span> </span></a>`);
var root_1 = $.from_html(`<!> <span class="sr-only">More</span>`, 1);
var root_2 = $.from_html(`<span>Edit Project</span>`);
var root_3 = $.from_html(`<span>Delete Project</span>`);
var root_4 = $.from_html(`<!> <!>`, 1);

export default function Demo_sidebar_menu_action($$anchor) {
	const projects = [
		{ name: "Design Engineering", url: "#", icon: FrameIcon },
		{ name: "Sales & Marketing", url: "#", icon: ChartPieIcon },
		{ name: "Travel", url: "#", icon: MapIcon },
		{ name: "Support", url: "#", icon: LifeBuoyIcon },
		{ name: "Feedback", url: "#", icon: SendIcon }
	];

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
													var fragment_4 = root_4();
													var node_4 = $.first_child(fragment_4);

													$.component(node_4, () => Sidebar.GroupLabel, ($$anchor, Sidebar_GroupLabel) => {
														Sidebar_GroupLabel($$anchor, {
															children: ($$anchor, $$slotProps) => {
																$.next();

																var text = $.text('Projects');

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

																			$.each(node_7, 17, () => projects, (project) => project.name, ($$anchor, project) => {
																				var fragment_7 = $.comment();
																				var node_8 = $.first_child(fragment_7);

																				$.component(node_8, () => Sidebar.MenuItem, ($$anchor, Sidebar_MenuItem) => {
																					Sidebar_MenuItem($$anchor, {
																						children: ($$anchor, $$slotProps) => {
																							var fragment_8 = root_4();
																							var node_9 = $.first_child(fragment_8);

																							{
																								const child = ($$anchor, $$arg0) => {
																									let props = () => ($$arg0?.()).props;
																									var a = root();

																									$.attribute_effect(a, () => ({ href: $.get(project).url, ...props() }));

																									var node_10 = $.child(a);

																									$.component(node_10, () => $.get(project).icon, ($$anchor, project_icon) => {
																										project_icon($$anchor, {});
																									});

																									var span = $.sibling(node_10, 2);
																									var text_1 = $.only_child(span, true);

																									$.reset(a);
																									$.template_effect(() => $.set_text(text_1, $.get(project).name));
																									$.append($$anchor, a);
																								};

																								$.component(node_9, () => Sidebar.MenuButton, ($$anchor, Sidebar_MenuButton) => {
																									Sidebar_MenuButton($$anchor, {
																										class: 'group-has-[[data-state=open]]/menu-item:bg-sidebar-accent',
																										child,
																										$$slots: { child: true }
																									});
																								});
																							}

																							var node_11 = $.sibling(node_9, 2);

																							$.component(node_11, () => DropdownMenu.Root, ($$anchor, DropdownMenu_Root) => {
																								DropdownMenu_Root($$anchor, {
																									children: ($$anchor, $$slotProps) => {
																										var fragment_9 = root_4();
																										var node_12 = $.first_child(fragment_9);

																										{
																											const child = ($$anchor, $$arg0) => {
																												let props = () => ($$arg0?.()).props;
																												var fragment_10 = $.comment();
																												var node_13 = $.first_child(fragment_10);

																												$.component(node_13, () => Sidebar.MenuAction, ($$anchor, Sidebar_MenuAction) => {
																													Sidebar_MenuAction($$anchor, $.spread_props(props, {
																														children: ($$anchor, $$slotProps) => {
																															var fragment_11 = root_1();
																															var node_14 = $.first_child(fragment_11);

																															EllipsisIcon(node_14, {});
																															$.next(2);
																															$.append($$anchor, fragment_11);
																														},
																														$$slots: { default: true }
																													}));
																												});

																												$.append($$anchor, fragment_10);
																											};

																											$.component(node_12, () => DropdownMenu.Trigger, ($$anchor, DropdownMenu_Trigger) => {
																												DropdownMenu_Trigger($$anchor, { child, $$slots: { child: true } });
																											});
																										}

																										var node_15 = $.sibling(node_12, 2);

																										$.component(node_15, () => DropdownMenu.Content, ($$anchor, DropdownMenu_Content) => {
																											DropdownMenu_Content($$anchor, {
																												side: 'right',
																												align: 'start',
																												children: ($$anchor, $$slotProps) => {
																													var fragment_12 = root_4();
																													var node_16 = $.first_child(fragment_12);

																													$.component(node_16, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item) => {
																														DropdownMenu_Item($$anchor, {
																															children: ($$anchor, $$slotProps) => {
																																var span_1 = root_2();

																																$.append($$anchor, span_1);
																															},
																															$$slots: { default: true }
																														});
																													});

																													var node_17 = $.sibling(node_16, 2);

																													$.component(node_17, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item_1) => {
																														DropdownMenu_Item_1($$anchor, {
																															children: ($$anchor, $$slotProps) => {
																																var span_2 = root_3();

																																$.append($$anchor, span_2);
																															},
																															$$slots: { default: true }
																														});
																													});

																													$.append($$anchor, fragment_12);
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

				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		});
	});

	$.append($$anchor, fragment);
}