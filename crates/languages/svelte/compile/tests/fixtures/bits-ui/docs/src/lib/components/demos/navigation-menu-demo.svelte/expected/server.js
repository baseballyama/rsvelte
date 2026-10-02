import * as $ from 'svelte/internal/server';
import { NavigationMenu } from "bits-ui";
import CaretDown from "phosphor-svelte/lib/CaretDown";
import { cn } from "$lib/utils/styles.js";

function ListItem($$renderer, { className, title, content, href }) {
	$$renderer.push(`<li>`);

	if (NavigationMenu.Link) {
		$$renderer.push('<!--[-->');

		NavigationMenu.Link($$renderer, {
			class: cn("hover:bg-muted hover:text-accent-foreground focus:bg-muted focus:text-accent-foreground outline-hidden block select-none space-y-1 rounded-md p-3 leading-none no-underline transition-colors", className),
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

	$$renderer.push(`</li>`);
}

export default function Navigation_menu_demo($$renderer, $$props) {
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
			},

			{
				title: "Scroll Area",
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
													class: 'data-[motion=from-end]:animate-enter-from-right data-[motion=from-start]:animate-enter-from-left data-[motion=to-end]:animate-exit-to-right data-[motion=to-start]:animate-exit-to-left absolute left-0 top-0 w-full sm:w-auto',
													children: ($$renderer) => {
														$$renderer.push(`<ul class="m-0 grid list-none gap-x-2.5 p-3 sm:w-[600px] sm:grid-flow-col sm:grid-rows-3 sm:p-[22px]"><li class="row-span-3 mb-2 sm:mb-0">`);

														if (NavigationMenu.Link) {
															$$renderer.push('<!--[-->');

															NavigationMenu.Link($$renderer, {
																href: '/',
																class: 'from-muted/50 to-muted bg-linear-to-b outline-hidden flex h-full w-full select-none flex-col justify-end rounded-md p-6 no-underline focus:shadow-md',
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
										children: ($$renderer) => {
											if (NavigationMenu.Trigger) {
												$$renderer.push('<!--[-->');

												NavigationMenu.Trigger($$renderer, {
													class: 'hover:text-accent-foreground focus-visible:bg-muted focus-visible:text-accent-foreground data-[state=open]:shadow-mini dark:hover:bg-muted dark:data-[state=open]:bg-muted focus-visible:outline-hidden group inline-flex h-8 w-max items-center justify-center rounded-[7px] bg-transparent px-4 py-2 text-sm font-medium transition-colors hover:bg-white disabled:pointer-events-none disabled:opacity-50 data-[state=open]:bg-white',
													children: ($$renderer) => {
														$$renderer.push(`<!---->Components `);

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
													class: 'data-[motion=from-end]:animate-enter-from-right data-[motion=from-start]:animate-enter-from-left data-[motion=to-end]:animate-exit-to-right data-[motion=to-start]:animate-exit-to-left absolute left-0 top-0 w-full sm:w-auto',
													children: ($$renderer) => {
														$$renderer.push(`<ul class="grid gap-3 p-3 sm:w-[400px] sm:p-6 md:w-[500px] md:grid-cols-2 lg:w-[600px]"><!--[-->`);

														const each_array = $.ensure_array_like(components);

														for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
															let component = each_array[$$index];

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
											if (NavigationMenu.Link) {
												$$renderer.push('<!--[-->');

												NavigationMenu.Link($$renderer, {
													class: 'hover:text-accent-foreground focus:bg-muted focus:text-accent-foreground data-[state=open]:shadow-mini dark:hover:bg-muted dark:data-[state=open]:bg-muted focus:outline-hidden group inline-flex h-8 w-max items-center justify-center rounded-[7px] bg-transparent px-4 py-2 text-sm font-medium transition-colors hover:bg-white disabled:pointer-events-none disabled:opacity-50 data-[state=open]:bg-white',
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

								$$renderer.push(` `);

								if (NavigationMenu.Indicator) {
									$$renderer.push('<!--[-->');

									NavigationMenu.Indicator($$renderer, {
										class: 'data-[state=hidden]:animate-fade-out data-[state=visible]:animate-fade-in top-full z-10 flex h-2.5 items-end justify-center overflow-hidden opacity-100 transition-[all,transform_250ms_ease] duration-200 data-[state=hidden]:opacity-0',
										children: ($$renderer) => {
											$$renderer.push(`<div class="bg-border relative top-[70%] size-2.5 rotate-[45deg] rounded-tl-[2px]"></div>`);
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

					$$renderer.push(` <div class="perspective-[2000px] absolute left-0 top-full flex w-full justify-center">`);

					if (NavigationMenu.Viewport) {
						$$renderer.push('<!--[-->');

						NavigationMenu.Viewport($$renderer, {
							class: 'text-popover-foreground bg-background data-[state=closed]:animate-scale-out data-[state=open]:animate-scale-in relative mt-2.5 h-[var(--bits-navigation-menu-viewport-height)] w-full origin-[top_center] overflow-hidden rounded-md border shadow-lg transition-[width,_height] duration-200 sm:w-[var(--bits-navigation-menu-viewport-width)] '
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
	});
}