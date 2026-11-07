import * as $ from 'svelte/internal/server';
import { arpVsNdpContent } from '$lib/content/arp-vs-ndp.js';
import Icon from '$lib/components/global/Icon.svelte';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		$$renderer.push(`<div class="page-container"><div class="ref-page"><div class="ref-header"><h1>${$.escape(arpVsNdpContent.title)}</h1> <p class="subtitle">${$.escape(arpVsNdpContent.description)}</p></div> <div class="ref-section"><h2>${$.escape(arpVsNdpContent.sections.overview.title)}</h2> <p>${$.escape(arpVsNdpContent.sections.overview.content)}</p></div> <div class="ref-section"><h2>Side-by-Side Comparison</h2> <table class="ref-table"><thead><tr><th>Aspect</th><th>ARP (IPv4)</th><th>NDP (IPv6)</th></tr></thead><tbody><!--[-->`);

		const each_array = $.ensure_array_like(arpVsNdpContent.comparison.basic);

		for (let index = 0, $$length = each_array.length; index < $$length; index++) {
			let item = each_array[index];

			$$renderer.push(`<tr><td><strong>${$.escape(item.aspect)}</strong></td><td>${$.escape(item.arp)}</td><td>${$.escape(item.ndp)}</td></tr>`);
		}

		$$renderer.push(`<!--]--></tbody></table></div> <div class="ref-section"><h2>${$.escape(arpVsNdpContent.arpDetails.title)}</h2> <h3>ARP Message Types</h3> <!--[-->`);

		const each_array_1 = $.ensure_array_like(arpVsNdpContent.arpDetails.messageTypes);

		for (let index = 0, $$length = each_array_1.length; index < $$length; index++) {
			let type = each_array_1[index];

			$$renderer.push(`<div class="ref-examples"><div class="examples-title">${$.escape(type.type)}</div> <div class="example-item"><div><strong>Description:</strong> ${$.escape(type.description)}</div> <div><strong>Destination:</strong> ${$.escape(type.destination)}</div> <div><strong>Response:</strong> ${$.escape(type.response)}</div></div></div>`);
		}

		$$renderer.push(`<!--]--> <h3>ARP Process</h3> <ol><!--[-->`);

		const each_array_2 = $.ensure_array_like(arpVsNdpContent.arpDetails.process);

		for (let index = 0, $$length = each_array_2.length; index < $$length; index++) {
			let step = each_array_2[index];

			$$renderer.push(`<li>${$.escape(step)}</li>`);
		}

		$$renderer.push(`<!--]--></ol> <h3>ARP Limitations</h3> <ul><!--[-->`);

		const each_array_3 = $.ensure_array_like(arpVsNdpContent.arpDetails.limitations);

		for (let index = 0, $$length = each_array_3.length; index < $$length; index++) {
			let limitation = each_array_3[index];

			$$renderer.push(`<li>${$.escape(limitation)}</li>`);
		}

		$$renderer.push(`<!--]--></ul></div> <div class="ref-section"><h2>${$.escape(arpVsNdpContent.ndpDetails.title)}</h2> <h3>NDP Message Types</h3> <!--[-->`);

		const each_array_4 = $.ensure_array_like(arpVsNdpContent.ndpDetails.messageTypes);

		for (let index = 0, $$length = each_array_4.length; index < $$length; index++) {
			let type = each_array_4[index];

			$$renderer.push(`<div class="ref-examples"><div class="examples-title">${$.escape(type.type)}</div> <div class="example-item"><div><strong>ICMP Type:</strong> <code>${$.escape(type.icmpType)}</code></div> <div><strong>Description:</strong> ${$.escape(type.description)}</div> <div><strong>Destination:</strong> ${$.escape(type.destination)}</div> <div><strong>Purpose:</strong> ${$.escape(type.purpose)}</div></div></div>`);
		}

		$$renderer.push(`<!--]--> <h3>NDP Process</h3> <ol><!--[-->`);

		const each_array_5 = $.ensure_array_like(arpVsNdpContent.ndpDetails.process);

		for (let index = 0, $$length = each_array_5.length; index < $$length; index++) {
			let step = each_array_5[index];

			$$renderer.push(`<li>${$.escape(step)}</li>`);
		}

		$$renderer.push(`<!--]--></ol> <h3>NDP Advantages Over ARP</h3> <ul><!--[-->`);

		const each_array_6 = $.ensure_array_like(arpVsNdpContent.ndpDetails.advantages);

		for (let index = 0, $$length = each_array_6.length; index < $$length; index++) {
			let advantage = each_array_6[index];

			$$renderer.push(`<li>${$.escape(advantage)}</li>`);
		}

		$$renderer.push(`<!--]--></ul></div> <div class="ref-section"><h2>Practical Differences</h2> <!--[-->`);

		const each_array_7 = $.ensure_array_like(arpVsNdpContent.practicalDifferences);

		for (let index = 0, $$length = each_array_7.length; index < $$length; index++) {
			let diff = each_array_7[index];

			$$renderer.push(`<div class="ref-examples"><div class="examples-title">${$.escape(diff.scenario)}</div> <div class="example-item"><div><strong>ARP (IPv4):</strong> ${$.escape(diff.arp)}</div> <div><strong>NDP (IPv6):</strong> ${$.escape(diff.ndp)}</div> <div><strong>Impact:</strong> ${$.escape(diff.impact)}</div></div></div>`);
		}

		$$renderer.push(`<!--]--></div> <div class="ref-section"><h2>Troubleshooting Commands</h2> <table class="ref-table"><thead><tr><th>Purpose</th><th>IPv4 (ARP)</th><th>IPv6 (NDP)</th><th>Windows</th></tr></thead><tbody><!--[-->`);

		const each_array_8 = $.ensure_array_like(arpVsNdpContent.troubleshootingCommands);

		for (let index = 0, $$length = each_array_8.length; index < $$length; index++) {
			let cmd = each_array_8[index];

			$$renderer.push(`<tr><td><strong>${$.escape(cmd.purpose)}</strong></td><td><code>${$.escape(cmd.ipv4)}</code></td><td><code style="font-size: 0.8em;">${$.escape(cmd.ipv6)}</code></td><td><code style="font-size: 0.8em;">${$.escape(cmd.windows)}</code></td></tr>`);
		}

		$$renderer.push(`<!--]--></tbody></table></div> <div class="ref-section"><h2>Common Issues</h2> <!--[-->`);

		const each_array_9 = $.ensure_array_like(arpVsNdpContent.commonIssues);

		for (let index = 0, $$length = each_array_9.length; index < $$length; index++) {
			let issue = each_array_9[index];

			$$renderer.push(`<div class="ref-warning"><div class="warning-title">`);
			Icon($$renderer, { name: 'alert-triangle', size: 'sm' });
			$$renderer.push(`<!----> ${$.escape(issue.issue)} (${$.escape(issue.protocol)})</div> <div class="warning-content"><p><strong>Description:</strong> ${$.escape(issue.description)}</p> <p><strong>Detection:</strong> ${$.escape(issue.detection)}</p> <p><strong>Mitigation:</strong> ${$.escape(issue.mitigation)}</p></div></div>`);
		}

		$$renderer.push(`<!--]--></div> <div class="ref-section"><h2>Best Practices</h2> <!--[-->`);

		const each_array_10 = $.ensure_array_like(arpVsNdpContent.bestPractices);

		for (let index = 0, $$length = each_array_10.length; index < $$length; index++) {
			let practices = each_array_10[index];

			$$renderer.push(`<h3>${$.escape(practices.protocol)} Best Practices</h3> <ul><!--[-->`);

			const each_array_11 = $.ensure_array_like(practices.practices);

			for (let index = 0, $$length = each_array_11.length; index < $$length; index++) {
				let practice = each_array_11[index];

				$$renderer.push(`<li>${$.escape(practice)}</li>`);
			}

			$$renderer.push(`<!--]--></ul>`);
		}

		$$renderer.push(`<!--]--></div> <div class="ref-section"><h2>Quick Reference</h2> <div class="ref-grid two-col"><div class="grid-item"><div class="item-title">ARP Key Points</div> <!--[-->`);

		const each_array_12 = $.ensure_array_like(arpVsNdpContent.quickReference.arp);

		for (let index = 0, $$length = each_array_12.length; index < $$length; index++) {
			let point = each_array_12[index];

			$$renderer.push(`<div class="item-code">${$.escape(point)}</div>`);
		}

		$$renderer.push(`<!--]--></div> <div class="grid-item"><div class="item-title">NDP Key Points</div> <!--[-->`);

		const each_array_13 = $.ensure_array_like(arpVsNdpContent.quickReference.ndp);

		for (let index = 0, $$length = each_array_13.length; index < $$length; index++) {
			let point = each_array_13[index];

			$$renderer.push(`<div class="item-code">${$.escape(point)}</div>`);
		}

		$$renderer.push(`<!--]--></div></div></div> <div class="ref-section"><h2>IPv4 to IPv6 Migration Tips</h2> <div class="ref-examples"><div class="examples-title">Important Considerations</div> <!--[-->`);

		const each_array_14 = $.ensure_array_like(arpVsNdpContent.migrationTips);

		for (let index = 0, $$length = each_array_14.length; index < $$length; index++) {
			let tip = each_array_14[index];

			$$renderer.push(`<div class="example-item"><div class="example-description">${$.escape(tip)}</div></div>`);
		}

		$$renderer.push(`<!--]--></div> <div class="ref-highlight"><div class="highlight-title">`);
		Icon($$renderer, { name: 'arrow-right', size: 'sm' });

		$$renderer.push(`<!----> Key Takeaway</div> <div class="highlight-content">While NDP is more complex than ARP, it's also much more capable and efficient. Understanding both protocols is
          essential for mixed IPv4/IPv6 environments.</div></div></div></div></div>`);
	});
}