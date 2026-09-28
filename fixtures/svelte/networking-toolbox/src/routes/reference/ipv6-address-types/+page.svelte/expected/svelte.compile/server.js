import * as $ from 'svelte/internal/server';
import { ipv6AddressTypesContent } from '$lib/content/ipv6-address-types.js';
import Icon from '$lib/components/global/Icon.svelte';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		$$renderer.push(`<div class="page-container"><div class="ref-page"><div class="ref-header"><h1>${$.escape(ipv6AddressTypesContent.title)}</h1> <p class="subtitle">${$.escape(ipv6AddressTypesContent.description)}</p></div> <div class="ref-section"><h2>${$.escape(ipv6AddressTypesContent.sections.overview.title)}</h2> <p>${$.escape(ipv6AddressTypesContent.sections.overview.content)}</p></div> <div class="ref-section"><h2>Unicast Address Types</h2> <!--[-->`);

		const each_array = $.ensure_array_like(ipv6AddressTypesContent.unicastTypes);

		for (let index = 0, $$length = each_array.length; index < $$length; index++) {
			let type = each_array[index];

			$$renderer.push(`<div class="ref-examples"><div class="examples-title">${$.escape(type.type)}</div> <div class="example-item"><div><strong>Prefix:</strong> <code>${$.escape(type.prefix)}</code></div> <div><strong>Range:</strong> <code>${$.escape(type.range)}</code></div> <div><strong>Description:</strong> ${$.escape(type.description)}</div> <div><strong>Usage:</strong> ${$.escape(type.usage)}</div> <div><strong>Example:</strong> <code>${$.escape(type.example)}</code></div></div></div>`);
		}

		$$renderer.push(`<!--]--></div> <div class="ref-section"><h2>Special Addresses</h2> <table class="ref-table"><thead><tr><th>Address</th><th>Name</th><th>Description</th><th>Usage</th></tr></thead><tbody><!--[-->`);

		const each_array_1 = $.ensure_array_like(ipv6AddressTypesContent.specialAddresses);

		for (let index = 0, $$length = each_array_1.length; index < $$length; index++) {
			let addr = each_array_1[index];

			$$renderer.push(`<tr><td><code>${$.escape(addr.address)}</code></td><td>${$.escape(addr.name)}</td><td>${$.escape(addr.description)}</td><td>${$.escape(addr.usage)}</td></tr>`);
		}

		$$renderer.push(`<!--]--></tbody></table></div> <div class="ref-section"><h2>Multicast Address Scopes</h2> <p>All multicast addresses start with <code>ff</code>. The second byte indicates scope:</p> <!--[-->`);

		const each_array_2 = $.ensure_array_like(ipv6AddressTypesContent.multicastTypes);

		for (let index = 0, $$length = each_array_2.length; index < $$length; index++) {
			let scope = each_array_2[index];

			$$renderer.push(`<div class="ref-examples"><div class="examples-title">${$.escape(scope.scope)} Scope</div> <div class="example-item"><div><strong>Prefix:</strong> <code>${$.escape(scope.prefix)}</code></div> <div><strong>Description:</strong> ${$.escape(scope.description)}</div> `);

			if (scope.examples.length > 0) {
				$$renderer.push(`<!--[0--><div><strong>Common Addresses:</strong></div> <!--[-->`);

				const each_array_3 = $.ensure_array_like(scope.examples);

				for (let index = 0, $$length = each_array_3.length; index < $$length; index++) {
					let example = each_array_3[index];

					$$renderer.push(`<div class="example-input">${$.escape(example)}</div>`);
				}

				$$renderer.push(`<!--]-->`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></div></div>`);
		}

		$$renderer.push(`<!--]--></div> <div class="ref-section"><h2>${$.escape(ipv6AddressTypesContent.anycast.title)}</h2> <p>${$.escape(ipv6AddressTypesContent.anycast.description)}</p> <div class="ref-highlight"><div class="highlight-title">`);
		Icon($$renderer, { name: 'share', size: 'sm' });
		$$renderer.push(`<!----> Example</div> <div class="highlight-content">${$.escape(ipv6AddressTypesContent.anycast.example)}</div></div> <h3>Common Anycast Uses</h3> <ul><!--[-->`);

		const each_array_4 = $.ensure_array_like(ipv6AddressTypesContent.anycast.commonUses);

		for (let index = 0, $$length = each_array_4.length; index < $$length; index++) {
			let use = each_array_4[index];

			$$renderer.push(`<li>${$.escape(use)}</li>`);
		}

		$$renderer.push(`<!--]--></ul></div> <div class="ref-section"><h2>Reserved Address Ranges</h2> <table class="ref-table"><thead><tr><th>Prefix</th><th>Purpose</th></tr></thead><tbody><!--[-->`);

		const each_array_5 = $.ensure_array_like(ipv6AddressTypesContent.reservedRanges);

		for (let index = 0, $$length = each_array_5.length; index < $$length; index++) {
			let range = each_array_5[index];

			$$renderer.push(`<tr><td><code>${$.escape(range.prefix)}</code></td><td>${$.escape(range.purpose)}</td></tr>`);
		}

		$$renderer.push(`<!--]--></tbody></table></div> <div class="ref-section"><h2>Quick Recognition Tips</h2> <div class="ref-examples"><div class="examples-title">Remember These Patterns</div> <!--[-->`);

		const each_array_6 = $.ensure_array_like(ipv6AddressTypesContent.quickTips);

		for (let index = 0, $$length = each_array_6.length; index < $$length; index++) {
			let tip = each_array_6[index];

			$$renderer.push(`<div class="example-item"><div class="example-description">${$.escape(tip)}</div></div>`);
		}

		$$renderer.push(`<!--]--></div></div></div></div>`);
	});
}