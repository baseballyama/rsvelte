import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
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
				{ title: "Svelte Compiler", url: "#" },
				{ title: "Supported Browsers", url: "#" },
				{ title: "Rollup", url: "#" }
			]
		}
	]
};

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'ref']);
var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<a> </a>`);
var root_2 = $.from_html(`<!> <!> <!>`, 1);

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
				var fragment_1 = root_2();
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
						children: ($$anchor, $$slotProps) => {
							var fragment_3 = $.comment();
							var node_5 = $.first_child(fragment_3);

							$.each(node_5, 17, () => data.navMain, (group) => group.title, ($$anchor, group) => {
								var fragment_4 = $.comment();
								var node_6 = $.first_child(fragment_4);

								$.component(node_6, () => Sidebar.Group, ($$anchor, Sidebar_Group) => {
									Sidebar_Group($$anchor, {
										children: ($$anchor, $$slotProps) => {
											var fragment_5 = root();
											var node_7 = $.first_child(fragment_5);

											$.component(node_7, () => Sidebar.GroupLabel, ($$anchor, Sidebar_GroupLabel) => {
												Sidebar_GroupLabel($$anchor, {
													children: ($$anchor, $$slotProps) => {
														$.next();

														var text = $.text();

														$.template_effect(() => $.set_text(text, $.get(group).title));
														$.append($$anchor, text);
													},
													$$slots: { default: true }
												});
											});

											var node_8 = $.sibling(node_7, 2);

											$.component(node_8, () => Sidebar.GroupContent, ($$anchor, Sidebar_GroupContent) => {
												Sidebar_GroupContent($$anchor, {
													children: ($$anchor, $$slotProps) => {
														var fragment_7 = $.comment();
														var node_9 = $.first_child(fragment_7);

														$.component(node_9, () => Sidebar.Menu, ($$anchor, Sidebar_Menu) => {
															Sidebar_Menu($$anchor, {
																children: ($$anchor, $$slotProps) => {
																	var fragment_8 = $.comment();
																	var node_10 = $.first_child(fragment_8);

																	$.each(node_10, 17, () => $.get(group).items, (item) => item.title, ($$anchor, item) => {
																		var fragment_9 = $.comment();
																		var node_11 = $.first_child(fragment_9);

																		$.component(node_11, () => Sidebar.MenuItem, ($$anchor, Sidebar_MenuItem) => {
																			Sidebar_MenuItem($$anchor, {
																				children: ($$anchor, $$slotProps) => {
																					var fragment_10 = $.comment();
																					var node_12 = $.first_child(fragment_10);

																					{
																						const child = ($$anchor, $$arg0) => {
																							let props = () => ($$arg0?.()).props;
																							var a = root_1();

																							$.attribute_effect(a, () => ({ href: $.get(item).url, ...props() }));

																							var text_1 = $.only_child(a, true);

																							$.template_effect(() => $.set_text(text_1, $.get(item).title));
																							$.append($$anchor, a);
																						};

																						$.component(node_12, () => Sidebar.MenuButton, ($$anchor, Sidebar_MenuButton) => {
																							Sidebar_MenuButton($$anchor, {
																								get isActive() {
																									return $.get(item).isActive;
																								},
																								child,
																								$$slots: { child: true }
																							});
																						});
																					}

																					$.append($$anchor, fragment_10);
																				},
																				$$slots: { default: true }
																			});
																		});

																		$.append($$anchor, fragment_9);
																	});

																	$.append($$anchor, fragment_8);
																},
																$$slots: { default: true }
															});
														});

														$.append($$anchor, fragment_7);
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

				var node_13 = $.sibling(node_4, 2);

				$.component(node_13, () => Sidebar.Rail, ($$anchor, Sidebar_Rail) => {
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