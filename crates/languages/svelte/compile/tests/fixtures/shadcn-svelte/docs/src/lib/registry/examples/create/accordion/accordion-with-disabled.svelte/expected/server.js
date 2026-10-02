import * as $ from 'svelte/internal/server';
import * as Accordion from "$lib/registry/ui/accordion/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

export default function Accordion_with_disabled($$renderer) {
	const items = [
		{
			value: "item-1",
			trigger: "Can I access my account history?",
			content: "Yes, you can view your complete account history including all transactions, plan changes, and support tickets in the Account History section of your dashboard.",
			disabled: false
		},

		{
			value: "item-2",
			trigger: "Premium feature information",
			content: "This section contains information about premium features. Upgrade your plan to access this content.",
			disabled: true
		},

		{
			value: "item-3",
			trigger: "How do I update my email address?",
			content: "You can update your email address in your account settings. You'll receive a verification email at your new address to confirm the change.",
			disabled: false
		}
	];

	Example($$renderer, {
		title: 'With Disabled',
		children: ($$renderer) => {
			if (Accordion.Root) {
				$$renderer.push('<!--[-->');

				Accordion.Root($$renderer, {
					type: 'single',
					class: 'mx-auto max-w-lg overflow-hidden border style-vega:rounded-lg style-nova:rounded-lg style-lyra:rounded-none style-maia:rounded-lg style-mira:rounded-lg',
					children: ($$renderer) => {
						$$renderer.push(`<!--[-->`);

						const each_array = $.ensure_array_like(items);

						for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
							let item = each_array[$$index];

							if (Accordion.Item) {
								$$renderer.push('<!--[-->');

								Accordion.Item($$renderer, {
									value: item.value,
									disabled: item.disabled,
									class: 'p-1 data-[state=open]:bg-muted/50',
									children: ($$renderer) => {
										if (Accordion.Trigger) {
											$$renderer.push('<!--[-->');

											Accordion.Trigger($$renderer, {
												class: 'style-vega:px-4 style-nova:px-2.5 style-lyra:px-2',
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
												class: 'style-vega:px-4 style-nova:px-2.5 style-lyra:px-2',
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