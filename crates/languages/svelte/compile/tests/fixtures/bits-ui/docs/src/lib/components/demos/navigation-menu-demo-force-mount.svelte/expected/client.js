import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { NavigationMenu } from "bits-ui";
import CaretDown from "phosphor-svelte/lib/CaretDown";
import { cn } from "$lib/utils/styles.js";

const ListItem = ($$anchor, $$arg0) => {
	let className = () => ($$arg0?.()).className;
	let title = () => ($$arg0?.()).title;
	let content = () => ($$arg0?.()).content;
	let href = () => ($$arg0?.()).href;
	var li = root_1();
	var node = $.child(li);

	{
		let $0 = $.derived(() => cn("hover:bg-muted hover:text-accent-foreground focus:bg-muted focus:text-accent-foreground outline-hidden block select-none space-y-1 rounded-md p-3 leading-none no-underline transition-colors", className()));

		$.component(node, () => NavigationMenu.Link, ($$anchor, NavigationMenu_Link) => {
			NavigationMenu_Link($$anchor, {
				get class() {
					return $.get($0);
				},

				get href() {
					return href();
				},

				children: ($$anchor, $$slotProps) => {
					var fragment = root();
					var div = $.first_child(fragment);
					var text = $.only_child(div, true);
					var p = $.sibling(div, 2);
					var text_1 = $.only_child(p, true);

					$.template_effect(() => {
						$.set_text(text, title());
						$.set_text(text_1, content());
					});

					$.append($$anchor, fragment);
				},
				$$slots: { default: true }
			});
		});
	}

	$.reset(li);
	$.append($$anchor, li);
};

var root = $.from_html(`<div class="text-sm font-medium leading-none"> </div> <p class="text-muted-foreground line-clamp-2 text-sm leading-snug"> </p>`, 1);
var root_1 = $.from_html(`<li><!></li>`);
var root_2 = $.from_html(`Getting started <!>`, 1);
var root_3 = $.from_html(`<div class="mb-2 mt-4 text-lg font-medium">Bits UI</div> <p class="text-muted-foreground text-sm leading-tight">The headless components for Svelte.</p>`, 1);
var root_4 = $.from_html(`<ul class="m-0 grid list-none gap-x-2.5 p-3 sm:w-[600px] sm:grid-flow-col sm:grid-rows-3 sm:p-[22px]"><li class="row-span-3 mb-2 sm:mb-0"><!></li> <!> <!> <!></ul>`);
var root_5 = $.from_html(`<!> <!>`, 1);
var root_6 = $.from_html(`Components <!>`, 1);
var root_7 = $.from_html(`<ul class="grid gap-3 p-3 sm:w-[400px] sm:p-6 md:w-[500px] md:grid-cols-2 lg:w-[600px]"></ul>`);
var root_8 = $.from_html(`<span class="hidden sm:inline">Documentation</span> <span class="inline sm:hidden">Docs</span>`, 1);
var root_9 = $.from_html(`<div class="bg-border relative top-[70%] size-2.5 rotate-[45deg] rounded-tl-[2px]"></div>`);
var root_10 = $.from_html(`<!> <!> <!> <!>`, 1);
var root_11 = $.from_html(`<!> <div class="perspective-[2000px] absolute left-0 top-full flex w-full justify-center"><!></div>`, 1);

