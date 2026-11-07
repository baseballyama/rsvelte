import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { page } from '$app/state';
import { useStars } from '$lib/hooks/useStars.svelte';
import { GITHUB_URL } from '$lib/constants/site';
import SearchDialog from '$lib/components/common/SearchDialog.svelte';
import logoSvg from '$lib/assets/logo/svelte-bits-logo.svg?raw';
import './Navbar.css';

var root = $.from_html(`<a> </a>`);
var root_1 = $.from_html(`<div class="ln-navbar-prefs-menu"><a href="/favorites" class="ln-navbar-prefs-fav"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78Z"></path></svg> Favorites</a></div>`);
var root_2 = $.from_html(`<div class="ln-navbar-prefs-wrapper" role="presentation"><button type="button" class="ln-navbar-icon-btn ln-navbar-prefs-trigger" aria-label="Preferences"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg></button> <!></div>`);
var root_3 = $.from_html(`<a class="ln-navbar-mobile-link"> </a>`);
var root_4 = $.from_html(`<div class="ln-navbar-mobile-menu"><!> <a target="_blank" rel="noopener noreferrer" class="ln-navbar-mobile-link"><span style="display: inline-flex; align-items: center; gap: 8px;"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><path d="M8 0C3.58 0 0 3.58 0 8a8 8 0 0 0 5.47 7.59c.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8z"></path></svg> GitHub</span> <span style="opacity: 0.6;"> </span></a></div>`);
var root_5 = $.from_html(`<header><div class="ln-navbar-inner"><div class="ln-navbar-left"><a href="/" class="ln-navbar-logo" aria-label="svelte-bits home"></a> <span class="ln-navbar-divider">/</span> <nav class="ln-navbar-links"><div class="ln-navbar-link-highlight"></div> <!></nav></div> <div class="ln-navbar-right"><button type="button" class="ln-navbar-search" aria-label="Search"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.35-4.35"></path></svg> <span>Search</span> <kbd>/</kbd></button> <!> <a class="ln-navbar-github" target="_blank" rel="noopener noreferrer" aria-label="GitHub repository"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="#fff" aria-hidden="true"><path d="M8 0C3.58 0 0 3.58 0 8a8 8 0 0 0 5.47 7.59c.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8z"></path></svg> <span> </span></a> <button type="button" aria-label="Menu"><span></span><span></span><span></span></button></div> <!></div></header> <!>`, 1);

