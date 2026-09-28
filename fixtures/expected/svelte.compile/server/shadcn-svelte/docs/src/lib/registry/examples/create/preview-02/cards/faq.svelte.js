import * as $ from 'svelte/internal/server';
import * as Accordion from "$lib/registry/ui/accordion/index.js";
import * as Card from "$lib/registry/ui/card/index.js";
import * as Tabs from "$lib/registry/ui/tabs/index.js";
import { Button } from "$lib/registry/ui/button/index.js";

export default function Faq($$renderer) {
	const GENERAL_QUESTIONS = [
		{
			q: "How secure is my financial data with Ledger?",
			a: "We use bank-level AES-256 encryption, SOC 2 Type II certified infrastructure, and never store your credentials. All connections use read-only access tokens. We are a SEC registered investment advisor."
		},

		{
			q: "How do I connect my bank or investment accounts?",
			a: "Go to Settings > Linked Accounts and search for your institution. We support over 12,000 banks and brokerages via Plaid and MX."
		},

		{
			q: "Can I export my data for tax purposes?",
			a: "Yes. Navigate to Reports > Tax Export to download a CSV or PDF summary of your transactions, dividends, and capital gains for any tax year."
		}
	];

	const BILLING_QUESTIONS = [
		{
			q: "What is the difference between Basic and Pro pricing tiers?",
			a: "Basic includes budgeting, goal tracking, and up to 3 linked accounts. Pro adds unlimited accounts, dividend tracking, portfolio analysis, and priority support."
		},

		{
			q: "How do I cancel my subscription?",
			a: "Go to Settings > Billing > Manage Plan and click Cancel. Your access continues until the end of your current billing period."
		},

		{
			q: "Do you offer a free trial?",
			a: "Yes. All new accounts start with a 14-day Pro trial. No credit card required."
		}
	];

	const GOALS_QUESTIONS = [
		{
			q: "How do I set up a custom financial goal?",
			a: "Click New Goal from the Savings Targets card. Choose a category, set a target amount and date, and we'll calculate the monthly contribution needed."
		},

		{
			q: "Can I track multiple goals at once?",
			a: "Yes. Pro accounts can track unlimited goals. Basic accounts support up to 3 active goals."
		},

		{
			q: "How are monthly contributions calculated?",
			a: "We divide the remaining amount by the number of months until your target date, adjusted for your current savings rate and any auto-transfer schedules."
		}
	];

	if (Card.Root) {
		$$renderer.push('<!--[-->');

		Card.Root($$renderer, {
			children: ($$renderer) => {
				if (Card.Content) {
					$$renderer.push('<!--[-->');

					Card.Content($$renderer, {
						children: ($$renderer) => {
							if (Tabs.Root) {
								$$renderer.push('<!--[-->');

								Tabs.Root($$renderer, {
									value: 'general',
									children: ($$renderer) => {
										if (Tabs.List) {
											$$renderer.push('<!--[-->');

											Tabs.List($$renderer, {
												class: 'w-full',
												children: ($$renderer) => {
													if (Tabs.Trigger) {
														$$renderer.push('<!--[-->');

														Tabs.Trigger($$renderer, {
															value: 'general',
															class: 'flex-1',
															children: ($$renderer) => {
																$$renderer.push(`<!---->General`);
															},
															$$slots: { default: true }
														});

														$$renderer.push('<!--]-->');
													} else {
														$$renderer.push('<!--[!-->');
														$$renderer.push('<!--]-->');
													}

													$$renderer.push(` `);

													if (Tabs.Trigger) {
														$$renderer.push('<!--[-->');

														Tabs.Trigger($$renderer, {
															value: 'billing',
															class: 'flex-1',
															children: ($$renderer) => {
																$$renderer.push(`<!---->Billing`);
															},
															$$slots: { default: true }
														});

														$$renderer.push('<!--]-->');
													} else {
														$$renderer.push('<!--[!-->');
														$$renderer.push('<!--]-->');
													}

													$$renderer.push(` `);

													if (Tabs.Trigger) {
														$$renderer.push('<!--[-->');

														Tabs.Trigger($$renderer, {
															value: 'goals',
															class: 'flex-1',
															children: ($$renderer) => {
																$$renderer.push(`<!---->Goals`);
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

										if (Tabs.Content) {
											$$renderer.push('<!--[-->');

											Tabs.Content($$renderer, {
												value: 'general',
												children: ($$renderer) => {
													if (Accordion.Root) {
														$$renderer.push('<!--[-->');

														Accordion.Root($$renderer, {
															type: 'single',
															value: '0',
															class: 'w-full',
															children: ($$renderer) => {
																$$renderer.push(`<!--[-->`);

																const each_array = $.ensure_array_like(GENERAL_QUESTIONS);

																for (let index = 0, $$length = each_array.length; index < $$length; index++) {
																	let item = each_array[index];

																	if (Accordion.Item) {
																		$$renderer.push('<!--[-->');

																		Accordion.Item($$renderer, {
																			value: String(index),
																			children: ($$renderer) => {
																				if (Accordion.Trigger) {
																					$$renderer.push('<!--[-->');

																					Accordion.Trigger($$renderer, {
																						children: ($$renderer) => {
																							$$renderer.push(`<!---->${$.escape(item.q)}`);
																						},
																						$$slots: { default: true }
																					});

																					$$renderer.push('<!--]-->');
																				} else {
																					$$renderer.push('<!--[!-->');
																					$$renderer.push('<!--]-->');
																				}

																				$$renderer.push(` `);

																				if (Accordion.Content) {
																					$$renderer.push('<!--[-->');

																					Accordion.Content($$renderer, {
																						children: ($$renderer) => {
																							$$renderer.push(`<!---->${$.escape(item.a)}`);
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

										if (Tabs.Content) {
											$$renderer.push('<!--[-->');

											Tabs.Content($$renderer, {
												value: 'billing',
												children: ($$renderer) => {
													if (Accordion.Root) {
														$$renderer.push('<!--[-->');

														Accordion.Root($$renderer, {
															type: 'single',
															value: '0',
															class: 'w-full',
															children: ($$renderer) => {
																$$renderer.push(`<!--[-->`);

																const each_array_1 = $.ensure_array_like(BILLING_QUESTIONS);

																for (let index = 0, $$length = each_array_1.length; index < $$length; index++) {
																	let item = each_array_1[index];

																	if (Accordion.Item) {
																		$$renderer.push('<!--[-->');

																		Accordion.Item($$renderer, {
																			value: String(index),
																			children: ($$renderer) => {
																				if (Accordion.Trigger) {
																					$$renderer.push('<!--[-->');

																					Accordion.Trigger($$renderer, {
																						children: ($$renderer) => {
																							$$renderer.push(`<!---->${$.escape(item.q)}`);
																						},
																						$$slots: { default: true }
																					});

																					$$renderer.push('<!--]-->');
																				} else {
																					$$renderer.push('<!--[!-->');
																					$$renderer.push('<!--]-->');
																				}

																				$$renderer.push(` `);

																				if (Accordion.Content) {
																					$$renderer.push('<!--[-->');

																					Accordion.Content($$renderer, {
																						children: ($$renderer) => {
																							$$renderer.push(`<!---->${$.escape(item.a)}`);
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

										if (Tabs.Content) {
											$$renderer.push('<!--[-->');

											Tabs.Content($$renderer, {
												value: 'goals',
												children: ($$renderer) => {
													if (Accordion.Root) {
														$$renderer.push('<!--[-->');

														Accordion.Root($$renderer, {
															type: 'single',
															value: '0',
															class: 'w-full',
															children: ($$renderer) => {
																$$renderer.push(`<!--[-->`);

																const each_array_2 = $.ensure_array_like(GOALS_QUESTIONS);

																for (let index = 0, $$length = each_array_2.length; index < $$length; index++) {
																	let item = each_array_2[index];

																	if (Accordion.Item) {
																		$$renderer.push('<!--[-->');

																		Accordion.Item($$renderer, {
																			value: String(index),
																			children: ($$renderer) => {
																				if (Accordion.Trigger) {
																					$$renderer.push('<!--[-->');

																					Accordion.Trigger($$renderer, {
																						children: ($$renderer) => {
																							$$renderer.push(`<!---->${$.escape(item.q)}`);
																						},
																						$$slots: { default: true }
																					});

																					$$renderer.push('<!--]-->');
																				} else {
																					$$renderer.push('<!--[!-->');
																					$$renderer.push('<!--]-->');
																				}

																				$$renderer.push(` `);

																				if (Accordion.Content) {
																					$$renderer.push('<!--[-->');

																					Accordion.Content($$renderer, {
																						children: ($$renderer) => {
																							$$renderer.push(`<!---->${$.escape(item.a)}`);
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
								class: 'w-full',
								children: ($$renderer) => {
									$$renderer.push(`<!---->Contact Support`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							Button($$renderer, {
								variant: 'link',
								class: 'w-full',
								children: ($$renderer) => {
									$$renderer.push(`<!---->Learn More`);
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