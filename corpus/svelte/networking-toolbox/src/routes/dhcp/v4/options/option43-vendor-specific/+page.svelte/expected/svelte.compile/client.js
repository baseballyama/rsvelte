import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import DHCPOption43Generator from '$lib/components/tools/DHCPOption43Generator.svelte';
import ToolContentContainer from '$lib/components/global/ToolContentContainer.svelte';

export default function _page($$anchor) {
	ToolContentContainer($$anchor, {
		title: 'DHCP Option 43 Generator',
		description: 'Generate vendor-specific DHCP Option 43 values for wireless controller auto-discovery. Supports Cisco, Aruba, Ruckus, UniFi, and more with multiple output formats.',
		children: ($$anchor, $$slotProps) => {
			DHCPOption43Generator($$anchor, {});
		},
		$$slots: { default: true }
	});
}