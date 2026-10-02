import * as $ from 'svelte/internal/server';
import IPRegexGenerator from '$lib/components/tools/IPRegexGenerator.svelte';
import { ipAddressValidationContent } from '$lib/content/ip-address-validation.js';
import Icon from '$lib/components/global/Icon.svelte';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		IPRegexGenerator($$renderer, {});
		$$renderer.push(`<!----> <div class="card content-section svelte-1r7pivk"><div class="container"><div class="card-header ref-header svelte-1r7pivk"><h2 class="svelte-1r7pivk">${$.escape(ipAddressValidationContent.title)}</h2> <p class="subtitle">${$.escape(ipAddressValidationContent.description)}</p></div> <div class="ref-section svelte-1r7pivk"><h3 class="svelte-1r7pivk">${$.escape(ipAddressValidationContent.sections.overview.title)}</h3> <p class="svelte-1r7pivk">${$.escape(ipAddressValidationContent.sections.overview.content)}</p></div> <div class="ref-section svelte-1r7pivk"><h3 class="svelte-1r7pivk">${$.escape(ipAddressValidationContent.sections.ipv4.title)}</h3> <p class="svelte-1r7pivk">${$.html(ipAddressValidationContent.sections.ipv4.content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/•/g, '&bull;'))}</p></div> <div class="ref-section svelte-1r7pivk"><h3 class="svelte-1r7pivk">${$.escape(ipAddressValidationContent.sections.ipv6.title)}</h3> <p class="svelte-1r7pivk">${$.html(ipAddressValidationContent.sections.ipv6.content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/•/g, '&bull;'))}</p></div> <div class="ref-section svelte-1r7pivk"><h3 class="svelte-1r7pivk">${$.escape(ipAddressValidationContent.sections.regexValidation.title)}</h3> <p class="svelte-1r7pivk">${$.html(ipAddressValidationContent.sections.regexValidation.content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/•/g, '&bull;'))}</p></div> <div class="ref-section svelte-1r7pivk"><h3 class="svelte-1r7pivk">Example Patterns</h3> <div class="examples-grid svelte-1r7pivk"><!--[-->`);

		const each_array = $.ensure_array_like(Object.values(ipAddressValidationContent.examples));

		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let example = each_array[$$index];

			$$renderer.push(`<div class="example-card svelte-1r7pivk"><h4 class="svelte-1r7pivk">${$.escape(example.title)}</h4> <div class="pattern-code svelte-1r7pivk"><code class="svelte-1r7pivk">${$.escape(example.pattern)}</code></div> <p class="example-description svelte-1r7pivk">${$.escape(example.description)}</p> <div class="example-details svelte-1r7pivk"><div class="matches svelte-1r7pivk"><strong class="svelte-1r7pivk">Matches:</strong> ${$.escape(example.matches.join(', '))}</div> <div class="fails svelte-1r7pivk"><strong class="svelte-1r7pivk">Fails:</strong> ${$.escape(example.fails.join(', '))}</div> <div class="limitation svelte-1r7pivk"><strong class="svelte-1r7pivk">Limitation:</strong> ${$.escape(example.limitation)}</div></div></div>`);
		}

		$$renderer.push(`<!--]--></div></div> <div class="ref-section svelte-1r7pivk"><h3 class="svelte-1r7pivk">${$.escape(ipAddressValidationContent.sections.practicalTips.title)}</h3> <p class="svelte-1r7pivk">${$.html(ipAddressValidationContent.sections.practicalTips.content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/•/g, '&bull;'))}</p></div> <div class="ref-section svelte-1r7pivk"><h3 class="svelte-1r7pivk">Key Recommendations</h3> <div class="recommendations-grid svelte-1r7pivk"><!--[-->`);

		const each_array_1 = $.ensure_array_like(ipAddressValidationContent.recommendations);

		for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
			let rec = each_array_1[$$index_1];

			$$renderer.push(`<div class="recommendation-card svelte-1r7pivk"><div class="rec-icon svelte-1r7pivk"${$.attr_style(`color: ${$.stringify(rec.color)}`)}>`);
			Icon($$renderer, { name: rec.icon, size: 'md' });
			$$renderer.push(`<!----></div> <div class="rec-content svelte-1r7pivk"><h4 class="svelte-1r7pivk">${$.escape(rec.title)}</h4> <p class="svelte-1r7pivk">${$.escape(rec.description)}</p></div></div>`);
		}

		$$renderer.push(`<!--]--></div></div></div></div>`);
	});
}