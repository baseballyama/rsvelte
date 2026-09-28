import * as $ from 'svelte/internal/server';
import DHCPOption43Generator from '$lib/components/tools/DHCPOption43Generator.svelte';
import ToolContentContainer from '$lib/components/global/ToolContentContainer.svelte';

export default function _page($$renderer) {
	ToolContentContainer($$renderer, {
		title: 'DHCP Option 43 Generator',
		description: 'Generate vendor-specific DHCP Option 43 values for wireless controller auto-discovery. Supports Cisco, Aruba, Ruckus, UniFi, and more with multiple output formats.',
		children: ($$renderer) => {
			DHCPOption43Generator($$renderer, {});
		},
		$$slots: { default: true }
	});
}