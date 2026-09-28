import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import CircleIcon from "@lucide/svelte/icons/circle";
import CircleCheckIcon from "@lucide/svelte/icons/circle-check";
import CircleHelpIcon from "@lucide/svelte/icons/circle-help";
import * as NavigationMenu from "$lib/registry/ui/navigation-menu/index.js";
import { IsMobile } from "$lib/registry/hooks/is-mobile.svelte.js";
import { navigationMenuTriggerStyle } from "$lib/registry/ui/navigation-menu/navigation-menu-trigger.svelte";
import { cn } from "$lib/utils.js";

const ListItem = ($$anchor, $$arg0) => {
	let title = () => ($$arg0?.()).title;
	let content = () => ($$arg0?.()).content;
	let href = () => ($$arg0?.()).href;
	let className = () => ($$arg0?.()).class;
	let restProps = () => $.exclude_from_object($$arg0?.(), ['title', 'content', 'href', 'class']);
	var li = root_1();
	var node = $.child(li);

	{
		const child = ($$anchor) => {
			var a = root();

			$.attribute_effect(a, ($0) => ({ href: href(), class: $0, ...restProps() }), [
				() => cn("block space-y-1 rounded-md p-3 leading-none no-underline transition-colors outline-none select-none hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground", className())
			]);

			var div = $.child(a);
			var text = $.only_child(div, true);
			var p = $.sibling(div, 2);
			var text_1 = $.only_child(p, true);

			$.reset(a);

			$.template_effect(() => {
				$.set_text(text, title());
				$.set_text(text_1, content());
			});

			$.append($$anchor, a);
		};

		$.component(node, () => NavigationMenu.Link, ($$anchor, NavigationMenu_Link) => {
			NavigationMenu_Link($$anchor, { child, $$slots: { child: true } });
		});
	}

	$.reset(li);
	$.append($$anchor, li);
};

var root = $.from_html(`<a><div class="text-sm leading-none font-medium"> </div> <p class="line-clamp-2 text-sm leading-snug text-muted-foreground"> </p></a>`);
var root_1 = $.from_html(`<li><!></li>`);
var root_2 = $.from_html(`<a><div class="mt-4 mb-2 text-lg font-medium">shadcn-svelte</div> <p class="text-sm leading-tight text-muted-foreground">Beautifully designed components built with Tailwind CSS.</p></a>`);
var root_3 = $.from_html(`<ul class="grid gap-2 p-2 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]"><li class="row-span-3"><!></li> <!> <!> <!></ul>`);
var root_4 = $.from_html(`<!> <!>`, 1);
var root_5 = $.from_html(`<ul class="grid w-[300px] gap-2 p-2 sm:w-[400px] md:w-[500px] md:grid-cols-2 lg:w-[600px]"></ul>`);
var root_6 = $.from_html(`<a href="/docs">Docs</a>`);
var root_7 = $.from_html(`<div class="font-medium">Components</div> <div class="text-muted-foreground">Browse all components in the library.</div>`, 1);
var root_8 = $.from_html(`<div class="font-medium">Documentation</div> <div class="text-muted-foreground">Learn how to use the library.</div>`, 1);
var root_9 = $.from_html(`<div class="font-medium">Blog</div> <div class="text-muted-foreground">Read our latest blog posts.</div>`, 1);
var root_10 = $.from_html(`<ul class="grid w-[300px] gap-4 p-2"><li><!> <!> <!></li></ul>`);
var root_11 = $.from_html(`<ul class="grid w-[200px] gap-4 p-2"><li><!> <!> <!></li></ul>`);
var root_12 = $.from_html(`<!> Backlog`, 1);
var root_13 = $.from_html(`<!> To Do`, 1);
var root_14 = $.from_html(`<!> Done`, 1);
var root_15 = $.from_html(`<!> <!> <!> <!> <!> <!>`, 1);

