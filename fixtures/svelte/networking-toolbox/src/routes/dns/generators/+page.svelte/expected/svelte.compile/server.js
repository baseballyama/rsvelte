import * as $ from 'svelte/internal/server';
import { SUB_NAV } from '$lib/constants/nav';
import ToolsGrid from '$lib/components/global/ToolsGrid.svelte';
import '../../../styles/pages.scss';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
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

		const dnsGenerators = extractNavItems((SUB_NAV['/dns']?.find((section) => 'title' in section && section.title === 'Record Generators'))?.items || []);

		$$renderer.push(`<div class="page-container"><header class="page-header"><h1>DNS Record Generators</h1> <p class="page-description">Professional DNS record generation tools with built-in validation and best practices. Create bulk A/AAAA records,
      build validated CNAME chains, and plan MX configurations with proper fallback strategies.</p></header> `);

		ToolsGrid($$renderer, { tools: dnsGenerators });
		$$renderer.push(`<!----></div>`);
	});
}