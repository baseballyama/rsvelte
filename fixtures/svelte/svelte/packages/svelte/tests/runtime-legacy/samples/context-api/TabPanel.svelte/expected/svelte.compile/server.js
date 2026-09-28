import * as $ from 'svelte/internal/server';
import { getContext, onDestroy } from 'svelte';
import { TABS } from './Tabs.svelte';

export default function TabPanel($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		const panel = {};
		const { registerPanel, unregisterPanel, selectedPanel } = getContext(TABS);

		registerPanel(panel);

		onDestroy(() => {
			unregisterPanel(panel);
		});

		if ($.store_get($$store_subs ??= {}, '$selectedPanel', selectedPanel) === panel) {
			$$renderer.push(`<!--[0--><!--[-->`);
			$.slot($$renderer, $$props, 'default', {}, null);
			$$renderer.push(`<!--]-->`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}