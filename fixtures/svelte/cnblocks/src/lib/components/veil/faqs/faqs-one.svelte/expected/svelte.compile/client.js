import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "$lib/components/ui/accordion";
import { Card } from "$lib/components/ui/veil/card";

var root = $.from_html(`<p class="pb-2 text-sm text-muted-foreground"> </p>`);
var root_1 = $.from_html(`<!> <!>`, 1);
var root_2 = $.from_html(`<section class="@container bg-background py-24"><div class="mx-auto max-w-2xl px-6"><div class="text-center"><h2 class="font-serif text-4xl font-medium text-balance">Frequently Asked Questions</h2> <p class="mx-auto mt-4 max-w-md text-balance text-muted-foreground">Find answers to common questions about our platform.</p></div> <!> <p class="mt-6 text-center text-sm text-muted-foreground">Still have questions? <a href="/" class="font-medium text-primary hover:underline">Contact support</a></p></div></section>`);

export default function Faqs_one($$anchor) {
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

	var section = root_2();
	var div = $.child(section);
	var node = $.sibling($.child(div), 2);

	Card(node, {
		variant: 'outline',
		class: 'mt-12 p-2',
		children: ($$anchor, $$slotProps) => {
			Accordion($$anchor, {
				type: 'single',
				children: ($$anchor, $$slotProps) => {
					var fragment_1 = $.comment();
					var node_1 = $.first_child(fragment_1);

					$.each(node_1, 17, () => faqItems, (item) => item.id, ($$anchor, item) => {
						AccordionItem($$anchor, {
							get value() {
								return $.get(item).id;
							},
							class: 'border-b-0 px-4',
							children: ($$anchor, $$slotProps) => {
								var fragment_3 = root_1();
								var node_2 = $.first_child(fragment_3);

								AccordionTrigger(node_2, {
									class: 'cursor-pointer py-4 text-sm font-medium hover:no-underline',
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text = $.text();

										$.template_effect(() => $.set_text(text, $.get(item).question));
										$.append($$anchor, text);
									},
									$$slots: { default: true }
								});

								var node_3 = $.sibling(node_2, 2);

								AccordionContent(node_3, {
									children: ($$anchor, $$slotProps) => {
										var p = root();
										var text_1 = $.only_child(p, true);

										$.template_effect(() => $.set_text(text_1, $.get(item).answer));
										$.append($$anchor, p);
									},
									$$slots: { default: true }
								});

								$.append($$anchor, fragment_3);
							},
							$$slots: { default: true }
						});
					});

					$.append($$anchor, fragment_1);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$.next(2);
	$.reset(div);
	$.reset(section);
	$.append($$anchor, section);
}