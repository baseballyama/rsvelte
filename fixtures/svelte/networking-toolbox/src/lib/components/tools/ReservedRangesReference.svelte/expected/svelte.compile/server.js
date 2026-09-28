import * as $ from 'svelte/internal/server';
import { RESERVED_RANGES } from '$lib/constants/networks.js';
import Tooltip from '$lib/components/global/Tooltip.svelte';
import _SvgIcon from '$lib/components/global/SvgIcon.svelte';
import Icon from '$lib/components/global/Icon.svelte';
import '../../styles/converters.scss';
import '../../styles/components.scss';

export default function ReservedRangesReference($$renderer) {
	$$renderer.push(`<div class="card"><header class="card-header"><h2>Reserved IP Ranges Reference</h2> <p>Special-purpose IP address ranges defined by RFCs and their intended uses.</p></header> <div class="reference-section"><!--[-->`);

	const each_array = $.ensure_array_like(Object.entries(RESERVED_RANGES));

	for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
		let [rangeName, rangeInfo] = each_array[$$index];

		Tooltip($$renderer, {
			text: `${$.stringify(rangeInfo.description)} - Defined in ${$.stringify(rangeInfo.rfc)}`,
			position: 'top',
			children: ($$renderer) => {
				$$renderer.push(`<div class="reference-card"><div class="card-header-inline"><div class="range-info"><h3 class="range-address">${$.escape(rangeInfo.range)}</h3> <span class="range-description">${$.escape(rangeInfo.description)}</span></div> <span class="rfc-badge">${$.escape(rangeInfo.rfc)}</span></div> `);

				if (rangeName.includes('PRIVATE')) {
					$$renderer.push(`<!--[0--><div class="private-notice"><strong>Private Network:</strong> Not routed on the public Internet</div>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--></div>`);
			},
			$$slots: { default: true }
		});
	}

	$$renderer.push(`<!--]--></div> <div class="explainer-card"><h3>`);
	Icon($$renderer, { name: 'info', size: 'md' });

	$$renderer.push(`<!----> Understanding Reserved IP Ranges</h3> <div class="explainer-content"><p>Reserved IP ranges serve specific purposes in networking and are defined by various RFCs (Request for Comments).
        Understanding these ranges is crucial for network planning and avoiding conflicts.</p> <div class="range-categories"><h4>Key Categories</h4> <ul><li><strong>Private Networks (RFC 1918):</strong> Used for internal networks, not routed on the Internet</li> <li><strong>Loopback (RFC 1122):</strong> Traffic that never leaves the local machine</li> <li><strong>Link-Local (RFC 3927):</strong> Automatic IP configuration when DHCP is unavailable</li> <li><strong>Multicast (RFC 3171):</strong> One-to-many communication protocols</li></ul></div></div></div></div>`);
}