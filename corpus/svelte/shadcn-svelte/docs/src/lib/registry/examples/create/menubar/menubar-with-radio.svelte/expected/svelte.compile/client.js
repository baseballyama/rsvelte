import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as Menubar from "$lib/registry/ui/menubar/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

var root = $.from_html(`<!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!> <!>`, 1);
var root_2 = $.from_html(`<!> <!>`, 1);

export default function Menubar_with_radio($$anchor) {
	let user = $.state("benoit");
	let theme = $.state("system");

	Example($$anchor, {
		title: 'With Radio',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = $.comment();
			var node = $.first_child(fragment_1);

			$.component(node, () => Menubar.Root, ($$anchor, Menubar_Root) => {
				Menubar_Root($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = root_2();
						var node_1 = $.first_child(fragment_2);

						$.component(node_1, () => Menubar.Menu, ($$anchor, Menubar_Menu) => {
							Menubar_Menu($$anchor, {
								children: ($$anchor, $$slotProps) => {
									var fragment_3 = root_2();
									var node_2 = $.first_child(fragment_3);

									$.component(node_2, () => Menubar.Trigger, ($$anchor, Menubar_Trigger) => {
										Menubar_Trigger($$anchor, {
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text = $.text('Profiles');

												$.append($$anchor, text);
											},
											$$slots: { default: true }
										});
									});

									var node_3 = $.sibling(node_2, 2);

									$.component(node_3, () => Menubar.Content, ($$anchor, Menubar_Content) => {
										Menubar_Content($$anchor, {
											children: ($$anchor, $$slotProps) => {
												var fragment_4 = root_1();
												var node_4 = $.first_child(fragment_4);

												$.component(node_4, () => Menubar.RadioGroup, ($$anchor, Menubar_RadioGroup) => {
													Menubar_RadioGroup($$anchor, {
														get value() {
															return $.get(user);
														},

														set value($$value) {
															$.set(user, $$value, true);
														},

														children: ($$anchor, $$slotProps) => {
															var fragment_5 = root();
															var node_5 = $.first_child(fragment_5);

															$.component(node_5, () => Menubar.RadioItem, ($$anchor, Menubar_RadioItem) => {
																Menubar_RadioItem($$anchor, {
																	value: 'andy',
																	children: ($$anchor, $$slotProps) => {
																		$.next();

																		var text_1 = $.text('Andy');

																		$.append($$anchor, text_1);
																	},
																	$$slots: { default: true }
																});
															});

															var node_6 = $.sibling(node_5, 2);

															$.component(node_6, () => Menubar.RadioItem, ($$anchor, Menubar_RadioItem_1) => {
																Menubar_RadioItem_1($$anchor, {
																	value: 'benoit',
																	children: ($$anchor, $$slotProps) => {
																		$.next();

																		var text_2 = $.text('Benoit');

																		$.append($$anchor, text_2);
																	},
																	$$slots: { default: true }
																});
															});

															var node_7 = $.sibling(node_6, 2);

															$.component(node_7, () => Menubar.RadioItem, ($$anchor, Menubar_RadioItem_2) => {
																Menubar_RadioItem_2($$anchor, {
																	value: 'luis',
																	children: ($$anchor, $$slotProps) => {
																		$.next();

																		var text_3 = $.text('Luis');

																		$.append($$anchor, text_3);
																	},
																	$$slots: { default: true }
																});
															});

															$.append($$anchor, fragment_5);
														},
														$$slots: { default: true }
													});
												});

												var node_8 = $.sibling(node_4, 2);

												$.component(node_8, () => Menubar.Separator, ($$anchor, Menubar_Separator) => {
													Menubar_Separator($$anchor, {});
												});

												var node_9 = $.sibling(node_8, 2);

												$.component(node_9, () => Menubar.Item, ($$anchor, Menubar_Item) => {
													Menubar_Item($$anchor, {
														inset: true,
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_4 = $.text('Edit...');

															$.append($$anchor, text_4);
														},
														$$slots: { default: true }
													});
												});

												var node_10 = $.sibling(node_9, 2);

												$.component(node_10, () => Menubar.Item, ($$anchor, Menubar_Item_1) => {
													Menubar_Item_1($$anchor, {
														inset: true,
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_5 = $.text('Add Profile...');

															$.append($$anchor, text_5);
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
								},
								$$slots: { default: true }
							});
						});

						var node_11 = $.sibling(node_1, 2);

						$.component(node_11, () => Menubar.Menu, ($$anchor, Menubar_Menu_1) => {
							Menubar_Menu_1($$anchor, {
								children: ($$anchor, $$slotProps) => {
									var fragment_6 = root_2();
									var node_12 = $.first_child(fragment_6);

									$.component(node_12, () => Menubar.Trigger, ($$anchor, Menubar_Trigger_1) => {
										Menubar_Trigger_1($$anchor, {
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_6 = $.text('Theme');

												$.append($$anchor, text_6);
											},
											$$slots: { default: true }
										});
									});

									var node_13 = $.sibling(node_12, 2);

									$.component(node_13, () => Menubar.Content, ($$anchor, Menubar_Content_1) => {
										Menubar_Content_1($$anchor, {
											children: ($$anchor, $$slotProps) => {
												var fragment_7 = $.comment();
												var node_14 = $.first_child(fragment_7);

												$.component(node_14, () => Menubar.RadioGroup, ($$anchor, Menubar_RadioGroup_1) => {
													Menubar_RadioGroup_1($$anchor, {
														get value() {
															return $.get(theme);
														},

														set value($$value) {
															$.set(theme, $$value, true);
														},

														children: ($$anchor, $$slotProps) => {
															var fragment_8 = root();
															var node_15 = $.first_child(fragment_8);

															$.component(node_15, () => Menubar.RadioItem, ($$anchor, Menubar_RadioItem_3) => {
																Menubar_RadioItem_3($$anchor, {
																	value: 'light',
																	children: ($$anchor, $$slotProps) => {
																		$.next();

																		var text_7 = $.text('Light');

																		$.append($$anchor, text_7);
																	},
																	$$slots: { default: true }
																});
															});

															var node_16 = $.sibling(node_15, 2);

															$.component(node_16, () => Menubar.RadioItem, ($$anchor, Menubar_RadioItem_4) => {
																Menubar_RadioItem_4($$anchor, {
																	value: 'dark',
																	children: ($$anchor, $$slotProps) => {
																		$.next();

																		var text_8 = $.text('Dark');

																		$.append($$anchor, text_8);
																	},
																	$$slots: { default: true }
																});
															});

															var node_17 = $.sibling(node_16, 2);

															$.component(node_17, () => Menubar.RadioItem, ($$anchor, Menubar_RadioItem_5) => {
																Menubar_RadioItem_5($$anchor, {
																	value: 'system',
																	children: ($$anchor, $$slotProps) => {
																		$.next();

																		var text_9 = $.text('System');

																		$.append($$anchor, text_9);
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