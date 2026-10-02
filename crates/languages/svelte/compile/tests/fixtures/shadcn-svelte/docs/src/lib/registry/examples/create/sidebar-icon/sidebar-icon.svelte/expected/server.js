import * as $ from 'svelte/internal/server';
import * as Avatar from "$lib/registry/ui/avatar/index.js";
import * as Collapsible from "$lib/registry/ui/collapsible/index.js";
import * as DropdownMenu from "$lib/registry/ui/dropdown-menu/index.js";
import * as Item from "$lib/registry/ui/item/index.js";
import * as Sidebar from "$lib/registry/ui/sidebar/index.js";
import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
import { buttonVariants } from "$lib/registry/ui/button/button.svelte";
import { cn } from "$lib/utils.js";

function iconPlayground($$renderer) {
	IconPlaceholder($$renderer, {
		lucide: 'TerminalSquareIcon',
		tabler: 'IconTerminal2',
		hugeicons: 'ComputerTerminalIcon',
		phosphor: 'TerminalIcon',
		remixicon: 'RiTerminalBoxLine'
	});
}

function iconModels($$renderer) {
	IconPlaceholder($$renderer, {
		lucide: 'BotIcon',
		tabler: 'IconRobot',
		hugeicons: 'RoboticIcon',
		phosphor: 'RobotIcon',
		remixicon: 'RiRobotLine'
	});
}

function iconDocumentation($$renderer) {
	IconPlaceholder($$renderer, {
		lucide: 'BookOpen',
		tabler: 'IconBook',
		hugeicons: 'BookOpen02Icon',
		phosphor: 'BookOpenIcon',
		remixicon: 'RiBookOpenLine'
	});
}

function iconSettings($$renderer) {
	IconPlaceholder($$renderer, {
		lucide: 'Settings2Icon',
		tabler: 'IconSettings',
		hugeicons: 'Settings05Icon',
		phosphor: 'GearIcon',
		remixicon: 'RiSettingsLine'
	});
}

function iconDesignEngineering($$renderer) {
	IconPlaceholder($$renderer, {
		lucide: 'FrameIcon',
		tabler: 'IconFrame',
		hugeicons: 'CropIcon',
		phosphor: 'CropIcon',
		remixicon: 'RiCropLine'
	});
}

function iconSalesMarketing($$renderer) {
	IconPlaceholder($$renderer, {
		lucide: 'PieChartIcon',
		tabler: 'IconChartPie',
		hugeicons: 'PieChartIcon',
		phosphor: 'ChartPieIcon',
		remixicon: 'RiPieChartLine'
	});
}

function iconTravel($$renderer) {
	IconPlaceholder($$renderer, {
		lucide: 'MapIcon',
		tabler: 'IconMap',
		hugeicons: 'MapsIcon',
		phosphor: 'MapTrifoldIcon',
		remixicon: 'RiMapLine'
	});
}

