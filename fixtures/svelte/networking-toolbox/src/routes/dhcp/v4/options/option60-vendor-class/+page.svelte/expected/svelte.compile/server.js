import * as $ from 'svelte/internal/server';
import DHCPOption60Builder from '$lib/components/tools/DHCPOption60Builder.svelte';
import ToolContentContainer from '$lib/components/global/ToolContentContainer.svelte';

export default function _page($$renderer) {
	ToolContentContainer($$renderer, {
		title: 'DHCP Option 60 Builder',
		description: 'Generate vendor class identifier (Option 60) configurations for class-based DHCP policies. Create server-specific configurations for ISC DHCP, Kea, Windows Server, dnsmasq, and MikroTik to route different device types to appropriate scopes and options.',
		children: ($$renderer) => {
			DHCPOption60Builder($$renderer, {});
		},
		$$slots: { default: true }
	});
}