import * as $ from 'svelte/internal/server';
import Tooltip from '$lib/components/global/Tooltip.svelte';
import { RESERVED_RANGES } from '$lib/constants/networks.js';

export default function _page($$renderer) {
	$$renderer.push(`<div class="card"><header class="card-header"><h2>Reserved Ranges</h2> <p>Special-purpose IPv4 ranges (loopback, private, link-local, multicast, etc.).</p></header> <div class="reference-section fade-in svelte-1yargik"><!--[-->`);

	const each_array = $.ensure_array_like(Object.entries(RESERVED_RANGES));

	for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
		let [rangeName, rangeInfo] = each_array[$$index];

		Tooltip($$renderer, {
			text: `${rangeInfo.description} — Defined in ${rangeInfo.rfc}`,
			position: 'top',
			children: ($$renderer) => {
				$$renderer.push(`<div class="reference-card svelte-1yargik"><div class="card-header-inline svelte-1yargik"><div class="range-info svelte-1yargik"><h3 class="range-address svelte-1yargik">${$.escape(rangeInfo.range)}</h3> <span class="range-description svelte-1yargik">${$.escape(rangeInfo.description)}</span></div> <span class="rfc-badge svelte-1yargik">${$.escape(rangeInfo.rfc)}</span></div> `);

				if (rangeName.includes('PRIVATE')) {
					$$renderer.push(`<!--[0--><div class="private-notice svelte-1yargik"><strong>Private Network:</strong> Not routed on the public Internet</div>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--></div>`);
			},
			$$slots: { default: true }
		});
	}

	$$renderer.push(`<!--]--></div></div>`);
}