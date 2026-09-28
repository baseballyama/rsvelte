import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as Select from "$lib/registry/ui/select/index.js";
import * as Table from "$lib/registry/ui/table/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

var root = $.from_html(`<!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);

export default function Table_with_select($$anchor) {
	const people = [
		{ value: "sarah", label: "Sarah Chen" },
		{ value: "marcus", label: "Marc Rodriguez" },
		{ value: "emily", label: "Emily Watson" },
		{ value: "david", label: "David Kim" }
	];

	const tasks = [
		{
			task: "Design homepage",
			assignee: "sarah",
			status: "In Progress"
		},
		{ task: "Implement API", assignee: "marcus", status: "Pending" },
		{
			task: "Write tests",
			assignee: "emily",
			status: "Not Started"
		}
	];

	Example($$anchor, {
		title: 'With Select',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = $.comment();
			var node = $.first_child(fragment_1);

			$.component(node, () => Table.Root, ($$anchor, Table_Root) => {
				Table_Root($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = root_1();
						var node_1 = $.first_child(fragment_2);

						$.component(node_1, () => Table.Header, ($$anchor, Table_Header) => {
							Table_Header($$anchor, {
								children: ($$anchor, $$slotProps) => {
									var fragment_3 = $.comment();
									var node_2 = $.first_child(fragment_3);

									$.component(node_2, () => Table.Row, ($$anchor, Table_Row) => {
										Table_Row($$anchor, {
											children: ($$anchor, $$slotProps) => {
												var fragment_4 = root();
												var node_3 = $.first_child(fragment_4);

												$.component(node_3, () => Table.Head, ($$anchor, Table_Head) => {
													Table_Head($$anchor, {
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text = $.text('Task');

															$.append($$anchor, text);
														},
														$$slots: { default: true }
													});
												});

												var node_4 = $.sibling(node_3, 2);

												$.component(node_4, () => Table.Head, ($$anchor, Table_Head_1) => {
													Table_Head_1($$anchor, {
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_1 = $.text('Assignee');

															$.append($$anchor, text_1);
														},
														$$slots: { default: true }
													});
												});

												var node_5 = $.sibling(node_4, 2);

												$.component(node_5, () => Table.Head, ($$anchor, Table_Head_2) => {
													Table_Head_2($$anchor, {
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_2 = $.text('Status');

															$.append($$anchor, text_2);
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

						var node_6 = $.sibling(node_1, 2);

						$.component(node_6, () => Table.Body, ($$anchor, Table_Body) => {
							Table_Body($$anchor, {
								children: ($$anchor, $$slotProps) => {
									var fragment_5 = $.comment();
									var node_7 = $.first_child(fragment_5);

									$.each(node_7, 17, () => tasks, (item) => item.task, ($$anchor, item) => {
										const assigneePerson = $.derived(() => people.find((person) => person.value === $.get(item).assignee));
										const assigneeLabel = $.derived(() => $.get(assigneePerson)?.label ?? "");
										var fragment_6 = $.comment();
										var node_8 = $.first_child(fragment_6);

										$.component(node_8, () => Table.Row, ($$anchor, Table_Row_1) => {
											Table_Row_1($$anchor, {
												children: ($$anchor, $$slotProps) => {
													var fragment_7 = root();
													var node_9 = $.first_child(fragment_7);

													$.component(node_9, () => Table.Cell, ($$anchor, Table_Cell) => {
														Table_Cell($$anchor, {
															class: 'font-medium',
															children: ($$anchor, $$slotProps) => {
																$.next();

																var text_3 = $.text();

																$.template_effect(() => $.set_text(text_3, $.get(item).task));
																$.append($$anchor, text_3);
															},
															$$slots: { default: true }
														});
													});

													var node_10 = $.sibling(node_9, 2);

													$.component(node_10, () => Table.Cell, ($$anchor, Table_Cell_1) => {
														Table_Cell_1($$anchor, {
															children: ($$anchor, $$slotProps) => {
																var fragment_9 = $.comment();
																var node_11 = $.first_child(fragment_9);

																$.component(node_11, () => Select.Root, ($$anchor, Select_Root) => {
																	Select_Root($$anchor, {
																		type: 'single',
																		get value() {
																			return $.get(item).assignee;
																		},

																		children: ($$anchor, $$slotProps) => {
																			var fragment_10 = root_1();
																			var node_12 = $.first_child(fragment_10);

																			$.component(node_12, () => Select.Trigger, ($$anchor, Select_Trigger) => {
																				Select_Trigger($$anchor, {
																					class: 'w-40',
																					size: 'sm',
																					children: ($$anchor, $$slotProps) => {
																						$.next();

																						var text_4 = $.text();

																						$.template_effect(() => $.set_text(text_4, $.get(assigneeLabel)));
																						$.append($$anchor, text_4);
																					},
																					$$slots: { default: true }
																				});
																			});

																			var node_13 = $.sibling(node_12, 2);

																			$.component(node_13, () => Select.Content, ($$anchor, Select_Content) => {
																				Select_Content($$anchor, {
																					children: ($$anchor, $$slotProps) => {
																						var fragment_12 = $.comment();
																						var node_14 = $.first_child(fragment_12);

																						$.component(node_14, () => Select.Group, ($$anchor, Select_Group) => {
																							Select_Group($$anchor, {
																								children: ($$anchor, $$slotProps) => {
																									var fragment_13 = $.comment();
																									var node_15 = $.first_child(fragment_13);

																									$.each(node_15, 17, () => people, (person) => person.value, ($$anchor, person) => {
																										var fragment_14 = $.comment();
																										var node_16 = $.first_child(fragment_14);

																										$.component(node_16, () => Select.Item, ($$anchor, Select_Item) => {
																											Select_Item($$anchor, {
																												get value() {
																													return $.get(person).value;
																												},

																												children: ($$anchor, $$slotProps) => {
																													$.next();

																													var text_5 = $.text();

																													$.template_effect(() => $.set_text(text_5, $.get(person).label));
																													$.append($$anchor, text_5);
																												},
																												$$slots: { default: true }
																											});
																										});

																										$.append($$anchor, fragment_14);
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

													var node_17 = $.sibling(node_10, 2);

													$.component(node_17, () => Table.Cell, ($$anchor, Table_Cell_2) => {
														Table_Cell_2($$anchor, {
															children: ($$anchor, $$slotProps) => {
																$.next();

																var text_6 = $.text();

																$.template_effect(() => $.set_text(text_6, $.get(item).status));
																$.append($$anchor, text_6);
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

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}