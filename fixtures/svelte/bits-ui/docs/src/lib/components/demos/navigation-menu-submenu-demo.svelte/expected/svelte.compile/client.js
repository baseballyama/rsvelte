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
	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		let $0 = $.derived(() => cn("hover:bg-muted hover:text-accent-foreground focus-visible:bg-muted focus-visible:text-accent-foreground outline-hidden block select-none space-y-1 rounded-md p-3 leading-none no-underline transition-colors", className()));

		$.component(node, () => NavigationMenu.Link, ($$anchor, NavigationMenu_Link) => {
			NavigationMenu_Link($$anchor, {
				get class() {
					return $.get($0);
				},

				get href() {
					return href();
				},

				children: ($$anchor, $$slotProps) => {
					var fragment_1 = root();
					var div = $.first_child(fragment_1);
					var text = $.only_child(div, true);
					var p = $.sibling(div, 2);
					var text_1 = $.only_child(p, true);

					$.template_effect(() => {
						$.set_text(text, title());
						$.set_text(text_1, content());
					});

					$.append($$anchor, fragment_1);
				},
				$$slots: { default: true }
			});
		});
	}

	$.append($$anchor, fragment);
};

const SubmenuItem = ($$anchor, $$arg0) => {
	let className = () => ($$arg0?.()).className;
	let title = () => ($$arg0?.()).title;
	let value = () => ($$arg0?.()).value;
	let items = () => ($$arg0?.()).items;
	var fragment_2 = $.comment();
	var node_1 = $.first_child(fragment_2);

	$.component(node_1, () => NavigationMenu.Item, ($$anchor, NavigationMenu_Item) => {
		NavigationMenu_Item($$anchor, {
			get value() {
				return value();
			},
			class: 'relative w-full',
			children: ($$anchor, $$slotProps) => {
				var fragment_3 = root_3();
				var node_2 = $.first_child(fragment_3);

				{
					let $0 = $.derived(() => cn("hover:bg-muted hover:text-accent-foreground focus-visible:bg-muted focus-visible:text-accent-foreground data-[state=open]:bg-muted outline-hidden group flex w-full select-none items-center justify-between space-y-1 rounded-md p-3 leading-none no-underline transition-colors", className()));

					$.component(node_2, () => NavigationMenu.Trigger, ($$anchor, NavigationMenu_Trigger) => {
						NavigationMenu_Trigger($$anchor, {
							get class() {
								return $.get($0);
							},

							children: ($$anchor, $$slotProps) => {
								var fragment_4 = root_1();
								var div_1 = $.first_child(fragment_4);
								var text_2 = $.only_child(div_1, true);
								var node_3 = $.sibling(div_1, 2);

								CaretDown(node_3, {
									class: 'ml-auto size-4 transition-transform duration-200 group-data-[state=open]:rotate-180',
									'aria-hidden': 'true'
								});

								$.template_effect(() => $.set_text(text_2, title()));
								$.append($$anchor, fragment_4);
							},
							$$slots: { default: true }
						});
					});
				}

				var node_4 = $.sibling(node_2, 2);

				$.component(node_4, () => NavigationMenu.Content, ($$anchor, NavigationMenu_Content) => {
					NavigationMenu_Content($$anchor, {
						class: 'bg-background data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-right-1 data-[state=open]:slide-in-from-right-1 absolute left-0 top-full z-50 mt-2 w-full min-w-[300px] rounded-md border shadow-lg transition-all duration-200 ease-out',
						children: ($$anchor, $$slotProps) => {
							var ul = root_2();

							$.each(ul, 21, items, (item) => item.title, ($$anchor, item) => {
								ListItem($$anchor, () => ({
									href: $.get(item).href,
									title: $.get(item).title,
									content: $.get(item).description
								}));
							});

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

	$.append($$anchor, fragment_2);
};

var root = $.from_html(`<div class="text-sm font-medium leading-none"> </div> <p class="text-muted-foreground line-clamp-2 text-sm leading-snug"> </p>`, 1);
var root_1 = $.from_html(`<div class="text-sm font-medium leading-none"> </div> <!>`, 1);
var root_2 = $.from_html(`<ul class="grid gap-1 p-2"></ul>`);
var root_3 = $.from_html(`<!> <!>`, 1);
var root_4 = $.from_html(`Getting started <!>`, 1);
var root_5 = $.from_html(`<div class="mb-2 mt-4 text-lg font-medium">Bits UI</div> <p class="text-muted-foreground text-sm leading-tight">The headless components for Svelte.</p>`, 1);
var root_6 = $.from_html(`<ul class="m-0 grid list-none gap-x-2.5 p-3 sm:w-[600px] sm:grid-flow-col sm:grid-rows-3 sm:p-[22px]"><li class="row-span-3 mb-2 sm:mb-0"><!></li> <!> <!> <!></ul>`);
var root_7 = $.from_html(`Features <!>`, 1);
var root_8 = $.from_html(`<li><div class="text-muted-foreground px-3 py-2 text-sm font-medium">Components</div></li> <!> <div class="flex items-center justify-between"><!> <!></div>`, 1);
var root_9 = $.from_html(`<div class="relative p-3 sm:w-[500px] sm:p-6"><!></div>`);
var root_10 = $.from_html(`<span class="hidden sm:inline">Documentation</span> <span class="inline sm:hidden">Docs</span>`, 1);
var root_11 = $.from_html(`<!> <!> <!>`, 1);

export default function Navigation_menu_submenu_demo($$anchor, $$props) {
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

	var fragment_6 = $.comment();
	var node_5 = $.first_child(fragment_6);

	$.component(node_5, () => NavigationMenu.Root, ($$anchor, NavigationMenu_Root) => {
		NavigationMenu_Root($$anchor, {
			class: 'relative z-10 flex w-full justify-center',
			children: ($$anchor, $$slotProps) => {
				var fragment_7 = $.comment();
				var node_6 = $.first_child(fragment_7);

				$.component(node_6, () => NavigationMenu.List, ($$anchor, NavigationMenu_List) => {
					NavigationMenu_List($$anchor, {
						class: 'group flex list-none items-center justify-center p-1',
						children: ($$anchor, $$slotProps) => {
							var fragment_8 = root_11();
							var node_7 = $.first_child(fragment_8);

							$.component(node_7, () => NavigationMenu.Item, ($$anchor, NavigationMenu_Item_1) => {
								NavigationMenu_Item_1($$anchor, {
									value: 'getting-started',
									children: ($$anchor, $$slotProps) => {
										var fragment_9 = root_3();
										var node_8 = $.first_child(fragment_9);

										$.component(node_8, () => NavigationMenu.Trigger, ($$anchor, NavigationMenu_Trigger_1) => {
											NavigationMenu_Trigger_1($$anchor, {
												class: 'hover:text-accent-foreground focus-visible:bg-muted focus-visible:text-accent-foreground data-[state=open]:shadow-mini dark:hover:bg-muted dark:data-[state=open]:bg-muted focus-visible:outline-hidden group inline-flex h-8 w-max items-center justify-center rounded-[7px] bg-transparent px-4 py-2 text-sm font-medium transition-colors hover:bg-white disabled:pointer-events-none disabled:opacity-50 data-[state=open]:bg-white',
												children: ($$anchor, $$slotProps) => {
													$.next();

													var fragment_10 = root_4();
													var node_9 = $.sibling($.first_child(fragment_10));

													CaretDown(node_9, {
														class: 'relative top-[1px] ml-1 size-3 transition-transform duration-200 group-data-[state=open]:rotate-180',
														'aria-hidden': 'true'
													});

													$.append($$anchor, fragment_10);
												},
												$$slots: { default: true }
											});
										});

										var node_10 = $.sibling(node_8, 2);

										$.component(node_10, () => NavigationMenu.Content, ($$anchor, NavigationMenu_Content_1) => {
											NavigationMenu_Content_1($$anchor, {
												class: 'data-[motion=from-end]:animate-enter-from-right data-[motion=from-start]:animate-enter-from-left data-[motion=to-end]:animate-exit-to-right data-[motion=to-start]:animate-exit-to-left data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 bg-background absolute left-0 top-full mt-2 w-full rounded-md border shadow-lg sm:w-auto',
												children: ($$anchor, $$slotProps) => {
													var ul_1 = root_6();
													var li = $.child(ul_1);
													var node_11 = $.child(li);

													$.component(node_11, () => NavigationMenu.Link, ($$anchor, NavigationMenu_Link_1) => {
														NavigationMenu_Link_1($$anchor, {
															href: '/',
															class: 'from-muted/50 to-muted bg-linear-to-b outline-hidden flex h-full w-full select-none flex-col justify-end rounded-md p-6 no-underline focus-visible:shadow-md',
															children: ($$anchor, $$slotProps) => {
																var fragment_11 = root_5();

																$.next(2);
																$.append($$anchor, fragment_11);
															},
															$$slots: { default: true }
														});
													});

													$.reset(li);

													var node_12 = $.sibling(li, 2);

													ListItem(node_12, () => ({
														href: "/docs",
														title: "Introduction",
														content: "Headless components for Svelte and SvelteKit"
													}));

													var node_13 = $.sibling(node_12, 2);

													ListItem(node_13, () => ({
														href: "/docs/getting-started",
														title: "Getting Started",
														content: "How to install and use Bits UI"
													}));

													var node_14 = $.sibling(node_13, 2);

													ListItem(node_14, () => ({
														href: "/docs/styling",
														title: "Styling",
														content: "How to style Bits UI components"
													}));

													$.reset(ul_1);
													$.append($$anchor, ul_1);
												},
												$$slots: { default: true }
											});
										});

										$.append($$anchor, fragment_9);
									},
									$$slots: { default: true }
								});
							});

							var node_15 = $.sibling(node_7, 2);

							$.component(node_15, () => NavigationMenu.Item, ($$anchor, NavigationMenu_Item_2) => {
								NavigationMenu_Item_2($$anchor, {
									value: 'features',
									children: ($$anchor, $$slotProps) => {
										var fragment_12 = root_3();
										var node_16 = $.first_child(fragment_12);

										$.component(node_16, () => NavigationMenu.Trigger, ($$anchor, NavigationMenu_Trigger_2) => {
											NavigationMenu_Trigger_2($$anchor, {
												class: 'hover:text-accent-foreground focus-visible:bg-muted focus-visible:text-accent-foreground data-[state=open]:shadow-mini dark:hover:bg-muted dark:data-[state=open]:bg-muted focus-visible:outline-hidden group inline-flex h-8 w-max items-center justify-center rounded-[7px] bg-transparent px-4 py-2 text-sm font-medium transition-colors hover:bg-white disabled:pointer-events-none disabled:opacity-50 data-[state=open]:bg-white',
												children: ($$anchor, $$slotProps) => {
													$.next();

													var fragment_13 = root_7();
													var node_17 = $.sibling($.first_child(fragment_13));

													CaretDown(node_17, {
														class: 'relative top-[1px] ml-1 size-3 transition-transform duration-200 group-data-[state=open]:rotate-180',
														'aria-hidden': 'true'
													});

													$.append($$anchor, fragment_13);
												},
												$$slots: { default: true }
											});
										});

										var node_18 = $.sibling(node_16, 2);

										$.component(node_18, () => NavigationMenu.Content, ($$anchor, NavigationMenu_Content_2) => {
											NavigationMenu_Content_2($$anchor, {
												class: 'data-[motion=from-end]:animate-enter-from-right data-[motion=from-start]:animate-enter-from-left data-[motion=to-end]:animate-exit-to-right data-[motion=to-start]:animate-exit-to-left data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 bg-background absolute left-0 top-full mt-2 w-full rounded-md border shadow-lg sm:w-auto',
												children: ($$anchor, $$slotProps) => {
													var div_2 = root_9();
													var node_19 = $.child(div_2);

													$.component(node_19, () => NavigationMenu.Sub, ($$anchor, NavigationMenu_Sub) => {
														NavigationMenu_Sub($$anchor, {
															orientation: 'vertical',
															class: 'w-full',
															children: ($$anchor, $$slotProps) => {
																var fragment_14 = $.comment();
																var node_20 = $.first_child(fragment_14);

																$.component(node_20, () => NavigationMenu.List, ($$anchor, NavigationMenu_List_1) => {
																	NavigationMenu_List_1($$anchor, {
																		class: 'flex flex-col space-y-1',
																		children: ($$anchor, $$slotProps) => {
																			var fragment_15 = root_8();
																			var node_21 = $.sibling($.first_child(fragment_15), 2);

																			$.each(node_21, 17, () => components, (component) => component.title, ($$anchor, component) => {
																				var fragment_16 = $.comment();
																				var node_22 = $.first_child(fragment_16);

																				$.component(node_22, () => NavigationMenu.Item, ($$anchor, NavigationMenu_Item_3) => {
																					NavigationMenu_Item_3($$anchor, {
																						children: ($$anchor, $$slotProps) => {
																							ListItem($$anchor, () => ({
																								href: $.get(component).href,
																								title: $.get(component).title,
																								content: $.get(component).description
																							}));
																						},
																						$$slots: { default: true }
																					});
																				});

																				$.append($$anchor, fragment_16);
																			});

																			var div_3 = $.sibling(node_21, 2);
																			var node_23 = $.child(div_3);

																			SubmenuItem(node_23, () => ({ title: "Utilities", value: "utilities", items: utilities }));

																			var node_24 = $.sibling(node_23, 2);

																			SubmenuItem(node_24, () => ({
																				title: "Type Helpers",
																				value: "type-helpers",
																				items: typeHelpers
																			}));

																			$.reset(div_3);
																			$.append($$anchor, fragment_15);
																		},
																		$$slots: { default: true }
																	});
																});

																$.append($$anchor, fragment_14);
															},
															$$slots: { default: true }
														});
													});

													$.reset(div_2);
													$.append($$anchor, div_2);
												},
												$$slots: { default: true }
											});
										});

										$.append($$anchor, fragment_12);
									},
									$$slots: { default: true }
								});
							});

							var node_25 = $.sibling(node_15, 2);

							$.component(node_25, () => NavigationMenu.Item, ($$anchor, NavigationMenu_Item_4) => {
								NavigationMenu_Item_4($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_18 = $.comment();
										var node_26 = $.first_child(fragment_18);

										$.component(node_26, () => NavigationMenu.Link, ($$anchor, NavigationMenu_Link_2) => {
											NavigationMenu_Link_2($$anchor, {
												class: 'hover:text-accent-foreground focus-visible:bg-muted focus-visible:text-accent-foreground data-[state=open]:shadow-mini dark:hover:bg-muted dark:data-[state=open]:bg-muted focus-visible:outline-hidden group inline-flex h-8 w-max items-center justify-center rounded-[7px] bg-transparent px-4 py-2 text-sm font-medium transition-colors hover:bg-white disabled:pointer-events-none disabled:opacity-50 data-[state=open]:bg-white',
												href: '/docs',
												children: ($$anchor, $$slotProps) => {
													var fragment_19 = root_10();

													$.next(2);
													$.append($$anchor, fragment_19);
												},
												$$slots: { default: true }
											});
										});

										$.append($$anchor, fragment_18);
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_8);
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment_7);
			},
			$$slots: { default: true }
		});
	});

	$.append($$anchor, fragment_6);
	$.pop();
}