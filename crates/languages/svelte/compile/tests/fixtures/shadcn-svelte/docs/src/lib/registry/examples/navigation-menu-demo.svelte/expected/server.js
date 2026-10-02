import * as $ from 'svelte/internal/server';
import CircleIcon from "@lucide/svelte/icons/circle";
import CircleCheckIcon from "@lucide/svelte/icons/circle-check";
import CircleHelpIcon from "@lucide/svelte/icons/circle-help";
import * as NavigationMenu from "$lib/registry/ui/navigation-menu/index.js";
import { IsMobile } from "$lib/registry/hooks/is-mobile.svelte.js";
import { navigationMenuTriggerStyle } from "$lib/registry/ui/navigation-menu/navigation-menu-trigger.svelte";
import { cn } from "$lib/utils.js";

function ListItem(
	$$renderer,
	{ title, content, href, class: className, ...restProps }
) {
	$$renderer.push(`<li>`);

	{
		function child($$renderer) {
			$$renderer.push(`<a${$.attributes({
				href,
				class: $.clsx(cn("block space-y-1 rounded-md p-3 leading-none no-underline transition-colors outline-none select-none hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground", className)),
				...restProps
			})}><div class="text-sm leading-none font-medium">${$.escape(title)}</div> <p class="line-clamp-2 text-sm leading-snug text-muted-foreground">${$.escape(content)}</p></a>`);
		}

		if (NavigationMenu.Link) {
			$$renderer.push('<!--[-->');
			NavigationMenu.Link($$renderer, { child, $$slots: { child: true } });
			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}
	}

	$$renderer.push(`</li>`);
}

