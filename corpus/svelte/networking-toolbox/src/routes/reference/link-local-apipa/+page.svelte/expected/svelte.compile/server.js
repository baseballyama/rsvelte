import * as $ from 'svelte/internal/server';
import { linkLocalApipaContent } from '$lib/content/link-local-apipa.js';
import Icon from '$lib/components/global/Icon.svelte';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		$$renderer.push(`<div class="page-container"><div class="ref-page"><div class="ref-header"><h1>${$.escape(linkLocalApipaContent.title)}</h1> <p class="subtitle">${$.escape(linkLocalApipaContent.description)}</p></div> <div class="ref-section"><h2>${$.escape(linkLocalApipaContent.sections.overview.title)}</h2> <p>${$.escape(linkLocalApipaContent.sections.overview.content)}</p></div> <div class="ref-section"><h2>${$.escape(linkLocalApipaContent.apipa.title)}</h2> <div class="ref-examples"><div class="examples-title">Address Range</div> <div class="example-item"><div><strong>Network:</strong> <code>${$.escape(linkLocalApipaContent.apipa.range)}</code></div> <div><strong>Full Range:</strong> <code>${$.escape(linkLocalApipaContent.apipa.fullRange)}</code></div> <div><strong>Usable Range:</strong> <code>${$.escape(linkLocalApipaContent.apipa.usableRange)}</code></div> <div><strong>Reserved:</strong> ${$.escape(linkLocalApipaContent.apipa.reservedAddresses.join(', '))}</div></div></div> <p>${$.escape(linkLocalApipaContent.apipa.description)}</p> <h3>When APIPA is Used</h3> <ul><!--[-->`);

		const each_array = $.ensure_array_like(linkLocalApipaContent.apipa.whenUsed);

		for (let index = 0, $$length = each_array.length; index < $$length; index++) {
			let reason = each_array[index];

			$$renderer.push(`<li>${$.escape(reason)}</li>`);
		}

		$$renderer.push(`<!--]--></ul> <h3>How APIPA Works</h3> <ol><!--[-->`);

		const each_array_1 = $.ensure_array_like(linkLocalApipaContent.apipa.howItWorks);

		for (let index = 0, $$length = each_array_1.length; index < $$length; index++) {
			let step = each_array_1[index];

			$$renderer.push(`<li>${$.escape(step)}</li>`);
		}

		$$renderer.push(`<!--]--></ol> <h3>APIPA Characteristics</h3> <ul><!--[-->`);

		const each_array_2 = $.ensure_array_like(linkLocalApipaContent.apipa.characteristics);

		for (let index = 0, $$length = each_array_2.length; index < $$length; index++) {
			let characteristic = each_array_2[index];

			$$renderer.push(`<li>${$.escape(characteristic)}</li>`);
		}

		$$renderer.push(`<!--]--></ul> <h3>Troubleshooting APIPA Issues</h3> <!--[-->`);

		const each_array_3 = $.ensure_array_like(linkLocalApipaContent.apipa.troubleshooting);

		for (let index = 0, $$length = each_array_3.length; index < $$length; index++) {
			let issue = each_array_3[index];

			$$renderer.push(`<div class="ref-warning"><div class="warning-title">`);
			Icon($$renderer, { name: 'alert-triangle', size: 'sm' });
			$$renderer.push(`<!----> ${$.escape(issue.symptom)}</div> <div class="warning-content"><p><strong>Meaning:</strong> ${$.escape(issue.meaning)}</p> <p><strong>Solution:</strong> ${$.escape(issue.solution)}</p></div></div>`);
		}

		$$renderer.push(`<!--]--></div> <div class="ref-section"><h2>${$.escape(linkLocalApipaContent.ipv6LinkLocal.title)}</h2> <div class="ref-examples"><div class="examples-title">Address Range</div> <div class="example-item"><div><strong>Network:</strong> <code>${$.escape(linkLocalApipaContent.ipv6LinkLocal.range)}</code></div> <div><strong>Full Range:</strong> <code>${$.escape(linkLocalApipaContent.ipv6LinkLocal.fullRange)}</code></div> <div><strong>Common Format:</strong> <code>${$.escape(linkLocalApipaContent.ipv6LinkLocal.commonFormat)}</code></div></div></div> <p>${$.escape(linkLocalApipaContent.ipv6LinkLocal.description)}</p> <h3>Address Formation</h3> <ol><!--[-->`);

		const each_array_4 = $.ensure_array_like(linkLocalApipaContent.ipv6LinkLocal.formation);

		for (let index = 0, $$length = each_array_4.length; index < $$length; index++) {
			let step = each_array_4[index];

			$$renderer.push(`<li>${$.escape(step)}</li>`);
		}

		$$renderer.push(`<!--]--></ol> <h3>When IPv6 Link-Local is Used</h3> <ul><!--[-->`);

		const each_array_5 = $.ensure_array_like(linkLocalApipaContent.ipv6LinkLocal.whenUsed);

		for (let index = 0, $$length = each_array_5.length; index < $$length; index++) {
			let use = each_array_5[index];

			$$renderer.push(`<li>${$.escape(use)}</li>`);
		}

		$$renderer.push(`<!--]--></ul> <h3>IPv6 Link-Local Characteristics</h3> <ul><!--[-->`);

		const each_array_6 = $.ensure_array_like(linkLocalApipaContent.ipv6LinkLocal.characteristics);

		for (let index = 0, $$length = each_array_6.length; index < $$length; index++) {
			let characteristic = each_array_6[index];

			$$renderer.push(`<li>${$.escape(characteristic)}</li>`);
		}

		$$renderer.push(`<!--]--></ul> <h3>Types of IPv6 Link-Local Addresses</h3> <div class="ref-grid two-col"><!--[-->`);

		const each_array_7 = $.ensure_array_like(linkLocalApipaContent.ipv6LinkLocal.types);

		for (let index = 0, $$length = each_array_7.length; index < $$length; index++) {
			let type = each_array_7[index];

			$$renderer.push(`<div class="grid-item"><div class="item-title">${$.escape(type.type)}</div> <div class="item-description">${$.escape(type.description)}</div> <div><strong>Example:</strong> <code>${$.escape(type.example)}</code></div> <div><strong>Privacy:</strong> ${$.escape(type.privacy)}</div></div>`);
		}

		$$renderer.push(`<!--]--></div></div> <div class="ref-section"><h2>IPv4 APIPA vs IPv6 Link-Local Comparison</h2> <table class="ref-table"><thead><tr><th>Aspect</th><th>IPv4 APIPA</th><th>IPv6 Link-Local</th></tr></thead><tbody><!--[-->`);

		const each_array_8 = $.ensure_array_like(linkLocalApipaContent.comparison);

		for (let index = 0, $$length = each_array_8.length; index < $$length; index++) {
			let row = each_array_8[index];

			$$renderer.push(`<tr><td><strong>${$.escape(row.aspect)}</strong></td><td>${$.escape(row.ipv4)}</td><td>${$.escape(row.ipv6)}</td></tr>`);
		}

		$$renderer.push(`<!--]--></tbody></table></div> <div class="ref-section"><h2>Practical Examples</h2> <!--[-->`);

		const each_array_9 = $.ensure_array_like(linkLocalApipaContent.practicalExamples);

		for (let index = 0, $$length = each_array_9.length; index < $$length; index++) {
			let example = each_array_9[index];

			$$renderer.push(`<div class="ref-examples"><div class="examples-title">${$.escape(example.scenario)}</div> <div class="example-item"><div><strong>IPv4 Behavior:</strong> ${$.escape(example.ipv4Behavior)}</div> <div><strong>IPv6 Behavior:</strong> ${$.escape(example.ipv6Behavior)}</div> <div><strong>Impact:</strong> ${$.escape(example.impact)}</div></div></div>`);
		}

		$$renderer.push(`<!--]--></div> <div class="ref-section"><h2>Troubleshooting Commands</h2> <table class="ref-table"><thead><tr><th>Purpose</th><th>Windows</th><th>Linux</th><th>macOS</th></tr></thead><tbody><!--[-->`);

		const each_array_10 = $.ensure_array_like(linkLocalApipaContent.troubleshootingCommands);

		for (let index = 0, $$length = each_array_10.length; index < $$length; index++) {
			let cmd = each_array_10[index];

			$$renderer.push(`<tr><td><strong>${$.escape(cmd.purpose)}</strong></td><td><code>${$.escape(cmd.windows)}</code></td><td><code>${$.escape(cmd.linux)}</code></td><td><code>${$.escape(cmd.macOS)}</code></td></tr>`);
		}

		$$renderer.push(`<!--]--></tbody></table></div> <div class="ref-section"><h2>When to Worry</h2> <!--[-->`);

		const each_array_11 = $.ensure_array_like(linkLocalApipaContent.whenToWorry);

		for (let index = 0, $$length = each_array_11.length; index < $$length; index++) {
			let situation = each_array_11[index];

			$$renderer.push(`<div class="ref-examples"><div class="examples-title">${$.escape(situation.situation)}</div> <div class="example-item"><div><strong>Concern Level:</strong> ${$.escape(situation.concern)}</div> <div><strong>Action:</strong> ${$.escape(situation.action)}</div></div></div>`);
		}

		$$renderer.push(`<!--]--></div> <div class="ref-section"><h2>Best Practices</h2> <ul><!--[-->`);

		const each_array_12 = $.ensure_array_like(linkLocalApipaContent.bestPractices);

		for (let index = 0, $$length = each_array_12.length; index < $$length; index++) {
			let practice = each_array_12[index];

			$$renderer.push(`<li>${$.escape(practice)}</li>`);
		}

		$$renderer.push(`<!--]--></ul></div> <div class="ref-section"><h2>Common Mistakes</h2> <ul><!--[-->`);

		const each_array_13 = $.ensure_array_like(linkLocalApipaContent.commonMistakes);

		for (let index = 0, $$length = each_array_13.length; index < $$length; index++) {
			let mistake = each_array_13[index];

			$$renderer.push(`<li>${$.escape(mistake)}</li>`);
		}

		$$renderer.push(`<!--]--></ul></div> <div class="ref-section"><h2>Quick Reference</h2> <div class="ref-grid two-col"><div class="grid-item"><div class="item-title">Recognition</div> <!--[-->`);

		const each_array_14 = $.ensure_array_like(linkLocalApipaContent.quickReference.recognition);

		for (let index = 0, $$length = each_array_14.length; index < $$length; index++) {
			let item = each_array_14[index];

			$$renderer.push(`<div class="item-description">${$.escape(item)}</div>`);
		}

		$$renderer.push(`<!--]--></div> <div class="grid-item"><div class="item-title">Troubleshooting</div> <!--[-->`);

		const each_array_15 = $.ensure_array_like(linkLocalApipaContent.quickReference.troubleshooting);

		for (let index = 0, $$length = each_array_15.length; index < $$length; index++) {
			let item = each_array_15[index];

			$$renderer.push(`<div class="item-description">${$.escape(item)}</div>`);
		}

		$$renderer.push(`<!--]--></div></div> <div class="ref-highlight"><div class="highlight-title">`);
		Icon($$renderer, { name: 'key', size: 'sm' });

		$$renderer.push(`<!----> Key Difference</div> <div class="highlight-content">IPv4 APIPA (169.254.x.x) indicates a problem - DHCP failed. IPv6 link-local (fe80::) is normal and required -
          every IPv6 interface has one.</div></div></div></div></div>`);
	});
}