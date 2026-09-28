import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { site, about } from '$lib/constants/site';
import ToolsGrid from '$lib/components/global/ToolsGrid.svelte';
import SearchFilter from '$lib/components/furniture/SearchFilter.svelte';
import BookmarksGrid from '$lib/components/global/BookmarksGrid.svelte';
import FrequentlyUsedGrid from '$lib/components/global/FrequentlyUsedGrid.svelte';
import { bookmarks } from '$lib/stores/bookmarks';
import { frequentlyUsedTools } from '$lib/stores/toolUsage';
import Icon from '$lib/components/global/Icon.svelte';
import KeyboardShortcutChip from '$lib/components/common/KeyboardShortcutChip.svelte';
import { onMount, onDestroy } from 'svelte';
import { browser } from '$app/environment';

var root = $.from_html(`<div class="shortcuts-wrapper svelte-19yqysf"><!> <!></div>`);
var root_1 = $.from_html(`<section class="tools-grid-sub-header"><!> <h2>All Tools</h2> <span class="count"> </span></section>`);
var root_2 = $.from_html(`<section class="reference-section svelte-19yqysf"><div class="section-header svelte-19yqysf"><h2 class="svelte-19yqysf">Reference & Documentation</h2> <p class="section-description svelte-19yqysf">Comprehensive reference materials and documentation for network professionals.</p></div> <!></section>`);
var root_3 = $.from_html(`<!> <!> <!> <!> <!>`, 1);
var root_4 = $.from_html(`<section class="hero svelte-19yqysf"><div class="hero-content svelte-19yqysf"><h2 class="svelte-19yqysf"> </h2> <p class="hero-description svelte-19yqysf"> </p> <a href="/sitemap" class="sitemap-link svelte-19yqysf">Sitemap</a></div></section> <!> <!> <!>`, 1);

