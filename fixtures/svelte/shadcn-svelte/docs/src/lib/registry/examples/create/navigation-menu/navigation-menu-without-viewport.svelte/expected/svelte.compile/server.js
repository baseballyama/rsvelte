import * as $ from 'svelte/internal/server';
import CircleAlertIcon from "@lucide/svelte/icons/circle-alert";
import * as NavigationMenu from "$lib/registry/ui/navigation-menu/index.js";
import { navigationMenuTriggerStyle } from "$lib/registry/ui/navigation-menu/navigation-menu-trigger.svelte";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

export default function Navigation_menu_without_viewport($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		Example($$renderer, {
			title: 'Without Viewport',
			children: ($$renderer) => {
				if (NavigationMenu.Root) {
					$$renderer.push('<!--[-->');

					NavigationMenu.Root($$renderer, {
						viewport: false,
						children: ($$renderer) => {
							if (NavigationMenu.List) {
								$$renderer.push('<!--[-->');

								NavigationMenu.List($$renderer, {
									children: ($$renderer) => {
										if (NavigationMenu.Item) {
											$$renderer.push('<!--[-->');

											NavigationMenu.Item($$renderer, {
												children: ($$renderer) => {
													{
														function child($$renderer, { props }) {
															$$renderer.push(`<a${$.attributes({ ...props, href: '/docs' })}>Documentation</a>`);
														}

														if (NavigationMenu.Link) {
															$$renderer.push('<!--[-->');

															NavigationMenu.Link($$renderer, {
																class: navigationMenuTriggerStyle(),
																child,
																$$slots: { child: true }
															});

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

										$$renderer.push(` `);

										if (NavigationMenu.Item) {
											$$renderer.push('<!--[-->');

											NavigationMenu.Item($$renderer, {
												children: ($$renderer) => {
													if (NavigationMenu.Trigger) {
														$$renderer.push('<!--[-->');

														NavigationMenu.Trigger($$renderer, {
															children: ($$renderer) => {
																$$renderer.push(`<!---->List`);
															},
															$$slots: { default: true }
														});

														$$renderer.push('<!--]-->');
													} else {
														$$renderer.push('<!--[!-->');
														$$renderer.push('<!--]-->');
													}

													$$renderer.push(` `);

													if (NavigationMenu.Content) {
														$$renderer.push('<!--[-->');

														NavigationMenu.Content($$renderer, {
															children: ($$renderer) => {
																$$renderer.push(`<ul class="w-72"><li>`);

																if (NavigationMenu.Link) {
																	$$renderer.push('<!--[-->');

																	NavigationMenu.Link($$renderer, {
																		href: '#/',
																		children: ($$renderer) => {
																			$$renderer.push(`<div class="flex flex-col"><div class="font-medium">Components</div> <div class="text-muted-foreground">Browse all components in the library.</div></div>`);
																		},
																		$$slots: { default: true }
																	});

																	$$renderer.push('<!--]-->');
																} else {
																	$$renderer.push('<!--[!-->');
																	$$renderer.push('<!--]-->');
																}

																$$renderer.push(` `);

																if (NavigationMenu.Link) {
																	$$renderer.push('<!--[-->');

																	NavigationMenu.Link($$renderer, {
																		href: '#/',
																		children: ($$renderer) => {
																			$$renderer.push(`<div class="flex flex-col"><div class="font-medium">Documentation</div> <div class="text-muted-foreground">Learn how to use the library.</div></div>`);
																		},
																		$$slots: { default: true }
																	});

																	$$renderer.push('<!--]-->');
																} else {
																	$$renderer.push('<!--[!-->');
																	$$renderer.push('<!--]-->');
																}

																$$renderer.push(` `);

																if (NavigationMenu.Link) {
																	$$renderer.push('<!--[-->');

																	NavigationMenu.Link($$renderer, {
																		href: '#/',
																		children: ($$renderer) => {
																			$$renderer.push(`<div class="flex flex-col"><div class="font-medium">Blog</div> <div class="text-muted-foreground">Read our latest blog posts.</div></div>`);
																		},
																		$$slots: { default: true }
																	});

																	$$renderer.push('<!--]-->');
																} else {
																	$$renderer.push('<!--[!-->');
																	$$renderer.push('<!--]-->');
																}

																$$renderer.push(`</li></ul>`);
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

										$$renderer.push(` `);

										if (NavigationMenu.Item) {
											$$renderer.push('<!--[-->');

											NavigationMenu.Item($$renderer, {
												children: ($$renderer) => {
													if (NavigationMenu.Trigger) {
														$$renderer.push('<!--[-->');

														NavigationMenu.Trigger($$renderer, {
															children: ($$renderer) => {
																$$renderer.push(`<!---->Simple List`);
															},
															$$slots: { default: true }
														});

														$$renderer.push('<!--]-->');
													} else {
														$$renderer.push('<!--[!-->');
														$$renderer.push('<!--]-->');
													}

													$$renderer.push(` `);

													if (NavigationMenu.Content) {
														$$renderer.push('<!--[-->');

														NavigationMenu.Content($$renderer, {
															children: ($$renderer) => {
																$$renderer.push(`<ul><li>`);

																if (NavigationMenu.Link) {
																	$$renderer.push('<!--[-->');

																	NavigationMenu.Link($$renderer, {
																		href: '#/',
																		children: ($$renderer) => {
																			$$renderer.push(`<!---->Components`);
																		},
																		$$slots: { default: true }
																	});

																	$$renderer.push('<!--]-->');
																} else {
																	$$renderer.push('<!--[!-->');
																	$$renderer.push('<!--]-->');
																}

																$$renderer.push(` `);

																if (NavigationMenu.Link) {
																	$$renderer.push('<!--[-->');

																	NavigationMenu.Link($$renderer, {
																		href: '#/',
																		children: ($$renderer) => {
																			$$renderer.push(`<!---->Documentation`);
																		},
																		$$slots: { default: true }
																	});

																	$$renderer.push('<!--]-->');
																} else {
																	$$renderer.push('<!--[!-->');
																	$$renderer.push('<!--]-->');
																}

																$$renderer.push(` `);

																if (NavigationMenu.Link) {
																	$$renderer.push('<!--[-->');

																	NavigationMenu.Link($$renderer, {
																		href: '#/',
																		children: ($$renderer) => {
																			$$renderer.push(`<!---->Blocks`);
																		},
																		$$slots: { default: true }
																	});

																	$$renderer.push('<!--]-->');
																} else {
																	$$renderer.push('<!--[!-->');
																	$$renderer.push('<!--]-->');
																}

																$$renderer.push(`</li></ul>`);
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

										$$renderer.push(` `);

										if (NavigationMenu.Item) {
											$$renderer.push('<!--[-->');

											NavigationMenu.Item($$renderer, {
												children: ($$renderer) => {
													if (NavigationMenu.Trigger) {
														$$renderer.push('<!--[-->');

														NavigationMenu.Trigger($$renderer, {
															children: ($$renderer) => {
																$$renderer.push(`<!---->With Icon`);
															},
															$$slots: { default: true }
														});

														$$renderer.push('<!--]-->');
													} else {
														$$renderer.push('<!--[!-->');
														$$renderer.push('<!--]-->');
													}

													$$renderer.push(` `);

													if (NavigationMenu.Content) {
														$$renderer.push('<!--[-->');

														NavigationMenu.Content($$renderer, {
															children: ($$renderer) => {
																$$renderer.push(`<ul class="grid w-[200px]"><li>`);

																if (NavigationMenu.Link) {
																	$$renderer.push('<!--[-->');

																	NavigationMenu.Link($$renderer, {
																		href: '#/',
																		class: 'flex-row items-center gap-2',
																		children: ($$renderer) => {
																			CircleAlertIcon($$renderer, {});
																			$$renderer.push(`<!----> Backlog`);
																		},
																		$$slots: { default: true }
																	});

																	$$renderer.push('<!--]-->');
																} else {
																	$$renderer.push('<!--[!-->');
																	$$renderer.push('<!--]-->');
																}

																$$renderer.push(` `);

																if (NavigationMenu.Link) {
																	$$renderer.push('<!--[-->');

																	NavigationMenu.Link($$renderer, {
																		href: '#/',
																		class: 'flex-row items-center gap-2',
																		children: ($$renderer) => {
																			CircleAlertIcon($$renderer, {});
																			$$renderer.push(`<!----> To Do`);
																		},
																		$$slots: { default: true }
																	});

																	$$renderer.push('<!--]-->');
																} else {
																	$$renderer.push('<!--[!-->');
																	$$renderer.push('<!--]-->');
																}

																$$renderer.push(` `);

																if (NavigationMenu.Link) {
																	$$renderer.push('<!--[-->');

																	NavigationMenu.Link($$renderer, {
																		href: '#/',
																		children: ($$renderer) => {
																			CircleAlertIcon($$renderer, {});
																			$$renderer.push(`<!----> Done`);
																		},
																		$$slots: { default: true }
																	});

																	$$renderer.push('<!--]-->');
																} else {
																	$$renderer.push('<!--[!-->');
																	$$renderer.push('<!--]-->');
																}

																$$renderer.push(`</li></ul>`);
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
	});
}