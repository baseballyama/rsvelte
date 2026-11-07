import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as ContextMenu from "$lib/registry/ui/context-menu/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!>`, 1);

export default function Context_menu_with_radio($$anchor) {
	let user = $.state("pedro");
	let theme = $.state("light");

	Example($$anchor, {
		title: 'With Radio Group',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = $.comment();
			var node = $.first_child(fragment_1);

			$.component(node, () => ContextMenu.Root, ($$anchor, ContextMenu_Root) => {
				ContextMenu_Root($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = root();
						var node_1 = $.first_child(fragment_2);

						$.component(node_1, () => ContextMenu.Trigger, ($$anchor, ContextMenu_Trigger) => {
							ContextMenu_Trigger($$anchor, {
								class: 'flex aspect-[2/0.5] w-full items-center justify-center rounded-lg border text-sm',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text = $.text('Right click here');

									$.append($$anchor, text);
								},
								$$slots: { default: true }
							});
						});

						var node_2 = $.sibling(node_1, 2);

						$.component(node_2, () => ContextMenu.Content, ($$anchor, ContextMenu_Content) => {
							ContextMenu_Content($$anchor, {
								children: ($$anchor, $$slotProps) => {
									var fragment_3 = root_1();
									var node_3 = $.first_child(fragment_3);

									$.component(node_3, () => ContextMenu.Group, ($$anchor, ContextMenu_Group) => {
										ContextMenu_Group($$anchor, {
											children: ($$anchor, $$slotProps) => {
												var fragment_4 = root();
												var node_4 = $.first_child(fragment_4);

												$.component(node_4, () => ContextMenu.Label, ($$anchor, ContextMenu_Label) => {
													ContextMenu_Label($$anchor, {
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_1 = $.text('People');

															$.append($$anchor, text_1);
														},
														$$slots: { default: true }
													});
												});

												var node_5 = $.sibling(node_4, 2);

												$.component(node_5, () => ContextMenu.RadioGroup, ($$anchor, ContextMenu_RadioGroup) => {
													ContextMenu_RadioGroup($$anchor, {
														get value() {
															return $.get(user);
														},

														set value($$value) {
															$.set(user, $$value, true);
														},

														children: ($$anchor, $$slotProps) => {
															var fragment_5 = root();
															var node_6 = $.first_child(fragment_5);

															$.component(node_6, () => ContextMenu.RadioItem, ($$anchor, ContextMenu_RadioItem) => {
																ContextMenu_RadioItem($$anchor, {
																	value: 'pedro',
																	children: ($$anchor, $$slotProps) => {
																		$.next();

																		var text_2 = $.text('Pedro Duarte');

																		$.append($$anchor, text_2);
																	},
																	$$slots: { default: true }
																});
															});

															var node_7 = $.sibling(node_6, 2);

															$.component(node_7, () => ContextMenu.RadioItem, ($$anchor, ContextMenu_RadioItem_1) => {
																ContextMenu_RadioItem_1($$anchor, {
																	value: 'colm',
																	children: ($$anchor, $$slotProps) => {
																		$.next();

																		var text_3 = $.text('Colm Tuite');

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

												$.append($$anchor, fragment_4);
											},
											$$slots: { default: true }
										});
									});

									var node_8 = $.sibling(node_3, 2);

									$.component(node_8, () => ContextMenu.Separator, ($$anchor, ContextMenu_Separator) => {
										ContextMenu_Separator($$anchor, {});
									});

									var node_9 = $.sibling(node_8, 2);

									$.component(node_9, () => ContextMenu.Group, ($$anchor, ContextMenu_Group_1) => {
										ContextMenu_Group_1($$anchor, {
											children: ($$anchor, $$slotProps) => {
												var fragment_6 = root();
												var node_10 = $.first_child(fragment_6);

												$.component(node_10, () => ContextMenu.Label, ($$anchor, ContextMenu_Label_1) => {
													ContextMenu_Label_1($$anchor, {
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_4 = $.text('Theme');

															$.append($$anchor, text_4);
														},
														$$slots: { default: true }
													});
												});

												var node_11 = $.sibling(node_10, 2);

												$.component(node_11, () => ContextMenu.RadioGroup, ($$anchor, ContextMenu_RadioGroup_1) => {
													ContextMenu_RadioGroup_1($$anchor, {
														get value() {
															return $.get(theme);
														},

														set value($$value) {
															$.set(theme, $$value, true);
														},

														children: ($$anchor, $$slotProps) => {
															var fragment_7 = root_1();
															var node_12 = $.first_child(fragment_7);

															$.component(node_12, () => ContextMenu.RadioItem, ($$anchor, ContextMenu_RadioItem_2) => {
																ContextMenu_RadioItem_2($$anchor, {
																	value: 'light',
																	children: ($$anchor, $$slotProps) => {
																		$.next();

																		var text_5 = $.text('Light');

																		$.append($$anchor, text_5);
																	},
																	$$slots: { default: true }
																});
															});

															var node_13 = $.sibling(node_12, 2);

															$.component(node_13, () => ContextMenu.RadioItem, ($$anchor, ContextMenu_RadioItem_3) => {
																ContextMenu_RadioItem_3($$anchor, {
																	value: 'dark',
																	children: ($$anchor, $$slotProps) => {
																		$.next();

																		var text_6 = $.text('Dark');

																		$.append($$anchor, text_6);
																	},
																	$$slots: { default: true }
																});
															});

															var node_14 = $.sibling(node_13, 2);

															$.component(node_14, () => ContextMenu.RadioItem, ($$anchor, ContextMenu_RadioItem_4) => {
																ContextMenu_RadioItem_4($$anchor, {
																	value: 'system',
																	children: ($$anchor, $$slotProps) => {
																		$.next();

																		var text_7 = $.text('System');

																		$.append($$anchor, text_7);
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