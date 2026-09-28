import * as $ from 'svelte/internal/server';
import { ipv6EmbeddedIPv4Content } from '$lib/content/ipv6-embedded-ipv4.js';
import Icon from '$lib/components/global/Icon.svelte';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		$$renderer.push(`<div class="page-container"><div class="ref-page"><div class="ref-header"><h1>${$.escape(ipv6EmbeddedIPv4Content.title)}</h1> <p class="subtitle">${$.escape(ipv6EmbeddedIPv4Content.description)}</p></div> <div class="ref-section"><h2>${$.escape(ipv6EmbeddedIPv4Content.sections.overview.title)}</h2> <p>${$.escape(ipv6EmbeddedIPv4Content.sections.overview.content)}</p></div> <div class="ref-section"><h2>IPv4-in-IPv6 Mechanisms</h2> <!--[-->`);

		const each_array = $.ensure_array_like(ipv6EmbeddedIPv4Content.mechanisms);

		for (let index = 0, $$length = each_array.length; index < $$length; index++) {
			let mechanism = each_array[index];

			$$renderer.push(`<div class="ref-examples"><div class="examples-title">${$.escape(mechanism.name)} <span${$.attr_style(`color: ${mechanism.status === 'Active'
				? 'var(--color-success)'
				: mechanism.status === 'Deprecated' ? 'var(--color-error)' : 'var(--color-warning)'}`)}>[${$.escape(mechanism.status)}]</span></div> <div class="example-item"><div><strong>Prefix:</strong> <code>${$.escape(mechanism.prefix)}</code></div> <div><strong>Purpose:</strong> ${$.escape(mechanism.purpose)}</div> <div><strong>Format:</strong> <code>${$.escape(mechanism.format)}</code></div> <div><strong>Examples:</strong></div> <!--[-->`);

			const each_array_1 = $.ensure_array_like(mechanism.examples);

			for (let index = 0, $$length = each_array_1.length; index < $$length; index++) {
				let example = each_array_1[index];

				$$renderer.push(`<div class="example-input">${$.escape(example)}</div>`);
			}

			$$renderer.push(`<!--]--> <div><strong>Usage:</strong></div> <ul><!--[-->`);

			const each_array_2 = $.ensure_array_like(mechanism.usage);

			for (let index = 0, $$length = each_array_2.length; index < $$length; index++) {
				let use = each_array_2[index];

				$$renderer.push(`<li>${$.escape(use)}</li>`);
			}

			$$renderer.push(`<!--]--></ul> <div class="example-description"><strong>Note:</strong> ${$.escape(mechanism.notes)}</div></div></div>`);
		}

		$$renderer.push(`<!--]--></div> <div class="ref-section"><h2>${$.escape(ipv6EmbeddedIPv4Content.recognition.title)}</h2> <table class="ref-table"><thead><tr><th>Pattern</th><th>Meaning</th><th>What to Do</th></tr></thead><tbody><!--[-->`);

		const each_array_3 = $.ensure_array_like(ipv6EmbeddedIPv4Content.recognition.patterns);

		for (let index = 0, $$length = each_array_3.length; index < $$length; index++) {
			let pattern = each_array_3[index];

			$$renderer.push(`<tr><td><code>${$.escape(pattern.pattern)}</code></td><td>${$.escape(pattern.meaning)}</td><td>${$.escape(pattern.action)}</td></tr>`);
		}

		$$renderer.push(`<!--]--></tbody></table></div> <div class="ref-section"><h2>${$.escape(ipv6EmbeddedIPv4Content.conversion.title)}</h2> <p>To understand embedded addresses, you need to convert IPv4 addresses to hexadecimal:</p> <table class="ref-table"><thead><tr><th>IPv4 Address</th><th>Hex Equivalent</th><th>Breakdown</th></tr></thead><tbody><!--[-->`);

		const each_array_4 = $.ensure_array_like(ipv6EmbeddedIPv4Content.conversion.examples);

		for (let index = 0, $$length = each_array_4.length; index < $$length; index++) {
			let example = each_array_4[index];

			$$renderer.push(`<tr><td><code>${$.escape(example.ipv4)}</code></td><td><code>${$.escape(example.hex)}</code></td><td>${$.escape(example.breakdown)}</td></tr>`);
		}

		$$renderer.push(`<!--]--></tbody></table> <div class="ref-highlight"><div class="highlight-title">`);
		Icon($$renderer, { name: 'calculator', size: 'sm' });
		$$renderer.push(`<!----> Quick Tip</div> <div class="highlight-content">Each IPv4 octet becomes 2 hex digits. For example: 192 = C0, 168 = A8, so 192.168.1.1 becomes C0A8:0101.</div></div></div> <div class="ref-section"><h2>Modern Usage Guidelines</h2> <ul><!--[-->`);

		const each_array_5 = $.ensure_array_like(ipv6EmbeddedIPv4Content.modernUsage);

		for (let index = 0, $$length = each_array_5.length; index < $$length; index++) {
			let guideline = each_array_5[index];

			$$renderer.push(`<li>${$.escape(guideline)}</li>`);
		}

		$$renderer.push(`<!--]--></ul></div> <div class="ref-section"><h2>Common Troubleshooting Issues</h2> <!--[-->`);

		const each_array_6 = $.ensure_array_like(ipv6EmbeddedIPv4Content.troubleshooting);

		for (let index = 0, $$length = each_array_6.length; index < $$length; index++) {
			let issue = each_array_6[index];

			$$renderer.push(`<div class="ref-warning"><div class="warning-title">`);
			Icon($$renderer, { name: 'help-circle', size: 'sm' });
			$$renderer.push(`<!----> ${$.escape(issue.issue)}</div> <div class="warning-content"><p><strong>Cause:</strong> ${$.escape(issue.cause)}</p> <p><strong>Solution:</strong> ${$.escape(issue.solution)}</p></div></div>`);
		}

		$$renderer.push(`<!--]--></div> <div class="ref-section"><h2>Security Considerations</h2> <div class="ref-examples"><div class="examples-title">Important Security Notes</div> <!--[-->`);

		const each_array_7 = $.ensure_array_like(ipv6EmbeddedIPv4Content.securityNotes);

		for (let index = 0, $$length = each_array_7.length; index < $$length; index++) {
			let note = each_array_7[index];

			$$renderer.push(`<div class="example-item"><div class="example-description">${$.escape(note)}</div></div>`);
		}

		$$renderer.push(`<!--]--></div> <div class="ref-warning"><div class="warning-title">`);
		Icon($$renderer, { name: 'shield-alert', size: 'sm' });

		$$renderer.push(`<!----> Security Warning</div> <div class="warning-content">Many IPv4-in-IPv6 transition mechanisms have known security vulnerabilities. Disable unused mechanisms and
          monitor for unexpected embedded address patterns in your network.</div></div></div></div></div>`);
	});
}