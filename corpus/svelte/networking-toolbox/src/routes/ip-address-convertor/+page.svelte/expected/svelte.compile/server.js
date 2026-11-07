import * as $ from 'svelte/internal/server';
import { SUB_NAV } from '$lib/constants/nav';
import ToolsGrid from '$lib/components/global/ToolsGrid.svelte';
import '../../styles/pages.scss';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		// Extract tools for IP address converter section
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

		const ipTools = extractNavItems(SUB_NAV['/ip-address-convertor'] || []);

		$$renderer.push(`<div class="page-container"><header class="page-header"><h1>IP Address Tools &amp; Converters</h1> <p class="page-description">Comprehensive IP address manipulation tools for IPv4 and IPv6. Convert between formats, calculate distances,
      generate addresses, and work with advanced IPv6 features.</p></header> `);

		ToolsGrid($$renderer, { tools: ipTools });
		$$renderer.push(`<!----></div>`);
	});
}