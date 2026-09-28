import * as $ from 'svelte/internal/server';
import Heading from '$lib/ui/heading.svelte';
import { fade } from 'svelte/transition';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { data } = $$props;

		$.head('1d6nxft', $$renderer, ($$renderer) => {
			$$renderer.title(($$renderer) => {
				$$renderer.push(`<title>Archive</title>`);
			});

			$$renderer.push(`<meta${$.attr('content', `List of ${$.stringify(data.posts.length)} posts.`)} name="description"/>`);
		});

		Heading($$renderer, {
			children: ($$renderer) => {
				$$renderer.push(`<!---->Archive`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <section class="svelte-1d6nxft"><div class="container svelte-1d6nxft"><h3>Posts</h3> <div><span class="results svelte-1d6nxft">${$.escape(data.posts.length)}</span> results</div></div> <div class="posts svelte-1d6nxft"><!--[-->`);

		const each_array = $.ensure_array_like(data.posts);

		for (let i = 0, $$length = each_array.length; i < $$length; i++) {
			let post = each_array[i];

			$$renderer.push(`<div><a${$.attr('href', `/${$.stringify(post.slug)}`)} class="svelte-1d6nxft"><article class="post svelte-1d6nxft"><div class="details"><span class="title svelte-1d6nxft"${$.attr_style('', { '--view-transition-name': post.slug })}>${$.escape(post.title)}</span></div></article></a></div>`);
		}

		$$renderer.push(`<!--]--></div></section>`);
	});
}