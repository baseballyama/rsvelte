import * as $ from 'svelte/internal/server';
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
									children: ($$renderer) => {
										$$renderer.push(`<!--[-->`);

										const each_array = $.ensure_array_like(data.navMain);

										for (let $$index_1 = 0, $$length = each_array.length; $$index_1 < $$length; $$index_1++) {
											let group = each_array[$$index_1];

											if (Sidebar.Group) {
												$$renderer.push('<!--[-->');

												Sidebar.Group($$renderer, {
													children: ($$renderer) => {
														if (Sidebar.GroupLabel) {
															$$renderer.push('<!--[-->');

															Sidebar.GroupLabel($$renderer, {
																children: ($$renderer) => {
																	$$renderer.push(`<!---->${$.escape(group.title)}`);
																},
																$$slots: { default: true }
															});

															$$renderer.push('<!--]-->');
														} else {
															$$renderer.push('<!--[!-->');
															$$renderer.push('<!--]-->');
														}

														$$renderer.push(` `);

														if (Sidebar.GroupContent) {
															$$renderer.push('<!--[-->');

															Sidebar.GroupContent($$renderer, {
																children: ($$renderer) => {
																	if (Sidebar.Menu) {
																		$$renderer.push('<!--[-->');

																		Sidebar.Menu($$renderer, {
																			children: ($$renderer) => {
																				$$renderer.push(`<!--[-->`);

																				const each_array_1 = $.ensure_array_like(group.items);

																				for (let $$index = 0, $$length = each_array_1.length; $$index < $$length; $$index++) {
																					let item = each_array_1[$$index];

																					if (Sidebar.MenuItem) {
																						$$renderer.push('<!--[-->');

																						Sidebar.MenuItem($$renderer, {
																							children: ($$renderer) => {
																								{
																									function child($$renderer, { props }) {
																										$$renderer.push(`<a${$.attributes({ href: item.url, ...props })}>${$.escape(item.title)}</a>`);
																									}

																									if (Sidebar.MenuButton) {
																										$$renderer.push('<!--[-->');
																										Sidebar.MenuButton($$renderer, { isActive: item.isActive, child, $$slots: { child: true } });
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