import * as $ from 'svelte/internal/server';
import ChevronRightIcon from "@lucide/svelte/icons/chevron-right";
import * as Collapsible from "$lib/registry/ui/collapsible/index.js";
import * as Sidebar from "$lib/registry/ui/sidebar/index.js";

export default function Demo_sidebar_menu_collapsible($$renderer) {
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

	if (Sidebar.Provider) {
		$$renderer.push('<!--[-->');

		Sidebar.Provider($$renderer, {
			children: ($$renderer) => {
				if (Sidebar.Root) {
					$$renderer.push('<!--[-->');

					Sidebar.Root($$renderer, {
						children: ($$renderer) => {
							if (Sidebar.Content) {
								$$renderer.push('<!--[-->');

								Sidebar.Content($$renderer, {
									children: ($$renderer) => {
										if (Sidebar.Group) {
											$$renderer.push('<!--[-->');

											Sidebar.Group($$renderer, {
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

																			const each_array = $.ensure_array_like(items);

																			for (let index = 0, $$length = each_array.length; index < $$length; index++) {
																				let item = each_array[index];

																				if (Collapsible.Root) {
																					$$renderer.push('<!--[-->');

																					Collapsible.Root($$renderer, {
																						class: 'group/collapsible',
																						open: index === 0,
																						children: ($$renderer) => {
																							if (Sidebar.MenuItem) {
																								$$renderer.push('<!--[-->');

																								Sidebar.MenuItem($$renderer, {
																									children: ($$renderer) => {
																										{
																											function child($$renderer, { props }) {
																												if (Sidebar.MenuButton) {
																													$$renderer.push('<!--[-->');

																													Sidebar.MenuButton($$renderer, $.spread_props([
																														props,
																														{
																															children: ($$renderer) => {
																																$$renderer.push(`<span>${$.escape(item.title)}</span> `);

																																ChevronRightIcon($$renderer, {
																																	class: 'ms-auto transition-transform group-data-[state=open]/collapsible:rotate-90'
																																});

																																$$renderer.push(`<!---->`);
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

																																for (let subIndex = 0, $$length = each_array_1.length; subIndex < $$length; subIndex++) {
																																	let subItem = each_array_1[subIndex];

																																	if (Sidebar.MenuSubItem) {
																																		$$renderer.push('<!--[-->');

																																		Sidebar.MenuSubItem($$renderer, {
																																			children: ($$renderer) => {
																																				{
																																					function child($$renderer, { props }) {
																																						$$renderer.push(`<a${$.attributes({ href: subItem.url, ...props })}><span>${$.escape(subItem.title)}</span></a>`);
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