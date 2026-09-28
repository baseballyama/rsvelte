import * as $ from 'svelte/internal/server';
import { cidrContent } from '$lib/content/cidr.js';
import Icon from '$lib/components/global/Icon.svelte';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		$$renderer.push(`<div class="page-container"><div class="ref-page"><div class="ref-header"><h1>${$.escape(cidrContent.title)}</h1> <p class="subtitle">${$.escape(cidrContent.description)}</p></div> <div class="ref-section"><h2>${$.escape(cidrContent.sections.whatIs.title)}</h2> <p>${$.escape(cidrContent.sections.whatIs.content)}</p> <div class="ref-highlight"><div class="highlight-title">`);
		Icon($$renderer, { name: 'info', size: 'sm' });

		$$renderer.push(`<!----> Quick Example</div> <div class="highlight-content">In <code>192.168.1.0/24</code>, the network is 192.168.1.0 and there are 254 usable host addresses
          (192.168.1.1 through 192.168.1.254).</div></div></div> <div class="ref-section"><h2>${$.escape(cidrContent.sections.whyReplaced.title)}</h2> <p>${$.escape(cidrContent.sections.whyReplaced.content)}</p></div> <div class="ref-section"><h2>${$.escape(cidrContent.sections.howToRead.title)}</h2> <p>${$.escape(cidrContent.sections.howToRead.content)}</p></div> <div class="ref-section"><h2>Common Examples</h2> <div class="ref-examples"><div class="examples-title">Network Examples</div> <!--[-->`);

		const each_array = $.ensure_array_like(cidrContent.examples);

		for (let index = 0, $$length = each_array.length; index < $$length; index++) {
			let example = each_array[index];

			$$renderer.push(`<div class="example-item"><span class="example-input">${$.escape(example.cidr)}</span> <span class="example-arrow">→</span> <span class="example-output">${$.escape(example.hosts)}</span> <div class="example-description">${$.escape(example.description)}</div></div>`);
		}

		$$renderer.push(`<!--]--></div></div> <div class="ref-section"><h2>Prefix Length Reference Table</h2> <table class="ref-table"><thead><tr><th>Prefix</th><th>Subnet Mask</th><th>Usable Hosts</th><th>Typical Use</th></tr></thead><tbody><!--[-->`);

		const each_array_1 = $.ensure_array_like(cidrContent.prefixTable);

		for (let index = 0, $$length = each_array_1.length; index < $$length; index++) {
			let row = each_array_1[index];

			$$renderer.push(`<tr><td><code>${$.escape(row.prefix)}</code></td><td><code>${$.escape(row.mask)}</code></td><td>${$.escape(row.hosts)}</td><td>${$.escape(row.typical)}</td></tr>`);
		}

		$$renderer.push(`<!--]--></tbody></table></div> <div class="ref-section"><h2>Key Points to Remember</h2> <ul><!--[-->`);

		const each_array_2 = $.ensure_array_like(cidrContent.keyPoints);

		for (let index = 0, $$length = each_array_2.length; index < $$length; index++) {
			let point = each_array_2[index];

			$$renderer.push(`<li>${$.escape(point)}</li>`);
		}

		$$renderer.push(`<!--]--></ul> <div class="ref-warning"><div class="warning-title">`);
		Icon($$renderer, { name: 'alert-triangle', size: 'sm' });

		$$renderer.push(`<!----> Remember</div> <div class="warning-content">The first and last addresses in any network are reserved (network address and broadcast address), so the
          usable host count is always 2 less than the total addresses.</div></div></div></div></div>`);
	});
}