import * as $ from 'svelte/internal/server';
import { base } from '$app/paths';
import { blogConfig } from 'virtual:sveltepress/blog-config';

export default function PostMeta($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const { post } = $$props;
		const avatar = $.derived(() => blogConfig.author?.avatar);

		function href(to) {
			if ((/^(?:[a-z]+:)?\/\//i).test(to)) return to;

			return to.startsWith('/') ? `${base}${to}` : to;
		}

		$$renderer.push(`<div class="sp-post-meta svelte-ah1ck6">`);

		if (avatar()) {
			$$renderer.push(`<!--[0--><img class="sp-post-meta__avatar svelte-ah1ck6"${$.attr('src', href(avatar()))} alt="" width="24" height="24"/>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> `);

		if (post.author) {
			$$renderer.push(`<!--[0--><span class="sp-post-meta__author svelte-ah1ck6">By <b class="svelte-ah1ck6">${$.escape(post.author)}</b></span> <span class="sp-post-meta__sep svelte-ah1ck6">·</span>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> <time class="sp-post-meta__date"${$.attr_style(`view-transition-name: sp-date-${$.stringify(post.slug)}`)}>${$.escape(post.date)}</time> <span class="sp-post-meta__sep svelte-ah1ck6">·</span> <span${$.attr_style(`view-transition-name: sp-reading-${$.stringify(post.slug)}`)}>${$.escape(post.readingTime)} min read</span> `);

		if (post.category) {
			$$renderer.push(`<!--[0--><span class="sp-post-meta__sep svelte-ah1ck6">·</span> <span class="sp-post-meta__filed svelte-ah1ck6">Filed under <b class="svelte-ah1ck6">${$.escape(post.category)}</b></span>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> `);

		if (post.tags.length) {
			$$renderer.push(`<!--[0--><div class="sp-post-meta__tags svelte-ah1ck6"><!--[-->`);

			const each_array = $.ensure_array_like(post.tags);

			for (let i = 0, $$length = each_array.length; i < $$length; i++) {
				let tag = each_array[i];

				$$renderer.push(`<a${$.attr('href', `${base}/tags/${tag}/`)} class="sp-post-meta__tag svelte-ah1ck6"${$.attr_style(`view-transition-name: sp-tag-${$.stringify(post.slug)}-${$.stringify(i)}`)}>${$.escape(tag)}</a>`);
			}

			$$renderer.push(`<!--]--></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></div>`);
	});
}