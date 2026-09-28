import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

import {
	IconBolt,
	IconCalendar,
	IconClock,
	IconLoader2,
	IconSearch,
	IconTag,
	IconX
} from '@tabler/icons-svelte';

import { useOverlayScrollbars } from 'overlayscrollbars-svelte';
import { browser } from '$app/environment';
import { s } from '$lib/client/localization.svelte';
import { features } from '$lib/config/features';
import 'overlayscrollbars/overlayscrollbars.css';
import { slide } from 'svelte/transition';

var root = $.from_html(`<div class="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400"><!> </div>`);
var root_1 = $.from_html(` <span class="font-medium"> </span>`, 1);
var root_2 = $.from_html(`<div class="text-sm text-gray-600 dark:text-gray-400"><!> <!></div>`);
var root_3 = $.from_html(`<div class="text-xs text-amber-600 dark:text-amber-400"> </div>`);
var root_4 = $.from_html(`<div class="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400"><!> </div>`);
var root_5 = $.from_html(`<div class="flex items-center gap-1 text-xs text-green-600 dark:text-green-400"><!> </div>`);
var root_6 = $.from_html(`<div><div><!></div> <div class="flex-1"><div class="font-medium text-sm text-gray-900 dark:text-gray-100"> </div> <div class="text-xs text-gray-600 dark:text-gray-400 mt-1"> </div></div></div>`);
var root_7 = $.from_html(`<div class="absolute inset-0 bg-gray-600 dark:bg-gray-300 rounded-full animate-fill-progress svelte-1hmd7l3"></div>`);
var root_8 = $.from_html(`<div class="absolute inset-0 bg-gray-600 dark:bg-gray-300 rounded-full"></div>`);
var root_9 = $.from_html(`<button><!></button>`);
var root_10 = $.from_html(`<div><div class="flex items-center justify-between mb-3"><div class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"> </div> <button class="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors" aria-label="Dismiss filter tips"><!></button></div> <div class="relative h-20 overflow-hidden"></div> <div class="flex justify-center gap-1.5 mt-3"></div></div>`);
var root_11 = $.from_html(`<div class="flex items-center justify-center min-h-full p-8"><div class="w-full max-w-md"><div class="text-center mb-6"><img src="/doggo_default.svg" alt="Search mascot" class="size-40 mx-auto mb-4 transition-all duration-200"/> <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2"> </h3> <p class="text-sm text-gray-600 dark:text-gray-400"> </p></div> <!></div></div>`);
var root_12 = $.from_html(`<span class="text-lg mt-0.5"> </span>`);
var root_13 = $.from_html(`<p class="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 svelte-1hmd7l3" dir="auto"></p>`);
var root_14 = $.from_html(`<span class="mx-2">•</span>`);
var root_15 = $.from_html(`<span dir="auto"> </span> <!>`, 1);
var root_16 = $.from_html(`<span> </span> <!>`, 1);
var root_17 = $.from_html(`<span> </span>`);
var root_18 = $.from_html(`<button type="button"><div class="flex flex-col gap-2"><div class="flex items-start justify-between gap-2"><div class="flex items-start gap-2 flex-1"><!> <h3 class="font-semibold text-gray-900 dark:text-white line-clamp-2 flex-1 svelte-1hmd7l3" dir="auto"></h3></div> <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 shrink-0" dir="auto"> </span></div> <!> <div class="flex items-center text-xs text-gray-500 dark:text-gray-400"><!> <!> <!></div></div></button>`);
var root_19 = $.from_html(`<div class="flex items-center justify-center gap-2 text-sm text-gray-600 dark:text-gray-400"><!> </div>`);
var root_20 = $.from_html(`<button class="px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"> </button> <div class="mt-1 text-xs text-gray-500 dark:text-gray-400"> </div>`, 1);
var root_21 = $.from_html(`<div class="p-4 text-center bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700"><!></div>`);
var root_22 = $.from_html(`<!> <!>`, 1);
var root_23 = $.from_html(`<div class="text-sm text-gray-400 dark:text-gray-500 space-y-1"><p> </p> <div class="flex flex-wrap gap-2 justify-center"><code class="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">category:World</code> <code class="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">from:yesterday</code> <code class="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">to:today</code></div></div>`);
var root_24 = $.from_html(`<div class="flex items-center justify-center min-h-full p-8"><div class="text-center"><div class="mx-auto size-12 text-gray-400 dark:text-gray-500 mb-4 flex items-center justify-center"><!></div> <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2"> </h3> <p class="text-gray-500 dark:text-gray-400 mb-4 max-w-sm"><!></p> <!></div></div>`);
var root_25 = $.from_html(`<div class="flex-1 overflow-hidden flex flex-col"><div class="px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50"><div class="flex items-center justify-between h-6"><div class="flex-1"><!></div> <!></div></div> <div class="flex-1 min-h-0" data-overlayscrollbars-initialize=""><!></div></div>`);

