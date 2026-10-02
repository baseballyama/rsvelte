import * as $ from 'svelte/internal/server';
import * as Field from "$lib/registry/ui/field/index.js";
import * as Select from "$lib/registry/ui/select/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

export default function Field_select_fields($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const basicItems = [
			{ label: "Option 1", value: "option1" },
			{ label: "Option 2", value: "option2" },
			{ label: "Option 3", value: "option3" }
		];

		const countryItems = [
			{ label: "United States", value: "us" },
			{ label: "United Kingdom", value: "uk" },
			{ label: "Canada", value: "ca" }
		];

		const timezoneItems = [
			{ label: "UTC", value: "utc" },
			{ label: "Eastern Time", value: "est" },
			{ label: "Pacific Time", value: "pst" }
		];

		const invalidItems = [
			{ label: "Option 1", value: "option1" },
			{ label: "Option 2", value: "option2" },
			{ label: "Option 3", value: "option3" }
		];

		const disabledItems = [
			{ label: "Option 1", value: "option1" },
			{ label: "Option 2", value: "option2" },
			{ label: "Option 3", value: "option3" }
		];

		let basicValue = undefined;
		let countryValue = undefined;
		let timezoneValue = undefined;
		let invalidValue = undefined;
		let disabledValue = undefined;
		const basicLabel = $.derived(() => basicItems.find((item) => item.value === basicValue)?.label ?? "Choose an option");
		const countryLabel = $.derived(() => countryItems.find((item) => item.value === countryValue)?.label ?? "Select your country");
		const timezoneLabel = $.derived(() => timezoneItems.find((item) => item.value === timezoneValue)?.label ?? "Select timezone");
		const invalidLabel = $.derived(() => invalidItems.find((item) => item.value === invalidValue)?.label ?? "This field has an error");
		const disabledLabel = $.derived(() => disabledItems.find((item) => item.value === disabledValue)?.label ?? "Cannot select");
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			Example($$renderer, {
				title: 'Select Fields',
				children: ($$renderer) => {
					if (Field.Group) {
						$$renderer.push('<!--[-->');

						Field.Group($$renderer, {
							children: ($$renderer) => {
								if (Field.Field) {
									$$renderer.push('<!--[-->');

									Field.Field($$renderer, {
										children: ($$renderer) => {
											if (Field.Label) {
												$$renderer.push('<!--[-->');

												Field.Label($$renderer, {
													for: 'select-basic',
													children: ($$renderer) => {
														$$renderer.push(`<!---->Basic Select`);
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
														return basicValue;
													},

													set value($$value) {
														basicValue = $$value;
														$$settled = false;
													},

													children: ($$renderer) => {
														if (Select.Trigger) {
															$$renderer.push('<!--[-->');

															Select.Trigger($$renderer, {
																id: 'select-basic',
																children: ($$renderer) => {
																	$$renderer.push(`<!---->${$.escape(basicLabel())}`);
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

																				const each_array = $.ensure_array_like(basicItems);

																				for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
																					let item = each_array[$$index];

																					if (Select.Item) {
																						$$renderer.push('<!--[-->');

																						Select.Item($$renderer, {
																							value: item.value,
																							children: ($$renderer) => {
																								$$renderer.push(`<!---->${$.escape(item.label)}`);
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
													for: 'select-country',
													children: ($$renderer) => {
														$$renderer.push(`<!---->Country`);
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
														return countryValue;
													},

													set value($$value) {
														countryValue = $$value;
														$$settled = false;
													},

													children: ($$renderer) => {
														if (Select.Trigger) {
															$$renderer.push('<!--[-->');

															Select.Trigger($$renderer, {
																id: 'select-country',
																children: ($$renderer) => {
																	$$renderer.push(`<!---->${$.escape(countryLabel())}`);
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

																				const each_array_1 = $.ensure_array_like(countryItems);

																				for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
																					let item = each_array_1[$$index_1];

																					if (Select.Item) {
																						$$renderer.push('<!--[-->');

																						Select.Item($$renderer, {
																							value: item.value,
																							children: ($$renderer) => {
																								$$renderer.push(`<!---->${$.escape(item.label)}`);
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

											if (Field.Description) {
												$$renderer.push('<!--[-->');

												Field.Description($$renderer, {
													children: ($$renderer) => {
														$$renderer.push(`<!---->Select the country where you currently reside.`);
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
													for: 'select-timezone',
													children: ($$renderer) => {
														$$renderer.push(`<!---->Timezone`);
													},
													$$slots: { default: true }
												});

												$$renderer.push('<!--]-->');
											} else {
												$$renderer.push('<!--[!-->');
												$$renderer.push('<!--]-->');
											}

											$$renderer.push(` `);

											if (Field.Description) {
												$$renderer.push('<!--[-->');

												Field.Description($$renderer, {
													children: ($$renderer) => {
														$$renderer.push(`<!---->Choose your local timezone for accurate scheduling.`);
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
														return timezoneValue;
													},

													set value($$value) {
														timezoneValue = $$value;
														$$settled = false;
													},

													children: ($$renderer) => {
														if (Select.Trigger) {
															$$renderer.push('<!--[-->');

															Select.Trigger($$renderer, {
																id: 'select-timezone',
																children: ($$renderer) => {
																	$$renderer.push(`<!---->${$.escape(timezoneLabel())}`);
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

																				const each_array_2 = $.ensure_array_like(timezoneItems);

																				for (let $$index_2 = 0, $$length = each_array_2.length; $$index_2 < $$length; $$index_2++) {
																					let item = each_array_2[$$index_2];

																					if (Select.Item) {
																						$$renderer.push('<!--[-->');

																						Select.Item($$renderer, {
																							value: item.value,
																							children: ($$renderer) => {
																								$$renderer.push(`<!---->${$.escape(item.label)}`);
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
										'data-invalid': true,
										children: ($$renderer) => {
											if (Field.Label) {
												$$renderer.push('<!--[-->');

												Field.Label($$renderer, {
													for: 'select-invalid',
													children: ($$renderer) => {
														$$renderer.push(`<!---->Invalid Select`);
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
														return invalidValue;
													},

													set value($$value) {
														invalidValue = $$value;
														$$settled = false;
													},

													children: ($$renderer) => {
														if (Select.Trigger) {
															$$renderer.push('<!--[-->');

															Select.Trigger($$renderer, {
																id: 'select-invalid',
																'aria-invalid': true,
																children: ($$renderer) => {
																	$$renderer.push(`<!---->${$.escape(invalidLabel())}`);
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

																				const each_array_3 = $.ensure_array_like(invalidItems);

																				for (let $$index_3 = 0, $$length = each_array_3.length; $$index_3 < $$length; $$index_3++) {
																					let item = each_array_3[$$index_3];

																					if (Select.Item) {
																						$$renderer.push('<!--[-->');

																						Select.Item($$renderer, {
																							value: item.value,
																							children: ($$renderer) => {
																								$$renderer.push(`<!---->${$.escape(item.label)}`);
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

											if (Field.Description) {
												$$renderer.push('<!--[-->');

												Field.Description($$renderer, {
													children: ($$renderer) => {
														$$renderer.push(`<!---->This field contains validation errors.`);
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
										'data-disabled': true,
										children: ($$renderer) => {
											if (Field.Label) {
												$$renderer.push('<!--[-->');

												Field.Label($$renderer, {
													for: 'select-disabled-field',
													children: ($$renderer) => {
														$$renderer.push(`<!---->Disabled Field`);
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
													disabled: true,
													get value() {
														return disabledValue;
													},

													set value($$value) {
														disabledValue = $$value;
														$$settled = false;
													},

													children: ($$renderer) => {
														if (Select.Trigger) {
															$$renderer.push('<!--[-->');

															Select.Trigger($$renderer, {
																id: 'select-disabled-field',
																children: ($$renderer) => {
																	$$renderer.push(`<!---->${$.escape(disabledLabel())}`);
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

																				const each_array_4 = $.ensure_array_like(disabledItems);

																				for (let $$index_4 = 0, $$length = each_array_4.length; $$index_4 < $$length; $$index_4++) {
																					let item = each_array_4[$$index_4];

																					if (Select.Item) {
																						$$renderer.push('<!--[-->');

																						Select.Item($$renderer, {
																							value: item.value,
																							children: ($$renderer) => {
																								$$renderer.push(`<!---->${$.escape(item.label)}`);
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

											if (Field.Description) {
												$$renderer.push('<!--[-->');

												Field.Description($$renderer, {
													children: ($$renderer) => {
														$$renderer.push(`<!---->This field is currently disabled.`);
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
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}