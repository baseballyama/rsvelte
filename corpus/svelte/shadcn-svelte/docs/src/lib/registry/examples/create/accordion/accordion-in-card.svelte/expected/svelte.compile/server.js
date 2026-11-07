import * as $ from 'svelte/internal/server';
import ArrowUpRightIcon from "@lucide/svelte/icons/arrow-up-right";
import * as Accordion from "$lib/registry/ui/accordion/index.js";
import * as Card from "$lib/registry/ui/card/index.js";
import { Button } from "$lib/registry/ui/button/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

export default function Accordion_in_card($$renderer) {
	const items = [
		{
			value: "plans",
			trigger: "What subscription plans do you offer?",
			content: [
				"We offer three subscription tiers: Starter ($9/month), Professional ($29/month), and Enterprise ($99/month). Each plan includes increasing storage limits, API access, priority support, and team collaboration features."
			],
			hasButton: true
		},

		{
			value: "billing",
			trigger: "How does billing work?",
			content: [
				"Billing occurs automatically at the start of each billing cycle. We accept all major credit cards, PayPal, and ACH transfers for enterprise customers.",
				"You'll receive an invoice via email after each payment. You can update your payment method or billing information anytime in your account settings. Failed payments will trigger automated retry attempts and email notifications."
			]
		},

		{
			value: "upgrade",
			trigger: "Can I upgrade or downgrade my plan?",
			content: [
				"Yes, you can change your plan at any time. When upgrading, you'll be charged a prorated amount for the remainder of your billing cycle and immediately gain access to new features.",
				"When downgrading, the change takes effect at the end of your current billing period, and you'll retain access to premium features until then. No refunds are provided for downgrades."
			]
		},

		{
			value: "cancel",
			trigger: "How do I cancel my subscription?",
			content: [
				"You can cancel your subscription anytime from your account settings. There are no cancellation fees or penalties. Your access will continue until the end of your current billing period.",
				"After cancellation, your data is retained for 30 days in case you want to reactivate. You can export all your data before or after canceling. We'd love to hear your feedback about why you're leaving."
			]
		},

		{
			value: "refund",
			trigger: "What is your refund policy?",
			content: [
				"We offer a 30-day money-back guarantee for new subscriptions. If you're not satisfied within the first 30 days, contact our support team for a full refund.",
				"After 30 days, we don't provide refunds for partial billing periods, but you can cancel anytime to avoid future charges. Enterprise customers have custom refund terms outlined in their contracts."
			]
		}
	];

	Example($$renderer, {
		title: 'In Card',
		children: ($$renderer) => {
			if (Card.Root) {
				$$renderer.push('<!--[-->');

				Card.Root($$renderer, {
					class: 'mx-auto w-full max-w-lg gap-4',
					children: ($$renderer) => {
						if (Card.Header) {
							$$renderer.push('<!--[-->');

							Card.Header($$renderer, {
								children: ($$renderer) => {
									if (Card.Title) {
										$$renderer.push('<!--[-->');

										Card.Title($$renderer, {
											children: ($$renderer) => {
												$$renderer.push(`<!---->Subscription &amp; Billing`);
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
												$$renderer.push(`<!---->Common questions about your account, plans, and payments`);
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
									if (Accordion.Root) {
										$$renderer.push('<!--[-->');

										Accordion.Root($$renderer, {
											type: 'multiple',
											value: ["plans"],
											class: 'style-maia:rounded-md style-mira:rounded-md',
											children: ($$renderer) => {
												$$renderer.push(`<!--[-->`);

												const each_array = $.ensure_array_like(items);

												for (let $$index_1 = 0, $$length = each_array.length; $$index_1 < $$length; $$index_1++) {
													let item = each_array[$$index_1];

													if (Accordion.Item) {
														$$renderer.push('<!--[-->');

														Accordion.Item($$renderer, {
															value: item.value,
															children: ($$renderer) => {
																if (Accordion.Trigger) {
																	$$renderer.push('<!--[-->');

																	Accordion.Trigger($$renderer, {
																		children: ($$renderer) => {
																			$$renderer.push(`<!---->${$.escape(item.trigger)}`);
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
																			$$renderer.push(`<!--[-->`);

																			const each_array_1 = $.ensure_array_like(item.content);

																			for (let i = 0, $$length = each_array_1.length; i < $$length; i++) {
																				let paragraph = each_array_1[i];

																				$$renderer.push(`<p>${$.escape(paragraph)}</p>`);
																			}

																			$$renderer.push(`<!--]--> `);

																			if (item.hasButton) {
																				$$renderer.push(`<!--[0--><p><a href="#/">Annual billing is available</a> with a 20% discount. All plans include
									a 14-day free trial with no credit card required.</p> `);

																				Button($$renderer, {
																					size: 'sm',
																					children: ($$renderer) => {
																						$$renderer.push(`<!---->View plans `);
																						ArrowUpRightIcon($$renderer, {});
																						$$renderer.push(`<!---->`);
																					},
																					$$slots: { default: true }
																				});

																				$$renderer.push(`<!---->`);
																			} else {
																				$$renderer.push('<!--[-1-->');
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
}