import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { afterNavigate } from '$app/navigation';
import { page } from '$app/state';
import Backdrop from './Backdrop.svelte';
import Close from './icons/Close.svelte';
import { resolvedSidebar, resolveSidebar, sidebarCollapsed } from './layout';
import Logo from './Logo.svelte';
import SidebarGroup from './SidebarGroup.svelte';

var root = $.from_html(`<aside><div class="sidebar-logo svelte-1bf6b9s"><!> <div class="close svelte-1bf6b9s" role="button" tabindex="0"><!></div></div> <!></aside> <!>`, 1);

export default function Sidebar($$anchor, $$props) {
	$.push($$props, true);

	const $sidebarCollapsed = () => $.store_get(sidebarCollapsed, '$sidebarCollapsed', $$stores);
	const $resolvedSidebar = () => $.store_get(resolvedSidebar, '$resolvedSidebar', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	const routeId = $.derived(() => page.route.id);
	const isHome = $.derived(() => $.get(routeId) === '/');

	afterNavigate(() => {
		resolveSidebar($.get(routeId));
	});

	function handleClose() {
		$.store_set(sidebarCollapsed, true);
	}

	var fragment = root();
	var aside = $.first_child(fragment);
	let classes;
	var div = $.child(aside);
	var node = $.child(div);

	Logo(node, {});

	var div_1 = $.sibling(node, 2);
	var node_1 = $.child(div_1);

	Close(node_1, {});
	$.reset(div_1);
	$.reset(div);

	var node_2 = $.sibling(div, 2);

	$.each(node_2, 1, $resolvedSidebar, $.index, ($$anchor, sidebarItem) => {
		const hasItems = $.derived(() => Array.isArray($.get(sidebarItem).items));

		SidebarGroup($$anchor, $.spread_props(() => $.get(hasItems)
			? $.get(sidebarItem)
			: { title: '', items: [$.get(sidebarItem)] }));
	});

	$.reset(aside);

	var node_3 = $.sibling(aside, 2);

	{
		let $0 = $.derived(() => !$sidebarCollapsed());

		Backdrop(node_3, {
			get show() {
				return $.get($0);
			},
			$$events: { close: handleClose }
		});
	}

	$.template_effect(() => classes = $.set_class(aside, 1, 'theme-default-sidebar svelte-1bf6b9s', null, classes, { collapsed: $sidebarCollapsed(), 'is-home': $.get(isHome) }));
	$.delegated('click', div_1, handleClose);
	$.delegated('keyup', div_1, handleClose);
	$.append($$anchor, fragment);
	$.pop();
	$$cleanup();
}

$.delegate(['click', 'keyup']);