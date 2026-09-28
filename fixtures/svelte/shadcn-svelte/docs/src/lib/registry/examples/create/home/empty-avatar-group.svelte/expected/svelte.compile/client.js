import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as AlertDialog from "$lib/registry/ui/alert-dialog/index.js";
import * as Avatar from "$lib/registry/ui/avatar/index.js";
import * as Empty from "$lib/registry/ui/empty/index.js";
import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
import { Button } from "$lib/registry/ui/button/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!>`, 1);
var root_2 = $.from_html(`<div class="flex gap-2"><!> <!></div>`);

export default function Empty_avatar_group($$anchor) {
	Example($$anchor, {
		title: 'Empty',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = $.comment();
			var node = $.first_child(fragment_1);

			$.component(node, () => Empty.Root, ($$anchor, Empty_Root) => {
				Empty_Root($$anchor, {
					class: 'h-full flex-none border',
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = root();
						var node_1 = $.first_child(fragment_2);

						$.component(node_1, () => Empty.Header, ($$anchor, Empty_Header) => {
							Empty_Header($$anchor, {
								children: ($$anchor, $$slotProps) => {
									var fragment_3 = root_1();
									var node_2 = $.first_child(fragment_3);

									$.component(node_2, () => Empty.Media, ($$anchor, Empty_Media) => {
										Empty_Media($$anchor, {
											children: ($$anchor, $$slotProps) => {
												var fragment_4 = $.comment();
												var node_3 = $.first_child(fragment_4);

												$.component(node_3, () => Avatar.Group, ($$anchor, Avatar_Group) => {
													Avatar_Group($$anchor, {
														class: 'grayscale',
														children: ($$anchor, $$slotProps) => {
															var fragment_5 = root_1();
															var node_4 = $.first_child(fragment_5);

															$.component(node_4, () => Avatar.Root, ($$anchor, Avatar_Root) => {
																Avatar_Root($$anchor, {
																	size: 'lg',
																	children: ($$anchor, $$slotProps) => {
																		var fragment_6 = root();
																		var node_5 = $.first_child(fragment_6);

																		$.component(node_5, () => Avatar.Image, ($$anchor, Avatar_Image) => {
																			Avatar_Image($$anchor, { src: 'https://github.com/shadcn.png', alt: '@shadcn' });
																		});

																		var node_6 = $.sibling(node_5, 2);

																		$.component(node_6, () => Avatar.Fallback, ($$anchor, Avatar_Fallback) => {
																			Avatar_Fallback($$anchor, {
																				children: ($$anchor, $$slotProps) => {
																					$.next();

																					var text = $.text('CN');

																					$.append($$anchor, text);
																				},
																				$$slots: { default: true }
																			});
																		});

																		$.append($$anchor, fragment_6);
																	},
																	$$slots: { default: true }
																});
															});

															var node_7 = $.sibling(node_4, 2);

															$.component(node_7, () => Avatar.Root, ($$anchor, Avatar_Root_1) => {
																Avatar_Root_1($$anchor, {
																	size: 'lg',
																	children: ($$anchor, $$slotProps) => {
																		var fragment_7 = root();
																		var node_8 = $.first_child(fragment_7);

																		$.component(node_8, () => Avatar.Image, ($$anchor, Avatar_Image_1) => {
																			Avatar_Image_1($$anchor, { src: 'https://github.com/maxleiter.png', alt: '@maxleiter' });
																		});

																		var node_9 = $.sibling(node_8, 2);

																		$.component(node_9, () => Avatar.Fallback, ($$anchor, Avatar_Fallback_1) => {
																			Avatar_Fallback_1($$anchor, {
																				children: ($$anchor, $$slotProps) => {
																					$.next();

																					var text_1 = $.text('LR');

																					$.append($$anchor, text_1);
																				},
																				$$slots: { default: true }
																			});
																		});

																		$.append($$anchor, fragment_7);
																	},
																	$$slots: { default: true }
																});
															});

															var node_10 = $.sibling(node_7, 2);

															$.component(node_10, () => Avatar.Root, ($$anchor, Avatar_Root_2) => {
																Avatar_Root_2($$anchor, {
																	size: 'lg',
																	children: ($$anchor, $$slotProps) => {
																		var fragment_8 = root();
																		var node_11 = $.first_child(fragment_8);

																		$.component(node_11, () => Avatar.Image, ($$anchor, Avatar_Image_2) => {
																			Avatar_Image_2($$anchor, { src: 'https://github.com/evilrabbit.png', alt: '@evilrabbit' });
																		});

																		var node_12 = $.sibling(node_11, 2);

																		$.component(node_12, () => Avatar.Fallback, ($$anchor, Avatar_Fallback_2) => {
																			Avatar_Fallback_2($$anchor, {
																				children: ($$anchor, $$slotProps) => {
																					$.next();

																					var text_2 = $.text('ER');

																					$.append($$anchor, text_2);
																				},
																				$$slots: { default: true }
																			});
																		});

																		$.append($$anchor, fragment_8);
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

									var node_13 = $.sibling(node_2, 2);

									$.component(node_13, () => Empty.Title, ($$anchor, Empty_Title) => {
										Empty_Title($$anchor, {
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_3 = $.text('No Team Members');

												$.append($$anchor, text_3);
											},
											$$slots: { default: true }
										});
									});

									var node_14 = $.sibling(node_13, 2);

									$.component(node_14, () => Empty.Description, ($$anchor, Empty_Description) => {
										Empty_Description($$anchor, {
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_4 = $.text('Invite your team to collaborate on this project.');

												$.append($$anchor, text_4);
											},
											$$slots: { default: true }
										});
									});

									$.append($$anchor, fragment_3);
								},
								$$slots: { default: true }
							});
						});

						var node_15 = $.sibling(node_1, 2);

						$.component(node_15, () => Empty.Content, ($$anchor, Empty_Content) => {
							Empty_Content($$anchor, {
								children: ($$anchor, $$slotProps) => {
									var div = root_2();
									var node_16 = $.child(div);

									$.component(node_16, () => AlertDialog.Root, ($$anchor, AlertDialog_Root) => {
										AlertDialog_Root($$anchor, {
											children: ($$anchor, $$slotProps) => {
												var fragment_9 = root();
												var node_17 = $.first_child(fragment_9);

												{
													const child = ($$anchor, $$arg0) => {
														let props = () => ($$arg0?.()).props;

														Button($$anchor, $.spread_props({ variant: 'outline' }, props, {
															children: ($$anchor, $$slotProps) => {
																$.next();

																var text_5 = $.text('Show Dialog');

																$.append($$anchor, text_5);
															},
															$$slots: { default: true }
														}));
													};

													$.component(node_17, () => AlertDialog.Trigger, ($$anchor, AlertDialog_Trigger) => {
														AlertDialog_Trigger($$anchor, { child, $$slots: { child: true } });
													});
												}

												var node_18 = $.sibling(node_17, 2);

												$.component(node_18, () => AlertDialog.Content, ($$anchor, AlertDialog_Content) => {
													AlertDialog_Content($$anchor, {
														children: ($$anchor, $$slotProps) => {
															var fragment_11 = root();
															var node_19 = $.first_child(fragment_11);

															$.component(node_19, () => AlertDialog.Header, ($$anchor, AlertDialog_Header) => {
																AlertDialog_Header($$anchor, {
																	children: ($$anchor, $$slotProps) => {
																		var fragment_12 = root();
																		var node_20 = $.first_child(fragment_12);

																		$.component(node_20, () => AlertDialog.Title, ($$anchor, AlertDialog_Title) => {
																			AlertDialog_Title($$anchor, {
																				children: ($$anchor, $$slotProps) => {
																					$.next();

																					var text_6 = $.text('Are you absolutely sure?');

																					$.append($$anchor, text_6);
																				},
																				$$slots: { default: true }
																			});
																		});

																		var node_21 = $.sibling(node_20, 2);

																		$.component(node_21, () => AlertDialog.Description, ($$anchor, AlertDialog_Description) => {
																			AlertDialog_Description($$anchor, {
																				children: ($$anchor, $$slotProps) => {
																					$.next();

																					var text_7 = $.text('This action cannot be undone. This will permanently delete your account and remove\n								your data from our servers.');

																					$.append($$anchor, text_7);
																				},
																				$$slots: { default: true }
																			});
																		});

																		$.append($$anchor, fragment_12);
																	},
																	$$slots: { default: true }
																});
															});

															var node_22 = $.sibling(node_19, 2);

															$.component(node_22, () => AlertDialog.Footer, ($$anchor, AlertDialog_Footer) => {
																AlertDialog_Footer($$anchor, {
																	children: ($$anchor, $$slotProps) => {
																		var fragment_13 = root();
																		var node_23 = $.first_child(fragment_13);

																		$.component(node_23, () => AlertDialog.Cancel, ($$anchor, AlertDialog_Cancel) => {
																			AlertDialog_Cancel($$anchor, {
																				children: ($$anchor, $$slotProps) => {
																					$.next();

																					var text_8 = $.text('Cancel');

																					$.append($$anchor, text_8);
																				},
																				$$slots: { default: true }
																			});
																		});

																		var node_24 = $.sibling(node_23, 2);

																		$.component(node_24, () => AlertDialog.Action, ($$anchor, AlertDialog_Action) => {
																			AlertDialog_Action($$anchor, {
																				children: ($$anchor, $$slotProps) => {
																					$.next();

																					var text_9 = $.text('Continue');

																					$.append($$anchor, text_9);
																				},
																				$$slots: { default: true }
																			});
																		});

																		$.append($$anchor, fragment_13);
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

									var node_25 = $.sibling(node_16, 2);

									$.component(node_25, () => AlertDialog.Root, ($$anchor, AlertDialog_Root_1) => {
										AlertDialog_Root_1($$anchor, {
											children: ($$anchor, $$slotProps) => {
												var fragment_14 = root();
												var node_26 = $.first_child(fragment_14);

												{
													const child = ($$anchor, $$arg0) => {
														let props = () => ($$arg0?.()).props;

														Button($$anchor, $.spread_props(props, {
															children: ($$anchor, $$slotProps) => {
																$.next();

																var text_10 = $.text('Connect Mouse');

																$.append($$anchor, text_10);
															},
															$$slots: { default: true }
														}));
													};

													$.component(node_26, () => AlertDialog.Trigger, ($$anchor, AlertDialog_Trigger_1) => {
														AlertDialog_Trigger_1($$anchor, { child, $$slots: { child: true } });
													});
												}

												var node_27 = $.sibling(node_26, 2);

												$.component(node_27, () => AlertDialog.Content, ($$anchor, AlertDialog_Content_1) => {
													AlertDialog_Content_1($$anchor, {
														size: 'sm',
														children: ($$anchor, $$slotProps) => {
															var fragment_16 = root();
															var node_28 = $.first_child(fragment_16);

															$.component(node_28, () => AlertDialog.Header, ($$anchor, AlertDialog_Header_1) => {
																AlertDialog_Header_1($$anchor, {
																	children: ($$anchor, $$slotProps) => {
																		var fragment_17 = root_1();
																		var node_29 = $.first_child(fragment_17);

																		$.component(node_29, () => AlertDialog.Media, ($$anchor, AlertDialog_Media) => {
																			AlertDialog_Media($$anchor, {
																				children: ($$anchor, $$slotProps) => {
																					IconPlaceholder($$anchor, {
																						lucide: 'BluetoothIcon',
																						tabler: 'IconBluetooth',
																						hugeicons: 'BluetoothIcon',
																						phosphor: 'BluetoothIcon',
																						remixicon: 'RiBluetoothLine'
																					});
																				},
																				$$slots: { default: true }
																			});
																		});

																		var node_30 = $.sibling(node_29, 2);

																		$.component(node_30, () => AlertDialog.Title, ($$anchor, AlertDialog_Title_1) => {
																			AlertDialog_Title_1($$anchor, {
																				children: ($$anchor, $$slotProps) => {
																					$.next();

																					var text_11 = $.text('Allow accessory to connect?');

																					$.append($$anchor, text_11);
																				},
																				$$slots: { default: true }
																			});
																		});

																		var node_31 = $.sibling(node_30, 2);

																		$.component(node_31, () => AlertDialog.Description, ($$anchor, AlertDialog_Description_1) => {
																			AlertDialog_Description_1($$anchor, {
																				children: ($$anchor, $$slotProps) => {
																					$.next();

																					var text_12 = $.text('Do you want to allow the USB accessory to connect to this device?');

																					$.append($$anchor, text_12);
																				},
																				$$slots: { default: true }
																			});
																		});

																		$.append($$anchor, fragment_17);
																	},
																	$$slots: { default: true }
																});
															});

															var node_32 = $.sibling(node_28, 2);

															$.component(node_32, () => AlertDialog.Footer, ($$anchor, AlertDialog_Footer_1) => {
																AlertDialog_Footer_1($$anchor, {
																	children: ($$anchor, $$slotProps) => {
																		var fragment_19 = root();
																		var node_33 = $.first_child(fragment_19);

																		$.component(node_33, () => AlertDialog.Cancel, ($$anchor, AlertDialog_Cancel_1) => {
																			AlertDialog_Cancel_1($$anchor, {
																				children: ($$anchor, $$slotProps) => {
																					$.next();

																					var text_13 = $.text('Don\'t allow');

																					$.append($$anchor, text_13);
																				},
																				$$slots: { default: true }
																			});
																		});

																		var node_34 = $.sibling(node_33, 2);

																		$.component(node_34, () => AlertDialog.Action, ($$anchor, AlertDialog_Action_1) => {
																			AlertDialog_Action_1($$anchor, {
																				children: ($$anchor, $$slotProps) => {
																					$.next();

																					var text_14 = $.text('Allow');

																					$.append($$anchor, text_14);
																				},
																				$$slots: { default: true }
																			});
																		});

																		$.append($$anchor, fragment_19);
																	},
																	$$slots: { default: true }
																});
															});

															$.append($$anchor, fragment_16);
														},
														$$slots: { default: true }
													});
												});

												$.append($$anchor, fragment_14);
											},
											$$slots: { default: true }
										});
									});

									$.reset(div);
									$.append($$anchor, div);
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