import * as $ from 'svelte/internal/server';
import { ChevronDownIcon } from '@lucide/svelte';
import SeoHeader from '$lib/components/seo/seo-header.svelte';
import StructuredData from '$lib/components/seo/structured-data.svelte';
import { cleanSchemaText } from '$lib/components/seo/schema.js';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { data } = $$props;
		const faqs = $.derived(() => data?.faqs ?? []);

		// FAQPage markup built from the questions this page actually renders — the only place on the
		// site where FAQ structured data describes visible content.
		const faqSchema = $.derived(() => {
			const entries = faqs().filter((faq) => faq?.question && faq?.answer);

			if (!entries.length) return '';

			return {
				'@context': 'https://schema.org',
				'@type': 'FAQPage',
				mainEntity: entries.map((faq) => ({
					'@type': 'Question',
					name: cleanSchemaText(faq.question),
					acceptedAnswer: { '@type': 'Answer', text: cleanSchemaText(faq.answer) }
				}))
			};
		});

		SeoHeader($$renderer, { metaTitle: 'Frequently Asked Questions' });
		$$renderer.push(`<!----> `);
		StructuredData($$renderer, { schema: faqSchema() });
		$$renderer.push(`<!----> <div class="mx-auto max-w-3xl px-4 py-8"><h1 class="mb-8 text-center text-3xl font-bold text-gray-900">Frequently Asked Questions</h1> `);

		if (faqs().length) {
			$$renderer.push(`<!--[0--><div class="space-y-4"><!--[-->`);

			const each_array = $.ensure_array_like(faqs());

			for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
				let faq = each_array[$$index];

				$$renderer.push(`<details class="faq overflow-hidden rounded-lg border border-gray-100 bg-white shadow-sm svelte-fadvfd"><summary class="flex w-full cursor-pointer items-center justify-between px-6 py-4 text-left transition-colors hover:bg-gray-50 svelte-fadvfd"><span class="flex-1 pr-4 text-lg font-medium text-gray-900">${$.escape(faq.question)}</span> <span class="faq-chevron text-gray-500 transition-transform duration-200 svelte-fadvfd">`);
				ChevronDownIcon($$renderer, { class: 'h-5 w-5' });
				$$renderer.push(`<!----></span></summary> <div${$.attr('id', `faq-${$.stringify(faq.id)}`)} class="px-6 pb-4"><div class="prose prose-sm max-w-none text-gray-600 prose-p:my-0 prose-li:my-0">${$.html(faq.answer)}</div></div></details>`);
			}

			$$renderer.push(`<!--]--></div>`);
		} else {
			$$renderer.push(`<!--[-1--><div class="py-8 text-center text-gray-500"><p>No FAQs available at the moment.</p></div>`);
		}

		$$renderer.push(`<!--]--></div>`);
	});
}