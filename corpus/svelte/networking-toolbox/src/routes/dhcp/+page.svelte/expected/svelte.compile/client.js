import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { SUB_NAV } from '$lib/constants/nav';
import ToolsGrid from '$lib/components/global/ToolsGrid.svelte';
import '../../styles/pages.scss';

var root = $.from_html(`<div class="page-container"><header class="page-header"><h1>DHCP Tools & Option Generators</h1> <p class="page-description">DHCP configuration tools for network administrators. Generate vendor-specific options, build relay agent
      information, create class-based policies, and configure DHCP servers with complete subnet snippets.</p></header> <!></div>`);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

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
	var div = root();
	var node = $.sibling($.child(div), 2);

	ToolsGrid(node, {
		get tools() {
			return dhcpTools;
		}
	});

	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}