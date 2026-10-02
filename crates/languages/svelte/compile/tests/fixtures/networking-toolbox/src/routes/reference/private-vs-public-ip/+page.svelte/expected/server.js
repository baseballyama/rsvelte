import * as $ from 'svelte/internal/server';
import { privateVsPublicContent } from '$lib/content/private-vs-public-ip.js';
import Icon from '$lib/components/global/Icon.svelte';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		$$renderer.push(`<div class="page-container"><div class="ref-page"><div class="ref-header"><h1>${$.escape(privateVsPublicContent.title)}</h1> <p class="subtitle">${$.escape(privateVsPublicContent.description)}</p></div> <div class="ref-section"><h2>${$.escape(privateVsPublicContent.sections.overview.title)}</h2> <p>${$.escape(privateVsPublicContent.sections.overview.content)}</p></div> <div class="ref-section"><h2>Private IP Address Ranges (RFC 1918)</h2> <!--[-->`);

		const each_array = $.ensure_array_like(privateVsPublicContent.privateRanges);

		for (let index = 0, $$length = each_array.length; index < $$length; index++) {
			let range = each_array[index];

			$$renderer.push(`<div class="ref-examples"><div class="examples-title">${$.escape(range.range)} - ${$.escape(range.class)}</div> <div class="example-item"><div><strong>Full Range:</strong> <code>${$.escape(range.fullRange)}</code></div> <div><strong>Total Addresses:</strong> ${$.escape(range.addresses)}</div> <div><strong>Common Use:</strong> ${$.escape(range.commonUse)}</div> <div><strong>Examples:</strong></div> <!--[-->`);

			const each_array_1 = $.ensure_array_like(range.examples);

			for (let index = 0, $$length = each_array_1.length; index < $$length; index++) {
				let example = each_array_1[index];

				$$renderer.push(`<code class="example-input">${$.escape(example)}</code>`);
			}

			$$renderer.push(`<!--]--></div></div>`);
		}

		$$renderer.push(`<!--]--></div> <div class="ref-section"><h2>Public IP Addresses</h2> <p>${$.escape(privateVsPublicContent.publicRanges.description)}</p> <h3>Characteristics</h3> <ul><!--[-->`);

		const each_array_2 = $.ensure_array_like(privateVsPublicContent.publicRanges.characteristics);

		for (let index = 0, $$length = each_array_2.length; index < $$length; index++) {
			let characteristic = each_array_2[index];

			$$renderer.push(`<li>${$.escape(characteristic)}</li>`);
		}

		$$renderer.push(`<!--]--></ul> <h3>Examples</h3> <table class="ref-table"><thead><tr><th>Public IP</th><th>Owner/Service</th></tr></thead><tbody><!--[-->`);

		const each_array_3 = $.ensure_array_like(privateVsPublicContent.publicRanges.examples);

		for (let index = 0, $$length = each_array_3.length; index < $$length; index++) {
			let example = each_array_3[index];

			$$renderer.push(`<tr><td><code>${$.escape(example.ip)}</code></td><td>${$.escape(example.owner)}</td></tr>`);
		}

		$$renderer.push(`<!--]--></tbody></table></div> <div class="ref-section"><h2>${$.escape(privateVsPublicContent.natImplications.title)}</h2> <div class="ref-grid two-col"><div class="grid-item"><div class="item-title">${$.escape(privateVsPublicContent.natImplications.privateToPublic.title)}</div> <div class="item-description">${$.escape(privateVsPublicContent.natImplications.privateToPublic.description)}</div> <h4>Process:</h4> <ol><!--[-->`);

		const each_array_4 = $.ensure_array_like(privateVsPublicContent.natImplications.privateToPublic.process);

		for (let index = 0, $$length = each_array_4.length; index < $$length; index++) {
			let step = each_array_4[index];

			$$renderer.push(`<li>${$.escape(step)}</li>`);
		}

		$$renderer.push(`<!--]--></ol> <h4>Benefits:</h4> <ul><!--[-->`);

		const each_array_5 = $.ensure_array_like(privateVsPublicContent.natImplications.privateToPublic.benefits);

		for (let index = 0, $$length = each_array_5.length; index < $$length; index++) {
			let benefit = each_array_5[index];

			$$renderer.push(`<li>${$.escape(benefit)}</li>`);
		}

		$$renderer.push(`<!--]--></ul></div> <div class="grid-item"><div class="item-title">${$.escape(privateVsPublicContent.natImplications.publicToPrivate.title)}</div> <div class="item-description">${$.escape(privateVsPublicContent.natImplications.publicToPrivate.description)}</div> <h4>Challenges:</h4> <ul><!--[-->`);

		const each_array_6 = $.ensure_array_like(privateVsPublicContent.natImplications.publicToPrivate.challenges);

		for (let index = 0, $$length = each_array_6.length; index < $$length; index++) {
			let challenge = each_array_6[index];

			$$renderer.push(`<li>${$.escape(challenge)}</li>`);
		}

		$$renderer.push(`<!--]--></ul> <h4>Solutions:</h4> <ul><!--[-->`);

		const each_array_7 = $.ensure_array_like(privateVsPublicContent.natImplications.publicToPrivate.solutions);

		for (let index = 0, $$length = each_array_7.length; index < $$length; index++) {
			let solution = each_array_7[index];

			$$renderer.push(`<li>${$.escape(solution)}</li>`);
		}

		$$renderer.push(`<!--]--></ul></div></div></div> <div class="ref-section"><h2>Quick Identification Methods</h2> <table class="ref-table"><thead><tr><th>Method</th><th>Description</th><th>Private Indicator</th><th>Public Indicator</th></tr></thead><tbody><!--[-->`);

		const each_array_8 = $.ensure_array_like(privateVsPublicContent.identification.quickCheck);

		for (let index = 0, $$length = each_array_8.length; index < $$length; index++) {
			let method = each_array_8[index];

			$$renderer.push(`<tr><td><strong>${$.escape(method.method)}</strong></td><td>${$.escape(method.description)}</td><td><code>${$.escape(method.private)}</code></td><td><code>${$.escape(method.public)}</code></td></tr>`);
		}

		$$renderer.push(`<!--]--></tbody></table> <h3>Useful Tools</h3> <div class="ref-grid two-col"><!--[-->`);

		const each_array_9 = $.ensure_array_like(privateVsPublicContent.identification.tools);

		for (let index = 0, $$length = each_array_9.length; index < $$length; index++) {
			let tool = each_array_9[index];

			$$renderer.push(`<div class="grid-item"><div class="item-title">${$.escape(tool.tool)}</div> <div class="item-description">${$.escape(tool.purpose)}</div></div>`);
		}

		$$renderer.push(`<!--]--></div></div> <div class="ref-section"><h2>Common Network Scenarios</h2> <!--[-->`);

		const each_array_10 = $.ensure_array_like(privateVsPublicContent.commonScenarios);

		for (let index = 0, $$length = each_array_10.length; index < $$length; index++) {
			let scenario = each_array_10[index];

			$$renderer.push(`<div class="ref-examples"><div class="examples-title">${$.escape(scenario.scenario)}</div> <div class="example-item"><div><strong>Setup:</strong> ${$.escape(scenario.setup)}</div> <div><strong>Private IPs:</strong> ${$.escape(scenario.privateIPs)}</div> <div><strong>Public IP:</strong> ${$.escape(scenario.publicIP)}</div> <div><strong>NAT Behavior:</strong> ${$.escape(scenario.natBehavior)}</div></div></div>`);
		}

		$$renderer.push(`<!--]--></div> <div class="ref-section"><h2>Troubleshooting Common Issues</h2> <!--[-->`);

		const each_array_11 = $.ensure_array_like(privateVsPublicContent.troubleshooting);

		for (let index = 0, $$length = each_array_11.length; index < $$length; index++) {
			let issue = each_array_11[index];

			$$renderer.push(`<div class="ref-warning"><div class="warning-title">`);
			Icon($$renderer, { name: 'help-circle', size: 'sm' });
			$$renderer.push(`<!----> ${$.escape(issue.issue)}</div> <div class="warning-content"><p><strong>Possible Causes:</strong> ${$.escape(issue.possibleCauses.join(', '))}</p> <p><strong>Diagnosis:</strong> ${$.escape(issue.diagnosis)}</p> <p><strong>Solution:</strong> ${$.escape(issue.solution)}</p></div></div>`);
		}

		$$renderer.push(`<!--]--></div> <div class="ref-section"><h2>Security Considerations</h2> <!--[-->`);

		const each_array_12 = $.ensure_array_like(privateVsPublicContent.securityConsiderations);

		for (let index = 0, $$length = each_array_12.length; index < $$length; index++) {
			let security = each_array_12[index];

			$$renderer.push(`<div class="ref-examples"><div class="examples-title">${$.escape(security.aspect)}</div> <div class="example-item"><ul><!--[-->`);

			const each_array_13 = $.ensure_array_like(security.considerations);

			for (let index = 0, $$length = each_array_13.length; index < $$length; index++) {
				let consideration = each_array_13[index];

				$$renderer.push(`<li>${$.escape(consideration)}</li>`);
			}

			$$renderer.push(`<!--]--></ul></div></div>`);
		}

		$$renderer.push(`<!--]--></div> <div class="ref-section"><h2>Best Practices</h2> <ul><!--[-->`);

		const each_array_14 = $.ensure_array_like(privateVsPublicContent.bestPractices);

		for (let index = 0, $$length = each_array_14.length; index < $$length; index++) {
			let practice = each_array_14[index];

			$$renderer.push(`<li>${$.escape(practice)}</li>`);
		}

		$$renderer.push(`<!--]--></ul></div> <div class="ref-section"><h2>Quick Reference</h2> <div class="ref-grid two-col"><div class="grid-item"><div class="item-title">Private IP Ranges</div> <!--[-->`);

		const each_array_15 = $.ensure_array_like(privateVsPublicContent.quickReference.privateRanges);

		for (let index = 0, $$length = each_array_15.length; index < $$length; index++) {
			let range = each_array_15[index];

			$$renderer.push(`<div class="item-code">${$.escape(range)}</div>`);
		}

		$$renderer.push(`<!--]--></div> <div class="grid-item"><div class="item-title">Identification Tips</div> <!--[-->`);

		const each_array_16 = $.ensure_array_like(privateVsPublicContent.quickReference.identificationTips);

		for (let index = 0, $$length = each_array_16.length; index < $$length; index++) {
			let tip = each_array_16[index];

			$$renderer.push(`<div class="item-description">${$.escape(tip)}</div>`);
		}

		$$renderer.push(`<!--]--></div></div> <div class="ref-highlight"><div class="highlight-title">`);
		Icon($$renderer, { name: 'key', size: 'sm' });

		$$renderer.push(`<!----> Key Rule</div> <div class="highlight-content">If an IP starts with 10, 172.16-31, or 192.168, it's private. Everything else (except other reserved ranges)
          is public. Private IPs need NAT to reach the internet.</div></div></div></div></div>`);
	});
}