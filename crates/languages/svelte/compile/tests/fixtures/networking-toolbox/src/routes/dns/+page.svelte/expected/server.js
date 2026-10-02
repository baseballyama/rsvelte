import * as $ from 'svelte/internal/server';
import { SUB_NAV } from '$lib/constants/nav';
import ToolsGrid from '$lib/components/global/ToolsGrid.svelte';
import '../../styles/pages.scss';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		// Extract tools for DNS section (excluding category headers with title)
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

		const dnsTools = extractNavItems(SUB_NAV['/dns'] || []);

		$$renderer.push(`<div class="page-container"><header class="page-header"><h1>DNS Tools &amp; Record Generators</h1> <p class="page-description">Professional DNS management tools for network administrators. Generate PTR records, create zone files, and manage
      reverse DNS lookups for both IPv4 and IPv6 networks.</p></header> `);

		ToolsGrid($$renderer, { tools: dnsTools });
		$$renderer.push(`<!----></div>`);
	});
}