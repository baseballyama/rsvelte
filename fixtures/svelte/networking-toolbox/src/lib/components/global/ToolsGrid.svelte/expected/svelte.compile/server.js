import * as $ from 'svelte/internal/server';
import { ALL_PAGES } from '$lib/constants/nav';
import ToolCard from './ToolCard.svelte';
import NoResults from './NoResults.svelte';

export default function ToolsGrid($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			tools = ALL_PAGES,
			searchQuery = '',
			idPrefix = 'main-',
			size = 'default'
		} = $$props;

		// Remove duplicates based on href, keeping the first occurrence
		// Also filter out items without a label
		// Properly memoized with $derived - only recomputes when tools array changes
		const uniqueTools = $.derived(() => tools.filter((tool) => tool.label).filter((tool, index, array) => array.findIndex((t) => t.href === tool.href) === index));

		// Dynamic minimum column width based on size
		const minColWidth = $.derived(() => size === 'compact' ? '140px' : size === 'small' ? '200px' : '280px');

		if (uniqueTools().length === 0 && searchQuery) {
			$$renderer.push('<!--[0-->');
			NoResults($$renderer, { searchQuery });
		} else {
			$$renderer.push(`<!--[-1--><section${$.attr_class('tools-grid svelte-1497keh', void 0, { 'compact': size === 'compact' })}${$.attr_style(`--min-col-width: ${minColWidth()};`)}><!--[-->`);

			const each_array = $.ensure_array_like(uniqueTools());

			for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
				let tool = each_array[$$index];

				ToolCard($$renderer, { tool, size });
			}

			$$renderer.push(`<!--]--></section>`);
		}

		$$renderer.push(`<!--]-->`);
	});
}