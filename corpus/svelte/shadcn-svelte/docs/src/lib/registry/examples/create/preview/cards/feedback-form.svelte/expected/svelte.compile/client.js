import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as Card from "$lib/registry/ui/card/index.js";
import * as Field from "$lib/registry/ui/field/index.js";
import * as NativeSelect from "$lib/registry/ui/native-select/index.js";
import { Button } from "$lib/registry/ui/button/index.js";
import { Textarea } from "$lib/registry/ui/textarea/index.js";

var root = $.from_html(`<!> <!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);
var root_2 = $.from_html(`<form id="feedback-form"><!></form>`);

export default function Feedback_form($$anchor) {
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => Card.Root, ($$anchor, Card_Root) => {
		Card_Root($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root_1();
				var node_1 = $.first_child(fragment_1);

				$.component(node_1, () => Card.Content, ($$anchor, Card_Content) => {
					Card_Content($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var form = root_2();
							var node_2 = $.child(form);

							$.component(node_2, () => Field.Group, ($$anchor, Field_Group) => {
								Field_Group($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_2 = root_1();
										var node_3 = $.first_child(fragment_2);

										$.component(node_3, () => Field.Field, ($$anchor, Field_Field) => {
											Field_Field($$anchor, {
												children: ($$anchor, $$slotProps) => {
													var fragment_3 = root_1();
													var node_4 = $.first_child(fragment_3);

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
																var fragment_4 = root();
																var node_6 = $.first_child(fragment_4);

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
																		value: 'billing',
																		children: ($$anchor, $$slotProps) => {
																			$.next();

																			var text_3 = $.text('Billing');

																			$.append($$anchor, text_3);
																		},
																		$$slots: { default: true }
																	});
																});

																var node_9 = $.sibling(node_8, 2);

																$.component(node_9, () => NativeSelect.Option, ($$anchor, NativeSelect_Option_3) => {
																	NativeSelect_Option_3($$anchor, {
																		value: 'dashboard-interface',
																		children: ($$anchor, $$slotProps) => {
																			$.next();

																			var text_4 = $.text('Dashboard Interface');

																			$.append($$anchor, text_4);
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

										var node_10 = $.sibling(node_3, 2);

										$.component(node_10, () => Field.Field, ($$anchor, Field_Field_1) => {
											Field_Field_1($$anchor, {
												children: ($$anchor, $$slotProps) => {
													var fragment_5 = root_1();
													var node_11 = $.first_child(fragment_5);

													$.component(node_11, () => Field.Label, ($$anchor, Field_Label_1) => {
														Field_Label_1($$anchor, {
															for: 'feedback',
															children: ($$anchor, $$slotProps) => {
																$.next();

																var text_5 = $.text('Feedback');

																$.append($$anchor, text_5);
															},
															$$slots: { default: true }
														});
													});

													var node_12 = $.sibling(node_11, 2);

													Textarea(node_12, {
														id: 'feedback',
														placeholder: 'Your feedback helps us improve...'
													});

													$.append($$anchor, fragment_5);
												},
												$$slots: { default: true }
											});
										});

										$.append($$anchor, fragment_2);
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

				var node_13 = $.sibling(node_1, 2);

				$.component(node_13, () => Card.Footer, ($$anchor, Card_Footer) => {
					Card_Footer($$anchor, {
						children: ($$anchor, $$slotProps) => {
							Button($$anchor, {
								type: 'submit',
								form: 'feedback-form',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_6 = $.text('Submit');

									$.append($$anchor, text_6);
								},
								$$slots: { default: true }
							});
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
}