export default function Navigation_menu_demo_force_mount($$anchor, $$props) {
	$.push($$props, true);

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

	var fragment_1 = $.comment();
	var node_1 = $.first_child(fragment_1);

	$.component(node_1, () => NavigationMenu.Root, ($$anchor, NavigationMenu_Root) => {
		NavigationMenu_Root($$anchor, {
			class: 'relative z-10 flex w-full justify-center',
			children: ($$anchor, $$slotProps) => {
				var fragment_2 = root_11();
				var node_2 = $.first_child(fragment_2);

				$.component(node_2, () => NavigationMenu.List, ($$anchor, NavigationMenu_List) => {
					NavigationMenu_List($$anchor, {
						class: 'group flex list-none items-center justify-center p-1',
						children: ($$anchor, $$slotProps) => {
							var fragment_3 = root_10();
							var node_3 = $.first_child(fragment_3);

							$.component(node_3, () => NavigationMenu.Item, ($$anchor, NavigationMenu_Item) => {
								NavigationMenu_Item($$anchor, {
									value: 'getting-started',
									children: ($$anchor, $$slotProps) => {
										var fragment_4 = root_5();
										var node_4 = $.first_child(fragment_4);

										$.component(node_4, () => NavigationMenu.Trigger, ($$anchor, NavigationMenu_Trigger) => {
											NavigationMenu_Trigger($$anchor, {
												class: 'hover:text-accent-foreground focus:bg-muted focus:text-accent-foreground data-[state=open]:shadow-mini dark:hover:bg-muted dark:data-[state=open]:bg-muted focus:outline-hidden group inline-flex h-8 w-max items-center justify-center rounded-[7px] bg-transparent px-4 py-2 text-sm font-medium transition-colors hover:bg-white disabled:pointer-events-none disabled:opacity-50 data-[state=open]:bg-white',
												children: ($$anchor, $$slotProps) => {
													$.next();

													var fragment_5 = root_2();
													var node_5 = $.sibling($.first_child(fragment_5));

													CaretDown(node_5, {
														class: 'relative top-[1px] ml-1 size-3 transition-transform duration-200 group-data-[state=open]:rotate-180',
														'aria-hidden': 'true'
													});

													$.append($$anchor, fragment_5);
												},
												$$slots: { default: true }
											});
										});

										var node_6 = $.sibling(node_4, 2);

										$.component(node_6, () => NavigationMenu.Content, ($$anchor, NavigationMenu_Content) => {
											NavigationMenu_Content($$anchor, {
												class: 'data-[motion=from-end]:animate-enter-from-right data-[motion=from-start]:animate-enter-from-left data-[motion=to-end]:animate-exit-to-right data-[motion=to-start]:animate-exit-to-left absolute left-0 top-0 w-full data-[state=closed]:hidden sm:w-auto',
												forceMount: true,
												children: ($$anchor, $$slotProps) => {
													var ul = root_4();
													var li_1 = $.child(ul);
													var node_7 = $.child(li_1);

													$.component(node_7, () => NavigationMenu.Link, ($$anchor, NavigationMenu_Link_1) => {
														NavigationMenu_Link_1($$anchor, {
															href: '/',
															class: 'from-muted/50 to-muted bg-linear-to-b outline-hidden flex h-full w-full select-none flex-col justify-end rounded-md p-6 no-underline focus:shadow-md',
															children: ($$anchor, $$slotProps) => {
																var fragment_6 = root_3();

																$.next(2);
																$.append($$anchor, fragment_6);
															},
															$$slots: { default: true }
														});
													});

													$.reset(li_1);

													var node_8 = $.sibling(li_1, 2);

													ListItem(node_8, () => ({
														href: "/docs",
														title: "Introduction",
														content: "Headless components for Svelte and SvelteKit"
													}));

													var node_9 = $.sibling(node_8, 2);

													ListItem(node_9, () => ({
														href: "/docs/getting-started",
														title: "Getting Started",
														content: "How to install and use Bits UI"
													}));

													var node_10 = $.sibling(node_9, 2);

													ListItem(node_10, () => ({
														href: "/docs/styling",
														title: "Styling",
														content: "How to style Bits UI components"
													}));

													$.reset(ul);
													$.append($$anchor, ul);
												},
												$$slots: { default: true }
											});
										});

										$.append($$anchor, fragment_4);
									},
									$$slots: { default: true }
								});
							});

							var node_11 = $.sibling(node_3, 2);

							$.component(node_11, () => NavigationMenu.Item, ($$anchor, NavigationMenu_Item_1) => {
								NavigationMenu_Item_1($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_7 = root_5();
										var node_12 = $.first_child(fragment_7);

										$.component(node_12, () => NavigationMenu.Trigger, ($$anchor, NavigationMenu_Trigger_1) => {
											NavigationMenu_Trigger_1($$anchor, {
												class: 'hover:text-accent-foreground focus:bg-muted focus:text-accent-foreground data-[state=open]:shadow-mini dark:hover:bg-muted dark:data-[state=open]:bg-muted focus:outline-hidden group inline-flex h-8 w-max items-center justify-center rounded-[7px] bg-transparent px-4 py-2 text-sm font-medium transition-colors hover:bg-white disabled:pointer-events-none disabled:opacity-50 data-[state=open]:bg-white',
												children: ($$anchor, $$slotProps) => {
													$.next();

													var fragment_8 = root_6();
													var node_13 = $.sibling($.first_child(fragment_8));

													CaretDown(node_13, {
														class: 'relative top-[1px] ml-1 size-3 transition-transform duration-200 group-data-[state=open]:rotate-180',
														'aria-hidden': 'true'
													});

													$.append($$anchor, fragment_8);
												},
												$$slots: { default: true }
											});
										});

										var node_14 = $.sibling(node_12, 2);

										$.component(node_14, () => NavigationMenu.Content, ($$anchor, NavigationMenu_Content_1) => {
											NavigationMenu_Content_1($$anchor, {
												forceMount: true,
												class: 'data-[motion=from-end]:animate-enter-from-right data-[motion=from-start]:animate-enter-from-left data-[motion=to-end]:animate-exit-to-right data-[motion=to-start]:animate-exit-to-left absolute left-0 top-0 w-full data-[state=closed]:hidden sm:w-auto',
												children: ($$anchor, $$slotProps) => {
													var ul_1 = root_7();

													$.each(ul_1, 21, () => components, (component) => component.title, ($$anchor, component) => {
														ListItem($$anchor, () => ({
															href: $.get(component).href,
															title: $.get(component).title,
															content: $.get(component).description
														}));
													});

													$.reset(ul_1);
													$.append($$anchor, ul_1);
												},
												$$slots: { default: true }
											});
										});

										$.append($$anchor, fragment_7);
									},
									$$slots: { default: true }
								});
							});

							var node_15 = $.sibling(node_11, 2);

							$.component(node_15, () => NavigationMenu.Item, ($$anchor, NavigationMenu_Item_2) => {
								NavigationMenu_Item_2($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_10 = $.comment();
										var node_16 = $.first_child(fragment_10);

										$.component(node_16, () => NavigationMenu.Link, ($$anchor, NavigationMenu_Link_2) => {
											NavigationMenu_Link_2($$anchor, {
												class: 'hover:text-accent-foreground focus:bg-muted focus:text-accent-foreground data-[state=open]:shadow-mini dark:hover:bg-muted dark:data-[state=open]:bg-muted focus:outline-hidden group inline-flex h-8 w-max items-center justify-center rounded-[7px] bg-transparent px-4 py-2 text-sm font-medium transition-colors hover:bg-white disabled:pointer-events-none disabled:opacity-50 data-[state=open]:bg-white',
												href: '/docs',
												children: ($$anchor, $$slotProps) => {
													var fragment_11 = root_8();

													$.next(2);
													$.append($$anchor, fragment_11);
												},
												$$slots: { default: true }
											});
										});

										$.append($$anchor, fragment_10);
									},
									$$slots: { default: true }
								});
							});

							var node_17 = $.sibling(node_15, 2);

							$.component(node_17, () => NavigationMenu.Indicator, ($$anchor, NavigationMenu_Indicator) => {
								NavigationMenu_Indicator($$anchor, {
									class: 'data-[state=hidden]:animate-fade-out data-[state=visible]:animate-fade-in top-full z-10 flex h-2.5 items-end justify-center overflow-hidden opacity-100 transition-[all,transform_250ms_ease] duration-200 data-[state=hidden]:opacity-0',
									children: ($$anchor, $$slotProps) => {
										var div_1 = root_9();

										$.append($$anchor, div_1);
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_3);
						},
						$$slots: { default: true }
					});
				});

				var div_2 = $.sibling(node_2, 2);
				var node_18 = $.child(div_2);

				$.component(node_18, () => NavigationMenu.Viewport, ($$anchor, NavigationMenu_Viewport) => {
					NavigationMenu_Viewport($$anchor, {
						forceMount: true,
						class: 'text-popover-foreground bg-background data-[state=closed]:animate-scale-out data-[state=open]:animate-scale-in relative mt-2.5 h-[var(--bits-navigation-menu-viewport-height)] w-full origin-[top_center] overflow-hidden rounded-md border shadow-lg transition-[width,_height] duration-200 data-[state=closed]:hidden sm:w-[var(--bits-navigation-menu-viewport-width)]'
					});
				});

				$.reset(div_2);
				$.append($$anchor, fragment_2);
			},
			$$slots: { default: true }
		});
	});

	$.append($$anchor, fragment_1);
	$.pop();
}