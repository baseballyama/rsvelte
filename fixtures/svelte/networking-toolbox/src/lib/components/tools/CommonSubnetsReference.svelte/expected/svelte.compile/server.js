import * as $ from 'svelte/internal/server';
import { COMMON_SUBNETS } from '$lib/constants/networks.js';
import Tooltip from '$lib/components/global/Tooltip.svelte';
import SvgIcon from '$lib/components/global/SvgIcon.svelte';
import { formatNumber } from '$lib/utils/formatters';
import '../../styles/converters.scss';
import '../../styles/components.scss';

export default function CommonSubnetsReference($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		$$renderer.push(`<div class="card"><header class="card-header"><h2>Common Subnets Reference</h2> <p>Frequently used subnet configurations with CIDR notation, masks, and host counts.</p></header> <div class="subnets-table"><div class="table-header"><span>CIDR</span> <span>Subnet Mask</span> <span>Hosts</span> <span>Usage</span></div> <!--[-->`);

		const each_array = $.ensure_array_like(COMMON_SUBNETS);

		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let subnet = each_array[$$index];

			Tooltip($$renderer, {
				text: `/${$.stringify(subnet.cidr)} subnet with mask ${$.stringify(subnet.mask)} supports ${$.stringify(formatNumber(subnet.hosts))} hosts`,
				position: 'top',
				children: ($$renderer) => {
					$$renderer.push(`<div class="table-row"><span class="cidr-cell">/${$.escape(subnet.cidr)}</span> <span class="mask-cell">${$.escape(subnet.mask)}</span> <span class="hosts-cell">${$.escape(formatNumber(subnet.hosts))}</span> <span class="usage-cell">`);

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

		$$renderer.push(`<!--]--></div> <div class="explainer-card"><h3>`);
		SvgIcon($$renderer, { icon: 'bulb', size: 'md' });

		$$renderer.push(`<!----> Subnet Planning Guidelines</h3> <div class="explainer-content"><p>Choosing the right subnet size is crucial for efficient network design. Consider future growth, address
        conservation, and security requirements when planning subnets.</p> <div class="planning-tips"><h4>Planning Considerations</h4> <ul><li><strong>Future Growth:</strong> Always plan for 2-3x current requirements</li> <li><strong>VLSM:</strong> Use Variable Length Subnet Masking for efficient allocation</li> <li><strong>Security:</strong> Separate different network segments and services</li> <li><strong>Point-to-Point Links:</strong> Use /30 or /31 for WAN connections</li></ul></div></div></div></div>`);
	});
}