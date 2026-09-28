import * as $ from 'svelte/internal/server';
import { NavigationMenu } from "bits-ui";
import CaretDown from "phosphor-svelte/lib/CaretDown";
import { cn } from "$lib/utils/styles.js";

function ListItem($$renderer, { className, title, content, href }) {
	if (NavigationMenu.Link) {
		$$renderer.push('<!--[-->');

		NavigationMenu.Link($$renderer, {
			class: cn("hover:bg-muted hover:text-accent-foreground focus-visible:bg-muted focus-visible:text-accent-foreground outline-hidden block select-none space-y-1 rounded-md p-3 leading-none no-underline transition-colors", className),
			href,
			children: ($$renderer) => {
				$$renderer.push(`<div class="text-sm font-medium leading-none">${$.escape(title)}</div> <p class="text-muted-foreground line-clamp-2 text-sm leading-snug">${$.escape(content)}</p>`);
			},
			$$slots: { default: true }
		});

		$$renderer.push('<!--]-->');
	} else {
		$$renderer.push('<!--[!-->');
		$$renderer.push('<!--]-->');
	}
}

function SubmenuItem($$renderer, { className, title, value, items }) {
	if (NavigationMenu.Item) {
		$$renderer.push('<!--[-->');

		NavigationMenu.Item($$renderer, {
			value,
			class: 'relative w-full',
			children: ($$renderer) => {
				if (NavigationMenu.Trigger) {
					$$renderer.push('<!--[-->');

					NavigationMenu.Trigger($$renderer, {
						class: cn("hover:bg-muted hover:text-accent-foreground focus-visible:bg-muted focus-visible:text-accent-foreground data-[state=open]:bg-muted outline-hidden group flex w-full select-none items-center justify-between space-y-1 rounded-md p-3 leading-none no-underline transition-colors", className),
						children: ($$renderer) => {
							$$renderer.push(`<div class="text-sm font-medium leading-none">${$.escape(title)}</div> `);

							CaretDown($$renderer, {
								class: 'ml-auto size-4 transition-transform duration-200 group-data-[state=open]:rotate-180',
								'aria-hidden': 'true'
							});

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

				if (NavigationMenu.Content) {
					$$renderer.push('<!--[-->');

					NavigationMenu.Content($$renderer, {
						class: 'bg-background data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-right-1 data-[state=open]:slide-in-from-right-1 absolute left-0 top-full z-50 mt-2 w-full min-w-[300px] rounded-md border shadow-lg transition-all duration-200 ease-out',
						children: ($$renderer) => {
							$$renderer.push(`<ul class="grid gap-1 p-2"><!--[-->`);

							const each_array = $.ensure_array_like(items);

							for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
								let item = each_array[$$index];

								ListItem($$renderer, {
									href: item.href,
									title: item.title,
									content: item.description
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
}

export default function Navigation_menu_submenu_demo($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const components = [
			{
				title: "Alert Dialog",
				href: "/docs/components/alert-dialog",
				description: "A modal dialog that interrupts the user with important content and expects a response."
			},

			{
				title: "Link Preview",
				href: "/docs/components/link-preview",
				description: "For sighted users to preview content available behind a link."
			},

			{
				title: "Progress",
				href: "/docs/components/progress",
				description: "Displays an indicator showing the completion progress of a task, typically displayed as a progress bar."
			}
		];

		const typeHelpers = [
			{
				title: "WithElementRef",
				href: "/docs/type-helpers/with-element-ref",
				description: "Expose a ref to the element."
			},

			{
				title: "WithoutChild",
				href: "/docs/type-helpers/without-child",
				description: "Remove the child snippet prop from a props type."
			},

			{
				title: "WithoutChildrenOrChild",
				href: "/docs/type-helpers/without-children-or-child",
				description: "Remove the children and child snippet props from a props type."
			}
		];

		const utilities = [
			{
				title: "mergeProps",
				href: "/docs/utilities/merge-props",
				description: "Merge multiple objects into a single object"
			},

			{
				title: "Portal",
				href: "/docs/utilities/portal",
				description: "Render a component in a different part of the DOM"
			},

			{
				title: "IsUsingKeyboard",
				href: "/docs/utilities/is-using-keyboard",
				description: "Check if the user is using a keyboard"
			}
		];

		if (NavigationMenu.Root) {
			$$renderer.push('<!--[-->');

			NavigationMenu.Root($$renderer, {
				class: 'relative z-10 flex w-full justify-center',
				children: ($$renderer) => {
					if (NavigationMenu.List) {
						$$renderer.push('<!--[-->');

						NavigationMenu.List($$renderer, {
							class: 'group flex list-none items-center justify-center p-1',
							children: ($$renderer) => {
								if (NavigationMenu.Item) {
									$$renderer.push('<!--[-->');

									NavigationMenu.Item($$renderer, {
										value: 'getting-started',
										children: ($$renderer) => {
											if (NavigationMenu.Trigger) {
												$$renderer.push('<!--[-->');

												NavigationMenu.Trigger($$renderer, {
													class: 'hover:text-accent-foreground focus-visible:bg-muted focus-visible:text-accent-foreground data-[state=open]:shadow-mini dark:hover:bg-muted dark:data-[state=open]:bg-muted focus-visible:outline-hidden group inline-flex h-8 w-max items-center justify-center rounded-[7px] bg-transparent px-4 py-2 text-sm font-medium transition-colors hover:bg-white disabled:pointer-events-none disabled:opacity-50 data-[state=open]:bg-white',
													children: ($$renderer) => {
														$$renderer.push(`<!---->Getting started `);

														CaretDown($$renderer, {
															class: 'relative top-[1px] ml-1 size-3 transition-transform duration-200 group-data-[state=open]:rotate-180',
															'aria-hidden': 'true'
														});

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

											if (NavigationMenu.Content) {
												$$renderer.push('<!--[-->');

												NavigationMenu.Content($$renderer, {
													class: 'data-[motion=from-end]:animate-enter-from-right data-[motion=from-start]:animate-enter-from-left data-[motion=to-end]:animate-exit-to-right data-[motion=to-start]:animate-exit-to-left data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 bg-background absolute left-0 top-full mt-2 w-full rounded-md border shadow-lg sm:w-auto',
													children: ($$renderer) => {
														$$renderer.push(`<ul class="m-0 grid list-none gap-x-2.5 p-3 sm:w-[600px] sm:grid-flow-col sm:grid-rows-3 sm:p-[22px]"><li class="row-span-3 mb-2 sm:mb-0">`);

														if (NavigationMenu.Link) {
															$$renderer.push('<!--[-->');

															NavigationMenu.Link($$renderer, {
																href: '/',
																class: 'from-muted/50 to-muted bg-linear-to-b outline-hidden flex h-full w-full select-none flex-col justify-end rounded-md p-6 no-underline focus-visible:shadow-md',
																children: ($$renderer) => {
																	$$renderer.push(`<div class="mb-2 mt-4 text-lg font-medium">Bits UI</div> <p class="text-muted-foreground text-sm leading-tight">The headless components for Svelte.</p>`);
																},
																$$slots: { default: true }
															});

															$$renderer.push('<!--]-->');
														} else {
															$$renderer.push('<!--[!-->');
															$$renderer.push('<!--]-->');
														}

														$$renderer.push(`</li> `);

														ListItem($$renderer, {
															href: "/docs",
															title: "Introduction",
															content: "Headless components for Svelte and SvelteKit"
														});

														$$renderer.push(`<!----> `);

														ListItem($$renderer, {
															href: "/docs/getting-started",
															title: "Getting Started",
															content: "How to install and use Bits UI"
														});

														$$renderer.push(`<!----> `);

														ListItem($$renderer, {
															href: "/docs/styling",
															title: "Styling",
															content: "How to style Bits UI components"
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
										value: 'features',
										children: ($$renderer) => {
											if (NavigationMenu.Trigger) {
												$$renderer.push('<!--[-->');

												NavigationMenu.Trigger($$renderer, {
													class: 'hover:text-accent-foreground focus-visible:bg-muted focus-visible:text-accent-foreground data-[state=open]:shadow-mini dark:hover:bg-muted dark:data-[state=open]:bg-muted focus-visible:outline-hidden group inline-flex h-8 w-max items-center justify-center rounded-[7px] bg-transparent px-4 py-2 text-sm font-medium transition-colors hover:bg-white disabled:pointer-events-none disabled:opacity-50 data-[state=open]:bg-white',
													children: ($$renderer) => {
														$$renderer.push(`<!---->Features `);

														CaretDown($$renderer, {
															class: 'relative top-[1px] ml-1 size-3 transition-transform duration-200 group-data-[state=open]:rotate-180',
															'aria-hidden': 'true'
														});

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

											if (NavigationMenu.Content) {
												$$renderer.push('<!--[-->');

												NavigationMenu.Content($$renderer, {
													class: 'data-[motion=from-end]:animate-enter-from-right data-[motion=from-start]:animate-enter-from-left data-[motion=to-end]:animate-exit-to-right data-[motion=to-start]:animate-exit-to-left data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 bg-background absolute left-0 top-full mt-2 w-full rounded-md border shadow-lg sm:w-auto',
													children: ($$renderer) => {
														$$renderer.push(`<div class="relative p-3 sm:w-[500px] sm:p-6">`);

														if (NavigationMenu.Sub) {
															$$renderer.push('<!--[-->');

															NavigationMenu.Sub($$renderer, {
																orientation: 'vertical',
																class: 'w-full',
																children: ($$renderer) => {
																	if (NavigationMenu.List) {
																		$$renderer.push('<!--[-->');

																		NavigationMenu.List($$renderer, {
																			class: 'flex flex-col space-y-1',
																			children: ($$renderer) => {
																				$$renderer.push(`<li><div class="text-muted-foreground px-3 py-2 text-sm font-medium">Components</div></li> <!--[-->`);

																				const each_array_1 = $.ensure_array_like(components);

																				for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
																					let component = each_array_1[$$index_1];

																					if (NavigationMenu.Item) {
																						$$renderer.push('<!--[-->');

																						NavigationMenu.Item($$renderer, {
																							children: ($$renderer) => {
																								ListItem($$renderer, {
																									href: component.href,
																									title: component.title,
																									content: component.description
																								});
																							},
																							$$slots: { default: true }
																						});

																						$$renderer.push('<!--]-->');
																					} else {
																						$$renderer.push('<!--[!-->');
																						$$renderer.push('<!--]-->');
																					}
																				}

																				$$renderer.push(`<!--]--> <div class="flex items-center justify-between">`);
																				SubmenuItem($$renderer, { title: "Utilities", value: "utilities", items: utilities });
																				$$renderer.push(`<!----> `);

																				SubmenuItem($$renderer, {
																					title: "Type Helpers",
																					value: "type-helpers",
																					items: typeHelpers
																				});

																				$$renderer.push(`<!----></div>`);
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

														$$renderer.push(`</div>`);
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
											if (NavigationMenu.Link) {
												$$renderer.push('<!--[-->');

												NavigationMenu.Link($$renderer, {
													class: 'hover:text-accent-foreground focus-visible:bg-muted focus-visible:text-accent-foreground data-[state=open]:shadow-mini dark:hover:bg-muted dark:data-[state=open]:bg-muted focus-visible:outline-hidden group inline-flex h-8 w-max items-center justify-center rounded-[7px] bg-transparent px-4 py-2 text-sm font-medium transition-colors hover:bg-white disabled:pointer-events-none disabled:opacity-50 data-[state=open]:bg-white',
													href: '/docs',
													children: ($$renderer) => {
														$$renderer.push(`<span class="hidden sm:inline">Documentation</span> <span class="inline sm:hidden">Docs</span>`);
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