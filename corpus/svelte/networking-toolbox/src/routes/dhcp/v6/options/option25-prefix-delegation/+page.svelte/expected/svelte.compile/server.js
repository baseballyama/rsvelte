import * as $ from 'svelte/internal/server';
import PrefixDelegation from '$lib/components/tools/PrefixDelegation.svelte';

export default function _page($$renderer) {
	$.head('125sck7', $$renderer, ($$renderer) => {
		$$renderer.title(($$renderer) => {
			$$renderer.push(`<title>DHCPv6 Prefix Delegation (IA_PD) - Options 25/26 | IP Calc</title>`);
		});

		$$renderer.push(`<meta name="description" content="Build DHCPv6 IA_PD options for delegating IPv6 prefixes to requesting routers. Configure Identity Association for Prefix Delegation (Option 25) with IA Prefix options (Option 26) per RFC 8415."/> <meta name="keywords" content="dhcpv6, prefix delegation, ia_pd, option 25, option 26, ipv6, rfc 8415, router, prefix, subnet delegation, isp, kea, isc"/>`);
	});

	PrefixDelegation($$renderer, {});
}