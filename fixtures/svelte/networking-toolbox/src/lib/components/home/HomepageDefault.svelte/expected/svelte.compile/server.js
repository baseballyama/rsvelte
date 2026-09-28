import * as $ from 'svelte/internal/server';
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

export default function HomepageDefault($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let { toolPages, referencePages } = $$props;
		let filteredTools = toolPages;
		let filteredReference = referencePages;
		let searchQuery = '';
		let isSearchOpen = false;
		let searchFilterRef = void 0;

		// Combined filtered list - managed by SearchFilter component
		let allFiltered = [...toolPages, ...referencePages];

		// Update filtered items when search changes
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
				if (e.key === 'Escape' && isSearchOpen) {
					e.preventDefault();
					searchQuery = '';
					isSearchOpen = false;
				}

				return;
			}

			// Only alphanumeric characters and common punctuation
			if ((/^[a-zA-Z0-9\s]$/).test(e.key)) {
				// Don't interfere if typing in an input/textarea
				const target = e.target;

				if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;

				// Open local search if not already open and set the initial character
				if (searchFilterRef && !isSearchOpen) {
					e.preventDefault(); // Prevent default to capture the character
					searchQuery = e.key; // Set the initial character
					searchFilterRef.openSearch();
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

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$$renderer.push(`<section class="hero svelte-19yqysf"><div class="hero-content svelte-19yqysf"><h2 class="svelte-19yqysf">${$.escape(site.title)}</h2> <p class="hero-description svelte-19yqysf">${$.escape(about.line1)}</p> <a href="/sitemap" class="sitemap-link svelte-19yqysf">Sitemap</a></div></section> `);

			if (!isSearchOpen) {
				$$renderer.push(`<!--[0--><div class="shortcuts-wrapper svelte-19yqysf">`);
				KeyboardShortcutChip($$renderer, { label: 'Search', shortcut: '^K', onclick: openGlobalSearch });
				$$renderer.push(`<!----> `);

				KeyboardShortcutChip($$renderer, {
					label: 'Commansd',
					shortcut: '^/',
					onclick: openShortcutsDialog
				});

				$$renderer.push(`<!----></div>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> `);

			SearchFilter($$renderer, {
				get filteredTools() {
					return allFiltered;
				},

				set filteredTools($$value) {
					allFiltered = $$value;
					$$settled = false;
				},

				get searchQuery() {
					return searchQuery;
				},

				set searchQuery($$value) {
					searchQuery = $$value;
					$$settled = false;
				},

				get isSearchOpen() {
					return isSearchOpen;
				},

				set isSearchOpen($$value) {
					isSearchOpen = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----> `);

			if (searchQuery.trim() === '') {
				$$renderer.push('<!--[0-->');
				BookmarksGrid($$renderer, { hideOther: true });
				$$renderer.push(`<!----> `);
				FrequentlyUsedGrid($$renderer, { hideOther: true });
				$$renderer.push(`<!----> `);

				if ($.store_get($$store_subs ??= {}, '$bookmarks', bookmarks).length > 0 || $.store_get($$store_subs ??= {}, '$frequentlyUsedTools', frequentlyUsedTools).length > 0) {
					$$renderer.push(`<!--[0--><section class="tools-grid-sub-header">`);
					Icon($$renderer, { name: 'network-port', size: 'md' });
					$$renderer.push(`<!----> <h2>All Tools</h2> <span class="count">${$.escape(toolPages.length + referencePages.length)}</span></section>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--> `);
				ToolsGrid($$renderer, { idPrefix: 'tools', tools: filteredTools, searchQuery });
				$$renderer.push(`<!----> `);

				if (filteredReference.length > 0) {
					$$renderer.push(`<!--[0--><section class="reference-section svelte-19yqysf"><div class="section-header svelte-19yqysf"><h2 class="svelte-19yqysf">Reference &amp; Documentation</h2> <p class="section-description svelte-19yqysf">Comprehensive reference materials and documentation for network professionals.</p></div> `);
					ToolsGrid($$renderer, { idPrefix: 'reference', tools: filteredReference, searchQuery });
					$$renderer.push(`<!----></section>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]-->`);
			} else {
				$$renderer.push('<!--[-1-->');
				ToolsGrid($$renderer, { idPrefix: 'search', tools: allFiltered, searchQuery });
			}

			$$renderer.push(`<!--]-->`);
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