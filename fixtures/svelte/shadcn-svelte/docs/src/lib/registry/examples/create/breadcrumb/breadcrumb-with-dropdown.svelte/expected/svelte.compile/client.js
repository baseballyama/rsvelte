import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as Breadcrumb from "$lib/registry/ui/breadcrumb/index.js";
import * as DropdownMenu from "$lib/registry/ui/dropdown-menu/index.js";
import { Button } from "$lib/registry/ui/button/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

var root = $.from_html(`<!> <span class="sr-only">Toggle menu</span>`, 1);
var root_1 = $.from_html(`<!> <!> <!>`, 1);
var root_2 = $.from_html(`<!> <!>`, 1);
var root_3 = $.from_html(`<!> <!> <!> <!> <!> <!> <!>`, 1);

export default function Breadcrumb_with_dropdown($$anchor) {
	Example($$anchor, {
		title: 'With Dropdown',
		class: 'items-center justify-center',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = $.comment();
			var node = $.first_child(fragment_1);

			$.component(node, () => Breadcrumb.Root, ($$anchor, Breadcrumb_Root) => {
				Breadcrumb_Root($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = $.comment();
						var node_1 = $.first_child(fragment_2);

						$.component(node_1, () => Breadcrumb.List, ($$anchor, Breadcrumb_List) => {
							Breadcrumb_List($$anchor, {
								children: ($$anchor, $$slotProps) => {
									var fragment_3 = root_3();
									var node_2 = $.first_child(fragment_3);

									$.component(node_2, () => Breadcrumb.Item, ($$anchor, Breadcrumb_Item) => {
										Breadcrumb_Item($$anchor, {
											children: ($$anchor, $$slotProps) => {
												var fragment_4 = $.comment();
												var node_3 = $.first_child(fragment_4);

												$.component(node_3, () => Breadcrumb.Link, ($$anchor, Breadcrumb_Link) => {
													Breadcrumb_Link($$anchor, {
														href: '#/',
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text = $.text('Home');

															$.append($$anchor, text);
														},
														$$slots: { default: true }
													});
												});

												$.append($$anchor, fragment_4);
											},
											$$slots: { default: true }
										});
									});

									var node_4 = $.sibling(node_2, 2);

									$.component(node_4, () => Breadcrumb.Separator, ($$anchor, Breadcrumb_Separator) => {
										Breadcrumb_Separator($$anchor, {});
									});

									var node_5 = $.sibling(node_4, 2);

									$.component(node_5, () => Breadcrumb.Item, ($$anchor, Breadcrumb_Item_1) => {
										Breadcrumb_Item_1($$anchor, {
											children: ($$anchor, $$slotProps) => {
												var fragment_5 = $.comment();
												var node_6 = $.first_child(fragment_5);

												$.component(node_6, () => DropdownMenu.Root, ($$anchor, DropdownMenu_Root) => {
													DropdownMenu_Root($$anchor, {
														children: ($$anchor, $$slotProps) => {
															var fragment_6 = root_2();
															var node_7 = $.first_child(fragment_6);

															{
																const child = ($$anchor, $$arg0) => {
																	let props = () => ($$arg0?.()).props;

																	Button($$anchor, $.spread_props({ size: 'icon-sm', variant: 'ghost' }, props, {
																		children: ($$anchor, $$slotProps) => {
																			var fragment_8 = root();
																			var node_8 = $.first_child(fragment_8);

																			$.component(node_8, () => Breadcrumb.Ellipsis, ($$anchor, Breadcrumb_Ellipsis) => {
																				Breadcrumb_Ellipsis($$anchor, {});
																			});

																			$.next(2);
																			$.append($$anchor, fragment_8);
																		},
																		$$slots: { default: true }
																	}));
																};

																$.component(node_7, () => DropdownMenu.Trigger, ($$anchor, DropdownMenu_Trigger) => {
																	DropdownMenu_Trigger($$anchor, { child, $$slots: { child: true } });
																});
															}

															var node_9 = $.sibling(node_7, 2);

															$.component(node_9, () => DropdownMenu.Content, ($$anchor, DropdownMenu_Content) => {
																DropdownMenu_Content($$anchor, {
																	align: 'start',
																	children: ($$anchor, $$slotProps) => {
																		var fragment_9 = root_1();
																		var node_10 = $.first_child(fragment_9);

																		$.component(node_10, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item) => {
																			DropdownMenu_Item($$anchor, {
																				children: ($$anchor, $$slotProps) => {
																					$.next();

																					var text_1 = $.text('Documentation');

																					$.append($$anchor, text_1);
																				},
																				$$slots: { default: true }
																			});
																		});

																		var node_11 = $.sibling(node_10, 2);

																		$.component(node_11, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item_1) => {
																			DropdownMenu_Item_1($$anchor, {
																				children: ($$anchor, $$slotProps) => {
																					$.next();

																					var text_2 = $.text('Themes');

																					$.append($$anchor, text_2);
																				},
																				$$slots: { default: true }
																			});
																		});

																		var node_12 = $.sibling(node_11, 2);

																		$.component(node_12, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item_2) => {
																			DropdownMenu_Item_2($$anchor, {
																				children: ($$anchor, $$slotProps) => {
																					$.next();

																					var text_3 = $.text('GitHub');

																					$.append($$anchor, text_3);
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
														},
														$$slots: { default: true }
													});
												});

												$.append($$anchor, fragment_5);
											},
											$$slots: { default: true }
										});
									});

									var node_13 = $.sibling(node_5, 2);

									$.component(node_13, () => Breadcrumb.Separator, ($$anchor, Breadcrumb_Separator_1) => {
										Breadcrumb_Separator_1($$anchor, {});
									});

									var node_14 = $.sibling(node_13, 2);

									$.component(node_14, () => Breadcrumb.Item, ($$anchor, Breadcrumb_Item_2) => {
										Breadcrumb_Item_2($$anchor, {
											children: ($$anchor, $$slotProps) => {
												var fragment_10 = $.comment();
												var node_15 = $.first_child(fragment_10);

												$.component(node_15, () => Breadcrumb.Link, ($$anchor, Breadcrumb_Link_1) => {
													Breadcrumb_Link_1($$anchor, {
														href: '#/',
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_4 = $.text('Components');

															$.append($$anchor, text_4);
														},
														$$slots: { default: true }
													});
												});

												$.append($$anchor, fragment_10);
											},
											$$slots: { default: true }
										});
									});

									var node_16 = $.sibling(node_14, 2);

									$.component(node_16, () => Breadcrumb.Separator, ($$anchor, Breadcrumb_Separator_2) => {
										Breadcrumb_Separator_2($$anchor, {});
									});

									var node_17 = $.sibling(node_16, 2);

									$.component(node_17, () => Breadcrumb.Item, ($$anchor, Breadcrumb_Item_3) => {
										Breadcrumb_Item_3($$anchor, {
											children: ($$anchor, $$slotProps) => {
												var fragment_11 = $.comment();
												var node_18 = $.first_child(fragment_11);

												$.component(node_18, () => Breadcrumb.Page, ($$anchor, Breadcrumb_Page) => {
													Breadcrumb_Page($$anchor, {
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_5 = $.text('Breadcrumb');

															$.append($$anchor, text_5);
														},
														$$slots: { default: true }
													});
												});

												$.append($$anchor, fragment_11);
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
}