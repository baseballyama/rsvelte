import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { goto } from "$app/navigation";
import { page } from "$app/state";
import ChevronRightIcon from "@lucide/svelte/icons/chevron-right";
import * as Collapsible from "$lib/registry/ui/collapsible/index.js";
import * as Sidebar from "$lib/registry/ui/sidebar/index.js";
import { cn } from "$lib/utils.js";
import { groupItemsByType } from "../lib/utils.js";

var root = $.from_html(`<!> <span> </span>`, 1);
var root_1 = $.from_html(`<div class="absolute top-1/2 -bottom-1 -left-2.5 w-1 bg-sidebar"></div>`);
var root_2 = $.from_html(` <span class="absolute inset-0 flex w-(--sidebar-width) bg-transparent"></span>`, 1);
var root_3 = $.from_html(`<div></div> <!> <!> <a data-sveltekit-preload-data="hover" class="sr-only"> </a>`, 1);
var root_4 = $.from_html(`<!> <!>`, 1);

export default function Item_explorer($$anchor, $$props) {
	$.push($$props, true);

	const groupedItems = $.derived(() => groupItemsByType($$props.items));
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => Sidebar.Root, ($$anchor, Sidebar_Root) => {
		Sidebar_Root($$anchor, {
			class: 'sticky z-30 hidden h-[calc(100svh-var(--header-height)-2rem)] overscroll-none bg-transparent xl:flex',
			collapsible: 'none',
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = $.comment();
				var node_1 = $.first_child(fragment_1);

				$.component(node_1, () => Sidebar.Content, ($$anchor, Sidebar_Content) => {
					Sidebar_Content($$anchor, {
						class: '-mx-1 no-scrollbar overflow-x-hidden',
						children: ($$anchor, $$slotProps) => {
							var fragment_2 = $.comment();
							var node_2 = $.first_child(fragment_2);

							$.each(node_2, 17, () => $.get(groupedItems), (group) => group.title, ($$anchor, group) => {
								var fragment_3 = $.comment();
								var node_3 = $.first_child(fragment_3);

								$.component(node_3, () => Collapsible.Root, ($$anchor, Collapsible_Root) => {
									Collapsible_Root($$anchor, {
										open: true,
										class: 'group/collapsible',
										children: ($$anchor, $$slotProps) => {
											var fragment_4 = $.comment();
											var node_4 = $.first_child(fragment_4);

											$.component(node_4, () => Sidebar.Group, ($$anchor, Sidebar_Group) => {
												Sidebar_Group($$anchor, {
													class: 'px-1 py-0',
													children: ($$anchor, $$slotProps) => {
														var fragment_5 = root_4();
														var node_5 = $.first_child(fragment_5);

														$.component(node_5, () => Collapsible.Trigger, ($$anchor, Collapsible_Trigger) => {
															Collapsible_Trigger($$anchor, {
																class: 'flex w-full items-center gap-1 py-1.5 text-[0.8rem] font-medium [&[data-state=open]>svg]:rotate-90',
																children: ($$anchor, $$slotProps) => {
																	var fragment_6 = root();
																	var node_6 = $.first_child(fragment_6);

																	ChevronRightIcon(node_6, { class: 'size-3.5 text-muted-foreground transition-transform' });

																	var span = $.sibling(node_6, 2);
																	var text = $.only_child(span, true);

																	$.template_effect(() => $.set_text(text, $.get(group).title));
																	$.append($$anchor, fragment_6);
																},
																$$slots: { default: true }
															});
														});

														var node_7 = $.sibling(node_5, 2);

														$.component(node_7, () => Collapsible.Content, ($$anchor, Collapsible_Content) => {
															Collapsible_Content($$anchor, {
																children: ($$anchor, $$slotProps) => {
																	var fragment_7 = $.comment();
																	var node_8 = $.first_child(fragment_7);

																	$.component(node_8, () => Sidebar.GroupContent, ($$anchor, Sidebar_GroupContent) => {
																		Sidebar_GroupContent($$anchor, {
																			children: ($$anchor, $$slotProps) => {
																				var fragment_8 = $.comment();
																				var node_9 = $.first_child(fragment_8);

																				$.component(node_9, () => Sidebar.Menu, ($$anchor, Sidebar_Menu) => {
																					Sidebar_Menu($$anchor, {
																						class: 'relative ml-1.5 border-l border-border/50 pl-2',
																						children: ($$anchor, $$slotProps) => {
																							var fragment_9 = $.comment();
																							var node_10 = $.first_child(fragment_9);

																							$.each(node_10, 19, () => $.get(group).items, (item) => item.name, ($$anchor, item, index) => {
																								var fragment_10 = $.comment();
																								var node_11 = $.first_child(fragment_10);

																								$.component(node_11, () => Sidebar.MenuItem, ($$anchor, Sidebar_MenuItem) => {
																									Sidebar_MenuItem($$anchor, {
																										class: 'relative',
																										children: ($$anchor, $$slotProps) => {
																											var fragment_11 = root_3();
																											var div = $.first_child(fragment_11);
																											var node_12 = $.sibling(div, 2);

																											{
																												var consequent = ($$anchor) => {
																													var div_1 = root_1();

																													$.append($$anchor, div_1);
																												};

																												$.if(node_12, ($$render) => {
																													if ($.get(index) === $.get(group).items.length - 1) $$render(consequent);
																												});
																											}

																											var node_13 = $.sibling(node_12, 2);

																											{
																												let $0 = $.derived(() => $.get(item).name === page.params.item);
																												let $1 = $.derived(() => $.get(item).name === page.params.item);

																												$.component(node_13, () => Sidebar.MenuButton, ($$anchor, Sidebar_MenuButton) => {
																													Sidebar_MenuButton($$anchor, {
																														onclick: () => goto(`/create/${$.get(item).name}${page.url.search}`),
																														class: 'relative h-[26px] w-fit cursor-pointer overflow-visible border border-transparent text-[0.8rem] font-normal after:absolute after:inset-x-0 after:-inset-y-1 after:z-0 after:rounded-md data-[active=true]:border-accent data-[active=true]:bg-accent 3xl:fixed:w-full 3xl:fixed:max-w-48',
																														get 'data-active'() {
																															return $.get($0);
																														},

																														get isActive() {
																															return $.get($1);
																														},

																														children: ($$anchor, $$slotProps) => {
																															$.next();

																															var fragment_12 = root_2();
																															var text_1 = $.first_child(fragment_12);

																															$.next();
																															$.template_effect(() => $.set_text(text_1, `${$.get(item).title ?? ''} `));
																															$.append($$anchor, fragment_12);
																														},
																														$$slots: { default: true }
																													});
																												});
																											}

																											var a = $.sibling(node_13, 2);

																											$.set_attribute(a, 'tabindex', -1);

																											var text_2 = $.only_child(a, true);

																											$.template_effect(
																												($0) => {
																													$.set_class(div, 1, $0);
																													$.set_attribute(a, 'href', `/preview/${$.get(item).name}`);
																													$.set_text(text_2, $.get(item).title);
																												},
																												[
																													() => $.clsx(cn("absolute top-1/2 -left-2 h-px w-2 border-t border-border/50", $.get(index) === $.get(group).items.length - 1 && "bg-sidebar"))
																												]
																											);

																											$.append($$anchor, fragment_11);
																										},
																										$$slots: { default: true }
																									});
																								});

																								$.append($$anchor, fragment_10);
																							});

																							$.append($$anchor, fragment_9);
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

														$.append($$anchor, fragment_5);
													},
													$$slots: { default: true }
												});
											});

											$.append($$anchor, fragment_4);
										},
										$$slots: { default: true }
									});
								});

								$.append($$anchor, fragment_3);
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