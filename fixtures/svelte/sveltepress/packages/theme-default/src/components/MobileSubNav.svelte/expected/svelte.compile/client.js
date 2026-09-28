import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import themeOptions from 'virtual:sveltepress/theme-default';
import MenuOpen from './icons/MenuOpen.svelte';
import { sidebarCollapsed, tocCollapsed } from './layout';
import { DEFAULT_ON_THIS_PAGE } from './Toc.svelte';

var root = $.from_html(`<nav class="sub-nav svelte-12ibwkt" aria-label="Browse docs"><div role="button" tabindex="0" class="text-6"><!></div> <div role="button" tabindex="0"> </div></nav>`);

export default function MobileSubNav($$anchor, $$props) {
	$.push($$props, true);

	const $sidebarCollapsed = () => $.store_get(sidebarCollapsed, '$sidebarCollapsed', $$stores);
	const $tocCollapsed = () => $.store_get(tocCollapsed, '$tocCollapsed', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();

	function openSidebar() {
		$.store_set(sidebarCollapsed, false);
	}

	function openToc() {
		$.store_set(tocCollapsed, false);
	}

	var nav = root();
	var div = $.child(nav);
	var node = $.child(div);

	MenuOpen(node, {});
	$.reset(div);

	var div_1 = $.sibling(div, 2);
	var text = $.only_child(div_1, true);

	$.reset(nav);
	$.template_effect(() => $.set_text(text, themeOptions?.i18n?.onThisPage || DEFAULT_ON_THIS_PAGE));
	$.delegated('click', div, openSidebar);
	$.event('keypress', div, openSidebar);
	$.delegated('click', div_1, openToc);
	$.event('keypress', div_1, openToc);
	$.append($$anchor, nav);
	$.pop();
	$$cleanup();
}

$.delegate(['click']);