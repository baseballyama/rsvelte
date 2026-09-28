import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { NavigationMenu } from "bits-ui";

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'noViewport',
	'noSubViewport',
	'contentForceMount',
	'viewportForceMount',
	'indicatorForceMount',
	'groupItemProps',
	'subGroupItemProps',
	'subGroupItem1Props',
	'subGroupItem2Props',
	'delayDuration',
	'skipDelayDuration'
]);

var root = $.from_html(`<button data-testid="group-item-content-button1">first button</button> <button data-testid="group-item-content-button2">second button</button>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);
var root_2 = $.from_html(`<button data-testid="sub-group-item-sub-item1-content-button">first sub button</button>`);
var root_3 = $.from_html(`<button data-testid="sub-group-item-sub-item2-content-button">second sub button</button>`);
var root_4 = $.from_html(`<!> <!> <!> <!>`, 1);
var root_5 = $.from_html(`<main><button data-testid="previous-button">previous button</button> <!> <button data-testid="next-button">next button</button></main>`);

export default function Navigation_menu_test($$anchor, $$props) {
	let contentForceMount = $.prop($$props, 'contentForceMount', 3, false),
		viewportForceMount = $.prop($$props, 'viewportForceMount', 3, false),
		indicatorForceMount = $.prop($$props, 'indicatorForceMount', 3, false),
		delayDuration = $.prop($$props, 'delayDuration', 3, 0),
		skipDelayDuration = $.prop($$props, 'skipDelayDuration', 3, 0),
		restProps = $.rest_props($$props, rest_excludes);

	var main = root_5();
	var button = $.child(main);

	$.set_attribute(button, 'tabindex', 0);

	var node = $.sibling(button, 2);

	$.component(node, () => NavigationMenu.Root, ($$anchor, NavigationMenu_Root) => {
		NavigationMenu_Root($$anchor, $.spread_props(() => restProps, {
			'data-testid': 'root',
			get delayDuration() {
				return delayDuration();
			},

			get skipDelayDuration() {
				return skipDelayDuration();
			},

			children: ($$anchor, $$slotProps) => {
				var fragment = root_1();
				var node_1 = $.first_child(fragment);

				$.component(node_1, () => NavigationMenu.List, ($$anchor, NavigationMenu_List) => {
					NavigationMenu_List($$anchor, {
						'data-testid': 'list',
						children: ($$anchor, $$slotProps) => {
							var fragment_1 = root_4();
							var node_2 = $.first_child(fragment_1);

							$.component(node_2, () => NavigationMenu.Item, ($$anchor, NavigationMenu_Item) => {
								NavigationMenu_Item($$anchor, $.spread_props({ value: 'group', 'data-testid': 'group-item' }, () => $$props.groupItemProps, {
									children: ($$anchor, $$slotProps) => {
										var fragment_2 = root_1();
										var node_3 = $.first_child(fragment_2);

										$.component(node_3, () => NavigationMenu.Trigger, ($$anchor, NavigationMenu_Trigger) => {
											NavigationMenu_Trigger($$anchor, {
												'data-testid': 'group-item-trigger',
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text = $.text('trigger');

													$.append($$anchor, text);
												},
												$$slots: { default: true }
											});
										});

										var node_4 = $.sibling(node_3, 2);

										$.component(node_4, () => NavigationMenu.Content, ($$anchor, NavigationMenu_Content) => {
											NavigationMenu_Content($$anchor, {
												'data-testid': 'group-item-content',
												get forceMount() {
													return contentForceMount();
												},

												children: ($$anchor, $$slotProps) => {
													var fragment_3 = root();

													$.next(2);
													$.append($$anchor, fragment_3);
												},
												$$slots: { default: true }
											});
										});

										$.append($$anchor, fragment_2);
									},
									$$slots: { default: true }
								}));
							});

							var node_5 = $.sibling(node_2, 2);

							$.component(node_5, () => NavigationMenu.Item, ($$anchor, NavigationMenu_Item_1) => {
								NavigationMenu_Item_1($$anchor, $.spread_props({ value: 'sub-group', 'data-testid': 'sub-group-item' }, () => $$props.subGroupItemProps, {
									children: ($$anchor, $$slotProps) => {
										var fragment_4 = root_1();
										var node_6 = $.first_child(fragment_4);

										$.component(node_6, () => NavigationMenu.Trigger, ($$anchor, NavigationMenu_Trigger_1) => {
											NavigationMenu_Trigger_1($$anchor, {
												'data-testid': 'sub-group-item-trigger',
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_1 = $.text('sub');

													$.append($$anchor, text_1);
												},
												$$slots: { default: true }
											});
										});

										var node_7 = $.sibling(node_6, 2);

										$.component(node_7, () => NavigationMenu.Content, ($$anchor, NavigationMenu_Content_1) => {
											NavigationMenu_Content_1($$anchor, {
												'data-testid': 'sub-group-item-content',
												get forceMount() {
													return contentForceMount();
												},

												children: ($$anchor, $$slotProps) => {
													var fragment_5 = $.comment();
													var node_8 = $.first_child(fragment_5);

													$.component(node_8, () => NavigationMenu.Sub, ($$anchor, NavigationMenu_Sub) => {
														NavigationMenu_Sub($$anchor, {
															value: 'sub1',
															'data-testid': 'sub-group-item-sub',
															children: ($$anchor, $$slotProps) => {
																var fragment_6 = root_1();
																var node_9 = $.first_child(fragment_6);

																$.component(node_9, () => NavigationMenu.List, ($$anchor, NavigationMenu_List_1) => {
																	NavigationMenu_List_1($$anchor, {
																		'data-testid': 'sub-group-item-sub-list',
																		children: ($$anchor, $$slotProps) => {
																			var fragment_7 = root_1();
																			var node_10 = $.first_child(fragment_7);

																			$.component(node_10, () => NavigationMenu.Item, ($$anchor, NavigationMenu_Item_2) => {
																				NavigationMenu_Item_2($$anchor, $.spread_props({ value: 'sub1', 'data-testid': 'sub-group-item-sub-item1' }, () => $$props.subGroupItem1Props, {
																					children: ($$anchor, $$slotProps) => {
																						var fragment_8 = root_1();
																						var node_11 = $.first_child(fragment_8);

																						$.component(node_11, () => NavigationMenu.Trigger, ($$anchor, NavigationMenu_Trigger_2) => {
																							NavigationMenu_Trigger_2($$anchor, {
																								'data-testid': 'sub-group-item-sub-item1-trigger',
																								children: ($$anchor, $$slotProps) => {
																									$.next();

																									var text_2 = $.text('sub1');

																									$.append($$anchor, text_2);
																								},
																								$$slots: { default: true }
																							});
																						});

																						var node_12 = $.sibling(node_11, 2);

																						$.component(node_12, () => NavigationMenu.Content, ($$anchor, NavigationMenu_Content_2) => {
																							NavigationMenu_Content_2($$anchor, {
																								'data-testid': 'sub-group-item-sub-item1-content',
																								get forceMount() {
																									return contentForceMount();
																								},

																								children: ($$anchor, $$slotProps) => {
																									var button_1 = root_2();

																									$.append($$anchor, button_1);
																								},
																								$$slots: { default: true }
																							});
																						});

																						$.append($$anchor, fragment_8);
																					},
																					$$slots: { default: true }
																				}));
																			});

																			var node_13 = $.sibling(node_10, 2);

																			$.component(node_13, () => NavigationMenu.Item, ($$anchor, NavigationMenu_Item_3) => {
																				NavigationMenu_Item_3($$anchor, $.spread_props({ value: 'sub2', 'data-testid': 'sub-group-item-sub-item2' }, () => $$props.subGroupItem2Props, {
																					children: ($$anchor, $$slotProps) => {
																						var fragment_9 = root_1();
																						var node_14 = $.first_child(fragment_9);

																						$.component(node_14, () => NavigationMenu.Trigger, ($$anchor, NavigationMenu_Trigger_3) => {
																							NavigationMenu_Trigger_3($$anchor, {
																								'data-testid': 'sub-group-item-sub-item2-trigger',
																								children: ($$anchor, $$slotProps) => {
																									$.next();

																									var text_3 = $.text('sub2');

																									$.append($$anchor, text_3);
																								},
																								$$slots: { default: true }
																							});
																						});

																						var node_15 = $.sibling(node_14, 2);

																						$.component(node_15, () => NavigationMenu.Content, ($$anchor, NavigationMenu_Content_3) => {
																							NavigationMenu_Content_3($$anchor, {
																								'data-testid': 'sub-group-item-sub-item2-content',
																								get forceMount() {
																									return contentForceMount();
																								},

																								children: ($$anchor, $$slotProps) => {
																									var button_2 = root_3();

																									$.append($$anchor, button_2);
																								},
																								$$slots: { default: true }
																							});
																						});

																						$.append($$anchor, fragment_9);
																					},
																					$$slots: { default: true }
																				}));
																			});

																			$.append($$anchor, fragment_7);
																		},
																		$$slots: { default: true }
																	});
																});

																var node_16 = $.sibling(node_9, 2);

																{
																	var consequent = ($$anchor) => {
																		var fragment_10 = $.comment();
																		var node_17 = $.first_child(fragment_10);

																		$.component(node_17, () => NavigationMenu.Viewport, ($$anchor, NavigationMenu_Viewport) => {
																			NavigationMenu_Viewport($$anchor, { 'data-testid': 'sub-group-item-sub-viewport' });
																		});

																		$.append($$anchor, fragment_10);
																	};

																	$.if(node_16, ($$render) => {
																		if (!$$props.noSubViewport) $$render(consequent);
																	});
																}

																$.append($$anchor, fragment_6);
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
								}));
							});

							var node_18 = $.sibling(node_5, 2);

							$.component(node_18, () => NavigationMenu.Item, ($$anchor, NavigationMenu_Item_4) => {
								NavigationMenu_Item_4($$anchor, {
									value: 'link',
									'data-testid': 'link-item',
									children: ($$anchor, $$slotProps) => {
										var fragment_11 = $.comment();
										var node_19 = $.first_child(fragment_11);

										$.component(node_19, () => NavigationMenu.Link, ($$anchor, NavigationMenu_Link) => {
											NavigationMenu_Link($$anchor, {
												'data-testid': 'link-item-link',
												href: '/',
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_4 = $.text('link');

													$.append($$anchor, text_4);
												},
												$$slots: { default: true }
											});
										});

										$.append($$anchor, fragment_11);
									},
									$$slots: { default: true }
								});
							});

							var node_20 = $.sibling(node_18, 2);

							$.component(node_20, () => NavigationMenu.Indicator, ($$anchor, NavigationMenu_Indicator) => {
								NavigationMenu_Indicator($$anchor, {
									'data-testid': 'indicator',
									get forceMount() {
										return indicatorForceMount();
									}
								});
							});

							$.append($$anchor, fragment_1);
						},
						$$slots: { default: true }
					});
				});

				var node_21 = $.sibling(node_1, 2);

				{
					var consequent_1 = ($$anchor) => {
						var fragment_12 = $.comment();
						var node_22 = $.first_child(fragment_12);

						$.component(node_22, () => NavigationMenu.Viewport, ($$anchor, NavigationMenu_Viewport_1) => {
							NavigationMenu_Viewport_1($$anchor, {
								'data-testid': 'viewport',
								get forceMount() {
									return viewportForceMount();
								}
							});
						});

						$.append($$anchor, fragment_12);
					};

					$.if(node_21, ($$render) => {
						if (!$$props.noViewport) $$render(consequent_1);
					});
				}

				$.append($$anchor, fragment);
			},
			$$slots: { default: true }
		}));
	});

	var button_3 = $.sibling(node, 2);

	$.set_attribute(button_3, 'tabindex', 0);
	$.reset(main);
	$.append($$anchor, main);
}