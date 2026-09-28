import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as Avatar from "$lib/registry/ui/avatar/index.js";
import * as Collapsible from "$lib/registry/ui/collapsible/index.js";
import * as DropdownMenu from "$lib/registry/ui/dropdown-menu/index.js";
import * as Item from "$lib/registry/ui/item/index.js";
import * as Sidebar from "$lib/registry/ui/sidebar/index.js";
import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
import { buttonVariants } from "$lib/registry/ui/button/button.svelte";
import { cn } from "$lib/utils.js";

const iconPlayground = ($$anchor) => {
	IconPlaceholder($$anchor, {
		lucide: 'TerminalSquareIcon',
		tabler: 'IconTerminal2',
		hugeicons: 'ComputerTerminalIcon',
		phosphor: 'TerminalIcon',
		remixicon: 'RiTerminalBoxLine'
	});
};

const iconModels = ($$anchor) => {
	IconPlaceholder($$anchor, {
		lucide: 'BotIcon',
		tabler: 'IconRobot',
		hugeicons: 'RoboticIcon',
		phosphor: 'RobotIcon',
		remixicon: 'RiRobotLine'
	});
};

const iconDocumentation = ($$anchor) => {
	IconPlaceholder($$anchor, {
		lucide: 'BookOpen',
		tabler: 'IconBook',
		hugeicons: 'BookOpen02Icon',
		phosphor: 'BookOpenIcon',
		remixicon: 'RiBookOpenLine'
	});
};

const iconSettings = ($$anchor) => {
	IconPlaceholder($$anchor, {
		lucide: 'Settings2Icon',
		tabler: 'IconSettings',
		hugeicons: 'Settings05Icon',
		phosphor: 'GearIcon',
		remixicon: 'RiSettingsLine'
	});
};

const iconDesignEngineering = ($$anchor) => {
	IconPlaceholder($$anchor, {
		lucide: 'FrameIcon',
		tabler: 'IconFrame',
		hugeicons: 'CropIcon',
		phosphor: 'CropIcon',
		remixicon: 'RiCropLine'
	});
};

const iconSalesMarketing = ($$anchor) => {
	IconPlaceholder($$anchor, {
		lucide: 'PieChartIcon',
		tabler: 'IconChartPie',
		hugeicons: 'PieChartIcon',
		phosphor: 'ChartPieIcon',
		remixicon: 'RiPieChartLine'
	});
};

const iconTravel = ($$anchor) => {
	IconPlaceholder($$anchor, {
		lucide: 'MapIcon',
		tabler: 'IconMap',
		hugeicons: 'MapsIcon',
		phosphor: 'MapTrifoldIcon',
		remixicon: 'RiMapLine'
	});
};

