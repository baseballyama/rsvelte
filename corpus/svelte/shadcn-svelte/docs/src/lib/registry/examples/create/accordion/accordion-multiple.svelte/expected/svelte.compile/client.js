import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as Accordion from "$lib/registry/ui/accordion/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

var root = $.from_html(`<!> <!>`, 1);

export default function Accordion_multiple($$anchor) {
	const items = [
		{
			value: "item-1",
			trigger: "What are the key considerations when implementing a comprehensive enterprise-level authentication system?",
			content: "Implementing a robust enterprise authentication system requires careful consideration of multiple factors. This includes secure password hashing and storage, multi-factor authentication (MFA) implementation, session management, OAuth2 and SSO integration, regular security audits, rate limiting to prevent brute force attacks, and maintaining detailed audit logs. Additionally, you'll need to consider scalability, performance impact, and compliance with relevant data protection regulations such as GDPR or HIPAA."
		},

		{
			value: "item-2",
			trigger: "How does modern distributed system architecture handle eventual consistency and data synchronization across multiple regions?",
			content: "Modern distributed systems employ various strategies to maintain data consistency across regions. This often involves using techniques like CRDT (Conflict-Free Replicated Data Types), vector clocks, and gossip protocols. Systems might implement event sourcing patterns, utilize message queues for asynchronous updates, and employ sophisticated conflict resolution strategies. Popular solutions like Amazon's DynamoDB and Google's Spanner demonstrate different approaches to solving these challenges, balancing between consistency, availability, and partition tolerance as described in the CAP theorem."
		}
	];

	Example($$anchor, {
		title: 'Multiple',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = $.comment();
			var node = $.first_child(fragment_1);

			$.component(node, () => Accordion.Root, ($$anchor, Accordion_Root) => {
				Accordion_Root($$anchor, {
					type: 'multiple',
					class: 'mx-auto max-w-lg',
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

									children: ($$anchor, $$slotProps) => {
										var fragment_4 = root();
										var node_3 = $.first_child(fragment_4);

										$.component(node_3, () => Accordion.Trigger, ($$anchor, Accordion_Trigger) => {
											Accordion_Trigger($$anchor, {
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
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_1 = $.text();

													$.template_effect(() => $.set_text(text_1, $.get(item).content));
													$.append($$anchor, text_1);
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