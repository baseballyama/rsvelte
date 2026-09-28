import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as Card from "$lib/registry/ui/card/index.js";
import * as DropdownMenu from "$lib/registry/ui/dropdown-menu/index.js";
import * as Field from "$lib/registry/ui/field/index.js";
import * as Item from "$lib/registry/ui/item/index.js";
import * as Sidebar from "$lib/registry/ui/sidebar/index.js";
import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
import { Button } from "$lib/registry/ui/button/index.js";

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<a><!></a>`);
var root_2 = $.from_html(` <!>`, 1);
var root_3 = $.from_html(`<a> </a>`);
var root_4 = $.from_html(`<form><!></form>`);
var root_5 = $.from_html(`<!> <!> <!> <!>`, 1);
var root_6 = $.from_html(`<header class="flex h-16 shrink-0 items-center gap-2 px-4"><!></header> <div class="flex flex-1 flex-col gap-4 p-4 pt-0"><div class="grid auto-rows-min gap-4 md:grid-cols-3"><div class="aspect-video rounded-xl bg-muted/50"></div> <div class="aspect-video rounded-xl bg-muted/50"></div> <div class="aspect-video rounded-xl bg-muted/50"></div></div> <div class="min-h-screen flex-1 rounded-xl bg-muted/50 md:min-h-min"></div></div>`, 1);

export default function Sidebar_floating($$anchor) {
	const data = {
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

	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => Sidebar.Provider, ($$anchor, Sidebar_Provider) => {
		Sidebar_Provider($$anchor, {
			class: 'bg-background',
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root();
				var node_1 = $.first_child(fragment_1);

				$.component(node_1, () => Sidebar.Root, ($$anchor, Sidebar_Root) => {
					Sidebar_Root($$anchor, {
						variant: 'floating',
						class: 'absolute',
						children: ($$anchor, $$slotProps) => {
							var fragment_2 = root_5();
							var node_2 = $.first_child(fragment_2);

							$.component(node_2, () => Sidebar.Header, ($$anchor, Sidebar_Header) => {
								Sidebar_Header($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_3 = $.comment();
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

																{
																	const child = ($$anchor, $$arg0) => {
																		let props = () => ($$arg0?.()).props;
																		var a = root_1();

																		$.attribute_effect(a, () => ({ href: '/', ...props() }));

																		var node_6 = $.child(a);

																		$.component(node_6, () => Item.Root, ($$anchor, Item_Root) => {
																			Item_Root($$anchor, {
																				class: 'p-0',
																				size: 'xs',
																				children: ($$anchor, $$slotProps) => {
																					var fragment_6 = $.comment();
																					var node_7 = $.first_child(fragment_6);

																					$.component(node_7, () => Item.Content, ($$anchor, Item_Content) => {
																						Item_Content($$anchor, {
																							children: ($$anchor, $$slotProps) => {
																								var fragment_7 = root();
																								var node_8 = $.first_child(fragment_7);

																								$.component(node_8, () => Item.Title, ($$anchor, Item_Title) => {
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

																								var node_9 = $.sibling(node_8, 2);

																								$.component(node_9, () => Item.Description, ($$anchor, Item_Description) => {
																									Item_Description($$anchor, {
																										children: ($$anchor, $$slotProps) => {
																											$.next();

																											var text_1 = $.text('v1.0.0');

																											$.append($$anchor, text_1);
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

																		$.reset(a);
																		$.append($$anchor, a);
																	};

																	$.component(node_5, () => Sidebar.MenuButton, ($$anchor, Sidebar_MenuButton) => {
																		Sidebar_MenuButton($$anchor, { size: 'lg', child, $$slots: { child: true } });
																	});
																}

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

							var node_10 = $.sibling(node_2, 2);

							$.component(node_10, () => Sidebar.Content, ($$anchor, Sidebar_Content) => {
								Sidebar_Content($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_8 = $.comment();
										var node_11 = $.first_child(fragment_8);

										$.component(node_11, () => Sidebar.Group, ($$anchor, Sidebar_Group) => {
											Sidebar_Group($$anchor, {
												children: ($$anchor, $$slotProps) => {
													var fragment_9 = $.comment();
													var node_12 = $.first_child(fragment_9);

													$.component(node_12, () => Sidebar.Menu, ($$anchor, Sidebar_Menu_1) => {
														Sidebar_Menu_1($$anchor, {
															children: ($$anchor, $$slotProps) => {
																var fragment_10 = $.comment();
																var node_13 = $.first_child(fragment_10);

																$.each(node_13, 17, () => data.navMain, (item) => item.title, ($$anchor, item) => {
																	var fragment_11 = $.comment();
																	var node_14 = $.first_child(fragment_11);

																	$.component(node_14, () => DropdownMenu.Root, ($$anchor, DropdownMenu_Root) => {
																		DropdownMenu_Root($$anchor, {
																			children: ($$anchor, $$slotProps) => {
																				var fragment_12 = $.comment();
																				var node_15 = $.first_child(fragment_12);

																				$.component(node_15, () => Sidebar.MenuItem, ($$anchor, Sidebar_MenuItem_1) => {
																					Sidebar_MenuItem_1($$anchor, {
																						children: ($$anchor, $$slotProps) => {
																							var fragment_13 = root();
																							var node_16 = $.first_child(fragment_13);

																							{
																								const child = ($$anchor, $$arg0) => {
																									let props = () => ($$arg0?.()).props;
																									var fragment_14 = $.comment();
																									var node_17 = $.first_child(fragment_14);

																									$.component(node_17, () => Sidebar.MenuButton, ($$anchor, Sidebar_MenuButton_1) => {
																										Sidebar_MenuButton_1($$anchor, $.spread_props(
																											{
																												class: 'data-popup-open:bg-sidebar-accent data-popup-open:text-sidebar-accent-foreground'
																											},
																											props,
																											{
																												children: ($$anchor, $$slotProps) => {
																													$.next();

																													var fragment_15 = root_2();
																													var text_2 = $.first_child(fragment_15);
																													var node_18 = $.sibling(text_2);

																													IconPlaceholder(node_18, {
																														lucide: 'MoreHorizontalIcon',
																														tabler: 'IconDots',
																														hugeicons: 'MoreHorizontalCircle01Icon',
																														phosphor: 'DotsThreeOutlineIcon',
																														remixicon: 'RiMoreLine',
																														class: 'ml-auto'
																													});

																													$.template_effect(() => $.set_text(text_2, `${$.get(item).title ?? ''} `));
																													$.append($$anchor, fragment_15);
																												},
																												$$slots: { default: true }
																											}
																										));
																									});

																									$.append($$anchor, fragment_14);
																								};

																								$.component(node_16, () => DropdownMenu.Trigger, ($$anchor, DropdownMenu_Trigger) => {
																									DropdownMenu_Trigger($$anchor, { child, $$slots: { child: true } });
																								});
																							}

																							var node_19 = $.sibling(node_16, 2);

																							{
																								var consequent = ($$anchor) => {
																									var fragment_16 = $.comment();
																									var node_20 = $.first_child(fragment_16);

																									$.component(node_20, () => DropdownMenu.Content, ($$anchor, DropdownMenu_Content) => {
																										DropdownMenu_Content($$anchor, {
																											side: 'right',
																											align: 'start',
																											children: ($$anchor, $$slotProps) => {
																												var fragment_17 = $.comment();
																												var node_21 = $.first_child(fragment_17);

																												$.component(node_21, () => DropdownMenu.Group, ($$anchor, DropdownMenu_Group) => {
																													DropdownMenu_Group($$anchor, {
																														children: ($$anchor, $$slotProps) => {
																															var fragment_18 = $.comment();
																															var node_22 = $.first_child(fragment_18);

																															$.each(node_22, 17, () => $.get(item).items, (subItem) => subItem.title, ($$anchor, subItem) => {
																																var fragment_19 = $.comment();
																																var node_23 = $.first_child(fragment_19);

																																{
																																	const child = ($$anchor, $$arg0) => {
																																		let props = () => ($$arg0?.()).props;
																																		var a_1 = root_3();

																																		$.attribute_effect(a_1, () => ({ href: $.get(subItem).url, ...props() }));

																																		var text_3 = $.only_child(a_1, true);

																																		$.template_effect(() => $.set_text(text_3, $.get(subItem).title));
																																		$.append($$anchor, a_1);
																																	};

																																	$.component(node_23, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item) => {
																																		DropdownMenu_Item($$anchor, { child, $$slots: { child: true } });
																																	});
																																}

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
																								};

																								$.if(node_19, ($$render) => {
																									if ($.get(item).items?.length) $$render(consequent);
																								});
																							}

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

							var node_24 = $.sibling(node_10, 2);

							$.component(node_24, () => Sidebar.Footer, ($$anchor, Sidebar_Footer) => {
								Sidebar_Footer($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_20 = $.comment();
										var node_25 = $.first_child(fragment_20);

										$.component(node_25, () => Sidebar.Group, ($$anchor, Sidebar_Group_1) => {
											Sidebar_Group_1($$anchor, {
												children: ($$anchor, $$slotProps) => {
													var fragment_21 = $.comment();
													var node_26 = $.first_child(fragment_21);

													$.component(node_26, () => Card.Root, ($$anchor, Card_Root) => {
														Card_Root($$anchor, {
															size: 'sm',
															class: '-mx-2',
															children: ($$anchor, $$slotProps) => {
																var fragment_22 = root();
																var node_27 = $.first_child(fragment_22);

																$.component(node_27, () => Card.Header, ($$anchor, Card_Header) => {
																	Card_Header($$anchor, {
																		children: ($$anchor, $$slotProps) => {
																			var fragment_23 = root();
																			var node_28 = $.first_child(fragment_23);

																			$.component(node_28, () => Card.Title, ($$anchor, Card_Title) => {
																				Card_Title($$anchor, {
																					class: 'text-sm',
																					children: ($$anchor, $$slotProps) => {
																						$.next();

																						var text_4 = $.text('Subscribe to our newsletter');

																						$.append($$anchor, text_4);
																					},
																					$$slots: { default: true }
																				});
																			});

																			var node_29 = $.sibling(node_28, 2);

																			$.component(node_29, () => Card.Description, ($$anchor, Card_Description) => {
																				Card_Description($$anchor, {
																					children: ($$anchor, $$slotProps) => {
																						$.next();

																						var text_5 = $.text('Opt-in to receive updates and news about the sidebar.');

																						$.append($$anchor, text_5);
																					},
																					$$slots: { default: true }
																				});
																			});

																			$.append($$anchor, fragment_23);
																		},
																		$$slots: { default: true }
																	});
																});

																var node_30 = $.sibling(node_27, 2);

																$.component(node_30, () => Card.Content, ($$anchor, Card_Content) => {
																	Card_Content($$anchor, {
																		children: ($$anchor, $$slotProps) => {
																			var form = root_4();
																			var node_31 = $.child(form);

																			$.component(node_31, () => Field.Field, ($$anchor, Field_Field) => {
																				Field_Field($$anchor, {
																					children: ($$anchor, $$slotProps) => {
																						var fragment_24 = root();
																						var node_32 = $.first_child(fragment_24);

																						$.component(node_32, () => Sidebar.Input, ($$anchor, Sidebar_Input) => {
																							Sidebar_Input($$anchor, { type: 'email', placeholder: 'Email' });
																						});

																						var node_33 = $.sibling(node_32, 2);

																						Button(node_33, {
																							class: 'w-full bg-sidebar-primary text-sidebar-primary-foreground',
																							size: 'sm',
																							children: ($$anchor, $$slotProps) => {
																								$.next();

																								var text_6 = $.text('Subscribe');

																								$.append($$anchor, text_6);
																							},
																							$$slots: { default: true }
																						});

																						$.append($$anchor, fragment_24);
																					},
																					$$slots: { default: true }
																				});
																			});

																			$.reset(form);
																			$.append($$anchor, form);
																		},
																		$$slots: { default: true }
																	});
																});

																$.append($$anchor, fragment_22);
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
									},
									$$slots: { default: true }
								});
							});

							var node_34 = $.sibling(node_24, 2);

							$.component(node_34, () => Sidebar.Rail, ($$anchor, Sidebar_Rail) => {
								Sidebar_Rail($$anchor, {});
							});

							$.append($$anchor, fragment_2);
						},
						$$slots: { default: true }
					});
				});

				var node_35 = $.sibling(node_1, 2);

				$.component(node_35, () => Sidebar.Inset, ($$anchor, Sidebar_Inset) => {
					Sidebar_Inset($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_25 = root_6();
							var header = $.first_child(fragment_25);
							var node_36 = $.child(header);

							$.component(node_36, () => Sidebar.Trigger, ($$anchor, Sidebar_Trigger) => {
								Sidebar_Trigger($$anchor, { class: '-ml-1' });
							});

							$.reset(header);
							$.next(2);
							$.append($$anchor, fragment_25);
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