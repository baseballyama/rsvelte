import * as $ from 'svelte/internal/server';
import * as Accordion from "$lib/registry/ui/accordion/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

export default function Accordion_with_borders($$renderer) {
	const items = [
		{
			value: "billing",
			trigger: "How does billing work?",
			content: "We offer monthly and annual subscription plans. Billing is charged at the beginning of each cycle, and you can cancel anytime. All plans include automatic backups, 24/7 support, and unlimited team members. There are no hidden fees or setup costs."
		},

		{
			value: "security",
			trigger: "Is my data secure?",
			content: "Yes. We use end-to-end encryption, SOC 2 Type II compliance, and regular third-party security audits. All data is encrypted at rest and in transit using industry-standard protocols. We also offer optional two-factor authentication and single sign-on for enterprise customers."
		},

		{
			value: "integration",
			trigger: "What integrations do you support?",
			content: [
				"We integrate with 500+ popular tools including Slack, Zapier, Salesforce, HubSpot, and more. You can also build custom integrations using our REST API and webhooks. ",
				"Our API documentation includes code examples in 10+ programming languages."
			]
		}
	];

	Example($$renderer, {
		title: 'With Borders',
		children: ($$renderer) => {
			if (Accordion.Root) {
				$$renderer.push('<!--[-->');

				Accordion.Root($$renderer, {
					type: 'single',
					class: 'mx-auto flex max-w-lg flex-col style-vega:gap-2 style-nova:gap-2 style-lyra:gap-2',
					children: ($$renderer) => {
						$$renderer.push(`<!--[-->`);

						const each_array = $.ensure_array_like(items);

						for (let $$index_1 = 0, $$length = each_array.length; $$index_1 < $$length; $$index_1++) {
							let item = each_array[$$index_1];

							if (Accordion.Item) {
								$$renderer.push('<!--[-->');

								Accordion.Item($$renderer, {
									value: item.value,
									class: 'style-vega:rounded-lg style-vega:border style-nova:rounded-lg style-nova:border style-lyra:border',
									children: ($$renderer) => {
										if (Accordion.Trigger) {
											$$renderer.push('<!--[-->');

											Accordion.Trigger($$renderer, {
												class: 'font-medium style-vega:px-4 style-vega:text-sm style-nova:px-2.5 style-nova:text-sm style-lyra:px-2 style-lyra:text-xs style-maia:text-sm style-mira:text-xs',
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
												class: 'text-muted-foreground style-vega:px-4 style-nova:px-2.5 style-nova:text-sm style-lyra:px-2 style-lyra:text-xs style-maia:px-0 style-mira:px-0',
												children: ($$renderer) => {
													if (Array.isArray(item.content)) {
														$$renderer.push(`<!--[0--><!--[-->`);

														const each_array_1 = $.ensure_array_like(item.content);

														for (let i = 0, $$length = each_array_1.length; i < $$length; i++) {
															let paragraph = each_array_1[i];

															$$renderer.push(`<p>${$.escape(paragraph)}</p>`);
														}

														$$renderer.push(`<!--]-->`);
													} else {
														$$renderer.push(`<!--[-1-->${$.escape(item.content)}`);
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
}