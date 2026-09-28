import * as $ from 'svelte/internal/server';
import { base } from '$app/paths';

export default function PostHero($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const { post } = $$props;
		const coverSrc = $.derived(() => post.cover && post.cover.startsWith('/') && !post.cover.startsWith('//') ? `${base}${post.cover}` : post.cover);

		$$renderer.push(`<header class="sp-post-hero svelte-be2e0x"${$.attr_style(`${coverSrc() ? `--hero-bg: url(${coverSrc()});` : ''} view-transition-name: sp-cover-${post.slug}`)}><div class="sp-post-hero__overlay svelte-be2e0x">`);

		if (post.category) {
			$$renderer.push(`<!--[0--><span class="sp-post-hero__cat svelte-be2e0x">${$.escape(post.category)}</span>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> <h1 class="sp-post-hero__title svelte-be2e0x"${$.attr_style(`view-transition-name: sp-title-${$.stringify(post.slug)}`)}>${$.escape(post.title)}</h1> <p class="sp-post-hero__subtitle svelte-be2e0x"${$.attr_style(`view-transition-name: sp-excerpt-${$.stringify(post.slug)}`)}>${$.escape(post.excerpt)}</p></div></header>`);
	});
}