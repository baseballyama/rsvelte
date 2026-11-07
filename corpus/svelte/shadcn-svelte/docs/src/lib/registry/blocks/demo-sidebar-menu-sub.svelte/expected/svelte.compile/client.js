import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as Sidebar from "$lib/registry/ui/sidebar/index.js";

var root = $.from_html(`<a><span> </span></a>`);
var root_1 = $.from_html(`<!> <!>`, 1);

export default function Demo_sidebar_menu_sub($$anchor) {
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

																			$.each(node_6, 17, () => items, $.index, ($$anchor, item) => {
																				var fragment_7 = $.comment();
																				var node_7 = $.first_child(fragment_7);

																				$.component(node_7, () => Sidebar.MenuItem, ($$anchor, Sidebar_MenuItem) => {
																					Sidebar_MenuItem($$anchor, {
																						children: ($$anchor, $$slotProps) => {
																							var fragment_8 = root_1();
																							var node_8 = $.first_child(fragment_8);

																							{
																								const child = ($$anchor, $$arg0) => {
																									let props = () => ($$arg0?.()).props;
																									var a = root();

																									$.attribute_effect(a, () => ({ href: $.get(item).url, ...props() }));

																									var span = $.child(a);
																									var text = $.only_child(span, true);

																									$.reset(a);
																									$.template_effect(() => $.set_text(text, $.get(item).title));
																									$.append($$anchor, a);
																								};

																								$.component(node_8, () => Sidebar.MenuButton, ($$anchor, Sidebar_MenuButton) => {
																									Sidebar_MenuButton($$anchor, { child, $$slots: { child: true } });
																								});
																							}

																							var node_9 = $.sibling(node_8, 2);

																							$.component(node_9, () => Sidebar.MenuSub, ($$anchor, Sidebar_MenuSub) => {
																								Sidebar_MenuSub($$anchor, {
																									children: ($$anchor, $$slotProps) => {
																										var fragment_9 = $.comment();
																										var node_10 = $.first_child(fragment_9);

																										$.each(node_10, 17, () => $.get(item).items, $.index, ($$anchor, subItem) => {
																											var fragment_10 = $.comment();
																											var node_11 = $.first_child(fragment_10);

																											$.component(node_11, () => Sidebar.MenuSubItem, ($$anchor, Sidebar_MenuSubItem) => {
																												Sidebar_MenuSubItem($$anchor, {
																													children: ($$anchor, $$slotProps) => {
																														var fragment_11 = $.comment();
																														var node_12 = $.first_child(fragment_11);

																														{
																															const child = ($$anchor, $$arg0) => {
																																let props = () => ($$arg0?.()).props;
																																var a_1 = root();

																																$.attribute_effect(a_1, () => ({ href: $.get(subItem).url, ...props() }));

																																var span_1 = $.child(a_1);
																																var text_1 = $.only_child(span_1, true);

																																$.reset(a_1);
																																$.template_effect(() => $.set_text(text_1, $.get(subItem).title));
																																$.append($$anchor, a_1);
																															};

																															$.component(node_12, () => Sidebar.MenuSubButton, ($$anchor, Sidebar_MenuSubButton) => {
																																Sidebar_MenuSubButton($$anchor, { child, $$slots: { child: true } });
																															});
																														}

																														$.append($$anchor, fragment_11);
																													},
																													$$slots: { default: true }
																												});
																											});

																											$.append($$anchor, fragment_10);
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