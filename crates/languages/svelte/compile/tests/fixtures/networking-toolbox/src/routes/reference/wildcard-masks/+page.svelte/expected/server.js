import * as $ from 'svelte/internal/server';
import { wildcardMasksContent } from '$lib/content/wildcard-masks.js';
import Icon from '$lib/components/global/Icon.svelte';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		$$renderer.push(`<div class="page-container"><div class="ref-page"><div class="ref-header"><h1>${$.escape(wildcardMasksContent.title)}</h1> <p class="subtitle">${$.escape(wildcardMasksContent.description)}</p></div> <div class="ref-section"><h2>${$.escape(wildcardMasksContent.sections.overview.title)}</h2> <p>${$.escape(wildcardMasksContent.sections.overview.content)}</p></div> <div class="ref-section"><h2>${$.escape(wildcardMasksContent.sections.difference.title)}</h2> <p>${$.escape(wildcardMasksContent.sections.difference.content)}</p> <div class="ref-highlight"><div class="highlight-title">`);
		Icon($$renderer, { name: 'eye', size: 'sm' });

		$$renderer.push(`<!----> Key Difference</div> <div class="highlight-content">Wildcard masks are the bitwise inverse of subnet masks. If you know one, you can calculate the other by
          subtracting from 255.255.255.255.</div></div></div> <div class="ref-section"><h2>Conversion Examples</h2> <!--[-->`);

		const each_array = $.ensure_array_like(wildcardMasksContent.conversionExamples);

		for (let exIdx = 0, $$length = each_array.length; exIdx < $$length; exIdx++) {
			let example = each_array[exIdx];

			$$renderer.push(`<div class="ref-examples"><div class="examples-title">${$.escape(example.description)}</div> <div class="example-item"><div><strong>Subnet Mask:</strong> <code>${$.escape(example.subnet)}</code></div> <div><strong>Subnet Binary:</strong> <code>${$.escape(example.subnetBinary)}</code></div> <div><strong>Wildcard Mask:</strong> <code>${$.escape(example.wildcard)}</code></div> <div><strong>Wildcard Binary:</strong> <code>${$.escape(example.wildcardBinary)}</code></div></div></div>`);
		}

		$$renderer.push(`<!--]--></div> <div class="ref-section"><h2>${$.escape(wildcardMasksContent.quickConversion.title)}</h2> <p><strong>Formula:</strong> <code>${$.escape(wildcardMasksContent.quickConversion.formula)}</code></p> <h3>Steps:</h3> <ol><!--[-->`);

		const each_array_1 = $.ensure_array_like(wildcardMasksContent.quickConversion.steps);

		for (let stepIdx = 0, $$length = each_array_1.length; stepIdx < $$length; stepIdx++) {
			let step = each_array_1[stepIdx];

			$$renderer.push(`<li>${$.escape(step)}</li>`);
		}

		$$renderer.push(`<!--]--></ol> <h3>Examples:</h3> <table class="ref-table"><thead><tr><th>Subnet Mask</th><th>Calculation</th><th>Wildcard Mask</th></tr></thead><tbody><!--[-->`);

		const each_array_2 = $.ensure_array_like(wildcardMasksContent.quickConversion.examples);

		for (let qexIdx = 0, $$length = each_array_2.length; qexIdx < $$length; qexIdx++) {
			let example = each_array_2[qexIdx];

			$$renderer.push(`<tr><td><code>${$.escape(example.subnet)}</code></td><td>${$.escape(example.calculation)}</td><td><code>${$.escape(example.wildcard)}</code></td></tr>`);
		}

		$$renderer.push(`<!--]--></tbody></table></div> <div class="ref-section"><h2>ACL Examples by Platform</h2> <!--[-->`);

		const each_array_3 = $.ensure_array_like(wildcardMasksContent.aclExamples);

		for (let pIdx = 0, $$length = each_array_3.length; pIdx < $$length; pIdx++) {
			let platform = each_array_3[pIdx];

			$$renderer.push(`<h3>${$.escape(platform.title)}</h3> <!--[-->`);

			const each_array_4 = $.ensure_array_like(platform.entries);

			for (let eIdx = 0, $$length = each_array_4.length; eIdx < $$length; eIdx++) {
				let entry = each_array_4[eIdx];

				$$renderer.push(`<div class="ref-examples"><div class="examples-title">${$.escape(entry.meaning)}</div> <div class="example-item"><div><strong>ACL Entry:</strong> <code>${$.escape(entry.acl)}</code></div> <div><strong>Explanation:</strong> ${$.escape(entry.explanation)}</div></div></div>`);
			}

			$$renderer.push(`<!--]-->`);
		}

		$$renderer.push(`<!--]--></div> <div class="ref-section"><h2>Special Cases</h2> <div class="ref-grid two-col"><!--[-->`);

		const each_array_5 = $.ensure_array_like(wildcardMasksContent.specialCases);

		for (let scIdx = 0, $$length = each_array_5.length; scIdx < $$length; scIdx++) {
			let specialCase = each_array_5[scIdx];

			$$renderer.push(`<div class="grid-item"><div class="item-title">${$.escape(specialCase.case)}</div> <div class="item-code">Wildcard: ${$.escape(specialCase.wildcard)}</div> <div class="item-description"><strong>Meaning:</strong> ${$.escape(specialCase.meaning)}<br/> <strong>Usage:</strong> ${$.escape(specialCase.usage)}</div></div>`);
		}

		$$renderer.push(`<!--]--></div></div> <div class="ref-section"><h2>Platform Differences</h2> <table class="ref-table"><thead><tr><th>Platform</th><th>Format</th><th>Example</th><th>Notes</th></tr></thead><tbody><!--[-->`);

		const each_array_6 = $.ensure_array_like(wildcardMasksContent.platformDifferences);

		for (let pdIdx = 0, $$length = each_array_6.length; pdIdx < $$length; pdIdx++) {
			let platform = each_array_6[pdIdx];

			$$renderer.push(`<tr><td><strong>${$.escape(platform.platform)}</strong></td><td><code style="font-size: 0.8em;">${$.escape(platform.format)}</code></td><td><code style="font-size: 0.8em;">${$.escape(platform.example)}</code></td><td>${$.escape(platform.notes)}</td></tr>`);
		}

		$$renderer.push(`<!--]--></tbody></table></div> <div class="ref-section"><h2>Quick Reference Table</h2> <table class="ref-table"><thead><tr><th>CIDR</th><th>Subnet Mask</th><th>Wildcard Mask</th><th>Addresses</th></tr></thead><tbody><!--[-->`);

		const each_array_7 = $.ensure_array_like(wildcardMasksContent.quickReference);

		for (let refIdx = 0, $$length = each_array_7.length; refIdx < $$length; refIdx++) {
			let row = each_array_7[refIdx];

			$$renderer.push(`<tr><td><code>${$.escape(row.prefix)}</code></td><td><code>${$.escape(row.subnet)}</code></td><td><code>${$.escape(row.wildcard)}</code></td><td>${$.escape(row.use)}</td></tr>`);
		}

		$$renderer.push(`<!--]--></tbody></table></div> <div class="ref-section"><h2>Common Mistakes</h2> <!--[-->`);

		const each_array_8 = $.ensure_array_like(wildcardMasksContent.commonMistakes);

		for (let mIdx = 0, $$length = each_array_8.length; mIdx < $$length; mIdx++) {
			let mistake = each_array_8[mIdx];

			$$renderer.push(`<div class="ref-warning"><div class="warning-title">`);
			Icon($$renderer, { name: 'alert-triangle', size: 'sm' });
			$$renderer.push(`<!----> ${$.escape(mistake.mistake)}</div> <div class="warning-content"><p><strong>Problem:</strong> ${$.escape(mistake.problem)}</p> <p><strong>Solution:</strong> ${$.escape(mistake.solution)}</p></div></div>`);
		}

		$$renderer.push(`<!--]--></div> <div class="ref-section"><h2>Tips for Success</h2> <div class="ref-examples"><div class="examples-title">Remember These</div> <!--[-->`);

		const each_array_9 = $.ensure_array_like(wildcardMasksContent.tips);

		for (let tipIdx = 0, $$length = each_array_9.length; tipIdx < $$length; tipIdx++) {
			let tip = each_array_9[tipIdx];

			$$renderer.push(`<div class="example-item"><div class="example-description">${$.escape(tip)}</div></div>`);
		}

		$$renderer.push(`<!--]--></div> <div class="ref-highlight"><div class="highlight-title">`);
		Icon($$renderer, { name: 'calculator', size: 'sm' });

		$$renderer.push(`<!----> Quick Memory Aid</div> <div class="highlight-content">Wildcard 0 = "must match exactly", Wildcard 1 = "don't care". Think of it as a mask where 0 blocks changes and
          1 allows anything.</div></div></div></div></div>`);
	});
}