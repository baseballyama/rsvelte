import * as $ from 'svelte/internal/server';
import * as Select from "$lib/registry/ui/select/index.js";
import * as Table from "$lib/registry/ui/table/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

export default function Table_with_select($$renderer) {
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

	Example($$renderer, {
		title: 'With Select',
		children: ($$renderer) => {
			if (Table.Root) {
				$$renderer.push('<!--[-->');

				Table.Root($$renderer, {
					children: ($$renderer) => {
						if (Table.Header) {
							$$renderer.push('<!--[-->');

							Table.Header($$renderer, {
								children: ($$renderer) => {
									if (Table.Row) {
										$$renderer.push('<!--[-->');

										Table.Row($$renderer, {
											children: ($$renderer) => {
												if (Table.Head) {
													$$renderer.push('<!--[-->');

													Table.Head($$renderer, {
														children: ($$renderer) => {
															$$renderer.push(`<!---->Task`);
														},
														$$slots: { default: true }
													});

													$$renderer.push('<!--]-->');
												} else {
													$$renderer.push('<!--[!-->');
													$$renderer.push('<!--]-->');
												}

												$$renderer.push(` `);

												if (Table.Head) {
													$$renderer.push('<!--[-->');

													Table.Head($$renderer, {
														children: ($$renderer) => {
															$$renderer.push(`<!---->Assignee`);
														},
														$$slots: { default: true }
													});

													$$renderer.push('<!--]-->');
												} else {
													$$renderer.push('<!--[!-->');
													$$renderer.push('<!--]-->');
												}

												$$renderer.push(` `);

												if (Table.Head) {
													$$renderer.push('<!--[-->');

													Table.Head($$renderer, {
														children: ($$renderer) => {
															$$renderer.push(`<!---->Status`);
														},
														$$slots: { default: true }
													});

													$$renderer.push('<!--]-->');
												} else {
													$$renderer.push('<!--[!-->');
													$$renderer.push('<!--]-->');
												}
											},
											$$slots: { default: true }
										});

										$$renderer.push('<!--]-->');
									} else {
										$$renderer.push('<!--[!-->');
										$$renderer.push('<!--]-->');
									}
								},
								$$slots: { default: true }
							});

							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}

						$$renderer.push(` `);

						if (Table.Body) {
							$$renderer.push('<!--[-->');

							Table.Body($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<!--[-->`);

									const each_array = $.ensure_array_like(tasks);

									for (let $$index_1 = 0, $$length = each_array.length; $$index_1 < $$length; $$index_1++) {
										let item = each_array[$$index_1];
										const assigneePerson = people.find((person) => person.value === item.assignee);
										const assigneeLabel = assigneePerson?.label ?? "";

										if (Table.Row) {
											$$renderer.push('<!--[-->');

											Table.Row($$renderer, {
												children: ($$renderer) => {
													if (Table.Cell) {
														$$renderer.push('<!--[-->');

														Table.Cell($$renderer, {
															class: 'font-medium',
															children: ($$renderer) => {
																$$renderer.push(`<!---->${$.escape(item.task)}`);
															},
															$$slots: { default: true }
														});

														$$renderer.push('<!--]-->');
													} else {
														$$renderer.push('<!--[!-->');
														$$renderer.push('<!--]-->');
													}

													$$renderer.push(` `);

													if (Table.Cell) {
														$$renderer.push('<!--[-->');

														Table.Cell($$renderer, {
															children: ($$renderer) => {
																if (Select.Root) {
																	$$renderer.push('<!--[-->');

																	Select.Root($$renderer, {
																		type: 'single',
																		value: item.assignee,
																		children: ($$renderer) => {
																			if (Select.Trigger) {
																				$$renderer.push('<!--[-->');

																				Select.Trigger($$renderer, {
																					class: 'w-40',
																					size: 'sm',
																					children: ($$renderer) => {
																						$$renderer.push(`<!---->${$.escape(assigneeLabel)}`);
																					},
																					$$slots: { default: true }
																				});

																				$$renderer.push('<!--]-->');
																			} else {
																				$$renderer.push('<!--[!-->');
																				$$renderer.push('<!--]-->');
																			}

																			$$renderer.push(` `);

																			if (Select.Content) {
																				$$renderer.push('<!--[-->');

																				Select.Content($$renderer, {
																					children: ($$renderer) => {
																						if (Select.Group) {
																							$$renderer.push('<!--[-->');

																							Select.Group($$renderer, {
																								children: ($$renderer) => {
																									$$renderer.push(`<!--[-->`);

																									const each_array_1 = $.ensure_array_like(people);

																									for (let $$index = 0, $$length = each_array_1.length; $$index < $$length; $$index++) {
																										let person = each_array_1[$$index];

																										if (Select.Item) {
																											$$renderer.push('<!--[-->');

																											Select.Item($$renderer, {
																												value: person.value,
																												children: ($$renderer) => {
																													$$renderer.push(`<!---->${$.escape(person.label)}`);
																												},
																												$$slots: { default: true }
																											});

																											$$renderer.push('<!--]-->');
																										} else {
																											$$renderer.push('<!--[!-->');
																											$$renderer.push('<!--]-->');
																										}
																									}

																									$$renderer.push(`<!--]-->`);
																								},
																								$$slots: { default: true }
																							});

																							$$renderer.push('<!--]-->');
																						} else {
																							$$renderer.push('<!--[!-->');
																							$$renderer.push('<!--]-->');
																						}
																					},
																					$$slots: { default: true }
																				});

																				$$renderer.push('<!--]-->');
																			} else {
																				$$renderer.push('<!--[!-->');
																				$$renderer.push('<!--]-->');
																			}
																		},
																		$$slots: { default: true }
																	});

																	$$renderer.push('<!--]-->');
																} else {
																	$$renderer.push('<!--[!-->');
																	$$renderer.push('<!--]-->');
																}
															},
															$$slots: { default: true }
														});

														$$renderer.push('<!--]-->');
													} else {
														$$renderer.push('<!--[!-->');
														$$renderer.push('<!--]-->');
													}

													$$renderer.push(` `);

													if (Table.Cell) {
														$$renderer.push('<!--[-->');

														Table.Cell($$renderer, {
															children: ($$renderer) => {
																$$renderer.push(`<!---->${$.escape(item.status)}`);
															},
															$$slots: { default: true }
														});

														$$renderer.push('<!--]-->');
													} else {
														$$renderer.push('<!--[!-->');
														$$renderer.push('<!--]-->');
													}
												},
												$$slots: { default: true }
											});

											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}
									}

									$$renderer.push(`<!--]-->`);
								},
								$$slots: { default: true }
							});

							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}
					},
					$$slots: { default: true }
				});

				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}
		},
		$$slots: { default: true }
	});
}