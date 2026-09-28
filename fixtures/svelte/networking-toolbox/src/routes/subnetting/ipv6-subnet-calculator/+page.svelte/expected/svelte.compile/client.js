import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import IPv6SubnetCalculator from '$lib/components/tools/IPv6SubnetCalculator.svelte';
import Icon from '$lib/components/global/Icon.svelte';
import '$lib/../styles/pages.scss';

var root = $.from_html(`<div class="page-container"><!> <section class="explainer-section svelte-71v52x"><h3 class="svelte-71v52x">About IPv6 Subnetting</h3> <p><strong>IPv6 subnetting</strong> uses 128-bit addresses and hierarchical prefix-based allocation to provide virtually
      unlimited address space. Unlike IPv4, IPv6 simplifies subnet planning with:</p> <div class="benefits-grid svelte-71v52x"><div class="benefit-item svelte-71v52x"><h4 class="svelte-71v52x">Massive Address Space</h4> <p class="svelte-71v52x">128-bit addressing provides 2^128 addresses - virtually unlimited for any network</p></div> <div class="benefit-item svelte-71v52x"><h4 class="svelte-71v52x">Simplified Subnetting</h4> <p class="svelte-71v52x">Standard /64 subnets eliminate complex subnet calculations</p></div> <div class="benefit-item svelte-71v52x"><h4 class="svelte-71v52x">Hierarchical Design</h4> <p class="svelte-71v52x">Provider-independent addressing with clear network hierarchy</p></div> <div class="benefit-item svelte-71v52x"><h4 class="svelte-71v52x">No Broadcast Domain</h4> <p class="svelte-71v52x">Uses multicast instead of broadcast, improving network efficiency</p></div></div> <div class="addressing-section svelte-71v52x"><h4 class="svelte-71v52x">IPv6 Address Structure</h4> <div class="address-types-grid svelte-71v52x"><div class="address-type-item svelte-71v52x"><h5 class="svelte-71v52x">Global Unicast (2000::/3)</h5> <p class="svelte-71v52x">Internet-routable addresses for global connectivity</p></div> <div class="address-type-item svelte-71v52x"><h5 class="svelte-71v52x">Link-Local (fe80::/10)</h5> <p class="svelte-71v52x">Local network communication, automatically configured</p></div> <div class="address-type-item svelte-71v52x"><h5 class="svelte-71v52x">Unique Local (fc00::/7)</h5> <p class="svelte-71v52x">Private addresses for internal networks (like RFC 1918)</p></div> <div class="address-type-item svelte-71v52x"><h5 class="svelte-71v52x">Multicast (ff00::/8)</h5> <p class="svelte-71v52x">One-to-many communication replacing broadcast</p></div></div></div> <div class="best-practices-section svelte-71v52x"><h4 class="svelte-71v52x">IPv6 Subnetting Best Practices</h4> <div class="practices-grid svelte-71v52x"><div class="practice-item svelte-71v52x"><h5 class="svelte-71v52x">Standard /64 Subnets</h5> <p class="svelte-71v52x">Use /64 for all LAN segments to ensure SLAAC and privacy extensions work properly</p></div> <div class="practice-item svelte-71v52x"><h5 class="svelte-71v52x">Hierarchical Allocation</h5> <p class="svelte-71v52x">Plan address space hierarchically: /48 sites, /56 small sites, /64 subnets</p></div> <div class="practice-item svelte-71v52x"><h5 class="svelte-71v52x">Address Compression</h5> <p class="svelte-71v52x">Use :: notation to compress consecutive zero groups for readability</p></div> <div class="practice-item svelte-71v52x"><h5 class="svelte-71v52x">Documentation Prefix</h5> <p class="svelte-71v52x">Use 2001:db8::/32 for examples and documentation</p></div></div></div> <div class="info-box svelte-71v52x"><h4 class="svelte-71v52x"><!> IPv6 Planning Tip</h4> <p class="svelte-71v52x">IPv6's massive address space eliminates the need for complex subnetting. Focus on logical network hierarchy
        rather than conserving addresses. A single /64 subnet provides more addresses than the entire IPv4 internet.</p></div></section></div>`);

export default function _page($$anchor) {
	var div = root();
	var node = $.child(div);

	IPv6SubnetCalculator(node, {});

	var section = $.sibling(node, 2);
	var div_1 = $.sibling($.child(section), 10);
	var h4 = $.child(div_1);
	var node_1 = $.child(h4);

	Icon(node_1, { name: 'lightbulb', size: 'sm' });
	$.next();
	$.reset(h4);
	$.next(2);
	$.reset(div_1);
	$.reset(section);
	$.reset(div);
	$.append($$anchor, div);
}