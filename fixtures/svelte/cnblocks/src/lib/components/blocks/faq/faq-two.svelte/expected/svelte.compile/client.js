import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "$lib/components/ui/accordion";

var root = $.from_html(`<p class="text-base"> </p>`);
var root_1 = $.from_html(`<!> <!>`, 1);

var root_2 = $.from_html(`<section class="py-16 md:py-24"><div class="mx-auto max-w-5xl px-4 md:px-6"><div class="mx-auto max-w-xl text-center"><h2 class="text-3xl font-bold text-balance md:text-4xl lg:text-5xl">Frequently Asked Questions</h2> <p class="mt-4 text-balance text-muted-foreground">Discover quick and comprehensive answers to common questions about our platform,
				services, and features.</p></div> <div class="mx-auto mt-12 max-w-xl"><!> <p class="mt-6 px-4 text-muted-foreground"> <a href="/" class="font-medium text-primary hover:underline">customer support team</a></p></div></div></section>`);

export default function Faq_two($$anchor) {
	let faqItems = [
		{
			id: "item-1",
			question: "How long does shipping take?",
			answer: "Standard shipping takes 3-5 business days, depending on your location. Express shipping options are available at checkout for 1-2 business day delivery."
		},

		{
			id: "item-2",
			question: "What payment methods do you accept?",
			answer: "We accept all major credit cards (Visa, Mastercard, American Express), PayPal, Apple Pay, and Google Pay. For enterprise customers, we also offer invoicing options."
		},

		{
			id: "item-3",
			question: "Can I change or cancel my order?",
			answer: "You can modify or cancel your order within 1 hour of placing it. After this window, please contact our customer support team who will assist you with any changes."
		},

		{
			id: "item-4",
			question: "Do you ship internationally?",
			answer: "Yes, we ship to over 50 countries worldwide. International shipping typically takes 7-14 business days. Additional customs fees may apply depending on your country's import regulations."
		},

		{
			id: "item-5",
			question: "What is your return policy?",
			answer: "We offer a 30-day return policy for most items. Products must be in original condition with tags attached. Some specialty items may have different return terms, which will be noted on the product page."
		}
	];

	var section = root_2();
	var div = $.child(section);
	var div_1 = $.sibling($.child(div), 2);
	var node = $.child(div_1);

	Accordion(node, {
		type: 'single',
		class: 'w-full rounded-2xl border bg-card px-8 py-3 shadow-sm ring-4 ring-muted dark:ring-0',
		children: ($$anchor, $$slotProps) => {
			var fragment = $.comment();
			var node_1 = $.first_child(fragment);

			$.each(node_1, 17, () => faqItems, $.index, ($$anchor, item, index) => {
				{
					let $0 = $.derived(() => [
						faqItems.length - 1 !== index ? "border-dashed" : "border-none"
					]);

					AccordionItem($$anchor, {
						get value() {
							return $.get(item).id;
						},

						get class() {
							return $.get($0);
						},

						children: ($$anchor, $$slotProps) => {
							var fragment_2 = root_1();
							var node_2 = $.first_child(fragment_2);

							AccordionTrigger(node_2, {
								class: 'cursor-pointer text-base hover:no-underline',
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
				}
			});

			$.append($$anchor, fragment);
		},
		$$slots: { default: true }
	});

	var p_1 = $.sibling(node, 2);
	var text_2 = $.child(p_1);

	text_2.nodeValue = 'Can\'t find what you\'re looking for? Contact our  ';
	$.next();
	$.reset(p_1);
	$.reset(div_1);
	$.reset(div);
	$.reset(section);
	$.append($$anchor, section);
}