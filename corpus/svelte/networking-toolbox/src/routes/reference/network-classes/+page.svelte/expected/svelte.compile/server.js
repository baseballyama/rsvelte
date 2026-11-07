import * as $ from 'svelte/internal/server';
import Tooltip from '$lib/components/global/Tooltip.svelte';
import { NETWORK_CLASSES } from '$lib/constants/networks.js';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		$$renderer.push(`<div class="card"><header class="card-header"><h2>Network Classes</h2> <p>Class A/B/C overview with default masks, ranges, and typical usage.</p></header> <div class="reference-section fade-in svelte-8i5au"><!--[-->`);

		const each_array = $.ensure_array_like(Object.entries(NETWORK_CLASSES));

		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let [className, classInfo] = each_array[$$index];

			Tooltip($$renderer, {
				text: `Class ${className} networks use ${classInfo.defaultMask} (/${classInfo.cidr}) and cover ${classInfo.range}`,
				position: 'top',
				children: ($$renderer) => {
					$$renderer.push(`<div class="reference-card svelte-8i5au"><div class="card-header-inline svelte-8i5au"><div class="class-info svelte-8i5au"><div${$.attr_class(`class-badge ${$.stringify(className.toLowerCase())}`, 'svelte-8i5au')}>${$.escape(className)}</div> <div class="class-details svelte-8i5au"><h3 class="svelte-8i5au">Class ${$.escape(className)}</h3> <span class="mask-info svelte-8i5au">${$.escape(classInfo.defaultMask)} (/${$.escape(classInfo.cidr)})</span></div></div> <span class="range-badge svelte-8i5au">${$.escape(classInfo.range.split(' - ')[0])} - ${$.escape(classInfo.range.split(' - ')[1])}</span></div> <p class="class-description svelte-8i5au">${$.escape(classInfo.description)}</p> <p class="usage-info svelte-8i5au"><strong>Typical Usage:</strong> ${$.escape(classInfo.usage)}</p></div>`);
				},
				$$slots: { default: true }
			});
		}

		$$renderer.push(`<!--]--></div></div>`);
	});
}