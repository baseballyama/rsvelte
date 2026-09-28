import * as $ from 'svelte/internal/server';
import { reverseDnsContent } from '$lib/content/reverse-dns.js';
import Icon from '$lib/components/global/Icon.svelte';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		$$renderer.push(`<div class="page-container"><div class="ref-page"><div class="ref-header"><h1>${$.escape(reverseDnsContent.title)}</h1> <p class="subtitle">${$.escape(reverseDnsContent.description)}</p></div> <div class="ref-section"><h2>${$.escape(reverseDnsContent.sections.overview.title)}</h2> <p>${$.escape(reverseDnsContent.sections.overview.content)}</p></div> <div class="ref-section"><h2>${$.escape(reverseDnsContent.sections.howWorks.title)}</h2> <p>${$.escape(reverseDnsContent.sections.howWorks.content)}</p></div> <div class="ref-section"><h2>${$.escape(reverseDnsContent.ipv4Reverse.title)}</h2> <h3>Process Steps</h3> <ol><!--[-->`);

		const each_array = $.ensure_array_like(reverseDnsContent.ipv4Reverse.process);

		for (let index = 0, $$length = each_array.length; index < $$length; index++) {
			let step = each_array[index];

			$$renderer.push(`<li>${$.escape(step)}</li>`);
		}

		$$renderer.push(`<!--]--></ol> <h3>IPv4 Examples</h3> <!--[-->`);

		const each_array_1 = $.ensure_array_like(reverseDnsContent.ipv4Reverse.examples);

		for (let index = 0, $$length = each_array_1.length; index < $$length; index++) {
			let example = each_array_1[index];

			$$renderer.push(`<div class="ref-examples"><div class="examples-title">IP Address: ${$.escape(example.ip)}</div> <div class="example-item"><div><strong>Reverse Name:</strong> <code>${$.escape(example.reversed)}</code></div> <div><strong>PTR Record:</strong> <code>${$.escape(example.ptrRecord)}</code></div> <div><strong>Explanation:</strong> ${$.escape(example.explanation)}</div></div></div>`);
		}

		$$renderer.push(`<!--]--> <h3>Network Delegation</h3> <p>${$.escape(reverseDnsContent.ipv4Reverse.delegation.explanation)}</p> <table class="ref-table"><thead><tr><th>Network</th><th>Reverse Zone</th><th>Description</th></tr></thead><tbody><!--[-->`);

		const each_array_2 = $.ensure_array_like(reverseDnsContent.ipv4Reverse.delegation.examples);

		for (let index = 0, $$length = each_array_2.length; index < $$length; index++) {
			let example = each_array_2[index];

			$$renderer.push(`<tr><td><code>${$.escape(example.network)}</code></td><td><code>${$.escape(example.zone)}</code></td><td>${$.escape(example.description)}</td></tr>`);
		}

		$$renderer.push(`<!--]--></tbody></table></div> <div class="ref-section"><h2>${$.escape(reverseDnsContent.ipv6Reverse.title)}</h2> <h3>Process Steps</h3> <ol><!--[-->`);

		const each_array_3 = $.ensure_array_like(reverseDnsContent.ipv6Reverse.process);

		for (let index = 0, $$length = each_array_3.length; index < $$length; index++) {
			let step = each_array_3[index];

			$$renderer.push(`<li>${$.escape(step)}</li>`);
		}

		$$renderer.push(`<!--]--></ol> <h3>IPv6 Examples</h3> <!--[-->`);

		const each_array_4 = $.ensure_array_like(reverseDnsContent.ipv6Reverse.examples);

		for (let index = 0, $$length = each_array_4.length; index < $$length; index++) {
			let example = each_array_4[index];

			$$renderer.push(`<div class="ref-examples"><div class="examples-title">IP Address: ${$.escape(example.ip)}</div> <div class="example-item"><div><strong>Expanded:</strong> <code>${$.escape(example.expanded)}</code></div> <div><strong>Reverse Name:</strong> <code style="font-size: 0.8em; word-break: break-all;">${$.escape(example.nibbles)}</code></div> <div><strong>PTR Record:</strong> <code>${$.escape(example.ptrRecord)}</code></div> <div><strong>Note:</strong> ${$.escape(example.explanation)}</div></div></div>`);
		}

		$$renderer.push(`<!--]--> <div class="ref-warning"><div class="warning-title">`);
		Icon($$renderer, { name: 'info', size: 'sm' });

		$$renderer.push(`<!----> IPv6 Complexity</div> <div class="warning-content">IPv6 reverse DNS names are much longer than IPv4 because each hex digit becomes a separate label. A single
          IPv6 address creates a 72-character reverse DNS name!</div></div></div> <div class="ref-section"><h2>${$.escape(reverseDnsContent.practicalExamples.title)}</h2> <h3>Command Examples</h3> <table class="ref-table"><thead><tr><th>Command</th><th>Description</th><th>Expected Result</th></tr></thead><tbody><!--[-->`);

		const each_array_5 = $.ensure_array_like(reverseDnsContent.practicalExamples.digExamples);

		for (let index = 0, $$length = each_array_5.length; index < $$length; index++) {
			let example = each_array_5[index];

			$$renderer.push(`<tr><td><code>${$.escape(example.command)}</code></td><td>${$.escape(example.description)}</td><td><code>${$.escape(example.expectedResult)}</code></td></tr>`);
		}

		$$renderer.push(`<!--]--></tbody></table> <h3>Common Use Cases</h3> <ul><!--[-->`);

		const each_array_6 = $.ensure_array_like(reverseDnsContent.practicalExamples.commonChecks);

		for (let index = 0, $$length = each_array_6.length; index < $$length; index++) {
			let check = each_array_6[index];

			$$renderer.push(`<li>${$.escape(check)}</li>`);
		}

		$$renderer.push(`<!--]--></ul></div> <div class="ref-section"><h2>Troubleshooting Common Issues</h2> <!--[-->`);

		const each_array_7 = $.ensure_array_like(reverseDnsContent.troubleshooting);

		for (let index = 0, $$length = each_array_7.length; index < $$length; index++) {
			let issue = each_array_7[index];

			$$renderer.push(`<div class="ref-warning"><div class="warning-title">`);
			Icon($$renderer, { name: 'help-circle', size: 'sm' });
			$$renderer.push(`<!----> ${$.escape(issue.issue)}</div> <div class="warning-content"><p><strong>Causes:</strong> ${$.escape(issue.causes.join(', '))}</p> <p><strong>Solutions:</strong> ${$.escape(issue.solutions.join(', '))}</p></div></div>`);
		}

		$$renderer.push(`<!--]--></div> <div class="ref-section"><h2>Best Practices</h2> <ul><!--[-->`);

		const each_array_8 = $.ensure_array_like(reverseDnsContent.bestPractices);

		for (let index = 0, $$length = each_array_8.length; index < $$length; index++) {
			let practice = each_array_8[index];

			$$renderer.push(`<li>${$.escape(practice)}</li>`);
		}

		$$renderer.push(`<!--]--></ul></div> <div class="ref-section"><h2>Quick Reference &amp; Tools</h2> <div class="ref-grid two-col"><div class="grid-item"><div class="item-title">IPv4 Quick Examples</div> <!--[-->`);

		const each_array_9 = $.ensure_array_like(reverseDnsContent.quickReference.ipv4);

		for (let index = 0, $$length = each_array_9.length; index < $$length; index++) {
			let example = each_array_9[index];

			$$renderer.push(`<div class="item-code">${$.escape(example)}</div>`);
		}

		$$renderer.push(`<!--]--></div> <div class="grid-item"><div class="item-title">IPv6 Quick Examples</div> <!--[-->`);

		const each_array_10 = $.ensure_array_like(reverseDnsContent.quickReference.ipv6);

		for (let index = 0, $$length = each_array_10.length; index < $$length; index++) {
			let example = each_array_10[index];

			$$renderer.push(`<div class="item-code">${$.escape(example)}</div>`);
		}

		$$renderer.push(`<!--]--></div></div> <h3>Useful Tools</h3> <div class="ref-grid two-col"><!--[-->`);

		const each_array_11 = $.ensure_array_like(reverseDnsContent.tools);

		for (let index = 0, $$length = each_array_11.length; index < $$length; index++) {
			let tool = each_array_11[index];

			$$renderer.push(`<div class="grid-item"><div class="item-title">${$.escape(tool.name)}</div> <div class="item-description">${$.escape(tool.description)}</div></div>`);
		}

		$$renderer.push(`<!--]--></div></div></div></div>`);
	});
}