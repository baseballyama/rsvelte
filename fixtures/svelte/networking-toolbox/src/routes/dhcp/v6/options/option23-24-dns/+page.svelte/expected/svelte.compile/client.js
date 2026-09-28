import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import DHCPv6DNSBuilder from '$lib/components/tools/DHCPv6DNSBuilder.svelte';

export default function _page($$anchor) {
	DHCPv6DNSBuilder($$anchor, {});
}