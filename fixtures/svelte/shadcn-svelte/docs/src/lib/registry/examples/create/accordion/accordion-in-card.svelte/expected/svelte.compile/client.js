import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import ArrowUpRightIcon from "@lucide/svelte/icons/arrow-up-right";
import * as Accordion from "$lib/registry/ui/accordion/index.js";
import * as Card from "$lib/registry/ui/card/index.js";
import { Button } from "$lib/registry/ui/button/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<p> </p>`);
var root_2 = $.from_html(`View plans <!>`, 1);

var root_3 = $.from_html(
	`<p><a href="#/">Annual billing is available</a> with a 20% discount. All plans include
									a 14-day free trial with no credit card required.</p> <!>`,
	1
);

export default function Accordion_in_card($$anchor) {
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

	Example($$anchor, {
		title: 'In Card',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = $.comment();
			var node = $.first_child(fragment_1);

			$.component(node, () => Card.Root, ($$anchor, Card_Root) => {
				Card_Root($$anchor, {
					class: 'mx-auto w-full max-w-lg gap-4',
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = root();
						var node_1 = $.first_child(fragment_2);

						$.component(node_1, () => Card.Header, ($$anchor, Card_Header) => {
							Card_Header($$anchor, {
								children: ($$anchor, $$slotProps) => {
									var fragment_3 = root();
									var node_2 = $.first_child(fragment_3);

									$.component(node_2, () => Card.Title, ($$anchor, Card_Title) => {
										Card_Title($$anchor, {
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text = $.text('Subscription & Billing');

												$.append($$anchor, text);
											},
											$$slots: { default: true }
										});
									});

									var node_3 = $.sibling(node_2, 2);

									$.component(node_3, () => Card.Description, ($$anchor, Card_Description) => {
										Card_Description($$anchor, {
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_1 = $.text('Common questions about your account, plans, and payments');

												$.append($$anchor, text_1);
											},
											$$slots: { default: true }
										});
									});

									$.append($$anchor, fragment_3);
								},
								$$slots: { default: true }
							});
						});

						var node_4 = $.sibling(node_1, 2);

						$.component(node_4, () => Card.Content, ($$anchor, Card_Content) => {
							Card_Content($$anchor, {
								children: ($$anchor, $$slotProps) => {
									var fragment_4 = $.comment();
									var node_5 = $.first_child(fragment_4);

									$.component(node_5, () => Accordion.Root, ($$anchor, Accordion_Root) => {
										Accordion_Root($$anchor, {
											type: 'multiple',
											value: ["plans"],
											class: 'style-maia:rounded-md style-mira:rounded-md',
											children: ($$anchor, $$slotProps) => {
												var fragment_5 = $.comment();
												var node_6 = $.first_child(fragment_5);

												$.each(node_6, 17, () => items, (item) => item.value, ($$anchor, item) => {
													var fragment_6 = $.comment();
													var node_7 = $.first_child(fragment_6);

													$.component(node_7, () => Accordion.Item, ($$anchor, Accordion_Item) => {
														Accordion_Item($$anchor, {
															get value() {
																return $.get(item).value;
															},

															children: ($$anchor, $$slotProps) => {
																var fragment_7 = root();
																var node_8 = $.first_child(fragment_7);

																$.component(node_8, () => Accordion.Trigger, ($$anchor, Accordion_Trigger) => {
																	Accordion_Trigger($$anchor, {
																		children: ($$anchor, $$slotProps) => {
																			$.next();

																			var text_2 = $.text();

																			$.template_effect(() => $.set_text(text_2, $.get(item).trigger));
																			$.append($$anchor, text_2);
																		},
																		$$slots: { default: true }
																	});
																});

																var node_9 = $.sibling(node_8, 2);

																$.component(node_9, () => Accordion.Content, ($$anchor, Accordion_Content) => {
																	Accordion_Content($$anchor, {
																		children: ($$anchor, $$slotProps) => {
																			var fragment_9 = root();
																			var node_10 = $.first_child(fragment_9);

																			$.each(node_10, 17, () => $.get(item).content, $.index, ($$anchor, paragraph) => {
																				var p = root_1();
																				var text_3 = $.only_child(p, true);

																				$.template_effect(() => $.set_text(text_3, $.get(paragraph)));
																				$.append($$anchor, p);
																			});

																			var node_11 = $.sibling(node_10, 2);

																			{
																				var consequent = ($$anchor) => {
																					var fragment_10 = root_3();
																					var node_12 = $.sibling($.first_child(fragment_10), 2);

																					Button(node_12, {
																						size: 'sm',
																						children: ($$anchor, $$slotProps) => {
																							$.next();

																							var fragment_11 = root_2();
																							var node_13 = $.sibling($.first_child(fragment_11));

																							ArrowUpRightIcon(node_13, {});
																							$.append($$anchor, fragment_11);
																						},
																						$$slots: { default: true }
																					});

																					$.append($$anchor, fragment_10);
																				};

																				$.if(node_11, ($$render) => {
																					if ($.get(item).hasButton) $$render(consequent);
																				});
																			}

																			$.append($$anchor, fragment_9);
																		},
																		$$slots: { default: true }
																	});
																});

																$.append($$anchor, fragment_7);
															},
															$$slots: { default: true }
														});
													});

													$.append($$anchor, fragment_6);
												});

												$.append($$anchor, fragment_5);
											},
											$$slots: { default: true }
										});
									});

									$.append($$anchor, fragment_4);
								},
								$$slots: { default: true }
							});
						});

						$.append($$anchor, fragment_2);
					},
					$$slots: { default: true }
				});
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}