import * as $ from 'svelte/internal/server';
import * as NavigationMenu from "$lib/registry/ui/navigation-menu/index.js";
import { navigationMenuTriggerStyle } from "$lib/registry/ui/navigation-menu/navigation-menu-trigger.svelte";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

function ListItem($$renderer, { title, href, description }) {
	$$renderer.push(`<li>`);

	{
		function child($$renderer, { props }) {
			$$renderer.push(`<a${$.attributes({ ...props, href })}><div class="flex flex-col gap-1 text-sm"><div class="leading-none font-medium">${$.escape(title)}</div> <div class="line-clamp-2 text-muted-foreground">${$.escape(description)}</div></div></a>`);
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

export default function Navigation_menu_with_viewport($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const components = [
			{
				title: "Alert Dialog",
				href: "/docs/primitives/alert-dialog",
				description: "A modal dialog that interrupts the user with important content and expects a response."
			},

			{
				title: "Hover Card",
				href: "/docs/primitives/hover-card",
				description: "For sighted users to preview content available behind a link."
			},

			{
				title: "Progress",
				href: "/docs/primitives/progress",
				description: "Displays an indicator showing the completion progress of a task, typically displayed as a progress bar."
			},

			{
				title: "Scroll-area",
				href: "/docs/primitives/scroll-area",
				description: "Visually or semantically separates content."
			},

			{
				title: "Tabs",
				href: "/docs/primitives/tabs",
				description: "A set of layered sections of content—known as tab panels—that are displayed one at a time."
			},

			{
				title: "Tooltip",
				href: "/docs/primitives/tooltip",
				description: "A popup that displays information related to an element when the element receives keyboard focus or the mouse hovers over it."
			}
		];

		Example($$renderer, {
			title: 'With Viewport',
			children: ($$renderer) => {
				if (NavigationMenu.Root) {
					$$renderer.push('<!--[-->');

					NavigationMenu.Root($$renderer, {
						children: ($$renderer) => {
							if (NavigationMenu.List) {
								$$renderer.push('<!--[-->');

								NavigationMenu.List($$renderer, {
									children: ($$renderer) => {
										if (NavigationMenu.Item) {
											$$renderer.push('<!--[-->');

											NavigationMenu.Item($$renderer, {
												children: ($$renderer) => {
													if (NavigationMenu.Trigger) {
														$$renderer.push('<!--[-->');

														NavigationMenu.Trigger($$renderer, {
															children: ($$renderer) => {
																$$renderer.push(`<!---->Getting started`);
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
																$$renderer.push(`<ul class="w-96">`);

																ListItem($$renderer, {
																	title: "Introduction",
																	href: "/docs",
																	description: "Re-usable components built with Tailwind CSS."
																});

																$$renderer.push(`<!----> `);

																ListItem($$renderer, {
																	title: "Installation",
																	href: "/docs/installation",
																	description: "How to install dependencies and structure your app."
																});

																$$renderer.push(`<!----> `);

																ListItem($$renderer, {
																	title: "Typography",
																	href: "/docs/primitives/typography",
																	description: "Styles for headings, paragraphs, lists...etc"
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
																$$renderer.push(`<ul class="grid w-[400px] gap-1 md:w-[500px] md:grid-cols-2 lg:w-[600px]"><!--[-->`);

																const each_array = $.ensure_array_like(components);

																for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
																	let component = each_array[$$index];

																	ListItem($$renderer, {
																		title: component.title,
																		href: component.href,
																		description: component.description
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