import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as Card from "$lib/registry/ui/card/index.js";
import * as Field from "$lib/registry/ui/field/index.js";
import * as InputGroup from "$lib/registry/ui/input-group/index.js";
import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
import { Button } from "$lib/registry/ui/button/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!>`, 1);

export default function Input_group_in_card($$anchor) {
	Example($$anchor, {
		title: 'In Card',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = $.comment();
			var node = $.first_child(fragment_1);

			$.component(node, () => Card.Root, ($$anchor, Card_Root) => {
				Card_Root($$anchor, {
					class: 'w-full',
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = root_1();
						var node_1 = $.first_child(fragment_2);

						$.component(node_1, () => Card.Header, ($$anchor, Card_Header) => {
							Card_Header($$anchor, {
								children: ($$anchor, $$slotProps) => {
									var fragment_3 = root();
									var node_2 = $.first_child(fragment_3);

									$.component(node_2, () => Card.Title, ($$anchor, Card_Title) => {
										Card_Title($$anchor, {
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text = $.text('Card with Input Group');

												$.append($$anchor, text);
											},
											$$slots: { default: true }
										});
									});

									var node_3 = $.sibling(node_2, 2);

									$.component(node_3, () => Card.Description, ($$anchor, Card_Description) => {
										Card_Description($$anchor, {
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_1 = $.text('This is a card with an input group.');

												$.append($$anchor, text_1);
											},
											$$slots: { default: true }
										});
									});

									$.append($$anchor, fragment_3);
								},
								$$slots: { default: true }
							});
						});

						var node_4 = $.sibling(node_1, 2);

						$.component(node_4, () => Card.Content, ($$anchor, Card_Content) => {
							Card_Content($$anchor, {
								children: ($$anchor, $$slotProps) => {
									var fragment_4 = $.comment();
									var node_5 = $.first_child(fragment_4);

									$.component(node_5, () => Field.Group, ($$anchor, Field_Group) => {
										Field_Group($$anchor, {
											children: ($$anchor, $$slotProps) => {
												var fragment_5 = root_1();
												var node_6 = $.first_child(fragment_5);

												$.component(node_6, () => Field.Field, ($$anchor, Field_Field) => {
													Field_Field($$anchor, {
														children: ($$anchor, $$slotProps) => {
															var fragment_6 = root();
															var node_7 = $.first_child(fragment_6);

															$.component(node_7, () => Field.Label, ($$anchor, Field_Label) => {
																Field_Label($$anchor, {
																	for: 'email-input',
																	children: ($$anchor, $$slotProps) => {
																		$.next();

																		var text_2 = $.text('Email Address');

																		$.append($$anchor, text_2);
																	},
																	$$slots: { default: true }
																});
															});

															var node_8 = $.sibling(node_7, 2);

															$.component(node_8, () => InputGroup.Root, ($$anchor, InputGroup_Root) => {
																InputGroup_Root($$anchor, {
																	children: ($$anchor, $$slotProps) => {
																		var fragment_7 = root();
																		var node_9 = $.first_child(fragment_7);

																		$.component(node_9, () => InputGroup.Input, ($$anchor, InputGroup_Input) => {
																			InputGroup_Input($$anchor, {
																				id: 'email-input',
																				type: 'email',
																				placeholder: 'you@example.com'
																			});
																		});

																		var node_10 = $.sibling(node_9, 2);

																		$.component(node_10, () => InputGroup.Addon, ($$anchor, InputGroup_Addon) => {
																			InputGroup_Addon($$anchor, {
																				align: 'inline-end',
																				children: ($$anchor, $$slotProps) => {
																					IconPlaceholder($$anchor, {
																						lucide: 'MailIcon',
																						tabler: 'IconMail',
																						hugeicons: 'MailIcon',
																						phosphor: 'EnvelopeIcon',
																						remixicon: 'RiMailLine'
																					});
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

												var node_11 = $.sibling(node_6, 2);

												$.component(node_11, () => Field.Field, ($$anchor, Field_Field_1) => {
													Field_Field_1($$anchor, {
														children: ($$anchor, $$slotProps) => {
															var fragment_9 = root();
															var node_12 = $.first_child(fragment_9);

															$.component(node_12, () => Field.Label, ($$anchor, Field_Label_1) => {
																Field_Label_1($$anchor, {
																	for: 'website-input',
																	children: ($$anchor, $$slotProps) => {
																		$.next();

																		var text_3 = $.text('Website URL');

																		$.append($$anchor, text_3);
																	},
																	$$slots: { default: true }
																});
															});

															var node_13 = $.sibling(node_12, 2);

															$.component(node_13, () => InputGroup.Root, ($$anchor, InputGroup_Root_1) => {
																InputGroup_Root_1($$anchor, {
																	children: ($$anchor, $$slotProps) => {
																		var fragment_10 = root_1();
																		var node_14 = $.first_child(fragment_10);

																		$.component(node_14, () => InputGroup.Addon, ($$anchor, InputGroup_Addon_1) => {
																			InputGroup_Addon_1($$anchor, {
																				children: ($$anchor, $$slotProps) => {
																					var fragment_11 = $.comment();
																					var node_15 = $.first_child(fragment_11);

																					$.component(node_15, () => InputGroup.Text, ($$anchor, InputGroup_Text) => {
																						InputGroup_Text($$anchor, {
																							children: ($$anchor, $$slotProps) => {
																								$.next();

																								var text_4 = $.text('https://');

																								$.append($$anchor, text_4);
																							},
																							$$slots: { default: true }
																						});
																					});

																					$.append($$anchor, fragment_11);
																				},
																				$$slots: { default: true }
																			});
																		});

																		var node_16 = $.sibling(node_14, 2);

																		$.component(node_16, () => InputGroup.Input, ($$anchor, InputGroup_Input_1) => {
																			InputGroup_Input_1($$anchor, { id: 'website-input', placeholder: 'example.com' });
																		});

																		var node_17 = $.sibling(node_16, 2);

																		$.component(node_17, () => InputGroup.Addon, ($$anchor, InputGroup_Addon_2) => {
																			InputGroup_Addon_2($$anchor, {
																				align: 'inline-end',
																				children: ($$anchor, $$slotProps) => {
																					IconPlaceholder($$anchor, {
																						lucide: 'ExternalLinkIcon',
																						tabler: 'IconExternalLink',
																						hugeicons: 'LinkSquare02Icon',
																						phosphor: 'ArrowSquareOutIcon',
																						remixicon: 'RiExternalLinkLine'
																					});
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

												var node_18 = $.sibling(node_11, 2);

												$.component(node_18, () => Field.Field, ($$anchor, Field_Field_2) => {
													Field_Field_2($$anchor, {
														children: ($$anchor, $$slotProps) => {
															var fragment_13 = root();
															var node_19 = $.first_child(fragment_13);

															$.component(node_19, () => Field.Label, ($$anchor, Field_Label_2) => {
																Field_Label_2($$anchor, {
																	for: 'feedback-textarea',
																	children: ($$anchor, $$slotProps) => {
																		$.next();

																		var text_5 = $.text('Feedback & Comments');

																		$.append($$anchor, text_5);
																	},
																	$$slots: { default: true }
																});
															});

															var node_20 = $.sibling(node_19, 2);

															$.component(node_20, () => InputGroup.Root, ($$anchor, InputGroup_Root_2) => {
																InputGroup_Root_2($$anchor, {
																	children: ($$anchor, $$slotProps) => {
																		var fragment_14 = root();
																		var node_21 = $.first_child(fragment_14);

																		$.component(node_21, () => InputGroup.Textarea, ($$anchor, InputGroup_Textarea) => {
																			InputGroup_Textarea($$anchor, {
																				id: 'feedback-textarea',
																				placeholder: 'Share your thoughts...',
																				class: 'min-h-[100px]'
																			});
																		});

																		var node_22 = $.sibling(node_21, 2);

																		$.component(node_22, () => InputGroup.Addon, ($$anchor, InputGroup_Addon_3) => {
																			InputGroup_Addon_3($$anchor, {
																				align: 'block-end',
																				children: ($$anchor, $$slotProps) => {
																					var fragment_15 = $.comment();
																					var node_23 = $.first_child(fragment_15);

																					$.component(node_23, () => InputGroup.Text, ($$anchor, InputGroup_Text_1) => {
																						InputGroup_Text_1($$anchor, {
																							children: ($$anchor, $$slotProps) => {
																								$.next();

																								var text_6 = $.text('0/500 characters');

																								$.append($$anchor, text_6);
																							},
																							$$slots: { default: true }
																						});
																					});

																					$.append($$anchor, fragment_15);
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

						var node_24 = $.sibling(node_4, 2);

						$.component(node_24, () => Card.Footer, ($$anchor, Card_Footer) => {
							Card_Footer($$anchor, {
								class: 'justify-end gap-2',
								children: ($$anchor, $$slotProps) => {
									var fragment_16 = root();
									var node_25 = $.first_child(fragment_16);

									Button(node_25, {
										variant: 'outline',
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_7 = $.text('Cancel');

											$.append($$anchor, text_7);
										},
										$$slots: { default: true }
									});

									var node_26 = $.sibling(node_25, 2);

									Button(node_26, {
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_8 = $.text('Submit');

											$.append($$anchor, text_8);
										},
										$$slots: { default: true }
									});

									$.append($$anchor, fragment_16);
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