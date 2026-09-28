import * as $ from 'svelte/internal/server';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "$lib/components/ui/accordion";

export default function Faqs_two($$renderer) {
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

	$$renderer.push(`<section class="@container bg-background py-24"><div class="mx-auto max-w-3xl px-6"><div class="flex flex-col gap-8 @xl:flex-row @xl:items-start @xl:gap-12"><div class="shrink-0 @xl:sticky @xl:top-24 @xl:w-64"><h2 class="font-serif text-3xl font-medium">FAQs</h2> <p class="mt-3 text-sm text-muted-foreground">Your questions answered</p> <p class="mt-6 hidden text-sm text-muted-foreground @xl:block">Need more help? <a href="/" class="font-medium text-primary hover:underline">Contact us</a></p></div> <div class="flex-1">`);

	Accordion($$renderer, {
		type: 'single',
		children: ($$renderer) => {
			$$renderer.push(`<!--[-->`);

			const each_array = $.ensure_array_like(faqItems);

			for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
				let item = each_array[$$index];

				AccordionItem($$renderer, {
					value: item.id,
					class: 'border-dashed',
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

	$$renderer.push(`<!----> <p class="mt-6 text-sm text-muted-foreground @xl:hidden">Need more help? <a href="/" class="font-medium text-primary hover:underline">Contact us</a></p></div></div></div></section>`);
}