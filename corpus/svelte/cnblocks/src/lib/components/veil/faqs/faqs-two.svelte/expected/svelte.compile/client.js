import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "$lib/components/ui/accordion";

var root = $.from_html(`<p class="pb-2 text-sm text-muted-foreground"> </p>`);
var root_1 = $.from_html(`<!> <!>`, 1);
var root_2 = $.from_html(`<section class="@container bg-background py-24"><div class="mx-auto max-w-3xl px-6"><div class="flex flex-col gap-8 @xl:flex-row @xl:items-start @xl:gap-12"><div class="shrink-0 @xl:sticky @xl:top-24 @xl:w-64"><h2 class="font-serif text-3xl font-medium">FAQs</h2> <p class="mt-3 text-sm text-muted-foreground">Your questions answered</p> <p class="mt-6 hidden text-sm text-muted-foreground @xl:block">Need more help? <a href="/" class="font-medium text-primary hover:underline">Contact us</a></p></div> <div class="flex-1"><!> <p class="mt-6 text-sm text-muted-foreground @xl:hidden">Need more help? <a href="/" class="font-medium text-primary hover:underline">Contact us</a></p></div></div></div></section>`);

export default function Faqs_two($$anchor) {
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
	var div_1 = $.child(div);
	var div_2 = $.sibling($.child(div_1), 2);
	var node = $.child(div_2);

	Accordion(node, {
		type: 'single',
		children: ($$anchor, $$slotProps) => {
			var fragment = $.comment();
			var node_1 = $.first_child(fragment);

			$.each(node_1, 17, () => faqItems, (item) => item.id, ($$anchor, item) => {
				AccordionItem($$anchor, {
					get value() {
						return $.get(item).id;
					},
					class: 'border-dashed',
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = root_1();
						var node_2 = $.first_child(fragment_2);

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

						$.append($$anchor, fragment_2);
					},
					$$slots: { default: true }
				});
			});

			$.append($$anchor, fragment);
		},
		$$slots: { default: true }
	});

	$.next(2);
	$.reset(div_2);
	$.reset(div_1);
	$.reset(div);
	$.reset(section);
	$.append($$anchor, section);
}