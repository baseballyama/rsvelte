import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as Accordion from "$lib/registry/ui/accordion/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

var root = $.from_html(`<p> </p>`);
var root_1 = $.from_html(`<!> <!>`, 1);

export default function Accordion_with_borders($$anchor) {
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

	Example($$anchor, {
		title: 'With Borders',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = $.comment();
			var node = $.first_child(fragment_1);

			$.component(node, () => Accordion.Root, ($$anchor, Accordion_Root) => {
				Accordion_Root($$anchor, {
					type: 'single',
					class: 'mx-auto flex max-w-lg flex-col style-vega:gap-2 style-nova:gap-2 style-lyra:gap-2',
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = $.comment();
						var node_1 = $.first_child(fragment_2);

						$.each(node_1, 17, () => items, (item) => item.value, ($$anchor, item) => {
							var fragment_3 = $.comment();
							var node_2 = $.first_child(fragment_3);

							$.component(node_2, () => Accordion.Item, ($$anchor, Accordion_Item) => {
								Accordion_Item($$anchor, {
									get value() {
										return $.get(item).value;
									},
									class: 'style-vega:rounded-lg style-vega:border style-nova:rounded-lg style-nova:border style-lyra:border',
									children: ($$anchor, $$slotProps) => {
										var fragment_4 = root_1();
										var node_3 = $.first_child(fragment_4);

										$.component(node_3, () => Accordion.Trigger, ($$anchor, Accordion_Trigger) => {
											Accordion_Trigger($$anchor, {
												class: 'font-medium style-vega:px-4 style-vega:text-sm style-nova:px-2.5 style-nova:text-sm style-lyra:px-2 style-lyra:text-xs style-maia:text-sm style-mira:text-xs',
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text = $.text();

													$.template_effect(() => $.set_text(text, $.get(item).trigger));
													$.append($$anchor, text);
												},
												$$slots: { default: true }
											});
										});

										var node_4 = $.sibling(node_3, 2);

										$.component(node_4, () => Accordion.Content, ($$anchor, Accordion_Content) => {
											Accordion_Content($$anchor, {
												class: 'text-muted-foreground style-vega:px-4 style-nova:px-2.5 style-nova:text-sm style-lyra:px-2 style-lyra:text-xs style-maia:px-0 style-mira:px-0',
												children: ($$anchor, $$slotProps) => {
													var fragment_6 = $.comment();
													var node_5 = $.first_child(fragment_6);

													{
														var consequent = ($$anchor) => {
															var fragment_7 = $.comment();
															var node_6 = $.first_child(fragment_7);

															$.each(node_6, 17, () => $.get(item).content, $.index, ($$anchor, paragraph) => {
																var p = root();
																var text_1 = $.only_child(p, true);

																$.template_effect(() => $.set_text(text_1, $.get(paragraph)));
																$.append($$anchor, p);
															});

															$.append($$anchor, fragment_7);
														};

														var d = $.derived(() => Array.isArray($.get(item).content));

														var alternate = ($$anchor) => {
															var text_2 = $.text();

															$.template_effect(() => $.set_text(text_2, $.get(item).content));
															$.append($$anchor, text_2);
														};

														$.if(node_5, ($$render) => {
															if ($.get(d)) $$render(consequent); else $$render(alternate, -1);
														});
													}

													$.append($$anchor, fragment_6);
												},
												$$slots: { default: true }
											});
										});

										$.append($$anchor, fragment_4);
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_3);
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