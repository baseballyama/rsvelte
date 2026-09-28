import * as $ from 'svelte/internal/server';
import { reverseZonesContent } from '$lib/content/reverse-zones.js';
import Icon from '$lib/components/global/Icon.svelte';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		$$renderer.push(`<div class="page-container"><div class="ref-page"><div class="ref-header"><h1>${$.escape(reverseZonesContent.title)}</h1> <p class="subtitle">${$.escape(reverseZonesContent.description)}</p></div> <div class="ref-section"><h2>${$.escape(reverseZonesContent.sections.overview.title)}</h2> <p>${$.escape(reverseZonesContent.sections.overview.content)}</p></div> <div class="ref-section"><h2>${$.escape(reverseZonesContent.sections.delegation.title)}</h2> <p>${$.escape(reverseZonesContent.sections.delegation.content)}</p></div> <div class="ref-section"><h2>${$.escape(reverseZonesContent.ipv4Zones.title)}</h2> <h3>Classful Boundaries (Octet-Aligned)</h3> <table class="ref-table"><thead><tr><th>CIDR</th><th>Example</th><th>Reverse Zone</th><th>Description</th><th>Delegation</th></tr></thead><tbody><!--[-->`);

		const each_array = $.ensure_array_like(reverseZonesContent.ipv4Zones.classfullBoundaries);

		for (let index = 0, $$length = each_array.length; index < $$length; index++) {
			let boundary = each_array[index];

			$$renderer.push(`<tr><td><code>${$.escape(boundary.cidr)}</code></td><td><code>${$.escape(boundary.example)}</code></td><td><code>${$.escape(boundary.reverseZone)}</code></td><td>${$.escape(boundary.description)}</td><td>${$.escape(boundary.delegation)}</td></tr>`);
		}

		$$renderer.push(`<!--]--></tbody></table> <h3>Classless Delegation (CNAME Method)</h3> <!--[-->`);

		const each_array_1 = $.ensure_array_like(reverseZonesContent.ipv4Zones.classlessDelegation);

		for (let index = 0, $$length = each_array_1.length; index < $$length; index++) {
			let delegation = each_array_1[index];

			$$renderer.push(`<div class="ref-examples"><div class="examples-title">${$.escape(delegation.cidr)} - ${$.escape(delegation.example)}</div> <div class="example-item"><div><strong>Addresses:</strong> ${$.escape(delegation.addresses)}</div> <div><strong>Problem:</strong> ${$.escape(delegation.problem)}</div> <div><strong>Solution:</strong> ${$.escape(delegation.solution)}</div> <div><strong>Zone Names:</strong></div> <!--[-->`);

			const each_array_2 = $.ensure_array_like(delegation.zones);

			for (let index = 0, $$length = each_array_2.length; index < $$length; index++) {
				let zone = each_array_2[index];

				$$renderer.push(`<code class="example-input">${$.escape(zone)}</code>`);
			}

			$$renderer.push(`<!--]--></div></div>`);
		}

		$$renderer.push(`<!--]--> <h3>Practical IPv4 Examples</h3> <!--[-->`);

		const each_array_3 = $.ensure_array_like(reverseZonesContent.ipv4Zones.practicalExamples);

		for (let index = 0, $$length = each_array_3.length; index < $$length; index++) {
			let example = each_array_3[index];

			$$renderer.push(`<div class="ref-examples"><div class="examples-title">${$.escape(example.scenario)}</div> <div class="example-item"><div><strong>Network:</strong> <code>${$.escape(example.network)}</code></div> <div><strong>Reverse Zone:</strong> <code>${$.escape(example.reverseZone)}</code></div> `);

			if (example.reverseZones) {
				$$renderer.push(`<!--[0--><div><strong>Reverse Zones:</strong></div> <!--[-->`);

				const each_array_4 = $.ensure_array_like(example.reverseZones);

				for (let index = 0, $$length = each_array_4.length; index < $$length; index++) {
					let zone = each_array_4[index];

					$$renderer.push(`<code class="example-input">${$.escape(zone)}</code>`);
				}

				$$renderer.push(`<!--]--> <div><strong>Description:</strong> ${$.escape(example.description)}</div>`);
			} else {
				$$renderer.push(`<!--[-1--><div><strong>PTR Records:</strong></div> <!--[-->`);

				const each_array_5 = $.ensure_array_like(example.ptrRecords);

				for (let index = 0, $$length = each_array_5.length; index < $$length; index++) {
					let record = each_array_5[index];

					$$renderer.push(`<code class="example-input">${$.escape(record)}</code>`);
				}

				$$renderer.push(`<!--]-->`);
			}

			$$renderer.push(`<!--]--> <div><strong>Delegation:</strong> ${$.escape(example.delegation)}</div></div></div>`);
		}

		$$renderer.push(`<!--]--></div> <div class="ref-section"><h2>${$.escape(reverseZonesContent.ipv6Zones.title)}</h2> <h3>Nibble Boundaries (4-bit Aligned)</h3> <table class="ref-table"><thead><tr><th>CIDR</th><th>Example</th><th>Reverse Zone</th><th>Description</th><th>Delegation</th></tr></thead><tbody><!--[-->`);

		const each_array_6 = $.ensure_array_like(reverseZonesContent.ipv6Zones.nibbleBoundaries);

		for (let index = 0, $$length = each_array_6.length; index < $$length; index++) {
			let boundary = each_array_6[index];

			$$renderer.push(`<tr><td><code>${$.escape(boundary.cidr)}</code></td><td><code>${$.escape(boundary.example)}</code></td><td><code>${$.escape(boundary.reverseZone)}</code></td><td>${$.escape(boundary.description)}</td><td>${$.escape(boundary.delegation)}</td></tr>`);
		}

		$$renderer.push(`<!--]--></tbody></table> <h3>Practical IPv6 Examples</h3> <!--[-->`);

		const each_array_7 = $.ensure_array_like(reverseZonesContent.ipv6Zones.practicalExamples);

		for (let index = 0, $$length = each_array_7.length; index < $$length; index++) {
			let example = each_array_7[index];

			$$renderer.push(`<div class="ref-examples"><div class="examples-title">${$.escape(example.scenario)}</div> <div class="example-item"><div><strong>Network:</strong> <code>${$.escape(example.network)}</code></div> <div><strong>Master Zone:</strong> <code>${$.escape(example.reverseZone)}</code></div> <div><strong>Sub-zones:</strong></div> <!--[-->`);

			const each_array_8 = $.ensure_array_like(example.subZones);

			for (let index = 0, $$length = each_array_8.length; index < $$length; index++) {
				let zone = each_array_8[index];

				$$renderer.push(`<code class="example-input">${$.escape(zone)}</code>`);
			}

			$$renderer.push(`<!--]--> <div><strong>Management:</strong> ${$.escape(example.management)}</div></div></div>`);
		}

		$$renderer.push(`<!--]--></div> <div class="ref-section"><h2>${$.escape(reverseZonesContent.zoneCreation.title)}</h2> <div class="ref-grid two-col"><div class="grid-item"><div class="item-title">IPv4 Example (${$.escape(reverseZonesContent.zoneCreation.ipv4Example.network)})</div> <div><strong>Zone Name:</strong> <code>${$.escape(reverseZonesContent.zoneCreation.ipv4Example.zoneName)}</code></div> <h4>Zone File:</h4> <pre><code>${$.escape(reverseZonesContent.zoneCreation.ipv4Example.zoneFile)}</code></pre> <h4>Explanation:</h4> <ul><!--[-->`);

		const each_array_9 = $.ensure_array_like(reverseZonesContent.zoneCreation.ipv4Example.explanation);

		for (let index = 0, $$length = each_array_9.length; index < $$length; index++) {
			let point = each_array_9[index];

			$$renderer.push(`<li>${$.escape(point)}</li>`);
		}

		$$renderer.push(`<!--]--></ul></div> <div class="grid-item"><div class="item-title">IPv6 Example (${$.escape(reverseZonesContent.zoneCreation.ipv6Example.network)})</div> <div><strong>Zone Name:</strong> <code>${$.escape(reverseZonesContent.zoneCreation.ipv6Example.zoneName)}</code></div> <h4>Zone File:</h4> <pre><code>${$.escape(reverseZonesContent.zoneCreation.ipv6Example.zoneFile)}</code></pre> <h4>Explanation:</h4> <ul><!--[-->`);

		const each_array_10 = $.ensure_array_like(reverseZonesContent.zoneCreation.ipv6Example.explanation);

		for (let index = 0, $$length = each_array_10.length; index < $$length; index++) {
			let point = each_array_10[index];

			$$renderer.push(`<li>${$.escape(point)}</li>`);
		}

		$$renderer.push(`<!--]--></ul></div></div></div> <div class="ref-section"><h2>Delegation Scenarios</h2> <!--[-->`);

		const each_array_11 = $.ensure_array_like(reverseZonesContent.delegationScenarios);

		for (let index = 0, $$length = each_array_11.length; index < $$length; index++) {
			let scenario = each_array_11[index];

			$$renderer.push(`<div class="ref-examples"><div class="examples-title">${$.escape(scenario.scenario)}</div> <div class="example-item"><div><strong>Delegation:</strong> ${$.escape(scenario.delegation)}</div> `);

			if (scenario.customerActions) {
				$$renderer.push(`<!--[0--><div><strong>Customer Actions:</strong></div> <ul><!--[-->`);

				const each_array_12 = $.ensure_array_like(scenario.customerActions);

				for (let index = 0, $$length = each_array_12.length; index < $$length; index++) {
					let action = each_array_12[index];

					$$renderer.push(`<li>${$.escape(action)}</li>`);
				}

				$$renderer.push(`<!--]--></ul> <div><strong>ISP Actions:</strong></div> <ul><!--[-->`);

				const each_array_13 = $.ensure_array_like(scenario.ispActions);

				for (let index = 0, $$length = each_array_13.length; index < $$length; index++) {
					let action = each_array_13[index];

					$$renderer.push(`<li>${$.escape(action)}</li>`);
				}

				$$renderer.push(`<!--]--></ul>`);
			} else {
				$$renderer.push(`<!--[-1--><div><strong>Process:</strong></div> <ol><!--[-->`);

				const each_array_14 = $.ensure_array_like(scenario.process);

				for (let index = 0, $$length = each_array_14.length; index < $$length; index++) {
					let step = each_array_14[index];

					$$renderer.push(`<li>${$.escape(step)}</li>`);
				}

				$$renderer.push(`<!--]--></ol>`);
			}

			$$renderer.push(`<!--]--></div></div>`);
		}

		$$renderer.push(`<!--]--></div> <div class="ref-section"><h2>Troubleshooting</h2> <!--[-->`);

		const each_array_15 = $.ensure_array_like(reverseZonesContent.troubleshooting);

		for (let index = 0, $$length = each_array_15.length; index < $$length; index++) {
			let issue = each_array_15[index];

			$$renderer.push(`<div class="ref-warning"><div class="warning-title">`);
			Icon($$renderer, { name: 'help-circle', size: 'sm' });
			$$renderer.push(`<!----> ${$.escape(issue.issue)}</div> <div class="warning-content"><p><strong>Possible Causes:</strong> ${$.escape(issue.causes.join(', '))}</p> <p><strong>Diagnosis:</strong> ${$.escape(issue.diagnosis)}</p> <p><strong>Solution:</strong> ${$.escape(issue.solution)}</p></div></div>`);
		}

		$$renderer.push(`<!--]--></div> <div class="ref-section"><h2>Best Practices</h2> <ul><!--[-->`);

		const each_array_16 = $.ensure_array_like(reverseZonesContent.bestPractices);

		for (let index = 0, $$length = each_array_16.length; index < $$length; index++) {
			let practice = each_array_16[index];

			$$renderer.push(`<li>${$.escape(practice)}</li>`);
		}

		$$renderer.push(`<!--]--></ul></div> <div class="ref-section"><h2>Quick Reference</h2> <div class="ref-grid two-col"><div class="grid-item"><div class="item-title">Zone Name Formulas</div> <!--[-->`);

		const each_array_17 = $.ensure_array_like(reverseZonesContent.quickReference.zoneFormulas);

		for (let index = 0, $$length = each_array_17.length; index < $$length; index++) {
			let formula = each_array_17[index];

			$$renderer.push(`<div class="item-code">${$.escape(formula)}</div>`);
		}

		$$renderer.push(`<!--]--></div> <div class="grid-item"><div class="item-title">Essential Records</div> <!--[-->`);

		const each_array_18 = $.ensure_array_like(reverseZonesContent.quickReference.essentialRecords);

		for (let index = 0, $$length = each_array_18.length; index < $$length; index++) {
			let record = each_array_18[index];

			$$renderer.push(`<div class="item-description">${$.escape(record)}</div>`);
		}

		$$renderer.push(`<!--]--></div></div> <div class="ref-highlight"><div class="highlight-title">`);
		Icon($$renderer, { name: 'key', size: 'sm' });

		$$renderer.push(`<!----> Key Rule</div> <div class="highlight-content">IPv4 reverse zones reverse the octets (192.0.2.0/24 → 2.0.192.in-addr.arpa). IPv6 reverse zones reverse the
          nibbles (2001:db8::/32 → 8.b.d.0.1.0.0.2.ip6.arpa).</div></div></div> <div class="ref-section"><h2>Testing Tools</h2> <div class="ref-grid two-col"><!--[-->`);

		const each_array_19 = $.ensure_array_like(reverseZonesContent.tools);

		for (let index = 0, $$length = each_array_19.length; index < $$length; index++) {
			let tool = each_array_19[index];

			$$renderer.push(`<div class="grid-item"><div class="item-title">${$.escape(tool.tool)}</div> <div class="item-description">${$.escape(tool.purpose)}</div></div>`);
		}

		$$renderer.push(`<!--]--></div></div></div></div>`);
	});
}