var root = $.from_html(`<div><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256"><rect width="256" height="256" fill="none"></rect><line x1="208" y1="128" x2="128" y2="208" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="32"></line><line x1="192" y1="40" x2="40" y2="192" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="32"></line></svg></div> <div class="grid flex-1 text-left text-sm leading-tight"><span class="truncate font-medium"> </span> <span class="truncate text-xs"> </span></div> <!>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);
var root_2 = $.from_html(`<!> <span> </span> <!>`, 1);
var root_3 = $.from_html(`<a> </a>`);
var root_4 = $.from_html(`<a><!> </a>`);
var root_5 = $.from_html(`<!> <div class="grid flex-1 text-left text-sm leading-tight"><span class="truncate font-medium"> </span> <span class="truncate text-xs"> </span></div> <!>`, 1);
var root_6 = $.from_html(`<!> <!> <!>`, 1);
var root_7 = $.from_html(`<!> <!> <!> <!> <!>`, 1);
var root_8 = $.from_html(`<!> <!> <!> <!>`, 1);
var root_9 = $.from_html(`<header class="flex h-16 shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12"><div class="flex items-center gap-2 px-4"><!></div></header> <div class="flex flex-1 flex-col gap-4 p-4 pt-0"><div class="grid auto-rows-min gap-4 md:grid-cols-3"><div class="aspect-video rounded-xl bg-muted/50"></div> <div class="aspect-video rounded-xl bg-muted/50"></div> <div class="aspect-video rounded-xl bg-muted/50"></div></div> <div class="min-h-screen flex-1 rounded-xl bg-muted/50 md:min-h-min"></div></div>`, 1);

export default function Sidebar_icon($$anchor, $$props) {
	$.push($$props, true);

	const data = {
		user: {
			name: "shadcn",
			email: "m@example.com",
			avatar: "/avatars/shadcn.jpg"
		},
		teams: [
			{ name: "Acme Inc", plan: "Enterprise" },
			{ name: "Acme Corp.", plan: "Startup" },
			{ name: "Evil Corp.", plan: "Free" }
		],
		navMain: [
			{
				title: "Playground",
				url: "#",
				icon: iconPlayground,
				isActive: true,
				items: [
					{ title: "History", url: "#" },
					{ title: "Starred", url: "#" },
					{ title: "Settings", url: "#" }
				]
			},

			{
				title: "Models",
				url: "#",
				icon: iconModels,
				items: [
					{ title: "Genesis", url: "#" },
					{ title: "Explorer", url: "#" },
					{ title: "Quantum", url: "#" }
				]
			},

			{
				title: "Documentation",
				url: "#",
				icon: iconDocumentation,
				items: [
					{ title: "Introduction", url: "#" },
					{ title: "Get Started", url: "#" },
					{ title: "Tutorials", url: "#" },
					{ title: "Changelog", url: "#" }
				]
			},

			{
				title: "Settings",
				url: "#",
				icon: iconSettings,
				items: [
					{ title: "General", url: "#" },
					{ title: "Team", url: "#" },
					{ title: "Billing", url: "#" },
					{ title: "Limits", url: "#" }
				]
			}
		],
		projects: [
			{
				name: "Design Engineering",
				url: "#",
				icon: iconDesignEngineering
			},

			{
				name: "Sales & Marketing",
				url: "#",
				icon: iconSalesMarketing
			},
			{ name: "Travel", url: "#", icon: iconTravel }
		]
	};

	let activeTeam = $.state($.proxy(data.teams[0]));
	var fragment_7 = $.comment();
	var node = $.first_child(fragment_7);

	$.component(node, () => Sidebar.Provider, ($$anchor, Sidebar_Provider) => {
		Sidebar_Provider($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var fragment_8 = root_1();
				var node_1 = $.first_child(fragment_8);

				$.component(node_1, () => Sidebar.Root, ($$anchor, Sidebar_Root) => {
					Sidebar_Root($$anchor, {
						collapsible: 'icon',
						class: 'absolute',
						children: ($$anchor, $$slotProps) => {
							var fragment_9 = root_8();
							var node_2 = $.first_child(fragment_9);

							$.component(node_2, () => Sidebar.Header, ($$anchor, Sidebar_Header) => {
								Sidebar_Header($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_10 = $.comment();
										var node_3 = $.first_child(fragment_10);

										$.component(node_3, () => Sidebar.Menu, ($$anchor, Sidebar_Menu) => {
											Sidebar_Menu($$anchor, {
												children: ($$anchor, $$slotProps) => {
													var fragment_11 = $.comment();
													var node_4 = $.first_child(fragment_11);

													$.component(node_4, () => Sidebar.MenuItem, ($$anchor, Sidebar_MenuItem) => {
														Sidebar_MenuItem($$anchor, {
															children: ($$anchor, $$slotProps) => {
																var fragment_12 = $.comment();
																var node_5 = $.first_child(fragment_12);

																$.component(node_5, () => DropdownMenu.Root, ($$anchor, DropdownMenu_Root) => {
																	DropdownMenu_Root($$anchor, {
																		children: ($$anchor, $$slotProps) => {
																			var fragment_13 = root_1();
																			var node_6 = $.first_child(fragment_13);

																			{
																				const child = ($$anchor, $$arg0) => {
																					let props = () => ($$arg0?.()).props;
																					var fragment_14 = $.comment();
																					var node_7 = $.first_child(fragment_14);

																					$.component(node_7, () => Sidebar.MenuButton, ($$anchor, Sidebar_MenuButton) => {
																						Sidebar_MenuButton($$anchor, $.spread_props(
																							{
																								size: 'lg',
																								class: 'data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground'
																							},
																							props,
																							{
																								children: ($$anchor, $$slotProps) => {
																									var fragment_15 = root();
																									var div = $.first_child(fragment_15);
																									var div_1 = $.sibling(div, 2);
																									var span = $.child(div_1);
																									var text = $.only_child(span, true);
																									var span_1 = $.sibling(span, 2);
																									var text_1 = $.only_child(span_1, true);

																									$.reset(div_1);

																									var node_8 = $.sibling(div_1, 2);

																									IconPlaceholder(node_8, {
																										lucide: 'ChevronsUpDownIcon',
																										tabler: 'IconSelector',
																										hugeicons: 'UnfoldMoreIcon',
																										phosphor: 'CaretUpDownIcon',
																										remixicon: 'RiArrowUpDownLine'
																									});

																									$.template_effect(
																										($0) => {
																											$.set_class(div, 1, $0);
																											$.set_text(text, $.get(activeTeam).name);
																											$.set_text(text_1, $.get(activeTeam).plan);
																										},
																										[
																											() => $.clsx(cn(buttonVariants({ size: "icon-sm" }), "size-8"))
																										]
																									);

																									$.append($$anchor, fragment_15);
																								},
																								$$slots: { default: true }
																							}
																						));
																					});

																					$.append($$anchor, fragment_14);
																				};

																				$.component(node_6, () => DropdownMenu.Trigger, ($$anchor, DropdownMenu_Trigger) => {
																					DropdownMenu_Trigger($$anchor, { child, $$slots: { child: true } });
																				});
																			}

																			var node_9 = $.sibling(node_6, 2);

																			$.component(node_9, () => DropdownMenu.Content, ($$anchor, DropdownMenu_Content) => {
																				DropdownMenu_Content($$anchor, {
																					children: ($$anchor, $$slotProps) => {
																						var fragment_16 = root_1();
																						var node_10 = $.first_child(fragment_16);

																						$.component(node_10, () => DropdownMenu.Group, ($$anchor, DropdownMenu_Group) => {
																							DropdownMenu_Group($$anchor, {
																								children: ($$anchor, $$slotProps) => {
																									var fragment_17 = $.comment();
																									var node_11 = $.first_child(fragment_17);

																									$.component(node_11, () => DropdownMenu.Label, ($$anchor, DropdownMenu_Label) => {
																										DropdownMenu_Label($$anchor, {
																											children: ($$anchor, $$slotProps) => {
																												$.next();

																												var text_2 = $.text('Teams');

																												$.append($$anchor, text_2);
																											},
																											$$slots: { default: true }
																										});
																									});

																									$.append($$anchor, fragment_17);
																								},
																								$$slots: { default: true }
																							});
																						});

																						var node_12 = $.sibling(node_10, 2);

																						$.component(node_12, () => DropdownMenu.Group, ($$anchor, DropdownMenu_Group_1) => {
																							DropdownMenu_Group_1($$anchor, {
																								children: ($$anchor, $$slotProps) => {
																									var fragment_18 = $.comment();
																									var node_13 = $.first_child(fragment_18);

																									$.each(node_13, 17, () => data.teams, (team) => team.name, ($$anchor, team) => {
																										var fragment_19 = $.comment();
																										var node_14 = $.first_child(fragment_19);

																										$.component(node_14, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item) => {
																											DropdownMenu_Item($$anchor, {
																												onclick: () => $.set(activeTeam, $.get(team), true),
																												children: ($$anchor, $$slotProps) => {
																													$.next();

																													var text_3 = $.text();

																													$.template_effect(() => $.set_text(text_3, $.get(team).name));
																													$.append($$anchor, text_3);
																												},
																												$$slots: { default: true }
																											});
																										});

																										$.append($$anchor, fragment_19);
																									});

																									$.append($$anchor, fragment_18);
																								},
																								$$slots: { default: true }
																							});
																						});

																						$.append($$anchor, fragment_16);
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

							var node_15 = $.sibling(node_2, 2);

							$.component(node_15, () => Sidebar.Content, ($$anchor, Sidebar_Content) => {
								Sidebar_Content($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_21 = root_1();
										var node_16 = $.first_child(fragment_21);

										$.component(node_16, () => Sidebar.Group, ($$anchor, Sidebar_Group) => {
											Sidebar_Group($$anchor, {
												children: ($$anchor, $$slotProps) => {
													var fragment_22 = root_1();
													var node_17 = $.first_child(fragment_22);

													$.component(node_17, () => Sidebar.GroupLabel, ($$anchor, Sidebar_GroupLabel) => {
														Sidebar_GroupLabel($$anchor, {
															children: ($$anchor, $$slotProps) => {
																$.next();

																var text_4 = $.text('Platform');

																$.append($$anchor, text_4);
															},
															$$slots: { default: true }
														});
													});

													var node_18 = $.sibling(node_17, 2);

													$.component(node_18, () => Sidebar.Menu, ($$anchor, Sidebar_Menu_1) => {
														Sidebar_Menu_1($$anchor, {
															children: ($$anchor, $$slotProps) => {
																var fragment_23 = $.comment();
																var node_19 = $.first_child(fragment_23);

																$.each(node_19, 17, () => data.navMain, (item) => item.title, ($$anchor, item) => {
																	var fragment_24 = $.comment();
																	var node_20 = $.first_child(fragment_24);

																	{
																		const child = ($$anchor, $$arg0) => {
																			let props = () => ($$arg0?.()).props;
																			var fragment_25 = $.comment();
																			var node_21 = $.first_child(fragment_25);

																			$.component(node_21, () => Sidebar.MenuItem, ($$anchor, Sidebar_MenuItem_1) => {
																				Sidebar_MenuItem_1($$anchor, $.spread_props(props, {
																					children: ($$anchor, $$slotProps) => {
																						var fragment_26 = root_1();
																						var node_22 = $.first_child(fragment_26);

																						{
																							const child = ($$anchor, $$arg0) => {
																								let props = () => ($$arg0?.()).props;
																								var fragment_27 = $.comment();
																								var node_23 = $.first_child(fragment_27);

																								$.component(node_23, () => Sidebar.MenuButton, ($$anchor, Sidebar_MenuButton_1) => {
																									Sidebar_MenuButton_1($$anchor, $.spread_props(
																										{
																											get tooltipContent() {
																												return $.get(item).title;
																											}
																										},
																										props,
																										{
																											children: ($$anchor, $$slotProps) => {
																												var fragment_28 = root_2();
																												var node_24 = $.first_child(fragment_28);

																												$.snippet(node_24, () => $.get(item).icon ?? $.noop);

																												var span_2 = $.sibling(node_24, 2);
																												var text_5 = $.only_child(span_2, true);
																												var node_25 = $.sibling(span_2, 2);

																												IconPlaceholder(node_25, {
																													lucide: 'ChevronRightIcon',
																													tabler: 'IconChevronRight',
																													hugeicons: 'ArrowRight01Icon',
																													phosphor: 'CaretRightIcon',
																													remixicon: 'RiArrowRightSLine',
																													class: 'ml-auto transition-transform duration-100 group-data-[state=open]/collapsible:rotate-90'
																												});

																												$.template_effect(() => $.set_text(text_5, $.get(item).title));
																												$.append($$anchor, fragment_28);
																											},
																											$$slots: { default: true }
																										}
																									));
																								});

																								$.append($$anchor, fragment_27);
																							};

																							$.component(node_22, () => Collapsible.Trigger, ($$anchor, Collapsible_Trigger) => {
																								Collapsible_Trigger($$anchor, { child, $$slots: { child: true } });
																							});
																						}

																						var node_26 = $.sibling(node_22, 2);

																						$.component(node_26, () => Collapsible.Content, ($$anchor, Collapsible_Content) => {
																							Collapsible_Content($$anchor, {
																								children: ($$anchor, $$slotProps) => {
																									var fragment_29 = $.comment();
																									var node_27 = $.first_child(fragment_29);

																									$.component(node_27, () => Sidebar.MenuSub, ($$anchor, Sidebar_MenuSub) => {
																										Sidebar_MenuSub($$anchor, {
																											children: ($$anchor, $$slotProps) => {
																												var fragment_30 = $.comment();
																												var node_28 = $.first_child(fragment_30);

																												$.each(node_28, 17, () => $.get(item).items ?? [], (subItem) => subItem.title, ($$anchor, subItem) => {
																													var fragment_31 = $.comment();
																													var node_29 = $.first_child(fragment_31);

																													$.component(node_29, () => Sidebar.MenuSubItem, ($$anchor, Sidebar_MenuSubItem) => {
																														Sidebar_MenuSubItem($$anchor, {
																															children: ($$anchor, $$slotProps) => {
																																var fragment_32 = $.comment();
																																var node_30 = $.first_child(fragment_32);

																																{
																																	const child = ($$anchor, $$arg0) => {
																																		let props = () => ($$arg0?.()).props;
																																		var a = root_3();

																																		$.attribute_effect(a, () => ({ href: $.get(subItem).url, ...props() }));

																																		var text_6 = $.only_child(a, true);

																																		$.template_effect(() => $.set_text(text_6, $.get(subItem).title));
																																		$.append($$anchor, a);
																																	};

																																	$.component(node_30, () => Sidebar.MenuSubButton, ($$anchor, Sidebar_MenuSubButton) => {
																																		Sidebar_MenuSubButton($$anchor, { child, $$slots: { child: true } });
																																	});
																																}

																																$.append($$anchor, fragment_32);
																															},
																															$$slots: { default: true }
																														});
																													});

																													$.append($$anchor, fragment_31);
																												});

																												$.append($$anchor, fragment_30);
																											},
																											$$slots: { default: true }
																										});
																									});

																									$.append($$anchor, fragment_29);
																								},
																								$$slots: { default: true }
																							});
																						});

																						$.append($$anchor, fragment_26);
																					},
																					$$slots: { default: true }
																				}));
																			});

																			$.append($$anchor, fragment_25);
																		};

																		$.component(node_20, () => Collapsible.Root, ($$anchor, Collapsible_Root) => {
																			Collapsible_Root($$anchor, {
																				get open() {
																					return $.get(item).isActive;
																				},
																				class: 'group/collapsible',
																				child,
																				$$slots: { child: true }
																			});
																		});
																	}

																	$.append($$anchor, fragment_24);
																});

																$.append($$anchor, fragment_23);
															},
															$$slots: { default: true }
														});
													});

													$.append($$anchor, fragment_22);
												},
												$$slots: { default: true }
											});
										});

										var node_31 = $.sibling(node_16, 2);

										$.component(node_31, () => Sidebar.Group, ($$anchor, Sidebar_Group_1) => {
											Sidebar_Group_1($$anchor, {
												class: 'group-data-[collapsible=icon]:hidden',
												children: ($$anchor, $$slotProps) => {
													var fragment_33 = root_1();
													var node_32 = $.first_child(fragment_33);

													$.component(node_32, () => Sidebar.GroupLabel, ($$anchor, Sidebar_GroupLabel_1) => {
														Sidebar_GroupLabel_1($$anchor, {
															children: ($$anchor, $$slotProps) => {
																$.next();

																var text_7 = $.text('Projects');

																$.append($$anchor, text_7);
															},
															$$slots: { default: true }
														});
													});

													var node_33 = $.sibling(node_32, 2);

													$.component(node_33, () => Sidebar.Menu, ($$anchor, Sidebar_Menu_2) => {
														Sidebar_Menu_2($$anchor, {
															children: ($$anchor, $$slotProps) => {
																var fragment_34 = $.comment();
																var node_34 = $.first_child(fragment_34);

																$.each(node_34, 17, () => data.projects, (item) => item.name, ($$anchor, item) => {
																	var fragment_35 = $.comment();
																	var node_35 = $.first_child(fragment_35);

																	$.component(node_35, () => Sidebar.MenuItem, ($$anchor, Sidebar_MenuItem_2) => {
																		Sidebar_MenuItem_2($$anchor, {
																			children: ($$anchor, $$slotProps) => {
																				var fragment_36 = $.comment();
																				var node_36 = $.first_child(fragment_36);

																				{
																					const child = ($$anchor, $$arg0) => {
																						let props = () => ($$arg0?.()).props;
																						var a_1 = root_4();

																						$.attribute_effect(a_1, () => ({ href: $.get(item).url, ...props() }));

																						var node_37 = $.child(a_1);

																						$.snippet(node_37, () => $.get(item).icon ?? $.noop);

																						var text_8 = $.sibling(node_37);

																						$.reset(a_1);
																						$.template_effect(() => $.set_text(text_8, ` ${$.get(item).name ?? ''}`));
																						$.append($$anchor, a_1);
																					};

																					$.component(node_36, () => Sidebar.MenuButton, ($$anchor, Sidebar_MenuButton_2) => {
																						Sidebar_MenuButton_2($$anchor, { child, $$slots: { child: true } });
																					});
																				}

																				$.append($$anchor, fragment_36);
																			},
																			$$slots: { default: true }
																		});
																	});

																	$.append($$anchor, fragment_35);
																});

																$.append($$anchor, fragment_34);
															},
															$$slots: { default: true }
														});
													});

													$.append($$anchor, fragment_33);
												},
												$$slots: { default: true }
											});
										});

										$.append($$anchor, fragment_21);
									},
									$$slots: { default: true }
								});
							});

							var node_38 = $.sibling(node_15, 2);

							$.component(node_38, () => Sidebar.Footer, ($$anchor, Sidebar_Footer) => {
								Sidebar_Footer($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_37 = $.comment();
										var node_39 = $.first_child(fragment_37);

										$.component(node_39, () => Sidebar.Menu, ($$anchor, Sidebar_Menu_3) => {
											Sidebar_Menu_3($$anchor, {
												children: ($$anchor, $$slotProps) => {
													var fragment_38 = $.comment();
													var node_40 = $.first_child(fragment_38);

													$.component(node_40, () => Sidebar.MenuItem, ($$anchor, Sidebar_MenuItem_3) => {
														Sidebar_MenuItem_3($$anchor, {
															children: ($$anchor, $$slotProps) => {
																var fragment_39 = $.comment();
																var node_41 = $.first_child(fragment_39);

																$.component(node_41, () => DropdownMenu.Root, ($$anchor, DropdownMenu_Root_1) => {
																	DropdownMenu_Root_1($$anchor, {
																		children: ($$anchor, $$slotProps) => {
																			var fragment_40 = root_1();
																			var node_42 = $.first_child(fragment_40);

																			{
																				const child = ($$anchor, $$arg0) => {
																					let props = () => ($$arg0?.()).props;
																					var fragment_41 = $.comment();
																					var node_43 = $.first_child(fragment_41);

																					$.component(node_43, () => Sidebar.MenuButton, ($$anchor, Sidebar_MenuButton_3) => {
																						Sidebar_MenuButton_3($$anchor, $.spread_props(
																							{
																								size: 'lg',
																								class: 'data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground'
																							},
																							props,
																							{
																								children: ($$anchor, $$slotProps) => {
																									var fragment_42 = root_5();
																									var node_44 = $.first_child(fragment_42);

																									$.component(node_44, () => Avatar.Root, ($$anchor, Avatar_Root) => {
																										Avatar_Root($$anchor, {
																											children: ($$anchor, $$slotProps) => {
																												var fragment_43 = root_1();
																												var node_45 = $.first_child(fragment_43);

																												$.component(node_45, () => Avatar.Image, ($$anchor, Avatar_Image) => {
																													Avatar_Image($$anchor, {
																														get src() {
																															return data.user.avatar;
																														},

																														get alt() {
																															return data.user.name;
																														}
																													});
																												});

																												var node_46 = $.sibling(node_45, 2);

																												$.component(node_46, () => Avatar.Fallback, ($$anchor, Avatar_Fallback) => {
																													Avatar_Fallback($$anchor, {
																														class: 'rounded-lg',
																														children: ($$anchor, $$slotProps) => {
																															$.next();

																															var text_9 = $.text('CN');

																															$.append($$anchor, text_9);
																														},
																														$$slots: { default: true }
																													});
																												});

																												$.append($$anchor, fragment_43);
																											},
																											$$slots: { default: true }
																										});
																									});

																									var div_2 = $.sibling(node_44, 2);
																									var span_3 = $.child(div_2);
																									var text_10 = $.only_child(span_3, true);
																									var span_4 = $.sibling(span_3, 2);
																									var text_11 = $.only_child(span_4, true);

																									$.reset(div_2);

																									var node_47 = $.sibling(div_2, 2);

																									IconPlaceholder(node_47, {
																										lucide: 'ChevronsUpDownIcon',
																										tabler: 'IconSelector',
																										hugeicons: 'UnfoldMoreIcon',
																										phosphor: 'CaretUpDownIcon',
																										remixicon: 'RiArrowUpDownLine'
																									});

																									$.template_effect(() => {
																										$.set_text(text_10, data.user.name);
																										$.set_text(text_11, data.user.email);
																									});

																									$.append($$anchor, fragment_42);
																								},
																								$$slots: { default: true }
																							}
																						));
																					});

																					$.append($$anchor, fragment_41);
																				};

																				$.component(node_42, () => DropdownMenu.Trigger, ($$anchor, DropdownMenu_Trigger_1) => {
																					DropdownMenu_Trigger_1($$anchor, { child, $$slots: { child: true } });
																				});
																			}

																			var node_48 = $.sibling(node_42, 2);

																			$.component(node_48, () => DropdownMenu.Content, ($$anchor, DropdownMenu_Content_1) => {
																				DropdownMenu_Content_1($$anchor, {
																					children: ($$anchor, $$slotProps) => {
																						var fragment_44 = root_7();
																						var node_49 = $.first_child(fragment_44);

																						$.component(node_49, () => DropdownMenu.Group, ($$anchor, DropdownMenu_Group_2) => {
																							DropdownMenu_Group_2($$anchor, {
																								children: ($$anchor, $$slotProps) => {
																									var fragment_45 = $.comment();
																									var node_50 = $.first_child(fragment_45);

																									$.component(node_50, () => DropdownMenu.Label, ($$anchor, DropdownMenu_Label_1) => {
																										DropdownMenu_Label_1($$anchor, {
																											children: ($$anchor, $$slotProps) => {
																												var fragment_46 = $.comment();
																												var node_51 = $.first_child(fragment_46);

																												$.component(node_51, () => Item.Root, ($$anchor, Item_Root) => {
																													Item_Root($$anchor, {
																														size: 'xs',
																														children: ($$anchor, $$slotProps) => {
																															var fragment_47 = root_1();
																															var node_52 = $.first_child(fragment_47);

																															$.component(node_52, () => Item.Media, ($$anchor, Item_Media) => {
																																Item_Media($$anchor, {
																																	children: ($$anchor, $$slotProps) => {
																																		var fragment_48 = $.comment();
																																		var node_53 = $.first_child(fragment_48);

																																		$.component(node_53, () => Avatar.Root, ($$anchor, Avatar_Root_1) => {
																																			Avatar_Root_1($$anchor, {
																																				children: ($$anchor, $$slotProps) => {
																																					var fragment_49 = root_1();
																																					var node_54 = $.first_child(fragment_49);

																																					$.component(node_54, () => Avatar.Image, ($$anchor, Avatar_Image_1) => {
																																						Avatar_Image_1($$anchor, {
																																							get src() {
																																								return data.user.avatar;
																																							},

																																							get alt() {
																																								return data.user.name;
																																							}
																																						});
																																					});

																																					var node_55 = $.sibling(node_54, 2);

																																					$.component(node_55, () => Avatar.Fallback, ($$anchor, Avatar_Fallback_1) => {
																																						Avatar_Fallback_1($$anchor, {
																																							children: ($$anchor, $$slotProps) => {
																																								$.next();

																																								var text_12 = $.text('CN');

																																								$.append($$anchor, text_12);
																																							},
																																							$$slots: { default: true }
																																						});
																																					});

																																					$.append($$anchor, fragment_49);
																																				},
																																				$$slots: { default: true }
																																			});
																																		});

																																		$.append($$anchor, fragment_48);
																																	},
																																	$$slots: { default: true }
																																});
																															});

																															var node_56 = $.sibling(node_52, 2);

																															$.component(node_56, () => Item.Content, ($$anchor, Item_Content) => {
																																Item_Content($$anchor, {
																																	children: ($$anchor, $$slotProps) => {
																																		var fragment_50 = root_1();
																																		var node_57 = $.first_child(fragment_50);

																																		$.component(node_57, () => Item.Title, ($$anchor, Item_Title) => {
																																			Item_Title($$anchor, {
																																				children: ($$anchor, $$slotProps) => {
																																					$.next();

																																					var text_13 = $.text();

																																					$.template_effect(() => $.set_text(text_13, data.user.name));
																																					$.append($$anchor, text_13);
																																				},
																																				$$slots: { default: true }
																																			});
																																		});

																																		var node_58 = $.sibling(node_57, 2);

																																		$.component(node_58, () => Item.Description, ($$anchor, Item_Description) => {
																																			Item_Description($$anchor, {
																																				children: ($$anchor, $$slotProps) => {
																																					$.next();

																																					var text_14 = $.text();

																																					$.template_effect(() => $.set_text(text_14, data.user.email));
																																					$.append($$anchor, text_14);
																																				},
																																				$$slots: { default: true }
																																			});
																																		});

																																		$.append($$anchor, fragment_50);
																																	},
																																	$$slots: { default: true }
																																});
																															});

																															$.append($$anchor, fragment_47);
																														},
																														$$slots: { default: true }
																													});
																												});

																												$.append($$anchor, fragment_46);
																											},
																											$$slots: { default: true }
																										});
																									});

																									$.append($$anchor, fragment_45);
																								},
																								$$slots: { default: true }
																							});
																						});

																						var node_59 = $.sibling(node_49, 2);

																						$.component(node_59, () => DropdownMenu.Separator, ($$anchor, DropdownMenu_Separator) => {
																							DropdownMenu_Separator($$anchor, {});
																						});

																						var node_60 = $.sibling(node_59, 2);

																						$.component(node_60, () => DropdownMenu.Group, ($$anchor, DropdownMenu_Group_3) => {
																							DropdownMenu_Group_3($$anchor, {
																								children: ($$anchor, $$slotProps) => {
																									var fragment_53 = root_6();
																									var node_61 = $.first_child(fragment_53);

																									$.component(node_61, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item_1) => {
																										DropdownMenu_Item_1($$anchor, {
																											children: ($$anchor, $$slotProps) => {
																												$.next();

																												var text_15 = $.text('Account');

																												$.append($$anchor, text_15);
																											},
																											$$slots: { default: true }
																										});
																									});

																									var node_62 = $.sibling(node_61, 2);

																									$.component(node_62, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item_2) => {
																										DropdownMenu_Item_2($$anchor, {
																											children: ($$anchor, $$slotProps) => {
																												$.next();

																												var text_16 = $.text('Billing');

																												$.append($$anchor, text_16);
																											},
																											$$slots: { default: true }
																										});
																									});

																									var node_63 = $.sibling(node_62, 2);

																									$.component(node_63, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item_3) => {
																										DropdownMenu_Item_3($$anchor, {
																											children: ($$anchor, $$slotProps) => {
																												$.next();

																												var text_17 = $.text('Settings');

																												$.append($$anchor, text_17);
																											},
																											$$slots: { default: true }
																										});
																									});

																									$.append($$anchor, fragment_53);
																								},
																								$$slots: { default: true }
																							});
																						});

																						var node_64 = $.sibling(node_60, 2);

																						$.component(node_64, () => DropdownMenu.Separator, ($$anchor, DropdownMenu_Separator_1) => {
																							DropdownMenu_Separator_1($$anchor, {});
																						});

																						var node_65 = $.sibling(node_64, 2);

																						$.component(node_65, () => DropdownMenu.Group, ($$anchor, DropdownMenu_Group_4) => {
																							DropdownMenu_Group_4($$anchor, {
																								children: ($$anchor, $$slotProps) => {
																									var fragment_54 = $.comment();
																									var node_66 = $.first_child(fragment_54);

																									$.component(node_66, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item_4) => {
																										DropdownMenu_Item_4($$anchor, {
																											children: ($$anchor, $$slotProps) => {
																												$.next();

																												var text_18 = $.text('Log out');

																												$.append($$anchor, text_18);
																											},
																											$$slots: { default: true }
																										});
																									});

																									$.append($$anchor, fragment_54);
																								},
																								$$slots: { default: true }
																							});
																						});

																						$.append($$anchor, fragment_44);
																					},
																					$$slots: { default: true }
																				});
																			});

																			$.append($$anchor, fragment_40);
																		},
																		$$slots: { default: true }
																	});
																});

																$.append($$anchor, fragment_39);
															},
															$$slots: { default: true }
														});
													});

													$.append($$anchor, fragment_38);
												},
												$$slots: { default: true }
											});
										});

										$.append($$anchor, fragment_37);
									},
									$$slots: { default: true }
								});
							});

							var node_67 = $.sibling(node_38, 2);

							$.component(node_67, () => Sidebar.Rail, ($$anchor, Sidebar_Rail) => {
								Sidebar_Rail($$anchor, {});
							});

							$.append($$anchor, fragment_9);
						},
						$$slots: { default: true }
					});
				});

				var node_68 = $.sibling(node_1, 2);

				$.component(node_68, () => Sidebar.Inset, ($$anchor, Sidebar_Inset) => {
					Sidebar_Inset($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_55 = root_9();
							var header = $.first_child(fragment_55);
							var div_3 = $.child(header);
							var node_69 = $.child(div_3);

							$.component(node_69, () => Sidebar.Trigger, ($$anchor, Sidebar_Trigger) => {
								Sidebar_Trigger($$anchor, { class: '-ml-1' });
							});

							$.reset(div_3);
							$.reset(header);
							$.next(2);
							$.append($$anchor, fragment_55);
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
	$.pop();
}