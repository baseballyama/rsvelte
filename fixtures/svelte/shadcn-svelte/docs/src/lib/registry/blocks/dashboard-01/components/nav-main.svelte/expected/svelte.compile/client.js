import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import CirclePlusFilledIcon from "@tabler/icons-svelte/icons/circle-plus-filled";
import MailIcon from "@tabler/icons-svelte/icons/mail";
import * as Sidebar from "$lib/registry/ui/sidebar/index.js";
import { Button } from "$lib/registry/ui/button/index.js";

var root = $.from_html(`<!> <span>Quick Create</span>`, 1);
var root_1 = $.from_html(`<!> <span class="sr-only">Inbox</span>`, 1);
var root_2 = $.from_html(`<!> <!>`, 1);
var root_3 = $.from_html(`<!> <span> </span>`, 1);

export default function Nav_main($$anchor, $$props) {
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => Sidebar.Group, ($$anchor, Sidebar_Group) => {
		Sidebar_Group($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = $.comment();
				var node_1 = $.first_child(fragment_1);

				$.component(node_1, () => Sidebar.GroupContent, ($$anchor, Sidebar_GroupContent) => {
					Sidebar_GroupContent($$anchor, {
						class: 'flex flex-col gap-2',
						children: ($$anchor, $$slotProps) => {
							var fragment_2 = root_2();
							var node_2 = $.first_child(fragment_2);

							$.component(node_2, () => Sidebar.Menu, ($$anchor, Sidebar_Menu) => {
								Sidebar_Menu($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_3 = $.comment();
										var node_3 = $.first_child(fragment_3);

										$.component(node_3, () => Sidebar.MenuItem, ($$anchor, Sidebar_MenuItem) => {
											Sidebar_MenuItem($$anchor, {
												class: 'flex items-center gap-2',
												children: ($$anchor, $$slotProps) => {
													var fragment_4 = root_2();
													var node_4 = $.first_child(fragment_4);

													$.component(node_4, () => Sidebar.MenuButton, ($$anchor, Sidebar_MenuButton) => {
														Sidebar_MenuButton($$anchor, {
															class: 'min-w-8 bg-primary text-primary-foreground duration-200 ease-linear hover:bg-primary/90 hover:text-primary-foreground active:bg-primary/90 active:text-primary-foreground',
															tooltipContent: 'Quick create',
															children: ($$anchor, $$slotProps) => {
																var fragment_5 = root();
																var node_5 = $.first_child(fragment_5);

																CirclePlusFilledIcon(node_5, {});
																$.next(2);
																$.append($$anchor, fragment_5);
															},
															$$slots: { default: true }
														});
													});

													var node_6 = $.sibling(node_4, 2);

													Button(node_6, {
														size: 'icon',
														class: 'size-8 group-data-[collapsible=icon]:opacity-0',
														variant: 'outline',
														children: ($$anchor, $$slotProps) => {
															var fragment_6 = root_1();
															var node_7 = $.first_child(fragment_6);

															MailIcon(node_7, {});
															$.next(2);
															$.append($$anchor, fragment_6);
														},
														$$slots: { default: true }
													});

													$.append($$anchor, fragment_4);
												},
												$$slots: { default: true }
											});
										});

										$.append($$anchor, fragment_3);
									},
									$$slots: { default: true }
								});
							});

							var node_8 = $.sibling(node_2, 2);

							$.component(node_8, () => Sidebar.Menu, ($$anchor, Sidebar_Menu_1) => {
								Sidebar_Menu_1($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_7 = $.comment();
										var node_9 = $.first_child(fragment_7);

										$.each(node_9, 17, () => $$props.items, (item) => item.title, ($$anchor, item) => {
											var fragment_8 = $.comment();
											var node_10 = $.first_child(fragment_8);

											$.component(node_10, () => Sidebar.MenuItem, ($$anchor, Sidebar_MenuItem_1) => {
												Sidebar_MenuItem_1($$anchor, {
													children: ($$anchor, $$slotProps) => {
														var fragment_9 = $.comment();
														var node_11 = $.first_child(fragment_9);

														$.component(node_11, () => Sidebar.MenuButton, ($$anchor, Sidebar_MenuButton_1) => {
															Sidebar_MenuButton_1($$anchor, {
																get tooltipContent() {
																	return $.get(item).title;
																},

																children: ($$anchor, $$slotProps) => {
																	var fragment_10 = root_3();
																	var node_12 = $.first_child(fragment_10);

																	{
																		var consequent = ($$anchor) => {
																			var fragment_11 = $.comment();
																			var node_13 = $.first_child(fragment_11);

																			$.component(node_13, () => $.get(item).icon, ($$anchor, item_icon) => {
																				item_icon($$anchor, {});
																			});

																			$.append($$anchor, fragment_11);
																		};

																		$.if(node_12, ($$render) => {
																			if ($.get(item).icon) $$render(consequent);
																		});
																	}

																	var span = $.sibling(node_12, 2);
																	var text = $.only_child(span, true);

																	$.template_effect(() => $.set_text(text, $.get(item).title));
																	$.append($$anchor, fragment_10);
																},
																$$slots: { default: true }
															});
														});

														$.append($$anchor, fragment_9);
													},
													$$slots: { default: true }
												});
											});

											$.append($$anchor, fragment_8);
										});

										$.append($$anchor, fragment_7);
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
}