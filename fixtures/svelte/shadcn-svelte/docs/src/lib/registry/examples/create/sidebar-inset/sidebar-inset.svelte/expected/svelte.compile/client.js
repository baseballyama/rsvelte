import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as Collapsible from "$lib/registry/ui/collapsible/index.js";
import * as Sidebar from "$lib/registry/ui/sidebar/index.js";
import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";

var root = $.from_html(`<a><!> <span> </span></a>`);
var root_1 = $.from_html(`<!> <span class="sr-only">Toggle</span>`, 1);
var root_2 = $.from_html(`<a> </a>`);
var root_3 = $.from_html(`<!> <!>`, 1);
var root_4 = $.from_html(`<header class="flex h-16 shrink-0 items-center gap-2 border-b px-4"><!></header> <div class="flex flex-1 flex-col gap-4 p-4"><div class="grid auto-rows-min gap-4 md:grid-cols-3"><div class="aspect-video rounded-xl bg-muted/50"></div> <div class="aspect-video rounded-xl bg-muted/50"></div> <div class="aspect-video rounded-xl bg-muted/50"></div></div> <div class="min-h-screen flex-1 rounded-xl bg-muted/50 md:min-h-min"></div></div>`, 1);

export default function Sidebar_inset($$anchor) {
	/* eslint-disable @typescript-eslint/no-explicit-any */
	const data = {
		navMain: [
			{
				title: "Dashboard",
				url: "#",
				lucide: "HomeIcon",
				tabler: "IconHome",
				hugeicons: "Home01Icon",
				phosphor: "HouseIcon",
				remixicon: "RiHomeLine",
				isActive: true,
				items: [
					{ title: "Overview", url: "#" },
					{ title: "Analytics", url: "#" }
				]
			},

			{
				title: "Analytics",
				url: "#",
				lucide: "ChartLineIcon",
				tabler: "IconChartLine",
				hugeicons: "ChartIcon",
				phosphor: "ChartLineIcon",
				remixicon: "RiLineChartLine",
				items: [
					{ title: "Reports", url: "#" },
					{ title: "Metrics", url: "#" }
				]
			},

			{
				title: "Orders",
				url: "#",
				lucide: "ShoppingBagIcon",
				tabler: "IconShoppingBag",
				hugeicons: "ShoppingBag01Icon",
				phosphor: "BagIcon",
				remixicon: "RiShoppingBagLine",
				items: [
					{ title: "All Orders", url: "#" },
					{ title: "Pending", url: "#" },
					{ title: "Completed", url: "#" }
				]
			},

			{
				title: "Products",
				url: "#",
				lucide: "ShoppingCartIcon",
				tabler: "IconShoppingCart",
				hugeicons: "ShoppingCart01Icon",
				phosphor: "ShoppingCartIcon",
				remixicon: "RiShoppingCartLine",
				items: [
					{ title: "All Products", url: "#" },
					{ title: "Categories", url: "#" }
				]
			},

			{
				title: "Invoices",
				url: "#",
				lucide: "FileIcon",
				tabler: "IconFile",
				hugeicons: "File01Icon",
				phosphor: "FileIcon",
				remixicon: "RiFileLine"
			},

			{
				title: "Customers",
				url: "#",
				lucide: "UserIcon",
				tabler: "IconUser",
				hugeicons: "UserIcon",
				phosphor: "UserIcon",
				remixicon: "RiUserLine"
			},

			{
				title: "Settings",
				url: "#",
				lucide: "Settings2Icon",
				tabler: "IconSettings",
				hugeicons: "Settings05Icon",
				phosphor: "GearIcon",
				remixicon: "RiSettingsLine"
			}
		],
		navSecondary: [
			{
				title: "Support",
				url: "#",
				lucide: "LifeBuoy",
				tabler: "IconLifebuoy",
				hugeicons: "ChartRingIcon",
				phosphor: "LifebuoyIcon",
				remixicon: "RiLifebuoyLine"
			},

			{
				title: "Feedback",
				url: "#",
				lucide: "Send",
				tabler: "IconSend",
				hugeicons: "SentIcon",
				phosphor: "PaperPlaneTiltIcon",
				remixicon: "RiSendPlaneLine"
			}
		]
	};

	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => Sidebar.Provider, ($$anchor, Sidebar_Provider) => {
		Sidebar_Provider($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root_3();
				var node_1 = $.first_child(fragment_1);

				$.component(node_1, () => Sidebar.Root, ($$anchor, Sidebar_Root) => {
					Sidebar_Root($$anchor, {
						variant: 'inset',
						class: 'absolute',
						children: ($$anchor, $$slotProps) => {
							var fragment_2 = root_3();
							var node_2 = $.first_child(fragment_2);

							$.component(node_2, () => Sidebar.Content, ($$anchor, Sidebar_Content) => {
								Sidebar_Content($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_3 = root_3();
										var node_3 = $.first_child(fragment_3);

										$.component(node_3, () => Sidebar.Group, ($$anchor, Sidebar_Group) => {
											Sidebar_Group($$anchor, {
												children: ($$anchor, $$slotProps) => {
													var fragment_4 = root_3();
													var node_4 = $.first_child(fragment_4);

													$.component(node_4, () => Sidebar.GroupLabel, ($$anchor, Sidebar_GroupLabel) => {
														Sidebar_GroupLabel($$anchor, {
															children: ($$anchor, $$slotProps) => {
																$.next();

																var text = $.text('Dashboard');

																$.append($$anchor, text);
															},
															$$slots: { default: true }
														});
													});

													var node_5 = $.sibling(node_4, 2);

													$.component(node_5, () => Sidebar.Menu, ($$anchor, Sidebar_Menu) => {
														Sidebar_Menu($$anchor, {
															children: ($$anchor, $$slotProps) => {
																var fragment_5 = $.comment();
																var node_6 = $.first_child(fragment_5);

																$.each(node_6, 17, () => data.navMain, (item) => item.title, ($$anchor, item) => {
																	var fragment_6 = $.comment();
																	var node_7 = $.first_child(fragment_6);

																	{
																		const child = ($$anchor, $$arg0) => {
																			let props = () => ($$arg0?.()).props;
																			var fragment_7 = $.comment();
																			var node_8 = $.first_child(fragment_7);

																			$.component(node_8, () => Sidebar.MenuItem, ($$anchor, Sidebar_MenuItem) => {
																				Sidebar_MenuItem($$anchor, $.spread_props(props, {
																					children: ($$anchor, $$slotProps) => {
																						var fragment_8 = root_3();
																						var node_9 = $.first_child(fragment_8);

																						{
																							const child = ($$anchor, $$arg0) => {
																								let props = () => ($$arg0?.()).props;
																								var a = root();

																								$.attribute_effect(a, () => ({ href: $.get(item).url, ...props() }));

																								var node_10 = $.child(a);

																								IconPlaceholder(node_10, {
																									get lucide() {
																										return $.get(item).lucide;
																									},

																									get tabler() {
																										return $.get(item).tabler;
																									},

																									get hugeicons() {
																										return $.get(item).hugeicons;
																									},

																									get phosphor() {
																										return $.get(item).phosphor;
																									},

																									get remixicon() {
																										return $.get(item).remixicon;
																									}
																								});

																								var span = $.sibling(node_10, 2);
																								var text_1 = $.only_child(span, true);

																								$.reset(a);
																								$.template_effect(() => $.set_text(text_1, $.get(item).title));
																								$.append($$anchor, a);
																							};

																							$.component(node_9, () => Sidebar.MenuButton, ($$anchor, Sidebar_MenuButton) => {
																								Sidebar_MenuButton($$anchor, {
																									get isActive() {
																										return $.get(item).isActive;
																									},
																									child,
																									$$slots: { child: true }
																								});
																							});
																						}

																						var node_11 = $.sibling(node_9, 2);

																						{
																							var consequent = ($$anchor) => {
																								var fragment_9 = root_3();
																								var node_12 = $.first_child(fragment_9);

																								{
																									const child = ($$anchor, $$arg0) => {
																										let props = () => ($$arg0?.()).props;
																										var fragment_10 = $.comment();
																										var node_13 = $.first_child(fragment_10);

																										$.component(node_13, () => Sidebar.MenuAction, ($$anchor, Sidebar_MenuAction) => {
																											Sidebar_MenuAction($$anchor, $.spread_props({ class: 'data-[state=open]:rotate-90' }, props, {
																												children: ($$anchor, $$slotProps) => {
																													var fragment_11 = root_1();
																													var node_14 = $.first_child(fragment_11);

																													IconPlaceholder(node_14, {
																														lucide: 'ChevronRightIcon',
																														tabler: 'IconChevronRight',
																														hugeicons: 'ArrowRight01Icon',
																														phosphor: 'CaretRightIcon',
																														remixicon: 'RiArrowRightSLine'
																													});

																													$.next(2);
																													$.append($$anchor, fragment_11);
																												},
																												$$slots: { default: true }
																											}));
																										});

																										$.append($$anchor, fragment_10);
																									};

																									$.component(node_12, () => Collapsible.Trigger, ($$anchor, Collapsible_Trigger) => {
																										Collapsible_Trigger($$anchor, { child, $$slots: { child: true } });
																									});
																								}

																								var node_15 = $.sibling(node_12, 2);

																								$.component(node_15, () => Collapsible.Content, ($$anchor, Collapsible_Content) => {
																									Collapsible_Content($$anchor, {
																										children: ($$anchor, $$slotProps) => {
																											var fragment_12 = $.comment();
																											var node_16 = $.first_child(fragment_12);

																											$.component(node_16, () => Sidebar.MenuSub, ($$anchor, Sidebar_MenuSub) => {
																												Sidebar_MenuSub($$anchor, {
																													children: ($$anchor, $$slotProps) => {
																														var fragment_13 = $.comment();
																														var node_17 = $.first_child(fragment_13);

																														$.each(node_17, 17, () => $.get(item).items, (subItem) => subItem.title, ($$anchor, subItem) => {
																															var fragment_14 = $.comment();
																															var node_18 = $.first_child(fragment_14);

																															$.component(node_18, () => Sidebar.MenuSubItem, ($$anchor, Sidebar_MenuSubItem) => {
																																Sidebar_MenuSubItem($$anchor, {
																																	children: ($$anchor, $$slotProps) => {
																																		var fragment_15 = $.comment();
																																		var node_19 = $.first_child(fragment_15);

																																		{
																																			const child = ($$anchor, $$arg0) => {
																																				let props = () => ($$arg0?.()).props;
																																				var a_1 = root_2();

																																				$.attribute_effect(a_1, () => ({ href: $.get(subItem).url, ...props() }));

																																				var text_2 = $.only_child(a_1, true);

																																				$.template_effect(() => $.set_text(text_2, $.get(subItem).title));
																																				$.append($$anchor, a_1);
																																			};

																																			$.component(node_19, () => Sidebar.MenuSubButton, ($$anchor, Sidebar_MenuSubButton) => {
																																				Sidebar_MenuSubButton($$anchor, { child, $$slots: { child: true } });
																																			});
																																		}

																																		$.append($$anchor, fragment_15);
																																	},
																																	$$slots: { default: true }
																																});
																															});

																															$.append($$anchor, fragment_14);
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

																								$.append($$anchor, fragment_9);
																							};

																							$.if(node_11, ($$render) => {
																								if ($.get(item).items?.length) $$render(consequent);
																							});
																						}

																						$.append($$anchor, fragment_8);
																					},
																					$$slots: { default: true }
																				}));
																			});

																			$.append($$anchor, fragment_7);
																		};

																		$.component(node_7, () => Collapsible.Root, ($$anchor, Collapsible_Root) => {
																			Collapsible_Root($$anchor, {
																				get open() {
																					return $.get(item).isActive;
																				},
																				child,
																				$$slots: { child: true }
																			});
																		});
																	}

																	$.append($$anchor, fragment_6);
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

										var node_20 = $.sibling(node_3, 2);

										$.component(node_20, () => Sidebar.Group, ($$anchor, Sidebar_Group_1) => {
											Sidebar_Group_1($$anchor, {
												class: 'mt-auto',
												children: ($$anchor, $$slotProps) => {
													var fragment_16 = $.comment();
													var node_21 = $.first_child(fragment_16);

													$.component(node_21, () => Sidebar.GroupContent, ($$anchor, Sidebar_GroupContent) => {
														Sidebar_GroupContent($$anchor, {
															children: ($$anchor, $$slotProps) => {
																var fragment_17 = $.comment();
																var node_22 = $.first_child(fragment_17);

																$.component(node_22, () => Sidebar.Menu, ($$anchor, Sidebar_Menu_1) => {
																	Sidebar_Menu_1($$anchor, {
																		children: ($$anchor, $$slotProps) => {
																			var fragment_18 = $.comment();
																			var node_23 = $.first_child(fragment_18);

																			$.each(node_23, 17, () => data.navSecondary, (item) => item.title, ($$anchor, item) => {
																				var fragment_19 = $.comment();
																				var node_24 = $.first_child(fragment_19);

																				$.component(node_24, () => Sidebar.MenuItem, ($$anchor, Sidebar_MenuItem_1) => {
																					Sidebar_MenuItem_1($$anchor, {
																						children: ($$anchor, $$slotProps) => {
																							var fragment_20 = $.comment();
																							var node_25 = $.first_child(fragment_20);

																							{
																								const child = ($$anchor, $$arg0) => {
																									let props = () => ($$arg0?.()).props;
																									var a_2 = root();

																									$.attribute_effect(a_2, () => ({ href: $.get(item).url, ...props() }));

																									var node_26 = $.child(a_2);

																									IconPlaceholder(node_26, {
																										get lucide() {
																											return $.get(item).lucide;
																										},

																										get tabler() {
																											return $.get(item).tabler;
																										},

																										get hugeicons() {
																											return $.get(item).hugeicons;
																										},

																										get phosphor() {
																											return $.get(item).phosphor;
																										},

																										get remixicon() {
																											return $.get(item).remixicon;
																										}
																									});

																									var span_1 = $.sibling(node_26, 2);
																									var text_3 = $.only_child(span_1, true);

																									$.reset(a_2);
																									$.template_effect(() => $.set_text(text_3, $.get(item).title));
																									$.append($$anchor, a_2);
																								};

																								$.component(node_25, () => Sidebar.MenuButton, ($$anchor, Sidebar_MenuButton_1) => {
																									Sidebar_MenuButton_1($$anchor, { size: 'sm', child, $$slots: { child: true } });
																								});
																							}

																							$.append($$anchor, fragment_20);
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

																$.append($$anchor, fragment_17);
															},
															$$slots: { default: true }
														});
													});

													$.append($$anchor, fragment_16);
												},
												$$slots: { default: true }
											});
										});

										$.append($$anchor, fragment_3);
									},
									$$slots: { default: true }
								});
							});

							var node_27 = $.sibling(node_2, 2);

							$.component(node_27, () => Sidebar.Rail, ($$anchor, Sidebar_Rail) => {
								Sidebar_Rail($$anchor, {});
							});

							$.append($$anchor, fragment_2);
						},
						$$slots: { default: true }
					});
				});

				var node_28 = $.sibling(node_1, 2);

				$.component(node_28, () => Sidebar.Inset, ($$anchor, Sidebar_Inset) => {
					Sidebar_Inset($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_21 = root_4();
							var header = $.first_child(fragment_21);
							var node_29 = $.child(header);

							$.component(node_29, () => Sidebar.Trigger, ($$anchor, Sidebar_Trigger) => {
								Sidebar_Trigger($$anchor, { class: '-ml-1' });
							});

							$.reset(header);
							$.next(2);
							$.append($$anchor, fragment_21);
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