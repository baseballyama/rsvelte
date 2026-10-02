import * as $ from 'svelte/internal/server';
import { specialIPv4Content } from '$lib/content/special-use-ipv4.js';
import Icon from '$lib/components/global/Icon.svelte';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		$$renderer.push(`<div class="page-container"><div class="ref-page"><div class="ref-header"><h1>${$.escape(specialIPv4Content.title)}</h1> <p class="subtitle">${$.escape(specialIPv4Content.description)}</p></div> <div class="ref-section"><h2>Complete Special-Use IPv4 Ranges</h2> <table class="ref-table"><thead><tr><th>Network</th><th>Purpose</th><th>RFC</th><th>Routable</th><th>Description</th></tr></thead><tbody><!--[-->`);

		const each_array = $.ensure_array_like(specialIPv4Content.ranges);

		for (let rangeIdx = 0, $$length = each_array.length; rangeIdx < $$length; rangeIdx++) {
			let range = each_array[rangeIdx];

			$$renderer.push(`<tr><td><code>${$.escape(range.network)}</code></td><td>${$.escape(range.purpose)}</td><td>${$.escape(range.rfc)}</td><td>`);

			if (range.routable) {
				$$renderer.push(`<!--[0--><span style="color: var(--color-success)">Yes</span>`);
			} else {
				$$renderer.push(`<!--[-1--><span style="color: var(--color-error)">No</span>`);
			}

			$$renderer.push(`<!--]--></td><td>${$.escape(range.description)}</td></tr>`);
		}

		$$renderer.push(`<!--]--></tbody></table></div> <div class="ref-section"><h2>Common Address Categories</h2> <div class="ref-grid two-col"><div class="grid-item"><div class="item-title">Private Networks (RFC 1918)</div> <!--[-->`);

		const each_array_1 = $.ensure_array_like(specialIPv4Content.categories.private);

		for (let privIdx = 0, $$length = each_array_1.length; privIdx < $$length; privIdx++) {
			let network = each_array_1[privIdx];

			$$renderer.push(`<div class="item-code">${$.escape(network)}</div>`);
		}

		$$renderer.push(`<!--]--> <div class="item-description">Never routed on the public internet</div></div> <div class="grid-item"><div class="item-title">Test Networks (RFC 5737)</div> <!--[-->`);

		const each_array_2 = $.ensure_array_like(specialIPv4Content.categories.testing);

		for (let testIdx = 0, $$length = each_array_2.length; testIdx < $$length; testIdx++) {
			let network = each_array_2[testIdx];

			$$renderer.push(`<div class="item-code">${$.escape(network)}</div>`);
		}

		$$renderer.push(`<!--]--> <div class="item-description">Safe for documentation and examples</div></div> <div class="grid-item"><div class="item-title">Carrier-Grade NAT</div> <!--[-->`);

		const each_array_3 = $.ensure_array_like(specialIPv4Content.categories.cgnat);

		for (let cgnatIdx = 0, $$length = each_array_3.length; cgnatIdx < $$length; cgnatIdx++) {
			let network = each_array_3[cgnatIdx];

			$$renderer.push(`<div class="item-code">${$.escape(network)}</div>`);
		}

		$$renderer.push(`<!--]--> <div class="item-description">ISP shared addressing space</div></div> <div class="grid-item"><div class="item-title">Special Purpose</div> <!--[-->`);

		const each_array_4 = $.ensure_array_like(specialIPv4Content.categories.special);

		for (let specIdx = 0, $$length = each_array_4.length; specIdx < $$length; specIdx++) {
			let network = each_array_4[specIdx];

			$$renderer.push(`<div class="item-code">${$.escape(network)}</div>`);
		}

		$$renderer.push(`<!--]--> <div class="item-description">Loopback, link-local, multicast</div></div></div></div> <div class="ref-section"><h2>Quick Recognition Tips</h2> <div class="ref-examples"><div class="examples-title">What Each Range Means</div> <!--[-->`);

		const each_array_5 = $.ensure_array_like(specialIPv4Content.quickTips);

		for (let tipIdx = 0, $$length = each_array_5.length; tipIdx < $$length; tipIdx++) {
			let tip = each_array_5[tipIdx];

			$$renderer.push(`<div class="example-item"><div class="example-description">${$.escape(tip)}</div></div>`);
		}

		$$renderer.push(`<!--]--></div> <div class="ref-warning"><div class="warning-title">`);
		Icon($$renderer, { name: 'alert-triangle', size: 'sm' });

		$$renderer.push(`<!----> Important Note</div> <div class="warning-content">If you see 100.64.x.x addresses, your ISP is using Carrier-Grade NAT (CGNAT). This can cause issues with port
          forwarding, gaming, and some applications that require direct connectivity.</div></div></div></div></div>`);
	});
}