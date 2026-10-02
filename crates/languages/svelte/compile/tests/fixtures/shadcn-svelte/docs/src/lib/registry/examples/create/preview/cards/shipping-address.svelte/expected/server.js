import * as $ from 'svelte/internal/server';
import * as Card from "$lib/registry/ui/card/index.js";
import * as Field from "$lib/registry/ui/field/index.js";
import * as Select from "$lib/registry/ui/select/index.js";
import { Button } from "$lib/registry/ui/button/index.js";
import { Checkbox } from "$lib/registry/ui/checkbox/index.js";
import { Input } from "$lib/registry/ui/input/index.js";

export default function Shipping_address($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const states = [
			{ value: "CA", label: "California" },
			{ value: "NY", label: "New York" },
			{ value: "TX", label: "Texas" }
		];

		const countries = [
			{ value: "US", label: "United States" },
			{ value: "CA", label: "Canada" },
			{ value: "UK", label: "United Kingdom" }
		];

		let selectedState = states[0].value;
		let selectedCountry = countries[0].value;
		let saveDefault = true;
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
												$$renderer.push(`<!---->Shipping Address`);
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
												$$renderer.push(`<!---->Where should we deliver?`);
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
												if (Field.Field) {
													$$renderer.push('<!--[-->');

													Field.Field($$renderer, {
														children: ($$renderer) => {
															if (Field.Label) {
																$$renderer.push('<!--[-->');

																Field.Label($$renderer, {
																	for: 'shipping-street',
																	children: ($$renderer) => {
																		$$renderer.push(`<!---->Street address`);
																	},
																	$$slots: { default: true }
																});

																$$renderer.push('<!--]-->');
															} else {
																$$renderer.push('<!--[!-->');
																$$renderer.push('<!--]-->');
															}

															$$renderer.push(` `);
															Input($$renderer, { id: 'shipping-street', placeholder: '123 Main Street' });
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
																	for: 'shipping-apt',
																	children: ($$renderer) => {
																		$$renderer.push(`<!---->Apt / Suite`);
																	},
																	$$slots: { default: true }
																});

																$$renderer.push('<!--]-->');
															} else {
																$$renderer.push('<!--[!-->');
																$$renderer.push('<!--]-->');
															}

															$$renderer.push(` `);
															Input($$renderer, { id: 'shipping-apt', placeholder: 'Apt 4B' });
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

												if (Field.Group) {
													$$renderer.push('<!--[-->');

													Field.Group($$renderer, {
														class: 'grid grid-cols-2',
														children: ($$renderer) => {
															if (Field.Field) {
																$$renderer.push('<!--[-->');

																Field.Field($$renderer, {
																	children: ($$renderer) => {
																		if (Field.Label) {
																			$$renderer.push('<!--[-->');

																			Field.Label($$renderer, {
																				for: 'shipping-city',
																				children: ($$renderer) => {
																					$$renderer.push(`<!---->City`);
																				},
																				$$slots: { default: true }
																			});

																			$$renderer.push('<!--]-->');
																		} else {
																			$$renderer.push('<!--[!-->');
																			$$renderer.push('<!--]-->');
																		}

																		$$renderer.push(` `);
																		Input($$renderer, { id: 'shipping-city', placeholder: 'San Francisco' });
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
																				for: 'shipping-state',
																				children: ($$renderer) => {
																					$$renderer.push(`<!---->State`);
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
																					return selectedState;
																				},

																				set value($$value) {
																					selectedState = $$value;
																					$$settled = false;
																				},

																				children: ($$renderer) => {
																					if (Select.Trigger) {
																						$$renderer.push('<!--[-->');

																						Select.Trigger($$renderer, {
																							id: 'shipping-state',
																							class: 'w-full',
																							children: ($$renderer) => {
																								$$renderer.push(`<!---->${$.escape(states.find((s) => s.value === selectedState)?.label ?? "Select State")}`);
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

																								const each_array = $.ensure_array_like(states);

																								for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
																									let state = each_array[$$index];

																									if (Select.Item) {
																										$$renderer.push('<!--[-->');

																										Select.Item($$renderer, {
																											value: state.value,
																											children: ($$renderer) => {
																												$$renderer.push(`<!---->${$.escape(state.label)}`);
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

												if (Field.Group) {
													$$renderer.push('<!--[-->');

													Field.Group($$renderer, {
														class: 'grid grid-cols-2',
														children: ($$renderer) => {
															if (Field.Field) {
																$$renderer.push('<!--[-->');

																Field.Field($$renderer, {
																	children: ($$renderer) => {
																		if (Field.Label) {
																			$$renderer.push('<!--[-->');

																			Field.Label($$renderer, {
																				for: 'shipping-zip',
																				children: ($$renderer) => {
																					$$renderer.push(`<!---->ZIP Code`);
																				},
																				$$slots: { default: true }
																			});

																			$$renderer.push('<!--]-->');
																		} else {
																			$$renderer.push('<!--[!-->');
																			$$renderer.push('<!--]-->');
																		}

																		$$renderer.push(` `);
																		Input($$renderer, { id: 'shipping-zip', placeholder: '94102' });
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
																				for: 'shipping-country',
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
																					return selectedCountry;
																				},

																				set value($$value) {
																					selectedCountry = $$value;
																					$$settled = false;
																				},

																				children: ($$renderer) => {
																					if (Select.Trigger) {
																						$$renderer.push('<!--[-->');

																						Select.Trigger($$renderer, {
																							id: 'shipping-country',
																							class: 'w-full',
																							children: ($$renderer) => {
																								$$renderer.push(`<!---->${$.escape(countries.find((c) => c.value === selectedCountry)?.label ?? "Select Country")}`);
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

																								const each_array_1 = $.ensure_array_like(countries);

																								for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
																									let country = each_array_1[$$index_1];

																									if (Select.Item) {
																										$$renderer.push('<!--[-->');

																										Select.Item($$renderer, {
																											value: country.value,
																											children: ($$renderer) => {
																												$$renderer.push(`<!---->${$.escape(country.label)}`);
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
														orientation: 'horizontal',
														children: ($$renderer) => {
															Checkbox($$renderer, {
																id: 'shipping-save',
																get checked() {
																	return saveDefault;
																},

																set checked($$value) {
																	saveDefault = $$value;
																	$$settled = false;
																}
															});

															$$renderer.push(`<!----> `);

															if (Field.Label) {
																$$renderer.push('<!--[-->');

																Field.Label($$renderer, {
																	for: 'shipping-save',
																	class: 'font-normal',
																	children: ($$renderer) => {
																		$$renderer.push(`<!---->Save as default address`);
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

						if (Card.Footer) {
							$$renderer.push('<!--[-->');

							Card.Footer($$renderer, {
								children: ($$renderer) => {
									Button($$renderer, {
										variant: 'outline',
										size: 'sm',
										children: ($$renderer) => {
											$$renderer.push(`<!---->Cancel`);
										},
										$$slots: { default: true }
									});

									$$renderer.push(`<!----> `);

									Button($$renderer, {
										size: 'sm',
										class: 'ml-auto',
										children: ($$renderer) => {
											$$renderer.push(`<!---->Save Address`);
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
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}