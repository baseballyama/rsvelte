import * as $ from 'svelte/internal/server';
import * as Field from "$lib/registry/ui/field/index.js";
import * as Select from "$lib/registry/ui/select/index.js";
import { Button } from "$lib/registry/ui/button/index.js";
import { Checkbox } from "$lib/registry/ui/checkbox/index.js";
import { Input } from "$lib/registry/ui/input/index.js";
import { Textarea } from "$lib/registry/ui/textarea/index.js";

export default function Field_demo($$renderer) {
	let month = void 0;
	let year = void 0;
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		$$renderer.push(`<div class="w-full max-w-md"><form>`);

		if (Field.Group) {
			$$renderer.push('<!--[-->');

			Field.Group($$renderer, {
				children: ($$renderer) => {
					if (Field.Set) {
						$$renderer.push('<!--[-->');

						Field.Set($$renderer, {
							children: ($$renderer) => {
								if (Field.Legend) {
									$$renderer.push('<!--[-->');

									Field.Legend($$renderer, {
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

								if (Field.Description) {
									$$renderer.push('<!--[-->');

									Field.Description($$renderer, {
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

								$$renderer.push(` `);

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
															placeholder: 'Evil Rabbit',
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

											$$renderer.push(` `);

											if (Field.Field) {
												$$renderer.push('<!--[-->');

												Field.Field($$renderer, {
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
																	$$renderer.push(`<!---->Enter your 16-digit card number`);
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

											$$renderer.push(` <div class="grid grid-cols-3 gap-4">`);

											if (Field.Field) {
												$$renderer.push('<!--[-->');

												Field.Field($$renderer, {
													children: ($$renderer) => {
														if (Field.Label) {
															$$renderer.push('<!--[-->');

															Field.Label($$renderer, {
																for: 'checkout-exp-month-ts6',
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
																			id: 'checkout-exp-month-ts6',
																			children: ($$renderer) => {
																				$$renderer.push(`<span>${$.escape(month || "MM")}</span>`);
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
																				if (Select.Item) {
																					$$renderer.push('<!--[-->');

																					Select.Item($$renderer, {
																						value: '01',
																						children: ($$renderer) => {
																							$$renderer.push(`<!---->01`);
																						},
																						$$slots: { default: true }
																					});

																					$$renderer.push('<!--]-->');
																				} else {
																					$$renderer.push('<!--[!-->');
																					$$renderer.push('<!--]-->');
																				}

																				$$renderer.push(` `);

																				if (Select.Item) {
																					$$renderer.push('<!--[-->');

																					Select.Item($$renderer, {
																						value: '02',
																						children: ($$renderer) => {
																							$$renderer.push(`<!---->02`);
																						},
																						$$slots: { default: true }
																					});

																					$$renderer.push('<!--]-->');
																				} else {
																					$$renderer.push('<!--[!-->');
																					$$renderer.push('<!--]-->');
																				}

																				$$renderer.push(` `);

																				if (Select.Item) {
																					$$renderer.push('<!--[-->');

																					Select.Item($$renderer, {
																						value: '03',
																						children: ($$renderer) => {
																							$$renderer.push(`<!---->03`);
																						},
																						$$slots: { default: true }
																					});

																					$$renderer.push('<!--]-->');
																				} else {
																					$$renderer.push('<!--[!-->');
																					$$renderer.push('<!--]-->');
																				}

																				$$renderer.push(` `);

																				if (Select.Item) {
																					$$renderer.push('<!--[-->');

																					Select.Item($$renderer, {
																						value: '04',
																						children: ($$renderer) => {
																							$$renderer.push(`<!---->04`);
																						},
																						$$slots: { default: true }
																					});

																					$$renderer.push('<!--]-->');
																				} else {
																					$$renderer.push('<!--[!-->');
																					$$renderer.push('<!--]-->');
																				}

																				$$renderer.push(` `);

																				if (Select.Item) {
																					$$renderer.push('<!--[-->');

																					Select.Item($$renderer, {
																						value: '05',
																						children: ($$renderer) => {
																							$$renderer.push(`<!---->05`);
																						},
																						$$slots: { default: true }
																					});

																					$$renderer.push('<!--]-->');
																				} else {
																					$$renderer.push('<!--[!-->');
																					$$renderer.push('<!--]-->');
																				}

																				$$renderer.push(` `);

																				if (Select.Item) {
																					$$renderer.push('<!--[-->');

																					Select.Item($$renderer, {
																						value: '06',
																						children: ($$renderer) => {
																							$$renderer.push(`<!---->06`);
																						},
																						$$slots: { default: true }
																					});

																					$$renderer.push('<!--]-->');
																				} else {
																					$$renderer.push('<!--[!-->');
																					$$renderer.push('<!--]-->');
																				}

																				$$renderer.push(` `);

																				if (Select.Item) {
																					$$renderer.push('<!--[-->');

																					Select.Item($$renderer, {
																						value: '07',
																						children: ($$renderer) => {
																							$$renderer.push(`<!---->07`);
																						},
																						$$slots: { default: true }
																					});

																					$$renderer.push('<!--]-->');
																				} else {
																					$$renderer.push('<!--[!-->');
																					$$renderer.push('<!--]-->');
																				}

																				$$renderer.push(` `);

																				if (Select.Item) {
																					$$renderer.push('<!--[-->');

																					Select.Item($$renderer, {
																						value: '08',
																						children: ($$renderer) => {
																							$$renderer.push(`<!---->08`);
																						},
																						$$slots: { default: true }
																					});

																					$$renderer.push('<!--]-->');
																				} else {
																					$$renderer.push('<!--[!-->');
																					$$renderer.push('<!--]-->');
																				}

																				$$renderer.push(` `);

																				if (Select.Item) {
																					$$renderer.push('<!--[-->');

																					Select.Item($$renderer, {
																						value: '09',
																						children: ($$renderer) => {
																							$$renderer.push(`<!---->09`);
																						},
																						$$slots: { default: true }
																					});

																					$$renderer.push('<!--]-->');
																				} else {
																					$$renderer.push('<!--[!-->');
																					$$renderer.push('<!--]-->');
																				}

																				$$renderer.push(` `);

																				if (Select.Item) {
																					$$renderer.push('<!--[-->');

																					Select.Item($$renderer, {
																						value: '10',
																						children: ($$renderer) => {
																							$$renderer.push(`<!---->10`);
																						},
																						$$slots: { default: true }
																					});

																					$$renderer.push('<!--]-->');
																				} else {
																					$$renderer.push('<!--[!-->');
																					$$renderer.push('<!--]-->');
																				}

																				$$renderer.push(` `);

																				if (Select.Item) {
																					$$renderer.push('<!--[-->');

																					Select.Item($$renderer, {
																						value: '11',
																						children: ($$renderer) => {
																							$$renderer.push(`<!---->11`);
																						},
																						$$slots: { default: true }
																					});

																					$$renderer.push('<!--]-->');
																				} else {
																					$$renderer.push('<!--[!-->');
																					$$renderer.push('<!--]-->');
																				}

																				$$renderer.push(` `);

																				if (Select.Item) {
																					$$renderer.push('<!--[-->');

																					Select.Item($$renderer, {
																						value: '12',
																						children: ($$renderer) => {
																							$$renderer.push(`<!---->12`);
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
																				$$renderer.push(`<span>${$.escape(year || "YYYY")}</span>`);
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
																				if (Select.Item) {
																					$$renderer.push('<!--[-->');

																					Select.Item($$renderer, {
																						value: '2024',
																						children: ($$renderer) => {
																							$$renderer.push(`<!---->2024`);
																						},
																						$$slots: { default: true }
																					});

																					$$renderer.push('<!--]-->');
																				} else {
																					$$renderer.push('<!--[!-->');
																					$$renderer.push('<!--]-->');
																				}

																				$$renderer.push(` `);

																				if (Select.Item) {
																					$$renderer.push('<!--[-->');

																					Select.Item($$renderer, {
																						value: '2025',
																						children: ($$renderer) => {
																							$$renderer.push(`<!---->2025`);
																						},
																						$$slots: { default: true }
																					});

																					$$renderer.push('<!--]-->');
																				} else {
																					$$renderer.push('<!--[!-->');
																					$$renderer.push('<!--]-->');
																				}

																				$$renderer.push(` `);

																				if (Select.Item) {
																					$$renderer.push('<!--[-->');

																					Select.Item($$renderer, {
																						value: '2026',
																						children: ($$renderer) => {
																							$$renderer.push(`<!---->2026`);
																						},
																						$$slots: { default: true }
																					});

																					$$renderer.push('<!--]-->');
																				} else {
																					$$renderer.push('<!--[!-->');
																					$$renderer.push('<!--]-->');
																				}

																				$$renderer.push(` `);

																				if (Select.Item) {
																					$$renderer.push('<!--[-->');

																					Select.Item($$renderer, {
																						value: '2027',
																						children: ($$renderer) => {
																							$$renderer.push(`<!---->2027`);
																						},
																						$$slots: { default: true }
																					});

																					$$renderer.push('<!--]-->');
																				} else {
																					$$renderer.push('<!--[!-->');
																					$$renderer.push('<!--]-->');
																				}

																				$$renderer.push(` `);

																				if (Select.Item) {
																					$$renderer.push('<!--[-->');

																					Select.Item($$renderer, {
																						value: '2028',
																						children: ($$renderer) => {
																							$$renderer.push(`<!---->2028`);
																						},
																						$$slots: { default: true }
																					});

																					$$renderer.push('<!--]-->');
																				} else {
																					$$renderer.push('<!--[!-->');
																					$$renderer.push('<!--]-->');
																				}

																				$$renderer.push(` `);

																				if (Select.Item) {
																					$$renderer.push('<!--[-->');

																					Select.Item($$renderer, {
																						value: '2029',
																						children: ($$renderer) => {
																							$$renderer.push(`<!---->2029`);
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
											$$renderer.push(`<!---->The billing address associated with your payment method`);
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
															placeholder: 'Add any additional comments',
															class: 'resize-none'
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

		$$renderer.push(`</form></div>`);
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}