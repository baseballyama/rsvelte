import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as DropdownMenu from "$lib/registry/ui/dropdown-menu/index.js";
import * as Item from "$lib/registry/ui/item/index.js";
import * as Sidebar from "$lib/registry/ui/sidebar/index.js";
import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
import { Label } from "$lib/registry/ui/label/index.js";

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(` <!>`, 1);
var root_2 = $.from_html(`<!> <!> <!>`, 1);
var root_3 = $.from_html(`<!> <form><!></form>`, 1);
var root_4 = $.from_html(`<a> </a>`);
var root_5 = $.from_html(`<header class="flex h-16 shrink-0 items-center gap-2 px-4"><!></header> <div class="flex flex-1 flex-col gap-4 p-4"><div class="grid auto-rows-min gap-4 md:grid-cols-3"><div class="aspect-video rounded-xl bg-muted/50"></div> <div class="aspect-video rounded-xl bg-muted/50"></div> <div class="aspect-video rounded-xl bg-muted/50"></div></div> <div class="min-h-screen flex-1 rounded-xl bg-muted/50 md:min-h-min"></div></div>`, 1);

export default function Sidebar_1($$anchor) {
	const data = {
		versions: ["1.0.1", "1.1.0-alpha", "2.0.0-beta1"],
		navMain: [
			{
				title: "Getting Started",
				url: "#",
				items: [
					{ title: "Installation", url: "#" },
					{ title: "Project Structure", url: "#" }
				]
			},

			{
				title: "Build Your Application",
				url: "#",
				items: [
					{ title: "Routing", url: "#" },
					{ title: "Data Fetching", url: "#", isActive: true },
					{ title: "Rendering", url: "#" },
					{ title: "Caching", url: "#" },
					{ title: "Styling", url: "#" },
					{ title: "Optimizing", url: "#" },
					{ title: "Configuring", url: "#" },
					{ title: "Testing", url: "#" },
					{ title: "Authentication", url: "#" },
					{ title: "Deploying", url: "#" },
					{ title: "Upgrading", url: "#" },
					{ title: "Examples", url: "#" }
				]
			},

			{
				title: "API Reference",
				url: "#",
				items: [
					{ title: "Components", url: "#" },
					{ title: "File Conventions", url: "#" },
					{ title: "Functions", url: "#" },
					{ title: "next.config.js Options", url: "#" },
					{ title: "CLI", url: "#" },
					{ title: "Edge Runtime", url: "#" }
				]
			},

			{
				title: "Architecture",
				url: "#",
				items: [
					{ title: "Accessibility", url: "#" },
					{ title: "Fast Refresh", url: "#" },
					{ title: "Next.js Compiler", url: "#" },
					{ title: "Supported Browsers", url: "#" },
					{ title: "Turbopack", url: "#" }
				]
			}
		]
	};

	let selectedVersion = $.state($.proxy(data.versions[0]));
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => Sidebar.Provider, ($$anchor, Sidebar_Provider) => {
		Sidebar_Provider($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root();
				var node_1 = $.first_child(fragment_1);

				$.component(node_1, () => Sidebar.Root, ($$anchor, Sidebar_Root) => {
					Sidebar_Root($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_2 = root_2();
							var node_2 = $.first_child(fragment_2);

							$.component(node_2, () => Sidebar.Header, ($$anchor, Sidebar_Header) => {
								Sidebar_Header($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_3 = root_3();
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
																			var fragment_6 = root();
																			var node_6 = $.first_child(fragment_6);

																			{
																				const child = ($$anchor, $$arg0) => {
																					let props = () => ($$arg0?.()).props;
																					var fragment_7 = $.comment();
																					var node_7 = $.first_child(fragment_7);

																					$.component(node_7, () => Sidebar.MenuButton, ($$anchor, Sidebar_MenuButton) => {
																						Sidebar_MenuButton($$anchor, $.spread_props(
																							{
																								size: 'lg',
																								class: 'data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground'
																							},
																							props,
																							{
																								children: ($$anchor, $$slotProps) => {
																									var fragment_8 = $.comment();
																									var node_8 = $.first_child(fragment_8);

																									$.component(node_8, () => Item.Root, ($$anchor, Item_Root) => {
																										Item_Root($$anchor, {
																											class: 'p-0',
																											size: 'xs',
																											children: ($$anchor, $$slotProps) => {
																												var fragment_9 = root();
																												var node_9 = $.first_child(fragment_9);

																												$.component(node_9, () => Item.Content, ($$anchor, Item_Content) => {
																													Item_Content($$anchor, {
																														children: ($$anchor, $$slotProps) => {
																															var fragment_10 = root();
																															var node_10 = $.first_child(fragment_10);

																															$.component(node_10, () => Item.Title, ($$anchor, Item_Title) => {
																																Item_Title($$anchor, {
																																	class: 'text-sm',
																																	children: ($$anchor, $$slotProps) => {
																																		$.next();

																																		var text = $.text('Documentation');

																																		$.append($$anchor, text);
																																	},
																																	$$slots: { default: true }
																																});
																															});

																															var node_11 = $.sibling(node_10, 2);

																															$.component(node_11, () => Item.Description, ($$anchor, Item_Description) => {
																																Item_Description($$anchor, {
																																	children: ($$anchor, $$slotProps) => {
																																		$.next();

																																		var text_1 = $.text();

																																		$.template_effect(() => $.set_text(text_1, `v${$.get(selectedVersion) ?? ''}`));
																																		$.append($$anchor, text_1);
																																	},
																																	$$slots: { default: true }
																																});
																															});

																															$.append($$anchor, fragment_10);
																														},
																														$$slots: { default: true }
																													});
																												});

																												var node_12 = $.sibling(node_9, 2);

																												$.component(node_12, () => Item.Actions, ($$anchor, Item_Actions) => {
																													Item_Actions($$anchor, {
																														children: ($$anchor, $$slotProps) => {
																															IconPlaceholder($$anchor, {
																																lucide: 'ChevronsUpDownIcon',
																																tabler: 'IconSelector',
																																hugeicons: 'UnfoldMoreIcon',
																																phosphor: 'CaretUpDownIcon',
																																remixicon: 'RiArrowUpDownLine'
																															});
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
																							}
																						));
																					});

																					$.append($$anchor, fragment_7);
																				};

																				$.component(node_6, () => DropdownMenu.Trigger, ($$anchor, DropdownMenu_Trigger) => {
																					DropdownMenu_Trigger($$anchor, { child, $$slots: { child: true } });
																				});
																			}

																			var node_13 = $.sibling(node_6, 2);

																			$.component(node_13, () => DropdownMenu.Content, ($$anchor, DropdownMenu_Content) => {
																				DropdownMenu_Content($$anchor, {
																					children: ($$anchor, $$slotProps) => {
																						var fragment_13 = $.comment();
																						var node_14 = $.first_child(fragment_13);

																						$.each(node_14, 16, () => data.versions, (version) => version, ($$anchor, version) => {
																							var fragment_14 = $.comment();
																							var node_15 = $.first_child(fragment_14);

																							$.component(node_15, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item) => {
																								DropdownMenu_Item($$anchor, {
																									onSelect: () => $.set(selectedVersion, version, true),
																									children: ($$anchor, $$slotProps) => {
																										$.next();

																										var fragment_15 = root_1();
																										var text_2 = $.first_child(fragment_15);
																										var node_16 = $.sibling(text_2);

																										{
																											var consequent = ($$anchor) => {
																												IconPlaceholder($$anchor, {
																													lucide: 'CheckIcon',
																													tabler: 'IconCheck',
																													hugeicons: 'Tick02Icon',
																													phosphor: 'CheckIcon',
																													remixicon: 'RiCheckLine',
																													class: 'ml-auto'
																												});
																											};

																											$.if(node_16, ($$render) => {
																												if (version === $.get(selectedVersion)) $$render(consequent);
																											});
																										}

																										$.template_effect(() => $.set_text(text_2, `v${version ?? ''} `));
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

										var form = $.sibling(node_3, 2);
										var node_17 = $.child(form);

										$.component(node_17, () => Sidebar.Group, ($$anchor, Sidebar_Group) => {
											Sidebar_Group($$anchor, {
												class: 'py-0',
												children: ($$anchor, $$slotProps) => {
													var fragment_17 = $.comment();
													var node_18 = $.first_child(fragment_17);

													$.component(node_18, () => Sidebar.GroupContent, ($$anchor, Sidebar_GroupContent) => {
														Sidebar_GroupContent($$anchor, {
															class: 'relative',
															children: ($$anchor, $$slotProps) => {
																var fragment_18 = root_2();
																var node_19 = $.first_child(fragment_18);

																Label(node_19, {
																	for: 'search',
																	class: 'sr-only',
																	children: ($$anchor, $$slotProps) => {
																		$.next();

																		var text_3 = $.text('Search');

																		$.append($$anchor, text_3);
																	},
																	$$slots: { default: true }
																});

																var node_20 = $.sibling(node_19, 2);

																$.component(node_20, () => Sidebar.Input, ($$anchor, Sidebar_Input) => {
																	Sidebar_Input($$anchor, {
																		id: 'search',
																		placeholder: 'Search the docs...',
																		class: 'pl-8'
																	});
																});

																var node_21 = $.sibling(node_20, 2);

																IconPlaceholder(node_21, {
																	lucide: 'SearchIcon',
																	tabler: 'IconSearch',
																	hugeicons: 'SearchIcon',
																	phosphor: 'MagnifyingGlassIcon',
																	remixicon: 'RiSearchLine',
																	class: 'pointer-events-none absolute top-1/2 left-2 size-4 -translate-y-1/2 opacity-50 select-none'
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

										$.reset(form);
										$.append($$anchor, fragment_3);
									},
									$$slots: { default: true }
								});
							});

							var node_22 = $.sibling(node_2, 2);

							$.component(node_22, () => Sidebar.Content, ($$anchor, Sidebar_Content) => {
								Sidebar_Content($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_19 = $.comment();
										var node_23 = $.first_child(fragment_19);

										$.each(node_23, 17, () => data.navMain, (item) => item.title, ($$anchor, item) => {
											var fragment_20 = $.comment();
											var node_24 = $.first_child(fragment_20);

											$.component(node_24, () => Sidebar.Group, ($$anchor, Sidebar_Group_1) => {
												Sidebar_Group_1($$anchor, {
													children: ($$anchor, $$slotProps) => {
														var fragment_21 = root();
														var node_25 = $.first_child(fragment_21);

														$.component(node_25, () => Sidebar.GroupLabel, ($$anchor, Sidebar_GroupLabel) => {
															Sidebar_GroupLabel($$anchor, {
																children: ($$anchor, $$slotProps) => {
																	$.next();

																	var text_4 = $.text();

																	$.template_effect(() => $.set_text(text_4, $.get(item).title));
																	$.append($$anchor, text_4);
																},
																$$slots: { default: true }
															});
														});

														var node_26 = $.sibling(node_25, 2);

														$.component(node_26, () => Sidebar.GroupContent, ($$anchor, Sidebar_GroupContent_1) => {
															Sidebar_GroupContent_1($$anchor, {
																children: ($$anchor, $$slotProps) => {
																	var fragment_23 = $.comment();
																	var node_27 = $.first_child(fragment_23);

																	$.component(node_27, () => Sidebar.Menu, ($$anchor, Sidebar_Menu_1) => {
																		Sidebar_Menu_1($$anchor, {
																			children: ($$anchor, $$slotProps) => {
																				var fragment_24 = $.comment();
																				var node_28 = $.first_child(fragment_24);

																				$.each(node_28, 17, () => $.get(item).items, (subItem) => subItem.title, ($$anchor, subItem) => {
																					var fragment_25 = $.comment();
																					var node_29 = $.first_child(fragment_25);

																					$.component(node_29, () => Sidebar.MenuItem, ($$anchor, Sidebar_MenuItem_1) => {
																						Sidebar_MenuItem_1($$anchor, {
																							children: ($$anchor, $$slotProps) => {
																								var fragment_26 = $.comment();
																								var node_30 = $.first_child(fragment_26);

																								{
																									const child = ($$anchor, $$arg0) => {
																										let props = () => ($$arg0?.()).props;
																										var a = root_4();

																										$.attribute_effect(a, () => ({ href: $.get(subItem).url, ...props() }));

																										var text_5 = $.only_child(a, true);

																										$.template_effect(() => $.set_text(text_5, $.get(subItem).title));
																										$.append($$anchor, a);
																									};

																									$.component(node_30, () => Sidebar.MenuButton, ($$anchor, Sidebar_MenuButton_1) => {
																										Sidebar_MenuButton_1($$anchor, {
																											get isActive() {
																												return $.get(subItem).isActive;
																											},
																											child,
																											$$slots: { child: true }
																										});
																									});
																								}

																								$.append($$anchor, fragment_26);
																							},
																							$$slots: { default: true }
																						});
																					});

																					$.append($$anchor, fragment_25);
																				});

																				$.append($$anchor, fragment_24);
																			},
																			$$slots: { default: true }
																		});
																	});

																	$.append($$anchor, fragment_23);
																},
																$$slots: { default: true }
															});
														});

														$.append($$anchor, fragment_21);
													},
													$$slots: { default: true }
												});
											});

											$.append($$anchor, fragment_20);
										});

										$.append($$anchor, fragment_19);
									},
									$$slots: { default: true }
								});
							});

							var node_31 = $.sibling(node_22, 2);

							$.component(node_31, () => Sidebar.Rail, ($$anchor, Sidebar_Rail) => {
								Sidebar_Rail($$anchor, {});
							});

							$.append($$anchor, fragment_2);
						},
						$$slots: { default: true }
					});
				});

				var node_32 = $.sibling(node_1, 2);

				$.component(node_32, () => Sidebar.Inset, ($$anchor, Sidebar_Inset) => {
					Sidebar_Inset($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_27 = root_5();
							var header = $.first_child(fragment_27);
							var node_33 = $.child(header);

							$.component(node_33, () => Sidebar.Trigger, ($$anchor, Sidebar_Trigger) => {
								Sidebar_Trigger($$anchor, { class: '-ml-1' });
							});

							$.reset(header);
							$.next(2);
							$.append($$anchor, fragment_27);
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