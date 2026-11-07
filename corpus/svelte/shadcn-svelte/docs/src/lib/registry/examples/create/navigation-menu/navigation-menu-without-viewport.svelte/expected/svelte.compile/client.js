import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import CircleAlertIcon from "@lucide/svelte/icons/circle-alert";
import * as NavigationMenu from "$lib/registry/ui/navigation-menu/index.js";
import { navigationMenuTriggerStyle } from "$lib/registry/ui/navigation-menu/navigation-menu-trigger.svelte";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

var root = $.from_html(`<a>Documentation</a>`);
var root_1 = $.from_html(`<div class="flex flex-col"><div class="font-medium">Components</div> <div class="text-muted-foreground">Browse all components in the library.</div></div>`);
var root_2 = $.from_html(`<div class="flex flex-col"><div class="font-medium">Documentation</div> <div class="text-muted-foreground">Learn how to use the library.</div></div>`);
var root_3 = $.from_html(`<div class="flex flex-col"><div class="font-medium">Blog</div> <div class="text-muted-foreground">Read our latest blog posts.</div></div>`);
var root_4 = $.from_html(`<ul class="w-72"><li><!> <!> <!></li></ul>`);
var root_5 = $.from_html(`<!> <!>`, 1);
var root_6 = $.from_html(`<ul><li><!> <!> <!></li></ul>`);
var root_7 = $.from_html(`<!> Backlog`, 1);
var root_8 = $.from_html(`<!> To Do`, 1);
var root_9 = $.from_html(`<!> Done`, 1);
var root_10 = $.from_html(`<ul class="grid w-[200px]"><li><!> <!> <!></li></ul>`);
var root_11 = $.from_html(`<!> <!> <!> <!>`, 1);

