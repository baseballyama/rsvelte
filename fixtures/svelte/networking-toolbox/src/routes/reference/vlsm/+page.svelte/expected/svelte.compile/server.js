import * as $ from 'svelte/internal/server';
import { vlsmContent } from '$lib/content/vlsm.js';
import Icon from '$lib/components/global/Icon.svelte';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		$$renderer.push(`<div class="page-container"><div class="ref-page"><div class="ref-header"><h1>${$.escape(vlsmContent.title)}</h1> <p class="subtitle">${$.escape(vlsmContent.description)}</p></div> <div class="ref-section"><h2>${$.escape(vlsmContent.sections.whatIs.title)}</h2> <p>${$.escape(vlsmContent.sections.whatIs.content)}</p></div> <div class="ref-section"><h2>${$.escape(vlsmContent.sections.whenWhy.title)}</h2> <p>${$.escape(vlsmContent.sections.whenWhy.content)}</p> <div class="ref-highlight"><div class="highlight-title">`);
		Icon($$renderer, { name: 'lightbulb', size: 'sm' });
		$$renderer.push(`<!----> Key Benefit</div> <div class="highlight-content">VLSM prevents IP address waste by letting you create subnets that are exactly the right size for each purpose.</div></div></div> <div class="ref-section"><h2>${$.escape(vlsmContent.sections.howItWorks.title)}</h2> <p>${$.escape(vlsmContent.sections.howItWorks.content)}</p></div> <div class="ref-section"><h2>${$.escape(vlsmContent.example.title)}</h2> <p><strong>${$.escape(vlsmContent.example.scenario)}</strong></p> <div class="ref-grid two-col"><div class="grid-item"><div class="item-title">Requirements</div> <ul><!--[-->`);

		const each_array = $.ensure_array_like(vlsmContent.example.requirements);

		for (let reqIdx = 0, $$length = each_array.length; reqIdx < $$length; reqIdx++) {
			let req = each_array[reqIdx];

			$$renderer.push(`<li>${$.escape(req.name)}: ${$.escape(req.hosts)} hosts (needs ${$.escape(req.needsPrefix)})</li>`);
		}

		$$renderer.push(`<!--]--></ul></div> <div class="grid-item"><div class="item-title">VLSM Solution</div> <ul><!--[-->`);

		const each_array_1 = $.ensure_array_like(vlsmContent.example.solution);

		for (let subIdx = 0, $$length = each_array_1.length; subIdx < $$length; subIdx++) {
			let subnet = each_array_1[subIdx];

			$$renderer.push(`<li><code>${$.escape(subnet.subnet)}</code> - ${$.escape(subnet.use)} (${$.escape(subnet.hosts)})</li>`);
		}

		$$renderer.push(`<!--]--></ul></div></div></div> <div class="ref-section"><h2>Common Pitfalls and Solutions</h2> <!--[-->`);

		const each_array_2 = $.ensure_array_like(vlsmContent.pitfalls);

		for (let pitIdx = 0, $$length = each_array_2.length; pitIdx < $$length; pitIdx++) {
			let pitfall = each_array_2[pitIdx];

			$$renderer.push(`<div class="ref-warning"><div class="warning-title">`);
			Icon($$renderer, { name: 'alert-triangle', size: 'sm' });
			$$renderer.push(`<!----> ${$.escape(pitfall.title)}</div> <div class="warning-content"><p><strong>Problem:</strong> ${$.escape(pitfall.problem)}</p> <p><strong>Solution:</strong> ${$.escape(pitfall.solution)}</p></div></div>`);
		}

		$$renderer.push(`<!--]--></div> <div class="ref-section"><h2>Best Practices</h2> <ul><!--[-->`);

		const each_array_3 = $.ensure_array_like(vlsmContent.bestPractices);

		for (let pracIdx = 0, $$length = each_array_3.length; pracIdx < $$length; pracIdx++) {
			let practice = each_array_3[pracIdx];

			$$renderer.push(`<li>${$.escape(practice)}</li>`);
		}

		$$renderer.push(`<!--]--></ul></div> <div class="ref-section"><h2>Quick Tips</h2> <div class="ref-examples"><div class="examples-title">Remember These</div> <!--[-->`);

		const each_array_4 = $.ensure_array_like(vlsmContent.tips);

		for (let tipIdx = 0, $$length = each_array_4.length; tipIdx < $$length; tipIdx++) {
			let tip = each_array_4[tipIdx];

			$$renderer.push(`<div class="example-item"><div class="example-description">${$.escape(tip)}</div></div>`);
		}

		$$renderer.push(`<!--]--></div></div></div></div>`);
	});
}