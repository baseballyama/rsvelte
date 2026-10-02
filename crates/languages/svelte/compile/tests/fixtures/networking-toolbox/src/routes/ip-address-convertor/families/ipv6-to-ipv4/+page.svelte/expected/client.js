import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import IPFamilyConverter from '$lib/components/tools/IPFamilyConverter.svelte';

export default function _page($$anchor) {
	IPFamilyConverter($$anchor, {
		direction: 'ipv6-to-ipv4',
		title: 'IPv6 to IPv4 Converter',
		description: 'Extract IPv4 addresses from IPv4-mapped IPv6 addresses. This tool can identify and extract the original IPv4 address from IPv6 representations.'
	});
}