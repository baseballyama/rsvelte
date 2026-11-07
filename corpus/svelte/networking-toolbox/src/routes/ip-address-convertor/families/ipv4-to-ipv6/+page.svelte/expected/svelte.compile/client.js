import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import IPFamilyConverter from '$lib/components/tools/IPFamilyConverter.svelte';

export default function _page($$anchor) {
	IPFamilyConverter($$anchor, {
		direction: 'ipv4-to-ipv6',
		title: 'IPv4 to IPv6 Converter',
		description: 'Convert IPv4 addresses to IPv6 format using IPv4-mapped IPv6 addressing. This creates IPv6 addresses that embed IPv4 addresses for compatibility purposes.'
	});
}