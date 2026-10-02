import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { ALL_PAGES } from '$lib/constants/nav';
import ToolCard from './ToolCard.svelte';
import NoResults from './NoResults.svelte';

var root = $.from_html(`<section></section>`);

export default function ToolsGrid($$anchor, $$props) {
	$.push($$props, true);

	let tools = $.prop($$props, 'tools', 3, ALL_PAGES),
		searchQuery = $.prop($$props, 'searchQuery', 3, ''),
		idPrefix = $.prop($$props, 'idPrefix', 3, 'main-'),
		size = $.prop($$props, 'size', 3, 'default');

	// Remove duplicates based on href, keeping the first occurrence
	// Also filter out items without a label
	// Properly memoized with $derived - only recomputes when tools array changes
	const uniqueTools = $.derived(() => tools().filter((tool) => tool.label).filter((tool, index, array) => array.findIndex((t) => t.href === tool.href) === index));

	// Dynamic minimum column width based on size
	const minColWidth = $.derived(() => size() === 'compact' ? '140px' : size() === 'small' ? '200px' : '280px');

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			NoResults($$anchor, {
				get searchQuery() {
					return searchQuery();
				}
			});
		};

		var alternate = ($$anchor) => {
			var section = root();
			let classes;

			$.each(section, 21, () => $.get(uniqueTools), (tool) => `${idPrefix()}-${tool.href.replaceAll('/', '-')}`, ($$anchor, tool) => {
				ToolCard($$anchor, {
					get tool() {
						return $.get(tool);
					},

					get size() {
						return size();
					}
				});
			});

			$.reset(section);

			$.template_effect(() => {
				classes = $.set_class(section, 1, 'tools-grid svelte-1497keh', null, classes, { compact: size() === 'compact' });
				$.set_style(section, `--min-col-width: ${$.get(minColWidth) ?? ''};`);
			});

			$.append($$anchor, section);
		};

		$.if(node, ($$render) => {
			if ($.get(uniqueTools).length === 0 && searchQuery()) $$render(consequent); else $$render(alternate, -1);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}