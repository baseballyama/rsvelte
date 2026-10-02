import * as $ from 'svelte/internal/server';
import { base } from '$app/paths';

export default function PostCardSmall($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const { post } = $$props;

		$$renderer.push(`<article class="sp-card-small svelte-69hb18"><a${$.attr('href', `${base}/posts/${post.slug}/`)} class="sp-card-small__link svelte-69hb18">`);

		if (post.tags.length) {
			$$renderer.push(`<!--[0--><div class="sp-card__tags svelte-69hb18"><!--[-->`);

			const each_array = $.ensure_array_like(post.tags);

			for (let i = 0, $$length = each_array.length; i < $$length; i++) {
				let tag = each_array[i];

				$$renderer.push(`<span class="sp-card__tag svelte-69hb18"${$.attr_style(`view-transition-name: sp-tag-${$.stringify(post.slug)}-${$.stringify(i)}`)}>${$.escape(tag)}</span>`);
			}

			$$renderer.push(`<!--]--></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> <h2 class="sp-card-small__title svelte-69hb18"${$.attr_style(`view-transition-name: sp-title-${$.stringify(post.slug)}`)}>${$.escape(post.title)}</h2> <p class="sp-card-small__quote svelte-69hb18"${$.attr_style(`view-transition-name: sp-excerpt-${$.stringify(post.slug)}`)}>${$.escape(post.excerpt)}</p> <div class="sp-card__meta svelte-69hb18"><time${$.attr_style(`view-transition-name: sp-date-${$.stringify(post.slug)}`)}>${$.escape(post.date)}</time> <span${$.attr_style(`view-transition-name: sp-reading-${$.stringify(post.slug)}`)}>${$.escape(post.readingTime)} min read</span></div></a></article>`);
	});
}