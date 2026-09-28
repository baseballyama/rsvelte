import * as $ from 'svelte/internal/server';
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

export default function GlobalLayout($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;

		/**
		 * @typedef {object} Props
		 * @property {import('svelte').Snippet} [children] The content of the page
		 */
		/** @type {Props & { [key: string]: any }} */
		const { children, $$slots, $$events, ...rest } = $$props;

		setContext(SVELTEPRESS_CONTEXT_KEY, { isDark });
		resolveSidebar(page.route.id);

		let ajaxBar = void 0;

		beforeNavigate(() => {
			ajaxBar?.start();
		});

		afterNavigate(() => {
			ajaxBar?.end();
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

		let pwaComponent = void 0;

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
			if (themeOptions.pwa) pwaComponent = (await import('./pwa/Pwa.svelte')).default;
		});

		// eslint-disable-next-line no-unused-expressions
		rest;

		if ($.store_get($$store_subs ??= {}, '$showHeader', showHeader)) {
			$$renderer.push('<!--[0-->');
			Navbar($$renderer, {});
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> `);

		if (page.error) {
			$$renderer.push('<!--[0-->');
			Error($$renderer, { error: page.error });
		} else if ($.store_get($$store_subs ??= {}, '$showLayout', showLayout) === false) {
			$$renderer.push('<!--[1-->');
			children?.($$renderer);
			$$renderer.push(`<!---->`);
		} else {
			$$renderer.push(`<!--[-1--><main${$.attr_class('svelte-vhwo7t', void 0, {
				'without-header': $.store_get($$store_subs ??= {}, '$showHeader', showHeader) === false
			})}>`);

			AjaxBar($$renderer, {});
			$$renderer.push(`<!----> `);

			if ($.store_get($$store_subs ??= {}, '$sidebar', sidebar)) {
				$$renderer.push('<!--[0-->');
				Sidebar($$renderer, {});
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> `);

			Backdrop($$renderer, {
				show: !$.store_get($$store_subs ??= {}, '$navCollapsed', navCollapsed),
				top: '56px',
				zIndex: 887
			});

			$$renderer.push(`<!----> `);
			children?.($$renderer);
			$$renderer.push(`<!----> `);

			Toc($$renderer, {
				anchors: $.store_get($$store_subs ??= {}, '$anchors', anchors)
			});

			$$renderer.push(`<!----> `);
			GoogleAnalytics($$renderer, {});
			$$renderer.push(`<!----> `);

			if (pwaComponent) {
				$$renderer.push('<!--[0-->');

				const SvelteComponent = pwaComponent;

				if (SvelteComponent) {
					$$renderer.push('<!--[-->');
					SvelteComponent($$renderer, {});
					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></main>`);
		}

		$$renderer.push(`<!--]-->`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}