import * as $ from 'svelte/internal/server';
import { page } from '$app/stores';
import { base } from '$app/paths';
import { pathIsCurrent } from './pathUtils';

export default function Contents($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let { contents = [] } = $$props;

		$$renderer.push(`<nav aria-label="Docs" class="svelte-j67pqd"><ul class="sidebar svelte-j67pqd"><!--[-->`);

		const each_array = $.ensure_array_like(contents);

		for (let $$index_1 = 0, $$length = each_array.length; $$index_1 < $$length; $$index_1++) {
			let section = each_array[$$index_1];

			$$renderer.push(`<li class="svelte-j67pqd"><span class="section svelte-j67pqd">${$.escape(section.title)}</span> <ul class="svelte-j67pqd"><!--[-->`);

			const each_array_1 = $.ensure_array_like(section.pages);

			for (let $$index = 0, $$length = each_array_1.length; $$index < $$length; $$index++) {
				let { title, path } = each_array_1[$$index];

				$$renderer.push(`<li class="svelte-j67pqd"><a data-sveltekit-preload-data="" class="page svelte-j67pqd"${$.attr('aria-current', pathIsCurrent(path, $.store_get($$store_subs ??= {}, '$page', page)) ? 'page' : undefined)}${$.attr('href', base + path)}>${$.escape(title)}</a></li>`);
			}

			$$renderer.push(`<!--]--></ul></li>`);
		}

		$$renderer.push(`<!--]--></ul></nav>`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}