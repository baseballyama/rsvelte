import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { SUB_NAV } from '$lib/constants/nav';
import ToolsGrid from '$lib/components/global/ToolsGrid.svelte';

var root = $.from_html(`<div class="ref-header"><h1>Networking Pocket Reference</h1> <p>Offline quick guides, cheat sheets and reference info, for networking concepts, IP addressing, and common protocols</p></div> <!>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

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
	var fragment = root();
	var node = $.sibling($.first_child(fragment), 2);

	ToolsGrid(node, {
		get tools() {
			return referencePages;
		}
	});

	$.append($$anchor, fragment);
	$.pop();
}