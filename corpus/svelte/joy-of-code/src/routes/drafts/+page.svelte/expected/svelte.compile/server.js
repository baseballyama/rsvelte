import * as $ from 'svelte/internal/server';
import { fade } from 'svelte/transition';
import Heading from '$lib/ui/heading.svelte';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { data } = $$props;

		$.head('1nln88x', $$renderer, ($$renderer) => {
			$$renderer.title(($$renderer) => {
				$$renderer.push(`<title>Drafts</title>`);
			});

			$$renderer.push(`<meta${$.attr('content', `List of ${$.stringify(data.posts.length)} posts.`)} name="description"/>`);
		});

		Heading($$renderer, {
			children: ($$renderer) => {
				$$renderer.push(`<!---->Drafts`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <section class="svelte-1nln88x"><div class="container svelte-1nln88x"><h3>Drafts</h3> <div><span class="results svelte-1nln88x">${$.escape(data.posts.length)}</span> results</div></div> <div class="posts svelte-1nln88x"><!--[-->`);

		const each_array = $.ensure_array_like(data.posts);

		for (let i = 0, $$length = each_array.length; i < $$length; i++) {
			let post = each_array[i];

			$$renderer.push(`<div><a${$.attr('href', `/drafts/${$.stringify(post.slug)}`)} class="svelte-1nln88x"><article class="post svelte-1nln88x"><div class="details"><span class="title svelte-1nln88x">${$.escape(post.title)}</span></div></article></a></div>`);
		}

		$$renderer.push(`<!--]--></div></section>`);
	});
}