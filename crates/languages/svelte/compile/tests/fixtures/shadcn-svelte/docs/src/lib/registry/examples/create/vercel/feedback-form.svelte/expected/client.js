import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as Card from "$lib/registry/ui/card/index.js";
import * as Field from "$lib/registry/ui/field/index.js";
import * as NativeSelect from "$lib/registry/ui/native-select/index.js";
import { Button } from "$lib/registry/ui/button/index.js";
import { Textarea } from "$lib/registry/ui/textarea/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

var root = $.from_html(`<!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);
var root_2 = $.from_html(`<form id="feedback-form"><!></form>`);

export default function Feedback_form($$anchor) {
	Example($$anchor, {
		title: 'Feedback Form',
		class: 'items-center justify-center',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = $.comment();
			var node = $.first_child(fragment_1);

			$.component(node, () => Card.Root, ($$anchor, Card_Root) => {
				Card_Root($$anchor, {
					class: 'w-full max-w-sm',
					size: 'sm',
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = root_1();
						var node_1 = $.first_child(fragment_2);

						$.component(node_1, () => Card.Content, ($$anchor, Card_Content) => {
							Card_Content($$anchor, {
								children: ($$anchor, $$slotProps) => {
									var form = root_2();
									var node_2 = $.child(form);

									$.component(node_2, () => Field.Group, ($$anchor, Field_Group) => {
										Field_Group($$anchor, {
											children: ($$anchor, $$slotProps) => {
												var fragment_3 = root_1();
												var node_3 = $.first_child(fragment_3);

												$.component(node_3, () => Field.Field, ($$anchor, Field_Field) => {
													Field_Field($$anchor, {
														children: ($$anchor, $$slotProps) => {
															var fragment_4 = root_1();
															var node_4 = $.first_child(fragment_4);

															$.component(node_4, () => Field.Label, ($$anchor, Field_Label) => {
																Field_Label($$anchor, {
																	for: 'topic',
																	children: ($$anchor, $$slotProps) => {
																		$.next();

																		var text = $.text('Topic');

																		$.append($$anchor, text);
																	},
																	$$slots: { default: true }
																});
															});

															var node_5 = $.sibling(node_4, 2);

															$.component(node_5, () => NativeSelect.Root, ($$anchor, NativeSelect_Root) => {
																NativeSelect_Root($$anchor, {
																	id: 'topic',
																	children: ($$anchor, $$slotProps) => {
																		var fragment_5 = root();
																		var node_6 = $.first_child(fragment_5);

																		$.component(node_6, () => NativeSelect.Option, ($$anchor, NativeSelect_Option) => {
																			NativeSelect_Option($$anchor, {
																				value: '',
																				children: ($$anchor, $$slotProps) => {
																					$.next();

																					var text_1 = $.text('Select a topic');

																					$.append($$anchor, text_1);
																				},
																				$$slots: { default: true }
																			});
																		});

																		var node_7 = $.sibling(node_6, 2);

																		$.component(node_7, () => NativeSelect.Option, ($$anchor, NativeSelect_Option_1) => {
																			NativeSelect_Option_1($$anchor, {
																				value: 'ai',
																				children: ($$anchor, $$slotProps) => {
																					$.next();

																					var text_2 = $.text('AI');

																					$.append($$anchor, text_2);
																				},
																				$$slots: { default: true }
																			});
																		});

																		var node_8 = $.sibling(node_7, 2);

																		$.component(node_8, () => NativeSelect.Option, ($$anchor, NativeSelect_Option_2) => {
																			NativeSelect_Option_2($$anchor, {
																				value: 'accounts-and-access-controls',
																				children: ($$anchor, $$slotProps) => {
																					$.next();

																					var text_3 = $.text('Accounts and Access Controls');

																					$.append($$anchor, text_3);
																				},
																				$$slots: { default: true }
																			});
																		});

																		var node_9 = $.sibling(node_8, 2);

																		$.component(node_9, () => NativeSelect.Option, ($$anchor, NativeSelect_Option_3) => {
																			NativeSelect_Option_3($$anchor, {
																				value: 'billing',
																				children: ($$anchor, $$slotProps) => {
																					$.next();

																					var text_4 = $.text('Billing');

																					$.append($$anchor, text_4);
																				},
																				$$slots: { default: true }
																			});
																		});

																		var node_10 = $.sibling(node_9, 2);

																		$.component(node_10, () => NativeSelect.Option, ($$anchor, NativeSelect_Option_4) => {
																			NativeSelect_Option_4($$anchor, {
																				value: 'cdn',
																				children: ($$anchor, $$slotProps) => {
																					$.next();

																					var text_5 = $.text('CDN (Firewall, Caching)');

																					$.append($$anchor, text_5);
																				},
																				$$slots: { default: true }
																			});
																		});

																		var node_11 = $.sibling(node_10, 2);

																		$.component(node_11, () => NativeSelect.Option, ($$anchor, NativeSelect_Option_5) => {
																			NativeSelect_Option_5($$anchor, {
																				value: 'ci-cd',
																				children: ($$anchor, $$slotProps) => {
																					$.next();

																					var text_6 = $.text('CI/CD (Builds, Deployments, Environment Variables)');

																					$.append($$anchor, text_6);
																				},
																				$$slots: { default: true }
																			});
																		});

																		var node_12 = $.sibling(node_11, 2);

																		$.component(node_12, () => NativeSelect.Option, ($$anchor, NativeSelect_Option_6) => {
																			NativeSelect_Option_6($$anchor, {
																				value: 'dashboard-interface',
																				children: ($$anchor, $$slotProps) => {
																					$.next();

																					var text_7 = $.text('Dashboard Interface (Navigation, UI Issues)');

																					$.append($$anchor, text_7);
																				},
																				$$slots: { default: true }
																			});
																		});

																		var node_13 = $.sibling(node_12, 2);

																		$.component(node_13, () => NativeSelect.Option, ($$anchor, NativeSelect_Option_7) => {
																			NativeSelect_Option_7($$anchor, {
																				value: 'domains',
																				children: ($$anchor, $$slotProps) => {
																					$.next();

																					var text_8 = $.text('Domains');

																					$.append($$anchor, text_8);
																				},
																				$$slots: { default: true }
																			});
																		});

																		var node_14 = $.sibling(node_13, 2);

																		$.component(node_14, () => NativeSelect.Option, ($$anchor, NativeSelect_Option_8) => {
																			NativeSelect_Option_8($$anchor, {
																				value: 'frameworks',
																				children: ($$anchor, $$slotProps) => {
																					$.next();

																					var text_9 = $.text('Frameworks');

																					$.append($$anchor, text_9);
																				},
																				$$slots: { default: true }
																			});
																		});

																		var node_15 = $.sibling(node_14, 2);

																		$.component(node_15, () => NativeSelect.Option, ($$anchor, NativeSelect_Option_9) => {
																			NativeSelect_Option_9($$anchor, {
																				value: 'marketplace-and-integrations',
																				children: ($$anchor, $$slotProps) => {
																					$.next();

																					var text_10 = $.text('Marketplace and Integrations');

																					$.append($$anchor, text_10);
																				},
																				$$slots: { default: true }
																			});
																		});

																		var node_16 = $.sibling(node_15, 2);

																		$.component(node_16, () => NativeSelect.Option, ($$anchor, NativeSelect_Option_10) => {
																			NativeSelect_Option_10($$anchor, {
																				value: 'observability',
																				children: ($$anchor, $$slotProps) => {
																					$.next();

																					var text_11 = $.text('Observability (Observability, Logs, Monitoring)');

																					$.append($$anchor, text_11);
																				},
																				$$slots: { default: true }
																			});
																		});

																		var node_17 = $.sibling(node_16, 2);

																		$.component(node_17, () => NativeSelect.Option, ($$anchor, NativeSelect_Option_11) => {
																			NativeSelect_Option_11($$anchor, {
																				value: 'storage',
																				children: ($$anchor, $$slotProps) => {
																					$.next();

																					var text_12 = $.text('Storage');

																					$.append($$anchor, text_12);
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

												var node_18 = $.sibling(node_3, 2);

												$.component(node_18, () => Field.Field, ($$anchor, Field_Field_1) => {
													Field_Field_1($$anchor, {
														children: ($$anchor, $$slotProps) => {
															var fragment_6 = root_1();
															var node_19 = $.first_child(fragment_6);

															$.component(node_19, () => Field.Label, ($$anchor, Field_Label_1) => {
																Field_Label_1($$anchor, {
																	for: 'feedback',
																	children: ($$anchor, $$slotProps) => {
																		$.next();

																		var text_13 = $.text('Feedback');

																		$.append($$anchor, text_13);
																	},
																	$$slots: { default: true }
																});
															});

															var node_20 = $.sibling(node_19, 2);

															Textarea(node_20, {
																id: 'feedback',
																placeholder: 'Your feedback helps us improve...'
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

									$.reset(form);
									$.append($$anchor, form);
								},
								$$slots: { default: true }
							});
						});

						var node_21 = $.sibling(node_1, 2);

						$.component(node_21, () => Card.Footer, ($$anchor, Card_Footer) => {
							Card_Footer($$anchor, {
								children: ($$anchor, $$slotProps) => {
									Button($$anchor, {
										type: 'submit',
										form: 'feedback-form',
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_14 = $.text('Submit');

											$.append($$anchor, text_14);
										},
										$$slots: { default: true }
									});
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