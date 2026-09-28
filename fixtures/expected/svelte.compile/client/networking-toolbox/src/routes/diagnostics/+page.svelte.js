import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { SUB_NAV } from '$lib/constants/nav';
import ToolsGrid from '$lib/components/global/ToolsGrid.svelte';
import '../../styles/pages.scss';

var root = $.from_html(`<div class="page-container"><header class="page-header"><h1>Network Diagnostics Tools</h1> <p class="page-description">Advanced network diagnostic tools for troubleshooting and analysis. Check DNS propagation, analyze email security
      policies, verify nameserver consistency, and diagnose network infrastructure issues.</p></header> <!></div>`);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

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
	var div = root();
	var node = $.sibling($.child(div), 2);

	ToolsGrid(node, {
		get tools() {
			return diagnosticsTools;
		}
	});

	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}