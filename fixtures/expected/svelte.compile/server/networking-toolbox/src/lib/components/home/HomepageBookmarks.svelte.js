import * as $ from 'svelte/internal/server';
import { onMount } from 'svelte';
import ToolsGrid from '$lib/components/global/ToolsGrid.svelte';
import Icon from '$lib/components/global/Icon.svelte';
import SegmentedControl from '$lib/components/global/SegmentedControl.svelte';
import { bookmarks } from '$lib/stores/bookmarks';
import { frequentlyUsedTools, recentlyUsedTools } from '$lib/stores/toolUsage';

export default function HomepageBookmarks($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;

		onMount(() => {
			bookmarks.init();
		});

		let activeView = 'bookmarks';

		const viewOptions = [
			{ value: 'bookmarks', label: 'Bookmarks', icon: 'bookmarks' },
			{
				value: 'most-used',
				label: 'Most Used',
				icon: 'frequently-used'
			},
			{ value: 'recent', label: 'Recent', icon: 'clock' }
		];

		const bookmarkCount = $.derived(() => $.store_get($$store_subs ??= {}, '$bookmarks', bookmarks).length);
		const mostUsedCount = $.derived(() => $.store_get($$store_subs ??= {}, '$frequentlyUsedTools', frequentlyUsedTools).length);
		const recentCount = $.derived(() => $.store_get($$store_subs ??= {}, '$recentlyUsedTools', recentlyUsedTools).length);
		let showAll = false;

		// Reset showAll when switching views
		// Track activeView to reset showAll when it changes
		// Determine if current view has items
		const hasItems = $.derived(() => () => {
			if (activeView === 'bookmarks') return bookmarkCount() > 0;
			if (activeView === 'most-used') return mostUsedCount() > 0;
			if (activeView === 'recent') return recentCount() > 0;

			return false;
		});

		// Convert tool usage to NavItem format
		const mostUsedItems = $.derived(() => $.store_get($$store_subs ??= {}, '$frequentlyUsedTools', frequentlyUsedTools).map((tool) => ({
			href: tool.href,
			label: tool.label || 'Tool',
			icon: tool.icon,
			description: tool.description,
			keywords: []
		})));

		const recentItems = $.derived(() => $.store_get($$store_subs ??= {}, '$recentlyUsedTools', recentlyUsedTools).map((tool) => ({
			href: tool.href,
			label: tool.label || 'Tool',
			icon: tool.icon,
			description: tool.description,
			keywords: []
		})));

		const bookmarkItems = $.derived(() => $.store_get($$store_subs ??= {}, '$bookmarks', bookmarks).map((bookmark) => ({
			href: bookmark.href,
			label: bookmark.label,
			icon: bookmark.icon,
			description: bookmark.description,
			keywords: []
		})));

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$$renderer.push(`<div class="bookmarks-page svelte-wpabmv"><div class="bookmarks-container svelte-wpabmv" aria-live="polite"><div class="bookmarks-header svelte-wpabmv"><div class="tools-grid-sub-header">`);

			if (activeView === 'bookmarks') {
				$$renderer.push('<!--[0-->');
				Icon($$renderer, { name: 'bookmarks', size: 'sm' });
				$$renderer.push(`<!----> <h2>Bookmarked Tools</h2> <span class="count">${$.escape(bookmarkCount())}</span>`);
			} else if (activeView === 'most-used') {
				$$renderer.push('<!--[1-->');
				Icon($$renderer, { name: 'frequently-used', size: 'sm' });
				$$renderer.push(`<!----> <h2>Most Used</h2> <span class="count">${$.escape(mostUsedCount())}</span>`);
			} else if (activeView === 'recent') {
				$$renderer.push('<!--[2-->');
				Icon($$renderer, { name: 'clock', size: 'sm' });
				$$renderer.push(`<!----> <h2>Recent</h2> <span class="count">${$.escape(recentCount())}</span>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></div> `);

			SegmentedControl($$renderer, {
				options: viewOptions,
				onchange: (value) => activeView = value,
				get value() {
					return activeView;
				},

				set value($$value) {
					activeView = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----></div> <div class="bookmarks-grid svelte-wpabmv">`);

			if (activeView === 'bookmarks') {
				$$renderer.push('<!--[0-->');

				if (bookmarkCount() > 0) {
					$$renderer.push('<!--[0-->');
					ToolsGrid($$renderer, { tools: bookmarkItems(), idPrefix: 'bookmarks' });
				} else {
					$$renderer.push(`<!--[-1--><div class="empty-state svelte-wpabmv"><div class="empty-icon svelte-wpabmv">`);
					Icon($$renderer, { name: 'bookmarks', size: 'lg' });
					$$renderer.push(`<!----></div> <h3 class="svelte-wpabmv">No bookmarks yet</h3> <p class="svelte-wpabmv">Hover over any tool card and click the bookmark icon to save your favorites</p></div>`);
				}

				$$renderer.push(`<!--]-->`);
			} else if (activeView === 'most-used') {
				$$renderer.push('<!--[1-->');

				if (mostUsedCount() > 0) {
					$$renderer.push('<!--[0-->');
					ToolsGrid($$renderer, { tools: mostUsedItems(), idPrefix: 'most-used' });
				} else {
					$$renderer.push(`<!--[-1--><div class="empty-state svelte-wpabmv"><div class="empty-icon svelte-wpabmv">`);
					Icon($$renderer, { name: 'frequently-used', size: 'lg' });
					$$renderer.push(`<!----></div> <h3 class="svelte-wpabmv">No usage data yet</h3> <p class="svelte-wpabmv">Start using tools to see your most frequently used ones here</p></div>`);
				}

				$$renderer.push(`<!--]-->`);
			} else if (activeView === 'recent') {
				$$renderer.push('<!--[2-->');

				if (recentCount() > 0) {
					$$renderer.push('<!--[0-->');
					ToolsGrid($$renderer, { tools: recentItems(), idPrefix: 'recent' });
				} else {
					$$renderer.push(`<!--[-1--><div class="empty-state svelte-wpabmv"><div class="empty-icon svelte-wpabmv">`);
					Icon($$renderer, { name: 'clock', size: 'lg' });
					$$renderer.push(`<!----></div> <h3 class="svelte-wpabmv">No recent tools</h3> <p class="svelte-wpabmv">Recently visited tools will appear here</p></div>`);
				}

				$$renderer.push(`<!--]-->`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></div></div> `);

			if (hasItems()()) {
				$$renderer.push(`<!--[0--><div class="toggle-container svelte-wpabmv"><button class="toggle-button svelte-wpabmv">${$.escape(showAll ? 'Hide All Tools' : 'Show All Tools')}</button></div>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> `);

			if (!hasItems()() || showAll) {
				$$renderer.push(`<!--[0--><div class="all-tools-section svelte-wpabmv">`);
				ToolsGrid($$renderer, {});
				$$renderer.push(`<!----></div>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></div>`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}