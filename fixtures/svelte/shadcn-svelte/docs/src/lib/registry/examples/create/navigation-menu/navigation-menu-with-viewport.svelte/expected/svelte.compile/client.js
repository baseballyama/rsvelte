import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as NavigationMenu from "$lib/registry/ui/navigation-menu/index.js";
import { navigationMenuTriggerStyle } from "$lib/registry/ui/navigation-menu/navigation-menu-trigger.svelte";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

const ListItem = ($$anchor, $$arg0) => {
	let title = () => ($$arg0?.()).title;
	let href = () => ($$arg0?.()).href;
	let description = () => ($$arg0?.()).description;
	var li = root_1();
	var node = $.child(li);

	{
		const child = ($$anchor, $$arg0) => {
			let props = () => ($$arg0?.()).props;
			var a = root();

			$.attribute_effect(a, () => ({ ...props(), href: href() }));

			var div = $.child(a);
			var div_1 = $.child(div);
			var text = $.only_child(div_1, true);
			var div_2 = $.sibling(div_1, 2);
			var text_1 = $.only_child(div_2, true);

			$.reset(div);
			$.reset(a);

			$.template_effect(() => {
				$.set_text(text, title());
				$.set_text(text_1, description());
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

var root = $.from_html(`<a><div class="flex flex-col gap-1 text-sm"><div class="leading-none font-medium"> </div> <div class="line-clamp-2 text-muted-foreground"> </div></div></a>`);
var root_1 = $.from_html(`<li><!></li>`);
var root_2 = $.from_html(`<ul class="w-96"><!> <!> <!></ul>`);
var root_3 = $.from_html(`<!> <!>`, 1);
var root_4 = $.from_html(`<ul class="grid w-[400px] gap-1 md:w-[500px] md:grid-cols-2 lg:w-[600px]"></ul>`);
var root_5 = $.from_html(`<a>Documentation</a>`);
var root_6 = $.from_html(`<!> <!> <!>`, 1);

export default function Navigation_menu_with_viewport($$anchor, $$props) {
	$.push($$props, true);

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

	Example($$anchor, {
		title: 'With Viewport',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = $.comment();
			var node_1 = $.first_child(fragment_1);

			$.component(node_1, () => NavigationMenu.Root, ($$anchor, NavigationMenu_Root) => {
				NavigationMenu_Root($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = $.comment();
						var node_2 = $.first_child(fragment_2);

						$.component(node_2, () => NavigationMenu.List, ($$anchor, NavigationMenu_List) => {
							NavigationMenu_List($$anchor, {
								children: ($$anchor, $$slotProps) => {
									var fragment_3 = root_6();
									var node_3 = $.first_child(fragment_3);

									$.component(node_3, () => NavigationMenu.Item, ($$anchor, NavigationMenu_Item) => {
										NavigationMenu_Item($$anchor, {
											children: ($$anchor, $$slotProps) => {
												var fragment_4 = root_3();
												var node_4 = $.first_child(fragment_4);

												$.component(node_4, () => NavigationMenu.Trigger, ($$anchor, NavigationMenu_Trigger) => {
													NavigationMenu_Trigger($$anchor, {
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_2 = $.text('Getting started');

															$.append($$anchor, text_2);
														},
														$$slots: { default: true }
													});
												});

												var node_5 = $.sibling(node_4, 2);

												$.component(node_5, () => NavigationMenu.Content, ($$anchor, NavigationMenu_Content) => {
													NavigationMenu_Content($$anchor, {
														children: ($$anchor, $$slotProps) => {
															var ul = root_2();
															var node_6 = $.child(ul);

															ListItem(node_6, () => ({
																title: "Introduction",
																href: "/docs",
																description: "Re-usable components built with Tailwind CSS."
															}));

															var node_7 = $.sibling(node_6, 2);

															ListItem(node_7, () => ({
																title: "Installation",
																href: "/docs/installation",
																description: "How to install dependencies and structure your app."
															}));

															var node_8 = $.sibling(node_7, 2);

															ListItem(node_8, () => ({
																title: "Typography",
																href: "/docs/primitives/typography",
																description: "Styles for headings, paragraphs, lists...etc"
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

									var node_9 = $.sibling(node_3, 2);

									$.component(node_9, () => NavigationMenu.Item, ($$anchor, NavigationMenu_Item_1) => {
										NavigationMenu_Item_1($$anchor, {
											children: ($$anchor, $$slotProps) => {
												var fragment_5 = root_3();
												var node_10 = $.first_child(fragment_5);

												$.component(node_10, () => NavigationMenu.Trigger, ($$anchor, NavigationMenu_Trigger_1) => {
													NavigationMenu_Trigger_1($$anchor, {
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_3 = $.text('Components');

															$.append($$anchor, text_3);
														},
														$$slots: { default: true }
													});
												});

												var node_11 = $.sibling(node_10, 2);

												$.component(node_11, () => NavigationMenu.Content, ($$anchor, NavigationMenu_Content_1) => {
													NavigationMenu_Content_1($$anchor, {
														children: ($$anchor, $$slotProps) => {
															var ul_1 = root_4();

															$.each(ul_1, 21, () => components, (component) => component.title, ($$anchor, component) => {
																ListItem($$anchor, () => ({
																	title: $.get(component).title,
																	href: $.get(component).href,
																	description: $.get(component).description
																}));
															});

															$.reset(ul_1);
															$.append($$anchor, ul_1);
														},
														$$slots: { default: true }
													});
												});

												$.append($$anchor, fragment_5);
											},
											$$slots: { default: true }
										});
									});

									var node_12 = $.sibling(node_9, 2);

									$.component(node_12, () => NavigationMenu.Item, ($$anchor, NavigationMenu_Item_2) => {
										NavigationMenu_Item_2($$anchor, {
											children: ($$anchor, $$slotProps) => {
												var fragment_7 = $.comment();
												var node_13 = $.first_child(fragment_7);

												{
													const child = ($$anchor, $$arg0) => {
														let props = () => ($$arg0?.()).props;
														var a_1 = root_5();

														$.attribute_effect(a_1, () => ({ ...props(), href: '/docs' }));
														$.append($$anchor, a_1);
													};

													let $0 = $.derived(navigationMenuTriggerStyle);

													$.component(node_13, () => NavigationMenu.Link, ($$anchor, NavigationMenu_Link_1) => {
														NavigationMenu_Link_1($$anchor, {
															get class() {
																return $.get($0);
															},
															child,
															$$slots: { child: true }
														});
													});
												}

												$.append($$anchor, fragment_7);
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
					},
					$$slots: { default: true }
				});
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	$.pop();
}