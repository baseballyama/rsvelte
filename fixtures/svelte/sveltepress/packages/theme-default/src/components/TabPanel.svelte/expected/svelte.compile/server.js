import * as $ from 'svelte/internal/server';
import { getContext } from 'svelte';
import { activeNameContextKey, itemsKey } from './Tabs.svelte';

export default function TabPanel($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;

		const {
			name,
			activeIcon = undefined,
			inactiveIcon = undefined,
			children
		} = $$props;

		const current = getContext(activeNameContextKey);
		const items = getContext(itemsKey);

		$.store_get($$store_subs ??= {}, '$items', items).push({ name, activeIcon, inactiveIcon });

		// eslint-disable-next-line no-self-assign
		$.store_set(items, $.store_get($$store_subs ??= {}, '$items', items));

		if (name === $.store_get($$store_subs ??= {}, '$current', current)) {
			$$renderer.push(`<!--[0--><div class="tab-panel">`);
			children?.($$renderer);
			$$renderer.push(`<!----></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}