import * as $ from 'svelte/internal/server';
import * as Card from "$lib/registry/ui/card/index.js";
import * as Field from "$lib/registry/ui/field/index.js";
import * as InputGroup from "$lib/registry/ui/input-group/index.js";
import * as Item from "$lib/registry/ui/item/index.js";
import * as Select from "$lib/registry/ui/select/index.js";
import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
import { Button } from "$lib/registry/ui/button/index.js";
import { Separator } from "$lib/registry/ui/separator/index.js";

export default function Transfer_funds($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const FROM_ACCOUNTS = [
			{
				label: "Main Checking (··8402) — $12,450.00",
				value: "checking"
			},
			{ label: "Business (··7731) — $8,920.00", value: "business" }
		];

		const TO_ACCOUNTS = [
			{
				label: "High Yield Savings (··1192) — $42,100.00",
				value: "savings"
			},

			{
				label: "Investment (··3349) — $18,200.00",
				value: "investment"
			}
		];

		let fromAccount = "checking";
		let toAccount = "savings";
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
												$$renderer.push(`<!---->Transfer Funds`);
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
												$$renderer.push(`<!---->Move money between your connected accounts.`);
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
																	for: 'transfer-amount',
																	children: ($$renderer) => {
																		$$renderer.push(`<!---->Amount to Transfer`);
																	},
																	$$slots: { default: true }
																});

																$$renderer.push('<!--]-->');
															} else {
																$$renderer.push('<!--[!-->');
																$$renderer.push('<!--]-->');
															}

															$$renderer.push(` `);

															if (InputGroup.Root) {
																$$renderer.push('<!--[-->');

																InputGroup.Root($$renderer, {
																	children: ($$renderer) => {
																		if (InputGroup.Addon) {
																			$$renderer.push('<!--[-->');

																			InputGroup.Addon($$renderer, {
																				children: ($$renderer) => {
																					if (InputGroup.Text) {
																						$$renderer.push('<!--[-->');

																						InputGroup.Text($$renderer, {
																							children: ($$renderer) => {
																								$$renderer.push(`<!---->$`);
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

																		if (InputGroup.Input) {
																			$$renderer.push('<!--[-->');
																			InputGroup.Input($$renderer, { id: 'transfer-amount', value: '1,200.00' });
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
																	for: 'from-account',
																	children: ($$renderer) => {
																		$$renderer.push(`<!---->From Account`);
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
																		return fromAccount;
																	},

																	set value($$value) {
																		fromAccount = $$value;
																		$$settled = false;
																	},

																	children: ($$renderer) => {
																		if (Select.Trigger) {
																			$$renderer.push('<!--[-->');

																			Select.Trigger($$renderer, {
																				id: 'from-account',
																				class: 'w-full',
																				children: ($$renderer) => {
																					$$renderer.push(`<!---->${$.escape(FROM_ACCOUNTS.find((a) => a.value === fromAccount)?.label)}`);
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

																								const each_array = $.ensure_array_like(FROM_ACCOUNTS);

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
																	for: 'to-account',
																	children: ($$renderer) => {
																		$$renderer.push(`<!---->To Account`);
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
																		return toAccount;
																	},

																	set value($$value) {
																		toAccount = $$value;
																		$$settled = false;
																	},

																	children: ($$renderer) => {
																		if (Select.Trigger) {
																			$$renderer.push('<!--[-->');

																			Select.Trigger($$renderer, {
																				id: 'to-account',
																				class: 'w-full',
																				children: ($$renderer) => {
																					$$renderer.push(`<!---->${$.escape(TO_ACCOUNTS.find((a) => a.value === toAccount)?.label)}`);
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

																								const each_array_1 = $.ensure_array_like(TO_ACCOUNTS);

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

												$$renderer.push(` `);

												if (Item.Root) {
													$$renderer.push('<!--[-->');

													Item.Root($$renderer, {
														variant: 'muted',
														class: 'flex-col items-stretch',
														children: ($$renderer) => {
															if (Item.Content) {
																$$renderer.push('<!--[-->');

																Item.Content($$renderer, {
																	class: 'gap-3',
																	children: ($$renderer) => {
																		$$renderer.push(`<div class="flex items-center justify-between"><span class="text-sm text-muted-foreground">Estimated arrival</span> <span class="text-sm font-medium">Today, Apr 14</span></div> `);
																		Separator($$renderer, {});
																		$$renderer.push(`<!----> <div class="flex items-center justify-between"><span class="text-sm text-muted-foreground">Transaction fee</span> <span class="text-sm font-medium tabular-nums">$0.00</span></div> `);
																		Separator($$renderer, {});
																		$$renderer.push(`<!----> <div class="flex items-center justify-between"><span class="text-sm font-medium">Total amount</span> <span class="text-sm font-semibold tabular-nums">$1,200.00</span></div>`);
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
										class: 'w-full',
										children: ($$renderer) => {
											$$renderer.push(`<!---->Confirm Transfer`);
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

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}