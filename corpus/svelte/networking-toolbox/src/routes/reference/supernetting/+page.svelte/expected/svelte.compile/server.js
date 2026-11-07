import * as $ from 'svelte/internal/server';
import { supernetContent } from '$lib/content/supernetting.js';
import Icon from '$lib/components/global/Icon.svelte';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		$$renderer.push(`<div class="page-container"><div class="ref-page"><div class="ref-header"><h1>${$.escape(supernetContent.title)}</h1> <p class="subtitle">${$.escape(supernetContent.description)}</p></div> <div class="ref-section"><h2>${$.escape(supernetContent.sections.whatIs.title)}</h2> <p>${$.escape(supernetContent.sections.whatIs.content)}</p> <div class="ref-highlight"><div class="highlight-title">`);
		Icon($$renderer, { name: 'target', size: 'sm' });
		$$renderer.push(`<!----> Main Goal</div> <div class="highlight-content">Reduce the number of routes in routing tables while maintaining connectivity to all networks.</div></div></div> <div class="ref-section"><h2>${$.escape(supernetContent.sections.requirements.title)}</h2> <p>${$.escape(supernetContent.sections.requirements.content)}</p></div> <div class="ref-section"><h2>Summarization Examples</h2> <!--[-->`);

		const each_array = $.ensure_array_like(supernetContent.examples);

		for (let exIdx = 0, $$length = each_array.length; exIdx < $$length; exIdx++) {
			let example = each_array[exIdx];

			$$renderer.push(`<div class="ref-examples"><div class="examples-title">${$.escape(example.title)}</div> <div class="example-item"><div><strong>Individual Networks:</strong></div> <!--[-->`);

			const each_array_1 = $.ensure_array_like(example.networks);

			for (let netIdx = 0, $$length = each_array_1.length; netIdx < $$length; netIdx++) {
				let network = each_array_1[netIdx];

				$$renderer.push(`<div class="example-input">${$.escape(network)}</div>`);
			}

			$$renderer.push(`<!--]--> <div class="example-arrow">↓ Summarizes to ↓</div> <div class="example-output">${$.escape(example.summary)}</div> <div class="example-description">${$.escape(example.explanation)} - ${$.escape(example.addresses)}</div></div></div>`);
		}

		$$renderer.push(`<!--]--></div> <div class="ref-section"><h2>${$.escape(supernetContent.stepByStep.title)}</h2> <ol><!--[-->`);

		const each_array_2 = $.ensure_array_like(supernetContent.stepByStep.steps);

		for (let stepIdx = 0, $$length = each_array_2.length; stepIdx < $$length; stepIdx++) {
			let step = each_array_2[stepIdx];

			$$renderer.push(`<li>${$.escape(step)}</li>`);
		}

		$$renderer.push(`<!--]--></ol></div> <div class="ref-section"><h2>${$.escape(supernetContent.binaryExample.title)}</h2> <p><strong>${$.escape(supernetContent.binaryExample.scenario)}</strong></p> <table class="ref-table"><thead><tr><th>Network</th><th>Binary Representation</th></tr></thead><tbody><!--[-->`);

		const each_array_3 = $.ensure_array_like(supernetContent.binaryExample.binary);

		for (let rowIdx = 0, $$length = each_array_3.length; rowIdx < $$length; rowIdx++) {
			let row = each_array_3[rowIdx];

			$$renderer.push(`<tr><td><code>${$.escape(row.network)}</code></td><td><code>${$.escape(row.binary)}</code></td></tr>`);
		}

		$$renderer.push(`<!--]--></tbody></table> <div class="ref-highlight"><div class="highlight-title">`);
		Icon($$renderer, { name: 'eye', size: 'sm' });
		$$renderer.push(`<!----> Analysis</div> <div class="highlight-content">${$.escape(supernetContent.binaryExample.analysis)}</div></div></div> <div class="ref-section"><h2>Benefits of Route Summarization</h2> <ul><!--[-->`);

		const each_array_4 = $.ensure_array_like(supernetContent.benefits);

		for (let benIdx = 0, $$length = each_array_4.length; benIdx < $$length; benIdx++) {
			let benefit = each_array_4[benIdx];

			$$renderer.push(`<li>${$.escape(benefit)}</li>`);
		}

		$$renderer.push(`<!--]--></ul></div> <div class="ref-section"><h2>Common Pitfalls</h2> <!--[-->`);

		const each_array_5 = $.ensure_array_like(supernetContent.pitfalls);

		for (let pitIdx = 0, $$length = each_array_5.length; pitIdx < $$length; pitIdx++) {
			let pitfall = each_array_5[pitIdx];

			$$renderer.push(`<div class="ref-warning"><div class="warning-title">`);
			Icon($$renderer, { name: 'alert-triangle', size: 'sm' });
			$$renderer.push(`<!----> ${$.escape(pitfall.title)}</div> <div class="warning-content"><p><strong>Problem:</strong> ${$.escape(pitfall.problem)}</p> <p><strong>Example:</strong> ${$.escape(pitfall.example)}</p></div></div>`);
		}

		$$renderer.push(`<!--]--></div> <div class="ref-section"><h2>Quick Reference Table</h2> <table class="ref-table"><thead><tr><th>Input Networks</th><th>Summary Prefix</th><th>Routes Saved</th></tr></thead><tbody><!--[-->`);

		const each_array_6 = $.ensure_array_like(supernetContent.quickReference);

		for (let refIdx = 0, $$length = each_array_6.length; refIdx < $$length; refIdx++) {
			let row = each_array_6[refIdx];

			$$renderer.push(`<tr><td>${$.escape(row.networks)}</td><td><code>${$.escape(row.summary)}</code></td><td>${$.escape(row.saves)}</td></tr>`);
		}

		$$renderer.push(`<!--]--></tbody></table></div></div></div>`);
	});
}