import * as $ from 'svelte/internal/server';
import themeOptions from 'virtual:sveltepress/theme-default';
import MenuOpen from './icons/MenuOpen.svelte';
import { sidebarCollapsed, tocCollapsed } from './layout';
import { DEFAULT_ON_THIS_PAGE } from './Toc.svelte';

export default function MobileSubNav($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;

		function openSidebar() {
			$.store_set(sidebarCollapsed, false);
		}

		function openToc() {
			$.store_set(tocCollapsed, false);
		}

		$$renderer.push(`<nav class="sub-nav svelte-12ibwkt" aria-label="Browse docs"><div role="button" tabindex="0" class="text-6">`);
		MenuOpen($$renderer, {});
		$$renderer.push(`<!----></div> <div role="button" tabindex="0">${$.escape(themeOptions?.i18n?.onThisPage || DEFAULT_ON_THIS_PAGE)}</div></nav>`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}