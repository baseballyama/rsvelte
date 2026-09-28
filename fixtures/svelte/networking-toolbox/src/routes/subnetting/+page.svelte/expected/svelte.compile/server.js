import * as $ from 'svelte/internal/server';
import { SUB_NAV } from '$lib/constants/nav';
import ToolsGrid from '$lib/components/global/ToolsGrid.svelte';
import Icon from '$lib/components/global/Icon.svelte';
import { tooltip } from '$lib/actions/tooltip.js';

import {
	commonSubnetMasks,
	keyConcepts,
	subnettingTechniques,
	practicalTips,
	commonMistakes
} from '$lib/content/subnetting';

import '../../styles/pages.scss';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		// Extract tools for subnetting section
		function extractNavItems(items) {
			const navItems = [];

			for (const item of items) {
				if ('href' in item) {
					navItems.push(item);
				} else if ('title' in item && 'items' in item) {
					navItems.push(...item.items);
				}
			}

			return navItems;
		}

		const subnettingTools = extractNavItems(SUB_NAV['/subnetting'] || []);

		function formatNumber(num) {
			return num.toLocaleString();
		}

		$$renderer.push(`<div class="page-container"><header class="page-header"><h1>Subnetting Tools</h1> <p class="page-description">Divide networks efficiently, optimize address allocation, and master network design with our comprehensive
      subnetting toolkit.</p></header> `);

		ToolsGrid($$renderer, { tools: subnettingTools });

		$$renderer.push(`<!----> <hr class="section-divider"/> <h2 class="svelte-1novvv6">What's Subnetting?</h2> <section class="intro-card svelte-1novvv6"><p class="svelte-1novvv6">Subnetting is the process of splitting a large network into smaller, easier-to-manage pieces. Each subnet has its
      own network address and range of IPs, which helps organize devices, improve security, and reduce wasted addresses.
      It's core to network planning (both small home labs, or managing a large office or campus).</p> <p class="tools-intro svelte-1novvv6">These tools aim to make this easier for you, handling the math and planning for you. They calculate network and
      broadcast addresses, host ranges, and help design or summarize networks so you can focus on building, not IP
      crunching.</p></section> <section class="concepts-section svelte-1novvv6"><h2 class="svelte-1novvv6">Essential Concepts</h2> <div class="concepts-grid svelte-1novvv6"><!--[-->`);

		const each_array = $.ensure_array_like(keyConcepts);

		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let concept = each_array[$$index];

			$$renderer.push(`<div class="concept-card svelte-1novvv6"><div class="concept-header svelte-1novvv6">`);
			Icon($$renderer, { name: concept.icon, size: 'md' });
			$$renderer.push(`<!----> <h3 class="svelte-1novvv6">${$.escape(concept.title)}</h3></div> <p class="svelte-1novvv6">${$.escape(concept.description)}</p> `);

			if (concept.example) {
				$$renderer.push(`<!--[0--><code class="concept-example svelte-1novvv6">${$.escape(concept.example)}</code>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></div>`);
		}

		$$renderer.push(`<!--]--></div></section> <section class="techniques-section svelte-1novvv6"><h2 class="svelte-1novvv6">Subnetting Techniques</h2> <div class="techniques-grid svelte-1novvv6"><!--[-->`);

		const each_array_1 = $.ensure_array_like(subnettingTechniques);

		for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
			let technique = each_array_1[$$index_1];

			$$renderer.push(`<div class="technique-card svelte-1novvv6"${$.attr_style(`--accent-color: ${$.stringify(technique.color)}`)}><div class="technique-header svelte-1novvv6">`);
			Icon($$renderer, { name: technique.icon, size: 'lg' });
			$$renderer.push(`<!----> <h3 class="svelte-1novvv6">${$.escape(technique.name)}</h3></div> <p class="technique-description svelte-1novvv6">${$.escape(technique.description)}</p> <div class="technique-use-case svelte-1novvv6"><strong class="svelte-1novvv6">Best for:</strong> ${$.escape(technique.useCase)}</div></div>`);
		}

		$$renderer.push(`<!--]--></div></section> <section class="masks-section svelte-1novvv6"><h2 class="svelte-1novvv6">Common Subnet Masks</h2> <div class="masks-table-wrapper svelte-1novvv6"><table class="masks-table svelte-1novvv6"><thead><tr><th class="svelte-1novvv6">CIDR</th><th class="svelte-1novvv6">Subnet Mask</th><th class="svelte-1novvv6">Hosts</th><th class="svelte-1novvv6">Subnets</th></tr></thead><tbody><!--[-->`);

		const each_array_2 = $.ensure_array_like(commonSubnetMasks);

		for (let $$index_2 = 0, $$length = each_array_2.length; $$index_2 < $$length; $$index_2++) {
			let mask = each_array_2[$$index_2];

			$$renderer.push(`<tr class="svelte-1novvv6"><td class="cidr-cell svelte-1novvv6">/${$.escape(mask.cidr)}</td><td class="mask-cell svelte-1novvv6">${$.escape(mask.decimal)}</td><td class="hosts-cell svelte-1novvv6">${$.escape(formatNumber(mask.hosts))}</td><td class="networks-cell svelte-1novvv6">${$.escape(formatNumber(mask.networks))}</td></tr>`);
		}

		$$renderer.push(`<!--]--></tbody></table></div></section> <div class="tips-grid svelte-1novvv6"><section class="tips-card svelte-1novvv6"><div class="tips-header svelte-1novvv6">`);
		Icon($$renderer, { name: 'lightbulb', size: 'md' });
		$$renderer.push(`<!----> <h2 class="svelte-1novvv6">Best Practices</h2></div> <ul class="svelte-1novvv6"><!--[-->`);

		const each_array_3 = $.ensure_array_like(practicalTips);

		for (let $$index_3 = 0, $$length = each_array_3.length; $$index_3 < $$length; $$index_3++) {
			let tip = each_array_3[$$index_3];

			$$renderer.push(`<li class="svelte-1novvv6">${$.escape(tip)}</li>`);
		}

		$$renderer.push(`<!--]--></ul></section> <section class="mistakes-card svelte-1novvv6"><div class="mistakes-header svelte-1novvv6">`);
		Icon($$renderer, { name: 'alert-triangle', size: 'md' });
		$$renderer.push(`<!----> <h2 class="svelte-1novvv6">Common Mistakes</h2></div> <ul class="svelte-1novvv6"><!--[-->`);

		const each_array_4 = $.ensure_array_like(commonMistakes);

		for (let $$index_4 = 0, $$length = each_array_4.length; $$index_4 < $$length; $$index_4++) {
			let mistake = each_array_4[$$index_4];

			$$renderer.push(`<li class="svelte-1novvv6">${$.escape(mistake)}</li>`);
		}

		$$renderer.push(`<!--]--></ul></section></div></div>`);
	});
}