import * as $ from 'svelte/internal/server';
import { getContext, onDestroy } from 'svelte';
import { groupKey } from './ToggleGroup.svelte';

export default function TogglePanel($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		const panel = {};
		const { registerPanel, unregisterPanel, selectedPanel } = getContext(groupKey);

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