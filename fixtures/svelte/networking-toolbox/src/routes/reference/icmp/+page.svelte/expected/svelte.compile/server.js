import * as $ from 'svelte/internal/server';
import { icmpContent } from '$lib/content/icmp.js';
import Icon from '$lib/components/global/Icon.svelte';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		$$renderer.push(`<div class="page-container"><div class="ref-page"><div class="ref-header"><h1>${$.escape(icmpContent.title)}</h1> <p class="subtitle">${$.escape(icmpContent.description)}</p></div> <div class="ref-section"><h2>${$.escape(icmpContent.sections.overview.title)}</h2> <p>${$.escape(icmpContent.sections.overview.content)}</p></div> <div class="ref-section"><h2>Common ICMPv4 Types</h2> <!--[-->`);

		const each_array = $.ensure_array_like(icmpContent.icmpv4Types);

		for (let index = 0, $$length = each_array.length; index < $$length; index++) {
			let type = each_array[index];

			$$renderer.push(`<div class="ref-examples"><div class="examples-title">Type ${$.escape(type.type)}: ${$.escape(type.name)}</div> <div class="example-item"><div><strong>Description:</strong> ${$.escape(type.description)}</div> <div><strong>Common Use:</strong> ${$.escape(type.commonUse)}</div> <div><strong>Example:</strong> ${$.escape(type.example)}</div> <div><strong>Troubleshooting:</strong> ${$.escape(type.troubleshooting)}</div> `);

			if (type.codes) {
				$$renderer.push(`<!--[0--><div><strong>Common Codes:</strong></div> <ul><!--[-->`);

				const each_array_1 = $.ensure_array_like(type.codes);

				for (let index = 0, $$length = each_array_1.length; index < $$length; index++) {
					let code = each_array_1[index];

					$$renderer.push(`<li>Code ${$.escape(code.code)}: ${$.escape(code.meaning)}</li>`);
				}

				$$renderer.push(`<!--]--></ul>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></div></div>`);
		}

		$$renderer.push(`<!--]--></div> <div class="ref-section"><h2>Common ICMPv6 Types</h2> <!--[-->`);

		const each_array_2 = $.ensure_array_like(icmpContent.icmpv6Types);

		for (let index = 0, $$length = each_array_2.length; index < $$length; index++) {
			let type = each_array_2[index];

			$$renderer.push(`<div class="ref-examples"><div class="examples-title">Type ${$.escape(type.type)}: ${$.escape(type.name)}</div> <div class="example-item"><div><strong>Description:</strong> ${$.escape(type.description)}</div> <div><strong>Common Use:</strong> ${$.escape(type.commonUse)}</div> <div><strong>Example:</strong> ${$.escape(type.example)}</div> <div><strong>Troubleshooting:</strong> ${$.escape(type.troubleshooting)}</div> `);

			if (type.codes) {
				$$renderer.push(`<!--[0--><div><strong>Common Codes:</strong></div> <ul><!--[-->`);

				const each_array_3 = $.ensure_array_like(type.codes);

				for (let index = 0, $$length = each_array_3.length; index < $$length; index++) {
					let code = each_array_3[index];

					$$renderer.push(`<li>Code ${$.escape(code.code)}: ${$.escape(code.meaning)}</li>`);
				}

				$$renderer.push(`<!--]--></ul>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></div></div>`);
		}

		$$renderer.push(`<!--]--></div> <div class="ref-section"><h2>Practical Troubleshooting Scenarios</h2> <!--[-->`);

		const each_array_4 = $.ensure_array_like(icmpContent.practicalExamples);

		for (let index = 0, $$length = each_array_4.length; index < $$length; index++) {
			let scenario = each_array_4[index];

			$$renderer.push(`<div class="ref-warning"><div class="warning-title">`);
			Icon($$renderer, { name: 'search', size: 'sm' });
			$$renderer.push(`<!----> ${$.escape(scenario.scenario)}</div> <div class="warning-content"><p><strong>ICMP Types Involved:</strong> ${$.escape(scenario.icmpTypes.join(', '))}</p> <p><strong>What to Check:</strong></p> <ul><!--[-->`);

			const each_array_5 = $.ensure_array_like(scenario.whatToCheck);

			for (let index = 0, $$length = each_array_5.length; index < $$length; index++) {
				let check = each_array_5[index];

				$$renderer.push(`<li>${$.escape(check)}</li>`);
			}

			$$renderer.push(`<!--]--></ul> <p><strong>Common Causes:</strong> ${$.escape(scenario.commonCauses.join(', '))}</p></div></div>`);
		}

		$$renderer.push(`<!--]--></div> <div class="ref-section"><h2>Common ICMP Filtering Issues</h2> <!--[-->`);

		const each_array_6 = $.ensure_array_like(icmpContent.filteringIssues);

		for (let index = 0, $$length = each_array_6.length; index < $$length; index++) {
			let issue = each_array_6[index];

			$$renderer.push(`<div class="ref-examples"><div class="examples-title">${$.escape(issue.issue)}</div> <div class="example-item"><div><strong>Problem:</strong> ${$.escape(issue.problem)}</div> <div><strong>Solution:</strong> ${$.escape(issue.solution)}</div> <div><strong>Recommendation:</strong> ${$.escape(issue.recommendation)}</div></div></div>`);
		}

		$$renderer.push(`<!--]--></div> <div class="ref-section"><h2>Troubleshooting Commands</h2> <table class="ref-table"><thead><tr><th>Command</th><th>Purpose</th><th>ICMP Type Used</th></tr></thead><tbody><!--[-->`);

		const each_array_7 = $.ensure_array_like(icmpContent.troubleshootingCommands);

		for (let index = 0, $$length = each_array_7.length; index < $$length; index++) {
			let cmd = each_array_7[index];

			$$renderer.push(`<tr><td><code>${$.escape(cmd.command)}</code></td><td>${$.escape(cmd.purpose)}</td><td>${$.escape(cmd.icmpType)}</td></tr>`);
		}

		$$renderer.push(`<!--]--></tbody></table></div> <div class="ref-section"><h2>Best Practices for ICMP</h2> <ul><!--[-->`);

		const each_array_8 = $.ensure_array_like(icmpContent.bestPractices);

		for (let index = 0, $$length = each_array_8.length; index < $$length; index++) {
			let practice = each_array_8[index];

			$$renderer.push(`<li>${$.escape(practice)}</li>`);
		}

		$$renderer.push(`<!--]--></ul></div> <div class="ref-section"><h2>ICMP Quick Reference</h2> <div class="ref-grid two-col"><div class="grid-item"><div class="item-title">Always Allow These</div> <!--[-->`);

		const each_array_9 = $.ensure_array_like(icmpContent.quickReference.mustAllow);

		for (let index = 0, $$length = each_array_9.length; index < $$length; index++) {
			let type = each_array_9[index];

			$$renderer.push(`<div class="item-code">${$.escape(type)}</div>`);
		}

		$$renderer.push(`<!--]--></div> <div class="grid-item"><div class="item-title">Never Filter These</div> <!--[-->`);

		const each_array_10 = $.ensure_array_like(icmpContent.quickReference.neverFilter);

		for (let index = 0, $$length = each_array_10.length; index < $$length; index++) {
			let type = each_array_10[index];

			$$renderer.push(`<div class="item-code">${$.escape(type)}</div>`);
		}

		$$renderer.push(`<!--]--> <div class="item-description">Critical for proper network operation</div></div></div></div> <div class="ref-section"><h2>Common Mistakes to Avoid</h2> <div class="ref-examples"><div class="examples-title">Don't Do These</div> <!--[-->`);

		const each_array_11 = $.ensure_array_like(icmpContent.commonMistakes);

		for (let index = 0, $$length = each_array_11.length; index < $$length; index++) {
			let mistake = each_array_11[index];

			$$renderer.push(`<div class="example-item"><div class="example-description">${$.escape(mistake)}</div></div>`);
		}

		$$renderer.push(`<!--]--></div> <div class="ref-highlight"><div class="highlight-title">`);
		Icon($$renderer, { name: 'shield-check', size: 'sm' });

		$$renderer.push(`<!----> Security vs Functionality</div> <div class="highlight-content">Don't block all ICMP for security. Instead, use rate limiting and allow essential types. Blocking ICMP
          completely breaks critical network functions like Path MTU Discovery and IPv6 Neighbor Discovery.</div></div></div></div></div>`);
	});
}