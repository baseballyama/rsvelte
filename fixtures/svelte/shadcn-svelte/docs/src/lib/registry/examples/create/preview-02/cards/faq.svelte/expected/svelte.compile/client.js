import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as Accordion from "$lib/registry/ui/accordion/index.js";
import * as Card from "$lib/registry/ui/card/index.js";
import * as Tabs from "$lib/registry/ui/tabs/index.js";
import { Button } from "$lib/registry/ui/button/index.js";

var root = $.from_html(`<!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);
var root_2 = $.from_html(`<!> <!> <!> <!>`, 1);

export default function Faq($$anchor) {
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

	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => Card.Root, ($$anchor, Card_Root) => {
		Card_Root($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root_1();
				var node_1 = $.first_child(fragment_1);

				$.component(node_1, () => Card.Content, ($$anchor, Card_Content) => {
					Card_Content($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_2 = $.comment();
							var node_2 = $.first_child(fragment_2);

							$.component(node_2, () => Tabs.Root, ($$anchor, Tabs_Root) => {
								Tabs_Root($$anchor, {
									value: 'general',
									children: ($$anchor, $$slotProps) => {
										var fragment_3 = root_2();
										var node_3 = $.first_child(fragment_3);

										$.component(node_3, () => Tabs.List, ($$anchor, Tabs_List) => {
											Tabs_List($$anchor, {
												class: 'w-full',
												children: ($$anchor, $$slotProps) => {
													var fragment_4 = root();
													var node_4 = $.first_child(fragment_4);

													$.component(node_4, () => Tabs.Trigger, ($$anchor, Tabs_Trigger) => {
														Tabs_Trigger($$anchor, {
															value: 'general',
															class: 'flex-1',
															children: ($$anchor, $$slotProps) => {
																$.next();

																var text = $.text('General');

																$.append($$anchor, text);
															},
															$$slots: { default: true }
														});
													});

													var node_5 = $.sibling(node_4, 2);

													$.component(node_5, () => Tabs.Trigger, ($$anchor, Tabs_Trigger_1) => {
														Tabs_Trigger_1($$anchor, {
															value: 'billing',
															class: 'flex-1',
															children: ($$anchor, $$slotProps) => {
																$.next();

																var text_1 = $.text('Billing');

																$.append($$anchor, text_1);
															},
															$$slots: { default: true }
														});
													});

													var node_6 = $.sibling(node_5, 2);

													$.component(node_6, () => Tabs.Trigger, ($$anchor, Tabs_Trigger_2) => {
														Tabs_Trigger_2($$anchor, {
															value: 'goals',
															class: 'flex-1',
															children: ($$anchor, $$slotProps) => {
																$.next();

																var text_2 = $.text('Goals');

																$.append($$anchor, text_2);
															},
															$$slots: { default: true }
														});
													});

													$.append($$anchor, fragment_4);
												},
												$$slots: { default: true }
											});
										});

										var node_7 = $.sibling(node_3, 2);

										$.component(node_7, () => Tabs.Content, ($$anchor, Tabs_Content) => {
											Tabs_Content($$anchor, {
												value: 'general',
												children: ($$anchor, $$slotProps) => {
													var fragment_5 = $.comment();
													var node_8 = $.first_child(fragment_5);

													$.component(node_8, () => Accordion.Root, ($$anchor, Accordion_Root) => {
														Accordion_Root($$anchor, {
															type: 'single',
															value: '0',
															class: 'w-full',
															children: ($$anchor, $$slotProps) => {
																var fragment_6 = $.comment();
																var node_9 = $.first_child(fragment_6);

																$.each(node_9, 17, () => GENERAL_QUESTIONS, $.index, ($$anchor, item, index) => {
																	var fragment_7 = $.comment();
																	var node_10 = $.first_child(fragment_7);

																	{
																		let $0 = $.derived(() => String(index));

																		$.component(node_10, () => Accordion.Item, ($$anchor, Accordion_Item) => {
																			Accordion_Item($$anchor, {
																				get value() {
																					return $.get($0);
																				},

																				children: ($$anchor, $$slotProps) => {
																					var fragment_8 = root_1();
																					var node_11 = $.first_child(fragment_8);

																					$.component(node_11, () => Accordion.Trigger, ($$anchor, Accordion_Trigger) => {
																						Accordion_Trigger($$anchor, {
																							children: ($$anchor, $$slotProps) => {
																								$.next();

																								var text_3 = $.text();

																								$.template_effect(() => $.set_text(text_3, $.get(item).q));
																								$.append($$anchor, text_3);
																							},
																							$$slots: { default: true }
																						});
																					});

																					var node_12 = $.sibling(node_11, 2);

																					$.component(node_12, () => Accordion.Content, ($$anchor, Accordion_Content) => {
																						Accordion_Content($$anchor, {
																							children: ($$anchor, $$slotProps) => {
																								$.next();

																								var text_4 = $.text();

																								$.template_effect(() => $.set_text(text_4, $.get(item).a));
																								$.append($$anchor, text_4);
																							},
																							$$slots: { default: true }
																						});
																					});

																					$.append($$anchor, fragment_8);
																				},
																				$$slots: { default: true }
																			});
																		});
																	}

																	$.append($$anchor, fragment_7);
																});

																$.append($$anchor, fragment_6);
															},
															$$slots: { default: true }
														});
													});

													$.append($$anchor, fragment_5);
												},
												$$slots: { default: true }
											});
										});

										var node_13 = $.sibling(node_7, 2);

										$.component(node_13, () => Tabs.Content, ($$anchor, Tabs_Content_1) => {
											Tabs_Content_1($$anchor, {
												value: 'billing',
												children: ($$anchor, $$slotProps) => {
													var fragment_11 = $.comment();
													var node_14 = $.first_child(fragment_11);

													$.component(node_14, () => Accordion.Root, ($$anchor, Accordion_Root_1) => {
														Accordion_Root_1($$anchor, {
															type: 'single',
															value: '0',
															class: 'w-full',
															children: ($$anchor, $$slotProps) => {
																var fragment_12 = $.comment();
																var node_15 = $.first_child(fragment_12);

																$.each(node_15, 17, () => BILLING_QUESTIONS, $.index, ($$anchor, item, index) => {
																	var fragment_13 = $.comment();
																	var node_16 = $.first_child(fragment_13);

																	{
																		let $0 = $.derived(() => String(index));

																		$.component(node_16, () => Accordion.Item, ($$anchor, Accordion_Item_1) => {
																			Accordion_Item_1($$anchor, {
																				get value() {
																					return $.get($0);
																				},

																				children: ($$anchor, $$slotProps) => {
																					var fragment_14 = root_1();
																					var node_17 = $.first_child(fragment_14);

																					$.component(node_17, () => Accordion.Trigger, ($$anchor, Accordion_Trigger_1) => {
																						Accordion_Trigger_1($$anchor, {
																							children: ($$anchor, $$slotProps) => {
																								$.next();

																								var text_5 = $.text();

																								$.template_effect(() => $.set_text(text_5, $.get(item).q));
																								$.append($$anchor, text_5);
																							},
																							$$slots: { default: true }
																						});
																					});

																					var node_18 = $.sibling(node_17, 2);

																					$.component(node_18, () => Accordion.Content, ($$anchor, Accordion_Content_1) => {
																						Accordion_Content_1($$anchor, {
																							children: ($$anchor, $$slotProps) => {
																								$.next();

																								var text_6 = $.text();

																								$.template_effect(() => $.set_text(text_6, $.get(item).a));
																								$.append($$anchor, text_6);
																							},
																							$$slots: { default: true }
																						});
																					});

																					$.append($$anchor, fragment_14);
																				},
																				$$slots: { default: true }
																			});
																		});
																	}

																	$.append($$anchor, fragment_13);
																});

																$.append($$anchor, fragment_12);
															},
															$$slots: { default: true }
														});
													});

													$.append($$anchor, fragment_11);
												},
												$$slots: { default: true }
											});
										});

										var node_19 = $.sibling(node_13, 2);

										$.component(node_19, () => Tabs.Content, ($$anchor, Tabs_Content_2) => {
											Tabs_Content_2($$anchor, {
												value: 'goals',
												children: ($$anchor, $$slotProps) => {
													var fragment_17 = $.comment();
													var node_20 = $.first_child(fragment_17);

													$.component(node_20, () => Accordion.Root, ($$anchor, Accordion_Root_2) => {
														Accordion_Root_2($$anchor, {
															type: 'single',
															value: '0',
															class: 'w-full',
															children: ($$anchor, $$slotProps) => {
																var fragment_18 = $.comment();
																var node_21 = $.first_child(fragment_18);

																$.each(node_21, 17, () => GOALS_QUESTIONS, $.index, ($$anchor, item, index) => {
																	var fragment_19 = $.comment();
																	var node_22 = $.first_child(fragment_19);

																	{
																		let $0 = $.derived(() => String(index));

																		$.component(node_22, () => Accordion.Item, ($$anchor, Accordion_Item_2) => {
																			Accordion_Item_2($$anchor, {
																				get value() {
																					return $.get($0);
																				},

																				children: ($$anchor, $$slotProps) => {
																					var fragment_20 = root_1();
																					var node_23 = $.first_child(fragment_20);

																					$.component(node_23, () => Accordion.Trigger, ($$anchor, Accordion_Trigger_2) => {
																						Accordion_Trigger_2($$anchor, {
																							children: ($$anchor, $$slotProps) => {
																								$.next();

																								var text_7 = $.text();

																								$.template_effect(() => $.set_text(text_7, $.get(item).q));
																								$.append($$anchor, text_7);
																							},
																							$$slots: { default: true }
																						});
																					});

																					var node_24 = $.sibling(node_23, 2);

																					$.component(node_24, () => Accordion.Content, ($$anchor, Accordion_Content_2) => {
																						Accordion_Content_2($$anchor, {
																							children: ($$anchor, $$slotProps) => {
																								$.next();

																								var text_8 = $.text();

																								$.template_effect(() => $.set_text(text_8, $.get(item).a));
																								$.append($$anchor, text_8);
																							},
																							$$slots: { default: true }
																						});
																					});

																					$.append($$anchor, fragment_20);
																				},
																				$$slots: { default: true }
																			});
																		});
																	}

																	$.append($$anchor, fragment_19);
																});

																$.append($$anchor, fragment_18);
															},
															$$slots: { default: true }
														});
													});

													$.append($$anchor, fragment_17);
												},
												$$slots: { default: true }
											});
										});

										$.append($$anchor, fragment_3);
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_2);
						},
						$$slots: { default: true }
					});
				});

				var node_25 = $.sibling(node_1, 2);

				$.component(node_25, () => Card.Footer, ($$anchor, Card_Footer) => {
					Card_Footer($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_23 = root_1();
							var node_26 = $.first_child(fragment_23);

							Button(node_26, {
								variant: 'outline',
								class: 'w-full',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_9 = $.text('Contact Support');

									$.append($$anchor, text_9);
								},
								$$slots: { default: true }
							});

							var node_27 = $.sibling(node_26, 2);

							Button(node_27, {
								variant: 'link',
								class: 'w-full',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_10 = $.text('Learn More');

									$.append($$anchor, text_10);
								},
								$$slots: { default: true }
							});

							$.append($$anchor, fragment_23);
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		});
	});

	$.append($$anchor, fragment);
}