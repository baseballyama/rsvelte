import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { MediaQuery } from "svelte/reactivity";
import * as Breadcrumb from "$lib/registry/ui/breadcrumb/index.js";
import * as Drawer from "$lib/registry/ui/drawer/index.js";
import * as DropdownMenu from "$lib/registry/ui/dropdown-menu/index.js";
import { buttonVariants } from "$lib/registry/ui/button/index.js";

var root = $.from_html(`<a> </a>`);
var root_1 = $.from_html(`<!> <!>`, 1);
var root_2 = $.from_html(`<a class="py-1 text-sm"> </a>`);
var root_3 = $.from_html(`<!> <div class="grid gap-1 px-4"></div> <!>`, 1);
var root_4 = $.from_html(`<!> <!> <!> <!>`, 1);

export default function Breadcrumb_responsive($$anchor, $$props) {
	$.push($$props, true);

	const items = [
		{ href: "#", label: "Home" },
		{ href: "#", label: "Documentation" },
		{ href: "#", label: "Build Your Application" },
		{ href: "#", label: "Data Fetching" },
		{ label: "Caching and Revalidating" }
	];

	const ITEMS_TO_DISPLAY = 3;
	let open = $.state(false);
	const isDesktop = new MediaQuery("(min-width: 768px)");
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => Breadcrumb.Root, ($$anchor, Breadcrumb_Root) => {
		Breadcrumb_Root($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = $.comment();
				var node_1 = $.first_child(fragment_1);

				$.component(node_1, () => Breadcrumb.List, ($$anchor, Breadcrumb_List) => {
					Breadcrumb_List($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_2 = root_4();
							var node_2 = $.first_child(fragment_2);

							$.component(node_2, () => Breadcrumb.Item, ($$anchor, Breadcrumb_Item) => {
								Breadcrumb_Item($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_3 = $.comment();
										var node_3 = $.first_child(fragment_3);

										$.component(node_3, () => Breadcrumb.Link, ($$anchor, Breadcrumb_Link) => {
											Breadcrumb_Link($$anchor, {
												get href() {
													return items[0].href;
												},

												children: ($$anchor, $$slotProps) => {
													$.next();

													var text = $.text();

													$.template_effect(() => $.set_text(text, items[0].label));
													$.append($$anchor, text);
												},
												$$slots: { default: true }
											});
										});

										$.append($$anchor, fragment_3);
									},
									$$slots: { default: true }
								});
							});

							var node_4 = $.sibling(node_2, 2);

							$.component(node_4, () => Breadcrumb.Separator, ($$anchor, Breadcrumb_Separator) => {
								Breadcrumb_Separator($$anchor, {});
							});

							var node_5 = $.sibling(node_4, 2);

							{
								var consequent_1 = ($$anchor) => {
									var fragment_5 = root_1();
									var node_6 = $.first_child(fragment_5);

									$.component(node_6, () => Breadcrumb.Item, ($$anchor, Breadcrumb_Item_1) => {
										Breadcrumb_Item_1($$anchor, {
											children: ($$anchor, $$slotProps) => {
												var fragment_6 = $.comment();
												var node_7 = $.first_child(fragment_6);

												{
													var consequent = ($$anchor) => {
														var fragment_7 = $.comment();
														var node_8 = $.first_child(fragment_7);

														$.component(node_8, () => DropdownMenu.Root, ($$anchor, DropdownMenu_Root) => {
															DropdownMenu_Root($$anchor, {
																get open() {
																	return $.get(open);
																},

																set open($$value) {
																	$.set(open, $$value, true);
																},

																children: ($$anchor, $$slotProps) => {
																	var fragment_8 = root_1();
																	var node_9 = $.first_child(fragment_8);

																	$.component(node_9, () => DropdownMenu.Trigger, ($$anchor, DropdownMenu_Trigger) => {
																		DropdownMenu_Trigger($$anchor, {
																			class: 'flex items-center gap-1',
																			'aria-label': 'Toggle menu',
																			children: ($$anchor, $$slotProps) => {
																				var fragment_9 = $.comment();
																				var node_10 = $.first_child(fragment_9);

																				$.component(node_10, () => Breadcrumb.Ellipsis, ($$anchor, Breadcrumb_Ellipsis) => {
																					Breadcrumb_Ellipsis($$anchor, { class: 'size-4' });
																				});

																				$.append($$anchor, fragment_9);
																			},
																			$$slots: { default: true }
																		});
																	});

																	var node_11 = $.sibling(node_9, 2);

																	$.component(node_11, () => DropdownMenu.Content, ($$anchor, DropdownMenu_Content) => {
																		DropdownMenu_Content($$anchor, {
																			align: 'start',
																			children: ($$anchor, $$slotProps) => {
																				var fragment_10 = $.comment();
																				var node_12 = $.first_child(fragment_10);

																				$.each(node_12, 17, () => items.slice(1, -2), $.index, ($$anchor, item) => {
																					var fragment_11 = $.comment();
																					var node_13 = $.first_child(fragment_11);

																					$.component(node_13, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item) => {
																						DropdownMenu_Item($$anchor, {
																							children: ($$anchor, $$slotProps) => {
																								var a = root();
																								var text_1 = $.only_child(a, true);

																								$.template_effect(() => {
																									$.set_attribute(a, 'href', $.get(item).href ? $.get(item).href : "#");
																									$.set_text(text_1, $.get(item).label);
																								});

																								$.append($$anchor, a);
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

																	$.append($$anchor, fragment_8);
																},
																$$slots: { default: true }
															});
														});

														$.append($$anchor, fragment_7);
													};

													var alternate = ($$anchor) => {
														var fragment_12 = $.comment();
														var node_14 = $.first_child(fragment_12);

														$.component(node_14, () => Drawer.Root, ($$anchor, Drawer_Root) => {
															Drawer_Root($$anchor, {
																get open() {
																	return $.get(open);
																},

																set open($$value) {
																	$.set(open, $$value, true);
																},

																children: ($$anchor, $$slotProps) => {
																	var fragment_13 = root_1();
																	var node_15 = $.first_child(fragment_13);

																	$.component(node_15, () => Drawer.Trigger, ($$anchor, Drawer_Trigger) => {
																		Drawer_Trigger($$anchor, {
																			'aria-label': 'Toggle Menu',
																			children: ($$anchor, $$slotProps) => {
																				var fragment_14 = $.comment();
																				var node_16 = $.first_child(fragment_14);

																				$.component(node_16, () => Breadcrumb.Ellipsis, ($$anchor, Breadcrumb_Ellipsis_1) => {
																					Breadcrumb_Ellipsis_1($$anchor, { class: 'size-4' });
																				});

																				$.append($$anchor, fragment_14);
																			},
																			$$slots: { default: true }
																		});
																	});

																	var node_17 = $.sibling(node_15, 2);

																	$.component(node_17, () => Drawer.Content, ($$anchor, Drawer_Content) => {
																		Drawer_Content($$anchor, {
																			children: ($$anchor, $$slotProps) => {
																				var fragment_15 = root_3();
																				var node_18 = $.first_child(fragment_15);

																				$.component(node_18, () => Drawer.Header, ($$anchor, Drawer_Header) => {
																					Drawer_Header($$anchor, {
																						class: 'text-start',
																						children: ($$anchor, $$slotProps) => {
																							var fragment_16 = root_1();
																							var node_19 = $.first_child(fragment_16);

																							$.component(node_19, () => Drawer.Title, ($$anchor, Drawer_Title) => {
																								Drawer_Title($$anchor, {
																									children: ($$anchor, $$slotProps) => {
																										$.next();

																										var text_2 = $.text('Navigate to');

																										$.append($$anchor, text_2);
																									},
																									$$slots: { default: true }
																								});
																							});

																							var node_20 = $.sibling(node_19, 2);

																							$.component(node_20, () => Drawer.Description, ($$anchor, Drawer_Description) => {
																								Drawer_Description($$anchor, {
																									children: ($$anchor, $$slotProps) => {
																										$.next();

																										var text_3 = $.text('Select a page to navigate to.');

																										$.append($$anchor, text_3);
																									},
																									$$slots: { default: true }
																								});
																							});

																							$.append($$anchor, fragment_16);
																						},
																						$$slots: { default: true }
																					});
																				});

																				var div = $.sibling(node_18, 2);

																				$.each(div, 21, () => items.slice(1, -2), $.index, ($$anchor, item) => {
																					var a_1 = root_2();
																					var text_4 = $.only_child(a_1, true);

																					$.template_effect(() => {
																						$.set_attribute(a_1, 'href', $.get(item).href ? $.get(item).href : "#");
																						$.set_text(text_4, $.get(item).label);
																					});

																					$.append($$anchor, a_1);
																				});

																				$.reset(div);

																				var node_21 = $.sibling(div, 2);

																				$.component(node_21, () => Drawer.Footer, ($$anchor, Drawer_Footer) => {
																					Drawer_Footer($$anchor, {
																						class: 'pt-4',
																						children: ($$anchor, $$slotProps) => {
																							var fragment_17 = $.comment();
																							var node_22 = $.first_child(fragment_17);

																							{
																								let $0 = $.derived(() => buttonVariants({ variant: "outline" }));

																								$.component(node_22, () => Drawer.Close, ($$anchor, Drawer_Close) => {
																									Drawer_Close($$anchor, {
																										get class() {
																											return $.get($0);
																										},

																										children: ($$anchor, $$slotProps) => {
																											$.next();

																											var text_5 = $.text('Close');

																											$.append($$anchor, text_5);
																										},
																										$$slots: { default: true }
																									});
																								});
																							}

																							$.append($$anchor, fragment_17);
																						},
																						$$slots: { default: true }
																					});
																				});

																				$.append($$anchor, fragment_15);
																			},
																			$$slots: { default: true }
																		});
																	});

																	$.append($$anchor, fragment_13);
																},
																$$slots: { default: true }
															});
														});

														$.append($$anchor, fragment_12);
													};

													$.if(node_7, ($$render) => {
														if (isDesktop.current) $$render(consequent); else $$render(alternate, -1);
													});
												}

												$.append($$anchor, fragment_6);
											},
											$$slots: { default: true }
										});
									});

									var node_23 = $.sibling(node_6, 2);

									$.component(node_23, () => Breadcrumb.Separator, ($$anchor, Breadcrumb_Separator_1) => {
										Breadcrumb_Separator_1($$anchor, {});
									});

									$.append($$anchor, fragment_5);
								};

								$.if(node_5, ($$render) => {
									if (items.length > ITEMS_TO_DISPLAY) $$render(consequent_1);
								});
							}

							var node_24 = $.sibling(node_5, 2);

							$.each(node_24, 17, () => items.slice(-ITEMS_TO_DISPLAY + 1), (item) => item.label, ($$anchor, item) => {
								var fragment_18 = $.comment();
								var node_25 = $.first_child(fragment_18);

								$.component(node_25, () => Breadcrumb.Item, ($$anchor, Breadcrumb_Item_2) => {
									Breadcrumb_Item_2($$anchor, {
										children: ($$anchor, $$slotProps) => {
											var fragment_19 = $.comment();
											var node_26 = $.first_child(fragment_19);

											{
												var consequent_2 = ($$anchor) => {
													var fragment_20 = root_1();
													var node_27 = $.first_child(fragment_20);

													$.component(node_27, () => Breadcrumb.Link, ($$anchor, Breadcrumb_Link_1) => {
														Breadcrumb_Link_1($$anchor, {
															get href() {
																return $.get(item).href;
															},
															class: 'max-w-20 truncate md:max-w-none',
															children: ($$anchor, $$slotProps) => {
																$.next();

																var text_6 = $.text();

																$.template_effect(() => $.set_text(text_6, $.get(item).label));
																$.append($$anchor, text_6);
															},
															$$slots: { default: true }
														});
													});

													var node_28 = $.sibling(node_27, 2);

													$.component(node_28, () => Breadcrumb.Separator, ($$anchor, Breadcrumb_Separator_2) => {
														Breadcrumb_Separator_2($$anchor, {});
													});

													$.append($$anchor, fragment_20);
												};

												var alternate_1 = ($$anchor) => {
													var fragment_22 = $.comment();
													var node_29 = $.first_child(fragment_22);

													$.component(node_29, () => Breadcrumb.Page, ($$anchor, Breadcrumb_Page) => {
														Breadcrumb_Page($$anchor, {
															class: 'max-w-20 truncate md:max-w-none',
															children: ($$anchor, $$slotProps) => {
																$.next();

																var text_7 = $.text();

																$.template_effect(() => $.set_text(text_7, $.get(item).label));
																$.append($$anchor, text_7);
															},
															$$slots: { default: true }
														});
													});

													$.append($$anchor, fragment_22);
												};

												$.if(node_26, ($$render) => {
													if ($.get(item).href) $$render(consequent_2); else $$render(alternate_1, -1);
												});
											}

											$.append($$anchor, fragment_19);
										},
										$$slots: { default: true }
									});
								});

								$.append($$anchor, fragment_18);
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