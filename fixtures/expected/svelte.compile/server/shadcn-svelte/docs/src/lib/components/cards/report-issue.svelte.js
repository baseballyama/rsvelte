import * as $ from 'svelte/internal/server';
import * as Card from "$lib/registry/ui/card/index.js";
import * as Field from "$lib/registry/ui/field/index.js";
import * as Select from "$lib/registry/ui/select/index.js";
import { Button } from "$lib/registry/ui/button/index.js";
import { Input } from "$lib/registry/ui/input/index.js";
import { Textarea } from "$lib/registry/ui/textarea/index.js";

export default function Report_issue($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const id = $.props_id($$renderer);

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

		let area = "billing";
		let level = "2";
		const areaLabel = $.derived(() => areas.find((a) => a.value === area)?.label ?? "Select");
		const levelLabel = $.derived(() => levels.find((l) => l.value === level)?.label ?? "Select Level");
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			if (Card.Root) {
				$$renderer.push('<!--[-->');

				Card.Root($$renderer, {
					children: ($$renderer) => {
						if (Card.Header) {
							$$renderer.push('<!--[-->');

							Card.Header($$renderer, {
								children: ($$renderer) => {
									if (Card.Title) {
										$$renderer.push('<!--[-->');

										Card.Title($$renderer, {
											children: ($$renderer) => {
												$$renderer.push(`<!---->Report an issue`);
											},
											$$slots: { default: true }
										});

										$$renderer.push('<!--]-->');
									} else {
										$$renderer.push('<!--[!-->');
										$$renderer.push('<!--]-->');
									}

									$$renderer.push(` `);

									if (Card.Description) {
										$$renderer.push('<!--[-->');

										Card.Description($$renderer, {
											children: ($$renderer) => {
												$$renderer.push(`<!---->What area are you having problems with?`);
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

						if (Card.Content) {
							$$renderer.push('<!--[-->');

							Card.Content($$renderer, {
								children: ($$renderer) => {
									if (Field.Group) {
										$$renderer.push('<!--[-->');

										Field.Group($$renderer, {
											children: ($$renderer) => {
												if (Field.Group) {
													$$renderer.push('<!--[-->');

													Field.Group($$renderer, {
														class: 'grid gap-4 sm:grid-cols-2',
														children: ($$renderer) => {
															if (Field.Field) {
																$$renderer.push('<!--[-->');

																Field.Field($$renderer, {
																	children: ($$renderer) => {
																		if (Field.Label) {
																			$$renderer.push('<!--[-->');

																			Field.Label($$renderer, {
																				for: `area-${id}`,
																				children: ($$renderer) => {
																					$$renderer.push(`<!---->Area`);
																				},
																				$$slots: { default: true }
																			});

																			$$renderer.push('<!--]-->');
																		} else {
																			$$renderer.push('<!--[!-->');
																			$$renderer.push('<!--]-->');
																		}

																		$$renderer.push(` `);

																		if (Select.Root) {
																			$$renderer.push('<!--[-->');

																			Select.Root($$renderer, {
																				type: 'single',
																				get value() {
																					return area;
																				},

																				set value($$value) {
																					area = $$value;
																					$$settled = false;
																				},

																				children: ($$renderer) => {
																					if (Select.Trigger) {
																						$$renderer.push('<!--[-->');

																						Select.Trigger($$renderer, {
																							id: `area-${id}`,
																							'aria-label': 'Area',
																							class: 'w-full',
																							children: ($$renderer) => {
																								$$renderer.push(`<!---->${$.escape(areaLabel())}`);
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
																								$$renderer.push(`<!--[-->`);

																								const each_array = $.ensure_array_like(areas);

																								for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
																									let area = each_array[$$index];

																									if (Select.Item) {
																										$$renderer.push('<!--[-->');

																										Select.Item($$renderer, {
																											value: area.value,
																											children: ($$renderer) => {
																												$$renderer.push(`<!---->${$.escape(area.label)}`);
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

															$$renderer.push(` `);

															if (Field.Field) {
																$$renderer.push('<!--[-->');

																Field.Field($$renderer, {
																	children: ($$renderer) => {
																		if (Field.Label) {
																			$$renderer.push('<!--[-->');

																			Field.Label($$renderer, {
																				for: `level-${id}`,
																				children: ($$renderer) => {
																					$$renderer.push(`<!---->Security Level`);
																				},
																				$$slots: { default: true }
																			});

																			$$renderer.push('<!--]-->');
																		} else {
																			$$renderer.push('<!--[!-->');
																			$$renderer.push('<!--]-->');
																		}

																		$$renderer.push(` `);

																		if (Select.Root) {
																			$$renderer.push('<!--[-->');

																			Select.Root($$renderer, {
																				type: 'single',
																				get value() {
																					return level;
																				},

																				set value($$value) {
																					level = $$value;
																					$$settled = false;
																				},

																				children: ($$renderer) => {
																					if (Select.Trigger) {
																						$$renderer.push('<!--[-->');

																						Select.Trigger($$renderer, {
																							id: `level-${id}`,
																							class: 'w-full [&_span]:!block [&_span]:truncate',
																							'aria-label': 'Security Level',
																							children: ($$renderer) => {
																								$$renderer.push(`<span>${$.escape(levelLabel())}</span>`);
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
																								$$renderer.push(`<!--[-->`);

																								const each_array_1 = $.ensure_array_like(levels);

																								for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
																									let level = each_array_1[$$index_1];

																									if (Select.Item) {
																										$$renderer.push('<!--[-->');

																										Select.Item($$renderer, {
																											value: level.value,
																											children: ($$renderer) => {
																												$$renderer.push(`<!---->${$.escape(level.label)}`);
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

												if (Field.Field) {
													$$renderer.push('<!--[-->');

													Field.Field($$renderer, {
														children: ($$renderer) => {
															if (Field.Label) {
																$$renderer.push('<!--[-->');

																Field.Label($$renderer, {
																	for: `subject-${id}`,
																	children: ($$renderer) => {
																		$$renderer.push(`<!---->Subject`);
																	},
																	$$slots: { default: true }
																});

																$$renderer.push('<!--]-->');
															} else {
																$$renderer.push('<!--[!-->');
																$$renderer.push('<!--]-->');
															}

															$$renderer.push(` `);
															Input($$renderer, { id: `subject-${id}`, placeholder: 'I need help with...' });
															$$renderer.push(`<!---->`);
														},
														$$slots: { default: true }
													});

													$$renderer.push('<!--]-->');
												} else {
													$$renderer.push('<!--[!-->');
													$$renderer.push('<!--]-->');
												}

												$$renderer.push(` `);

												if (Field.Field) {
													$$renderer.push('<!--[-->');

													Field.Field($$renderer, {
														children: ($$renderer) => {
															if (Field.Label) {
																$$renderer.push('<!--[-->');

																Field.Label($$renderer, {
																	for: `description-${id}`,
																	children: ($$renderer) => {
																		$$renderer.push(`<!---->Description`);
																	},
																	$$slots: { default: true }
																});

																$$renderer.push('<!--]-->');
															} else {
																$$renderer.push('<!--[!-->');
																$$renderer.push('<!--]-->');
															}

															$$renderer.push(` `);

															Textarea($$renderer, {
																id: `description-${id}`,
																placeholder: 'Please include all information relevant to your issue.',
																class: 'min-h-24'
															});

															$$renderer.push(`<!---->`);
														},
														$$slots: { default: true }
													});

													$$renderer.push('<!--]-->');
												} else {
													$$renderer.push('<!--[!-->');
													$$renderer.push('<!--]-->');
												}

												$$renderer.push(` `);

												if (Field.Field) {
													$$renderer.push('<!--[-->');

													Field.Field($$renderer, {
														orientation: 'horizontal',
														class: 'justify-end',
														children: ($$renderer) => {
															Button($$renderer, {
																variant: 'ghost',
																size: 'sm',
																children: ($$renderer) => {
																	$$renderer.push(`<!---->Cancel`);
																},
																$$slots: { default: true }
															});

															$$renderer.push(`<!----> `);

															Button($$renderer, {
																size: 'sm',
																children: ($$renderer) => {
																	$$renderer.push(`<!---->Submit`);
																},
																$$slots: { default: true }
															});

															$$renderer.push(`<!---->`);
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
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}