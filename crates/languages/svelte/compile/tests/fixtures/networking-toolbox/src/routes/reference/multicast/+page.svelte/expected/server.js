import * as $ from 'svelte/internal/server';
import { multicastContent } from '$lib/content/multicast.js';
import Icon from '$lib/components/global/Icon.svelte';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		$$renderer.push(`<div class="page-container"><div class="ref-page"><div class="ref-header"><h1>${$.escape(multicastContent.title)}</h1> <p class="subtitle">${$.escape(multicastContent.description)}</p></div> <div class="ref-section"><h2>${$.escape(multicastContent.sections.overview.title)}</h2> <p>${$.escape(multicastContent.sections.overview.content)}</p></div> <div class="ref-section"><h2>${$.escape(multicastContent.ipv4Multicast.title)}</h2> <p><strong>Range:</strong> <code>${$.escape(multicastContent.ipv4Multicast.range)}</code></p> <!--[-->`);

		const each_array = $.ensure_array_like(multicastContent.ipv4Multicast.classes);

		for (let index = 0, $$length = each_array.length; index < $$length; index++) {
			let multicastClass = each_array[index];

			$$renderer.push(`<div class="ref-examples"><div class="examples-title">${$.escape(multicastClass.name)}</div> <div class="example-item"><div><strong>Range:</strong> <code>${$.escape(multicastClass.range)}</code></div> <div><strong>Description:</strong> ${$.escape(multicastClass.description)}</div> <div><strong>Scope:</strong> ${$.escape(multicastClass.scope)}</div> <div><strong>Examples:</strong></div> <!--[-->`);

			const each_array_1 = $.ensure_array_like(multicastClass.examples);

			for (let index = 0, $$length = each_array_1.length; index < $$length; index++) {
				let example = each_array_1[index];

				$$renderer.push(`<div class="example-input">${$.escape(example)}</div>`);
			}

			$$renderer.push(`<!--]--></div></div>`);
		}

		$$renderer.push(`<!--]--></div> <div class="ref-section"><h2>${$.escape(multicastContent.ipv6Multicast.title)}</h2> <p><strong>Range:</strong> <code>${$.escape(multicastContent.ipv6Multicast.range)}</code></p> <h3>Address Structure</h3> <p><strong>Format:</strong> <code>${$.escape(multicastContent.ipv6Multicast.structure.format)}</code></p> <div class="ref-grid two-col"><div class="grid-item"><div class="item-title">Flag Bits</div> <!--[-->`);

		const each_array_2 = $.ensure_array_like(multicastContent.ipv6Multicast.structure.flags);

		for (let index = 0, $$length = each_array_2.length; index < $$length; index++) {
			let flag = each_array_2[index];

			$$renderer.push(`<div class="item-code">${$.escape(flag.bit)} - ${$.escape(flag.meaning)}</div>`);
		}

		$$renderer.push(`<!--]--></div> <div class="grid-item"><div class="item-title">Scope Values</div> <!--[-->`);

		const each_array_3 = $.ensure_array_like(multicastContent.ipv6Multicast.structure.scopes);

		for (let index = 0, $$length = each_array_3.length; index < $$length; index++) {
			let scope = each_array_3[index];

			$$renderer.push(`<div class="item-code">${$.escape(scope.code)} - ${$.escape(scope.name)}</div>`);
		}

		$$renderer.push(`<!--]--></div></div> <h3>Well-Known IPv6 Multicast Addresses</h3> <table class="ref-table"><thead><tr><th>Address</th><th>Name</th><th>Description</th></tr></thead><tbody><!--[-->`);

		const each_array_4 = $.ensure_array_like(multicastContent.ipv6Multicast.wellKnown);

		for (let index = 0, $$length = each_array_4.length; index < $$length; index++) {
			let addr = each_array_4[index];

			$$renderer.push(`<tr><td><code>${$.escape(addr.address)}</code></td><td>${$.escape(addr.name)}</td><td>${$.escape(addr.description)}</td></tr>`);
		}

		$$renderer.push(`<!--]--></tbody></table></div> <div class="ref-section"><h2>Common Protocol Multicast Addresses</h2> <table class="ref-table"><thead><tr><th>Protocol</th><th>IPv4</th><th>IPv6</th><th>Purpose</th></tr></thead><tbody><!--[-->`);

		const each_array_5 = $.ensure_array_like(multicastContent.commonProtocols);

		for (let index = 0, $$length = each_array_5.length; index < $$length; index++) {
			let protocol = each_array_5[index];

			$$renderer.push(`<tr><td><strong>${$.escape(protocol.protocol)}</strong></td><td><code>${$.escape(protocol.ipv4)}</code></td><td><code>${$.escape(protocol.ipv6)}</code></td><td>${$.escape(protocol.purpose)}</td></tr>`);
		}

		$$renderer.push(`<!--]--></tbody></table></div> <div class="ref-section"><h2>Important Limitations</h2> <!--[-->`);

		const each_array_6 = $.ensure_array_like(multicastContent.limitations);

		for (let index = 0, $$length = each_array_6.length; index < $$length; index++) {
			let limitation = each_array_6[index];

			$$renderer.push(`<div class="ref-warning"><div class="warning-title">`);
			Icon($$renderer, { name: 'alert-triangle', size: 'sm' });
			$$renderer.push(`<!----> ${$.escape(limitation.title)}</div> <div class="warning-content"><p>${$.escape(limitation.description)}</p> <ul><!--[-->`);

			const each_array_7 = $.ensure_array_like(limitation.details);

			for (let index = 0, $$length = each_array_7.length; index < $$length; index++) {
				let detail = each_array_7[index];

				$$renderer.push(`<li>${$.escape(detail)}</li>`);
			}

			$$renderer.push(`<!--]--></ul></div></div>`);
		}

		$$renderer.push(`<!--]--></div> <div class="ref-section"><h2>Troubleshooting Common Issues</h2> <!--[-->`);

		const each_array_8 = $.ensure_array_like(multicastContent.troubleshooting);

		for (let index = 0, $$length = each_array_8.length; index < $$length; index++) {
			let issue = each_array_8[index];

			$$renderer.push(`<div class="ref-examples"><div class="examples-title">${$.escape(issue.issue)}</div> <div class="example-item"><div><strong>Common Causes:</strong></div> <ul><!--[-->`);

			const each_array_9 = $.ensure_array_like(issue.causes);

			for (let index = 0, $$length = each_array_9.length; index < $$length; index++) {
				let cause = each_array_9[index];

				$$renderer.push(`<li>${$.escape(cause)}</li>`);
			}

			$$renderer.push(`<!--]--></ul> <div><strong>Solutions:</strong></div> <ul><!--[-->`);

			const each_array_10 = $.ensure_array_like(issue.solutions);

			for (let index = 0, $$length = each_array_10.length; index < $$length; index++) {
				let solution = each_array_10[index];

				$$renderer.push(`<li>${$.escape(solution)}</li>`);
			}

			$$renderer.push(`<!--]--></ul></div></div>`);
		}

		$$renderer.push(`<!--]--></div> <div class="ref-section"><h2>Best Practices</h2> <ul><!--[-->`);

		const each_array_11 = $.ensure_array_like(multicastContent.bestPractices);

		for (let index = 0, $$length = each_array_11.length; index < $$length; index++) {
			let practice = each_array_11[index];

			$$renderer.push(`<li>${$.escape(practice)}</li>`);
		}

		$$renderer.push(`<!--]--></ul></div> <div class="ref-section"><h2>Quick Reference</h2> <div class="ref-grid two-col"><div class="grid-item"><div class="item-title">IPv4 Quick List</div> <!--[-->`);

		const each_array_12 = $.ensure_array_like(multicastContent.quickReference.ipv4);

		for (let index = 0, $$length = each_array_12.length; index < $$length; index++) {
			let addr = each_array_12[index];

			$$renderer.push(`<div class="item-code">${$.escape(addr)}</div>`);
		}

		$$renderer.push(`<!--]--></div> <div class="grid-item"><div class="item-title">IPv6 Quick List</div> <!--[-->`);

		const each_array_13 = $.ensure_array_like(multicastContent.quickReference.ipv6);

		for (let index = 0, $$length = each_array_13.length; index < $$length; index++) {
			let addr = each_array_13[index];

			$$renderer.push(`<div class="item-code">${$.escape(addr)}</div>`);
		}

		$$renderer.push(`<!--]--></div></div> <div class="ref-highlight"><div class="highlight-title">`);
		Icon($$renderer, { name: 'wifi', size: 'sm' });

		$$renderer.push(`<!----> Key Remember</div> <div class="highlight-content">Most multicast addresses are designed for local subnet use only. Without proper multicast routing
          configuration, traffic won't cross router boundaries.</div></div></div></div></div>`);
	});
}