import * as $ from 'svelte/internal/server';
import Icon from '@iconify/svelte';
import { fade } from 'svelte/transition';
import { createEventDispatcher } from 'svelte';

export default function Tabs($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const dispatch = createEventDispatcher();
		let { tabs, active_tab_id = tabs[0]?.id } = $$props;

		if (tabs.length > 1) {
			$$renderer.push(`<!--[0--><div class="tabs svelte-h216gr"><!--[-->`);

			const each_array = $.ensure_array_like(tabs);

			for (let i = 0, $$length = each_array.length; i < $$length; i++) {
				let tab = each_array[i];

				$$renderer.push(`<button${$.attr('id', tab.id ? `tab-${tab.id}` : null)}${$.attr_class('svelte-h216gr', void 0, { 'active': active_tab_id === tab.id })}>`);

				if (tab.icon) {
					$$renderer.push('<!--[0-->');
					Icon($$renderer, { icon: tab.icon });
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--> ${$.escape(typeof tab === 'string' ? tab : tab.label)}</button>`);
			}

			$$renderer.push(`<!--]--></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);
		$.bind_props($$props, { active_tab_id });
	});
}