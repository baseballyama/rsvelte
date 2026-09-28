import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import CheckIcon from "@lucide/svelte/icons/check";
import ChevronRightIcon from "@lucide/svelte/icons/chevron-right";
import * as Collapsible from "$lib/registry/ui/collapsible/index.js";
import * as Sidebar from "$lib/registry/ui/sidebar/index.js";

var root = $.from_html(` <!>`, 1);
var root_1 = $.from_html(`<div class="group/calendar-item flex aspect-square size-4 shrink-0 items-center justify-center rounded-xs border border-sidebar-border text-sidebar-primary-foreground data-[active=true]:border-sidebar-primary data-[active=true]:bg-sidebar-primary"><!></div> `, 1);
var root_2 = $.from_html(`<!> <!>`, 1);

export default function Calendars($$anchor, $$props) {
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.each(node, 19, () => $$props.calendars, (calendar) => calendar.name, ($$anchor, calendar, index) => {
		var fragment_1 = root_2();
		var node_1 = $.first_child(fragment_1);

		$.component(node_1, () => Sidebar.Group, ($$anchor, Sidebar_Group) => {
			Sidebar_Group($$anchor, {
				class: 'py-0',
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = $.comment();
					var node_2 = $.first_child(fragment_2);

					{
						let $0 = $.derived(() => $.get(index) === 0);

						$.component(node_2, () => Collapsible.Root, ($$anchor, Collapsible_Root) => {
							Collapsible_Root($$anchor, {
								get open() {
									return $.get($0);
								},
								class: 'group/collapsible',
								children: ($$anchor, $$slotProps) => {
									var fragment_3 = root_2();
									var node_3 = $.first_child(fragment_3);

									{
										const child = ($$anchor, $$arg0) => {
											let props = () => ($$arg0?.()).props;
											var fragment_4 = $.comment();
											var node_4 = $.first_child(fragment_4);

											$.component(node_4, () => Collapsible.Trigger, ($$anchor, Collapsible_Trigger) => {
												Collapsible_Trigger($$anchor, $.spread_props(props, {
													children: ($$anchor, $$slotProps) => {
														$.next();

														var fragment_5 = root();
														var text = $.first_child(fragment_5);
														var node_5 = $.sibling(text);

														ChevronRightIcon(node_5, {
															class: 'ms-auto transition-transform group-data-[state=open]/collapsible:rotate-90'
														});

														$.template_effect(() => $.set_text(text, `${$.get(calendar).name ?? ''} `));
														$.append($$anchor, fragment_5);
													},
													$$slots: { default: true }
												}));
											});

											$.append($$anchor, fragment_4);
										};

										$.component(node_3, () => Sidebar.GroupLabel, ($$anchor, Sidebar_GroupLabel) => {
											Sidebar_GroupLabel($$anchor, {
												class: 'group/label w-full text-sm text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
												child,
												$$slots: { child: true }
											});
										});
									}

									var node_6 = $.sibling(node_3, 2);

									$.component(node_6, () => Collapsible.Content, ($$anchor, Collapsible_Content) => {
										Collapsible_Content($$anchor, {
											children: ($$anchor, $$slotProps) => {
												var fragment_6 = $.comment();
												var node_7 = $.first_child(fragment_6);

												$.component(node_7, () => Sidebar.GroupContent, ($$anchor, Sidebar_GroupContent) => {
													Sidebar_GroupContent($$anchor, {
														children: ($$anchor, $$slotProps) => {
															var fragment_7 = $.comment();
															var node_8 = $.first_child(fragment_7);

															$.component(node_8, () => Sidebar.Menu, ($$anchor, Sidebar_Menu) => {
																Sidebar_Menu($$anchor, {
																	children: ($$anchor, $$slotProps) => {
																		var fragment_8 = $.comment();
																		var node_9 = $.first_child(fragment_8);

																		$.each(node_9, 18, () => $.get(calendar).items, (item) => item, ($$anchor, item, index, $$array) => {
																			var fragment_9 = $.comment();
																			var node_10 = $.first_child(fragment_9);

																			$.component(node_10, () => Sidebar.MenuItem, ($$anchor, Sidebar_MenuItem) => {
																				Sidebar_MenuItem($$anchor, {
																					children: ($$anchor, $$slotProps) => {
																						var fragment_10 = $.comment();
																						var node_11 = $.first_child(fragment_10);

																						$.component(node_11, () => Sidebar.MenuButton, ($$anchor, Sidebar_MenuButton) => {
																							Sidebar_MenuButton($$anchor, {
																								children: ($$anchor, $$slotProps) => {
																									var fragment_11 = root_1();
																									var div = $.first_child(fragment_11);
																									var node_12 = $.child(div);

																									CheckIcon(node_12, {
																										class: 'hidden size-3 group-data-[active=true]/calendar-item:block'
																									});

																									$.reset(div);

																									var text_1 = $.sibling(div);

																									$.template_effect(() => {
																										$.set_attribute(div, 'data-active', $.get(index) < 2);
																										$.set_text(text_1, ` ${item ?? ''}`);
																									});

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

																			$.append($$anchor, fragment_9);
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
											},
											$$slots: { default: true }
										});
									});

									$.append($$anchor, fragment_3);
								},
								$$slots: { default: true }
							});
						});
					}

					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});
		});

		var node_13 = $.sibling(node_1, 2);

		$.component(node_13, () => Sidebar.Separator, ($$anchor, Sidebar_Separator) => {
			Sidebar_Separator($$anchor, { class: 'mx-0' });
		});

		$.append($$anchor, fragment_1);
	});

	$.append($$anchor, fragment);
}