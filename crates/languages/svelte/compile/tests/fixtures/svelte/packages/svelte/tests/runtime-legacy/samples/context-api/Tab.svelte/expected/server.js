import * as $ from 'svelte/internal/server';
import { getContext, onDestroy } from 'svelte';
import { TABS } from './Tabs.svelte';

export default function Tab($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		const tab = {};
		const { registerTab, unregisterTab, selectTab, selectedTab } = getContext(TABS);

		registerTab(tab);

		onDestroy(() => {
			unregisterTab(tab);
		});

		$$renderer.push(`<button${$.attr_class('', void 0, {
			'selected': $.store_get($$store_subs ??= {}, '$selectedTab', selectedTab) === tab
		})}><!--[-->`);

		$.slot($$renderer, $$props, 'default', {}, null);
		$$renderer.push(`<!--]--></button>`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}