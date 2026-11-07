import * as $ from 'svelte/internal/server';
import * as Card from "$lib/registry/ui/card/index.js";
import * as Field from "$lib/registry/ui/field/index.js";
import * as Select from "$lib/registry/ui/select/index.js";
import { Button } from "$lib/registry/ui/button/index.js";
import { Checkbox } from "$lib/registry/ui/checkbox/index.js";
import { Input } from "$lib/registry/ui/input/index.js";
import { Textarea } from "$lib/registry/ui/textarea/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

export default function Form_example($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const monthItems = [
			{ label: "01", value: "01" },
			{ label: "02", value: "02" },
			{ label: "03", value: "03" },
			{ label: "04", value: "04" },
			{ label: "05", value: "05" },
			{ label: "06", value: "06" },
			{ label: "07", value: "07" },
			{ label: "08", value: "08" },
			{ label: "09", value: "09" },
			{ label: "10", value: "10" },
			{ label: "11", value: "11" },
			{ label: "12", value: "12" }
		];

		const yearItems = [
			{ label: "2024", value: "2024" },
			{ label: "2025", value: "2025" },
			{ label: "2026", value: "2026" },
			{ label: "2027", value: "2027" },
			{ label: "2028", value: "2028" },
			{ label: "2029", value: "2029" }
		];

		let month = undefined;
		let year = undefined;
		const monthLabel = $.derived(() => monthItems.find((item) => item.value === month)?.label ?? "MM");
		const yearLabel = $.derived(() => yearItems.find((item) => item.value === year)?.label ?? "YYYY");
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			Example($$renderer, {
				title: 'Complex Form',
				children: ($$renderer) => {
					if (Card.Root) {
						$$renderer.push('<!--[-->');

						Card.Root($$renderer, {
							class: 'w-full max-w-md',
							children: ($$renderer) => {
								if (Card.Header) {
									$$renderer.push('<!--[-->');

									Card.Header($$renderer, {
										children: ($$renderer) => {
											if (Card.Title) {
												$$renderer.push('<!--[-->');

												Card.Title($$renderer, {
													children: ($$renderer) => {
														$$renderer.push(`<!---->Payment Method`);
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
														$$renderer.push(`<!---->All transactions are secure and encrypted`);
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
											$$renderer.push(`<form>`);

											if (Field.Group) {
												$$renderer.push('<!--[-->');

												Field.Group($$renderer, {
													children: ($$renderer) => {
														if (Field.Set) {
															$$renderer.push('<!--[-->');

															Field.Set($$renderer, {
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
																									for: 'checkout-7j9-card-name-43j',
																									children: ($$renderer) => {
																										$$renderer.push(`<!---->Name on Card`);
																									},
																									$$slots: { default: true }
																								});

																								$$renderer.push('<!--]-->');
																							} else {
																								$$renderer.push('<!--[!-->');
																								$$renderer.push('<!--]-->');
																							}

																							$$renderer.push(` `);

																							Input($$renderer, {
																								id: 'checkout-7j9-card-name-43j',
																								placeholder: 'John Doe',
																								required: true
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

																				$$renderer.push(` <div class="grid grid-cols-3 gap-4">`);

																				if (Field.Field) {
																					$$renderer.push('<!--[-->');

																					Field.Field($$renderer, {
																						class: 'col-span-2',
																						children: ($$renderer) => {
																							if (Field.Label) {
																								$$renderer.push('<!--[-->');

																								Field.Label($$renderer, {
																									for: 'checkout-7j9-card-number-uw1',
																									children: ($$renderer) => {
																										$$renderer.push(`<!---->Card Number`);
																									},
																									$$slots: { default: true }
																								});

																								$$renderer.push('<!--]-->');
																							} else {
																								$$renderer.push('<!--[!-->');
																								$$renderer.push('<!--]-->');
																							}

																							$$renderer.push(` `);

																							Input($$renderer, {
																								id: 'checkout-7j9-card-number-uw1',
																								placeholder: '1234 5678 9012 3456',
																								required: true
																							});

																							$$renderer.push(`<!----> `);

																							if (Field.Description) {
																								$$renderer.push('<!--[-->');

																								Field.Description($$renderer, {
																									children: ($$renderer) => {
																										$$renderer.push(`<!---->Enter your 16-digit number.`);
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
																						class: 'col-span-1',
																						children: ($$renderer) => {
																							if (Field.Label) {
																								$$renderer.push('<!--[-->');

																								Field.Label($$renderer, {
																									for: 'checkout-7j9-cvv',
																									children: ($$renderer) => {
																										$$renderer.push(`<!---->CVV`);
																									},
																									$$slots: { default: true }
																								});

																								$$renderer.push('<!--]-->');
																							} else {
																								$$renderer.push('<!--[!-->');
																								$$renderer.push('<!--]-->');
																							}

																							$$renderer.push(` `);
																							Input($$renderer, { id: 'checkout-7j9-cvv', placeholder: '123', required: true });
																							$$renderer.push(`<!---->`);
																						},
																						$$slots: { default: true }
																					});

																					$$renderer.push('<!--]-->');
																				} else {
																					$$renderer.push('<!--[!-->');
																					$$renderer.push('<!--]-->');
																				}

																				$$renderer.push(`</div> <div class="grid grid-cols-2 gap-4">`);

																				if (Field.Field) {
																					$$renderer.push('<!--[-->');

																					Field.Field($$renderer, {
																						children: ($$renderer) => {
																							if (Field.Label) {
																								$$renderer.push('<!--[-->');

																								Field.Label($$renderer, {
																									for: 'checkout-7j9-exp-month-ts6',
																									children: ($$renderer) => {
																										$$renderer.push(`<!---->Month`);
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
																										return month;
																									},

																									set value($$value) {
																										month = $$value;
																										$$settled = false;
																									},

																									children: ($$renderer) => {
																										if (Select.Trigger) {
																											$$renderer.push('<!--[-->');

																											Select.Trigger($$renderer, {
																												id: 'checkout-7j9-exp-month-ts6',
																												children: ($$renderer) => {
																													$$renderer.push(`<!---->${$.escape(monthLabel())}`);
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

																																const each_array = $.ensure_array_like(monthItems);

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
																									for: 'checkout-7j9-exp-year-f59',
																									children: ($$renderer) => {
																										$$renderer.push(`<!---->Year`);
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
																										return year;
																									},

																									set value($$value) {
																										year = $$value;
																										$$settled = false;
																									},

																									children: ($$renderer) => {
																										if (Select.Trigger) {
																											$$renderer.push('<!--[-->');

																											Select.Trigger($$renderer, {
																												id: 'checkout-7j9-exp-year-f59',
																												children: ($$renderer) => {
																													$$renderer.push(`<!---->${$.escape(yearLabel())}`);
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

																																const each_array_1 = $.ensure_array_like(yearItems);

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
																						},
																						$$slots: { default: true }
																					});

																					$$renderer.push('<!--]-->');
																				} else {
																					$$renderer.push('<!--[!-->');
																					$$renderer.push('<!--]-->');
																				}

																				$$renderer.push(`</div>`);
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

														if (Field.Separator) {
															$$renderer.push('<!--[-->');
															Field.Separator($$renderer, {});
															$$renderer.push('<!--]-->');
														} else {
															$$renderer.push('<!--[!-->');
															$$renderer.push('<!--]-->');
														}

														$$renderer.push(` `);

														if (Field.Set) {
															$$renderer.push('<!--[-->');

															Field.Set($$renderer, {
																children: ($$renderer) => {
																	if (Field.Legend) {
																		$$renderer.push('<!--[-->');

																		Field.Legend($$renderer, {
																			children: ($$renderer) => {
																				$$renderer.push(`<!---->Billing Address`);
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
																				$$renderer.push(`<!---->The billing address associated with your payment.`);
																			},
																			$$slots: { default: true }
																		});

																		$$renderer.push('<!--]-->');
																	} else {
																		$$renderer.push('<!--[!-->');
																		$$renderer.push('<!--]-->');
																	}

																	$$renderer.push(` `);

																	if (Field.Group) {
																		$$renderer.push('<!--[-->');

																		Field.Group($$renderer, {
																			children: ($$renderer) => {
																				if (Field.Field) {
																					$$renderer.push('<!--[-->');

																					Field.Field($$renderer, {
																						orientation: 'horizontal',
																						children: ($$renderer) => {
																							Checkbox($$renderer, { id: 'checkout-7j9-same-as-shipping-wgm', checked: true });
																							$$renderer.push(`<!----> `);

																							if (Field.Label) {
																								$$renderer.push('<!--[-->');

																								Field.Label($$renderer, {
																									for: 'checkout-7j9-same-as-shipping-wgm',
																									class: 'font-normal',
																									children: ($$renderer) => {
																										$$renderer.push(`<!---->Same as shipping address`);
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

														if (Field.Separator) {
															$$renderer.push('<!--[-->');
															Field.Separator($$renderer, {});
															$$renderer.push('<!--]-->');
														} else {
															$$renderer.push('<!--[!-->');
															$$renderer.push('<!--]-->');
														}

														$$renderer.push(` `);

														if (Field.Set) {
															$$renderer.push('<!--[-->');

															Field.Set($$renderer, {
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
																									for: 'checkout-7j9-optional-comments',
																									children: ($$renderer) => {
																										$$renderer.push(`<!---->Comments`);
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
																								id: 'checkout-7j9-optional-comments',
																								placeholder: 'Add any additional comments'
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

														$$renderer.push(` `);

														if (Field.Field) {
															$$renderer.push('<!--[-->');

															Field.Field($$renderer, {
																orientation: 'horizontal',
																children: ($$renderer) => {
																	Button($$renderer, {
																		type: 'submit',
																		children: ($$renderer) => {
																			$$renderer.push(`<!---->Submit`);
																		},
																		$$slots: { default: true }
																	});

																	$$renderer.push(`<!----> `);

																	Button($$renderer, {
																		variant: 'outline',
																		type: 'button',
																		children: ($$renderer) => {
																			$$renderer.push(`<!---->Cancel`);
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

											$$renderer.push(`</form>`);
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