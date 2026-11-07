import * as $ from 'svelte/internal/server';
import * as Accordion from "$lib/registry/ui/accordion/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

export default function Accordion_multiple($$renderer) {
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

	Example($$renderer, {
		title: 'Multiple',
		children: ($$renderer) => {
			if (Accordion.Root) {
				$$renderer.push('<!--[-->');

				Accordion.Root($$renderer, {
					type: 'multiple',
					class: 'mx-auto max-w-lg',
					children: ($$renderer) => {
						$$renderer.push(`<!--[-->`);

						const each_array = $.ensure_array_like(items);

						for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
							let item = each_array[$$index];

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
													$$renderer.push(`<!---->${$.escape(item.content)}`);
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