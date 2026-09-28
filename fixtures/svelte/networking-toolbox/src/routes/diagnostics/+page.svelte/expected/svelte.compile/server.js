import * as $ from 'svelte/internal/server';
import { SUB_NAV } from '$lib/constants/nav';
import ToolsGrid from '$lib/components/global/ToolsGrid.svelte';
import '../../styles/pages.scss';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		// Extract tools for diagnostics section
		function extractNavItems(items) {
			const navItems = [];

			for (const item of items) {
				if ('href' in item) {
					navItems.push(item);
				} else if ('title' in item && 'items' in item) {
					navItems.push(...item.items);
				}
			}

			return navItems;
		}

		const diagnosticsTools = extractNavItems(SUB_NAV['/diagnostics'] || []);

		$$renderer.push(`<div class="page-container"><header class="page-header"><h1>Network Diagnostics Tools</h1> <p class="page-description">Advanced network diagnostic tools for troubleshooting and analysis. Check DNS propagation, analyze email security
      policies, verify nameserver consistency, and diagnose network infrastructure issues.</p></header> `);

		ToolsGrid($$renderer, { tools: diagnosticsTools });
		$$renderer.push(`<!----></div>`);
	});
}