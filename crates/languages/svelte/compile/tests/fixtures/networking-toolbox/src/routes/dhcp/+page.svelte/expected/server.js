import * as $ from 'svelte/internal/server';
import { SUB_NAV } from '$lib/constants/nav';
import ToolsGrid from '$lib/components/global/ToolsGrid.svelte';
import '../../styles/pages.scss';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		// Extract tools for DHCP section (excluding category headers with title)
		function extractNavItems(items) {
			const navItems = [];

			for (const item of items) {
				if ('items' in item) {
					// It's a category - extract its children recursively
					navItems.push(...extractNavItems(item.items));
				} else if ('href' in item && 'label' in item && !('title' in item)) {
					// It's a tool (has href and label but no title)
					navItems.push(item);
				}
			}

			return navItems;
		}

		const dhcpTools = extractNavItems(SUB_NAV['/dhcp'] || []);

		$$renderer.push(`<div class="page-container"><header class="page-header"><h1>DHCP Tools &amp; Option Generators</h1> <p class="page-description">DHCP configuration tools for network administrators. Generate vendor-specific options, build relay agent
      information, create class-based policies, and configure DHCP servers with complete subnet snippets.</p></header> `);

		ToolsGrid($$renderer, { tools: dhcpTools });
		$$renderer.push(`<!----></div>`);
	});
}