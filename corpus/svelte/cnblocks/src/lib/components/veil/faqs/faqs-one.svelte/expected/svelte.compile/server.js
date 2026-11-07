import * as $ from 'svelte/internal/server';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "$lib/components/ui/accordion";
import { Card } from "$lib/components/ui/veil/card";

export default function Faqs_one($$renderer) {
	const faqItems = [
		{
			id: "item-1",
			question: "How does the free trial work?",
			answer: "Start with a 14-day free trial with full access to all features. No credit card required. You can upgrade to a paid plan at any time during or after the trial."
		},

		{
			id: "item-2",
			question: "Can I change my plan later?",
			answer: "Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately, and we'll prorate the difference."
		},

		{
			id: "item-3",
			question: "What payment methods do you accept?",
			answer: "We accept all major credit cards, PayPal, and bank transfers for annual plans. Enterprise customers can also pay via invoice."
		},

		{
			id: "item-4",
			question: "Is there a setup fee?",
			answer: "No, there are no setup fees or hidden costs. You only pay for your subscription plan."
		},

		{
			id: "item-5",
			question: "Do you offer refunds?",
			answer: "We offer a 30-day money-back guarantee. If you're not satisfied, contact us within 30 days for a full refund."
		}
	];

	$$renderer.push(`<section class="@container bg-background py-24"><div class="mx-auto max-w-2xl px-6"><div class="text-center"><h2 class="font-serif text-4xl font-medium text-balance">Frequently Asked Questions</h2> <p class="mx-auto mt-4 max-w-md text-balance text-muted-foreground">Find answers to common questions about our platform.</p></div> `);

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

	$$renderer.push(`<!----> <p class="mt-6 text-center text-sm text-muted-foreground">Still have questions? <a href="/" class="font-medium text-primary hover:underline">Contact support</a></p></div></section>`);
}