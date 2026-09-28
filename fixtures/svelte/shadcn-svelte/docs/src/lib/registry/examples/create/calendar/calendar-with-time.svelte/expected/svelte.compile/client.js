import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as Card from "$lib/registry/ui/card/index.js";
import * as Field from "$lib/registry/ui/field/index.js";
import * as InputGroup from "$lib/registry/ui/input-group/index.js";
import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
import { Calendar } from "$lib/registry/ui/calendar/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

var root = $.from_html(`<!> <!>`, 1);

export default function Calendar_with_time($$anchor) {
	Example($$anchor, {
		title: 'With Time',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = $.comment();
			var node = $.first_child(fragment_1);

			$.component(node, () => Card.Root, ($$anchor, Card_Root) => {
				Card_Root($$anchor, {
					size: 'sm',
					class: 'mx-auto w-fit',
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = root();
						var node_1 = $.first_child(fragment_2);

						$.component(node_1, () => Card.Content, ($$anchor, Card_Content) => {
							Card_Content($$anchor, {
								children: ($$anchor, $$slotProps) => {
									Calendar($$anchor, { type: 'single', class: 'p-0' });
								},
								$$slots: { default: true }
							});
						});

						var node_2 = $.sibling(node_1, 2);

						$.component(node_2, () => Card.Footer, ($$anchor, Card_Footer) => {
							Card_Footer($$anchor, {
								class: 'border-t bg-card',
								children: ($$anchor, $$slotProps) => {
									var fragment_4 = $.comment();
									var node_3 = $.first_child(fragment_4);

									$.component(node_3, () => Field.Group, ($$anchor, Field_Group) => {
										Field_Group($$anchor, {
											children: ($$anchor, $$slotProps) => {
												var fragment_5 = root();
												var node_4 = $.first_child(fragment_5);

												$.component(node_4, () => Field.Field, ($$anchor, Field_Field) => {
													Field_Field($$anchor, {
														children: ($$anchor, $$slotProps) => {
															var fragment_6 = root();
															var node_5 = $.first_child(fragment_6);

															$.component(node_5, () => Field.Label, ($$anchor, Field_Label) => {
																Field_Label($$anchor, {
																	for: 'time-from',
																	children: ($$anchor, $$slotProps) => {
																		$.next();

																		var text = $.text('Start Time');

																		$.append($$anchor, text);
																	},
																	$$slots: { default: true }
																});
															});

															var node_6 = $.sibling(node_5, 2);

															$.component(node_6, () => InputGroup.Root, ($$anchor, InputGroup_Root) => {
																InputGroup_Root($$anchor, {
																	children: ($$anchor, $$slotProps) => {
																		var fragment_7 = root();
																		var node_7 = $.first_child(fragment_7);

																		$.component(node_7, () => InputGroup.Input, ($$anchor, InputGroup_Input) => {
																			InputGroup_Input($$anchor, {
																				id: 'time-from',
																				type: 'time',
																				step: '1',
																				value: '10:30:00',
																				class: 'appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none'
																			});
																		});

																		var node_8 = $.sibling(node_7, 2);

																		$.component(node_8, () => InputGroup.Addon, ($$anchor, InputGroup_Addon) => {
																			InputGroup_Addon($$anchor, {
																				children: ($$anchor, $$slotProps) => {
																					IconPlaceholder($$anchor, {
																						lucide: 'Clock2Icon',
																						tabler: 'IconClockHour2',
																						hugeicons: 'Clock03Icon',
																						phosphor: 'ClockIcon',
																						remixicon: 'RiTimeLine',
																						class: 'text-muted-foreground'
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

												var node_9 = $.sibling(node_4, 2);

												$.component(node_9, () => Field.Field, ($$anchor, Field_Field_1) => {
													Field_Field_1($$anchor, {
														children: ($$anchor, $$slotProps) => {
															var fragment_9 = root();
															var node_10 = $.first_child(fragment_9);

															$.component(node_10, () => Field.Label, ($$anchor, Field_Label_1) => {
																Field_Label_1($$anchor, {
																	for: 'time-to',
																	children: ($$anchor, $$slotProps) => {
																		$.next();

																		var text_1 = $.text('End Time');

																		$.append($$anchor, text_1);
																	},
																	$$slots: { default: true }
																});
															});

															var node_11 = $.sibling(node_10, 2);

															$.component(node_11, () => InputGroup.Root, ($$anchor, InputGroup_Root_1) => {
																InputGroup_Root_1($$anchor, {
																	children: ($$anchor, $$slotProps) => {
																		var fragment_10 = root();
																		var node_12 = $.first_child(fragment_10);

																		$.component(node_12, () => InputGroup.Input, ($$anchor, InputGroup_Input_1) => {
																			InputGroup_Input_1($$anchor, {
																				id: 'time-to',
																				type: 'time',
																				step: '1',
																				value: '12:30:00',
																				class: 'appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none'
																			});
																		});

																		var node_13 = $.sibling(node_12, 2);

																		$.component(node_13, () => InputGroup.Addon, ($$anchor, InputGroup_Addon_1) => {
																			InputGroup_Addon_1($$anchor, {
																				children: ($$anchor, $$slotProps) => {
																					IconPlaceholder($$anchor, {
																						lucide: 'Clock2Icon',
																						tabler: 'IconClockHour2',
																						hugeicons: 'Clock03Icon',
																						phosphor: 'ClockIcon',
																						remixicon: 'RiTimeLine',
																						class: 'text-muted-foreground'
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