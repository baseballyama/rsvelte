import * as $ from 'svelte/internal/server';
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

export default function App_sidebar($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { ref = null, $$slots, $$events, ...restProps } = $$props;
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			if (Sidebar.Root) {
				$$renderer.push('<!--[-->');

				Sidebar.Root($$renderer, $.spread_props([
					restProps,
					{
						get ref() {
							return ref;
						},

						set ref($$value) {
							ref = $$value;
							$$settled = false;
						},

						children: ($$renderer) => {
							if (Sidebar.Header) {
								$$renderer.push('<!--[-->');

								Sidebar.Header($$renderer, {
									children: ($$renderer) => {
										VersionSwitcher($$renderer, { versions: data.versions, defaultVersion: data.versions[0] });
										$$renderer.push(`<!----> `);
										SearchForm($$renderer, {});
										$$renderer.push(`<!---->`);
									},
									$$slots: { default: true }
								});

								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}

							$$renderer.push(` `);

							if (Sidebar.Content) {
								$$renderer.push('<!--[-->');

								Sidebar.Content($$renderer, {
									class: 'gap-0',
									children: ($$renderer) => {
										$$renderer.push(`<!--[-->`);

										const each_array = $.ensure_array_like(data.navMain);

										for (let $$index_1 = 0, $$length = each_array.length; $$index_1 < $$length; $$index_1++) {
											let item = each_array[$$index_1];

											if (Collapsible.Root) {
												$$renderer.push('<!--[-->');

												Collapsible.Root($$renderer, {
													title: item.title,
													open: true,
													class: 'group/collapsible',
													children: ($$renderer) => {
														if (Sidebar.Group) {
															$$renderer.push('<!--[-->');

															Sidebar.Group($$renderer, {
																children: ($$renderer) => {
																	{
																		function child($$renderer, { props }) {
																			if (Collapsible.Trigger) {
																				$$renderer.push('<!--[-->');

																				Collapsible.Trigger($$renderer, $.spread_props([
																					props,
																					{
																						children: ($$renderer) => {
																							$$renderer.push(`<!---->${$.escape(item.title)} `);

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

																		if (Sidebar.GroupLabel) {
																			$$renderer.push('<!--[-->');

																			Sidebar.GroupLabel($$renderer, {
																				class: 'group/label text-sm text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
																				child,
																				$$slots: { child: true }
																			});

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
																				if (Sidebar.GroupContent) {
																					$$renderer.push('<!--[-->');

																					Sidebar.GroupContent($$renderer, {
																						children: ($$renderer) => {
																							if (Sidebar.Menu) {
																								$$renderer.push('<!--[-->');

																								Sidebar.Menu($$renderer, {
																									children: ($$renderer) => {
																										$$renderer.push(`<!--[-->`);

																										const each_array_1 = $.ensure_array_like(item.items);

																										for (let $$index = 0, $$length = each_array_1.length; $$index < $$length; $$index++) {
																											let subItem = each_array_1[$$index];

																											if (Sidebar.MenuItem) {
																												$$renderer.push('<!--[-->');

																												Sidebar.MenuItem($$renderer, {
																													children: ($$renderer) => {
																														{
																															function child($$renderer, { props }) {
																																$$renderer.push(`<a${$.attributes({ href: subItem.url, ...props })}>${$.escape(subItem.title)}</a>`);
																															}

																															if (Sidebar.MenuButton) {
																																$$renderer.push('<!--[-->');
																																Sidebar.MenuButton($$renderer, { isActive: subItem.isActive, child, $$slots: { child: true } });
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
					}
				]));

				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
		$.bind_props($$props, { ref });
	});
}