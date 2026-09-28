import * as $ from 'svelte/internal/server';
import { page } from '$app/stores';
import NavMenu from './NavMenu.svelte';

export default function NavMenu_1($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let { items } = $$props;

		$$renderer.push(`<!--[-->`);

		const each_array = $.ensure_array_like(Object.entries(items));

		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let [title, value] = each_array[$$index];

			if (typeof value === 'string') {
				$$renderer.push('<!--[0-->');

				const href = `/svelte-canvas${value}`;

				$$renderer.push(`<a${$.attr('href', href)}${$.attr_class('svelte-1uzwzmu', void 0, {
					'active': $.store_get($$store_subs ??= {}, '$page', page).url.pathname.replace(/\/$/, '') === href
				})}>${$.escape(title)}</a>`);
			} else if (typeof value === 'object') {
				$$renderer.push(`<!--[1--><p class="svelte-1uzwzmu">${$.escape(title)}</p> `);
				NavMenu($$renderer, { items: value });
				$$renderer.push(`<!---->`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]-->`);
		}

		$$renderer.push(`<!--]-->`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}