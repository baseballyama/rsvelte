import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { ChevronDownIcon } from '@lucide/svelte';
import SeoHeader from '$lib/components/seo/seo-header.svelte';
import StructuredData from '$lib/components/seo/structured-data.svelte';
import { cleanSchemaText } from '$lib/components/seo/schema.js';

var root = $.from_html(`<details class="faq overflow-hidden rounded-lg border border-gray-100 bg-white shadow-sm svelte-fadvfd"><summary class="flex w-full cursor-pointer items-center justify-between px-6 py-4 text-left transition-colors hover:bg-gray-50 svelte-fadvfd"><span class="flex-1 pr-4 text-lg font-medium text-gray-900"> </span> <span class="faq-chevron text-gray-500 transition-transform duration-200 svelte-fadvfd"><!></span></summary> <div class="px-6 pb-4"><div class="prose prose-sm max-w-none text-gray-600 prose-p:my-0 prose-li:my-0"></div></div></details>`);
var root_1 = $.from_html(`<div class="space-y-4"></div>`);
var root_2 = $.from_html(`<div class="py-8 text-center text-gray-500"><p>No FAQs available at the moment.</p></div>`);
var root_3 = $.from_html(`<!> <!> <div class="mx-auto max-w-3xl px-4 py-8"><h1 class="mb-8 text-center text-3xl font-bold text-gray-900">Frequently Asked Questions</h1> <!></div>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	const faqs = $.derived(() => $$props.data?.faqs ?? []);

	// FAQPage markup built from the questions this page actually renders — the only place on the
	// site where FAQ structured data describes visible content.
	const faqSchema = $.derived(() => {
		const entries = $.get(faqs).filter((faq) => faq?.question && faq?.answer);

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

	var fragment = root_3();
	var node = $.first_child(fragment);

	SeoHeader(node, { metaTitle: 'Frequently Asked Questions' });

	var node_1 = $.sibling(node, 2);

	StructuredData(node_1, {
		get schema() {
			return $.get(faqSchema);
		}
	});

	var div = $.sibling(node_1, 2);
	var node_2 = $.sibling($.child(div), 2);

	{
		var consequent = ($$anchor) => {
			var div_1 = root_1();

			$.each(div_1, 21, () => $.get(faqs), (faq) => faq.id, ($$anchor, faq) => {
				var details = root();
				var summary = $.child(details);
				var span = $.child(summary);
				var text = $.only_child(span, true);
				var span_1 = $.sibling(span, 2);
				var node_3 = $.child(span_1);

				ChevronDownIcon(node_3, { class: 'h-5 w-5' });
				$.reset(span_1);
				$.reset(summary);

				var div_2 = $.sibling(summary, 2);
				var div_3 = $.child(div_2);

				$.html(div_3, () => $.get(faq).answer, true);
				$.reset(div_3);
				$.reset(div_2);
				$.reset(details);

				$.template_effect(() => {
					$.set_text(text, $.get(faq).question);
					$.set_attribute(div_2, 'id', `faq-${$.get(faq).id ?? ''}`);
				});

				$.append($$anchor, details);
			});

			$.reset(div_1);
			$.append($$anchor, div_1);
		};

		var alternate = ($$anchor) => {
			var div_4 = root_2();

			$.append($$anchor, div_4);
		};

		$.if(node_2, ($$render) => {
			if ($.get(faqs).length) $$render(consequent); else $$render(alternate, -1);
		});
	}

	$.reset(div);
	$.append($$anchor, fragment);
	$.pop();
}