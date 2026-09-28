import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as Sidebar from "$lib/registry/ui/sidebar/index.js";

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'ref']);
var root = $.from_html(`<a> </a>`);
var root_1 = $.from_html(`<!> <!>`, 1);

export default function App_sidebar($$anchor, $$props) {
	$.push($$props, true);

	// This is sample data.
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
				var fragment_1 = root_1();
				var node_1 = $.first_child(fragment_1);

				$.component(node_1, () => Sidebar.Content, ($$anchor, Sidebar_Content) => {
					Sidebar_Content($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_2 = $.comment();
							var node_2 = $.first_child(fragment_2);

							$.component(node_2, () => Sidebar.Group, ($$anchor, Sidebar_Group) => {
								Sidebar_Group($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_3 = root_1();
										var node_3 = $.first_child(fragment_3);

										$.component(node_3, () => Sidebar.GroupLabel, ($$anchor, Sidebar_GroupLabel) => {
											Sidebar_GroupLabel($$anchor, {
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text = $.text('Table of Contents');

													$.append($$anchor, text);
												},
												$$slots: { default: true }
											});
										});

										var node_4 = $.sibling(node_3, 2);

										$.component(node_4, () => Sidebar.GroupContent, ($$anchor, Sidebar_GroupContent) => {
											Sidebar_GroupContent($$anchor, {
												children: ($$anchor, $$slotProps) => {
													var fragment_4 = $.comment();
													var node_5 = $.first_child(fragment_4);

													$.component(node_5, () => Sidebar.Menu, ($$anchor, Sidebar_Menu) => {
														Sidebar_Menu($$anchor, {
															children: ($$anchor, $$slotProps) => {
																var fragment_5 = $.comment();
																var node_6 = $.first_child(fragment_5);

																$.each(node_6, 17, () => data.navMain, (item) => item.title, ($$anchor, item) => {
																	var fragment_6 = $.comment();
																	var node_7 = $.first_child(fragment_6);

																	$.component(node_7, () => Sidebar.MenuItem, ($$anchor, Sidebar_MenuItem) => {
																		Sidebar_MenuItem($$anchor, {
																			children: ($$anchor, $$slotProps) => {
																				var fragment_7 = root_1();
																				var node_8 = $.first_child(fragment_7);

																				{
																					const child = ($$anchor, $$arg0) => {
																						let props = () => ($$arg0?.()).props;
																						var a = root();

																						$.attribute_effect(a, () => ({ href: $.get(item).url, ...props() }));

																						var text_1 = $.only_child(a, true);

																						$.template_effect(() => $.set_text(text_1, $.get(item).title));
																						$.append($$anchor, a);
																					};

																					$.component(node_8, () => Sidebar.MenuButton, ($$anchor, Sidebar_MenuButton) => {
																						Sidebar_MenuButton($$anchor, { class: 'font-medium', child, $$slots: { child: true } });
																					});
																				}

																				var node_9 = $.sibling(node_8, 2);

																				{
																					var consequent = ($$anchor) => {
																						var fragment_8 = $.comment();
																						var node_10 = $.first_child(fragment_8);

																						$.component(node_10, () => Sidebar.MenuSub, ($$anchor, Sidebar_MenuSub) => {
																							Sidebar_MenuSub($$anchor, {
																								children: ($$anchor, $$slotProps) => {
																									var fragment_9 = $.comment();
																									var node_11 = $.first_child(fragment_9);

																									$.each(node_11, 17, () => $.get(item).items, (subItem) => subItem.title, ($$anchor, subItem) => {
																										var fragment_10 = $.comment();
																										var node_12 = $.first_child(fragment_10);

																										$.component(node_12, () => Sidebar.MenuSubItem, ($$anchor, Sidebar_MenuSubItem) => {
																											Sidebar_MenuSubItem($$anchor, {
																												children: ($$anchor, $$slotProps) => {
																													var fragment_11 = $.comment();
																													var node_13 = $.first_child(fragment_11);

																													$.component(node_13, () => Sidebar.MenuSubButton, ($$anchor, Sidebar_MenuSubButton) => {
																														Sidebar_MenuSubButton($$anchor, {
																															get href() {
																																return $.get(subItem).url;
																															},

																															get isActive() {
																																return $.get(subItem).isActive;
																															},

																															children: ($$anchor, $$slotProps) => {
																																$.next();

																																var text_2 = $.text();

																																$.template_effect(() => $.set_text(text_2, $.get(subItem).title));
																																$.append($$anchor, text_2);
																															},
																															$$slots: { default: true }
																														});
																													});

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
																					};

																					$.if(node_9, ($$render) => {
																						if ($.get(item).items?.length) $$render(consequent);
																					});
																				}

																				$.append($$anchor, fragment_7);
																			},
																			$$slots: { default: true }
																		});
																	});

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

				var node_14 = $.sibling(node_1, 2);

				$.component(node_14, () => Sidebar.Rail, ($$anchor, Sidebar_Rail) => {
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