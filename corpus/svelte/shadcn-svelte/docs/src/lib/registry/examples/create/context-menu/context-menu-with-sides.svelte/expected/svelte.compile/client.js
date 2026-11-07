import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as ContextMenu from "$lib/registry/ui/context-menu/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

var root = $.from_html(`<!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);
var root_2 = $.from_html(`<div class="grid grid-cols-2 gap-6"><!> <!> <!> <!></div>`);

export default function Context_menu_with_sides($$anchor) {
	Example($$anchor, {
		title: 'With Sides',
		children: ($$anchor, $$slotProps) => {
			var div = root_2();
			var node = $.child(div);

			$.component(node, () => ContextMenu.Root, ($$anchor, ContextMenu_Root) => {
				ContextMenu_Root($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_1 = root_1();
						var node_1 = $.first_child(fragment_1);

						$.component(node_1, () => ContextMenu.Trigger, ($$anchor, ContextMenu_Trigger) => {
							ContextMenu_Trigger($$anchor, {
								class: 'flex aspect-[2/0.5] w-full items-center justify-center rounded-lg border text-sm',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text = $.text('Right click (top)');

									$.append($$anchor, text);
								},
								$$slots: { default: true }
							});
						});

						var node_2 = $.sibling(node_1, 2);

						$.component(node_2, () => ContextMenu.Content, ($$anchor, ContextMenu_Content) => {
							ContextMenu_Content($$anchor, {
								side: 'top',
								children: ($$anchor, $$slotProps) => {
									var fragment_2 = $.comment();
									var node_3 = $.first_child(fragment_2);

									$.component(node_3, () => ContextMenu.Group, ($$anchor, ContextMenu_Group) => {
										ContextMenu_Group($$anchor, {
											children: ($$anchor, $$slotProps) => {
												var fragment_3 = root();
												var node_4 = $.first_child(fragment_3);

												$.component(node_4, () => ContextMenu.Item, ($$anchor, ContextMenu_Item) => {
													ContextMenu_Item($$anchor, {
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_1 = $.text('Back');

															$.append($$anchor, text_1);
														},
														$$slots: { default: true }
													});
												});

												var node_5 = $.sibling(node_4, 2);

												$.component(node_5, () => ContextMenu.Item, ($$anchor, ContextMenu_Item_1) => {
													ContextMenu_Item_1($$anchor, {
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_2 = $.text('Forward');

															$.append($$anchor, text_2);
														},
														$$slots: { default: true }
													});
												});

												var node_6 = $.sibling(node_5, 2);

												$.component(node_6, () => ContextMenu.Item, ($$anchor, ContextMenu_Item_2) => {
													ContextMenu_Item_2($$anchor, {
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_3 = $.text('Reload');

															$.append($$anchor, text_3);
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
			});

			var node_7 = $.sibling(node, 2);

			$.component(node_7, () => ContextMenu.Root, ($$anchor, ContextMenu_Root_1) => {
				ContextMenu_Root_1($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_4 = root_1();
						var node_8 = $.first_child(fragment_4);

						$.component(node_8, () => ContextMenu.Trigger, ($$anchor, ContextMenu_Trigger_1) => {
							ContextMenu_Trigger_1($$anchor, {
								class: 'flex aspect-[2/0.5] w-full items-center justify-center rounded-lg border text-sm',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_4 = $.text('Right click (right)');

									$.append($$anchor, text_4);
								},
								$$slots: { default: true }
							});
						});

						var node_9 = $.sibling(node_8, 2);

						$.component(node_9, () => ContextMenu.Content, ($$anchor, ContextMenu_Content_1) => {
							ContextMenu_Content_1($$anchor, {
								side: 'right',
								children: ($$anchor, $$slotProps) => {
									var fragment_5 = $.comment();
									var node_10 = $.first_child(fragment_5);

									$.component(node_10, () => ContextMenu.Group, ($$anchor, ContextMenu_Group_1) => {
										ContextMenu_Group_1($$anchor, {
											children: ($$anchor, $$slotProps) => {
												var fragment_6 = root();
												var node_11 = $.first_child(fragment_6);

												$.component(node_11, () => ContextMenu.Item, ($$anchor, ContextMenu_Item_3) => {
													ContextMenu_Item_3($$anchor, {
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_5 = $.text('Back');

															$.append($$anchor, text_5);
														},
														$$slots: { default: true }
													});
												});

												var node_12 = $.sibling(node_11, 2);

												$.component(node_12, () => ContextMenu.Item, ($$anchor, ContextMenu_Item_4) => {
													ContextMenu_Item_4($$anchor, {
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_6 = $.text('Forward');

															$.append($$anchor, text_6);
														},
														$$slots: { default: true }
													});
												});

												var node_13 = $.sibling(node_12, 2);

												$.component(node_13, () => ContextMenu.Item, ($$anchor, ContextMenu_Item_5) => {
													ContextMenu_Item_5($$anchor, {
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_7 = $.text('Reload');

															$.append($$anchor, text_7);
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

						$.append($$anchor, fragment_4);
					},
					$$slots: { default: true }
				});
			});

			var node_14 = $.sibling(node_7, 2);

			$.component(node_14, () => ContextMenu.Root, ($$anchor, ContextMenu_Root_2) => {
				ContextMenu_Root_2($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_7 = root_1();
						var node_15 = $.first_child(fragment_7);

						$.component(node_15, () => ContextMenu.Trigger, ($$anchor, ContextMenu_Trigger_2) => {
							ContextMenu_Trigger_2($$anchor, {
								class: 'flex aspect-[2/0.5] w-full items-center justify-center rounded-lg border text-sm',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_8 = $.text('Right click (bottom)');

									$.append($$anchor, text_8);
								},
								$$slots: { default: true }
							});
						});

						var node_16 = $.sibling(node_15, 2);

						$.component(node_16, () => ContextMenu.Content, ($$anchor, ContextMenu_Content_2) => {
							ContextMenu_Content_2($$anchor, {
								side: 'bottom',
								children: ($$anchor, $$slotProps) => {
									var fragment_8 = $.comment();
									var node_17 = $.first_child(fragment_8);

									$.component(node_17, () => ContextMenu.Group, ($$anchor, ContextMenu_Group_2) => {
										ContextMenu_Group_2($$anchor, {
											children: ($$anchor, $$slotProps) => {
												var fragment_9 = root();
												var node_18 = $.first_child(fragment_9);

												$.component(node_18, () => ContextMenu.Item, ($$anchor, ContextMenu_Item_6) => {
													ContextMenu_Item_6($$anchor, {
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_9 = $.text('Back');

															$.append($$anchor, text_9);
														},
														$$slots: { default: true }
													});
												});

												var node_19 = $.sibling(node_18, 2);

												$.component(node_19, () => ContextMenu.Item, ($$anchor, ContextMenu_Item_7) => {
													ContextMenu_Item_7($$anchor, {
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_10 = $.text('Forward');

															$.append($$anchor, text_10);
														},
														$$slots: { default: true }
													});
												});

												var node_20 = $.sibling(node_19, 2);

												$.component(node_20, () => ContextMenu.Item, ($$anchor, ContextMenu_Item_8) => {
													ContextMenu_Item_8($$anchor, {
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_11 = $.text('Reload');

															$.append($$anchor, text_11);
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
								},
								$$slots: { default: true }
							});
						});

						$.append($$anchor, fragment_7);
					},
					$$slots: { default: true }
				});
			});

			var node_21 = $.sibling(node_14, 2);

			$.component(node_21, () => ContextMenu.Root, ($$anchor, ContextMenu_Root_3) => {
				ContextMenu_Root_3($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_10 = root_1();
						var node_22 = $.first_child(fragment_10);

						$.component(node_22, () => ContextMenu.Trigger, ($$anchor, ContextMenu_Trigger_3) => {
							ContextMenu_Trigger_3($$anchor, {
								class: 'flex aspect-[2/0.5] w-full items-center justify-center rounded-lg border text-sm',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_12 = $.text('Right click (left)');

									$.append($$anchor, text_12);
								},
								$$slots: { default: true }
							});
						});

						var node_23 = $.sibling(node_22, 2);

						$.component(node_23, () => ContextMenu.Content, ($$anchor, ContextMenu_Content_3) => {
							ContextMenu_Content_3($$anchor, {
								side: 'left',
								children: ($$anchor, $$slotProps) => {
									var fragment_11 = $.comment();
									var node_24 = $.first_child(fragment_11);

									$.component(node_24, () => ContextMenu.Group, ($$anchor, ContextMenu_Group_3) => {
										ContextMenu_Group_3($$anchor, {
											children: ($$anchor, $$slotProps) => {
												var fragment_12 = root();
												var node_25 = $.first_child(fragment_12);

												$.component(node_25, () => ContextMenu.Item, ($$anchor, ContextMenu_Item_9) => {
													ContextMenu_Item_9($$anchor, {
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_13 = $.text('Back');

															$.append($$anchor, text_13);
														},
														$$slots: { default: true }
													});
												});

												var node_26 = $.sibling(node_25, 2);

												$.component(node_26, () => ContextMenu.Item, ($$anchor, ContextMenu_Item_10) => {
													ContextMenu_Item_10($$anchor, {
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_14 = $.text('Forward');

															$.append($$anchor, text_14);
														},
														$$slots: { default: true }
													});
												});

												var node_27 = $.sibling(node_26, 2);

												$.component(node_27, () => ContextMenu.Item, ($$anchor, ContextMenu_Item_11) => {
													ContextMenu_Item_11($$anchor, {
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_15 = $.text('Reload');

															$.append($$anchor, text_15);
														},
														$$slots: { default: true }
													});
												});

												$.append($$anchor, fragment_12);
											},
											$$slots: { default: true }
										});
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

			$.reset(div);
			$.append($$anchor, div);
		},
		$$slots: { default: true }
	});
}