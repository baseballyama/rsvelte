import * as $ from 'svelte/internal/server';
import { base } from '$app/paths';

export default function RelatedPosts($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const { posts } = $$props;

		if (posts.length) {
			$$renderer.push(`<!--[0--><section class="sp-related svelte-cu8mwp" aria-label="Related posts"><h2 class="sp-related__title svelte-cu8mwp">Related posts</h2> <ul class="sp-related__grid svelte-cu8mwp"><!--[-->`);

			const each_array = $.ensure_array_like(posts);

			for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
				let p = each_array[$$index];

				$$renderer.push(`<li><a class="sp-related__card svelte-cu8mwp"${$.attr('href', `${base}/posts/${p.slug}/`)}><span class="sp-related__date svelte-cu8mwp">${$.escape(p.date)}</span> <span class="sp-related__heading svelte-cu8mwp">${$.escape(p.title)}</span> <span class="sp-related__excerpt svelte-cu8mwp">${$.escape(p.excerpt)}</span></a></li>`);
			}

			$$renderer.push(`<!--]--></ul></section>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);
	});
}