export default function Navigation_menu_without_viewport($$anchor, $$props) {
	$.push($$props, true);

	Example($$anchor, {
		title: 'Without Viewport',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = $.comment();
			var node = $.first_child(fragment_1);

			$.component(node, () => NavigationMenu.Root, ($$anchor, NavigationMenu_Root) => {
				NavigationMenu_Root($$anchor, {
					viewport: false,
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = $.comment();
						var node_1 = $.first_child(fragment_2);

						$.component(node_1, () => NavigationMenu.List, ($$anchor, NavigationMenu_List) => {
							NavigationMenu_List($$anchor, {
								children: ($$anchor, $$slotProps) => {
									var fragment_3 = root_11();
									var node_2 = $.first_child(fragment_3);

									$.component(node_2, () => NavigationMenu.Item, ($$anchor, NavigationMenu_Item) => {
										NavigationMenu_Item($$anchor, {
											children: ($$anchor, $$slotProps) => {
												var fragment_4 = $.comment();
												var node_3 = $.first_child(fragment_4);

												{
													const child = ($$anchor, $$arg0) => {
														let props = () => ($$arg0?.()).props;
														var a = root();

														$.attribute_effect(a, () => ({ ...props(), href: '/docs' }));
														$.append($$anchor, a);
													};

													let $0 = $.derived(navigationMenuTriggerStyle);

													$.component(node_3, () => NavigationMenu.Link, ($$anchor, NavigationMenu_Link) => {
														NavigationMenu_Link($$anchor, {
															get class() {
																return $.get($0);
															},
															child,
															$$slots: { child: true }
														});
													});
												}

												$.append($$anchor, fragment_4);
											},
											$$slots: { default: true }
										});
									});

									var node_4 = $.sibling(node_2, 2);

									$.component(node_4, () => NavigationMenu.Item, ($$anchor, NavigationMenu_Item_1) => {
										NavigationMenu_Item_1($$anchor, {
											children: ($$anchor, $$slotProps) => {
												var fragment_5 = root_5();
												var node_5 = $.first_child(fragment_5);

												$.component(node_5, () => NavigationMenu.Trigger, ($$anchor, NavigationMenu_Trigger) => {
													NavigationMenu_Trigger($$anchor, {
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text = $.text('List');

															$.append($$anchor, text);
														},
														$$slots: { default: true }
													});
												});

												var node_6 = $.sibling(node_5, 2);

												$.component(node_6, () => NavigationMenu.Content, ($$anchor, NavigationMenu_Content) => {
													NavigationMenu_Content($$anchor, {
														children: ($$anchor, $$slotProps) => {
															var ul = root_4();
															var li = $.child(ul);
															var node_7 = $.child(li);

															$.component(node_7, () => NavigationMenu.Link, ($$anchor, NavigationMenu_Link_1) => {
																NavigationMenu_Link_1($$anchor, {
																	href: '#/',
																	children: ($$anchor, $$slotProps) => {
																		var div = root_1();

																		$.append($$anchor, div);
																	},
																	$$slots: { default: true }
																});
															});

															var node_8 = $.sibling(node_7, 2);

															$.component(node_8, () => NavigationMenu.Link, ($$anchor, NavigationMenu_Link_2) => {
																NavigationMenu_Link_2($$anchor, {
																	href: '#/',
																	children: ($$anchor, $$slotProps) => {
																		var div_1 = root_2();

																		$.append($$anchor, div_1);
																	},
																	$$slots: { default: true }
																});
															});

															var node_9 = $.sibling(node_8, 2);

															$.component(node_9, () => NavigationMenu.Link, ($$anchor, NavigationMenu_Link_3) => {
																NavigationMenu_Link_3($$anchor, {
																	href: '#/',
																	children: ($$anchor, $$slotProps) => {
																		var div_2 = root_3();

																		$.append($$anchor, div_2);
																	},
																	$$slots: { default: true }
																});
															});

															$.reset(li);
															$.reset(ul);
															$.append($$anchor, ul);
														},
														$$slots: { default: true }
													});
												});

												$.append($$anchor, fragment_5);
											},
											$$slots: { default: true }
										});
									});

									var node_10 = $.sibling(node_4, 2);

									$.component(node_10, () => NavigationMenu.Item, ($$anchor, NavigationMenu_Item_2) => {
										NavigationMenu_Item_2($$anchor, {
											children: ($$anchor, $$slotProps) => {
												var fragment_6 = root_5();
												var node_11 = $.first_child(fragment_6);

												$.component(node_11, () => NavigationMenu.Trigger, ($$anchor, NavigationMenu_Trigger_1) => {
													NavigationMenu_Trigger_1($$anchor, {
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_1 = $.text('Simple List');

															$.append($$anchor, text_1);
														},
														$$slots: { default: true }
													});
												});

												var node_12 = $.sibling(node_11, 2);

												$.component(node_12, () => NavigationMenu.Content, ($$anchor, NavigationMenu_Content_1) => {
													NavigationMenu_Content_1($$anchor, {
														children: ($$anchor, $$slotProps) => {
															var ul_1 = root_6();
															var li_1 = $.child(ul_1);
															var node_13 = $.child(li_1);

															$.component(node_13, () => NavigationMenu.Link, ($$anchor, NavigationMenu_Link_4) => {
																NavigationMenu_Link_4($$anchor, {
																	href: '#/',
																	children: ($$anchor, $$slotProps) => {
																		$.next();

																		var text_2 = $.text('Components');

																		$.append($$anchor, text_2);
																	},
																	$$slots: { default: true }
																});
															});

															var node_14 = $.sibling(node_13, 2);

															$.component(node_14, () => NavigationMenu.Link, ($$anchor, NavigationMenu_Link_5) => {
																NavigationMenu_Link_5($$anchor, {
																	href: '#/',
																	children: ($$anchor, $$slotProps) => {
																		$.next();

																		var text_3 = $.text('Documentation');

																		$.append($$anchor, text_3);
																	},
																	$$slots: { default: true }
																});
															});

															var node_15 = $.sibling(node_14, 2);

															$.component(node_15, () => NavigationMenu.Link, ($$anchor, NavigationMenu_Link_6) => {
																NavigationMenu_Link_6($$anchor, {
																	href: '#/',
																	children: ($$anchor, $$slotProps) => {
																		$.next();

																		var text_4 = $.text('Blocks');

																		$.append($$anchor, text_4);
																	},
																	$$slots: { default: true }
																});
															});

															$.reset(li_1);
															$.reset(ul_1);
															$.append($$anchor, ul_1);
														},
														$$slots: { default: true }
													});
												});

												$.append($$anchor, fragment_6);
											},
											$$slots: { default: true }
										});
									});

									var node_16 = $.sibling(node_10, 2);

									$.component(node_16, () => NavigationMenu.Item, ($$anchor, NavigationMenu_Item_3) => {
										NavigationMenu_Item_3($$anchor, {
											children: ($$anchor, $$slotProps) => {
												var fragment_7 = root_5();
												var node_17 = $.first_child(fragment_7);

												$.component(node_17, () => NavigationMenu.Trigger, ($$anchor, NavigationMenu_Trigger_2) => {
													NavigationMenu_Trigger_2($$anchor, {
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_5 = $.text('With Icon');

															$.append($$anchor, text_5);
														},
														$$slots: { default: true }
													});
												});

												var node_18 = $.sibling(node_17, 2);

												$.component(node_18, () => NavigationMenu.Content, ($$anchor, NavigationMenu_Content_2) => {
													NavigationMenu_Content_2($$anchor, {
														children: ($$anchor, $$slotProps) => {
															var ul_2 = root_10();
															var li_2 = $.child(ul_2);
															var node_19 = $.child(li_2);

															$.component(node_19, () => NavigationMenu.Link, ($$anchor, NavigationMenu_Link_7) => {
																NavigationMenu_Link_7($$anchor, {
																	href: '#/',
																	class: 'flex-row items-center gap-2',
																	children: ($$anchor, $$slotProps) => {
																		var fragment_8 = root_7();
																		var node_20 = $.first_child(fragment_8);

																		CircleAlertIcon(node_20, {});
																		$.next();
																		$.append($$anchor, fragment_8);
																	},
																	$$slots: { default: true }
																});
															});

															var node_21 = $.sibling(node_19, 2);

															$.component(node_21, () => NavigationMenu.Link, ($$anchor, NavigationMenu_Link_8) => {
																NavigationMenu_Link_8($$anchor, {
																	href: '#/',
																	class: 'flex-row items-center gap-2',
																	children: ($$anchor, $$slotProps) => {
																		var fragment_9 = root_8();
																		var node_22 = $.first_child(fragment_9);

																		CircleAlertIcon(node_22, {});
																		$.next();
																		$.append($$anchor, fragment_9);
																	},
																	$$slots: { default: true }
																});
															});

															var node_23 = $.sibling(node_21, 2);

															$.component(node_23, () => NavigationMenu.Link, ($$anchor, NavigationMenu_Link_9) => {
																NavigationMenu_Link_9($$anchor, {
																	href: '#/',
																	children: ($$anchor, $$slotProps) => {
																		var fragment_10 = root_9();
																		var node_24 = $.first_child(fragment_10);

																		CircleAlertIcon(node_24, {});
																		$.next();
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