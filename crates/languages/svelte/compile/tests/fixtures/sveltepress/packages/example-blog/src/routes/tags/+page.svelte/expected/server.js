import * as $ from 'svelte/internal/server';
import { base } from '$app/paths';
import { tags } from 'virtual:sveltepress/blog-tags-index';

export default function _page($$renderer) {
	$$renderer.push(`<div class="sp-tags-page svelte-2y1kba"><h1 class="sp-tags-page__title svelte-2y1kba">All Tags</h1> <div class="sp-tags-page__grid svelte-2y1kba"><!--[-->`);

	const each_array = $.ensure_array_like(tags);

	for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
		let { name, count } = each_array[$$index];

		$$renderer.push(`<a${$.attr('href', `${$.stringify(base)}/tags/${$.stringify(name)}/`)} class="sp-tag-pill svelte-2y1kba">#${$.escape(name)} <span class="sp-tag-pill__count svelte-2y1kba">${$.escape(count)}</span></a>`);
	}

	$$renderer.push(`<!--]--></div></div>`);
}