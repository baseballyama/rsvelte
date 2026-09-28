import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { onMount } from 'svelte';
import ToolsGrid from '$lib/components/global/ToolsGrid.svelte';
import Icon from '$lib/components/global/Icon.svelte';
import SegmentedControl from '$lib/components/global/SegmentedControl.svelte';
import { bookmarks } from '$lib/stores/bookmarks';
import { frequentlyUsedTools, recentlyUsedTools } from '$lib/stores/toolUsage';

var root = $.from_html(`<!> <h2>Bookmarked Tools</h2> <span class="count"> </span>`, 1);
var root_1 = $.from_html(`<!> <h2>Most Used</h2> <span class="count"> </span>`, 1);
var root_2 = $.from_html(`<!> <h2>Recent</h2> <span class="count"> </span>`, 1);
var root_3 = $.from_html(`<div class="empty-state svelte-wpabmv"><div class="empty-icon svelte-wpabmv"><!></div> <h3 class="svelte-wpabmv">No bookmarks yet</h3> <p class="svelte-wpabmv">Hover over any tool card and click the bookmark icon to save your favorites</p></div>`);
var root_4 = $.from_html(`<div class="empty-state svelte-wpabmv"><div class="empty-icon svelte-wpabmv"><!></div> <h3 class="svelte-wpabmv">No usage data yet</h3> <p class="svelte-wpabmv">Start using tools to see your most frequently used ones here</p></div>`);
var root_5 = $.from_html(`<div class="empty-state svelte-wpabmv"><div class="empty-icon svelte-wpabmv"><!></div> <h3 class="svelte-wpabmv">No recent tools</h3> <p class="svelte-wpabmv">Recently visited tools will appear here</p></div>`);
var root_6 = $.from_html(`<div class="toggle-container svelte-wpabmv"><button class="toggle-button svelte-wpabmv"> </button></div>`);
var root_7 = $.from_html(`<div class="all-tools-section svelte-wpabmv"><!></div>`);
var root_8 = $.from_html(`<div class="bookmarks-page svelte-wpabmv"><div class="bookmarks-container svelte-wpabmv" aria-live="polite"><div class="bookmarks-header svelte-wpabmv"><div class="tools-grid-sub-header"><!></div> <!></div> <div class="bookmarks-grid svelte-wpabmv"><!></div></div> <!> <!></div>`);