export default function Sidebar_icon($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
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

		let activeTeam = data.teams[0];

		if (Sidebar.Provider) {
			$$renderer.push('<!--[-->');

			Sidebar.Provider($$renderer, {
				children: ($$renderer) => {
					if (Sidebar.Root) {
						$$renderer.push('<!--[-->');

						Sidebar.Root($$renderer, {
							collapsible: 'icon',
							class: 'absolute',
							children: ($$renderer) => {
								if (Sidebar.Header) {
									$$renderer.push('<!--[-->');

									Sidebar.Header($$renderer, {
										children: ($$renderer) => {
											if (Sidebar.Menu) {
												$$renderer.push('<!--[-->');

												Sidebar.Menu($$renderer, {
													children: ($$renderer) => {
														if (Sidebar.MenuItem) {
															$$renderer.push('<!--[-->');

															Sidebar.MenuItem($$renderer, {
																children: ($$renderer) => {
																	if (DropdownMenu.Root) {
																		$$renderer.push('<!--[-->');

																		DropdownMenu.Root($$renderer, {
																			children: ($$renderer) => {
																				{
																					function child($$renderer, { props }) {
																						if (Sidebar.MenuButton) {
																							$$renderer.push('<!--[-->');

																							Sidebar.MenuButton($$renderer, $.spread_props([
																								{
																									size: 'lg',
																									class: 'data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground'
																								},
																								props,
																								{
																									children: ($$renderer) => {
																										$$renderer.push(`<div${$.attr_class($.clsx(cn(buttonVariants({ size: "icon-sm" }), "size-8")))}><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256"><rect width="256" height="256" fill="none"></rect><line x1="208" y1="128" x2="128" y2="208" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="32"></line><line x1="192" y1="40" x2="40" y2="192" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="32"></line></svg></div> <div class="grid flex-1 text-left text-sm leading-tight"><span class="truncate font-medium">${$.escape(activeTeam.name)}</span> <span class="truncate text-xs">${$.escape(activeTeam.plan)}</span></div> `);

																										IconPlaceholder($$renderer, {
																											lucide: 'ChevronsUpDownIcon',
																											tabler: 'IconSelector',
																											hugeicons: 'UnfoldMoreIcon',
																											phosphor: 'CaretUpDownIcon',
																											remixicon: 'RiArrowUpDownLine'
																										});

																										$$renderer.push(`<!---->`);
																									},
																									$$slots: { default: true }
																								}
																							]));

																							$$renderer.push('<!--]-->');
																						} else {
																							$$renderer.push('<!--[!-->');
																							$$renderer.push('<!--]-->');
																						}
																					}

																					if (DropdownMenu.Trigger) {
																						$$renderer.push('<!--[-->');
																						DropdownMenu.Trigger($$renderer, { child, $$slots: { child: true } });
																						$$renderer.push('<!--]-->');
																					} else {
																						$$renderer.push('<!--[!-->');
																						$$renderer.push('<!--]-->');
																					}
																				}

																				$$renderer.push(` `);

																				if (DropdownMenu.Content) {
																					$$renderer.push('<!--[-->');

																					DropdownMenu.Content($$renderer, {
																						children: ($$renderer) => {
																							if (DropdownMenu.Group) {
																								$$renderer.push('<!--[-->');

																								DropdownMenu.Group($$renderer, {
																									children: ($$renderer) => {
																										if (DropdownMenu.Label) {
																											$$renderer.push('<!--[-->');

																											DropdownMenu.Label($$renderer, {
																												children: ($$renderer) => {
																													$$renderer.push(`<!---->Teams`);
																												},
																												$$slots: { default: true }
																											});

																											$$renderer.push('<!--]-->');
																										} else {
																											$$renderer.push('<!--[!-->');
																											$$renderer.push('<!--]-->');
																										}
																									},
																									$$slots: { default: true }
																								});

																								$$renderer.push('<!--]-->');
																							} else {
																								$$renderer.push('<!--[!-->');
																								$$renderer.push('<!--]-->');
																							}

																							$$renderer.push(` `);

																							if (DropdownMenu.Group) {
																								$$renderer.push('<!--[-->');

																								DropdownMenu.Group($$renderer, {
																									children: ($$renderer) => {
																										$$renderer.push(`<!--[-->`);

																										const each_array = $.ensure_array_like(data.teams);

																										for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
																											let team = each_array[$$index];

																											if (DropdownMenu.Item) {
																												$$renderer.push('<!--[-->');

																												DropdownMenu.Item($$renderer, {
																													onclick: () => activeTeam = team,
																													children: ($$renderer) => {
																														$$renderer.push(`<!---->${$.escape(team.name)}`);
																													},
																													$$slots: { default: true }
																												});

																												$$renderer.push('<!--]-->');
																											} else {
																												$$renderer.push('<!--[!-->');
																												$$renderer.push('<!--]-->');
																											}
																										}

																										$$renderer.push(`<!--]-->`);
																									},
																									$$slots: { default: true }
																								});

																								$$renderer.push('<!--]-->');
																							} else {
																								$$renderer.push('<!--[!-->');
																								$$renderer.push('<!--]-->');
																							}
																						},
																						$$slots: { default: true }
																					});

																					$$renderer.push('<!--]-->');
																				} else {
																					$$renderer.push('<!--[!-->');
																					$$renderer.push('<!--]-->');
																				}
																			},
																			$$slots: { default: true }
																		});

																		$$renderer.push('<!--]-->');
																	} else {
																		$$renderer.push('<!--[!-->');
																		$$renderer.push('<!--]-->');
																	}
																},
																$$slots: { default: true }
															});

															$$renderer.push('<!--]-->');
														} else {
															$$renderer.push('<!--[!-->');
															$$renderer.push('<!--]-->');
														}
													},
													$$slots: { default: true }
												});

												$$renderer.push('<!--]-->');
											} else {
												$$renderer.push('<!--[!-->');
												$$renderer.push('<!--]-->');
											}
										},
										$$slots: { default: true }
									});

									$$renderer.push('<!--]-->');
								} else {
									$$renderer.push('<!--[!-->');
									$$renderer.push('<!--]-->');
								}

								$$renderer.push(` `);

								if (Sidebar.Content) {
									$$renderer.push('<!--[-->');

									Sidebar.Content($$renderer, {
										children: ($$renderer) => {
											if (Sidebar.Group) {
												$$renderer.push('<!--[-->');

												Sidebar.Group($$renderer, {
													children: ($$renderer) => {
														if (Sidebar.GroupLabel) {
															$$renderer.push('<!--[-->');

															Sidebar.GroupLabel($$renderer, {
																children: ($$renderer) => {
																	$$renderer.push(`<!---->Platform`);
																},
																$$slots: { default: true }
															});

															$$renderer.push('<!--]-->');
														} else {
															$$renderer.push('<!--[!-->');
															$$renderer.push('<!--]-->');
														}

														$$renderer.push(` `);

														if (Sidebar.Menu) {
															$$renderer.push('<!--[-->');

															Sidebar.Menu($$renderer, {
																children: ($$renderer) => {
																	$$renderer.push(`<!--[-->`);

																	const each_array_1 = $.ensure_array_like(data.navMain);

																	for (let $$index_2 = 0, $$length = each_array_1.length; $$index_2 < $$length; $$index_2++) {
																		let item = each_array_1[$$index_2];

																		{
																			function child($$renderer, { props }) {
																				if (Sidebar.MenuItem) {
																					$$renderer.push('<!--[-->');

																					Sidebar.MenuItem($$renderer, $.spread_props([
																						props,
																						{
																							children: ($$renderer) => {
																								{
																									function child($$renderer, { props }) {
																										if (Sidebar.MenuButton) {
																											$$renderer.push('<!--[-->');

																											Sidebar.MenuButton($$renderer, $.spread_props([
																												{ tooltipContent: item.title },
																												props,
																												{
																													children: ($$renderer) => {
																														item.icon?.($$renderer);
																														$$renderer.push(`<!----> <span>${$.escape(item.title)}</span> `);

																														IconPlaceholder($$renderer, {
																															lucide: 'ChevronRightIcon',
																															tabler: 'IconChevronRight',
																															hugeicons: 'ArrowRight01Icon',
																															phosphor: 'CaretRightIcon',
																															remixicon: 'RiArrowRightSLine',
																															class: 'ml-auto transition-transform duration-100 group-data-[state=open]/collapsible:rotate-90'
																														});

																														$$renderer.push(`<!---->`);
																													},
																													$$slots: { default: true }
																												}
																											]));

																											$$renderer.push('<!--]-->');
																										} else {
																											$$renderer.push('<!--[!-->');
																											$$renderer.push('<!--]-->');
																										}
																									}

																									if (Collapsible.Trigger) {
																										$$renderer.push('<!--[-->');
																										Collapsible.Trigger($$renderer, { child, $$slots: { child: true } });
																										$$renderer.push('<!--]-->');
																									} else {
																										$$renderer.push('<!--[!-->');
																										$$renderer.push('<!--]-->');
																									}
																								}

																								$$renderer.push(` `);

																								if (Collapsible.Content) {
																									$$renderer.push('<!--[-->');

																									Collapsible.Content($$renderer, {
																										children: ($$renderer) => {
																											if (Sidebar.MenuSub) {
																												$$renderer.push('<!--[-->');

																												Sidebar.MenuSub($$renderer, {
																													children: ($$renderer) => {
																														$$renderer.push(`<!--[-->`);

																														const each_array_2 = $.ensure_array_like(item.items ?? []);

																														for (let $$index_1 = 0, $$length = each_array_2.length; $$index_1 < $$length; $$index_1++) {
																															let subItem = each_array_2[$$index_1];

																															if (Sidebar.MenuSubItem) {
																																$$renderer.push('<!--[-->');

																																Sidebar.MenuSubItem($$renderer, {
																																	children: ($$renderer) => {
																																		{
																																			function child($$renderer, { props }) {
																																				$$renderer.push(`<a${$.attributes({ href: subItem.url, ...props })}>${$.escape(subItem.title)}</a>`);
																																			}

																																			if (Sidebar.MenuSubButton) {
																																				$$renderer.push('<!--[-->');
																																				Sidebar.MenuSubButton($$renderer, { child, $$slots: { child: true } });
																																				$$renderer.push('<!--]-->');
																																			} else {
																																				$$renderer.push('<!--[!-->');
																																				$$renderer.push('<!--]-->');
																																			}
																																		}
																																	},
																																	$$slots: { default: true }
																																});

																																$$renderer.push('<!--]-->');
																															} else {
																																$$renderer.push('<!--[!-->');
																																$$renderer.push('<!--]-->');
																															}
																														}

																														$$renderer.push(`<!--]-->`);
																													},
																													$$slots: { default: true }
																												});

																												$$renderer.push('<!--]-->');
																											} else {
																												$$renderer.push('<!--[!-->');
																												$$renderer.push('<!--]-->');
																											}
																										},
																										$$slots: { default: true }
																									});

																									$$renderer.push('<!--]-->');
																								} else {
																									$$renderer.push('<!--[!-->');
																									$$renderer.push('<!--]-->');
																								}
																							},
																							$$slots: { default: true }
																						}
																					]));

																					$$renderer.push('<!--]-->');
																				} else {
																					$$renderer.push('<!--[!-->');
																					$$renderer.push('<!--]-->');
																				}
																			}

																			if (Collapsible.Root) {
																				$$renderer.push('<!--[-->');

																				Collapsible.Root($$renderer, {
																					open: item.isActive,
																					class: 'group/collapsible',
																					child,
																					$$slots: { child: true }
																				});

																				$$renderer.push('<!--]-->');
																			} else {
																				$$renderer.push('<!--[!-->');
																				$$renderer.push('<!--]-->');
																			}
																		}
																	}

																	$$renderer.push(`<!--]-->`);
																},
																$$slots: { default: true }
															});

															$$renderer.push('<!--]-->');
														} else {
															$$renderer.push('<!--[!-->');
															$$renderer.push('<!--]-->');
														}
													},
													$$slots: { default: true }
												});

												$$renderer.push('<!--]-->');
											} else {
												$$renderer.push('<!--[!-->');
												$$renderer.push('<!--]-->');
											}

											$$renderer.push(` `);

											if (Sidebar.Group) {
												$$renderer.push('<!--[-->');

												Sidebar.Group($$renderer, {
													class: 'group-data-[collapsible=icon]:hidden',
													children: ($$renderer) => {
														if (Sidebar.GroupLabel) {
															$$renderer.push('<!--[-->');

															Sidebar.GroupLabel($$renderer, {
																children: ($$renderer) => {
																	$$renderer.push(`<!---->Projects`);
																},
																$$slots: { default: true }
															});

															$$renderer.push('<!--]-->');
														} else {
															$$renderer.push('<!--[!-->');
															$$renderer.push('<!--]-->');
														}

														$$renderer.push(` `);

														if (Sidebar.Menu) {
															$$renderer.push('<!--[-->');

															Sidebar.Menu($$renderer, {
																children: ($$renderer) => {
																	$$renderer.push(`<!--[-->`);

																	const each_array_3 = $.ensure_array_like(data.projects);

																	for (let $$index_3 = 0, $$length = each_array_3.length; $$index_3 < $$length; $$index_3++) {
																		let item = each_array_3[$$index_3];

																		if (Sidebar.MenuItem) {
																			$$renderer.push('<!--[-->');

																			Sidebar.MenuItem($$renderer, {
																				children: ($$renderer) => {
																					{
																						function child($$renderer, { props }) {
																							$$renderer.push(`<a${$.attributes({ href: item.url, ...props })}>`);
																							item.icon?.($$renderer);
																							$$renderer.push(`<!----> ${$.escape(item.name)}</a>`);
																						}

																						if (Sidebar.MenuButton) {
																							$$renderer.push('<!--[-->');
																							Sidebar.MenuButton($$renderer, { child, $$slots: { child: true } });
																							$$renderer.push('<!--]-->');
																						} else {
																							$$renderer.push('<!--[!-->');
																							$$renderer.push('<!--]-->');
																						}
																					}
																				},
																				$$slots: { default: true }
																			});

																			$$renderer.push('<!--]-->');
																		} else {
																			$$renderer.push('<!--[!-->');
																			$$renderer.push('<!--]-->');
																		}
																	}

																	$$renderer.push(`<!--]-->`);
																},
																$$slots: { default: true }
															});

															$$renderer.push('<!--]-->');
														} else {
															$$renderer.push('<!--[!-->');
															$$renderer.push('<!--]-->');
														}
													},
													$$slots: { default: true }
												});

												$$renderer.push('<!--]-->');
											} else {
												$$renderer.push('<!--[!-->');
												$$renderer.push('<!--]-->');
											}
										},
										$$slots: { default: true }
									});

									$$renderer.push('<!--]-->');
								} else {
									$$renderer.push('<!--[!-->');
									$$renderer.push('<!--]-->');
								}

								$$renderer.push(` `);

								if (Sidebar.Footer) {
									$$renderer.push('<!--[-->');

									Sidebar.Footer($$renderer, {
										children: ($$renderer) => {
											if (Sidebar.Menu) {
												$$renderer.push('<!--[-->');

												Sidebar.Menu($$renderer, {
													children: ($$renderer) => {
														if (Sidebar.MenuItem) {
															$$renderer.push('<!--[-->');

															Sidebar.MenuItem($$renderer, {
																children: ($$renderer) => {
																	if (DropdownMenu.Root) {
																		$$renderer.push('<!--[-->');

																		DropdownMenu.Root($$renderer, {
																			children: ($$renderer) => {
																				{
																					function child($$renderer, { props }) {
																						if (Sidebar.MenuButton) {
																							$$renderer.push('<!--[-->');

																							Sidebar.MenuButton($$renderer, $.spread_props([
																								{
																									size: 'lg',
																									class: 'data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground'
																								},
																								props,
																								{
																									children: ($$renderer) => {
																										if (Avatar.Root) {
																											$$renderer.push('<!--[-->');

																											Avatar.Root($$renderer, {
																												children: ($$renderer) => {
																													if (Avatar.Image) {
																														$$renderer.push('<!--[-->');
																														Avatar.Image($$renderer, { src: data.user.avatar, alt: data.user.name });
																														$$renderer.push('<!--]-->');
																													} else {
																														$$renderer.push('<!--[!-->');
																														$$renderer.push('<!--]-->');
																													}

																													$$renderer.push(` `);

																													if (Avatar.Fallback) {
																														$$renderer.push('<!--[-->');

																														Avatar.Fallback($$renderer, {
																															class: 'rounded-lg',
																															children: ($$renderer) => {
																																$$renderer.push(`<!---->CN`);
																															},
																															$$slots: { default: true }
																														});

																														$$renderer.push('<!--]-->');
																													} else {
																														$$renderer.push('<!--[!-->');
																														$$renderer.push('<!--]-->');
																													}
																												},
																												$$slots: { default: true }
																											});

																											$$renderer.push('<!--]-->');
																										} else {
																											$$renderer.push('<!--[!-->');
																											$$renderer.push('<!--]-->');
																										}

																										$$renderer.push(` <div class="grid flex-1 text-left text-sm leading-tight"><span class="truncate font-medium">${$.escape(data.user.name)}</span> <span class="truncate text-xs">${$.escape(data.user.email)}</span></div> `);

																										IconPlaceholder($$renderer, {
																											lucide: 'ChevronsUpDownIcon',
																											tabler: 'IconSelector',
																											hugeicons: 'UnfoldMoreIcon',
																											phosphor: 'CaretUpDownIcon',
																											remixicon: 'RiArrowUpDownLine'
																										});

																										$$renderer.push(`<!---->`);
																									},
																									$$slots: { default: true }
																								}
																							]));

																							$$renderer.push('<!--]-->');
																						} else {
																							$$renderer.push('<!--[!-->');
																							$$renderer.push('<!--]-->');
																						}
																					}

																					if (DropdownMenu.Trigger) {
																						$$renderer.push('<!--[-->');
																						DropdownMenu.Trigger($$renderer, { child, $$slots: { child: true } });
																						$$renderer.push('<!--]-->');
																					} else {
																						$$renderer.push('<!--[!-->');
																						$$renderer.push('<!--]-->');
																					}
																				}

																				$$renderer.push(` `);

																				if (DropdownMenu.Content) {
																					$$renderer.push('<!--[-->');

																					DropdownMenu.Content($$renderer, {
																						children: ($$renderer) => {
																							if (DropdownMenu.Group) {
																								$$renderer.push('<!--[-->');

																								DropdownMenu.Group($$renderer, {
																									children: ($$renderer) => {
																										if (DropdownMenu.Label) {
																											$$renderer.push('<!--[-->');

																											DropdownMenu.Label($$renderer, {
																												children: ($$renderer) => {
																													if (Item.Root) {
																														$$renderer.push('<!--[-->');

																														Item.Root($$renderer, {
																															size: 'xs',
																															children: ($$renderer) => {
																																if (Item.Media) {
																																	$$renderer.push('<!--[-->');

																																	Item.Media($$renderer, {
																																		children: ($$renderer) => {
																																			if (Avatar.Root) {
																																				$$renderer.push('<!--[-->');

																																				Avatar.Root($$renderer, {
																																					children: ($$renderer) => {
																																						if (Avatar.Image) {
																																							$$renderer.push('<!--[-->');
																																							Avatar.Image($$renderer, { src: data.user.avatar, alt: data.user.name });
																																							$$renderer.push('<!--]-->');
																																						} else {
																																							$$renderer.push('<!--[!-->');
																																							$$renderer.push('<!--]-->');
																																						}

																																						$$renderer.push(` `);

																																						if (Avatar.Fallback) {
																																							$$renderer.push('<!--[-->');

																																							Avatar.Fallback($$renderer, {
																																								children: ($$renderer) => {
																																									$$renderer.push(`<!---->CN`);
																																								},
																																								$$slots: { default: true }
																																							});

																																							$$renderer.push('<!--]-->');
																																						} else {
																																							$$renderer.push('<!--[!-->');
																																							$$renderer.push('<!--]-->');
																																						}
																																					},
																																					$$slots: { default: true }
																																				});

																																				$$renderer.push('<!--]-->');
																																			} else {
																																				$$renderer.push('<!--[!-->');
																																				$$renderer.push('<!--]-->');
																																			}
																																		},
																																		$$slots: { default: true }
																																	});

																																	$$renderer.push('<!--]-->');
																																} else {
																																	$$renderer.push('<!--[!-->');
																																	$$renderer.push('<!--]-->');
																																}

																																$$renderer.push(` `);

																																if (Item.Content) {
																																	$$renderer.push('<!--[-->');

																																	Item.Content($$renderer, {
																																		children: ($$renderer) => {
																																			if (Item.Title) {
																																				$$renderer.push('<!--[-->');

																																				Item.Title($$renderer, {
																																					children: ($$renderer) => {
																																						$$renderer.push(`<!---->${$.escape(data.user.name)}`);
																																					},
																																					$$slots: { default: true }
																																				});

																																				$$renderer.push('<!--]-->');
																																			} else {
																																				$$renderer.push('<!--[!-->');
																																				$$renderer.push('<!--]-->');
																																			}

																																			$$renderer.push(` `);

																																			if (Item.Description) {
																																				$$renderer.push('<!--[-->');

																																				Item.Description($$renderer, {
																																					children: ($$renderer) => {
																																						$$renderer.push(`<!---->${$.escape(data.user.email)}`);
																																					},
																																					$$slots: { default: true }
																																				});

																																				$$renderer.push('<!--]-->');
																																			} else {
																																				$$renderer.push('<!--[!-->');
																																				$$renderer.push('<!--]-->');
																																			}
																																		},
																																		$$slots: { default: true }
																																	});

																																	$$renderer.push('<!--]-->');
																																} else {
																																	$$renderer.push('<!--[!-->');
																																	$$renderer.push('<!--]-->');
																																}
																															},
																															$$slots: { default: true }
																														});

																														$$renderer.push('<!--]-->');
																													} else {
																														$$renderer.push('<!--[!-->');
																														$$renderer.push('<!--]-->');
																													}
																												},
																												$$slots: { default: true }
																											});

																											$$renderer.push('<!--]-->');
																										} else {
																											$$renderer.push('<!--[!-->');
																											$$renderer.push('<!--]-->');
																										}
																									},
																									$$slots: { default: true }
																								});

																								$$renderer.push('<!--]-->');
																							} else {
																								$$renderer.push('<!--[!-->');
																								$$renderer.push('<!--]-->');
																							}

																							$$renderer.push(` `);

																							if (DropdownMenu.Separator) {
																								$$renderer.push('<!--[-->');
																								DropdownMenu.Separator($$renderer, {});
																								$$renderer.push('<!--]-->');
																							} else {
																								$$renderer.push('<!--[!-->');
																								$$renderer.push('<!--]-->');
																							}

																							$$renderer.push(` `);

																							if (DropdownMenu.Group) {
																								$$renderer.push('<!--[-->');

																								DropdownMenu.Group($$renderer, {
																									children: ($$renderer) => {
																										if (DropdownMenu.Item) {
																											$$renderer.push('<!--[-->');

																											DropdownMenu.Item($$renderer, {
																												children: ($$renderer) => {
																													$$renderer.push(`<!---->Account`);
																												},
																												$$slots: { default: true }
																											});

																											$$renderer.push('<!--]-->');
																										} else {
																											$$renderer.push('<!--[!-->');
																											$$renderer.push('<!--]-->');
																										}

																										$$renderer.push(` `);

																										if (DropdownMenu.Item) {
																											$$renderer.push('<!--[-->');

																											DropdownMenu.Item($$renderer, {
																												children: ($$renderer) => {
																													$$renderer.push(`<!---->Billing`);
																												},
																												$$slots: { default: true }
																											});

																											$$renderer.push('<!--]-->');
																										} else {
																											$$renderer.push('<!--[!-->');
																											$$renderer.push('<!--]-->');
																										}

																										$$renderer.push(` `);

																										if (DropdownMenu.Item) {
																											$$renderer.push('<!--[-->');

																											DropdownMenu.Item($$renderer, {
																												children: ($$renderer) => {
																													$$renderer.push(`<!---->Settings`);
																												},
																												$$slots: { default: true }
																											});

																											$$renderer.push('<!--]-->');
																										} else {
																											$$renderer.push('<!--[!-->');
																											$$renderer.push('<!--]-->');
																										}
																									},
																									$$slots: { default: true }
																								});

																								$$renderer.push('<!--]-->');
																							} else {
																								$$renderer.push('<!--[!-->');
																								$$renderer.push('<!--]-->');
																							}

																							$$renderer.push(` `);

																							if (DropdownMenu.Separator) {
																								$$renderer.push('<!--[-->');
																								DropdownMenu.Separator($$renderer, {});
																								$$renderer.push('<!--]-->');
																							} else {
																								$$renderer.push('<!--[!-->');
																								$$renderer.push('<!--]-->');
																							}

																							$$renderer.push(` `);

																							if (DropdownMenu.Group) {
																								$$renderer.push('<!--[-->');

																								DropdownMenu.Group($$renderer, {
																									children: ($$renderer) => {
																										if (DropdownMenu.Item) {
																											$$renderer.push('<!--[-->');

																											DropdownMenu.Item($$renderer, {
																												children: ($$renderer) => {
																													$$renderer.push(`<!---->Log out`);
																												},
																												$$slots: { default: true }
																											});

																											$$renderer.push('<!--]-->');
																										} else {
																											$$renderer.push('<!--[!-->');
																											$$renderer.push('<!--]-->');
																										}
																									},
																									$$slots: { default: true }
																								});

																								$$renderer.push('<!--]-->');
																							} else {
																								$$renderer.push('<!--[!-->');
																								$$renderer.push('<!--]-->');
																							}
																						},
																						$$slots: { default: true }
																					});

																					$$renderer.push('<!--]-->');
																				} else {
																					$$renderer.push('<!--[!-->');
																					$$renderer.push('<!--]-->');
																				}
																			},
																			$$slots: { default: true }
																		});

																		$$renderer.push('<!--]-->');
																	} else {
																		$$renderer.push('<!--[!-->');
																		$$renderer.push('<!--]-->');
																	}
																},
																$$slots: { default: true }
															});

															$$renderer.push('<!--]-->');
														} else {
															$$renderer.push('<!--[!-->');
															$$renderer.push('<!--]-->');
														}
													},
													$$slots: { default: true }
												});

												$$renderer.push('<!--]-->');
											} else {
												$$renderer.push('<!--[!-->');
												$$renderer.push('<!--]-->');
											}
										},
										$$slots: { default: true }
									});

									$$renderer.push('<!--]-->');
								} else {
									$$renderer.push('<!--[!-->');
									$$renderer.push('<!--]-->');
								}

								$$renderer.push(` `);

								if (Sidebar.Rail) {
									$$renderer.push('<!--[-->');
									Sidebar.Rail($$renderer, {});
									$$renderer.push('<!--]-->');
								} else {
									$$renderer.push('<!--[!-->');
									$$renderer.push('<!--]-->');
								}
							},
							$$slots: { default: true }
						});

						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}

					$$renderer.push(` `);

					if (Sidebar.Inset) {
						$$renderer.push('<!--[-->');

						Sidebar.Inset($$renderer, {
							children: ($$renderer) => {
								$$renderer.push(`<header class="flex h-16 shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12"><div class="flex items-center gap-2 px-4">`);

								if (Sidebar.Trigger) {
									$$renderer.push('<!--[-->');
									Sidebar.Trigger($$renderer, { class: '-ml-1' });
									$$renderer.push('<!--]-->');
								} else {
									$$renderer.push('<!--[!-->');
									$$renderer.push('<!--]-->');
								}

								$$renderer.push(`</div></header> <div class="flex flex-1 flex-col gap-4 p-4 pt-0"><div class="grid auto-rows-min gap-4 md:grid-cols-3"><div class="aspect-video rounded-xl bg-muted/50"></div> <div class="aspect-video rounded-xl bg-muted/50"></div> <div class="aspect-video rounded-xl bg-muted/50"></div></div> <div class="min-h-screen flex-1 rounded-xl bg-muted/50 md:min-h-min"></div></div>`);
							},
							$$slots: { default: true }
						});

						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}
				},
				$$slots: { default: true }
			});

			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}
	});
}