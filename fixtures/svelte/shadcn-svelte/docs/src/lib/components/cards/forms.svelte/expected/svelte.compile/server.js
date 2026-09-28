import * as $ from 'svelte/internal/server';
import * as Card from "$lib/registry/ui/card/index.js";
import * as Field from "$lib/registry/ui/field/index.js";
import * as RadioGroup from "$lib/registry/ui/radio-group/index.js";
import { Button } from "$lib/registry/ui/button/index.js";
import { Checkbox } from "$lib/registry/ui/checkbox/index.js";
import { Input } from "$lib/registry/ui/input/index.js";
import { Textarea } from "$lib/registry/ui/textarea/index.js";

export default function Forms($$renderer) {
	const id = $.props_id($$renderer);

	const plans = [
		{
			id: "starter",
			name: "Starter Plan",
			description: "For small businesses.",
			price: "$10"
		},

		{
			id: "pro",
			name: "Pro Plan",
			description: "More features and storage.",
			price: "$20"
		}
	];

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
									class: 'text-lg',
									children: ($$renderer) => {
										$$renderer.push(`<!---->Upgrade your subscription`);
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
									class: 'text-balance',
									children: ($$renderer) => {
										$$renderer.push(`<!---->You are currently on the free plan. Upgrade to the pro plan to get access to all features.`);
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
																		for: `name-${id}`,
																		children: ($$renderer) => {
																			$$renderer.push(`<!---->Name`);
																		},
																		$$slots: { default: true }
																	});

																	$$renderer.push('<!--]-->');
																} else {
																	$$renderer.push('<!--[!-->');
																	$$renderer.push('<!--]-->');
																}

																$$renderer.push(` `);
																Input($$renderer, { id: `name-${id}`, placeholder: 'Max Leiter' });
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
																		for: `email-${id}`,
																		children: ($$renderer) => {
																			$$renderer.push(`<!---->Email`);
																		},
																		$$slots: { default: true }
																	});

																	$$renderer.push('<!--]-->');
																} else {
																	$$renderer.push('<!--[!-->');
																	$$renderer.push('<!--]-->');
																}

																$$renderer.push(` `);
																Input($$renderer, { id: `email-${id}`, placeholder: 'mail@acme.com' });
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

										$$renderer.push(` `);

										if (Field.Group) {
											$$renderer.push('<!--[-->');

											Field.Group($$renderer, {
												class: 'grid grid-cols-2 gap-3 md:grid-cols-[1fr_80px_60px]',
												children: ($$renderer) => {
													if (Field.Field) {
														$$renderer.push('<!--[-->');

														Field.Field($$renderer, {
															children: ($$renderer) => {
																if (Field.Label) {
																	$$renderer.push('<!--[-->');

																	Field.Label($$renderer, {
																		for: `card-number-${id}`,
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
																	id: `card-number-${id}`,
																	placeholder: '1234 1234 1234 1234',
																	class: 'col-span-2 md:col-span-1'
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
															children: ($$renderer) => {
																if (Field.Label) {
																	$$renderer.push('<!--[-->');

																	Field.Label($$renderer, {
																		for: `card-number-expiry-${id}`,
																		children: ($$renderer) => {
																			$$renderer.push(`<!---->Expiry Date`);
																		},
																		$$slots: { default: true }
																	});

																	$$renderer.push('<!--]-->');
																} else {
																	$$renderer.push('<!--[!-->');
																	$$renderer.push('<!--]-->');
																}

																$$renderer.push(` `);
																Input($$renderer, { id: `card-number-expiry-${id}`, placeholder: 'MM/YY' });
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
																		for: `card-number-cvc-${id}`,
																		children: ($$renderer) => {
																			$$renderer.push(`<!---->CVC`);
																		},
																		$$slots: { default: true }
																	});

																	$$renderer.push('<!--]-->');
																} else {
																	$$renderer.push('<!--[!-->');
																	$$renderer.push('<!--]-->');
																}

																$$renderer.push(` `);
																Input($$renderer, { id: `card-number-cvc-${id}`, placeholder: 'CVC' });
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

										$$renderer.push(` `);

										if (Field.Set) {
											$$renderer.push('<!--[-->');

											Field.Set($$renderer, {
												children: ($$renderer) => {
													if (Field.Legend) {
														$$renderer.push('<!--[-->');

														Field.Legend($$renderer, {
															children: ($$renderer) => {
																$$renderer.push(`<!---->Plan`);
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
																$$renderer.push(`<!---->Select the plan that best fits your needs.`);
															},
															$$slots: { default: true }
														});

														$$renderer.push('<!--]-->');
													} else {
														$$renderer.push('<!--[!-->');
														$$renderer.push('<!--]-->');
													}

													$$renderer.push(` `);

													if (RadioGroup.Root) {
														$$renderer.push('<!--[-->');

														RadioGroup.Root($$renderer, {
															value: 'starter',
															class: 'grid grid-cols-2 gap-2',
															children: ($$renderer) => {
																$$renderer.push(`<!--[-->`);

																const each_array = $.ensure_array_like(plans);

																for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
																	let plan = each_array[$$index];

																	if (Field.Label) {
																		$$renderer.push('<!--[-->');

																		Field.Label($$renderer, {
																			children: ($$renderer) => {
																				if (Field.Field) {
																					$$renderer.push('<!--[-->');

																					Field.Field($$renderer, {
																						orientation: 'horizontal',
																						children: ($$renderer) => {
																							if (Field.Content) {
																								$$renderer.push('<!--[-->');

																								Field.Content($$renderer, {
																									children: ($$renderer) => {
																										if (Field.Title) {
																											$$renderer.push('<!--[-->');

																											Field.Title($$renderer, {
																												children: ($$renderer) => {
																													$$renderer.push(`<!---->${$.escape(plan.name)}`);
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
																												class: 'text-xs',
																												children: ($$renderer) => {
																													$$renderer.push(`<!---->${$.escape(plan.description)}`);
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

																							if (RadioGroup.Item) {
																								$$renderer.push('<!--[-->');
																								RadioGroup.Item($$renderer, { value: plan.id, id: plan.name });
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

										$$renderer.push(` `);

										if (Field.Field) {
											$$renderer.push('<!--[-->');

											Field.Field($$renderer, {
												children: ($$renderer) => {
													if (Field.Label) {
														$$renderer.push('<!--[-->');

														Field.Label($$renderer, {
															for: 'notes',
															children: ($$renderer) => {
																$$renderer.push(`<!---->Notes`);
															},
															$$slots: { default: true }
														});

														$$renderer.push('<!--]-->');
													} else {
														$$renderer.push('<!--[!-->');
														$$renderer.push('<!--]-->');
													}

													$$renderer.push(` `);
													Textarea($$renderer, { id: 'notes', placeholder: 'Enter notes' });
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
													if (Field.Field) {
														$$renderer.push('<!--[-->');

														Field.Field($$renderer, {
															orientation: 'horizontal',
															children: ($$renderer) => {
																Checkbox($$renderer, { id: 'terms' });
																$$renderer.push(`<!----> `);

																if (Field.Label) {
																	$$renderer.push('<!--[-->');

																	Field.Label($$renderer, {
																		for: 'terms',
																		class: 'font-normal',
																		children: ($$renderer) => {
																			$$renderer.push(`<!---->I agree to the terms and conditions`);
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
																Checkbox($$renderer, { id: 'newsletter', checked: true });
																$$renderer.push(`<!----> `);

																if (Field.Label) {
																	$$renderer.push('<!--[-->');

																	Field.Label($$renderer, {
																		for: 'newsletter',
																		class: 'font-normal',
																		children: ($$renderer) => {
																			$$renderer.push(`<!---->Allow us to send you emails`);
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
														children: ($$renderer) => {
															$$renderer.push(`<!---->Upgrade Plan`);
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
}