import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as Alert from "$lib/registry/ui/alert/index.js";
import * as Card from "$lib/registry/ui/card/index.js";
import * as Field from "$lib/registry/ui/field/index.js";
import * as ToggleGroup from "$lib/registry/ui/toggle-group/index.js";
import { Button } from "$lib/registry/ui/button/index.js";

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!> <!>`, 1);
var root_2 = $.from_html(`<!> <!> <!>`, 1);

export default function Book_appointment($$anchor) {
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

										var text = $.text('Book Appointment');

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

										var text_1 = $.text('Dr. Sarah Chen · Cardiology');

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
						class: 'flex flex-col gap-4',
						children: ($$anchor, $$slotProps) => {
							var fragment_3 = root();
							var node_5 = $.first_child(fragment_3);

							$.component(node_5, () => Field.Group, ($$anchor, Field_Group) => {
								Field_Group($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_4 = $.comment();
										var node_6 = $.first_child(fragment_4);

										$.component(node_6, () => Field.Field, ($$anchor, Field_Field) => {
											Field_Field($$anchor, {
												children: ($$anchor, $$slotProps) => {
													var fragment_5 = root();
													var node_7 = $.first_child(fragment_5);

													$.component(node_7, () => Field.Label, ($$anchor, Field_Label) => {
														Field_Label($$anchor, {
															children: ($$anchor, $$slotProps) => {
																$.next();

																var text_2 = $.text('Available on March 18, 2026');

																$.append($$anchor, text_2);
															},
															$$slots: { default: true }
														});
													});

													var node_8 = $.sibling(node_7, 2);

													$.component(node_8, () => ToggleGroup.Root, ($$anchor, ToggleGroup_Root) => {
														ToggleGroup_Root($$anchor, {
															type: 'multiple',
															value: ["slot-0"],
															spacing: 2,
															children: ($$anchor, $$slotProps) => {
																var fragment_6 = root_1();
																var node_9 = $.first_child(fragment_6);

																$.component(node_9, () => ToggleGroup.Item, ($$anchor, ToggleGroup_Item) => {
																	ToggleGroup_Item($$anchor, {
																		value: 'slot-0',
																		children: ($$anchor, $$slotProps) => {
																			$.next();

																			var text_3 = $.text('9:00 AM');

																			$.append($$anchor, text_3);
																		},
																		$$slots: { default: true }
																	});
																});

																var node_10 = $.sibling(node_9, 2);

																$.component(node_10, () => ToggleGroup.Item, ($$anchor, ToggleGroup_Item_1) => {
																	ToggleGroup_Item_1($$anchor, {
																		value: 'slot-1',
																		children: ($$anchor, $$slotProps) => {
																			$.next();

																			var text_4 = $.text('10:30 AM');

																			$.append($$anchor, text_4);
																		},
																		$$slots: { default: true }
																	});
																});

																var node_11 = $.sibling(node_10, 2);

																$.component(node_11, () => ToggleGroup.Item, ($$anchor, ToggleGroup_Item_2) => {
																	ToggleGroup_Item_2($$anchor, {
																		value: 'slot-2',
																		children: ($$anchor, $$slotProps) => {
																			$.next();

																			var text_5 = $.text('11:00 AM');

																			$.append($$anchor, text_5);
																		},
																		$$slots: { default: true }
																	});
																});

																var node_12 = $.sibling(node_11, 2);

																$.component(node_12, () => ToggleGroup.Item, ($$anchor, ToggleGroup_Item_3) => {
																	ToggleGroup_Item_3($$anchor, {
																		value: 'slot-3',
																		children: ($$anchor, $$slotProps) => {
																			$.next();

																			var text_6 = $.text('1:30 PM');

																			$.append($$anchor, text_6);
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

							var node_13 = $.sibling(node_5, 2);

							$.component(node_13, () => Alert.Root, ($$anchor, Alert_Root) => {
								Alert_Root($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_7 = root();
										var node_14 = $.first_child(fragment_7);

										$.component(node_14, () => Alert.Title, ($$anchor, Alert_Title) => {
											Alert_Title($$anchor, {
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_7 = $.text('New patient?');

													$.append($$anchor, text_7);
												},
												$$slots: { default: true }
											});
										});

										var node_15 = $.sibling(node_14, 2);

										$.component(node_15, () => Alert.Description, ($$anchor, Alert_Description) => {
											Alert_Description($$anchor, {
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_8 = $.text('Please arrive 15 minutes early.');

													$.append($$anchor, text_8);
												},
												$$slots: { default: true }
											});
										});

										$.append($$anchor, fragment_7);
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_3);
						},
						$$slots: { default: true }
					});
				});

				var node_16 = $.sibling(node_4, 2);

				$.component(node_16, () => Card.Footer, ($$anchor, Card_Footer) => {
					Card_Footer($$anchor, {
						children: ($$anchor, $$slotProps) => {
							Button($$anchor, {
								class: 'w-full',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_9 = $.text('Book Appointment');

									$.append($$anchor, text_9);
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