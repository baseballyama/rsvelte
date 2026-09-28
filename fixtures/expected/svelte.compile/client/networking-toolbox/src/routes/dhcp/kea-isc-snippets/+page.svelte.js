import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import DHCPSnippetsGenerator from '$lib/components/tools/DHCPSnippetsGenerator.svelte';
import ToolContentContainer from '$lib/components/global/ToolContentContainer.svelte';

export default function _page($$anchor) {
	ToolContentContainer($$anchor, {
		title: 'DHCP Kea/ISC Snippets Generator',
		description: 'Generate complete subnet configurations for ISC dhcpd and Kea DHCP servers with vendor discovery options (Option 43/60), client classes, and static reservations.',
		children: ($$anchor, $$slotProps) => {
			DHCPSnippetsGenerator($$anchor, {});
		},
		$$slots: { default: true }
	});
}