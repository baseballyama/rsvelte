import * as $ from 'svelte/internal/server';
import { base } from '$app/paths';

export default function PostCardFeatured($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const { post } = $$props;
		const coverSrc = $.derived(() => post.cover && post.cover.startsWith('/') && !post.cover.startsWith('//') ? `${base}${post.cover}` : post.cover);

		$$renderer.push(`<article class="sp-card-featured svelte-obae1p"><a${$.attr('href', `${base}/posts/${post.slug}/`)} class="sp-card-featured__link svelte-obae1p"><div class="sp-card-featured__bg svelte-obae1p"${$.attr_style(`${coverSrc()
			? `background-image:url(${coverSrc()})`
			: 'background:linear-gradient(135deg,#ea580c 0%,#dc2626 50%,#9a3412 100%)'}; view-transition-name: sp-cover-${post.slug}`)}><div class="sp-card-featured__overlay svelte-obae1p">`);

		if (post.tags.length) {
			$$renderer.push(`<!--[0--><div class="sp-card-featured__tags svelte-obae1p"><!--[-->`);

			const each_array = $.ensure_array_like(post.tags);

			for (let i = 0, $$length = each_array.length; i < $$length; i++) {
				let tag = each_array[i];

				$$renderer.push(`<span class="sp-card-featured__tag svelte-obae1p"${$.attr_style(`view-transition-name: sp-tag-${$.stringify(post.slug)}-${$.stringify(i)}`)}>${$.escape(tag)}</span>`);
			}

			$$renderer.push(`<!--]--></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> <h2 class="sp-card-featured__title svelte-obae1p"${$.attr_style(`view-transition-name: sp-title-${$.stringify(post.slug)}`)}>${$.escape(post.title)}</h2> <p class="sp-card-featured__excerpt svelte-obae1p"${$.attr_style(`view-transition-name: sp-excerpt-${$.stringify(post.slug)}`)}>${$.escape(post.excerpt)}</p> <div class="sp-card__meta sp-card__meta--light svelte-obae1p"><time${$.attr_style(`view-transition-name: sp-date-${$.stringify(post.slug)}`)}>${$.escape(post.date)}</time> <span${$.attr_style(`view-transition-name: sp-reading-${$.stringify(post.slug)}`)}>${$.escape(post.readingTime)} min read</span></div></div></div></a></article>`);
	});
}