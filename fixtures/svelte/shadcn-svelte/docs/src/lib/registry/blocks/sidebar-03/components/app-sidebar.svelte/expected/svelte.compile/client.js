import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import GalleryVerticalEndIcon from "@lucide/svelte/icons/gallery-vertical-end";
import * as Sidebar from "$lib/registry/ui/sidebar/index.js";

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
		},

		{
			title: "Community",
			url: "#",
			items: [{ title: "Contribution Guide", url: "#" }]
		}
	]
};

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'ref']);
var root = $.from_html(`<a><div class="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground"><!></div> <div class="flex flex-col gap-0.5 leading-none"><span class="font-medium">Documentation</span> <span>v1.0.0</span></div></a>`);
var root_1 = $.from_html(`<a> </a>`);
var root_2 = $.from_html(`<!> <!>`, 1);
var root_3 = $.from_html(`<!> <!> <!>`, 1);

export default function App_sidebar($$anchor, $$props) {
	$.push($$props, true);

	let ref = $.prop($$props, 'ref', 15, null),
		restProps = $.rest_props($$props, rest_excludes);

	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => Sidebar.Root, ($$anchor, Sidebar_Root) => {
		Sidebar_Root($$anchor, $.spread_props(() => restProps, {
			get ref() {
				return ref();
			},

			set ref($$value) {
				ref($$value);
			},

			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root_3();
				var node_1 = $.first_child(fragment_1);

				$.component(node_1, () => Sidebar.Header, ($$anchor, Sidebar_Header) => {
					Sidebar_Header($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_2 = $.comment();
							var node_2 = $.first_child(fragment_2);

							$.component(node_2, () => Sidebar.Menu, ($$anchor, Sidebar_Menu) => {
								Sidebar_Menu($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_3 = $.comment();
										var node_3 = $.first_child(fragment_3);

										$.component(node_3, () => Sidebar.MenuItem, ($$anchor, Sidebar_MenuItem) => {
											Sidebar_MenuItem($$anchor, {
												children: ($$anchor, $$slotProps) => {
													var fragment_4 = $.comment();
													var node_4 = $.first_child(fragment_4);

													{
														const child = ($$anchor, $$arg0) => {
															let props = () => ($$arg0?.()).props;
															var a = root();

															$.attribute_effect(a, () => ({ href: '##', ...props() }));

															var div = $.child(a);
															var node_5 = $.child(div);

															GalleryVerticalEndIcon(node_5, { class: 'size-4' });
															$.reset(div);
															$.next(2);
															$.reset(a);
															$.append($$anchor, a);
														};

														$.component(node_4, () => Sidebar.MenuButton, ($$anchor, Sidebar_MenuButton) => {
															Sidebar_MenuButton($$anchor, { size: 'lg', child, $$slots: { child: true } });
														});
													}

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

				var node_6 = $.sibling(node_1, 2);

				$.component(node_6, () => Sidebar.Content, ($$anchor, Sidebar_Content) => {
					Sidebar_Content($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_5 = $.comment();
							var node_7 = $.first_child(fragment_5);

							$.component(node_7, () => Sidebar.Group, ($$anchor, Sidebar_Group) => {
								Sidebar_Group($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_6 = $.comment();
										var node_8 = $.first_child(fragment_6);

										$.component(node_8, () => Sidebar.Menu, ($$anchor, Sidebar_Menu_1) => {
											Sidebar_Menu_1($$anchor, {
												children: ($$anchor, $$slotProps) => {
													var fragment_7 = $.comment();
													var node_9 = $.first_child(fragment_7);

													$.each(node_9, 17, () => data.navMain, (item) => item.title, ($$anchor, item) => {
														var fragment_8 = $.comment();
														var node_10 = $.first_child(fragment_8);

														$.component(node_10, () => Sidebar.MenuItem, ($$anchor, Sidebar_MenuItem_1) => {
															Sidebar_MenuItem_1($$anchor, {
																children: ($$anchor, $$slotProps) => {
																	var fragment_9 = root_2();
																	var node_11 = $.first_child(fragment_9);

																	{
																		const child = ($$anchor, $$arg0) => {
																			let props = () => ($$arg0?.()).props;
																			var a_1 = root_1();

																			$.attribute_effect(a_1, () => ({ href: $.get(item).url, ...props() }));

																			var text = $.only_child(a_1, true);

																			$.template_effect(() => $.set_text(text, $.get(item).title));
																			$.append($$anchor, a_1);
																		};

																		$.component(node_11, () => Sidebar.MenuButton, ($$anchor, Sidebar_MenuButton_1) => {
																			Sidebar_MenuButton_1($$anchor, { class: 'font-medium', child, $$slots: { child: true } });
																		});
																	}

																	var node_12 = $.sibling(node_11, 2);

																	{
																		var consequent = ($$anchor) => {
																			var fragment_10 = $.comment();
																			var node_13 = $.first_child(fragment_10);

																			$.component(node_13, () => Sidebar.MenuSub, ($$anchor, Sidebar_MenuSub) => {
																				Sidebar_MenuSub($$anchor, {
																					children: ($$anchor, $$slotProps) => {
																						var fragment_11 = $.comment();
																						var node_14 = $.first_child(fragment_11);

																						$.each(node_14, 17, () => $.get(item).items, (subItem) => subItem.title, ($$anchor, subItem) => {
																							var fragment_12 = $.comment();
																							var node_15 = $.first_child(fragment_12);

																							$.component(node_15, () => Sidebar.MenuSubItem, ($$anchor, Sidebar_MenuSubItem) => {
																								Sidebar_MenuSubItem($$anchor, {
																									children: ($$anchor, $$slotProps) => {
																										var fragment_13 = $.comment();
																										var node_16 = $.first_child(fragment_13);

																										{
																											const child = ($$anchor, $$arg0) => {
																												let props = () => ($$arg0?.()).props;
																												var a_2 = root_1();

																												$.attribute_effect(a_2, () => ({ href: $.get(subItem).url, ...props() }));

																												var text_1 = $.only_child(a_2, true);

																												$.template_effect(() => $.set_text(text_1, $.get(subItem).title));
																												$.append($$anchor, a_2);
																											};

																											$.component(node_16, () => Sidebar.MenuSubButton, ($$anchor, Sidebar_MenuSubButton) => {
																												Sidebar_MenuSubButton($$anchor, {
																													get isActive() {
																														return $.get(subItem).isActive;
																													},
																													child,
																													$$slots: { child: true }
																												});
																											});
																										}

																										$.append($$anchor, fragment_13);
																									},
																									$$slots: { default: true }
																								});
																							});

																							$.append($$anchor, fragment_12);
																						});

																						$.append($$anchor, fragment_11);
																					},
																					$$slots: { default: true }
																				});
																			});

																			$.append($$anchor, fragment_10);
																		};

																		$.if(node_12, ($$render) => {
																			if ($.get(item).items?.length) $$render(consequent);
																		});
																	}

																	$.append($$anchor, fragment_9);
																},
																$$slots: { default: true }
															});
														});

														$.append($$anchor, fragment_8);
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

							$.append($$anchor, fragment_5);
						},
						$$slots: { default: true }
					});
				});

				var node_17 = $.sibling(node_6, 2);

				$.component(node_17, () => Sidebar.Rail, ($$anchor, Sidebar_Rail) => {
					Sidebar_Rail($$anchor, {});
				});

				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		}));
	});

	$.append($$anchor, fragment);
	$.pop();
}