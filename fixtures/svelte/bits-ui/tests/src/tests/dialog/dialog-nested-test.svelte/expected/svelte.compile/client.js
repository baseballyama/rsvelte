import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Dialog } from "bits-ui";

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<main><!> <div id="portalTarget" data-testid="portalTarget"></div></main>`);

export default function Dialog_nested_test($$anchor) {
	var main = root_1();
	var node = $.child(main);

	$.component(node, () => Dialog.Root, ($$anchor, Dialog_Root) => {
		Dialog_Root($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var fragment = root();
				var node_1 = $.first_child(fragment);

				$.component(node_1, () => Dialog.Trigger, ($$anchor, Dialog_Trigger) => {
					Dialog_Trigger($$anchor, {
						'data-testid': 'first-open',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text = $.text('first open');

							$.append($$anchor, text);
						},
						$$slots: { default: true }
					});
				});

				var node_2 = $.sibling(node_1, 2);

				$.component(node_2, () => Dialog.Portal, ($$anchor, Dialog_Portal) => {
					Dialog_Portal($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_1 = root();
							var node_3 = $.first_child(fragment_1);

							$.component(node_3, () => Dialog.Overlay, ($$anchor, Dialog_Overlay) => {
								Dialog_Overlay($$anchor, { 'data-testid': 'first-overlay' });
							});

							var node_4 = $.sibling(node_3, 2);

							$.component(node_4, () => Dialog.Content, ($$anchor, Dialog_Content) => {
								Dialog_Content($$anchor, {
									'data-testid': 'first-content',
									children: ($$anchor, $$slotProps) => {
										var fragment_2 = root();
										var node_5 = $.first_child(fragment_2);

										$.component(node_5, () => Dialog.Close, ($$anchor, Dialog_Close) => {
											Dialog_Close($$anchor, {
												'data-testid': 'first-close',
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_1 = $.text('first close');

													$.append($$anchor, text_1);
												},
												$$slots: { default: true }
											});
										});

										var node_6 = $.sibling(node_5, 2);

										$.component(node_6, () => Dialog.Root, ($$anchor, Dialog_Root_1) => {
											Dialog_Root_1($$anchor, {
												children: ($$anchor, $$slotProps) => {
													var fragment_3 = root();
													var node_7 = $.first_child(fragment_3);

													$.component(node_7, () => Dialog.Trigger, ($$anchor, Dialog_Trigger_1) => {
														Dialog_Trigger_1($$anchor, {
															'data-testid': 'second-open',
															children: ($$anchor, $$slotProps) => {
																$.next();

																var text_2 = $.text('second open');

																$.append($$anchor, text_2);
															},
															$$slots: { default: true }
														});
													});

													var node_8 = $.sibling(node_7, 2);

													$.component(node_8, () => Dialog.Portal, ($$anchor, Dialog_Portal_1) => {
														Dialog_Portal_1($$anchor, {
															children: ($$anchor, $$slotProps) => {
																var fragment_4 = root();
																var node_9 = $.first_child(fragment_4);

																$.component(node_9, () => Dialog.Overlay, ($$anchor, Dialog_Overlay_1) => {
																	Dialog_Overlay_1($$anchor, { 'data-testid': 'second-overlay' });
																});

																var node_10 = $.sibling(node_9, 2);

																$.component(node_10, () => Dialog.Content, ($$anchor, Dialog_Content_1) => {
																	Dialog_Content_1($$anchor, {
																		'data-testid': 'second-content',
																		children: ($$anchor, $$slotProps) => {
																			var fragment_5 = root();
																			var node_11 = $.first_child(fragment_5);

																			$.component(node_11, () => Dialog.Close, ($$anchor, Dialog_Close_1) => {
																				Dialog_Close_1($$anchor, {
																					'data-testid': 'second-close',
																					children: ($$anchor, $$slotProps) => {
																						$.next();

																						var text_3 = $.text('second close');

																						$.append($$anchor, text_3);
																					},
																					$$slots: { default: true }
																				});
																			});

																			var node_12 = $.sibling(node_11, 2);

																			$.component(node_12, () => Dialog.Root, ($$anchor, Dialog_Root_2) => {
																				Dialog_Root_2($$anchor, {
																					children: ($$anchor, $$slotProps) => {
																						var fragment_6 = root();
																						var node_13 = $.first_child(fragment_6);

																						$.component(node_13, () => Dialog.Trigger, ($$anchor, Dialog_Trigger_2) => {
																							Dialog_Trigger_2($$anchor, {
																								'data-testid': 'third-open',
																								children: ($$anchor, $$slotProps) => {
																									$.next();

																									var text_4 = $.text('third open');

																									$.append($$anchor, text_4);
																								},
																								$$slots: { default: true }
																							});
																						});

																						var node_14 = $.sibling(node_13, 2);

																						$.component(node_14, () => Dialog.Portal, ($$anchor, Dialog_Portal_2) => {
																							Dialog_Portal_2($$anchor, {
																								children: ($$anchor, $$slotProps) => {
																									var fragment_7 = root();
																									var node_15 = $.first_child(fragment_7);

																									$.component(node_15, () => Dialog.Overlay, ($$anchor, Dialog_Overlay_2) => {
																										Dialog_Overlay_2($$anchor, { 'data-testid': 'third-overlay' });
																									});

																									var node_16 = $.sibling(node_15, 2);

																									$.component(node_16, () => Dialog.Content, ($$anchor, Dialog_Content_2) => {
																										Dialog_Content_2($$anchor, {
																											'data-testid': 'third-content',
																											children: ($$anchor, $$slotProps) => {
																												var fragment_8 = $.comment();
																												var node_17 = $.first_child(fragment_8);

																												$.component(node_17, () => Dialog.Close, ($$anchor, Dialog_Close_2) => {
																													Dialog_Close_2($$anchor, {
																														'data-testid': 'third-close',
																														children: ($$anchor, $$slotProps) => {
																															$.next();

																															var text_5 = $.text('third close');

																															$.append($$anchor, text_5);
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

	$.next(2);
	$.reset(main);
	$.append($$anchor, main);
}