export default function HomepageBookmarks($$anchor, $$props) {
	$.push($$props, true);

	const $bookmarks = () => $.store_get(bookmarks, '$bookmarks', $$stores);
	const $frequentlyUsedTools = () => $.store_get(frequentlyUsedTools, '$frequentlyUsedTools', $$stores);
	const $recentlyUsedTools = () => $.store_get(recentlyUsedTools, '$recentlyUsedTools', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();

	onMount(() => {
		bookmarks.init();
	});

	let activeView = $.state('bookmarks');

	const viewOptions = [
		{ value: 'bookmarks', label: 'Bookmarks', icon: 'bookmarks' },
		{
			value: 'most-used',
			label: 'Most Used',
			icon: 'frequently-used'
		},
		{ value: 'recent', label: 'Recent', icon: 'clock' }
	];

	const bookmarkCount = $.derived(() => $bookmarks().length);
	const mostUsedCount = $.derived(() => $frequentlyUsedTools().length);
	const recentCount = $.derived(() => $recentlyUsedTools().length);
	let showAll = $.state(false);

	// Reset showAll when switching views
	$.user_effect(() => {
		// Track activeView to reset showAll when it changes
		void $.get(activeView);

		$.set(showAll, false);
	});

	// Determine if current view has items
	const hasItems = $.derived(() => () => {
		if ($.get(activeView) === 'bookmarks') return $.get(bookmarkCount) > 0;
		if ($.get(activeView) === 'most-used') return $.get(mostUsedCount) > 0;
		if ($.get(activeView) === 'recent') return $.get(recentCount) > 0;

		return false;
	});

	// Convert tool usage to NavItem format
	const mostUsedItems = $.derived(() => $frequentlyUsedTools().map((tool) => ({
		href: tool.href,
		label: tool.label || 'Tool',
		icon: tool.icon,
		description: tool.description,
		keywords: []
	})));

	const recentItems = $.derived(() => $recentlyUsedTools().map((tool) => ({
		href: tool.href,
		label: tool.label || 'Tool',
		icon: tool.icon,
		description: tool.description,
		keywords: []
	})));

	const bookmarkItems = $.derived(() => $bookmarks().map((bookmark) => ({
		href: bookmark.href,
		label: bookmark.label,
		icon: bookmark.icon,
		description: bookmark.description,
		keywords: []
	})));

	var div = root_8();
	var div_1 = $.child(div);
	var div_2 = $.child(div_1);
	var div_3 = $.child(div_2);
	var node = $.child(div_3);

	{
		var consequent = ($$anchor) => {
			var fragment = root();
			var node_1 = $.first_child(fragment);

			Icon(node_1, { name: 'bookmarks', size: 'sm' });

			var span = $.sibling(node_1, 4);
			var text = $.only_child(span, true);

			$.template_effect(() => $.set_text(text, $.get(bookmarkCount)));
			$.append($$anchor, fragment);
		};

		var consequent_1 = ($$anchor) => {
			var fragment_1 = root_1();
			var node_2 = $.first_child(fragment_1);

			Icon(node_2, { name: 'frequently-used', size: 'sm' });

			var span_1 = $.sibling(node_2, 4);
			var text_1 = $.only_child(span_1, true);

			$.template_effect(() => $.set_text(text_1, $.get(mostUsedCount)));
			$.append($$anchor, fragment_1);
		};

		var consequent_2 = ($$anchor) => {
			var fragment_2 = root_2();
			var node_3 = $.first_child(fragment_2);

			Icon(node_3, { name: 'clock', size: 'sm' });

			var span_2 = $.sibling(node_3, 4);
			var text_2 = $.only_child(span_2, true);

			$.template_effect(() => $.set_text(text_2, $.get(recentCount)));
			$.append($$anchor, fragment_2);
		};

		$.if(node, ($$render) => {
			if ($.get(activeView) === 'bookmarks') $$render(consequent); else if ($.get(activeView) === 'most-used') $$render(consequent_1, 1); else if ($.get(activeView) === 'recent') $$render(consequent_2, 2);
		});
	}

	$.reset(div_3);

	var node_4 = $.sibling(div_3, 2);

	SegmentedControl(node_4, {
		get options() {
			return viewOptions;
		},
		onchange: (value) => $.set(activeView, value, true),
		get value() {
			return $.get(activeView);
		},

		set value($$value) {
			$.set(activeView, $$value, true);
		}
	});

	$.reset(div_2);

	var div_4 = $.sibling(div_2, 2);
	var node_5 = $.child(div_4);

	{
		var consequent_4 = ($$anchor) => {
			var fragment_3 = $.comment();
			var node_6 = $.first_child(fragment_3);

			{
				var consequent_3 = ($$anchor) => {
					ToolsGrid($$anchor, {
						get tools() {
							return $.get(bookmarkItems);
						},
						idPrefix: 'bookmarks'
					});
				};

				var alternate = ($$anchor) => {
					var div_5 = root_3();
					var div_6 = $.child(div_5);
					var node_7 = $.child(div_6);

					Icon(node_7, { name: 'bookmarks', size: 'lg' });
					$.reset(div_6);
					$.next(4);
					$.reset(div_5);
					$.append($$anchor, div_5);
				};

				$.if(node_6, ($$render) => {
					if ($.get(bookmarkCount) > 0) $$render(consequent_3); else $$render(alternate, -1);
				});
			}

			$.append($$anchor, fragment_3);
		};

		var consequent_6 = ($$anchor) => {
			var fragment_5 = $.comment();
			var node_8 = $.first_child(fragment_5);

			{
				var consequent_5 = ($$anchor) => {
					ToolsGrid($$anchor, {
						get tools() {
							return $.get(mostUsedItems);
						},
						idPrefix: 'most-used'
					});
				};

				var alternate_1 = ($$anchor) => {
					var div_7 = root_4();
					var div_8 = $.child(div_7);
					var node_9 = $.child(div_8);

					Icon(node_9, { name: 'frequently-used', size: 'lg' });
					$.reset(div_8);
					$.next(4);
					$.reset(div_7);
					$.append($$anchor, div_7);
				};

				$.if(node_8, ($$render) => {
					if ($.get(mostUsedCount) > 0) $$render(consequent_5); else $$render(alternate_1, -1);
				});
			}

			$.append($$anchor, fragment_5);
		};

		var consequent_8 = ($$anchor) => {
			var fragment_7 = $.comment();
			var node_10 = $.first_child(fragment_7);

			{
				var consequent_7 = ($$anchor) => {
					ToolsGrid($$anchor, {
						get tools() {
							return $.get(recentItems);
						},
						idPrefix: 'recent'
					});
				};

				var alternate_2 = ($$anchor) => {
					var div_9 = root_5();
					var div_10 = $.child(div_9);
					var node_11 = $.child(div_10);

					Icon(node_11, { name: 'clock', size: 'lg' });
					$.reset(div_10);
					$.next(4);
					$.reset(div_9);
					$.append($$anchor, div_9);
				};

				$.if(node_10, ($$render) => {
					if ($.get(recentCount) > 0) $$render(consequent_7); else $$render(alternate_2, -1);
				});
			}

			$.append($$anchor, fragment_7);
		};

		$.if(node_5, ($$render) => {
			if ($.get(activeView) === 'bookmarks') $$render(consequent_4); else if ($.get(activeView) === 'most-used') $$render(consequent_6, 1); else if ($.get(activeView) === 'recent') $$render(consequent_8, 2);
		});
	}

	$.reset(div_4);
	$.reset(div_1);

	var node_12 = $.sibling(div_1, 2);

	{
		var consequent_9 = ($$anchor) => {
			var div_11 = root_6();
			var button = $.child(div_11);
			var text_3 = $.only_child(button, true);

			$.reset(div_11);
			$.template_effect(() => $.set_text(text_3, $.get(showAll) ? 'Hide All Tools' : 'Show All Tools'));
			$.delegated('click', button, () => $.set(showAll, !$.get(showAll)));
			$.append($$anchor, div_11);
		};

		var d = $.derived(() => $.get(hasItems)());

		$.if(node_12, ($$render) => {
			if ($.get(d)) $$render(consequent_9);
		});
	}

	var node_13 = $.sibling(node_12, 2);

	{
		var consequent_10 = ($$anchor) => {
			var div_12 = root_7();
			var node_14 = $.child(div_12);

			ToolsGrid(node_14, {});
			$.reset(div_12);
			$.append($$anchor, div_12);
		};

		var d_1 = $.derived(() => !$.get(hasItems)() || $.get(showAll));

		$.if(node_13, ($$render) => {
			if ($.get(d_1)) $$render(consequent_10);
		});
	}

	$.reset(div);
	$.append($$anchor, div);
	$.pop();
	$$cleanup();
}

$.delegate(['click']);