export default function Navbar($$anchor, $$props) {
	$.push($$props, true);

	let showDocs = $.prop($$props, 'showDocs', 3, false);

	const NAV_LINKS = [
		{
			label: 'Docs',
			to: '/get-started/introduction',
			match: '/get-started'
		}
	];

	const stars = useStars();
	let scrolled = $.state(false);
	let menuOpen = $.state(false);
	let searchOpen = $.state(false);
	let prefsOpen = $.state(false);
	let prefsCloseTimer = null;
	let navbarInnerEl = $.state(null);
	let linksEl = $.state(null);
	let highlightEl = $.state(null);

	const formattedStars = $.derived(() => {
		const v = stars.value;

		// useStars now returns a pre-formatted compact string; just pass through
		return v ?? '0';
	});

	const isActive = (match) => typeof page.url?.pathname === 'string' && page.url.pathname.startsWith(match);

	function positionHighlight(el) {
		if (!el || !$.get(highlightEl) || !$.get(linksEl)) return;

		const linkRect = el.getBoundingClientRect();
		const containerRect = $.get(linksEl).getBoundingClientRect();

		$.get(highlightEl).style.width = `${linkRect.width}px`;
		$.get(highlightEl).style.height = `${linkRect.height}px`;
		$.get(highlightEl).style.transform = `translateX(${linkRect.left - containerRect.left}px)`;
		$.get(highlightEl).style.opacity = '1';
	}

	function getActiveEl() {
		if (!$.get(linksEl)) return null;

		return $.get(linksEl).querySelector('.ln-navbar-link-active');
	}

	function handleLinkHover(e) {
		positionHighlight(e.currentTarget);
	}

	function handleLinksLeave() {
		const active = getActiveEl();

		if (active) {
			positionHighlight(active);
		} else if ($.get(highlightEl)) {
			$.get(highlightEl).style.opacity = '0';
		}
	}

	function closeSearch() {
		$.set(searchOpen, false);
	}

	function toggleSearch() {
		$.set(searchOpen, !$.get(searchOpen));
	}

	function handlePrefsEnter() {
		if (prefsCloseTimer) clearTimeout(prefsCloseTimer);

		$.set(prefsOpen, true);
	}

	function handlePrefsLeave() {
		prefsCloseTimer = setTimeout(() => $.set(prefsOpen, false), 150);
	}

	$.user_effect(() => {
		if (typeof window === 'undefined') return;

		const onKey = (event) => {
			if (event.key !== 'Escape') return;
			if ($.get(menuOpen)) $.set(menuOpen, false);
			if ($.get(prefsOpen)) $.set(prefsOpen, false);
		};

		window.addEventListener('keydown', onKey);

		return () => window.removeEventListener('keydown', onKey);
	});

	// Lock body scroll when mobile menu open
	$.user_effect(() => {
		if (typeof document === 'undefined') return;

		document.body.style.overflow = $.get(menuOpen) ? 'hidden' : '';

		return () => {
			document.body.style.overflow = '';
		};
	});

	// Close the landing mobile menu when tapping outside the navbar.
	$.user_effect(() => {
		if (typeof document === 'undefined' || showDocs() || !$.get(menuOpen)) return;

		const onPointerDown = (event) => {
			const target = event.target;

			if (target instanceof Node && $.get(navbarInnerEl)?.contains(target)) return;

			$.set(menuOpen, false);
		};

		document.addEventListener('pointerdown', onPointerDown);

		return () => document.removeEventListener('pointerdown', onPointerDown);
	});

	// Scroll listener
	$.user_effect(() => {
		if (typeof window === 'undefined') return;

		const onScroll = () => {
			$.set(scrolled, window.scrollY > 50);
		};

		onScroll();
		window.addEventListener('scroll', onScroll, { passive: true });

		return () => window.removeEventListener('scroll', onScroll);
	});

	// Reposition highlight on route change
	$.user_effect(() => {
		// reactive dep: pathname
		void page.url?.pathname;

		requestAnimationFrame(() => {
			const active = getActiveEl();

			if (active) positionHighlight(active);
		});
	});

	var fragment = root_5();
	var header = $.first_child(fragment);
	var div = $.child(header);
	var div_1 = $.child(div);
	var a = $.child(div_1);

	$.html(a, () => logoSvg, true);
	$.reset(a);

	var nav = $.sibling(a, 4);
	var div_2 = $.child(nav);

	$.bind_this(div_2, ($$value) => $.set(highlightEl, $$value), () => $.get(highlightEl));

	var node = $.sibling(div_2, 2);

	$.each(node, 17, () => NAV_LINKS, ({ label, to, match }) => to, ($$anchor, $$item) => {
		let label = () => $.get($$item).label;
		let to = () => $.get($$item).to;
		let match = () => $.get($$item).match;
		var a_1 = root();
		var text = $.only_child(a_1, true);

		$.template_effect(
			($0) => {
				$.set_class(a_1, 1, `ln-navbar-link ${$0 ?? ''}`);
				$.set_attribute(a_1, 'href', to());
				$.set_text(text, label());
			},
			[() => isActive(match()) ? 'ln-navbar-link-active' : '']
		);

		$.event('mouseenter', a_1, handleLinkHover);
		$.append($$anchor, a_1);
	});

	$.reset(nav);
	$.bind_this(nav, ($$value) => $.set(linksEl, $$value), () => $.get(linksEl));
	$.reset(div_1);

	var div_3 = $.sibling(div_1, 2);
	var button = $.child(div_3);
	var node_1 = $.sibling(button, 2);

	{
		var consequent_1 = ($$anchor) => {
			var div_4 = root_2();
			var node_2 = $.sibling($.child(div_4), 2);

			{
				var consequent = ($$anchor) => {
					var div_5 = root_1();
					var a_2 = $.only_child(div_5);

					$.delegated('click', a_2, () => $.set(prefsOpen, false));
					$.append($$anchor, div_5);
				};

				$.if(node_2, ($$render) => {
					if ($.get(prefsOpen)) $$render(consequent);
				});
			}

			$.reset(div_4);
			$.event('mouseenter', div_4, handlePrefsEnter);
			$.event('mouseleave', div_4, handlePrefsLeave);
			$.append($$anchor, div_4);
		};

		$.if(node_1, ($$render) => {
			if (showDocs()) $$render(consequent_1);
		});
	}

	var a_3 = $.sibling(node_1, 2);
	var span = $.sibling($.child(a_3), 2);
	var text_1 = $.only_child(span, true);

	$.reset(a_3);

	var button_1 = $.sibling(a_3, 2);

	$.reset(div_3);

	var node_3 = $.sibling(div_3, 2);

	{
		var consequent_2 = ($$anchor) => {
			var div_6 = root_4();
			var node_4 = $.child(div_6);

			$.each(node_4, 17, () => NAV_LINKS, ({ label, to }) => to, ($$anchor, $$item) => {
				let label = () => $.get($$item).label;
				let to = () => $.get($$item).to;
				var a_4 = root_3();
				var text_2 = $.only_child(a_4, true);

				$.template_effect(() => {
					$.set_attribute(a_4, 'href', to());
					$.set_text(text_2, label());
				});

				$.delegated('click', a_4, () => $.set(menuOpen, false));
				$.append($$anchor, a_4);
			});

			var a_5 = $.sibling(node_4, 2);
			var span_1 = $.sibling($.child(a_5), 2);
			var text_3 = $.only_child(span_1, true);

			$.reset(a_5);
			$.reset(div_6);

			$.template_effect(() => {
				$.set_attribute(a_5, 'href', GITHUB_URL);
				$.set_text(text_3, $.get(formattedStars));
			});

			$.delegated('click', a_5, () => $.set(menuOpen, false));
			$.append($$anchor, div_6);
		};

		$.if(node_3, ($$render) => {
			if ($.get(menuOpen) && !showDocs()) $$render(consequent_2);
		});
	}

	$.reset(div);
	$.bind_this(div, ($$value) => $.set(navbarInnerEl, $$value), () => $.get(navbarInnerEl));
	$.reset(header);

	var node_5 = $.sibling(header, 2);

	SearchDialog(node_5, {
		get isOpen() {
			return $.get(searchOpen);
		},
		onClose: closeSearch,
		onToggle: toggleSearch
	});

	$.template_effect(() => {
		$.set_class(header, 1, `ln-navbar ${$.get(scrolled) ? 'ln-navbar-scrolled' : ''} ${showDocs() ? 'ln-navbar-docs' : ''}`);
		$.set_attribute(a_3, 'href', GITHUB_URL);
		$.set_text(text_1, $.get(formattedStars));
		$.set_class(button_1, 1, `ln-navbar-hamburger ${$.get(menuOpen) ? 'open' : ''}`);
		$.set_attribute(button_1, 'aria-expanded', $.get(menuOpen));
	});

	$.event('mouseleave', nav, handleLinksLeave);
	$.delegated('click', button, toggleSearch);

	$.delegated('click', button_1, () => {
		if (showDocs()) {
			$$props.onhamburger?.();
		} else {
			$.set(menuOpen, !$.get(menuOpen));
		}
	});

	$.append($$anchor, fragment);
	$.pop();
}

$.delegate(['click']);