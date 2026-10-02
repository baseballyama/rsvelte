import * as $ from 'svelte/internal/server';
import * as Collapsible from "$lib/registry/ui/collapsible/index.js";
import * as Sidebar from "$lib/registry/ui/sidebar/index.js";
import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";

export default function Sidebar_inset($$renderer) {
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

	if (Sidebar.Provider) {
		$$renderer.push('<!--[-->');

		Sidebar.Provider($$renderer, {
			children: ($$renderer) => {
				if (Sidebar.Root) {
					$$renderer.push('<!--[-->');

					Sidebar.Root($$renderer, {
						variant: 'inset',
						class: 'absolute',
						children: ($$renderer) => {
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
																$$renderer.push(`<!---->Dashboard`);
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

																const each_array = $.ensure_array_like(data.navMain);

																for (let $$index_1 = 0, $$length = each_array.length; $$index_1 < $$length; $$index_1++) {
																	let item = each_array[$$index_1];

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
																									$$renderer.push(`<a${$.attributes({ href: item.url, ...props })}>`);

																									IconPlaceholder($$renderer, {
																										lucide: item.lucide,
																										tabler: item.tabler,
																										hugeicons: item.hugeicons,
																										phosphor: item.phosphor,
																										remixicon: item.remixicon
																									});

																									$$renderer.push(`<!----> <span>${$.escape(item.title)}</span></a>`);
																								}

																								if (Sidebar.MenuButton) {
																									$$renderer.push('<!--[-->');
																									Sidebar.MenuButton($$renderer, { isActive: item.isActive, child, $$slots: { child: true } });
																									$$renderer.push('<!--]-->');
																								} else {
																									$$renderer.push('<!--[!-->');
																									$$renderer.push('<!--]-->');
																								}
																							}

																							$$renderer.push(` `);

																							if (item.items?.length) {
																								$$renderer.push('<!--[0-->');

																								{
																									function child($$renderer, { props }) {
																										if (Sidebar.MenuAction) {
																											$$renderer.push('<!--[-->');

																											Sidebar.MenuAction($$renderer, $.spread_props([
																												{ class: 'data-[state=open]:rotate-90' },
																												props,
																												{
																													children: ($$renderer) => {
																														IconPlaceholder($$renderer, {
																															lucide: 'ChevronRightIcon',
																															tabler: 'IconChevronRight',
																															hugeicons: 'ArrowRight01Icon',
																															phosphor: 'CaretRightIcon',
																															remixicon: 'RiArrowRightSLine'
																														});

																														$$renderer.push(`<!----> <span class="sr-only">Toggle</span>`);
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

																														const each_array_1 = $.ensure_array_like(item.items);

																														for (let $$index = 0, $$length = each_array_1.length; $$index < $$length; $$index++) {
																															let subItem = each_array_1[$$index];

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
																							} else {
																								$$renderer.push('<!--[-1-->');
																							}

																							$$renderer.push(`<!--]-->`);
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
																			Collapsible.Root($$renderer, { open: item.isActive, child, $$slots: { child: true } });
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
												class: 'mt-auto',
												children: ($$renderer) => {
													if (Sidebar.GroupContent) {
														$$renderer.push('<!--[-->');

														Sidebar.GroupContent($$renderer, {
															children: ($$renderer) => {
																if (Sidebar.Menu) {
																	$$renderer.push('<!--[-->');

																	Sidebar.Menu($$renderer, {
																		children: ($$renderer) => {
																			$$renderer.push(`<!--[-->`);

																			const each_array_2 = $.ensure_array_like(data.navSecondary);

																			for (let $$index_2 = 0, $$length = each_array_2.length; $$index_2 < $$length; $$index_2++) {
																				let item = each_array_2[$$index_2];

																				if (Sidebar.MenuItem) {
																					$$renderer.push('<!--[-->');

																					Sidebar.MenuItem($$renderer, {
																						children: ($$renderer) => {
																							{
																								function child($$renderer, { props }) {
																									$$renderer.push(`<a${$.attributes({ href: item.url, ...props })}>`);

																									IconPlaceholder($$renderer, {
																										lucide: item.lucide,
																										tabler: item.tabler,
																										hugeicons: item.hugeicons,
																										phosphor: item.phosphor,
																										remixicon: item.remixicon
																									});

																									$$renderer.push(`<!----> <span>${$.escape(item.title)}</span></a>`);
																								}

																								if (Sidebar.MenuButton) {
																									$$renderer.push('<!--[-->');
																									Sidebar.MenuButton($$renderer, { size: 'sm', child, $$slots: { child: true } });
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
							$$renderer.push(`<header class="flex h-16 shrink-0 items-center gap-2 border-b px-4">`);

							if (Sidebar.Trigger) {
								$$renderer.push('<!--[-->');
								Sidebar.Trigger($$renderer, { class: '-ml-1' });
								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}

							$$renderer.push(`</header> <div class="flex flex-1 flex-col gap-4 p-4"><div class="grid auto-rows-min gap-4 md:grid-cols-3"><div class="aspect-video rounded-xl bg-muted/50"></div> <div class="aspect-video rounded-xl bg-muted/50"></div> <div class="aspect-video rounded-xl bg-muted/50"></div></div> <div class="min-h-screen flex-1 rounded-xl bg-muted/50 md:min-h-min"></div></div>`);
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
}