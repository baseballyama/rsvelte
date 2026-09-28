import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import ChevronRightIcon from "@lucide/svelte/icons/chevron-right";
import * as Collapsible from "$lib/registry/ui/collapsible/index.js";
import * as Sidebar from "$lib/registry/ui/sidebar/index.js";

var root = $.from_html(`<span> </span> <!>`, 1);
var root_1 = $.from_html(`<a><span> </span></a>`);
var root_2 = $.from_html(`<!> <!>`, 1);

export default function Demo_sidebar_menu_collapsible($$anchor) {
	const items = [
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
													var fragment_4 = $.comment();
													var node_4 = $.first_child(fragment_4);

													$.component(node_4, () => Sidebar.GroupContent, ($$anchor, Sidebar_GroupContent) => {
														Sidebar_GroupContent($$anchor, {
															children: ($$anchor, $$slotProps) => {
																var fragment_5 = $.comment();
																var node_5 = $.first_child(fragment_5);

																$.component(node_5, () => Sidebar.Menu, ($$anchor, Sidebar_Menu) => {
																	Sidebar_Menu($$anchor, {
																		children: ($$anchor, $$slotProps) => {
																			var fragment_6 = $.comment();
																			var node_6 = $.first_child(fragment_6);

																			$.each(node_6, 17, () => items, $.index, ($$anchor, item, index) => {
																				var fragment_7 = $.comment();
																				var node_7 = $.first_child(fragment_7);

																				$.component(node_7, () => Collapsible.Root, ($$anchor, Collapsible_Root) => {
																					Collapsible_Root($$anchor, {
																						class: 'group/collapsible',
																						open: index === 0,
																						children: ($$anchor, $$slotProps) => {
																							var fragment_8 = $.comment();
																							var node_8 = $.first_child(fragment_8);

																							$.component(node_8, () => Sidebar.MenuItem, ($$anchor, Sidebar_MenuItem) => {
																								Sidebar_MenuItem($$anchor, {
																									children: ($$anchor, $$slotProps) => {
																										var fragment_9 = root_2();
																										var node_9 = $.first_child(fragment_9);

																										{
																											const child = ($$anchor, $$arg0) => {
																												let props = () => ($$arg0?.()).props;
																												var fragment_10 = $.comment();
																												var node_10 = $.first_child(fragment_10);

																												$.component(node_10, () => Sidebar.MenuButton, ($$anchor, Sidebar_MenuButton) => {
																													Sidebar_MenuButton($$anchor, $.spread_props(props, {
																														children: ($$anchor, $$slotProps) => {
																															var fragment_11 = root();
																															var span = $.first_child(fragment_11);
																															var text = $.only_child(span, true);
																															var node_11 = $.sibling(span, 2);

																															ChevronRightIcon(node_11, {
																																class: 'ms-auto transition-transform group-data-[state=open]/collapsible:rotate-90'
																															});

																															$.template_effect(() => $.set_text(text, $.get(item).title));
																															$.append($$anchor, fragment_11);
																														},
																														$$slots: { default: true }
																													}));
																												});

																												$.append($$anchor, fragment_10);
																											};

																											$.component(node_9, () => Collapsible.Trigger, ($$anchor, Collapsible_Trigger) => {
																												Collapsible_Trigger($$anchor, { child, $$slots: { child: true } });
																											});
																										}

																										var node_12 = $.sibling(node_9, 2);

																										$.component(node_12, () => Collapsible.Content, ($$anchor, Collapsible_Content) => {
																											Collapsible_Content($$anchor, {
																												children: ($$anchor, $$slotProps) => {
																													var fragment_12 = $.comment();
																													var node_13 = $.first_child(fragment_12);

																													$.component(node_13, () => Sidebar.MenuSub, ($$anchor, Sidebar_MenuSub) => {
																														Sidebar_MenuSub($$anchor, {
																															children: ($$anchor, $$slotProps) => {
																																var fragment_13 = $.comment();
																																var node_14 = $.first_child(fragment_13);

																																$.each(node_14, 17, () => $.get(item).items, $.index, ($$anchor, subItem) => {
																																	var fragment_14 = $.comment();
																																	var node_15 = $.first_child(fragment_14);

																																	$.component(node_15, () => Sidebar.MenuSubItem, ($$anchor, Sidebar_MenuSubItem) => {
																																		Sidebar_MenuSubItem($$anchor, {
																																			children: ($$anchor, $$slotProps) => {
																																				var fragment_15 = $.comment();
																																				var node_16 = $.first_child(fragment_15);

																																				{
																																					const child = ($$anchor, $$arg0) => {
																																						let props = () => ($$arg0?.()).props;
																																						var a = root_1();

																																						$.attribute_effect(a, () => ({ href: $.get(subItem).url, ...props() }));

																																						var span_1 = $.child(a);
																																						var text_1 = $.only_child(span_1, true);

																																						$.reset(a);
																																						$.template_effect(() => $.set_text(text_1, $.get(subItem).title));
																																						$.append($$anchor, a);
																																					};

																																					$.component(node_16, () => Sidebar.MenuSubButton, ($$anchor, Sidebar_MenuSubButton) => {
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