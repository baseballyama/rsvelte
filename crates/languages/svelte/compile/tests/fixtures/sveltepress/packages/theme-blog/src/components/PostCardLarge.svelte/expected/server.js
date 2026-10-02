import * as $ from 'svelte/internal/server';
import { base } from '$app/paths';

export default function PostCardLarge($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const { post } = $$props;

		// Base-prefix site-absolute cover paths so they resolve under a subpath
		// deploy. External URLs pass through unchanged.
		const coverSrc = $.derived(() => post.cover && post.cover.startsWith('/') && !post.cover.startsWith('//') ? `${base}${post.cover}` : post.cover);

		// Hash tag name to one of the Ember gradients for cover fallback
		const GRADIENTS = [
			'linear-gradient(135deg,#ea580c,#dc2626)',
			'linear-gradient(135deg,#f59e0b,#ea580c)',
			'linear-gradient(135deg,#c2410c,#9a3412)',
			'linear-gradient(135deg,#b45309,#d97706)',
			'linear-gradient(135deg,#dc2626,#7c2d12)'
		];

		function tagGradient(tag) {
			let hash = 0;

			for (const ch of tag) hash = hash * 31 + ch.charCodeAt(0) >>> 0;

			return GRADIENTS[hash % GRADIENTS.length];
		}

		const gradient = $.derived(() => post.tags[0] ? tagGradient(post.tags[0]) : GRADIENTS[0]);

		$$renderer.push(`<article class="sp-card-large svelte-1ujso14"><a${$.attr('href', `${base}/posts/${post.slug}/`)} class="sp-card-large__link svelte-1ujso14"><div class="sp-card-large__cover-frame svelte-1ujso14"${$.attr_style(`view-transition-name: sp-cover-${$.stringify(post.slug)}`)}>`);

		if (post.cover) {
			$$renderer.push(`<!--[0--><img${$.attr('src', coverSrc())}${$.attr('alt', post.title)} class="sp-card-large__cover svelte-1ujso14" width="800" height="400" loading="lazy" decoding="async"/>`);
		} else {
			$$renderer.push(`<!--[-1--><div class="sp-card-large__cover sp-card-large__cover--gradient svelte-1ujso14"${$.attr_style(`background:${$.stringify(gradient())}`)}></div>`);
		}

		$$renderer.push(`<!--]--></div> <div class="sp-card-large__body svelte-1ujso14">`);

		if (post.tags.length) {
			$$renderer.push(`<!--[0--><div class="sp-card__tags svelte-1ujso14"><!--[-->`);

			const each_array = $.ensure_array_like(post.tags);

			for (let i = 0, $$length = each_array.length; i < $$length; i++) {
				let tag = each_array[i];

				$$renderer.push(`<span class="sp-card__tag svelte-1ujso14"${$.attr_style(`view-transition-name: sp-tag-${$.stringify(post.slug)}-${$.stringify(i)}`)}>${$.escape(tag)}</span>`);
			}

			$$renderer.push(`<!--]--></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> <h2 class="sp-card-large__title svelte-1ujso14"${$.attr_style(`view-transition-name: sp-title-${$.stringify(post.slug)}`)}>${$.escape(post.title)}</h2> <p class="sp-card-large__excerpt svelte-1ujso14"${$.attr_style(`view-transition-name: sp-excerpt-${$.stringify(post.slug)}`)}>${$.escape(post.excerpt)}</p> <div class="sp-card__meta svelte-1ujso14"><time${$.attr_style(`view-transition-name: sp-date-${$.stringify(post.slug)}`)}>${$.escape(post.date)}</time> <span${$.attr_style(`view-transition-name: sp-reading-${$.stringify(post.slug)}`)}>${$.escape(post.readingTime)} min read</span></div></div></a></article>`);
	});
}