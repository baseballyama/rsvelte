import * as $ from 'svelte/internal/server';
import { base } from '$app/paths';

export default function PostNav($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const { prev, next } = $$props;

		$$renderer.push(`<nav class="sp-post-nav svelte-1f3exj4">`);

		if (prev) {
			$$renderer.push(`<!--[0--><a${$.attr('href', `${base}/posts/${prev.slug}/`)} class="sp-post-nav__item sp-post-nav__item--prev svelte-1f3exj4"><span class="sp-post-nav__dir svelte-1f3exj4">← 上一篇</span> <span class="sp-post-nav__title svelte-1f3exj4">${$.escape(prev.title)}</span></a>`);
		} else {
			$$renderer.push(`<!--[-1--><div></div>`);
		}

		$$renderer.push(`<!--]--> `);

		if (next) {
			$$renderer.push(`<!--[0--><a${$.attr('href', `${base}/posts/${next.slug}/`)} class="sp-post-nav__item sp-post-nav__item--next svelte-1f3exj4"><span class="sp-post-nav__dir svelte-1f3exj4">下一篇 →</span> <span class="sp-post-nav__title svelte-1f3exj4">${$.escape(next.title)}</span></a>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></nav>`);
	});
}