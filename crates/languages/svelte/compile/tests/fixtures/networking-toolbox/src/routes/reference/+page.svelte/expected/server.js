import * as $ from 'svelte/internal/server';
import { SUB_NAV } from '$lib/constants/nav';
import ToolsGrid from '$lib/components/global/ToolsGrid.svelte';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		// Extract reference pages from SUB_NAV
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

		const referencePages = extractNavItems(SUB_NAV['/reference'] || []);

		$$renderer.push(`<div class="ref-header"><h1>Networking Pocket Reference</h1> <p>Offline quick guides, cheat sheets and reference info, for networking concepts, IP addressing, and common protocols</p></div> `);
		ToolsGrid($$renderer, { tools: referencePages });
		$$renderer.push(`<!---->`);
	});
}