export default function Navigation_menu_demo($$anchor, $$props) {
	$.push($$props, true);

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

	var fragment = $.comment();
	var node_1 = $.first_child(fragment);

	$.component(node_1, () => NavigationMenu.Root, ($$anchor, NavigationMenu_Root) => {
		NavigationMenu_Root($$anchor, {
			get viewport() {
				return isMobile.current;
			},

			children: ($$anchor, $$slotProps) => {
				var fragment_1 = $.comment();
				var node_2 = $.first_child(fragment_1);

				$.component(node_2, () => NavigationMenu.List, ($$anchor, NavigationMenu_List) => {
					NavigationMenu_List($$anchor, {
						class: 'flex-wrap',
						children: ($$anchor, $$slotProps) => {
							var fragment_2 = root_15();
							var node_3 = $.first_child(fragment_2);

							$.component(node_3, () => NavigationMenu.Item, ($$anchor, NavigationMenu_Item) => {
								NavigationMenu_Item($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_3 = root_4();
										var node_4 = $.first_child(fragment_3);

										$.component(node_4, () => NavigationMenu.Trigger, ($$anchor, NavigationMenu_Trigger) => {
											NavigationMenu_Trigger($$anchor, {
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_2 = $.text('Home');

													$.append($$anchor, text_2);
												},
												$$slots: { default: true }
											});
										});

										var node_5 = $.sibling(node_4, 2);

										$.component(node_5, () => NavigationMenu.Content, ($$anchor, NavigationMenu_Content) => {
											NavigationMenu_Content($$anchor, {
												children: ($$anchor, $$slotProps) => {
													var ul = root_3();
													var li_1 = $.child(ul);
													var node_6 = $.child(li_1);

													{
														const child = ($$anchor, $$arg0) => {
															let props = () => ($$arg0?.()).props;
															var a_1 = root_2();

															$.attribute_effect(a_1, () => ({ ...props(), href: '/' }));
															$.append($$anchor, a_1);
														};

														$.component(node_6, () => NavigationMenu.Link, ($$anchor, NavigationMenu_Link_1) => {
															NavigationMenu_Link_1($$anchor, {
																class: 'flex h-full w-full flex-col justify-end rounded-md bg-linear-to-b from-muted/50 to-muted p-4 no-underline outline-hidden select-none focus:shadow-md md:p-6',
																child,
																$$slots: { child: true }
															});
														});
													}

													$.reset(li_1);

													var node_7 = $.sibling(li_1, 2);

													ListItem(node_7, () => ({
														href: "/docs",
														title: "Introduction",
														content: "Re-usable components built using Bits UI and Tailwind CSS."
													}));

													var node_8 = $.sibling(node_7, 2);

													ListItem(node_8, () => ({
														href: "/docs/installation",
														title: "Installation",
														content: "How to install dependencies and structure your app."
													}));

													var node_9 = $.sibling(node_8, 2);

													ListItem(node_9, () => ({
														href: "/docs/components/typography",
														title: "Typography",
														content: "Styles for headings, paragraphs, lists...etc"
													}));

													$.reset(ul);
													$.append($$anchor, ul);
												},
												$$slots: { default: true }
											});
										});

										$.append($$anchor, fragment_3);
									},
									$$slots: { default: true }
								});
							});

							var node_10 = $.sibling(node_3, 2);

							$.component(node_10, () => NavigationMenu.Item, ($$anchor, NavigationMenu_Item_1) => {
								NavigationMenu_Item_1($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_4 = root_4();
										var node_11 = $.first_child(fragment_4);

										$.component(node_11, () => NavigationMenu.Trigger, ($$anchor, NavigationMenu_Trigger_1) => {
											NavigationMenu_Trigger_1($$anchor, {
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_3 = $.text('Components');

													$.append($$anchor, text_3);
												},
												$$slots: { default: true }
											});
										});

										var node_12 = $.sibling(node_11, 2);

										$.component(node_12, () => NavigationMenu.Content, ($$anchor, NavigationMenu_Content_1) => {
											NavigationMenu_Content_1($$anchor, {
												children: ($$anchor, $$slotProps) => {
													var ul_1 = root_5();

													$.each(ul_1, 21, () => components, $.index, ($$anchor, component) => {
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

										$.append($$anchor, fragment_4);
									},
									$$slots: { default: true }
								});
							});

							var node_13 = $.sibling(node_10, 2);

							$.component(node_13, () => NavigationMenu.Item, ($$anchor, NavigationMenu_Item_2) => {
								NavigationMenu_Item_2($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_6 = $.comment();
										var node_14 = $.first_child(fragment_6);

										{
											const child = ($$anchor) => {
												var a_2 = root_6();

												$.template_effect(($0) => $.set_class(a_2, 1, $0), [() => $.clsx(navigationMenuTriggerStyle())]);
												$.append($$anchor, a_2);
											};

											$.component(node_14, () => NavigationMenu.Link, ($$anchor, NavigationMenu_Link_2) => {
												NavigationMenu_Link_2($$anchor, { child, $$slots: { child: true } });
											});
										}

										$.append($$anchor, fragment_6);
									},
									$$slots: { default: true }
								});
							});

							var node_15 = $.sibling(node_13, 2);

							$.component(node_15, () => NavigationMenu.Item, ($$anchor, NavigationMenu_Item_3) => {
								NavigationMenu_Item_3($$anchor, {
									class: 'hidden md:block',
									children: ($$anchor, $$slotProps) => {
										var fragment_7 = root_4();
										var node_16 = $.first_child(fragment_7);

										$.component(node_16, () => NavigationMenu.Trigger, ($$anchor, NavigationMenu_Trigger_2) => {
											NavigationMenu_Trigger_2($$anchor, {
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_4 = $.text('List');

													$.append($$anchor, text_4);
												},
												$$slots: { default: true }
											});
										});

										var node_17 = $.sibling(node_16, 2);

										$.component(node_17, () => NavigationMenu.Content, ($$anchor, NavigationMenu_Content_2) => {
											NavigationMenu_Content_2($$anchor, {
												children: ($$anchor, $$slotProps) => {
													var ul_2 = root_10();
													var li_2 = $.child(ul_2);
													var node_18 = $.child(li_2);

													$.component(node_18, () => NavigationMenu.Link, ($$anchor, NavigationMenu_Link_3) => {
														NavigationMenu_Link_3($$anchor, {
															href: '##',
															children: ($$anchor, $$slotProps) => {
																var fragment_8 = root_7();

																$.next(2);
																$.append($$anchor, fragment_8);
															},
															$$slots: { default: true }
														});
													});

													var node_19 = $.sibling(node_18, 2);

													$.component(node_19, () => NavigationMenu.Link, ($$anchor, NavigationMenu_Link_4) => {
														NavigationMenu_Link_4($$anchor, {
															href: '##',
															children: ($$anchor, $$slotProps) => {
																var fragment_9 = root_8();

																$.next(2);
																$.append($$anchor, fragment_9);
															},
															$$slots: { default: true }
														});
													});

													var node_20 = $.sibling(node_19, 2);

													$.component(node_20, () => NavigationMenu.Link, ($$anchor, NavigationMenu_Link_5) => {
														NavigationMenu_Link_5($$anchor, {
															href: '##',
															children: ($$anchor, $$slotProps) => {
																var fragment_10 = root_9();

																$.next(2);
																$.append($$anchor, fragment_10);
															},
															$$slots: { default: true }
														});
													});

													$.reset(li_2);
													$.reset(ul_2);
													$.append($$anchor, ul_2);
												},
												$$slots: { default: true }
											});
										});

										$.append($$anchor, fragment_7);
									},
									$$slots: { default: true }
								});
							});

							var node_21 = $.sibling(node_15, 2);

							$.component(node_21, () => NavigationMenu.Item, ($$anchor, NavigationMenu_Item_4) => {
								NavigationMenu_Item_4($$anchor, {
									class: 'hidden md:block',
									children: ($$anchor, $$slotProps) => {
										var fragment_11 = root_4();
										var node_22 = $.first_child(fragment_11);

										$.component(node_22, () => NavigationMenu.Trigger, ($$anchor, NavigationMenu_Trigger_3) => {
											NavigationMenu_Trigger_3($$anchor, {
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_5 = $.text('Simple');

													$.append($$anchor, text_5);
												},
												$$slots: { default: true }
											});
										});

										var node_23 = $.sibling(node_22, 2);

										$.component(node_23, () => NavigationMenu.Content, ($$anchor, NavigationMenu_Content_3) => {
											NavigationMenu_Content_3($$anchor, {
												children: ($$anchor, $$slotProps) => {
													var ul_3 = root_11();
													var li_3 = $.child(ul_3);
													var node_24 = $.child(li_3);

													$.component(node_24, () => NavigationMenu.Link, ($$anchor, NavigationMenu_Link_6) => {
														NavigationMenu_Link_6($$anchor, {
															href: '##',
															children: ($$anchor, $$slotProps) => {
																$.next();

																var text_6 = $.text('Components');

																$.append($$anchor, text_6);
															},
															$$slots: { default: true }
														});
													});

													var node_25 = $.sibling(node_24, 2);

													$.component(node_25, () => NavigationMenu.Link, ($$anchor, NavigationMenu_Link_7) => {
														NavigationMenu_Link_7($$anchor, {
															href: '##',
															children: ($$anchor, $$slotProps) => {
																$.next();

																var text_7 = $.text('Documentation');

																$.append($$anchor, text_7);
															},
															$$slots: { default: true }
														});
													});

													var node_26 = $.sibling(node_25, 2);

													$.component(node_26, () => NavigationMenu.Link, ($$anchor, NavigationMenu_Link_8) => {
														NavigationMenu_Link_8($$anchor, {
															href: '##',
															children: ($$anchor, $$slotProps) => {
																$.next();

																var text_8 = $.text('Blocks');

																$.append($$anchor, text_8);
															},
															$$slots: { default: true }
														});
													});

													$.reset(li_3);
													$.reset(ul_3);
													$.append($$anchor, ul_3);
												},
												$$slots: { default: true }
											});
										});

										$.append($$anchor, fragment_11);
									},
									$$slots: { default: true }
								});
							});

							var node_27 = $.sibling(node_21, 2);

							$.component(node_27, () => NavigationMenu.Item, ($$anchor, NavigationMenu_Item_5) => {
								NavigationMenu_Item_5($$anchor, {
									class: 'hidden md:block',
									children: ($$anchor, $$slotProps) => {
										var fragment_12 = root_4();
										var node_28 = $.first_child(fragment_12);

										$.component(node_28, () => NavigationMenu.Trigger, ($$anchor, NavigationMenu_Trigger_4) => {
											NavigationMenu_Trigger_4($$anchor, {
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_9 = $.text('With Icon');

													$.append($$anchor, text_9);
												},
												$$slots: { default: true }
											});
										});

										var node_29 = $.sibling(node_28, 2);

										$.component(node_29, () => NavigationMenu.Content, ($$anchor, NavigationMenu_Content_4) => {
											NavigationMenu_Content_4($$anchor, {
												children: ($$anchor, $$slotProps) => {
													var ul_4 = root_11();
													var li_4 = $.child(ul_4);
													var node_30 = $.child(li_4);

													$.component(node_30, () => NavigationMenu.Link, ($$anchor, NavigationMenu_Link_9) => {
														NavigationMenu_Link_9($$anchor, {
															href: '##',
															class: 'flex-row items-center gap-2',
															children: ($$anchor, $$slotProps) => {
																var fragment_13 = root_12();
																var node_31 = $.first_child(fragment_13);

																CircleHelpIcon(node_31, {});
																$.next();
																$.append($$anchor, fragment_13);
															},
															$$slots: { default: true }
														});
													});

													var node_32 = $.sibling(node_30, 2);

													$.component(node_32, () => NavigationMenu.Link, ($$anchor, NavigationMenu_Link_10) => {
														NavigationMenu_Link_10($$anchor, {
															href: '##',
															class: 'flex-row items-center gap-2',
															children: ($$anchor, $$slotProps) => {
																var fragment_14 = root_13();
																var node_33 = $.first_child(fragment_14);

																CircleIcon(node_33, {});
																$.next();
																$.append($$anchor, fragment_14);
															},
															$$slots: { default: true }
														});
													});

													var node_34 = $.sibling(node_32, 2);

													$.component(node_34, () => NavigationMenu.Link, ($$anchor, NavigationMenu_Link_11) => {
														NavigationMenu_Link_11($$anchor, {
															href: '##',
															class: 'flex-row items-center gap-2',
															children: ($$anchor, $$slotProps) => {
																var fragment_15 = root_14();
																var node_35 = $.first_child(fragment_15);

																CircleCheckIcon(node_35, {});
																$.next();
																$.append($$anchor, fragment_15);
															},
															$$slots: { default: true }
														});
													});

													$.reset(li_4);
													$.reset(ul_4);
													$.append($$anchor, ul_4);
												},
												$$slots: { default: true }
											});
										});

										$.append($$anchor, fragment_12);
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_2);
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		});
	});

	$.append($$anchor, fragment);
	$.pop();
}