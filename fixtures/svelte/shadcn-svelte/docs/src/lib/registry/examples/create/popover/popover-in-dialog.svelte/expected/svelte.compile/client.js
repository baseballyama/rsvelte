import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as Dialog from "$lib/registry/ui/dialog/index.js";
import * as Popover from "$lib/registry/ui/popover/index.js";
import { Button } from "$lib/registry/ui/button/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

var root = $.from_html(`<!> <!>`, 1);

export default function Popover_in_dialog($$anchor) {
	Example($$anchor, {
		title: 'In Dialog',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = $.comment();
			var node = $.first_child(fragment_1);

			$.component(node, () => Dialog.Root, ($$anchor, Dialog_Root) => {
				Dialog_Root($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = root();
						var node_1 = $.first_child(fragment_2);

						{
							const child = ($$anchor, $$arg0) => {
								let props = () => ($$arg0?.()).props;

								Button($$anchor, $.spread_props({ variant: 'outline' }, props, {
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text = $.text('Open Dialog');

										$.append($$anchor, text);
									},
									$$slots: { default: true }
								}));
							};

							$.component(node_1, () => Dialog.Trigger, ($$anchor, Dialog_Trigger) => {
								Dialog_Trigger($$anchor, { child, $$slots: { child: true } });
							});
						}

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

															var text_1 = $.text('Popover Example');

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

															var text_2 = $.text('Click the button below to see the popover.');

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

									$.component(node_6, () => Popover.Root, ($$anchor, Popover_Root) => {
										Popover_Root($$anchor, {
											children: ($$anchor, $$slotProps) => {
												var fragment_6 = root();
												var node_7 = $.first_child(fragment_6);

												{
													const child = ($$anchor, $$arg0) => {
														let props = () => ($$arg0?.()).props;

														Button($$anchor, $.spread_props({ variant: 'outline', class: 'w-fit' }, props, {
															children: ($$anchor, $$slotProps) => {
																$.next();

																var text_3 = $.text('Open Popover');

																$.append($$anchor, text_3);
															},
															$$slots: { default: true }
														}));
													};

													$.component(node_7, () => Popover.Trigger, ($$anchor, Popover_Trigger) => {
														Popover_Trigger($$anchor, { child, $$slots: { child: true } });
													});
												}

												var node_8 = $.sibling(node_7, 2);

												$.component(node_8, () => Popover.Content, ($$anchor, Popover_Content) => {
													Popover_Content($$anchor, {
														align: 'start',
														children: ($$anchor, $$slotProps) => {
															var fragment_8 = $.comment();
															var node_9 = $.first_child(fragment_8);

															$.component(node_9, () => Popover.Header, ($$anchor, Popover_Header) => {
																Popover_Header($$anchor, {
																	children: ($$anchor, $$slotProps) => {
																		var fragment_9 = root();
																		var node_10 = $.first_child(fragment_9);

																		$.component(node_10, () => Popover.Title, ($$anchor, Popover_Title) => {
																			Popover_Title($$anchor, {
																				children: ($$anchor, $$slotProps) => {
																					$.next();

																					var text_4 = $.text('Popover in Dialog');

																					$.append($$anchor, text_4);
																				},
																				$$slots: { default: true }
																			});
																		});

																		var node_11 = $.sibling(node_10, 2);

																		$.component(node_11, () => Popover.Description, ($$anchor, Popover_Description) => {
																			Popover_Description($$anchor, {
																				children: ($$anchor, $$slotProps) => {
																					$.next();

																					var text_5 = $.text('This popover appears inside a dialog. Click the button to open it.');

																					$.append($$anchor, text_5);
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