export default function SearchResults($$anchor, $$props) {
	$.push($$props, true);

	let isLoadingMore = $.prop($$props, 'isLoadingMore', 3, false),
		hasMore = $.prop($$props, 'hasMore', 3, false),
		localCount = $.prop($$props, 'localCount', 3, 0),
		historicalCount = $.prop($$props, 'historicalCount', 3, 0);

	let resultsContainer = $.state(null);
	let lastSelectedIndex = $.state(0);
	let currentFilterTip = $.state(0);
	let showFilterTips = $.state(true);
	let autoRotate = $.state(true);
	let animateTransition = $.state(false);

	// Check localStorage for filter tips preference (only if feature is enabled)
	$.user_effect(() => {
		if (browser && features.historicalSearch) {
			const hidden = localStorage.getItem('hideSearchFilterTips');

			$.set(showFilterTips, hidden !== 'true');
		} else {
			$.set(showFilterTips, false);
		}
	});

	function dismissFilterTips() {
		$.set(animateTransition, true);
		$.set(showFilterTips, false);

		if (browser) {
			localStorage.setItem('hideSearchFilterTips', 'true');
		}
	}

	function selectFilterTip(index) {
		$.set(currentFilterTip, index, true);
		$.set(autoRotate, false // Stop auto-rotation when user manually selects
		);
	}

	// Filter tips data
	const filterTips = [
		{
			icon: IconTag,
			color: 'text-blue-500 dark:text-blue-400',
			title: 'category:',
			hint: 'search.filter_category_hint',
			defaultHint: 'Filter by news category (e.g., category:Technology)'
		},

		{
			icon: IconCalendar,
			color: 'text-green-500 dark:text-green-400',
			title: 'from: / to:',
			hint: 'search.filter_date_hint',
			defaultHint: 'Search within a date range (e.g., from:2025-01-01 to:today)'
		},

		{
			icon: IconBolt,
			color: 'text-purple-500 dark:text-purple-400',
			title: s('search.shortcuts_title') || 'Quick shortcuts',
			hint: 'search.shortcuts_hint',
			defaultHint: 'Type "cat" for categories, dates like "yesterday" or "last week"'
		}
	];

	// Rotate filter tips every 3 seconds (only if auto-rotate is enabled)
	$.user_effect(() => {
		if (!$$props.query && $$props.results.length === 0 && $.get(showFilterTips) && $.get(autoRotate)) {
			const interval = setInterval(
				() => {
					$.set(currentFilterTip, ($.get(currentFilterTip) + 1) % filterTips.length);
				},
				3000
			);

			return () => clearInterval(interval);
		}
	});

	// Reset auto-rotate when modal reopens (detected by query being empty)
	$.user_effect(() => {
		if (!$$props.query && $$props.results.length === 0) {
			$.set(autoRotate, true);
		}
	});

	// OverlayScrollbars setup
	const [initialize] = useOverlayScrollbars({
		defer: true,
		options: {
			scrollbars: { autoHide: 'scroll', theme: 'os-theme-dark os-theme-light' }
		}
	});

	// Initialize OverlayScrollbars on the results container
	$.user_effect(() => {
		if ($.get(resultsContainer)) {
			initialize($.get(resultsContainer));
		}
	});

	// Auto-scroll when selection changes
	$.user_effect(() => {
		if ($$props.selectedIndex >= 0) {
			scrollToSelected();
		}
	});

	// Scroll selected result into view, keeping one extra item visible in scroll direction
	function scrollToSelected() {
		if ($.get(resultsContainer) && $$props.results.length > 0) {
			const buttons = $.get(resultsContainer).querySelectorAll('button');

			// Determine scroll direction
			const scrollingDown = $$props.selectedIndex > $.get(lastSelectedIndex);

			const scrollingUp = $$props.selectedIndex < $.get(lastSelectedIndex);

			// Determine which element to scroll to
			let targetIndex = $$props.selectedIndex;

			// When scrolling down, ensure the next item is visible
			if (scrollingDown && $$props.selectedIndex < buttons.length - 1) {
				targetIndex = $$props.selectedIndex + 1;
			} else // When scrolling up, ensure the previous item is visible
			if (scrollingUp && $$props.selectedIndex > 0) {
				targetIndex = $$props.selectedIndex - 1;
			}

			// Scroll the target element into view
			const targetElement = buttons[targetIndex];

			if (targetElement) {
				targetElement.scrollIntoView({ behavior: 'instant', block: 'nearest' });
			}

			// Update last index
			$.set(lastSelectedIndex, $$props.selectedIndex, true);
		}
	}

	function handleResultClick(result) {
		$$props.onSelectResult(result);
	}

	function handleResultKeyDown(event, result) {
		if (event.key === 'Enter' || event.key === ' ') {
			event.preventDefault();
			$$props.onSelectResult(result);
		}
	}

	// Check if a date is today
	function isToday(dateString) {
		const date = new Date(dateString);
		const today = new Date();

		return date.getFullYear() === today.getFullYear() && date.getMonth() === today.getMonth() && date.getDate() === today.getDate();
	}

	// Highlight search query matches in text
	function highlightMatch(text, query) {
		if (!query || !text) return text;

		// Simple case-insensitive string matching without regex
		const lowerText = text.toLowerCase();

		const lowerQuery = query.toLowerCase();
		let result = '';
		let lastIndex = 0;
		let index = lowerText.indexOf(lowerQuery);

		while (index !== -1) {
			// Add text before match
			result += text.slice(lastIndex, index);

			// Add highlighted match
			result += '<mark class="bg-yellow-200 dark:bg-yellow-800">' + text.slice(index, index + query.length) + '</mark>';

			lastIndex = index + query.length;
			index = lowerText.indexOf(lowerQuery, lastIndex);
		}

		// Add remaining text
		result += text.slice(lastIndex);

		return result;
	}

	// Remove citation markers from text
	function removeCitations(text) {
		if (!text) return text;

		return text.replace(/\[[^\]]+\]/g, '').// Remove anything in square brackets
		replace(/\s+/g, ' ').// Normalize whitespace
		trim();
	}

	// Create highlighted snippet
	function getSnippetWithHighlight(text, query, maxLength = 150) {
		const cleanText = removeCitations(text);

		if (!query) {
			return cleanText.slice(0, maxLength) + (cleanText.length > maxLength ? '...' : '');
		}

		const lowerText = cleanText.toLowerCase();
		const lowerQuery = query.toLowerCase();
		const queryIndex = lowerText.indexOf(lowerQuery);
		let snippet = '';

		if (queryIndex === -1) {
			// No match, just return beginning
			snippet = cleanText.slice(0, maxLength);
		} else {
			// Found match, center around it
			let start = Math.max(0, queryIndex - 50);

			let end = Math.min(cleanText.length, queryIndex + query.length + 100);

			// Adjust to word boundaries
			if (start > 0) {
				const spaceIndex = cleanText.indexOf(' ', start);

				if (spaceIndex > 0 && spaceIndex < start + 20) start = spaceIndex;
			}

			if (end < cleanText.length) {
				const spaceIndex = cleanText.indexOf(' ', end);

				if (spaceIndex > 0 && spaceIndex < end + 20) end = spaceIndex;
			}

			snippet = cleanText.slice(start, end);

			// Add ellipsis
			if (start > 0) snippet = `...${snippet}`;

			if (end < cleanText.length) snippet = `${snippet}...`;
		}

		// Highlight the match
		return highlightMatch(snippet, query);
	}

	var $$exports = { scrollToSelected };
	var div = root_25();
	var div_1 = $.child(div);
	var div_2 = $.child(div_1);
	var div_3 = $.child(div_2);
	var node = $.child(div_3);

	{
		var consequent = ($$anchor) => {
			var div_4 = root();
			var node_1 = $.child(div_4);

			IconLoader2(node_1, { class: 'size-4 text-blue-500 animate-spin' });

			var text_1 = $.sibling(node_1);

			$.reset(div_4);
			$.template_effect(($0) => $.set_text(text_1, ` ${$0 ?? ''}`), [() => s("search.searching") || "Searching..."]);
			$.append($$anchor, div_4);
		};

		var consequent_3 = ($$anchor) => {
			var div_5 = root_2();
			var node_2 = $.child(div_5);

			{
				var consequent_1 = ($$anchor) => {
					var text_2 = $.text();

					$.template_effect(
						($0, $1, $2) => $.set_text(text_2, `${$0 ?? ''}
              ${$$props.results.length ?? ''}
              ${$1 ?? ''}
              ${$$props.totalCount ?? ''}
              ${$2 ?? ''}`),
						[
							() => s("search.showing") || "Showing",
							() => s("search.of") || "of",
							() => $$props.totalCount === 1
								? s("search.result_single") || "result"
								: s("search.result_plural") || "results"
						]
					);

					$.append($$anchor, text_2);
				};

				var alternate = ($$anchor) => {
					var text_3 = $.text();

					$.template_effect(
						($0) => $.set_text(text_3, `${$$props.results.length ?? ''}
              ${$0 ?? ''}`),
						[
							() => $$props.results.length === 1
								? s("search.result_single") || "result"
								: s("search.result_plural") || "results"
						]
					);

					$.append($$anchor, text_3);
				};

				$.if(node_2, ($$render) => {
					if ($$props.totalCount > $$props.results.length) $$render(consequent_1); else $$render(alternate, -1);
				});
			}

			var node_3 = $.sibling(node_2, 2);

			{
				var consequent_2 = ($$anchor) => {
					var fragment_2 = root_1();
					var text_4 = $.first_child(fragment_2);
					var span = $.sibling(text_4);
					var text_5 = $.only_child(span);

					$.template_effect(
						($0) => {
							$.set_text(text_4, `${$0 ?? ''} `);
							$.set_text(text_5, `"${$$props.query ?? ''}"`);
						},
						[() => s("search.for") || "for"]
					);

					$.append($$anchor, fragment_2);
				};

				$.if(node_3, ($$render) => {
					if ($$props.query) $$render(consequent_2);
				});
			}

			$.reset(div_5);
			$.append($$anchor, div_5);
		};

		$.if(node, ($$render) => {
			if ($$props.isLoading) $$render(consequent); else if ($$props.results.length > 0) $$render(consequent_3, 1);
		});
	}

	$.reset(div_3);

	var node_4 = $.sibling(div_3, 2);

	{
		var consequent_7 = ($$anchor) => {
			var fragment_3 = $.comment();
			var node_5 = $.first_child(fragment_3);

			{
				var consequent_4 = ($$anchor) => {
					var div_6 = root_3();
					var text_6 = $.only_child(div_6, true);

					$.template_effect(($0) => $.set_text(text_6, $0), [
						() => s("search.historical_needs_3_chars") || "Historical search needs 3+ characters"
					]);

					$.append($$anchor, div_6);
				};

				var consequent_5 = ($$anchor) => {
					var div_7 = root_4();
					var node_6 = $.child(div_7);

					IconLoader2(node_6, { class: 'size-3 text-yellow-500 animate-spin' });

					var text_7 = $.sibling(node_6);

					$.reset(div_7);

					$.template_effect(($0) => $.set_text(text_7, ` ${$0 ?? ''}`), [
						() => s("search.searching_historical") || "Searching historical..."
					]);

					$.append($$anchor, div_7);
				};

				var consequent_6 = ($$anchor) => {
					var div_8 = root_5();
					var node_7 = $.child(div_8);

					IconClock(node_7, { size: 12 });

					var text_8 = $.sibling(node_7);

					$.reset(div_8);

					$.template_effect(($0) => $.set_text(text_8, ` ${$0 ?? ''}`), [
						() => s("search.historical_included", { count: String(historicalCount()) }) || `${historicalCount()} historical results included`
					]);

					$.append($$anchor, div_8);
				};

				$.if(node_5, ($$render) => {
					if ($$props.query.length > 0 && $$props.query.length < 3) $$render(consequent_4); else if ($$props.isSearchingHistorical) $$render(consequent_5, 1); else if (historicalCount() > 0) $$render(consequent_6, 2);
				});
			}

			$.append($$anchor, fragment_3);
		};

		$.if(node_4, ($$render) => {
			if (features.historicalSearch) $$render(consequent_7);
		});
	}

	$.reset(div_2);
	$.reset(div_1);

	var div_9 = $.sibling(div_1, 2);
	var node_8 = $.child(div_9);

	{
		var consequent_11 = ($$anchor) => {
			var div_10 = root_11();
			var div_11 = $.child(div_10);
			var div_12 = $.child(div_11);
			var h3 = $.sibling($.child(div_12), 2);
			var text_9 = $.only_child(h3, true);
			var p = $.sibling(h3, 2);
			var text_10 = $.only_child(p, true);

			$.reset(div_12);

			var node_9 = $.sibling(div_12, 2);

			{
				var consequent_10 = ($$anchor) => {
					var div_13 = root_10();
					var div_14 = $.child(div_13);
					var div_15 = $.child(div_14);
					var text_11 = $.only_child(div_15, true);
					var button = $.sibling(div_15, 2);
					var node_10 = $.child(button);

					IconX(node_10, { size: 14 });
					$.reset(button);
					$.reset(div_14);

					var div_16 = $.sibling(div_14, 2);

					$.each(div_16, 21, () => filterTips, $.index, ($$anchor, tip, index) => {
						const Icon = $.derived(() => $.get(tip).icon);
						var div_17 = root_6();
						var div_18 = $.child(div_17);
						var node_11 = $.child(div_18);

						$.component(node_11, () => $.get(Icon), ($$anchor, Icon_1) => {
							Icon_1($$anchor, { size: 16 });
						});

						$.reset(div_18);

						var div_19 = $.sibling(div_18, 2);
						var div_20 = $.child(div_19);
						var text_12 = $.only_child(div_20, true);
						var div_21 = $.sibling(div_20, 2);
						var text_13 = $.only_child(div_21, true);

						$.reset(div_19);
						$.reset(div_17);

						$.template_effect(
							($0) => {
								$.set_class(div_17, 1, `absolute inset-0 flex items-start gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 transition-all duration-200 ${index === $.get(currentFilterTip)
									? 'opacity-100 translate-y-0'
									: 'opacity-0 translate-y-4'}`);

								$.set_style(div_17, `display: ${index === $.get(currentFilterTip) ? 'flex' : 'none'}`);
								$.set_class(div_18, 1, `${$.get(tip).color ?? ''} mt-0.5`, 'svelte-1hmd7l3');
								$.set_text(text_12, $.get(tip).title);
								$.set_text(text_13, $0);
							},
							[() => s($.get(tip).hint) || $.get(tip).defaultHint]
						);

						$.append($$anchor, div_17);
					});

					$.reset(div_16);

					var div_22 = $.sibling(div_16, 2);

					$.each(div_22, 21, () => filterTips, $.index, ($$anchor, _, index) => {
						var button_1 = root_9();

						$.set_attribute(button_1, 'aria-label', `Go to tip ${index + 1}`);

						var node_12 = $.child(button_1);

						{
							var consequent_8 = ($$anchor) => {
								var div_23 = root_7();

								$.append($$anchor, div_23);
							};

							var consequent_9 = ($$anchor) => {
								var div_24 = root_8();

								$.append($$anchor, div_24);
							};

							$.if(node_12, ($$render) => {
								if (index === $.get(currentFilterTip) && $.get(autoRotate)) $$render(consequent_8); else if (index === $.get(currentFilterTip)) $$render(consequent_9, 1);
							});
						}

						$.reset(button_1);
						$.template_effect(() => $.set_class(button_1, 1, `relative rounded-full bg-gray-300 dark:bg-gray-600 overflow-hidden transition-all duration-200 ${index === $.get(currentFilterTip) ? 'w-8 h-1.5' : 'w-1.5 h-1.5'}`));
						$.delegated('click', button_1, () => selectFilterTip(index));
						$.append($$anchor, button_1);
					});

					$.reset(div_22);
					$.reset(div_13);

					$.template_effect(
						($0, $1) => {
							$.set_text(text_11, $0);
							$.set_attribute(button, 'title', $1);
						},
						[
							() => s("search.try_these") || "Try these filters",
							() => s("search.dismiss_tips") || "Don't show these tips again"
						]
					);

					$.delegated('click', button, dismissFilterTips);
					$.transition(3, div_13, () => slide, () => ({ duration: $.get(animateTransition) ? 300 : 0, axis: "y" }));
					$.append($$anchor, div_13);
				};

				$.if(node_9, ($$render) => {
					if ($.get(showFilterTips)) $$render(consequent_10);
				});
			}

			$.reset(div_11);
			$.reset(div_10);

			$.template_effect(
				($0, $1) => {
					$.set_text(text_9, $0);
					$.set_text(text_10, $1);
				},
				[
					() => s("search.get_started_title") || "Start searching",
					() => s("search.get_started_description") || "Type to search or use filters"
				]
			);

			$.append($$anchor, div_10);
		};

		var consequent_22 = ($$anchor) => {
			var fragment_4 = root_22();
			var node_13 = $.first_child(fragment_4);

			$.each(node_13, 17, () => $$props.results, $.index, ($$anchor, result, index) => {
				var button_2 = root_18();
				var div_25 = $.child(button_2);
				var div_26 = $.child(div_25);
				var div_27 = $.child(div_26);
				var node_14 = $.child(div_27);

				{
					var consequent_12 = ($$anchor) => {
						var span_1 = root_12();
						var text_14 = $.only_child(span_1, true);

						$.template_effect(() => $.set_text(text_14, $.get(result).story.emoji));
						$.append($$anchor, span_1);
					};

					$.if(node_14, ($$render) => {
						if ($.get(result).story.emoji) $$render(consequent_12);
					});
				}

				var h3_1 = $.sibling(node_14, 2);

				$.html(h3_1, () => highlightMatch($.get(result).story.title || "", $$props.query), true);
				$.reset(h3_1);
				$.reset(div_27);

				var span_2 = $.sibling(div_27, 2);
				var text_15 = $.only_child(span_2, true);

				$.reset(div_26);

				var node_15 = $.sibling(div_26, 2);

				{
					var consequent_13 = ($$anchor) => {
						var p_1 = root_13();

						$.html(p_1, () => getSnippetWithHighlight($.get(result).story.snippet, $$props.query), true);
						$.reset(p_1);
						$.template_effect(() => p_1.dir = p_1.dir);
						$.append($$anchor, p_1);
					};

					var consequent_14 = ($$anchor) => {
						var p_2 = root_13();

						$.html(p_2, () => getSnippetWithHighlight($.get(result).story.short_summary, $$props.query), true);
						$.reset(p_2);
						$.template_effect(() => p_2.dir = p_2.dir);
						$.append($$anchor, p_2);
					};

					$.if(node_15, ($$render) => {
						if ($.get(result).story.snippet) $$render(consequent_13); else if ($.get(result).story.short_summary) $$render(consequent_14, 1);
					});
				}

				var div_28 = $.sibling(node_15, 2);
				var node_16 = $.child(div_28);

				{
					var consequent_16 = ($$anchor) => {
						var fragment_5 = root_15();
						var span_3 = $.first_child(fragment_5);
						var text_16 = $.only_child(span_3);
						var node_17 = $.sibling(span_3, 2);

						{
							var consequent_15 = ($$anchor) => {
								var span_4 = root_14();

								$.append($$anchor, span_4);
							};

							var d = $.derived(() => $.get(result).story.unique_domains || $.get(result).batchDate && !isToday($.get(result).batchDate));

							$.if(node_17, ($$render) => {
								if ($.get(d)) $$render(consequent_15);
							});
						}

						$.template_effect(() => {
							$.set_text(text_16, `📍 ${$.get(result).story.location ?? ''}`);
							span_3.dir = span_3.dir;
						});

						$.append($$anchor, fragment_5);
					};

					$.if(node_16, ($$render) => {
						if ($.get(result).story.location) $$render(consequent_16);
					});
				}

				var node_18 = $.sibling(node_16, 2);

				{
					var consequent_18 = ($$anchor) => {
						var fragment_6 = root_16();
						var span_5 = $.first_child(fragment_6);
						var text_17 = $.only_child(span_5);
						var node_19 = $.sibling(span_5, 2);

						{
							var consequent_17 = ($$anchor) => {
								var span_6 = root_14();

								$.append($$anchor, span_6);
							};

							var d_1 = $.derived(() => $.get(result).batchDate && !isToday($.get(result).batchDate));

							$.if(node_19, ($$render) => {
								if ($.get(d_1)) $$render(consequent_17);
							});
						}

						$.template_effect(
							($0) => $.set_text(text_17, `${$.get(result).story.unique_domains ?? ''}
                  ${$0 ?? ''}`),
							[
								() => $.get(result).story.unique_domains === 1
									? s("search.source_single") || "source"
									: s("search.source_plural") || "sources"
							]
						);

						$.append($$anchor, fragment_6);
					};

					$.if(node_18, ($$render) => {
						if ($.get(result).story.unique_domains) $$render(consequent_18);
					});
				}

				var node_20 = $.sibling(node_18, 2);

				{
					var consequent_19 = ($$anchor) => {
						var span_7 = root_17();
						var text_18 = $.only_child(span_7, true);

						$.template_effect(($0) => $.set_text(text_18, $0), [() => new Date($.get(result).batchDate).toLocaleDateString()]);
						$.append($$anchor, span_7);
					};

					var d_2 = $.derived(() => $.get(result).batchDate && !isToday($.get(result).batchDate));

					$.if(node_20, ($$render) => {
						if ($.get(d_2)) $$render(consequent_19);
					});
				}

				$.reset(div_28);
				$.reset(div_25);
				$.reset(button_2);

				$.template_effect(() => {
					$.set_class(button_2, 1, `w-full p-4 text-left border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 focus:bg-gray-50 dark:focus:bg-gray-800/50 focus:outline-none ${index === $$props.selectedIndex
						? 'bg-blue-50 dark:bg-blue-900/20 border-l-2 border-l-blue-500'
						: ''}`);

					$.set_attribute(button_2, 'tabindex', index === $$props.selectedIndex ? 0 : -1);
					h3_1.dir = h3_1.dir;
					$.set_text(text_15, $.get(result).categoryName);
					span_2.dir = span_2.dir;
				});

				$.delegated('click', button_2, () => handleResultClick($.get(result)));
				$.delegated('keydown', button_2, (e) => handleResultKeyDown(e, $.get(result)));
				$.append($$anchor, button_2);
			});

			var node_21 = $.sibling(node_13, 2);

			{
				var consequent_21 = ($$anchor) => {
					var div_29 = root_21();
					var node_22 = $.child(div_29);

					{
						var consequent_20 = ($$anchor) => {
							var div_30 = root_19();
							var node_23 = $.child(div_30);

							IconLoader2(node_23, { class: 'size-4 text-blue-500 animate-spin' });

							var text_19 = $.sibling(node_23);

							$.reset(div_30);
							$.template_effect(($0) => $.set_text(text_19, ` ${$0 ?? ''}`), [() => s("search.loading_more") || "Loading more results..."]);
							$.append($$anchor, div_30);
						};

						var alternate_1 = ($$anchor) => {
							var fragment_7 = root_20();
							var button_3 = $.first_child(fragment_7);
							var text_20 = $.only_child(button_3, true);
							var div_31 = $.sibling(button_3, 2);
							var text_21 = $.only_child(div_31, true);

							$.template_effect(
								($0, $1) => {
									$.set_text(text_20, $0);
									$.set_text(text_21, $1);
								},
								[
									() => s("search.load_more") || "Load more results",
									() => s("search.showing_of", {
										shown: $$props.results.length.toString(),
										total: $$props.totalCount.toString()
									}) || `Showing ${$$props.results.length} of ${$$props.totalCount} results`
								]
							);

							$.delegated('click', button_3, function (...$$args) {
								$$props.onLoadMore?.apply(this, $$args);
							});

							$.append($$anchor, fragment_7);
						};

						$.if(node_22, ($$render) => {
							if (isLoadingMore()) $$render(consequent_20); else $$render(alternate_1, -1);
						});
					}

					$.reset(div_29);
					$.append($$anchor, div_29);
				};

				$.if(node_21, ($$render) => {
					if (features.historicalSearch && hasMore() && $$props.onLoadMore) $$render(consequent_21);
				});
			}

			$.append($$anchor, fragment_4);
		};

		var consequent_25 = ($$anchor) => {
			var div_32 = root_24();
			var div_33 = $.child(div_32);
			var div_34 = $.child(div_33);
			var node_24 = $.child(div_34);

			IconSearch(node_24, { size: 48, stroke: 1.5 });
			$.reset(div_34);

			var h3_2 = $.sibling(div_34, 2);
			var text_22 = $.only_child(h3_2, true);
			var p_3 = $.sibling(h3_2, 2);
			var node_25 = $.child(p_3);

			{
				var consequent_23 = ($$anchor) => {
					var text_23 = $.text();

					$.template_effect(($0) => $.set_text(text_23, $0), [
						() => s("search.no_results_description") || "Try adjusting your search terms or filters to find what you're looking for."
					]);

					$.append($$anchor, text_23);
				};

				var alternate_2 = ($$anchor) => {
					var text_24 = $.text();

					$.template_effect(($0) => $.set_text(text_24, $0), [
						() => s("search.no_results_description_simple") || "Try different search terms to find what you're looking for."
					]);

					$.append($$anchor, text_24);
				};

				$.if(node_25, ($$render) => {
					if (features.historicalSearch) $$render(consequent_23); else $$render(alternate_2, -1);
				});
			}

			$.reset(p_3);

			var node_26 = $.sibling(p_3, 2);

			{
				var consequent_24 = ($$anchor) => {
					var div_35 = root_23();
					var p_4 = $.child(div_35);
					var text_25 = $.only_child(p_4, true);

					$.next(2);
					$.reset(div_35);
					$.template_effect(($0) => $.set_text(text_25, $0), [() => s("search.try_searching_for") || "Try searching for:"]);
					$.append($$anchor, div_35);
				};

				$.if(node_26, ($$render) => {
					if (features.historicalSearch) $$render(consequent_24);
				});
			}

			$.reset(div_33);
			$.reset(div_32);
			$.template_effect(($0) => $.set_text(text_22, $0), [() => s("search.no_results_title") || "No results found"]);
			$.append($$anchor, div_32);
		};

		$.if(node_8, ($$render) => {
			if (!$$props.query && $$props.results.length === 0) $$render(consequent_11); else if ($$props.results.length > 0) $$render(consequent_22, 1); else if (!$$props.isLoading) $$render(consequent_25, 2);
		});
	}

	$.reset(div_9);
	$.bind_this(div_9, ($$value) => $.set(resultsContainer, $$value), () => $.get(resultsContainer));
	$.reset(div);
	$.append($$anchor, div);

	return $.pop($$exports);
}

$.delegate(['click', 'keydown']);