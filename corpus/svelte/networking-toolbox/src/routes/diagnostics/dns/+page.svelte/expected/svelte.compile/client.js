import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { SUB_NAV } from '$lib/constants/nav';
import ToolsGrid from '$lib/components/global/ToolsGrid.svelte';
import '../../../styles/pages.scss';

var root = $.from_html(`<div class="page-container"><header class="page-header"><h1>DNS Diagnostics Tools</h1> <p class="page-description">Comprehensive DNS diagnostic and troubleshooting tools for network administrators. Verify DNS propagation, analyze
      email security policies, check certificate authority authorization, and diagnose nameserver consistency issues.</p></header> <!></div>`);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	// Extract DNS diagnostics tools
	function extractNavItems(items) {
		const navItems = [];

		for (const item of items) {
			if ('href' in item) {
				navItems.push(item);
			} else if ('title' in item && 'items' in item) {
				// Filter for DNS diagnostics only
				if (item.title === 'DNS Diagnostics') {
					navItems.push(...item.items);
				}
			}
		}

		return navItems;
	}

	const dnsTools = extractNavItems(SUB_NAV['/diagnostics'] || []);
	var div = root();
	var node = $.sibling($.child(div), 2);

	ToolsGrid(node, {
		get tools() {
			return dnsTools;
		}
	});

	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}