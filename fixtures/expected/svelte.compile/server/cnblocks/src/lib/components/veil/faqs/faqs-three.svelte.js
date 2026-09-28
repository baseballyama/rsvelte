import * as $ from 'svelte/internal/server';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "$lib/components/ui/accordion";

export default function Faqs_three($$renderer) {
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

	$$renderer.push(`<section class="@container bg-background py-24"><div class="mx-auto max-w-2xl px-6"><h2 class="text-center font-serif text-4xl font-medium">Your Questions Answered</h2> `);

	Accordion($$renderer, {
		type: 'single',
		class: 'mt-12',
		children: ($$renderer) => {
			$$renderer.push(`<!--[-->`);

			const each_array = $.ensure_array_like(faqItems);

			for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
				let item = each_array[$$index];

				$$renderer.push(`<div class="group">`);

				AccordionItem($$renderer, {
					value: item.id,
					class: 'peer rounded-xl border-none px-5 py-1 transition-colors data-[state=open]:bg-muted/50',
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

				$$renderer.push(`<!----> <hr class="mx-5 group-last:hidden peer-data-[state=open]:opacity-0"/></div>`);
			}

			$$renderer.push(`<!--]-->`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> <p class="mt-8 text-center text-sm text-muted-foreground">Can't find what you're looking for? <a href="/" class="font-medium text-primary hover:underline">Contact support</a></p></div></section>`);
}