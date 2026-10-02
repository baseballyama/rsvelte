import * as $ from 'svelte/internal/server';
import { fade } from 'svelte/transition';
import { formatDate } from '$lib/utils';

export default function Posts($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { posts, title, more } = $$props;

		$$renderer.push(`<section class="svelte-55b60l">`);
		title?.($$renderer);
		$$renderer.push(`<!----> <div class="cards"><!--[-->`);

		const each_array = $.ensure_array_like(posts);

		for (let i = 0, $$length = each_array.length; i < $$length; i++) {
			let post = each_array[i];

			$$renderer.push(`<div><article class="card svelte-55b60l"><a${$.attr('href', `/${$.stringify(post.slug)}`)} class="svelte-55b60l"><div class="title svelte-55b60l"${$.attr_style('', { 'view-transition-name': post.slug })}>${$.escape(post.title)}</div></a> <div class="published svelte-55b60l">Published ${$.escape(formatDate(post.published))}</div> <p class="description svelte-55b60l">${$.escape(post.description)}</p></article></div>`);
		}

		$$renderer.push(`<!--]--></div> `);
		more?.($$renderer);
		$$renderer.push(`<!----></section>`);
	});
}