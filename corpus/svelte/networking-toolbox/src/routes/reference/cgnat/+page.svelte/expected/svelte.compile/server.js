import * as $ from 'svelte/internal/server';
import { cgnatContent } from '$lib/content/cgnat.js';
import Icon from '$lib/components/global/Icon.svelte';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		$$renderer.push(`<div class="page-container"><div class="ref-page"><div class="ref-header"><h1>${$.escape(cgnatContent.title)}</h1> <p class="subtitle">${$.escape(cgnatContent.description)}</p></div> <div class="ref-section"><h2>${$.escape(cgnatContent.sections.overview.title)}</h2> <p>${$.escape(cgnatContent.sections.overview.content)}</p></div> <div class="ref-section"><h2>${$.escape(cgnatContent.sections.why.title)}</h2> <p>${$.escape(cgnatContent.sections.why.content)}</p></div> <div class="ref-section"><h2>CGNAT Address Range</h2> <div class="ref-highlight"><div class="highlight-title">`);
		Icon($$renderer, { name: 'globe', size: 'sm' });
		$$renderer.push(`<!----> Shared Address Space</div> <div class="highlight-content"><p><strong>Range:</strong> <code>${$.escape(cgnatContent.addressRange.range)}</code></p> <p><strong>Full Range:</strong> <code>${$.escape(cgnatContent.addressRange.fullRange)}</code></p> <p><strong>Total Addresses:</strong> ${$.escape(cgnatContent.addressRange.totalAddresses)}</p> <p><strong>RFC:</strong> ${$.escape(cgnatContent.addressRange.rfc)}</p></div></div> <h3>Address Breakdown</h3> <table class="ref-table"><thead><tr><th>Network Block</th><th>Available Addresses</th><th>Typical Use</th></tr></thead><tbody><!--[-->`);

		const each_array = $.ensure_array_like(cgnatContent.addressRange.breakdown);

		for (let index = 0, $$length = each_array.length; index < $$length; index++) {
			let block = each_array[index];

			$$renderer.push(`<tr><td><code>${$.escape(block.network)}</code></td><td>${$.escape(block.addresses)}</td><td>${$.escape(block.use)}</td></tr>`);
		}

		$$renderer.push(`<!--]--></tbody></table></div> <div class="ref-section"><h2>${$.escape(cgnatContent.howItWorks.title)}</h2> <p>${$.escape(cgnatContent.howItWorks.description)}</p> <h3>Two-Layer NAT System</h3> <table class="ref-table"><thead><tr><th>Layer</th><th>Location</th><th>Inside Address</th><th>Outside Address</th><th>Purpose</th></tr></thead><tbody><!--[-->`);

		const each_array_1 = $.ensure_array_like(cgnatContent.howItWorks.layers);

		for (let index = 0, $$length = each_array_1.length; index < $$length; index++) {
			let layer = each_array_1[index];

			$$renderer.push(`<tr><td><strong>${$.escape(layer.layer)}</strong></td><td>${$.escape(layer.location)}</td><td><code>${$.escape(layer.inside)}</code></td><td><code>${$.escape(layer.outside)}</code></td><td>${$.escape(layer.purpose)}</td></tr>`);
		}

		$$renderer.push(`<!--]--></tbody></table> <h3>Traffic Flow</h3> <ol><!--[-->`);

		const each_array_2 = $.ensure_array_like(cgnatContent.howItWorks.flow);

		for (let index = 0, $$length = each_array_2.length; index < $$length; index++) {
			let step = each_array_2[index];

			$$renderer.push(`<li>${$.escape(step)}</li>`);
		}

		$$renderer.push(`<!--]--></ol></div> <div class="ref-section"><h2>${$.escape(cgnatContent.identification.title)}</h2> <!--[-->`);

		const each_array_3 = $.ensure_array_like(cgnatContent.identification.methods);

		for (let index = 0, $$length = each_array_3.length; index < $$length; index++) {
			let method = each_array_3[index];

			$$renderer.push(`<div class="ref-examples"><div class="examples-title">${$.escape(method.method)}</div> <div class="example-item"><div><strong>Description:</strong> ${$.escape(method.description)}</div> <div><strong>CGNAT Indicator:</strong> <span style="color: var(--color-error)">${$.escape(method.cgnatIndicator)}</span></div> <div><strong>Normal Indicator:</strong> <span style="color: var(--color-success)">${$.escape(method.normalIndicator)}</span></div></div></div>`);
		}

		$$renderer.push(`<!--]--></div> <div class="ref-section"><h2>Impact on Services</h2> <h3>Negative Impacts</h3> <!--[-->`);

		const each_array_4 = $.ensure_array_like(cgnatContent.impacts.negative);

		for (let index = 0, $$length = each_array_4.length; index < $$length; index++) {
			let impact = each_array_4[index];

			$$renderer.push(`<div class="ref-warning"><div class="warning-title">`);
			Icon($$renderer, { name: 'x-circle', size: 'sm' });
			$$renderer.push(`<!----> ${$.escape(impact.impact)}</div> <div class="warning-content"><p><strong>Description:</strong> ${$.escape(impact.description)}</p> <p><strong>Affected Services:</strong> ${$.escape(impact.affectedServices.join(', '))}</p> <p><strong>Workaround:</strong> ${$.escape(impact.workaround)}</p></div></div>`);
		}

		$$renderer.push(`<!--]--> <h3>Positive Aspects</h3> <ul><!--[-->`);

		const each_array_5 = $.ensure_array_like(cgnatContent.impacts.positive);

		for (let index = 0, $$length = each_array_5.length; index < $$length; index++) {
			let positive = each_array_5[index];

			$$renderer.push(`<li>${$.escape(positive)}</li>`);
		}

		$$renderer.push(`<!--]--></ul></div> <div class="ref-section"><h2>Workarounds and Solutions</h2> <!--[-->`);

		const each_array_6 = $.ensure_array_like(cgnatContent.workarounds);

		for (let index = 0, $$length = each_array_6.length; index < $$length; index++) {
			let solution = each_array_6[index];

			$$renderer.push(`<div class="ref-examples"><div class="examples-title">${$.escape(solution.solution)}</div> <div class="example-item"><div><strong>Description:</strong> ${$.escape(solution.description)}</div> <div><strong>Effectiveness:</strong> ${$.escape(solution.effectiveness)}</div> <div><strong>Cost:</strong> ${$.escape(solution.cost)}</div></div></div>`);
		}

		$$renderer.push(`<!--]--></div> <div class="ref-section"><h2>Troubleshooting Common Issues</h2> <!--[-->`);

		const each_array_7 = $.ensure_array_like(cgnatContent.troubleshooting);

		for (let index = 0, $$length = each_array_7.length; index < $$length; index++) {
			let issue = each_array_7[index];

			$$renderer.push(`<div class="ref-warning"><div class="warning-title">`);
			Icon($$renderer, { name: 'help-circle', size: 'sm' });
			$$renderer.push(`<!----> ${$.escape(issue.issue)}</div> <div class="warning-content"><p><strong>Cause:</strong> ${$.escape(issue.cause)}</p> <p><strong>Diagnosis:</strong> ${$.escape(issue.diagnosis)}</p> <p><strong>Solution:</strong> ${$.escape(issue.solution)}</p></div></div>`);
		}

		$$renderer.push(`<!--]--></div> <div class="ref-section"><h2>Quick CGNAT Check</h2> <div class="ref-grid two-col"><div class="grid-item"><div class="item-title">Steps to Check</div> <ol><!--[-->`);

		const each_array_8 = $.ensure_array_like(cgnatContent.quickCheck.steps);

		for (let index = 0, $$length = each_array_8.length; index < $$length; index++) {
			let step = each_array_8[index];

			$$renderer.push(`<li>${$.escape(step)}</li>`);
		}

		$$renderer.push(`<!--]--></ol></div> <div class="grid-item"><div class="item-title">What to Do Next</div> <ul><!--[-->`);

		const each_array_9 = $.ensure_array_like(cgnatContent.quickCheck.whatToDo);

		for (let index = 0, $$length = each_array_9.length; index < $$length; index++) {
			let action = each_array_9[index];

			$$renderer.push(`<li>${$.escape(action)}</li>`);
		}

		$$renderer.push(`<!--]--></ul></div></div></div> <div class="ref-section"><h2>Best Practices</h2> <ul><!--[-->`);

		const each_array_10 = $.ensure_array_like(cgnatContent.bestPractices);

		for (let index = 0, $$length = each_array_10.length; index < $$length; index++) {
			let practice = each_array_10[index];

			$$renderer.push(`<li>${$.escape(practice)}</li>`);
		}

		$$renderer.push(`<!--]--></ul></div> <div class="ref-section"><h2>ISP Perspective</h2> <div class="ref-examples"><div class="examples-title">Why ISPs Use CGNAT</div> <!--[-->`);

		const each_array_11 = $.ensure_array_like(cgnatContent.ispPerspective);

		for (let index = 0, $$length = each_array_11.length; index < $$length; index++) {
			let reason = each_array_11[index];

			$$renderer.push(`<div class="example-item"><div class="example-description">${$.escape(reason)}</div></div>`);
		}

		$$renderer.push(`<!--]--></div> <div class="ref-highlight"><div class="highlight-title">`);
		Icon($$renderer, { name: 'info', size: 'sm' });

		$$renderer.push(`<!----> Understanding the Trade-off</div> <div class="highlight-content">CGNAT is a necessary compromise. It allows ISPs to provide affordable internet service during IPv4 exhaustion,
          but at the cost of some functionality. The long-term solution is IPv6 adoption.</div></div></div></div></div>`);
	});
}