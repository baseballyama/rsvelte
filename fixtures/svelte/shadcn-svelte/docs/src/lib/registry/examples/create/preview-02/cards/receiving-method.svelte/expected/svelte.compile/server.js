import * as $ from 'svelte/internal/server';
import * as Card from "$lib/registry/ui/card/index.js";
import * as Field from "$lib/registry/ui/field/index.js";
import * as RadioGroup from "$lib/registry/ui/radio-group/index.js";
import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
import { Button } from "$lib/registry/ui/button/index.js";
import { Input } from "$lib/registry/ui/input/index.js";

export default function Receiving_method($$renderer) {
	if (Card.Root) {
		$$renderer.push('<!--[-->');

		Card.Root($$renderer, {
			children: ($$renderer) => {
				if (Card.Header) {
					$$renderer.push('<!--[-->');

					Card.Header($$renderer, {
						children: ($$renderer) => {
							if (Card.Description) {
								$$renderer.push('<!--[-->');

								Card.Description($$renderer, {
									children: ($$renderer) => {
										$$renderer.push(`<!---->Payout Preferences`);
									},
									$$slots: { default: true }
								});

								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}

							$$renderer.push(` `);

							if (Card.Title) {
								$$renderer.push('<!--[-->');

								Card.Title($$renderer, {
									children: ($$renderer) => {
										$$renderer.push(`<!---->Receiving Method`);
									},
									$$slots: { default: true }
								});

								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}

							$$renderer.push(` `);

							if (Card.Action) {
								$$renderer.push('<!--[-->');

								Card.Action($$renderer, {
									children: ($$renderer) => {
										Button($$renderer, {
											variant: 'ghost',
											size: 'icon-sm',
											class: 'bg-muted',
											children: ($$renderer) => {
												IconPlaceholder($$renderer, {
													lucide: 'XIcon',
													tabler: 'IconX',
													hugeicons: 'Cancel01Icon',
													phosphor: 'XIcon',
													remixicon: 'RiCloseLine'
												});
											},
											$$slots: { default: true }
										});
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
															for: 'account-holder',
															children: ($$renderer) => {
																$$renderer.push(`<!---->Account Holder Name`);
															},
															$$slots: { default: true }
														});

														$$renderer.push('<!--]-->');
													} else {
														$$renderer.push('<!--[!-->');
														$$renderer.push('<!--]-->');
													}

													$$renderer.push(` `);
													Input($$renderer, { id: 'account-holder', value: 'Synthetic Horizons Music LLC' });
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

										if (Field.Set) {
											$$renderer.push('<!--[-->');

											Field.Set($$renderer, {
												children: ($$renderer) => {
													if (Field.Legend) {
														$$renderer.push('<!--[-->');

														Field.Legend($$renderer, {
															variant: 'label',
															children: ($$renderer) => {
																$$renderer.push(`<!---->Receiving Method`);
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
															value: 'bank',
															class: 'grid grid-cols-1 items-start gap-3 md:grid-cols-2',
															children: ($$renderer) => {
																if (Field.Label) {
																	$$renderer.push('<!--[-->');

																	Field.Label($$renderer, {
																		for: 'method-bank',
																		children: ($$renderer) => {
																			if (Field.Field) {
																				$$renderer.push('<!--[-->');

																				Field.Field($$renderer, {
																					orientation: 'horizontal',
																					class: 'pb-2.5',
																					children: ($$renderer) => {
																						if (RadioGroup.Item) {
																							$$renderer.push('<!--[-->');
																							RadioGroup.Item($$renderer, { value: 'bank', id: 'method-bank' });
																							$$renderer.push('<!--]-->');
																						} else {
																							$$renderer.push('<!--[!-->');
																							$$renderer.push('<!--]-->');
																						}

																						$$renderer.push(` `);

																						if (Field.Content) {
																							$$renderer.push('<!--[-->');

																							Field.Content($$renderer, {
																								children: ($$renderer) => {
																									if (Field.Description) {
																										$$renderer.push('<!--[-->');

																										Field.Description($$renderer, {
																											class: 'font-medium text-foreground',
																											children: ($$renderer) => {
																												$$renderer.push(`<!---->Bank Transfer`);
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
																												$$renderer.push(`<!---->SWIFT / IBAN`);
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

																if (Field.Label) {
																	$$renderer.push('<!--[-->');

																	Field.Label($$renderer, {
																		for: 'method-paypal',
																		children: ($$renderer) => {
																			if (Field.Field) {
																				$$renderer.push('<!--[-->');

																				Field.Field($$renderer, {
																					orientation: 'horizontal',
																					class: 'pb-2.5',
																					children: ($$renderer) => {
																						if (RadioGroup.Item) {
																							$$renderer.push('<!--[-->');
																							RadioGroup.Item($$renderer, { value: 'paypal', id: 'method-paypal' });
																							$$renderer.push('<!--]-->');
																						} else {
																							$$renderer.push('<!--[!-->');
																							$$renderer.push('<!--]-->');
																						}

																						$$renderer.push(` `);

																						if (Field.Content) {
																							$$renderer.push('<!--[-->');

																							Field.Content($$renderer, {
																								children: ($$renderer) => {
																									if (Field.Description) {
																										$$renderer.push('<!--[-->');

																										Field.Description($$renderer, {
																											class: 'font-medium text-foreground',
																											children: ($$renderer) => {
																												$$renderer.push(`<!---->PayPal`);
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
																											class: 'line-clamp-1',
																											children: ($$renderer) => {
																												$$renderer.push(`<!---->Instant Payout`);
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
															for: 'iban',
															children: ($$renderer) => {
																$$renderer.push(`<!---->IBAN / Account Number`);
															},
															$$slots: { default: true }
														});

														$$renderer.push('<!--]-->');
													} else {
														$$renderer.push('<!--[!-->');
														$$renderer.push('<!--]-->');
													}

													$$renderer.push(` `);
													Input($$renderer, { id: 'iban', placeholder: 'DE89 3704 0044 ....' });
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

				if (Card.Footer) {
					$$renderer.push('<!--[-->');

					Card.Footer($$renderer, {
						children: ($$renderer) => {
							Button($$renderer, {
								class: 'w-full',
								disabled: true,
								children: ($$renderer) => {
									$$renderer.push(`<!---->Save Payout Settings`);
								},
								$$slots: { default: true }
							});
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