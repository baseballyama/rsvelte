import * as $ from 'svelte/internal/server';
import * as Card from "$lib/registry/ui/card/index.js";
import * as Field from "$lib/registry/ui/field/index.js";
import * as Select from "$lib/registry/ui/select/index.js";
import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
import { Button } from "$lib/registry/ui/button/index.js";
import { Switch } from "$lib/registry/ui/switch/index.js";

export default function Preferences($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const CURRENCIES = [
			{ label: "USD — United States Dollar", value: "usd" },
			{ label: "EUR — Euro", value: "eur" },
			{ label: "GBP — British Pound", value: "gbp" },
			{ label: "JPY — Japanese Yen", value: "jpy" }
		];

		let currency = "usd";
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
												$$renderer.push(`<!---->Preferences`);
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
												$$renderer.push(`<!---->Manage your account settings and notifications.`);
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
																	for: 'default-currency',
																	children: ($$renderer) => {
																		$$renderer.push(`<!---->Default Currency`);
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
																		return currency;
																	},

																	set value($$value) {
																		currency = $$value;
																		$$settled = false;
																	},

																	children: ($$renderer) => {
																		if (Select.Trigger) {
																			$$renderer.push('<!--[-->');

																			Select.Trigger($$renderer, {
																				id: 'default-currency',
																				class: 'w-full',
																				children: ($$renderer) => {
																					$$renderer.push(`<!---->${$.escape(CURRENCIES.find((c) => c.value === currency)?.label)}`);
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

																								const each_array = $.ensure_array_like(CURRENCIES);

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

												if (Field.Separator) {
													$$renderer.push('<!--[-->');
													Field.Separator($$renderer, { class: '-my-4' });
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
															if (Field.Content) {
																$$renderer.push('<!--[-->');

																Field.Content($$renderer, {
																	children: ($$renderer) => {
																		if (Field.Label) {
																			$$renderer.push('<!--[-->');

																			Field.Label($$renderer, {
																				for: 'public-statistics',
																				children: ($$renderer) => {
																					$$renderer.push(`<!---->Public Statistics`);
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
																					$$renderer.push(`<!---->Allow others to see your total stream count and listening activity`);
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
															Switch($$renderer, { id: 'public-statistics', checked: true });
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

												if (Field.Separator) {
													$$renderer.push('<!--[-->');
													Field.Separator($$renderer, { class: '-my-4' });
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
															if (Field.Content) {
																$$renderer.push('<!--[-->');

																Field.Content($$renderer, {
																	children: ($$renderer) => {
																		if (Field.Label) {
																			$$renderer.push('<!--[-->');

																			Field.Label($$renderer, {
																				for: 'email-notifications',
																				children: ($$renderer) => {
																					$$renderer.push(`<!---->Email Notifications`);
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
																					$$renderer.push(`<!---->Monthly royalty reports and distribution updates`);
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
															Switch($$renderer, { id: 'email-notifications', checked: true });
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
										variant: 'outline',
										children: ($$renderer) => {
											$$renderer.push(`<!---->Reset`);
										},
										$$slots: { default: true }
									});

									$$renderer.push(`<!----> `);

									Button($$renderer, {
										class: 'ml-auto',
										children: ($$renderer) => {
											$$renderer.push(`<!---->Save Preferences`);
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