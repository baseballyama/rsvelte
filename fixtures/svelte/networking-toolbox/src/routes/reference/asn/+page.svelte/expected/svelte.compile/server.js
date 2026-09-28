import * as $ from 'svelte/internal/server';
import { asnContent } from '$lib/content/asn.js';
import Icon from '$lib/components/global/Icon.svelte';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		$$renderer.push(`<div class="page-container"><div class="ref-page"><div class="ref-header"><h1>${$.escape(asnContent.title)}</h1> <p class="subtitle">${$.escape(asnContent.description)}</p></div> <div class="ref-section"><h2>${$.escape(asnContent.sections.overview.title)}</h2> <p>${$.escape(asnContent.sections.overview.content)}</p></div> <div class="ref-section"><h2>${$.escape(asnContent.sections.asn.title)}</h2> <p>${$.escape(asnContent.sections.asn.content)}</p></div> <div class="ref-section"><h2>ASN Number Ranges</h2> <!--[-->`);

		const each_array = $.ensure_array_like(asnContent.asnTypes);

		for (let index = 0, $$length = each_array.length; index < $$length; index++) {
			let type = each_array[index];

			$$renderer.push(`<div class="ref-examples"><div class="examples-title">${$.escape(type.name)}</div> <div class="example-item"><div><strong>Range:</strong> <code>${$.escape(type.range)}</code></div> <div><strong>Description:</strong> ${$.escape(type.description)}</div> <div><strong>Usage:</strong> ${$.escape(type.usage)}</div> <div><strong>Examples:</strong></div> <!--[-->`);

			const each_array_1 = $.ensure_array_like(type.examples);

			for (let index = 0, $$length = each_array_1.length; index < $$length; index++) {
				let example = each_array_1[index];

				$$renderer.push(`<div class="example-input">${$.escape(example)}</div>`);
			}

			$$renderer.push(`<!--]--></div></div>`);
		}

		$$renderer.push(`<!--]--></div> <div class="ref-section"><h2>${$.escape(asnContent.bgpBasics.title)}</h2> <p>${$.escape(asnContent.bgpBasics.description)}</p> <h3>Key BGP Concepts</h3> <div class="ref-grid two-col"><!--[-->`);

		const each_array_2 = $.ensure_array_like(asnContent.bgpBasics.concepts);

		for (let index = 0, $$length = each_array_2.length; index < $$length; index++) {
			let concept = each_array_2[index];

			$$renderer.push(`<div class="grid-item"><div class="item-title">${$.escape(concept.term)}</div> <div class="item-description"><strong>Definition:</strong> ${$.escape(concept.definition)}<br/> <strong>Example:</strong> ${$.escape(concept.example)}</div></div>`);
		}

		$$renderer.push(`<!--]--></div> <h3>BGP Types</h3> <table class="ref-table"><thead><tr><th>Type</th><th>Description</th><th>Usage</th><th>Port</th></tr></thead><tbody><!--[-->`);

		const each_array_3 = $.ensure_array_like(asnContent.bgpBasics.types);

		for (let index = 0, $$length = each_array_3.length; index < $$length; index++) {
			let type = each_array_3[index];

			$$renderer.push(`<tr><td><strong>${$.escape(type.type)}</strong></td><td>${$.escape(type.description)}</td><td>${$.escape(type.usage)}</td><td><code>${$.escape(type.port)}</code></td></tr>`);
		}

		$$renderer.push(`<!--]--></tbody></table></div> <div class="ref-section"><h2>${$.escape(asnContent.ipToAsnMapping.title)}</h2> <p>${$.escape(asnContent.ipToAsnMapping.description)}</p> <h3>How It Works</h3> <ol><!--[-->`);

		const each_array_4 = $.ensure_array_like(asnContent.ipToAsnMapping.process);

		for (let index = 0, $$length = each_array_4.length; index < $$length; index++) {
			let step = each_array_4[index];

			$$renderer.push(`<li>${$.escape(step)}</li>`);
		}

		$$renderer.push(`<!--]--></ol> <h3>Real-World Examples</h3> <table class="ref-table"><thead><tr><th>IP Range</th><th>ASN</th><th>Organization</th><th>Description</th></tr></thead><tbody><!--[-->`);

		const each_array_5 = $.ensure_array_like(asnContent.ipToAsnMapping.examples);

		for (let index = 0, $$length = each_array_5.length; index < $$length; index++) {
			let example = each_array_5[index];

			$$renderer.push(`<tr><td><code>${$.escape(example.ipRange)}</code></td><td><code>${$.escape(example.asn)}</code></td><td><strong>${$.escape(example.organization)}</strong></td><td>${$.escape(example.description)}</td></tr>`);
		}

		$$renderer.push(`<!--]--></tbody></table></div> <div class="ref-section"><h2>${$.escape(asnContent.lookupTools.title)}</h2> <p>${$.escape(asnContent.lookupTools.description)}</p> <div class="ref-grid three-col"><!--[-->`);

		const each_array_6 = $.ensure_array_like(asnContent.lookupTools.methods);

		for (let index = 0, $$length = each_array_6.length; index < $$length; index++) {
			let method = each_array_6[index];

			$$renderer.push(`<div class="grid-item"><div class="item-title">${$.escape(method.method)}</div> <div class="item-code">${$.escape(method.command)}</div> <div class="item-description">${$.escape(method.description)}<br/> <em>${$.escape(method.example)}</em></div></div>`);
		}

		$$renderer.push(`<!--]--></div> <h3>Common Lookup Commands</h3> <div class="ref-examples"><div class="examples-title">Try These Commands</div> <!--[-->`);

		const each_array_7 = $.ensure_array_like(asnContent.lookupTools.commonCommands);

		for (let index = 0, $$length = each_array_7.length; index < $$length; index++) {
			let command = each_array_7[index];

			$$renderer.push(`<div class="example-item"><code>${$.escape(command)}</code></div>`);
		}

		$$renderer.push(`<!--]--></div></div> <div class="ref-section"><h2>Real-World AS Examples</h2> <!--[-->`);

		const each_array_8 = $.ensure_array_like(asnContent.realWorldExamples);

		for (let index = 0, $$length = each_array_8.length; index < $$length; index++) {
			let example = each_array_8[index];

			$$renderer.push(`<div class="ref-examples"><div class="examples-title">${$.escape(example.scenario)}: ${$.escape(example.asn)}</div> <div class="example-item"><div><strong>Organization:</strong> ${$.escape(example.organization)}</div> <div><strong>Role:</strong> ${$.escape(example.role)}</div> <div><strong>IP Blocks:</strong> ${$.escape(example.ipBlocks)}</div> <div><strong>Peering:</strong> ${$.escape(example.peers)}</div></div></div>`);
		}

		$$renderer.push(`<!--]--></div> <div class="ref-section"><h2>Benefits of the AS System</h2> <ul><!--[-->`);

		const each_array_9 = $.ensure_array_like(asnContent.benefits);

		for (let index = 0, $$length = each_array_9.length; index < $$length; index++) {
			let benefit = each_array_9[index];

			$$renderer.push(`<li>${$.escape(benefit)}</li>`);
		}

		$$renderer.push(`<!--]--></ul></div> <div class="ref-section"><h2>Troubleshooting with ASN Information</h2> <!--[-->`);

		const each_array_10 = $.ensure_array_like(asnContent.troubleshooting);

		for (let index = 0, $$length = each_array_10.length; index < $$length; index++) {
			let issue = each_array_10[index];

			$$renderer.push(`<div class="ref-warning"><div class="warning-title">`);
			Icon($$renderer, { name: 'help-circle', size: 'sm' });
			$$renderer.push(`<!----> ${$.escape(issue.issue)}</div> <div class="warning-content"><p><strong>Likely Cause:</strong> ${$.escape(issue.cause)}</p> <p><strong>Investigation:</strong> ${$.escape(issue.investigation)}</p> <p><strong>Solution:</strong> ${$.escape(issue.solution)}</p></div></div>`);
		}

		$$renderer.push(`<!--]--></div> <div class="ref-section"><h2>Getting Started with ASN Knowledge</h2> <!--[-->`);

		const each_array_11 = $.ensure_array_like(asnContent.gettingStarted);

		for (let index = 0, $$length = each_array_11.length; index < $$length; index++) {
			let step = each_array_11[index];

			$$renderer.push(`<div class="ref-highlight"><div class="highlight-title">`);
			Icon($$renderer, { name: 'play-circle', size: 'sm' });
			$$renderer.push(`<!----> ${$.escape(step.step)}</div> <div class="highlight-content"><p>${$.escape(step.description)}</p> <p><strong>Action:</strong> ${$.escape(step.action)}</p></div></div>`);
		}

		$$renderer.push(`<!--]--></div> <div class="ref-section"><h2>Quick Facts to Remember</h2> <div class="ref-examples"><div class="examples-title">Key Points</div> <!--[-->`);

		const each_array_12 = $.ensure_array_like(asnContent.quickFacts);

		for (let index = 0, $$length = each_array_12.length; index < $$length; index++) {
			let fact = each_array_12[index];

			$$renderer.push(`<div class="example-item"><div class="example-description">${$.escape(fact)}</div></div>`);
		}

		$$renderer.push(`<!--]--></div></div></div></div>`);
	});
}