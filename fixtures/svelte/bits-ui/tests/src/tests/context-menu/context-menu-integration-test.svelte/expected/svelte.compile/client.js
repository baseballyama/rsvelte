import 'svelte/internal/disclose-version';
import { ContextMenu, Dialog, DropdownMenu, Popover, Select } from "bits-ui";
import * as $ from 'svelte/internal/client';

const contextMenu = ($$anchor, $$arg0) => {
	let id = () => ($$arg0?.()).id;
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => ContextMenu.Root, ($$anchor, ContextMenu_Root) => {
		ContextMenu_Root($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root_1();
				var node_1 = $.first_child(fragment_1);

				$.component(node_1, () => ContextMenu.Trigger, ($$anchor, ContextMenu_Trigger) => {
					ContextMenu_Trigger($$anchor, {
						get 'data-testid'() {
							return `context-trigger-${id() ?? ''}`;
						},
						class: 'z-[100] h-[500px] w-[500px]',
						'aria-expanded': undefined,
						'aria-controls': undefined,
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text = $.text('open');

							$.append($$anchor, text);
						},
						$$slots: { default: true }
					});
				});

				var node_2 = $.sibling(node_1, 2);

				$.component(node_2, () => ContextMenu.Portal, ($$anchor, ContextMenu_Portal) => {
					ContextMenu_Portal($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_2 = $.comment();
							var node_3 = $.first_child(fragment_2);

							$.component(node_3, () => ContextMenu.Content, ($$anchor, ContextMenu_Content) => {
								ContextMenu_Content($$anchor, {
									get 'data-testid'() {
										return `context-content-${id() ?? ''}`;
									},

									children: ($$anchor, $$slotProps) => {
										var fragment_3 = $.comment();
										var node_4 = $.first_child(fragment_3);

										$.component(node_4, () => ContextMenu.Item, ($$anchor, ContextMenu_Item) => {
											ContextMenu_Item($$anchor, {
												children: ($$anchor, $$slotProps) => {
													var span = root();

													$.append($$anchor, span);
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

	$.append($$anchor, fragment);
};

var root = $.from_html(`<span>item</span>`);
var root_1 = $.from_html(`<!> <!>`, 1);
var root_2 = $.from_html(`<!> <!> <!>`, 1);
var root_3 = $.from_html(`<main class="flex flex-col gap-16"><!> <!> <!> <!> <!> <!></main>`);

export default function Context_menu_integration_test($$anchor) {
	var main = root_3();
	var node_5 = $.child(main);

	contextMenu(node_5, () => ({ id: "1" }));

	var node_6 = $.sibling(node_5, 2);

	$.component(node_6, () => DropdownMenu.Root, ($$anchor, DropdownMenu_Root) => {
		DropdownMenu_Root($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var fragment_4 = root_1();
				var node_7 = $.first_child(fragment_4);

				$.component(node_7, () => DropdownMenu.Trigger, ($$anchor, DropdownMenu_Trigger) => {
					DropdownMenu_Trigger($$anchor, {
						'data-testid': 'dropdown-trigger',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_1 = $.text('open');

							$.append($$anchor, text_1);
						},
						$$slots: { default: true }
					});
				});

				var node_8 = $.sibling(node_7, 2);

				$.component(node_8, () => DropdownMenu.Portal, ($$anchor, DropdownMenu_Portal) => {
					DropdownMenu_Portal($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_5 = $.comment();
							var node_9 = $.first_child(fragment_5);

							$.component(node_9, () => DropdownMenu.Content, ($$anchor, DropdownMenu_Content) => {
								DropdownMenu_Content($$anchor, {
									'data-testid': 'dropdown-content',
									children: ($$anchor, $$slotProps) => {
										var fragment_6 = $.comment();
										var node_10 = $.first_child(fragment_6);

										$.component(node_10, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item) => {
											DropdownMenu_Item($$anchor, {
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_2 = $.text('Hello');

													$.append($$anchor, text_2);
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

	var node_11 = $.sibling(node_6, 2);

	contextMenu(node_11, () => ({ id: "2" }));

	var node_12 = $.sibling(node_11, 2);

	$.component(node_12, () => Dialog.Root, ($$anchor, Dialog_Root) => {
		Dialog_Root($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var fragment_7 = root_1();
				var node_13 = $.first_child(fragment_7);

				$.component(node_13, () => Dialog.Trigger, ($$anchor, Dialog_Trigger) => {
					Dialog_Trigger($$anchor, {
						'data-testid': 'dialog-trigger',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_3 = $.text('open');

							$.append($$anchor, text_3);
						},
						$$slots: { default: true }
					});
				});

				var node_14 = $.sibling(node_13, 2);

				$.component(node_14, () => Dialog.Portal, ($$anchor, Dialog_Portal) => {
					Dialog_Portal($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_8 = $.comment();
							var node_15 = $.first_child(fragment_8);

							$.component(node_15, () => Dialog.Content, ($$anchor, Dialog_Content) => {
								Dialog_Content($$anchor, {
									'data-testid': 'dialog-content',
									class: 'z-[10]',
									children: ($$anchor, $$slotProps) => {
										var fragment_9 = root_1();
										var node_16 = $.first_child(fragment_9);

										contextMenu(node_16, () => ({ id: "3" }));

										var node_17 = $.sibling(node_16, 2);

										$.component(node_17, () => Dialog.Close, ($$anchor, Dialog_Close) => {
											Dialog_Close($$anchor, {
												'data-testid': 'dialog-close',
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_4 = $.text('close');

													$.append($$anchor, text_4);
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

	var node_18 = $.sibling(node_12, 2);

	$.component(node_18, () => Popover.Root, ($$anchor, Popover_Root) => {
		Popover_Root($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var fragment_10 = root_1();
				var node_19 = $.first_child(fragment_10);

				$.component(node_19, () => Popover.Trigger, ($$anchor, Popover_Trigger) => {
					Popover_Trigger($$anchor, {
						'data-testid': 'popover-trigger',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_5 = $.text('open');

							$.append($$anchor, text_5);
						},
						$$slots: { default: true }
					});
				});

				var node_20 = $.sibling(node_19, 2);

				$.component(node_20, () => Popover.Portal, ($$anchor, Popover_Portal) => {
					Popover_Portal($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_11 = $.comment();
							var node_21 = $.first_child(fragment_11);

							$.component(node_21, () => Popover.Content, ($$anchor, Popover_Content) => {
								Popover_Content($$anchor, {
									'data-testid': 'popover-content',
									children: ($$anchor, $$slotProps) => {
										contextMenu($$anchor, () => ({ id: "4" }));
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

	var node_22 = $.sibling(node_18, 2);

	$.component(node_22, () => ContextMenu.Root, ($$anchor, ContextMenu_Root_1) => {
		ContextMenu_Root_1($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var fragment_13 = root_1();
				var node_23 = $.first_child(fragment_13);

				$.component(node_23, () => ContextMenu.Trigger, ($$anchor, ContextMenu_Trigger_1) => {
					ContextMenu_Trigger_1($$anchor, {
						'data-testid': 'context-trigger-0',
						class: 'z-[100] h-[500px] w-[500px]',
						'aria-expanded': undefined,
						'aria-controls': undefined,
						children: ($$anchor, $$slotProps) => {
							var fragment_14 = root_2();
							var node_24 = $.first_child(fragment_14);

							$.component(node_24, () => Popover.Root, ($$anchor, Popover_Root_1) => {
								Popover_Root_1($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_15 = root_1();
										var node_25 = $.first_child(fragment_15);

										$.component(node_25, () => Popover.Trigger, ($$anchor, Popover_Trigger_1) => {
											Popover_Trigger_1($$anchor, {
												'data-testid': 'popover-trigger-1',
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_6 = $.text('open');

													$.append($$anchor, text_6);
												},
												$$slots: { default: true }
											});
										});

										var node_26 = $.sibling(node_25, 2);

										$.component(node_26, () => Popover.Portal, ($$anchor, Popover_Portal_1) => {
											Popover_Portal_1($$anchor, {
												children: ($$anchor, $$slotProps) => {
													var fragment_16 = $.comment();
													var node_27 = $.first_child(fragment_16);

													$.component(node_27, () => Popover.Content, ($$anchor, Popover_Content_1) => {
														Popover_Content_1($$anchor, {
															'data-testid': 'popover-content-1',
															children: ($$anchor, $$slotProps) => {
																$.next();

																var text_7 = $.text('Hello');

																$.append($$anchor, text_7);
															},
															$$slots: { default: true }
														});
													});

													$.append($$anchor, fragment_16);
												},
												$$slots: { default: true }
											});
										});

										$.append($$anchor, fragment_15);
									},
									$$slots: { default: true }
								});
							});

							var node_28 = $.sibling(node_24, 2);

							$.component(node_28, () => Select.Root, ($$anchor, Select_Root) => {
								Select_Root($$anchor, {
									type: 'single',
									children: ($$anchor, $$slotProps) => {
										var fragment_17 = root_1();
										var node_29 = $.first_child(fragment_17);

										$.component(node_29, () => Select.Trigger, ($$anchor, Select_Trigger) => {
											Select_Trigger($$anchor, {
												'data-testid': 'select-trigger-1',
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_8 = $.text('open');

													$.append($$anchor, text_8);
												},
												$$slots: { default: true }
											});
										});

										var node_30 = $.sibling(node_29, 2);

										$.component(node_30, () => Select.Portal, ($$anchor, Select_Portal) => {
											Select_Portal($$anchor, {
												children: ($$anchor, $$slotProps) => {
													var fragment_18 = $.comment();
													var node_31 = $.first_child(fragment_18);

													$.component(node_31, () => Select.Content, ($$anchor, Select_Content) => {
														Select_Content($$anchor, {
															'data-testid': 'select-content-1',
															children: ($$anchor, $$slotProps) => {
																var fragment_19 = $.comment();
																var node_32 = $.first_child(fragment_19);

																$.component(node_32, () => Select.Item, ($$anchor, Select_Item) => {
																	Select_Item($$anchor, {
																		value: '1',
																		children: ($$anchor, $$slotProps) => {
																			$.next();

																			var text_9 = $.text('Hello');

																			$.append($$anchor, text_9);
																		},
																		$$slots: { default: true }
																	});
																});

																$.append($$anchor, fragment_19);
															},
															$$slots: { default: true }
														});
													});

													$.append($$anchor, fragment_18);
												},
												$$slots: { default: true }
											});
										});

										$.append($$anchor, fragment_17);
									},
									$$slots: { default: true }
								});
							});

							var node_33 = $.sibling(node_28, 2);

							$.component(node_33, () => Select.Root, ($$anchor, Select_Root_1) => {
								Select_Root_1($$anchor, {
									type: 'single',
									children: ($$anchor, $$slotProps) => {
										var fragment_20 = root_1();
										var node_34 = $.first_child(fragment_20);

										$.component(node_34, () => Select.Trigger, ($$anchor, Select_Trigger_1) => {
											Select_Trigger_1($$anchor, {
												'data-testid': 'select-trigger-2',
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_10 = $.text('open');

													$.append($$anchor, text_10);
												},
												$$slots: { default: true }
											});
										});

										var node_35 = $.sibling(node_34, 2);

										$.component(node_35, () => Select.Portal, ($$anchor, Select_Portal_1) => {
											Select_Portal_1($$anchor, {
												children: ($$anchor, $$slotProps) => {
													var fragment_21 = $.comment();
													var node_36 = $.first_child(fragment_21);

													$.component(node_36, () => Select.Content, ($$anchor, Select_Content_1) => {
														Select_Content_1($$anchor, {
															'data-testid': 'select-content-2',
															children: ($$anchor, $$slotProps) => {
																var fragment_22 = $.comment();
																var node_37 = $.first_child(fragment_22);

																$.component(node_37, () => Select.Item, ($$anchor, Select_Item_1) => {
																	Select_Item_1($$anchor, {
																		value: '1',
																		children: ($$anchor, $$slotProps) => {
																			$.next();

																			var text_11 = $.text('Hello');

																			$.append($$anchor, text_11);
																		},
																		$$slots: { default: true }
																	});
																});

																$.append($$anchor, fragment_22);
															},
															$$slots: { default: true }
														});
													});

													$.append($$anchor, fragment_21);
												},
												$$slots: { default: true }
											});
										});

										$.append($$anchor, fragment_20);
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_14);
						},
						$$slots: { default: true }
					});
				});

				var node_38 = $.sibling(node_23, 2);

				$.component(node_38, () => ContextMenu.Portal, ($$anchor, ContextMenu_Portal_1) => {
					ContextMenu_Portal_1($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_23 = $.comment();
							var node_39 = $.first_child(fragment_23);

							$.component(node_39, () => ContextMenu.Content, ($$anchor, ContextMenu_Content_1) => {
								ContextMenu_Content_1($$anchor, {
									'data-testid': 'context-content-0',
									children: ($$anchor, $$slotProps) => {
										var fragment_24 = $.comment();
										var node_40 = $.first_child(fragment_24);

										$.component(node_40, () => ContextMenu.Item, ($$anchor, ContextMenu_Item_1) => {
											ContextMenu_Item_1($$anchor, {
												children: ($$anchor, $$slotProps) => {
													var span_1 = root();

													$.append($$anchor, span_1);
												},
												$$slots: { default: true }
											});
										});

										$.append($$anchor, fragment_24);
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_23);
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment_13);
			},
			$$slots: { default: true }
		});
	});

	$.reset(main);
	$.append($$anchor, main);
}