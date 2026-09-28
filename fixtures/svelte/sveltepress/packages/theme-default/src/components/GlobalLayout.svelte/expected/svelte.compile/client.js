import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { afterNavigate, beforeNavigate, onNavigate } from '$app/navigation';
import { page } from '$app/state';
import { onMount, setContext } from 'svelte';
import themeOptions from 'virtual:sveltepress/theme-default';
import { SVELTEPRESS_CONTEXT_KEY } from '../context';
import AjaxBar from './AjaxBar.svelte';
import Backdrop from './Backdrop.svelte';
import Error from './Error.svelte';
import GoogleAnalytics from './GoogleAnalytics.svelte';

import {
	anchors,
	isDark,
	navCollapsed,
	oldScrollY,
	resolveSidebar,
	scrollY,
	showHeader,
	showLayout,
	sidebar,
	sidebarCollapsed
} from './layout';

import Navbar from './Navbar.svelte';
import Sidebar from './Sidebar.svelte';
import Toc from './Toc.svelte';
import 'virtual:uno.css';
import '../style.css';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'children']);
var root = $.from_html(`<main><!> <!> <!> <!> <!> <!> <!></main>`);
var root_1 = $.from_html(`<!> <!>`, 1);

export default function GlobalLayout($$anchor, $$props) {
	$.push($$props, true);

	const $sidebarCollapsed = () => $.store_get(sidebarCollapsed, '$sidebarCollapsed', $$stores);
	const $navCollapsed = () => $.store_get(navCollapsed, '$navCollapsed', $$stores);
	const $oldScrollY = () => $.store_get(oldScrollY, '$oldScrollY', $$stores);
	const $scrollY = () => $.store_get(scrollY, '$scrollY', $$stores);
	const $showHeader = () => $.store_get(showHeader, '$showHeader', $$stores);
	const $showLayout = () => $.store_get(showLayout, '$showLayout', $$stores);
	const $sidebar = () => $.store_get(sidebar, '$sidebar', $$stores);
	const $anchors = () => $.store_get(anchors, '$anchors', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();

	/**
	 * @typedef {object} Props
	 * @property {import('svelte').Snippet} [children] The content of the page
	 */
	/** @type {Props & { [key: string]: any }} */
	const rest = $.rest_props($$props, rest_excludes);

	setContext(SVELTEPRESS_CONTEXT_KEY, { isDark });
	resolveSidebar(page.route.id);

	let ajaxBar = $.state(void 0);

	beforeNavigate(() => {
		$.get(ajaxBar)?.start();
	});

	afterNavigate(() => {
		$.get(ajaxBar)?.end();
		$.store_set(sidebarCollapsed, true);
		$.store_set(navCollapsed, true);
	});

	// Cross-page view transition: the brand logo and the search pill morph
	// smoothly between their home/docs positions (see the `svp-nav-vt` rules
	// in style.css). The page itself still swaps instantly.
	onNavigate((navigation) => {
		if (!document.startViewTransition) return;
		if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

		return new Promise((resolve) => {
			document.documentElement.classList.add('svp-nav-vt');

			const transition = document.startViewTransition(async () => {
				resolve();
				await navigation.complete;
			});

			transition.finished.finally(() => {
				document.documentElement.classList.remove('svp-nav-vt');
			});
		});
	});

	let pwaComponent = $.state(void 0);

	// Delegated handler for the "Expand code" bar on collapsed long code
	// blocks — the bar is emitted by the markdown pipeline as plain HTML.
	function handleCodeExpand(e) {
		if (e.type === 'keyup' && e.key !== 'Enter') return;

		const trigger = e.target?.closest?.('.svp-code-block--expand');

		if (trigger) {
			const wrapper = trigger.closest('.svp-code-block-wrapper');

			wrapper?.classList.remove('svp-code-block-wrapper--collapsed');
		}
	}

	onMount(async () => {
		if (themeOptions.pwa) $.set(pwaComponent, (await import('./pwa/Pwa.svelte')).default, true);
	});

	// eslint-disable-next-line no-unused-expressions
	rest;

	var fragment = root_1();

	$.event('scroll', $.window, () => $.store_set(oldScrollY, $scrollY()));
	$.event('click', $.window, handleCodeExpand);
	$.event('keyup', $.window, handleCodeExpand);

	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			Navbar($$anchor, {});
		};

		$.if(node, ($$render) => {
			if ($showHeader()) $$render(consequent);
		});
	}

	var node_1 = $.sibling(node, 2);

	{
		var consequent_1 = ($$anchor) => {
			Error($$anchor, {
				get error() {
					return page.error;
				}
			});
		};

		var consequent_2 = ($$anchor) => {
			var fragment_3 = $.comment();
			var node_2 = $.first_child(fragment_3);

			$.snippet(node_2, () => $$props.children ?? $.noop);
			$.append($$anchor, fragment_3);
		};

		var alternate = ($$anchor) => {
			var main = root();
			let classes;
			var node_3 = $.child(main);

			$.bind_this(AjaxBar(node_3, {}), ($$value) => $.set(ajaxBar, $$value, true), () => $.get(ajaxBar));

			var node_4 = $.sibling(node_3, 2);

			{
				var consequent_3 = ($$anchor) => {
					Sidebar($$anchor, {});
				};

				$.if(node_4, ($$render) => {
					if ($sidebar()) $$render(consequent_3);
				});
			}

			var node_5 = $.sibling(node_4, 2);

			{
				let $0 = $.derived(() => !$navCollapsed());

				Backdrop(node_5, {
					get show() {
						return $.get($0);
					},
					top: '56px',
					zIndex: 887,
					$$events: { close: () => $.store_set(navCollapsed, true) }
				});
			}

			var node_6 = $.sibling(node_5, 2);

			$.snippet(node_6, () => $$props.children ?? $.noop);

			var node_7 = $.sibling(node_6, 2);

			Toc(node_7, {
				get anchors() {
					return $anchors();
				}
			});

			var node_8 = $.sibling(node_7, 2);

			GoogleAnalytics(node_8, {});

			var node_9 = $.sibling(node_8, 2);

			{
				var consequent_4 = ($$anchor) => {
					const SvelteComponent = $.derived(() => $.get(pwaComponent));
					var fragment_5 = $.comment();
					var node_10 = $.first_child(fragment_5);

					$.component(node_10, () => $.get(SvelteComponent), ($$anchor, SvelteComponent_1) => {
						SvelteComponent_1($$anchor, {});
					});

					$.append($$anchor, fragment_5);
				};

				$.if(node_9, ($$render) => {
					if ($.get(pwaComponent)) $$render(consequent_4);
				});
			}

			$.reset(main);
			$.template_effect(() => classes = $.set_class(main, 1, 'svelte-vhwo7t', null, classes, { 'without-header': $showHeader() === false }));
			$.append($$anchor, main);
		};

		$.if(node_1, ($$render) => {
			if (page.error) $$render(consequent_1); else if ($showLayout() === false) $$render(consequent_2, 1); else $$render(alternate, -1);
		});
	}

	$.bind_window_scroll('y', $scrollY, ($$value) => $.store_set(scrollY, $$value));
	$.append($$anchor, fragment);
	$.pop();
	$$cleanup();
}