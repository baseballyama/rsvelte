import * as $ from 'svelte/internal/server';
import IPFamilyConverter from '$lib/components/tools/IPFamilyConverter.svelte';

export default function _page($$renderer) {
	IPFamilyConverter($$renderer, {
		direction: 'ipv6-to-ipv4',
		title: 'IPv6 to IPv4 Converter',
		description: 'Extract IPv4 addresses from IPv4-mapped IPv6 addresses. This tool can identify and extract the original IPv4 address from IPv6 representations.'
	});
}