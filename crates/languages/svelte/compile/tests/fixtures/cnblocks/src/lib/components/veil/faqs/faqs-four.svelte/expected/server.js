import * as $ from 'svelte/internal/server';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "$lib/components/ui/accordion";
import { Card } from "$lib/components/ui/veil/card";

export default function Faqs_four($$renderer) {
	const faqItems = [
		{
			id: "item-1",
			question: "How does the free trial work?",
			answer: "Start with a 14-day free trial with full access to all features. No credit card required."
		},

		{
			id: "item-2",
			question: "Can I change my plan later?",
			answer: "Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately."
		},

		{
			id: "item-3",
			question: "What payment methods do you accept?",
			answer: "We accept all major credit cards, PayPal, and bank transfers for annual plans."
		},

		{
			id: "item-4",
			question: "Is there a setup fee?",
			answer: "No, there are no setup fees or hidden costs. You only pay for your subscription plan."
		},

		{
			id: "item-5",
			question: "Do you offer refunds?",
			answer: "We offer a 30-day money-back guarantee. Contact us within 30 days for a full refund."
		},

		{
			id: "item-6",
			question: "How do I cancel my subscription?",
			answer: "You can cancel anytime from your account settings. Your access continues until the billing period ends."
		}
	];

	$$renderer.push(`<section class="@container bg-background py-24"><div class="mx-auto max-w-3xl px-6"><div class="text-center"><h2 class="font-serif text-4xl font-medium text-balance">Common Questions</h2> <p class="mx-auto mt-4 max-w-md text-balance text-muted-foreground">Everything you need to know about our platform.</p></div> `);

	Card($$renderer, {
		variant: 'outline',
		class: 'mt-12 p-2',
		children: ($$renderer) => {
			Accordion($$renderer, {
				type: 'single',
				children: ($$renderer) => {
					$$renderer.push(`<!--[-->`);

					const each_array = $.ensure_array_like(faqItems);

					for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
						let item = each_array[$$index];

						AccordionItem($$renderer, {
							value: item.id,
							class: 'border-b-0 px-4',
							children: ($$renderer) => {
								AccordionTrigger($$renderer, {
									class: 'cursor-pointer py-4 text-sm font-medium hover:no-underline',
									children: ($$renderer) => {
										$$renderer.push(`<!---->${$.escape(item.question)}`);
									},
									$$slots: { default: true }
								});

								$$renderer.push(`<!----> `);

								AccordionContent($$renderer, {
									children: ($$renderer) => {
										$$renderer.push(`<p class="pb-2 text-sm text-muted-foreground">${$.escape(item.answer)}</p>`);
									},
									$$slots: { default: true }
								});

								$$renderer.push(`<!---->`);
							},
							$$slots: { default: true }
						});
					}

					$$renderer.push(`<!--]-->`);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> <p class="mt-8 text-center text-sm text-muted-foreground">Have another question? <a href="/" class="font-medium text-primary hover:underline">Get in touch</a></p></div></section>`);
}