import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Dialog, AlertDialog } from "bits-ui";

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!> <!> <!>`, 1);
var root_2 = $.from_html(`<main><!> <!> <div id="portalTarget" data-testid="portalTarget"></div></main>`);

export default function Dialog_alert_dialog_nested_test($$anchor) {
	var main = root_2();
	var node = $.child(main);

	$.component(node, () => Dialog.Root, ($$anchor, Dialog_Root) => {
		Dialog_Root($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var fragment = root();
				var node_1 = $.first_child(fragment);

				$.component(node_1, () => Dialog.Trigger, ($$anchor, Dialog_Trigger) => {
					Dialog_Trigger($$anchor, {
						'data-testid': 'dialog-open',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text = $.text('dialog open');

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
								Dialog_Overlay($$anchor, { 'data-testid': 'dialog-overlay' });
							});

							var node_4 = $.sibling(node_3, 2);

							$.component(node_4, () => Dialog.Content, ($$anchor, Dialog_Content) => {
								Dialog_Content($$anchor, {
									'data-testid': 'dialog-content',
									children: ($$anchor, $$slotProps) => {
										var fragment_2 = root();
										var node_5 = $.first_child(fragment_2);

										$.component(node_5, () => Dialog.Close, ($$anchor, Dialog_Close) => {
											Dialog_Close($$anchor, {
												'data-testid': 'dialog-close',
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_1 = $.text('dialog close');

													$.append($$anchor, text_1);
												},
												$$slots: { default: true }
											});
										});

										var node_6 = $.sibling(node_5, 2);

										$.component(node_6, () => AlertDialog.Root, ($$anchor, AlertDialog_Root) => {
											AlertDialog_Root($$anchor, {
												children: ($$anchor, $$slotProps) => {
													var fragment_3 = root();
													var node_7 = $.first_child(fragment_3);

													$.component(node_7, () => AlertDialog.Trigger, ($$anchor, AlertDialog_Trigger) => {
														AlertDialog_Trigger($$anchor, {
															'data-testid': 'alert-open',
															children: ($$anchor, $$slotProps) => {
																$.next();

																var text_2 = $.text('alert open');

																$.append($$anchor, text_2);
															},
															$$slots: { default: true }
														});
													});

													var node_8 = $.sibling(node_7, 2);

													$.component(node_8, () => AlertDialog.Portal, ($$anchor, AlertDialog_Portal) => {
														AlertDialog_Portal($$anchor, {
															children: ($$anchor, $$slotProps) => {
																var fragment_4 = root();
																var node_9 = $.first_child(fragment_4);

																$.component(node_9, () => AlertDialog.Overlay, ($$anchor, AlertDialog_Overlay) => {
																	AlertDialog_Overlay($$anchor, { 'data-testid': 'alert-overlay' });
																});

																var node_10 = $.sibling(node_9, 2);

																$.component(node_10, () => AlertDialog.Content, ($$anchor, AlertDialog_Content) => {
																	AlertDialog_Content($$anchor, {
																		'data-testid': 'alert-content',
																		children: ($$anchor, $$slotProps) => {
																			var fragment_5 = root_1();
																			var node_11 = $.first_child(fragment_5);

																			$.component(node_11, () => AlertDialog.Title, ($$anchor, AlertDialog_Title) => {
																				AlertDialog_Title($$anchor, {
																					'data-testid': 'alert-title',
																					children: ($$anchor, $$slotProps) => {
																						$.next();

																						var text_3 = $.text('Alert Title');

																						$.append($$anchor, text_3);
																					},
																					$$slots: { default: true }
																				});
																			});

																			var node_12 = $.sibling(node_11, 2);

																			$.component(node_12, () => AlertDialog.Description, ($$anchor, AlertDialog_Description) => {
																				AlertDialog_Description($$anchor, {
																					'data-testid': 'alert-description',
																					children: ($$anchor, $$slotProps) => {
																						$.next();

																						var text_4 = $.text('Alert Description');

																						$.append($$anchor, text_4);
																					},
																					$$slots: { default: true }
																				});
																			});

																			var node_13 = $.sibling(node_12, 2);

																			$.component(node_13, () => AlertDialog.Cancel, ($$anchor, AlertDialog_Cancel) => {
																				AlertDialog_Cancel($$anchor, {
																					'data-testid': 'alert-cancel',
																					children: ($$anchor, $$slotProps) => {
																						$.next();

																						var text_5 = $.text('alert cancel');

																						$.append($$anchor, text_5);
																					},
																					$$slots: { default: true }
																				});
																			});

																			var node_14 = $.sibling(node_13, 2);

																			$.component(node_14, () => AlertDialog.Action, ($$anchor, AlertDialog_Action) => {
																				AlertDialog_Action($$anchor, {
																					'data-testid': 'alert-action',
																					children: ($$anchor, $$slotProps) => {
																						$.next();

																						var text_6 = $.text('alert action');

																						$.append($$anchor, text_6);
																					},
																					$$slots: { default: true }
																				});
																			});

																			var node_15 = $.sibling(node_14, 2);

																			$.component(node_15, () => Dialog.Root, ($$anchor, Dialog_Root_1) => {
																				Dialog_Root_1($$anchor, {
																					children: ($$anchor, $$slotProps) => {
																						var fragment_6 = root();
																						var node_16 = $.first_child(fragment_6);

																						$.component(node_16, () => Dialog.Trigger, ($$anchor, Dialog_Trigger_1) => {
																							Dialog_Trigger_1($$anchor, {
																								'data-testid': 'nested-dialog-open',
																								children: ($$anchor, $$slotProps) => {
																									$.next();

																									var text_7 = $.text('nested dialog open');

																									$.append($$anchor, text_7);
																								},
																								$$slots: { default: true }
																							});
																						});

																						var node_17 = $.sibling(node_16, 2);

																						$.component(node_17, () => Dialog.Portal, ($$anchor, Dialog_Portal_1) => {
																							Dialog_Portal_1($$anchor, {
																								children: ($$anchor, $$slotProps) => {
																									var fragment_7 = root();
																									var node_18 = $.first_child(fragment_7);

																									$.component(node_18, () => Dialog.Overlay, ($$anchor, Dialog_Overlay_1) => {
																										Dialog_Overlay_1($$anchor, { 'data-testid': 'nested-dialog-overlay' });
																									});

																									var node_19 = $.sibling(node_18, 2);

																									$.component(node_19, () => Dialog.Content, ($$anchor, Dialog_Content_1) => {
																										Dialog_Content_1($$anchor, {
																											'data-testid': 'nested-dialog-content',
																											children: ($$anchor, $$slotProps) => {
																												var fragment_8 = $.comment();
																												var node_20 = $.first_child(fragment_8);

																												$.component(node_20, () => Dialog.Close, ($$anchor, Dialog_Close_1) => {
																													Dialog_Close_1($$anchor, {
																														'data-testid': 'nested-dialog-close',
																														children: ($$anchor, $$slotProps) => {
																															$.next();

																															var text_8 = $.text('nested dialog close');

																															$.append($$anchor, text_8);
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

	var node_21 = $.sibling(node, 2);

	$.component(node_21, () => AlertDialog.Root, ($$anchor, AlertDialog_Root_1) => {
		AlertDialog_Root_1($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var fragment_9 = root();
				var node_22 = $.first_child(fragment_9);

				$.component(node_22, () => AlertDialog.Trigger, ($$anchor, AlertDialog_Trigger_1) => {
					AlertDialog_Trigger_1($$anchor, {
						'data-testid': 'alert-first-open',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_9 = $.text('alert first open');

							$.append($$anchor, text_9);
						},
						$$slots: { default: true }
					});
				});

				var node_23 = $.sibling(node_22, 2);

				$.component(node_23, () => AlertDialog.Portal, ($$anchor, AlertDialog_Portal_1) => {
					AlertDialog_Portal_1($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_10 = root();
							var node_24 = $.first_child(fragment_10);

							$.component(node_24, () => AlertDialog.Overlay, ($$anchor, AlertDialog_Overlay_1) => {
								AlertDialog_Overlay_1($$anchor, { 'data-testid': 'alert-first-overlay' });
							});

							var node_25 = $.sibling(node_24, 2);

							$.component(node_25, () => AlertDialog.Content, ($$anchor, AlertDialog_Content_1) => {
								AlertDialog_Content_1($$anchor, {
									'data-testid': 'alert-first-content',
									children: ($$anchor, $$slotProps) => {
										var fragment_11 = root_1();
										var node_26 = $.first_child(fragment_11);

										$.component(node_26, () => AlertDialog.Title, ($$anchor, AlertDialog_Title_1) => {
											AlertDialog_Title_1($$anchor, {
												'data-testid': 'alert-first-title',
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_10 = $.text('Alert First Title');

													$.append($$anchor, text_10);
												},
												$$slots: { default: true }
											});
										});

										var node_27 = $.sibling(node_26, 2);

										$.component(node_27, () => AlertDialog.Description, ($$anchor, AlertDialog_Description_1) => {
											AlertDialog_Description_1($$anchor, {
												'data-testid': 'alert-first-description',
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_11 = $.text('Alert First Description');

													$.append($$anchor, text_11);
												},
												$$slots: { default: true }
											});
										});

										var node_28 = $.sibling(node_27, 2);

										$.component(node_28, () => AlertDialog.Cancel, ($$anchor, AlertDialog_Cancel_1) => {
											AlertDialog_Cancel_1($$anchor, {
												'data-testid': 'alert-first-cancel',
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_12 = $.text('alert first cancel');

													$.append($$anchor, text_12);
												},
												$$slots: { default: true }
											});
										});

										var node_29 = $.sibling(node_28, 2);

										$.component(node_29, () => AlertDialog.Action, ($$anchor, AlertDialog_Action_1) => {
											AlertDialog_Action_1($$anchor, {
												'data-testid': 'alert-first-action',
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_13 = $.text('alert first action');

													$.append($$anchor, text_13);
												},
												$$slots: { default: true }
											});
										});

										var node_30 = $.sibling(node_29, 2);

										$.component(node_30, () => Dialog.Root, ($$anchor, Dialog_Root_2) => {
											Dialog_Root_2($$anchor, {
												children: ($$anchor, $$slotProps) => {
													var fragment_12 = root();
													var node_31 = $.first_child(fragment_12);

													$.component(node_31, () => Dialog.Trigger, ($$anchor, Dialog_Trigger_2) => {
														Dialog_Trigger_2($$anchor, {
															'data-testid': 'dialog-nested-open',
															children: ($$anchor, $$slotProps) => {
																$.next();

																var text_14 = $.text('dialog nested open');

																$.append($$anchor, text_14);
															},
															$$slots: { default: true }
														});
													});

													var node_32 = $.sibling(node_31, 2);

													$.component(node_32, () => Dialog.Portal, ($$anchor, Dialog_Portal_2) => {
														Dialog_Portal_2($$anchor, {
															children: ($$anchor, $$slotProps) => {
																var fragment_13 = root();
																var node_33 = $.first_child(fragment_13);

																$.component(node_33, () => Dialog.Overlay, ($$anchor, Dialog_Overlay_2) => {
																	Dialog_Overlay_2($$anchor, { 'data-testid': 'dialog-nested-overlay' });
																});

																var node_34 = $.sibling(node_33, 2);

																$.component(node_34, () => Dialog.Content, ($$anchor, Dialog_Content_2) => {
																	Dialog_Content_2($$anchor, {
																		'data-testid': 'dialog-nested-content',
																		children: ($$anchor, $$slotProps) => {
																			var fragment_14 = $.comment();
																			var node_35 = $.first_child(fragment_14);

																			$.component(node_35, () => Dialog.Close, ($$anchor, Dialog_Close_2) => {
																				Dialog_Close_2($$anchor, {
																					'data-testid': 'dialog-nested-close',
																					children: ($$anchor, $$slotProps) => {
																						$.next();

																						var text_15 = $.text('dialog nested close');

																						$.append($$anchor, text_15);
																					},
																					$$slots: { default: true }
																				});
																			});

																			$.append($$anchor, fragment_14);
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

				$.append($$anchor, fragment_9);
			},
			$$slots: { default: true }
		});
	});

	$.next(2);
	$.reset(main);
	$.append($$anchor, main);
}