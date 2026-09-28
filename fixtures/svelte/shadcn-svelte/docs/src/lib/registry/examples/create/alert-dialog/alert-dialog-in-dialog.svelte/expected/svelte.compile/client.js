import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as AlertDialog from "$lib/registry/ui/alert-dialog/index.js";
import * as Dialog from "$lib/registry/ui/dialog/index.js";
import { Button } from "$lib/registry/ui/button/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

var root = $.from_html(`<!> <!>`, 1);

export default function Alert_dialog_in_dialog($$anchor) {
	let alertOpen = $.state(false);

	Example($$anchor, {
		title: 'In Dialog',
		class: 'items-center',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = $.comment();
			var node = $.first_child(fragment_1);

			$.component(node, () => Dialog.Root, ($$anchor, Dialog_Root) => {
				Dialog_Root($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = root();
						var node_1 = $.first_child(fragment_2);

						$.component(node_1, () => Dialog.Trigger, ($$anchor, Dialog_Trigger) => {
							Dialog_Trigger($$anchor, {
								children: ($$anchor, $$slotProps) => {
									Button($$anchor, {
										variant: 'outline',
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text = $.text('Open Dialog');

											$.append($$anchor, text);
										},
										$$slots: { default: true }
									});
								},
								$$slots: { default: true }
							});
						});

						var node_2 = $.sibling(node_1, 2);

						$.component(node_2, () => Dialog.Content, ($$anchor, Dialog_Content) => {
							Dialog_Content($$anchor, {
								children: ($$anchor, $$slotProps) => {
									var fragment_4 = root();
									var node_3 = $.first_child(fragment_4);

									$.component(node_3, () => Dialog.Header, ($$anchor, Dialog_Header) => {
										Dialog_Header($$anchor, {
											children: ($$anchor, $$slotProps) => {
												var fragment_5 = root();
												var node_4 = $.first_child(fragment_5);

												$.component(node_4, () => Dialog.Title, ($$anchor, Dialog_Title) => {
													Dialog_Title($$anchor, {
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_1 = $.text('Alert Dialog Example');

															$.append($$anchor, text_1);
														},
														$$slots: { default: true }
													});
												});

												var node_5 = $.sibling(node_4, 2);

												$.component(node_5, () => Dialog.Description, ($$anchor, Dialog_Description) => {
													Dialog_Description($$anchor, {
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_2 = $.text('Click the button below to open an alert dialog.');

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

									var node_6 = $.sibling(node_3, 2);

									$.component(node_6, () => Dialog.Footer, ($$anchor, Dialog_Footer) => {
										Dialog_Footer($$anchor, {
											children: ($$anchor, $$slotProps) => {
												var fragment_6 = $.comment();
												var node_7 = $.first_child(fragment_6);

												$.component(node_7, () => AlertDialog.Root, ($$anchor, AlertDialog_Root) => {
													AlertDialog_Root($$anchor, {
														get open() {
															return $.get(alertOpen);
														},

														set open($$value) {
															$.set(alertOpen, $$value, true);
														},

														children: ($$anchor, $$slotProps) => {
															var fragment_7 = root();
															var node_8 = $.first_child(fragment_7);

															$.component(node_8, () => AlertDialog.Trigger, ($$anchor, AlertDialog_Trigger) => {
																AlertDialog_Trigger($$anchor, {
																	children: ($$anchor, $$slotProps) => {
																		Button($$anchor, {
																			children: ($$anchor, $$slotProps) => {
																				$.next();

																				var text_3 = $.text('Open Alert Dialog');

																				$.append($$anchor, text_3);
																			},
																			$$slots: { default: true }
																		});
																	},
																	$$slots: { default: true }
																});
															});

															var node_9 = $.sibling(node_8, 2);

															$.component(node_9, () => AlertDialog.Content, ($$anchor, AlertDialog_Content) => {
																AlertDialog_Content($$anchor, {
																	size: 'sm',
																	children: ($$anchor, $$slotProps) => {
																		var fragment_9 = root();
																		var node_10 = $.first_child(fragment_9);

																		$.component(node_10, () => AlertDialog.Header, ($$anchor, AlertDialog_Header) => {
																			AlertDialog_Header($$anchor, {
																				children: ($$anchor, $$slotProps) => {
																					var fragment_10 = root();
																					var node_11 = $.first_child(fragment_10);

																					$.component(node_11, () => AlertDialog.Title, ($$anchor, AlertDialog_Title) => {
																						AlertDialog_Title($$anchor, {
																							children: ($$anchor, $$slotProps) => {
																								$.next();

																								var text_4 = $.text('Are you absolutely sure?');

																								$.append($$anchor, text_4);
																							},
																							$$slots: { default: true }
																						});
																					});

																					var node_12 = $.sibling(node_11, 2);

																					$.component(node_12, () => AlertDialog.Description, ($$anchor, AlertDialog_Description) => {
																						AlertDialog_Description($$anchor, {
																							children: ($$anchor, $$slotProps) => {
																								$.next();

																								var text_5 = $.text('This action cannot be undone. This will permanently delete your account and remove\n								your data from our servers.');

																								$.append($$anchor, text_5);
																							},
																							$$slots: { default: true }
																						});
																					});

																					$.append($$anchor, fragment_10);
																				},
																				$$slots: { default: true }
																			});
																		});

																		var node_13 = $.sibling(node_10, 2);

																		$.component(node_13, () => AlertDialog.Footer, ($$anchor, AlertDialog_Footer) => {
																			AlertDialog_Footer($$anchor, {
																				children: ($$anchor, $$slotProps) => {
																					var fragment_11 = root();
																					var node_14 = $.first_child(fragment_11);

																					$.component(node_14, () => AlertDialog.Cancel, ($$anchor, AlertDialog_Cancel) => {
																						AlertDialog_Cancel($$anchor, {
																							children: ($$anchor, $$slotProps) => {
																								$.next();

																								var text_6 = $.text('Cancel');

																								$.append($$anchor, text_6);
																							},
																							$$slots: { default: true }
																						});
																					});

																					var node_15 = $.sibling(node_14, 2);

																					$.component(node_15, () => AlertDialog.Action, ($$anchor, AlertDialog_Action) => {
																						AlertDialog_Action($$anchor, {
																							onclick: () => $.set(alertOpen, false),
																							children: ($$anchor, $$slotProps) => {
																								$.next();

																								var text_7 = $.text('Continue');

																								$.append($$anchor, text_7);
																							},
																							$$slots: { default: true }
																						});
																					});

																					$.append($$anchor, fragment_11);
																				},
																				$$slots: { default: true }
																			});
																		});

																		$.append($$anchor, fragment_9);
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

									$.append($$anchor, fragment_4);
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