import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Dialog } from "bits-ui";
import { DropdownMenu } from "bits-ui";
import { Popover } from "bits-ui";

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> content`, 1);
var root_2 = $.from_html(`<main><!></main>`);

export default function Dialog_integration_test($$anchor) {
	var main = root_2();
	var node = $.child(main);

	$.component(node, () => Dialog.Root, ($$anchor, Dialog_Root) => {
		Dialog_Root($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var fragment = root();
				var node_1 = $.first_child(fragment);

				$.component(node_1, () => Dialog.Trigger, ($$anchor, Dialog_Trigger) => {
					Dialog_Trigger($$anchor, {
						'data-testid': 'dialog-trigger',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text = $.text('open');

							$.append($$anchor, text);
						},
						$$slots: { default: true }
					});
				});

				var node_2 = $.sibling(node_1, 2);

				$.component(node_2, () => Dialog.Portal, ($$anchor, Dialog_Portal) => {
					Dialog_Portal($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_1 = $.comment();
							var node_3 = $.first_child(fragment_1);

							$.component(node_3, () => Dialog.Content, ($$anchor, Dialog_Content) => {
								Dialog_Content($$anchor, {
									'data-testid': 'dialog-content',
									children: ($$anchor, $$slotProps) => {
										var fragment_2 = root_1();
										var node_4 = $.first_child(fragment_2);

										$.component(node_4, () => DropdownMenu.Root, ($$anchor, DropdownMenu_Root) => {
											DropdownMenu_Root($$anchor, {
												children: ($$anchor, $$slotProps) => {
													var fragment_3 = root();
													var node_5 = $.first_child(fragment_3);

													$.component(node_5, () => DropdownMenu.Trigger, ($$anchor, DropdownMenu_Trigger) => {
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

													var node_6 = $.sibling(node_5, 2);

													$.component(node_6, () => DropdownMenu.Portal, ($$anchor, DropdownMenu_Portal) => {
														DropdownMenu_Portal($$anchor, {
															children: ($$anchor, $$slotProps) => {
																var fragment_4 = $.comment();
																var node_7 = $.first_child(fragment_4);

																$.component(node_7, () => DropdownMenu.Content, ($$anchor, DropdownMenu_Content) => {
																	DropdownMenu_Content($$anchor, {
																		'data-testid': 'dropdown-content',
																		children: ($$anchor, $$slotProps) => {
																			var fragment_5 = $.comment();
																			var node_8 = $.first_child(fragment_5);

																			$.component(node_8, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item) => {
																				DropdownMenu_Item($$anchor, {
																					children: ($$anchor, $$slotProps) => {
																						$.next();

																						var text_2 = $.text('item');

																						$.append($$anchor, text_2);
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

													$.append($$anchor, fragment_3);
												},
												$$slots: { default: true }
											});
										});

										var node_9 = $.sibling(node_4, 2);

										$.component(node_9, () => Popover.Root, ($$anchor, Popover_Root) => {
											Popover_Root($$anchor, {
												children: ($$anchor, $$slotProps) => {
													var fragment_6 = root();
													var node_10 = $.first_child(fragment_6);

													$.component(node_10, () => Popover.Trigger, ($$anchor, Popover_Trigger) => {
														Popover_Trigger($$anchor, {
															'data-testid': 'popover-trigger',
															children: ($$anchor, $$slotProps) => {
																$.next();

																var text_3 = $.text('open');

																$.append($$anchor, text_3);
															},
															$$slots: { default: true }
														});
													});

													var node_11 = $.sibling(node_10, 2);

													$.component(node_11, () => Popover.Portal, ($$anchor, Popover_Portal) => {
														Popover_Portal($$anchor, {
															children: ($$anchor, $$slotProps) => {
																var fragment_7 = $.comment();
																var node_12 = $.first_child(fragment_7);

																$.component(node_12, () => Popover.Content, ($$anchor, Popover_Content) => {
																	Popover_Content($$anchor, {
																		'data-testid': 'popover-content',
																		children: ($$anchor, $$slotProps) => {
																			$.next();

																			var text_4 = $.text('content');

																			$.append($$anchor, text_4);
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

										$.next();
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
			},
			$$slots: { default: true }
		});
	});

	$.reset(main);
	$.append($$anchor, main);
}