import * as $ from 'svelte/internal/server';
import DHCPv6DNSBuilder from '$lib/components/tools/DHCPv6DNSBuilder.svelte';

export default function _page($$renderer) {
	DHCPv6DNSBuilder($$renderer, {});
}