import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { SUB_NAV } from '$lib/constants/nav';
import ToolsGrid from '$lib/components/global/ToolsGrid.svelte';
import '../../styles/pages.scss';

var root = $.from_html(`<div class="page-container"><header class="page-header"><h1>IP Address Tools & Converters</h1> <p class="page-description">Comprehensive IP address manipulation tools for IPv4 and IPv6. Convert between formats, calculate distances,
      generate addresses, and work with advanced IPv6 features.</p></header> <!></div>`);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

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
	var div = root();
	var node = $.sibling($.child(div), 2);

	ToolsGrid(node, {
		get tools() {
			return ipTools;
		}
	});

	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}