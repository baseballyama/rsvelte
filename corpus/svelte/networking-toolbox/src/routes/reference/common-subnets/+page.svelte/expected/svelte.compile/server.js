import * as $ from 'svelte/internal/server';
import Tooltip from '$lib/components/global/Tooltip.svelte';
import { COMMON_SUBNETS } from '$lib/constants/networks.js';

export default function _page($$renderer) {
	$$renderer.push(`<div class="card"><header class="card-header"><h2>Common Subnets</h2> <p>Frequently used CIDR prefixes with masks, host counts, and typical usage.</p></header> <div class="subnets-table fade-in svelte-1ucf1rp"><div class="table-header svelte-1ucf1rp"><span class="svelte-1ucf1rp">CIDR</span> <span class="svelte-1ucf1rp">Subnet Mask</span> <span class="svelte-1ucf1rp">Hosts</span> <span class="svelte-1ucf1rp">Usage</span></div> <!--[-->`);

	const each_array = $.ensure_array_like(COMMON_SUBNETS);

	for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
		let subnet = each_array[$$index];

		Tooltip($$renderer, {
			text: `/${subnet.cidr} with ${subnet.mask} supports ${subnet.hosts.toLocaleString()} hosts`,
			position: 'top',
			children: ($$renderer) => {
				$$renderer.push(`<div class="table-row svelte-1ucf1rp"><span class="cidr-cell svelte-1ucf1rp">/${$.escape(subnet.cidr)}</span> <span class="mask-cell svelte-1ucf1rp">${$.escape(subnet.mask)}</span> <span class="hosts-cell svelte-1ucf1rp">${$.escape(subnet.hosts.toLocaleString())}</span> <span class="usage-cell svelte-1ucf1rp">`);

				if (subnet.cidr === 8) {
					$$renderer.push(`<!--[0-->Large ISPs`);
				} else if (subnet.cidr === 16) {
					$$renderer.push(`<!--[1-->Universities`);
				} else if (subnet.cidr === 24) {
					$$renderer.push(`<!--[2-->Small businesses`);
				} else if (subnet.cidr === 25) {
					$$renderer.push(`<!--[3-->Departments`);
				} else if (subnet.cidr === 26) {
					$$renderer.push(`<!--[4-->Teams`);
				} else if (subnet.cidr === 27) {
					$$renderer.push(`<!--[5-->Small offices`);
				} else if (subnet.cidr === 28) {
					$$renderer.push(`<!--[6-->Workgroups`);
				} else if (subnet.cidr === 29) {
					$$renderer.push(`<!--[7-->Small groups`);
				} else if (subnet.cidr === 30) {
					$$renderer.push(`<!--[8-->Point-to-point`);
				} else {
					$$renderer.push(`<!--[-1-->General use`);
				}

				$$renderer.push(`<!--]--></span></div>`);
			},
			$$slots: { default: true }
		});
	}

	$$renderer.push(`<!--]--></div></div>`);
}