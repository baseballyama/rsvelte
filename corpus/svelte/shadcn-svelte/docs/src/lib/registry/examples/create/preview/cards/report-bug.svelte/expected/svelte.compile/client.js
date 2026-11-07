import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as Card from "$lib/registry/ui/card/index.js";
import * as Field from "$lib/registry/ui/field/index.js";
import * as Select from "$lib/registry/ui/select/index.js";
import { Button } from "$lib/registry/ui/button/index.js";
import { Input } from "$lib/registry/ui/input/index.js";
import { Textarea } from "$lib/registry/ui/textarea/index.js";

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <div class="grid grid-cols-2 gap-3"><!> <!></div> <!>`, 1);
var root_2 = $.from_html(`<!> <!> <!>`, 1);

export default function Report_bug($$anchor, $$props) {
	$.push($$props, true);

	const severities = [
		{ value: "critical", label: "Critical" },
		{ value: "high", label: "High" },
		{ value: "medium", label: "Medium" },
		{ value: "low", label: "Low" }
	];

	const components = [
		{ value: "dashboard", label: "Dashboard" },
		{ value: "auth", label: "Auth" },
		{ value: "api", label: "API" },
		{ value: "billing", label: "Billing" }
	];

	let severity = $.state($.proxy(severities[2].value));
	let component = $.state($.proxy(components[0].value));
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => Card.Root, ($$anchor, Card_Root) => {
		Card_Root($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root_2();
				var node_1 = $.first_child(fragment_1);

				$.component(node_1, () => Card.Header, ($$anchor, Card_Header) => {
					Card_Header($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_2 = root();
							var node_2 = $.first_child(fragment_2);

							$.component(node_2, () => Card.Title, ($$anchor, Card_Title) => {
								Card_Title($$anchor, {
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text = $.text('Report Bug');

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

										var text_1 = $.text('Help us fix issues faster.');

										$.append($$anchor, text_1);
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_2);
						},
						$$slots: { default: true }
					});
				});

				var node_4 = $.sibling(node_1, 2);

				$.component(node_4, () => Card.Content, ($$anchor, Card_Content) => {
					Card_Content($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_3 = $.comment();
							var node_5 = $.first_child(fragment_3);

							$.component(node_5, () => Field.Group, ($$anchor, Field_Group) => {
								Field_Group($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_4 = root_1();
										var node_6 = $.first_child(fragment_4);

										$.component(node_6, () => Field.Field, ($$anchor, Field_Field) => {
											Field_Field($$anchor, {
												children: ($$anchor, $$slotProps) => {
													var fragment_5 = root();
													var node_7 = $.first_child(fragment_5);

													$.component(node_7, () => Field.Label, ($$anchor, Field_Label) => {
														Field_Label($$anchor, {
															for: 'bug-title',
															children: ($$anchor, $$slotProps) => {
																$.next();

																var text_2 = $.text('Title');

																$.append($$anchor, text_2);
															},
															$$slots: { default: true }
														});
													});

													var node_8 = $.sibling(node_7, 2);

													Input(node_8, {
														id: 'bug-title',
														placeholder: 'Brief description of the issue'
													});

													$.append($$anchor, fragment_5);
												},
												$$slots: { default: true }
											});
										});

										var div = $.sibling(node_6, 2);
										var node_9 = $.child(div);

										$.component(node_9, () => Field.Field, ($$anchor, Field_Field_1) => {
											Field_Field_1($$anchor, {
												children: ($$anchor, $$slotProps) => {
													var fragment_6 = root();
													var node_10 = $.first_child(fragment_6);

													$.component(node_10, () => Field.Label, ($$anchor, Field_Label_1) => {
														Field_Label_1($$anchor, {
															for: 'bug-severity',
															children: ($$anchor, $$slotProps) => {
																$.next();

																var text_3 = $.text('Severity');

																$.append($$anchor, text_3);
															},
															$$slots: { default: true }
														});
													});

													var node_11 = $.sibling(node_10, 2);

													$.component(node_11, () => Select.Root, ($$anchor, Select_Root) => {
														Select_Root($$anchor, {
															type: 'single',
															get value() {
																return $.get(severity);
															},

															set value($$value) {
																$.set(severity, $$value, true);
															},

															children: ($$anchor, $$slotProps) => {
																var fragment_7 = root();
																var node_12 = $.first_child(fragment_7);

																$.component(node_12, () => Select.Trigger, ($$anchor, Select_Trigger) => {
																	Select_Trigger($$anchor, {
																		id: 'bug-severity',
																		class: 'w-full',
																		children: ($$anchor, $$slotProps) => {
																			$.next();

																			var text_4 = $.text();

																			$.template_effect(($0) => $.set_text(text_4, $0), [
																				() => severities.find((s) => s.value === $.get(severity))?.label ?? "Select Severity"
																			]);

																			$.append($$anchor, text_4);
																		},
																		$$slots: { default: true }
																	});
																});

																var node_13 = $.sibling(node_12, 2);

																$.component(node_13, () => Select.Content, ($$anchor, Select_Content) => {
																	Select_Content($$anchor, {
																		children: ($$anchor, $$slotProps) => {
																			var fragment_9 = $.comment();
																			var node_14 = $.first_child(fragment_9);

																			$.each(node_14, 17, () => severities, (severity) => severity.value, ($$anchor, severity, $$index, $$array) => {
																				var fragment_10 = $.comment();
																				var node_15 = $.first_child(fragment_10);

																				$.component(node_15, () => Select.Item, ($$anchor, Select_Item) => {
																					Select_Item($$anchor, {
																						get value() {
																							return $.get(severity).value;
																						},

																						children: ($$anchor, $$slotProps) => {
																							$.next();

																							var text_5 = $.text();

																							$.template_effect(() => $.set_text(text_5, $.get(severity).label));
																							$.append($$anchor, text_5);
																						},
																						$$slots: { default: true }
																					});
																				});

																				$.append($$anchor, fragment_10);
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

										var node_16 = $.sibling(node_9, 2);

										$.component(node_16, () => Field.Field, ($$anchor, Field_Field_2) => {
											Field_Field_2($$anchor, {
												children: ($$anchor, $$slotProps) => {
													var fragment_12 = root();
													var node_17 = $.first_child(fragment_12);

													$.component(node_17, () => Field.Label, ($$anchor, Field_Label_2) => {
														Field_Label_2($$anchor, {
															for: 'bug-component',
															children: ($$anchor, $$slotProps) => {
																$.next();

																var text_6 = $.text('Component');

																$.append($$anchor, text_6);
															},
															$$slots: { default: true }
														});
													});

													var node_18 = $.sibling(node_17, 2);

													$.component(node_18, () => Select.Root, ($$anchor, Select_Root_1) => {
														Select_Root_1($$anchor, {
															type: 'single',
															get value() {
																return $.get(component);
															},

															set value($$value) {
																$.set(component, $$value, true);
															},

															children: ($$anchor, $$slotProps) => {
																var fragment_13 = root();
																var node_19 = $.first_child(fragment_13);

																$.component(node_19, () => Select.Trigger, ($$anchor, Select_Trigger_1) => {
																	Select_Trigger_1($$anchor, {
																		id: 'bug-component',
																		class: 'w-full',
																		children: ($$anchor, $$slotProps) => {
																			$.next();

																			var text_7 = $.text();

																			$.template_effect(($0) => $.set_text(text_7, $0), [
																				() => components.find((c) => c.value === $.get(component))?.label ?? "Select Component"
																			]);

																			$.append($$anchor, text_7);
																		},
																		$$slots: { default: true }
																	});
																});

																var node_20 = $.sibling(node_19, 2);

																$.component(node_20, () => Select.Content, ($$anchor, Select_Content_1) => {
																	Select_Content_1($$anchor, {
																		children: ($$anchor, $$slotProps) => {
																			var fragment_15 = $.comment();
																			var node_21 = $.first_child(fragment_15);

																			$.each(node_21, 17, () => components, (component) => component.value, ($$anchor, component, $$index_1, $$array_1) => {
																				var fragment_16 = $.comment();
																				var node_22 = $.first_child(fragment_16);

																				$.component(node_22, () => Select.Item, ($$anchor, Select_Item_1) => {
																					Select_Item_1($$anchor, {
																						get value() {
																							return $.get(component).value;
																						},

																						children: ($$anchor, $$slotProps) => {
																							$.next();

																							var text_8 = $.text();

																							$.template_effect(() => $.set_text(text_8, $.get(component).label));
																							$.append($$anchor, text_8);
																						},
																						$$slots: { default: true }
																					});
																				});

																				$.append($$anchor, fragment_16);
																			});

																			$.append($$anchor, fragment_15);
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

										$.reset(div);

										var node_23 = $.sibling(div, 2);

										$.component(node_23, () => Field.Field, ($$anchor, Field_Field_3) => {
											Field_Field_3($$anchor, {
												children: ($$anchor, $$slotProps) => {
													var fragment_18 = root();
													var node_24 = $.first_child(fragment_18);

													$.component(node_24, () => Field.Label, ($$anchor, Field_Label_3) => {
														Field_Label_3($$anchor, {
															for: 'bug-steps',
															children: ($$anchor, $$slotProps) => {
																$.next();

																var text_9 = $.text('Steps to reproduce');

																$.append($$anchor, text_9);
															},
															$$slots: { default: true }
														});
													});

													var node_25 = $.sibling(node_24, 2);

													Textarea(node_25, {
														id: 'bug-steps',
														placeholder: '1. Go to\n2. Click on\n3. Observe...',
														class: 'min-h-24 resize-none'
													});

													$.append($$anchor, fragment_18);
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

				var node_26 = $.sibling(node_4, 2);

				$.component(node_26, () => Card.Footer, ($$anchor, Card_Footer) => {
					Card_Footer($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_19 = $.comment();
							var node_27 = $.first_child(fragment_19);

							$.component(node_27, () => Field.Field, ($$anchor, Field_Field_4) => {
								Field_Field_4($$anchor, {
									orientation: 'horizontal',
									class: 'justify-end',
									children: ($$anchor, $$slotProps) => {
										var fragment_20 = root();
										var node_28 = $.first_child(fragment_20);

										Button(node_28, {
											variant: 'outline',
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_10 = $.text('Attach File');

												$.append($$anchor, text_10);
											},
											$$slots: { default: true }
										});

										var node_29 = $.sibling(node_28, 2);

										Button(node_29, {
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_11 = $.text('Submit Bug');

												$.append($$anchor, text_11);
											},
											$$slots: { default: true }
										});

										$.append($$anchor, fragment_20);
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_19);
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
	$.pop();
}