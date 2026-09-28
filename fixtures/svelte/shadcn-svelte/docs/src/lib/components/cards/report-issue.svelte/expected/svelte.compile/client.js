import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as Card from "$lib/registry/ui/card/index.js";
import * as Field from "$lib/registry/ui/field/index.js";
import * as Select from "$lib/registry/ui/select/index.js";
import { Button } from "$lib/registry/ui/button/index.js";
import { Input } from "$lib/registry/ui/input/index.js";
import { Textarea } from "$lib/registry/ui/textarea/index.js";

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<span> </span>`);
var root_2 = $.from_html(`<!> <!> <!> <!>`, 1);

export default function Report_issue($$anchor, $$props) {
	const id = $.props_id();

	$.push($$props, true);

	const areas = [
		{ label: "Team", value: "team" },
		{ label: "Billing", value: "billing" },
		{ label: "Account", value: "account" },
		{ label: "Deployments", value: "deployments" },
		{ label: "Support", value: "support" }
	];

	const levels = [
		{ label: "Severity 1 (Highest)", value: "1" },
		{ label: "Severity 2", value: "2" },
		{ label: "Severity 3", value: "3" },
		{ label: "Severity 4 (Lowest)", value: "4" }
	];

	let area = $.state("billing");
	let level = $.state("2");
	const areaLabel = $.derived(() => areas.find((a) => a.value === $.get(area))?.label ?? "Select");
	const levelLabel = $.derived(() => levels.find((l) => l.value === $.get(level))?.label ?? "Select Level");
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => Card.Root, ($$anchor, Card_Root) => {
		Card_Root($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root();
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

										var text = $.text('Report an issue');

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

										var text_1 = $.text('What area are you having problems with?');

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
										var fragment_4 = root_2();
										var node_6 = $.first_child(fragment_4);

										$.component(node_6, () => Field.Group, ($$anchor, Field_Group_1) => {
											Field_Group_1($$anchor, {
												class: 'grid gap-4 sm:grid-cols-2',
												children: ($$anchor, $$slotProps) => {
													var fragment_5 = root();
													var node_7 = $.first_child(fragment_5);

													$.component(node_7, () => Field.Field, ($$anchor, Field_Field) => {
														Field_Field($$anchor, {
															children: ($$anchor, $$slotProps) => {
																var fragment_6 = root();
																var node_8 = $.first_child(fragment_6);

																$.component(node_8, () => Field.Label, ($$anchor, Field_Label) => {
																	Field_Label($$anchor, {
																		get for() {
																			return `area-${id}`;
																		},

																		children: ($$anchor, $$slotProps) => {
																			$.next();

																			var text_2 = $.text('Area');

																			$.append($$anchor, text_2);
																		},
																		$$slots: { default: true }
																	});
																});

																var node_9 = $.sibling(node_8, 2);

																$.component(node_9, () => Select.Root, ($$anchor, Select_Root) => {
																	Select_Root($$anchor, {
																		type: 'single',
																		get value() {
																			return $.get(area);
																		},

																		set value($$value) {
																			$.set(area, $$value, true);
																		},

																		children: ($$anchor, $$slotProps) => {
																			var fragment_7 = root();
																			var node_10 = $.first_child(fragment_7);

																			$.component(node_10, () => Select.Trigger, ($$anchor, Select_Trigger) => {
																				Select_Trigger($$anchor, {
																					get id() {
																						return `area-${id}`;
																					},
																					'aria-label': 'Area',
																					class: 'w-full',
																					children: ($$anchor, $$slotProps) => {
																						$.next();

																						var text_3 = $.text();

																						$.template_effect(() => $.set_text(text_3, $.get(areaLabel)));
																						$.append($$anchor, text_3);
																					},
																					$$slots: { default: true }
																				});
																			});

																			var node_11 = $.sibling(node_10, 2);

																			$.component(node_11, () => Select.Content, ($$anchor, Select_Content) => {
																				Select_Content($$anchor, {
																					children: ($$anchor, $$slotProps) => {
																						var fragment_9 = $.comment();
																						var node_12 = $.first_child(fragment_9);

																						$.each(node_12, 17, () => areas, (area) => area.value, ($$anchor, area, $$index, $$array) => {
																							var fragment_10 = $.comment();
																							var node_13 = $.first_child(fragment_10);

																							$.component(node_13, () => Select.Item, ($$anchor, Select_Item) => {
																								Select_Item($$anchor, {
																									get value() {
																										return $.get(area).value;
																									},

																									children: ($$anchor, $$slotProps) => {
																										$.next();

																										var text_4 = $.text();

																										$.template_effect(() => $.set_text(text_4, $.get(area).label));
																										$.append($$anchor, text_4);
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

													var node_14 = $.sibling(node_7, 2);

													$.component(node_14, () => Field.Field, ($$anchor, Field_Field_1) => {
														Field_Field_1($$anchor, {
															children: ($$anchor, $$slotProps) => {
																var fragment_12 = root();
																var node_15 = $.first_child(fragment_12);

																$.component(node_15, () => Field.Label, ($$anchor, Field_Label_1) => {
																	Field_Label_1($$anchor, {
																		get for() {
																			return `level-${id}`;
																		},

																		children: ($$anchor, $$slotProps) => {
																			$.next();

																			var text_5 = $.text('Security Level');

																			$.append($$anchor, text_5);
																		},
																		$$slots: { default: true }
																	});
																});

																var node_16 = $.sibling(node_15, 2);

																$.component(node_16, () => Select.Root, ($$anchor, Select_Root_1) => {
																	Select_Root_1($$anchor, {
																		type: 'single',
																		get value() {
																			return $.get(level);
																		},

																		set value($$value) {
																			$.set(level, $$value, true);
																		},

																		children: ($$anchor, $$slotProps) => {
																			var fragment_13 = root();
																			var node_17 = $.first_child(fragment_13);

																			$.component(node_17, () => Select.Trigger, ($$anchor, Select_Trigger_1) => {
																				Select_Trigger_1($$anchor, {
																					get id() {
																						return `level-${id}`;
																					},
																					class: 'w-full [&_span]:!block [&_span]:truncate',
																					'aria-label': 'Security Level',
																					children: ($$anchor, $$slotProps) => {
																						var span = root_1();
																						var text_6 = $.only_child(span, true);

																						$.template_effect(() => $.set_text(text_6, $.get(levelLabel)));
																						$.append($$anchor, span);
																					},
																					$$slots: { default: true }
																				});
																			});

																			var node_18 = $.sibling(node_17, 2);

																			$.component(node_18, () => Select.Content, ($$anchor, Select_Content_1) => {
																				Select_Content_1($$anchor, {
																					children: ($$anchor, $$slotProps) => {
																						var fragment_14 = $.comment();
																						var node_19 = $.first_child(fragment_14);

																						$.each(node_19, 17, () => levels, (level) => level.value, ($$anchor, level, $$index_1, $$array_1) => {
																							var fragment_15 = $.comment();
																							var node_20 = $.first_child(fragment_15);

																							$.component(node_20, () => Select.Item, ($$anchor, Select_Item_1) => {
																								Select_Item_1($$anchor, {
																									get value() {
																										return $.get(level).value;
																									},

																									children: ($$anchor, $$slotProps) => {
																										$.next();

																										var text_7 = $.text();

																										$.template_effect(() => $.set_text(text_7, $.get(level).label));
																										$.append($$anchor, text_7);
																									},
																									$$slots: { default: true }
																								});
																							});

																							$.append($$anchor, fragment_15);
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

													$.append($$anchor, fragment_5);
												},
												$$slots: { default: true }
											});
										});

										var node_21 = $.sibling(node_6, 2);

										$.component(node_21, () => Field.Field, ($$anchor, Field_Field_2) => {
											Field_Field_2($$anchor, {
												children: ($$anchor, $$slotProps) => {
													var fragment_17 = root();
													var node_22 = $.first_child(fragment_17);

													$.component(node_22, () => Field.Label, ($$anchor, Field_Label_2) => {
														Field_Label_2($$anchor, {
															get for() {
																return `subject-${id}`;
															},

															children: ($$anchor, $$slotProps) => {
																$.next();

																var text_8 = $.text('Subject');

																$.append($$anchor, text_8);
															},
															$$slots: { default: true }
														});
													});

													var node_23 = $.sibling(node_22, 2);

													Input(node_23, {
														get id() {
															return `subject-${id}`;
														},
														placeholder: 'I need help with...'
													});

													$.append($$anchor, fragment_17);
												},
												$$slots: { default: true }
											});
										});

										var node_24 = $.sibling(node_21, 2);

										$.component(node_24, () => Field.Field, ($$anchor, Field_Field_3) => {
											Field_Field_3($$anchor, {
												children: ($$anchor, $$slotProps) => {
													var fragment_18 = root();
													var node_25 = $.first_child(fragment_18);

													$.component(node_25, () => Field.Label, ($$anchor, Field_Label_3) => {
														Field_Label_3($$anchor, {
															get for() {
																return `description-${id}`;
															},

															children: ($$anchor, $$slotProps) => {
																$.next();

																var text_9 = $.text('Description');

																$.append($$anchor, text_9);
															},
															$$slots: { default: true }
														});
													});

													var node_26 = $.sibling(node_25, 2);

													Textarea(node_26, {
														get id() {
															return `description-${id}`;
														},
														placeholder: 'Please include all information relevant to your issue.',
														class: 'min-h-24'
													});

													$.append($$anchor, fragment_18);
												},
												$$slots: { default: true }
											});
										});

										var node_27 = $.sibling(node_24, 2);

										$.component(node_27, () => Field.Field, ($$anchor, Field_Field_4) => {
											Field_Field_4($$anchor, {
												orientation: 'horizontal',
												class: 'justify-end',
												children: ($$anchor, $$slotProps) => {
													var fragment_19 = root();
													var node_28 = $.first_child(fragment_19);

													Button(node_28, {
														variant: 'ghost',
														size: 'sm',
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_10 = $.text('Cancel');

															$.append($$anchor, text_10);
														},
														$$slots: { default: true }
													});

													var node_29 = $.sibling(node_28, 2);

													Button(node_29, {
														size: 'sm',
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_11 = $.text('Submit');

															$.append($$anchor, text_11);
														},
														$$slots: { default: true }
													});

													$.append($$anchor, fragment_19);
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

				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		});
	});

	$.append($$anchor, fragment);
	$.pop();
}