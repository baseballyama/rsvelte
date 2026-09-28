import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { SUB_NAV } from '$lib/constants/nav';
import ToolsGrid from '$lib/components/global/ToolsGrid.svelte';
import '../../../styles/pages.scss';

var root = $.from_html(`<div class="page-container"><header class="page-header"><h1>DNS Record Generators</h1> <p class="page-description">Professional DNS record generation tools with built-in validation and best practices. Create bulk A/AAAA records,
      build validated CNAME chains, and plan MX configurations with proper fallback strategies.</p></header> <!></div>`);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

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
	var div = root();
	var node = $.sibling($.child(div), 2);

	ToolsGrid(node, {
		get tools() {
			return dnsGenerators;
		}
	});

	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}