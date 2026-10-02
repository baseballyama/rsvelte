import * as $ from 'svelte/internal/server';
import * as Card from "$lib/registry/ui/card/index.js";
import * as Field from "$lib/registry/ui/field/index.js";
import * as Select from "$lib/registry/ui/select/index.js";
import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
import { Button } from "$lib/registry/ui/button/index.js";
import { Slider } from "$lib/registry/ui/slider/index.js";
import { Textarea } from "$lib/registry/ui/textarea/index.js";

export default function Payout_threshold($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const CURRENCIES = [
			{ label: "USD — United States Dollar", value: "usd" },
			{ label: "EUR — Euro", value: "eur" },
			{ label: "GBP — British Pound", value: "gbp" },
			{ label: "JPY — Japanese Yen", value: "jpy" }
		];

		let amount = [3000];
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
												$$renderer.push(`<!---->Payout Threshold`);
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
												$$renderer.push(`<!---->Set the minimum balance required before a payout is triggered.`);
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
																	for: 'preferred-currency',
																	children: ($$renderer) => {
																		$$renderer.push(`<!---->Preferred Currency`);
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
																				id: 'preferred-currency',
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

												if (Field.Field) {
													$$renderer.push('<!--[-->');

													Field.Field($$renderer, {
														children: ($$renderer) => {
															$$renderer.push(`<div class="flex items-baseline justify-between">`);

															if (Field.Label) {
																$$renderer.push('<!--[-->');

																Field.Label($$renderer, {
																	for: 'min-payout',
																	children: ($$renderer) => {
																		$$renderer.push(`<!---->Minimum Payout Amount`);
																	},
																	$$slots: { default: true }
																});

																$$renderer.push('<!--]-->');
															} else {
																$$renderer.push('<!--[!-->');
																$$renderer.push('<!--]-->');
															}

															$$renderer.push(` <span class="text-2xl font-semibold tabular-nums">$${$.escape(amount[0].toFixed(2))}</span></div> `);

															Slider($$renderer, {
																type: 'multiple',
																id: 'min-payout',
																min: 50,
																max: 10000,
																step: 50,
																get value() {
																	return amount;
																},

																set value($$value) {
																	amount = $$value;
																	$$settled = false;
																}
															});

															$$renderer.push(`<!----> <div class="flex items-center justify-between">`);

															if (Field.Description) {
																$$renderer.push('<!--[-->');

																Field.Description($$renderer, {
																	children: ($$renderer) => {
																		$$renderer.push(`<!---->$50 (MIN)`);
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
																		$$renderer.push(`<!---->$10,000 (MAX)`);
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

												$$renderer.push(` `);

												if (Field.Field) {
													$$renderer.push('<!--[-->');

													Field.Field($$renderer, {
														children: ($$renderer) => {
															if (Field.Label) {
																$$renderer.push('<!--[-->');

																Field.Label($$renderer, {
																	for: 'payout-notes',
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

															Textarea($$renderer, {
																id: 'payout-notes',
																placeholder: 'Add any notes for this payout configuration...',
																class: 'min-h-[100px]'
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

						if (Card.Footer) {
							$$renderer.push('<!--[-->');

							Card.Footer($$renderer, {
								children: ($$renderer) => {
									Button($$renderer, {
										class: 'w-full',
										children: ($$renderer) => {
											$$renderer.push(`<!---->Save Threshold`);
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