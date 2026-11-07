import * as $ from 'svelte/internal/server';
import { ipv6PrefixLengthsContent } from '$lib/content/ipv6-prefix-lengths.js';
import Icon from '$lib/components/global/Icon.svelte';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		$$renderer.push(`<div class="page-container"><div class="ref-page"><div class="ref-header"><h1>${$.escape(ipv6PrefixLengthsContent.title)}</h1> <p class="subtitle">${$.escape(ipv6PrefixLengthsContent.description)}</p></div> <div class="ref-section"><h2>${$.escape(ipv6PrefixLengthsContent.sections.overview.title)}</h2> <p>${$.escape(ipv6PrefixLengthsContent.sections.overview.content)}</p></div> <div class="ref-section"><h2>Common IPv6 Prefix Lengths</h2> <!--[-->`);

		const each_array = $.ensure_array_like(ipv6PrefixLengthsContent.commonPrefixes);

		for (let index = 0, $$length = each_array.length; index < $$length; index++) {
			let prefix = each_array[index];

			$$renderer.push(`<div class="ref-examples"><div class="examples-title">${$.escape(prefix.prefix)} - ${$.escape(prefix.name)}</div> <div class="example-item"><div><strong>Capacity:</strong> ${$.escape(prefix.hosts)}</div> <div><strong>Typical Use:</strong> ${$.escape(prefix.typical)}</div> <div><strong>Description:</strong> ${$.escape(prefix.description)}</div> <div><strong>Examples:</strong></div> <!--[-->`);

			const each_array_1 = $.ensure_array_like(prefix.examples);

			for (let index = 0, $$length = each_array_1.length; index < $$length; index++) {
				let example = each_array_1[index];

				$$renderer.push(`<div class="example-input">${$.escape(example)}</div>`);
			}

			$$renderer.push(`<!--]--></div></div>`);
		}

		$$renderer.push(`<!--]--></div> <div class="ref-section"><h2>Usage Guidelines</h2> <div class="ref-grid three-col"><div class="grid-item"><div class="item-title">${$.escape(ipv6PrefixLengthsContent.usageGuidelines.residential.title)}</div> <!--[-->`);

		const each_array_2 = $.ensure_array_like(ipv6PrefixLengthsContent.usageGuidelines.residential.allocations);

		for (let index = 0, $$length = each_array_2.length; index < $$length; index++) {
			let alloc = each_array_2[index];

			$$renderer.push(`<div class="item-code">${$.escape(alloc.size)}</div> <div class="item-description">${$.escape(alloc.description)}</div>`);
		}

		$$renderer.push(`<!--]--></div> <div class="grid-item"><div class="item-title">${$.escape(ipv6PrefixLengthsContent.usageGuidelines.enterprise.title)}</div> <!--[-->`);

		const each_array_3 = $.ensure_array_like(ipv6PrefixLengthsContent.usageGuidelines.enterprise.allocations);

		for (let index = 0, $$length = each_array_3.length; index < $$length; index++) {
			let alloc = each_array_3[index];

			$$renderer.push(`<div class="item-code">${$.escape(alloc.size)}</div> <div class="item-description">${$.escape(alloc.description)}</div>`);
		}

		$$renderer.push(`<!--]--></div> <div class="grid-item"><div class="item-title">${$.escape(ipv6PrefixLengthsContent.usageGuidelines.subnets.title)}</div> <!--[-->`);

		const each_array_4 = $.ensure_array_like(ipv6PrefixLengthsContent.usageGuidelines.subnets.allocations);

		for (let index = 0, $$length = each_array_4.length; index < $$length; index++) {
			let alloc = each_array_4[index];

			$$renderer.push(`<div class="item-code">${$.escape(alloc.size)}</div> <div class="item-description">${$.escape(alloc.description)}</div>`);
		}

		$$renderer.push(`<!--]--></div></div></div> <div class="ref-section"><h2>IPv4 vs IPv6 Comparison</h2> <table class="ref-table"><thead><tr><th>IPv4 Equivalent</th><th>IPv6 Usage</th><th>Note</th></tr></thead><tbody><!--[-->`);

		const each_array_5 = $.ensure_array_like(ipv6PrefixLengthsContent.comparison.mappings);

		for (let index = 0, $$length = each_array_5.length; index < $$length; index++) {
			let mapping = each_array_5[index];

			$$renderer.push(`<tr><td><code>${$.escape(mapping.ipv4)}</code></td><td><code>${$.escape(mapping.ipv6)}</code></td><td>${$.escape(mapping.note)}</td></tr>`);
		}

		$$renderer.push(`<!--]--></tbody></table></div> <div class="ref-section"><h2>Quick Reference Table</h2> <table class="ref-table"><thead><tr><th>Prefix</th><th>Available /64 Subnets</th><th>Typical Use</th></tr></thead><tbody><!--[-->`);

		const each_array_6 = $.ensure_array_like(ipv6PrefixLengthsContent.quickReference);

		for (let index = 0, $$length = each_array_6.length; index < $$length; index++) {
			let row = each_array_6[index];

			$$renderer.push(`<tr><td><code>${$.escape(row.prefix)}</code></td><td>${$.escape(row.subnets)}</td><td>${$.escape(row.note)}</td></tr>`);
		}

		$$renderer.push(`<!--]--></tbody></table></div> <div class="ref-section"><h2>Best Practices</h2> <ul><!--[-->`);

		const each_array_7 = $.ensure_array_like(ipv6PrefixLengthsContent.bestPractices);

		for (let index = 0, $$length = each_array_7.length; index < $$length; index++) {
			let practice = each_array_7[index];

			$$renderer.push(`<li>${$.escape(practice)}</li>`);
		}

		$$renderer.push(`<!--]--></ul> <div class="ref-highlight"><div class="highlight-title">`);
		Icon($$renderer, { name: 'star', size: 'sm' });

		$$renderer.push(`<!----> Key Rule</div> <div class="highlight-content">Always use /64 for end-user networks. This is required for SLAAC (Stateless Address Autoconfiguration) and
          many IPv6 features.</div></div></div> <div class="ref-section"><h2>Planning Tips</h2> <div class="ref-examples"><div class="examples-title">Remember These</div> <!--[-->`);

		const each_array_8 = $.ensure_array_like(ipv6PrefixLengthsContent.tips);

		for (let index = 0, $$length = each_array_8.length; index < $$length; index++) {
			let tip = each_array_8[index];

			$$renderer.push(`<div class="example-item"><div class="example-description">${$.escape(tip)}</div></div>`);
		}

		$$renderer.push(`<!--]--></div></div></div></div>`);
	});
}