export default function Navigation_menu_demo($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const isMobile = new IsMobile();

		const components = [
			{
				title: "Alert Dialog",
				href: "/docs/components/alert-dialog",
				description: "A modal dialog that interrupts the user with important content and expects a response."
			},

			{
				title: "Hover Card",
				href: "/docs/components/hover-card",
				description: "For sighted users to preview content available behind a link."
			},

			{
				title: "Progress",
				href: "/docs/components/progress",
				description: "Displays an indicator showing the completion progress of a task, typically displayed as a progress bar."
			},

			{
				title: "Scroll-area",
				href: "/docs/components/scroll-area",
				description: "Visually or semantically separates content."
			},

			{
				title: "Tabs",
				href: "/docs/components/tabs",
				description: "A set of layered sections of content—known as tab panels—that are displayed one at a time."
			},

			{
				title: "Tooltip",
				href: "/docs/components/tooltip",
				description: "A popup that displays information related to an element when the element receives keyboard focus or the mouse hovers over it."
			}
		];

		if (NavigationMenu.Root) {
			$$renderer.push('<!--[-->');

			NavigationMenu.Root($$renderer, {
				viewport: isMobile.current,
				children: ($$renderer) => {
					if (NavigationMenu.List) {
						$$renderer.push('<!--[-->');

						NavigationMenu.List($$renderer, {
							class: 'flex-wrap',
							children: ($$renderer) => {
								if (NavigationMenu.Item) {
									$$renderer.push('<!--[-->');

									NavigationMenu.Item($$renderer, {
										children: ($$renderer) => {
											if (NavigationMenu.Trigger) {
												$$renderer.push('<!--[-->');

												NavigationMenu.Trigger($$renderer, {
													children: ($$renderer) => {
														$$renderer.push(`<!---->Home`);
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
														$$renderer.push(`<ul class="grid gap-2 p-2 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]"><li class="row-span-3">`);

														{
															function child($$renderer, { props }) {
																$$renderer.push(`<a${$.attributes({ ...props, href: '/' })}><div class="mt-4 mb-2 text-lg font-medium">shadcn-svelte</div> <p class="text-sm leading-tight text-muted-foreground">Beautifully designed components built with Tailwind CSS.</p></a>`);
															}

															if (NavigationMenu.Link) {
																$$renderer.push('<!--[-->');

																NavigationMenu.Link($$renderer, {
																	class: 'flex h-full w-full flex-col justify-end rounded-md bg-linear-to-b from-muted/50 to-muted p-4 no-underline outline-hidden select-none focus:shadow-md md:p-6',
																	child,
																	$$slots: { child: true }
																});

																$$renderer.push('<!--]-->');
															} else {
																$$renderer.push('<!--[!-->');
																$$renderer.push('<!--]-->');
															}
														}

														$$renderer.push(`</li> `);

														ListItem($$renderer, {
															href: "/docs",
															title: "Introduction",
															content: "Re-usable components built using Bits UI and Tailwind CSS."
														});

														$$renderer.push(`<!----> `);

														ListItem($$renderer, {
															href: "/docs/installation",
															title: "Installation",
															content: "How to install dependencies and structure your app."
														});

														$$renderer.push(`<!----> `);

														ListItem($$renderer, {
															href: "/docs/components/typography",
															title: "Typography",
															content: "Styles for headings, paragraphs, lists...etc"
														});

														$$renderer.push(`<!----></ul>`);
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

											if (NavigationMenu.Content) {
												$$renderer.push('<!--[-->');

												NavigationMenu.Content($$renderer, {
													children: ($$renderer) => {
														$$renderer.push(`<ul class="grid w-[300px] gap-2 p-2 sm:w-[400px] md:w-[500px] md:grid-cols-2 lg:w-[600px]"><!--[-->`);

														const each_array = $.ensure_array_like(components);

														for (let i = 0, $$length = each_array.length; i < $$length; i++) {
															let component = each_array[i];

															ListItem($$renderer, {
																href: component.href,
																title: component.title,
																content: component.description
															});
														}

														$$renderer.push(`<!--]--></ul>`);
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
											{
												function child($$renderer) {
													$$renderer.push(`<a href="/docs"${$.attr_class($.clsx(navigationMenuTriggerStyle()))}>Docs</a>`);
												}

												if (NavigationMenu.Link) {
													$$renderer.push('<!--[-->');
													NavigationMenu.Link($$renderer, { child, $$slots: { child: true } });
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
										class: 'hidden md:block',
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
														$$renderer.push(`<ul class="grid w-[300px] gap-4 p-2"><li>`);

														if (NavigationMenu.Link) {
															$$renderer.push('<!--[-->');

															NavigationMenu.Link($$renderer, {
																href: '##',
																children: ($$renderer) => {
																	$$renderer.push(`<div class="font-medium">Components</div> <div class="text-muted-foreground">Browse all components in the library.</div>`);
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
																href: '##',
																children: ($$renderer) => {
																	$$renderer.push(`<div class="font-medium">Documentation</div> <div class="text-muted-foreground">Learn how to use the library.</div>`);
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
																href: '##',
																children: ($$renderer) => {
																	$$renderer.push(`<div class="font-medium">Blog</div> <div class="text-muted-foreground">Read our latest blog posts.</div>`);
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
										class: 'hidden md:block',
										children: ($$renderer) => {
											if (NavigationMenu.Trigger) {
												$$renderer.push('<!--[-->');

												NavigationMenu.Trigger($$renderer, {
													children: ($$renderer) => {
														$$renderer.push(`<!---->Simple`);
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
														$$renderer.push(`<ul class="grid w-[200px] gap-4 p-2"><li>`);

														if (NavigationMenu.Link) {
															$$renderer.push('<!--[-->');

															NavigationMenu.Link($$renderer, {
																href: '##',
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
																href: '##',
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
																href: '##',
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
										class: 'hidden md:block',
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
														$$renderer.push(`<ul class="grid w-[200px] gap-4 p-2"><li>`);

														if (NavigationMenu.Link) {
															$$renderer.push('<!--[-->');

															NavigationMenu.Link($$renderer, {
																href: '##',
																class: 'flex-row items-center gap-2',
																children: ($$renderer) => {
																	CircleHelpIcon($$renderer, {});
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
																href: '##',
																class: 'flex-row items-center gap-2',
																children: ($$renderer) => {
																	CircleIcon($$renderer, {});
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
																href: '##',
																class: 'flex-row items-center gap-2',
																children: ($$renderer) => {
																	CircleCheckIcon($$renderer, {});
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
	});
}