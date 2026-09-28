import * as $ from 'svelte/internal/server';
import { mtuMssContent } from '$lib/content/mtu-mss.js';
import Icon from '$lib/components/global/Icon.svelte';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		$$renderer.push(`<div class="page-container"><div class="ref-page"><div class="ref-header"><h1>${$.escape(mtuMssContent.title)}</h1> <p class="subtitle">${$.escape(mtuMssContent.description)}</p></div> <div class="ref-section"><h2>${$.escape(mtuMssContent.sections.overview.title)}</h2> <p>${$.escape(mtuMssContent.sections.overview.content)}</p> <div class="ref-highlight"><div class="highlight-title">`);
		Icon($$renderer, { name: 'formula', size: 'sm' });
		$$renderer.push(`<!----> Key Formula</div> <div class="highlight-content">MSS = MTU - IP Header - TCP Header<br/> For IPv4: MSS = MTU - 20 - 20 = MTU - 40 bytes</div></div></div> <div class="ref-section"><h2>Common MTU/MSS Values</h2> <table class="ref-table"><thead><tr><th>Medium</th><th>MTU</th><th>MSS</th><th>Usage</th><th>Notes</th></tr></thead><tbody><!--[-->`);

		const each_array = $.ensure_array_like(mtuMssContent.commonValues);

		for (let index = 0, $$length = each_array.length; index < $$length; index++) {
			let value = each_array[index];

			$$renderer.push(`<tr><td><strong>${$.escape(value.medium)}</strong></td><td><code>${$.escape(value.mtu)}</code></td><td><code>${$.escape(value.mss)}</code></td><td>${$.escape(value.usage)}</td><td>${$.escape(value.notes)}</td></tr>`);
		}

		$$renderer.push(`<!--]--></tbody></table></div> <div class="ref-section"><h2>${$.escape(mtuMssContent.calculations.title)}</h2> <!--[-->`);

		const each_array_1 = $.ensure_array_like(mtuMssContent.calculations.examples);

		for (let index = 0, $$length = each_array_1.length; index < $$length; index++) {
			let example = each_array_1[index];

			$$renderer.push(`<div class="ref-examples"><div class="examples-title">${$.escape(example.scenario)}</div> <div class="example-item"><div><strong>MTU:</strong> ${$.escape(example.mtu)} bytes</div> <div><strong>IP Header:</strong> ${$.escape(example.ipHeader)} bytes</div> <div><strong>TCP Header:</strong> ${$.escape(example.tcpHeader)} bytes</div> <div><strong>Resulting MSS:</strong> <code>${$.escape(example.mss)}</code> bytes</div> <div><strong>Calculation:</strong> ${$.escape(example.calculation)}</div></div></div>`);
		}

		$$renderer.push(`<!--]--></div> <div class="ref-section"><h2>Protocol Overheads</h2> <table class="ref-table"><thead><tr><th>Protocol/Header</th><th>Overhead (Bytes)</th><th>Notes</th></tr></thead><tbody><!--[-->`);

		const each_array_2 = $.ensure_array_like(mtuMssContent.overheads);

		for (let index = 0, $$length = each_array_2.length; index < $$length; index++) {
			let overhead = each_array_2[index];

			$$renderer.push(`<tr><td><strong>${$.escape(overhead.protocol)}</strong></td><td><code>${$.escape(overhead.overhead)}</code></td><td>${$.escape(overhead.notes)}</td></tr>`);
		}

		$$renderer.push(`<!--]--></tbody></table></div> <div class="ref-section"><h2>${$.escape(mtuMssContent.discovery.title)}</h2> <p>${$.escape(mtuMssContent.discovery.description)}</p> <h3>PMTU Discovery Process</h3> <ol><!--[-->`);

		const each_array_3 = $.ensure_array_like(mtuMssContent.discovery.process);

		for (let index = 0, $$length = each_array_3.length; index < $$length; index++) {
			let step = each_array_3[index];

			$$renderer.push(`<li>${$.escape(step)}</li>`);
		}

		$$renderer.push(`<!--]--></ol> <h3>Common Issues</h3> <ul><!--[-->`);

		const each_array_4 = $.ensure_array_like(mtuMssContent.discovery.issues);

		for (let index = 0, $$length = each_array_4.length; index < $$length; index++) {
			let issue = each_array_4[index];

			$$renderer.push(`<li>${$.escape(issue)}</li>`);
		}

		$$renderer.push(`<!--]--></ul></div> <div class="ref-section"><h2>Troubleshooting Common Issues</h2> <!--[-->`);

		const each_array_5 = $.ensure_array_like(mtuMssContent.troubleshooting);

		for (let index = 0, $$length = each_array_5.length; index < $$length; index++) {
			let issue = each_array_5[index];

			$$renderer.push(`<div class="ref-warning"><div class="warning-title">`);
			Icon($$renderer, { name: 'help-circle', size: 'sm' });
			$$renderer.push(`<!----> ${$.escape(issue.issue)}</div> <div class="warning-content"><p><strong>Cause:</strong> ${$.escape(issue.cause)}</p> <p><strong>Solution:</strong> ${$.escape(issue.solution)}</p></div></div>`);
		}

		$$renderer.push(`<!--]--></div> <div class="ref-section"><h2>Useful Commands</h2> <h3>Checking MTU Settings</h3> <table class="ref-table"><thead><tr><th>Platform</th><th>Command</th><th>Purpose</th></tr></thead><tbody><!--[-->`);

		const each_array_6 = $.ensure_array_like(mtuMssContent.commands);

		for (let index = 0, $$length = each_array_6.length; index < $$length; index++) {
			let cmd = each_array_6[index];

			$$renderer.push(`<tr><td><strong>${$.escape(cmd.platform)}</strong></td><td><code>${$.escape(cmd.command)}</code></td><td>${$.escape(cmd.purpose)}</td></tr>`);
		}

		$$renderer.push(`<!--]--></tbody></table> <h3>Testing MTU Size</h3> <table class="ref-table"><thead><tr><th>Platform</th><th>Command</th><th>Purpose</th></tr></thead><tbody><!--[-->`);

		const each_array_7 = $.ensure_array_like(mtuMssContent.testCommands);

		for (let index = 0, $$length = each_array_7.length; index < $$length; index++) {
			let cmd = each_array_7[index];

			$$renderer.push(`<tr><td><strong>${$.escape(cmd.platform)}</strong></td><td><code style="font-size: 0.85em;">${$.escape(cmd.command)}</code></td><td>${$.escape(cmd.purpose)}</td></tr>`);
		}

		$$renderer.push(`<!--]--></tbody></table></div> <div class="ref-section"><h2>Best Practices</h2> <ul><!--[-->`);

		const each_array_8 = $.ensure_array_like(mtuMssContent.bestPractices);

		for (let index = 0, $$length = each_array_8.length; index < $$length; index++) {
			let practice = each_array_8[index];

			$$renderer.push(`<li>${$.escape(practice)}</li>`);
		}

		$$renderer.push(`<!--]--></ul> <div class="ref-highlight"><div class="highlight-title">`);
		Icon($$renderer, { name: 'zap', size: 'sm' });

		$$renderer.push(`<!----> Performance Tip</div> <div class="highlight-content">Mismatched MTU sizes can cause significant performance issues. Always ensure consistent MTU values across your
          network path, especially for high-throughput applications.</div></div></div> <div class="ref-section"><h2>Quick Reference</h2> <div class="ref-examples"><div class="examples-title">Common Values to Remember</div> <!--[-->`);

		const each_array_9 = $.ensure_array_like(mtuMssContent.quickReference);

		for (let index = 0, $$length = each_array_9.length; index < $$length; index++) {
			let value = each_array_9[index];

			$$renderer.push(`<div class="example-item"><div class="example-input">${$.escape(value)}</div></div>`);
		}

		$$renderer.push(`<!--]--></div> <div class="ref-warning"><div class="warning-title">`);
		Icon($$renderer, { name: 'alert-circle', size: 'sm' });

		$$renderer.push(`<!----> Important Note</div> <div class="warning-content">When troubleshooting connectivity issues, especially with VPNs or tunnels, MTU/MSS mismatches are often the
          culprit. Test with smaller packet sizes if large transfers fail but small ones succeed.</div></div></div></div></div>`);
	});
}