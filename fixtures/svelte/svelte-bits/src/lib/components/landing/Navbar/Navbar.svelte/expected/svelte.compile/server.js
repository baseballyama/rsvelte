import * as $ from 'svelte/internal/server';
import { page } from '$app/state';
import { useStars } from '$lib/hooks/useStars.svelte';
import { GITHUB_URL } from '$lib/constants/site';
import SearchDialog from '$lib/components/common/SearchDialog.svelte';
import logoSvg from '$lib/assets/logo/svelte-bits-logo.svg?raw';
import './Navbar.css';

export default function Navbar($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { showDocs = false, onhamburger } = $$props;

		const NAV_LINKS = [
			{
				label: 'Docs',
				to: '/get-started/introduction',
				match: '/get-started'
			}
		];

		const stars = useStars();
		let scrolled = false;
		let menuOpen = false;
		let searchOpen = false;
		let prefsOpen = false;
		let prefsCloseTimer = null;
		let navbarInnerEl = null;
		let linksEl = null;
		let highlightEl = null;

		const formattedStars = $.derived(() => {
			const v = stars.value;

			// useStars now returns a pre-formatted compact string; just pass through
			return v ?? '0';
		});

		const isActive = (match) => typeof page.url?.pathname === 'string' && page.url.pathname.startsWith(match);

		function positionHighlight(el) {
			if (!el || !highlightEl || !linksEl) return;

			const linkRect = el.getBoundingClientRect();
			const containerRect = linksEl.getBoundingClientRect();

			highlightEl.style.width = `${linkRect.width}px`;
			highlightEl.style.height = `${linkRect.height}px`;
			highlightEl.style.transform = `translateX(${linkRect.left - containerRect.left}px)`;
			highlightEl.style.opacity = '1';
		}

		function getActiveEl() {
			if (!linksEl) return null;

			return linksEl.querySelector('.ln-navbar-link-active');
		}

		function handleLinkHover(e) {
			positionHighlight(e.currentTarget);
		}

		function handleLinksLeave() {
			const active = getActiveEl();

			if (active) {
				positionHighlight(active);
			} else if (highlightEl) {
				highlightEl.style.opacity = '0';
			}
		}

		function closeSearch() {
			searchOpen = false;
		}

		function toggleSearch() {
			searchOpen = !searchOpen;
		}

		function handlePrefsEnter() {
			if (prefsCloseTimer) clearTimeout(prefsCloseTimer);

			prefsOpen = true;
		}

		function handlePrefsLeave() {
			prefsCloseTimer = setTimeout(() => prefsOpen = false, 150);
		}

		$$renderer.push(`<header${$.attr_class(`ln-navbar ${// Lock body scroll when mobile menu open
		// Close the landing mobile menu when tapping outside the navbar.
		// Scroll listener
		// Reposition highlight on route change
		// reactive dep: pathname
		scrolled ? 'ln-navbar-scrolled' : ''} ${showDocs ? 'ln-navbar-docs' : ''}`)}><div class="ln-navbar-inner"><div class="ln-navbar-left"><a href="/" class="ln-navbar-logo" aria-label="svelte-bits home">${$.html(logoSvg)}</a> <span class="ln-navbar-divider">/</span> <nav class="ln-navbar-links"><div class="ln-navbar-link-highlight"></div> <!--[-->`);

		const each_array = $.ensure_array_like(NAV_LINKS);

		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let { label, to, match } = each_array[$$index];

			$$renderer.push(`<a${$.attr_class(`ln-navbar-link ${isActive(match) ? 'ln-navbar-link-active' : ''}`)}${$.attr('href', to)}>${$.escape(label)}</a>`);
		}

		$$renderer.push(`<!--]--></nav></div> <div class="ln-navbar-right"><button type="button" class="ln-navbar-search" aria-label="Search"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.35-4.35"></path></svg> <span>Search</span> <kbd>/</kbd></button> `);

		if (showDocs) {
			$$renderer.push(`<!--[0--><div class="ln-navbar-prefs-wrapper" role="presentation"><button type="button" class="ln-navbar-icon-btn ln-navbar-prefs-trigger" aria-label="Preferences"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg></button> `);

			if (prefsOpen) {
				$$renderer.push(`<!--[0--><div class="ln-navbar-prefs-menu"><a href="/favorites" class="ln-navbar-prefs-fav"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78Z"></path></svg> Favorites</a></div>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> <a class="ln-navbar-github"${$.attr('href', GITHUB_URL)} target="_blank" rel="noopener noreferrer" aria-label="GitHub repository"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="#fff" aria-hidden="true"><path d="M8 0C3.58 0 0 3.58 0 8a8 8 0 0 0 5.47 7.59c.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8z"></path></svg> <span>${$.escape(formattedStars())}</span></a> <button type="button"${$.attr_class(`ln-navbar-hamburger ${menuOpen ? 'open' : ''}`)} aria-label="Menu"${$.attr('aria-expanded', menuOpen)}><span></span><span></span><span></span></button></div> `);

		if (menuOpen && !showDocs) {
			$$renderer.push(`<!--[0--><div class="ln-navbar-mobile-menu"><!--[-->`);

			const each_array_1 = $.ensure_array_like(NAV_LINKS);

			for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
				let { label, to } = each_array_1[$$index_1];

				$$renderer.push(`<a class="ln-navbar-mobile-link"${$.attr('href', to)}>${$.escape(label)}</a>`);
			}

			$$renderer.push(`<!--]--> <a${$.attr('href', GITHUB_URL)} target="_blank" rel="noopener noreferrer" class="ln-navbar-mobile-link"><span style="display: inline-flex; align-items: center; gap: 8px;"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><path d="M8 0C3.58 0 0 3.58 0 8a8 8 0 0 0 5.47 7.59c.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8z"></path></svg> GitHub</span> <span style="opacity: 0.6;">${$.escape(formattedStars())}</span></a></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></div></header> `);

		SearchDialog($$renderer, {
			isOpen: searchOpen,
			onClose: closeSearch,
			onToggle: toggleSearch
		});

		$$renderer.push(`<!---->`);
	});
}