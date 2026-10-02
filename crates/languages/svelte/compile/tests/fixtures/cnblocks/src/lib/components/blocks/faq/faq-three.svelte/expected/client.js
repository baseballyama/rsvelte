import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "$lib/components/ui/accordion";
import Clock from "@lucide/svelte/icons/clock";
import CreditCard from "@lucide/svelte/icons/credit-card";
import Truck from "@lucide/svelte/icons/truck";
import Globe from "@lucide/svelte/icons/globe";
import Package from "@lucide/svelte/icons/package";

var root = $.from_html(`<div class="flex items-center gap-3"><div class="flex size-6"><!></div> <span class="text-base"> </span></div>`);
var root_1 = $.from_html(`<div class="px-9"><p class="text-base"> </p></div>`);
var root_2 = $.from_html(`<!> <!>`, 1);
var root_3 = $.from_html(`<section class="bg-muted py-20 dark:bg-background"><div class="mx-auto max-w-5xl px-4 md:px-6"><div class="flex flex-col gap-10 md:flex-row md:gap-16"><div class="md:w-1/3"><div class="sticky top-20"><h2 class="mt-4 text-3xl font-bold">Frequently Asked Questions</h2> <p class="mt-4 text-muted-foreground"> <a href="/" class="font-medium text-primary hover:underline">customer support team</a></p></div></div> <div class="md:w-2/3"><!></div></div></div></section>`);

export default function Faq_three($$anchor) {
	const faqItems = [
		{
			id: "item-1",
			icon: Clock,
			question: "What are your business hours?",
			answer: "Our customer service team is available Monday through Friday from 9:00 AM to 8:00 PM EST, and weekends from 10:00 AM to 6:00 PM EST. During holidays, hours may vary and will be posted on our website."
		},

		{
			id: "item-2",
			icon: CreditCard,
			question: "How do subscription payments work?",
			answer: "Subscription payments are automatically charged to your default payment method on the same day each month or year, depending on your billing cycle. You can update your payment information and view billing history in your account dashboard."
		},

		{
			id: "item-3",
			icon: Truck,
			question: "Can I expedite my shipping?",
			answer: "Yes, we offer several expedited shipping options at checkout. Next-day and 2-day shipping are available for most U.S. addresses if orders are placed before 2:00 PM EST. International expedited shipping options vary by destination."
		},

		{
			id: "item-4",
			icon: Globe,
			question: "Do you offer localized support?",
			answer: "We offer multilingual support in English, Spanish, French, German, and Japanese. Our support team can assist customers in these languages via email, chat, and phone during standard business hours for each respective region."
		},

		{
			id: "item-5",
			icon: Package,
			question: "How do I track my order?",
			answer: "Once your order ships, you'll receive a confirmation email with a tracking number. You can use this number on our website or the carrier's website to track your package. You can also view order status and tracking information in your account dashboard under \"Order History\"."
		}
	];

	var section = root_3();
	var div = $.child(section);
	var div_1 = $.child(div);
	var div_2 = $.child(div_1);
	var div_3 = $.child(div_2);
	var p = $.sibling($.child(div_3), 2);
	var text = $.child(p);

	text.nodeValue = 'Can\'t find what you\'re looking for? Contact our  ';
	$.next();
	$.reset(p);
	$.reset(div_3);
	$.reset(div_2);

	var div_4 = $.sibling(div_2, 2);
	var node = $.child(div_4);

	Accordion(node, {
		type: 'single',
		class: 'w-full space-y-2',
		children: ($$anchor, $$slotProps) => {
			var fragment = $.comment();
			var node_1 = $.first_child(fragment);

			$.each(node_1, 17, () => faqItems, $.index, ($$anchor, item) => {
				const Icon = $.derived(() => $.get(item).icon);

				AccordionItem($$anchor, {
					get value() {
						return $.get(item).id;
					},
					class: 'rounded-lg border bg-background px-4 shadow-xs last:border-b',
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = root_2();
						var node_2 = $.first_child(fragment_2);

						AccordionTrigger(node_2, {
							class: 'cursor-pointer items-center py-5 hover:no-underline',
							children: ($$anchor, $$slotProps) => {
								var div_5 = root();
								var div_6 = $.child(div_5);
								var node_3 = $.child(div_6);

								$.component(node_3, () => $.get(Icon), ($$anchor, Icon_1) => {
									Icon_1($$anchor, { class: 'm-auto size-4' });
								});

								$.reset(div_6);

								var span = $.sibling(div_6, 2);
								var text_1 = $.only_child(span, true);

								$.reset(div_5);
								$.template_effect(() => $.set_text(text_1, $.get(item).question));
								$.append($$anchor, div_5);
							},
							$$slots: { default: true }
						});

						var node_4 = $.sibling(node_2, 2);

						AccordionContent(node_4, {
							class: 'pb-5',
							children: ($$anchor, $$slotProps) => {
								var div_7 = root_1();
								var p_1 = $.child(div_7);
								var text_2 = $.only_child(p_1, true);

								$.reset(div_7);
								$.template_effect(() => $.set_text(text_2, $.get(item).answer));
								$.append($$anchor, div_7);
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

	$.reset(div_4);
	$.reset(div_1);
	$.reset(div);
	$.reset(section);
	$.append($$anchor, section);
}