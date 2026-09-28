import * as $ from 'svelte/internal/server';
import { page } from '$app/stores';
import { SUB_NAV } from '$lib/constants/nav';
import Icon from '$lib/components/global/Icon.svelte';

export default function _layout($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let { children } = $$props;
		const pages = SUB_NAV['/reference']?.flatMap((s) => 'items' in s ? s.items : [s]) ?? [];
		const idx = $.derived(() => pages.findIndex((p) => p.href === ($.store_get($$store_subs ??= {}, '$page', page).url?.pathname ?? '/')));
		const isRef = $.derived(() => idx() > -1);
		const prev = $.derived(() => pages[idx() - 1]);
		const next = $.derived(() => pages[idx() + 1]);
		const progress = $.derived(() => isRef() ? (idx() + 1) / pages.length * 100 : 0);

		const nav = $.derived(() => [
			{ item: prev(), side: 'Previous', icon: 'previous' },
			{ item: next(), side: 'Next', icon: 'next' }
		]);

		children?.($$renderer);
		$$renderer.push(`<!----> `);

		if (isRef()) {
			$$renderer.push(`<!--[0--><nav class="ref-nav card svelte-2zju3r"><div class="nav-buttons svelte-2zju3r"><!--[-->`);

			const each_array = $.ensure_array_like(nav());

			for (let index = 0, $$length = each_array.length; index < $$length; index++) {
				let { item, side, icon } = each_array[index];

				if (item) {
					$$renderer.push(`<!--[0--><a${$.attr('href', item.href)}${$.attr_class('nav-btn svelte-2zju3r', void 0, { 'next': side === 'Next' })}>`);
					Icon($$renderer, { name: icon });
					$$renderer.push(`<!----> <div><div class="label svelte-2zju3r">${$.escape(side)}</div> <div class="title svelte-2zju3r">${$.escape(item.label)}</div></div></a>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]-->`);
			}

			$$renderer.push(`<!--]--></div> <div class="progress svelte-2zju3r">${$.escape(idx() + 1)} of ${$.escape(pages.length)} <div class="progress-bar svelte-2zju3r"><div class="progress-fill svelte-2zju3r"${$.attr_style('', { width: `${progress()}%` })}></div></div></div></nav>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}