import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import ChevronRightIcon from "@lucide/svelte/icons/chevron-right";
import * as Collapsible from "$lib/registry/ui/collapsible/index.js";
import * as Sidebar from "$lib/registry/ui/sidebar/index.js";

var root = $.from_html(`<a><!> <span> </span></a>`);
var root_1 = $.from_html(`<!> <span class="sr-only">Toggle</span>`, 1);
var root_2 = $.from_html(`<a><span> </span></a>`);
var root_3 = $.from_html(`<!> <!>`, 1);

export default function Nav_main($$anchor, $$props) {
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => Sidebar.Group, ($$anchor, Sidebar_Group) => {
		Sidebar_Group($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root_3();
				var node_1 = $.first_child(fragment_1);

				$.component(node_1, () => Sidebar.GroupLabel, ($$anchor, Sidebar_GroupLabel) => {
					Sidebar_GroupLabel($$anchor, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text = $.text('Platform');

							$.append($$anchor, text);
						},
						$$slots: { default: true }
					});
				});

				var node_2 = $.sibling(node_1, 2);

				$.component(node_2, () => Sidebar.Menu, ($$anchor, Sidebar_Menu) => {
					Sidebar_Menu($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_2 = $.comment();
							var node_3 = $.first_child(fragment_2);

							$.each(node_3, 17, () => $$props.items, (item) => item.title, ($$anchor, item) => {
								var fragment_3 = $.comment();
								var node_4 = $.first_child(fragment_3);

								{
									const child = ($$anchor, $$arg0) => {
										let props = () => ($$arg0?.()).props;
										var fragment_4 = $.comment();
										var node_5 = $.first_child(fragment_4);

										$.component(node_5, () => Sidebar.MenuItem, ($$anchor, Sidebar_MenuItem) => {
											Sidebar_MenuItem($$anchor, $.spread_props(props, {
												children: ($$anchor, $$slotProps) => {
													var fragment_5 = root_3();
													var node_6 = $.first_child(fragment_5);

													{
														const child = ($$anchor, $$arg0) => {
															let props = () => ($$arg0?.()).props;
															var a = root();

															$.attribute_effect(a, () => ({ href: $.get(item).url, ...props() }));

															var node_7 = $.child(a);

															$.component(node_7, () => $.get(item).icon, ($$anchor, item_icon) => {
																item_icon($$anchor, {});
															});

															var span = $.sibling(node_7, 2);
															var text_1 = $.only_child(span, true);

															$.reset(a);
															$.template_effect(() => $.set_text(text_1, $.get(item).title));
															$.append($$anchor, a);
														};

														$.component(node_6, () => Sidebar.MenuButton, ($$anchor, Sidebar_MenuButton) => {
															Sidebar_MenuButton($$anchor, {
																get tooltipContent() {
																	return $.get(item).title;
																},
																child,
																$$slots: { child: true }
															});
														});
													}

													var node_8 = $.sibling(node_6, 2);

													{
														var consequent = ($$anchor) => {
															var fragment_6 = root_3();
															var node_9 = $.first_child(fragment_6);

															{
																const child = ($$anchor, $$arg0) => {
																	let props = () => ($$arg0?.()).props;
																	var fragment_7 = $.comment();
																	var node_10 = $.first_child(fragment_7);

																	$.component(node_10, () => Sidebar.MenuAction, ($$anchor, Sidebar_MenuAction) => {
																		Sidebar_MenuAction($$anchor, $.spread_props(props, {
																			class: 'data-[state=open]:rotate-90',
																			children: ($$anchor, $$slotProps) => {
																				var fragment_8 = root_1();
																				var node_11 = $.first_child(fragment_8);

																				ChevronRightIcon(node_11, {});
																				$.next(2);
																				$.append($$anchor, fragment_8);
																			},
																			$$slots: { default: true }
																		}));
																	});

																	$.append($$anchor, fragment_7);
																};

																$.component(node_9, () => Collapsible.Trigger, ($$anchor, Collapsible_Trigger) => {
																	Collapsible_Trigger($$anchor, { child, $$slots: { child: true } });
																});
															}

															var node_12 = $.sibling(node_9, 2);

															$.component(node_12, () => Collapsible.Content, ($$anchor, Collapsible_Content) => {
																Collapsible_Content($$anchor, {
																	children: ($$anchor, $$slotProps) => {
																		var fragment_9 = $.comment();
																		var node_13 = $.first_child(fragment_9);

																		$.component(node_13, () => Sidebar.MenuSub, ($$anchor, Sidebar_MenuSub) => {
																			Sidebar_MenuSub($$anchor, {
																				children: ($$anchor, $$slotProps) => {
																					var fragment_10 = $.comment();
																					var node_14 = $.first_child(fragment_10);

																					$.each(node_14, 17, () => $.get(item).items, (subItem) => subItem.title, ($$anchor, subItem) => {
																						var fragment_11 = $.comment();
																						var node_15 = $.first_child(fragment_11);

																						$.component(node_15, () => Sidebar.MenuSubItem, ($$anchor, Sidebar_MenuSubItem) => {
																							Sidebar_MenuSubItem($$anchor, {
																								children: ($$anchor, $$slotProps) => {
																									var fragment_12 = $.comment();
																									var node_16 = $.first_child(fragment_12);

																									{
																										const child = ($$anchor, $$arg0) => {
																											let props = () => ($$arg0?.()).props;
																											var a_1 = root_2();

																											$.attribute_effect(a_1, () => ({ href: $.get(subItem).url, ...props() }));

																											var span_1 = $.child(a_1);
																											var text_2 = $.only_child(span_1, true);

																											$.reset(a_1);
																											$.template_effect(() => $.set_text(text_2, $.get(subItem).title));
																											$.append($$anchor, a_1);
																										};

																										$.component(node_16, () => Sidebar.MenuSubButton, ($$anchor, Sidebar_MenuSubButton) => {
																											Sidebar_MenuSubButton($$anchor, { child, $$slots: { child: true } });
																										});
																									}

																									$.append($$anchor, fragment_12);
																								},
																								$$slots: { default: true }
																							});
																						});

																						$.append($$anchor, fragment_11);
																					});

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

															$.append($$anchor, fragment_6);
														};

														$.if(node_8, ($$render) => {
															if ($.get(item).items?.length) $$render(consequent);
														});
													}

													$.append($$anchor, fragment_5);
												},
												$$slots: { default: true }
											}));
										});

										$.append($$anchor, fragment_4);
									};

									$.component(node_4, () => Collapsible.Root, ($$anchor, Collapsible_Root) => {
										Collapsible_Root($$anchor, {
											get open() {
												return $.get(item).isActive;
											},
											child,
											$$slots: { child: true }
										});
									});
								}

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
}