export default function HomepageDefault($$anchor, $$props) {
	$.push($$props, true);

	const $bookmarks = () => $.store_get(bookmarks, '$bookmarks', $$stores);
	const $frequentlyUsedTools = () => $.store_get(frequentlyUsedTools, '$frequentlyUsedTools', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	let filteredTools = $.state($.proxy($$props.toolPages));
	let filteredReference = $.state($.proxy($$props.referencePages));
	let searchQuery = $.state('');
	let isSearchOpen = $.state(false);
	let searchFilterRef = $.state(void 0);

	// Combined filtered list - managed by SearchFilter component
	let allFiltered = $.state($.proxy([...$$props.toolPages, ...$$props.referencePages]));

	// Update filtered items when search changes
	$.user_effect(() => {
		if ($.get(searchQuery).trim() === '') {
			$.set(filteredTools, $$props.toolPages, true);
			$.set(filteredReference, $$props.referencePages, true);
		} else {
			const query = $.get(searchQuery).toLowerCase().trim();

			$.set(filteredTools, $$props.toolPages.filter((tool) => tool.label.toLowerCase().includes(query) || tool.description?.toLowerCase().includes(query) || tool.keywords?.some((keyword) => keyword.toLowerCase().includes(query))), true);
			$.set(filteredReference, $$props.referencePages.filter((page) => page.label.toLowerCase().includes(query) || page.description?.toLowerCase().includes(query) || page.keywords?.some((keyword) => keyword.toLowerCase().includes(query))), true);
		}
	});

	// Open shortcuts dialog by dispatching Ctrl+/
	function openShortcutsDialog() {
		const event = new KeyboardEvent('keydown', { key: '/', ctrlKey: true, bubbles: true });

		window.dispatchEvent(event);
	}

	// Open global search by dispatching Ctrl+K
	function openGlobalSearch() {
		const event = new KeyboardEvent('keydown', { key: 'k', ctrlKey: true, bubbles: true });

		document.dispatchEvent(event);
	}

	// Handle keyboard typing to trigger local filter
	function handleKeyDown(e) {
		// Ignore if modifier keys are pressed
		if (e.ctrlKey || e.metaKey || e.altKey) return;

		// Ignore if special keys (except Escape)
		if (e.key.length > 1) {
			// Handle Escape to close filter
			if (e.key === 'Escape' && $.get(isSearchOpen)) {
				e.preventDefault();
				$.set(searchQuery, '');
				$.set(isSearchOpen, false);
			}

			return;
		}

		// Only alphanumeric characters and common punctuation
		if ((/^[a-zA-Z0-9\s]$/).test(e.key)) {
			// Don't interfere if typing in an input/textarea
			const target = e.target;

			if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;

			// Open local search if not already open and set the initial character
			if ($.get(searchFilterRef) && !$.get(isSearchOpen)) {
				e.preventDefault(); // Prevent default to capture the character

				$.set(
					searchQuery,
					e.key, // Set the initial character
					true
				);

				$.get(searchFilterRef).openSearch();
			}
		}
	}

	onMount(() => {
		if (browser) {
			window.addEventListener('keydown', handleKeyDown);
		}
	});

	onDestroy(() => {
		if (browser) {
			window.removeEventListener('keydown', handleKeyDown);
		}
	});

	var fragment = root_4();
	var section = $.first_child(fragment);
	var div = $.child(section);
	var h2 = $.child(div);
	var text = $.only_child(h2, true);
	var p = $.sibling(h2, 2);
	var text_1 = $.only_child(p, true);

	$.next(2);
	$.reset(div);
	$.reset(section);

	var node = $.sibling(section, 2);

	{
		var consequent = ($$anchor) => {
			var div_1 = root();
			var node_1 = $.child(div_1);

			KeyboardShortcutChip(node_1, { label: 'Search', shortcut: '^K', onclick: openGlobalSearch });

			var node_2 = $.sibling(node_1, 2);

			KeyboardShortcutChip(node_2, {
				label: 'Commansd',
				shortcut: '^/',
				onclick: openShortcutsDialog
			});

			$.reset(div_1);
			$.append($$anchor, div_1);
		};

		$.if(node, ($$render) => {
			if (!$.get(isSearchOpen)) $$render(consequent);
		});
	}

	var node_3 = $.sibling(node, 2);

	$.bind_this(
		SearchFilter(node_3, {
			get filteredTools() {
				return $.get(allFiltered);
			},

			set filteredTools($$value) {
				$.set(allFiltered, $$value, true);
			},

			get searchQuery() {
				return $.get(searchQuery);
			},

			set searchQuery($$value) {
				$.set(searchQuery, $$value, true);
			},

			get isSearchOpen() {
				return $.get(isSearchOpen);
			},

			set isSearchOpen($$value) {
				$.set(isSearchOpen, $$value, true);
			}
		}),
		($$value) => $.set(searchFilterRef, $$value, true),
		() => $.get(searchFilterRef)
	);

	var node_4 = $.sibling(node_3, 2);

	{
		var consequent_3 = ($$anchor) => {
			var fragment_1 = root_3();
			var node_5 = $.first_child(fragment_1);

			BookmarksGrid(node_5, { hideOther: true });

			var node_6 = $.sibling(node_5, 2);

			FrequentlyUsedGrid(node_6, { hideOther: true });

			var node_7 = $.sibling(node_6, 2);

			{
				var consequent_1 = ($$anchor) => {
					var section_1 = root_1();
					var node_8 = $.child(section_1);

					Icon(node_8, { name: 'network-port', size: 'md' });

					var span = $.sibling(node_8, 4);
					var text_2 = $.only_child(span, true);

					$.reset(section_1);
					$.template_effect(() => $.set_text(text_2, $$props.toolPages.length + $$props.referencePages.length));
					$.append($$anchor, section_1);
				};

				$.if(node_7, ($$render) => {
					if ($bookmarks().length > 0 || $frequentlyUsedTools().length > 0) $$render(consequent_1);
				});
			}

			var node_9 = $.sibling(node_7, 2);

			ToolsGrid(node_9, {
				idPrefix: 'tools',
				get tools() {
					return $.get(filteredTools);
				},

				get searchQuery() {
					return $.get(searchQuery);
				}
			});

			var node_10 = $.sibling(node_9, 2);

			{
				var consequent_2 = ($$anchor) => {
					var section_2 = root_2();
					var node_11 = $.sibling($.child(section_2), 2);

					ToolsGrid(node_11, {
						idPrefix: 'reference',
						get tools() {
							return $.get(filteredReference);
						},

						get searchQuery() {
							return $.get(searchQuery);
						}
					});

					$.reset(section_2);
					$.append($$anchor, section_2);
				};

				$.if(node_10, ($$render) => {
					if ($.get(filteredReference).length > 0) $$render(consequent_2);
				});
			}

			$.append($$anchor, fragment_1);
		};

		var d = $.derived(() => $.get(searchQuery).trim() === '');

		var alternate = ($$anchor) => {
			ToolsGrid($$anchor, {
				idPrefix: 'search',
				get tools() {
					return $.get(allFiltered);
				},

				get searchQuery() {
					return $.get(searchQuery);
				}
			});
		};

		$.if(node_4, ($$render) => {
			if ($.get(d)) $$render(consequent_3); else $$render(alternate, -1);
		});
	}

	$.template_effect(() => {
		$.set_text(text, site.title);
		$.set_text(text_1, about.line1);
	});

	$.append($$anchor, fragment);
	$.pop();
	$$cleanup();
}