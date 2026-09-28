import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import ChevronRightIcon from "@lucide/svelte/icons/chevron-right";
import * as Collapsible from "$lib/registry/ui/collapsible/index.js";
import * as Sidebar from "$lib/registry/ui/sidebar/index.js";
import SearchForm from "./search-form.svelte";
import VersionSwitcher from "./version-switcher.svelte";

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
		},

		{
			title: "Community",
			url: "#",
			items: [{ title: "Contribution Guide", url: "#" }]
		}
	]
};

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'ref']);
var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(` <!>`, 1);
var root_2 = $.from_html(`<a> </a>`);
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
							var fragment_2 = root();
							var node_2 = $.first_child(fragment_2);

							VersionSwitcher(node_2, {
								get versions() {
									return data.versions;
								},

								get defaultVersion() {
									return data.versions[0];
								}
							});

							var node_3 = $.sibling(node_2, 2);

							SearchForm(node_3, {});
							$.append($$anchor, fragment_2);
						},
						$$slots: { default: true }
					});
				});

				var node_4 = $.sibling(node_1, 2);

				$.component(node_4, () => Sidebar.Content, ($$anchor, Sidebar_Content) => {
					Sidebar_Content($$anchor, {
						class: 'gap-0',
						children: ($$anchor, $$slotProps) => {
							var fragment_3 = $.comment();
							var node_5 = $.first_child(fragment_3);

							$.each(node_5, 17, () => data.navMain, (item) => item.title, ($$anchor, item) => {
								var fragment_4 = $.comment();
								var node_6 = $.first_child(fragment_4);

								$.component(node_6, () => Collapsible.Root, ($$anchor, Collapsible_Root) => {
									Collapsible_Root($$anchor, {
										get title() {
											return $.get(item).title;
										},
										open: true,
										class: 'group/collapsible',
										children: ($$anchor, $$slotProps) => {
											var fragment_5 = $.comment();
											var node_7 = $.first_child(fragment_5);

											$.component(node_7, () => Sidebar.Group, ($$anchor, Sidebar_Group) => {
												Sidebar_Group($$anchor, {
													children: ($$anchor, $$slotProps) => {
														var fragment_6 = root();
														var node_8 = $.first_child(fragment_6);

														{
															const child = ($$anchor, $$arg0) => {
																let props = () => ($$arg0?.()).props;
																var fragment_7 = $.comment();
																var node_9 = $.first_child(fragment_7);

																$.component(node_9, () => Collapsible.Trigger, ($$anchor, Collapsible_Trigger) => {
																	Collapsible_Trigger($$anchor, $.spread_props(props, {
																		children: ($$anchor, $$slotProps) => {
																			$.next();

																			var fragment_8 = root_1();
																			var text = $.first_child(fragment_8);
																			var node_10 = $.sibling(text);

																			ChevronRightIcon(node_10, {
																				class: 'ms-auto transition-transform group-data-[state=open]/collapsible:rotate-90'
																			});

																			$.template_effect(() => $.set_text(text, `${$.get(item).title ?? ''} `));
																			$.append($$anchor, fragment_8);
																		},
																		$$slots: { default: true }
																	}));
																});

																$.append($$anchor, fragment_7);
															};

															$.component(node_8, () => Sidebar.GroupLabel, ($$anchor, Sidebar_GroupLabel) => {
																Sidebar_GroupLabel($$anchor, {
																	class: 'group/label text-sm text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
																	child,
																	$$slots: { child: true }
																});
															});
														}

														var node_11 = $.sibling(node_8, 2);

														$.component(node_11, () => Collapsible.Content, ($$anchor, Collapsible_Content) => {
															Collapsible_Content($$anchor, {
																children: ($$anchor, $$slotProps) => {
																	var fragment_9 = $.comment();
																	var node_12 = $.first_child(fragment_9);

																	$.component(node_12, () => Sidebar.GroupContent, ($$anchor, Sidebar_GroupContent) => {
																		Sidebar_GroupContent($$anchor, {
																			children: ($$anchor, $$slotProps) => {
																				var fragment_10 = $.comment();
																				var node_13 = $.first_child(fragment_10);

																				$.component(node_13, () => Sidebar.Menu, ($$anchor, Sidebar_Menu) => {
																					Sidebar_Menu($$anchor, {
																						children: ($$anchor, $$slotProps) => {
																							var fragment_11 = $.comment();
																							var node_14 = $.first_child(fragment_11);

																							$.each(node_14, 17, () => $.get(item).items, (subItem) => subItem.title, ($$anchor, subItem) => {
																								var fragment_12 = $.comment();
																								var node_15 = $.first_child(fragment_12);

																								$.component(node_15, () => Sidebar.MenuItem, ($$anchor, Sidebar_MenuItem) => {
																									Sidebar_MenuItem($$anchor, {
																										children: ($$anchor, $$slotProps) => {
																											var fragment_13 = $.comment();
																											var node_16 = $.first_child(fragment_13);

																											{
																												const child = ($$anchor, $$arg0) => {
																													let props = () => ($$arg0?.()).props;
																													var a = root_2();

																													$.attribute_effect(a, () => ({ href: $.get(subItem).url, ...props() }));

																													var text_1 = $.only_child(a, true);

																													$.template_effect(() => $.set_text(text_1, $.get(subItem).title));
																													$.append($$anchor, a);
																												};

																												$.component(node_16, () => Sidebar.MenuButton, ($$anchor, Sidebar_MenuButton) => {
																													Sidebar_MenuButton($$anchor, {
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
																			},
																			$$slots: { default: true }
																		});
																	});

																	$.append($$anchor, fragment_9);
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
							});

							$.append($$anchor, fragment_3);
						},
						$$slots: { default: true }
					});
				});

				var node_17 = $.sibling(node_4, 2);

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