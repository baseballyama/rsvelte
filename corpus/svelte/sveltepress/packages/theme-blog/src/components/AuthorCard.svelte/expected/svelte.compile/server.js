import * as $ from 'svelte/internal/server';
import { blogConfig } from 'virtual:sveltepress/blog-config';

export default function AuthorCard($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const author = $.derived(() => blogConfig.author);

		if (author()) {
			$$renderer.push(`<!--[0--><section class="sp-author svelte-k4dbg4" aria-label="About the author">`);

			if (author().avatar) {
				$$renderer.push(`<!--[0--><img class="sp-author__avatar svelte-k4dbg4"${$.attr('src', author().avatar)} alt="" width="56" height="56" loading="lazy"/>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> <div class="sp-author__body"><p class="sp-author__name svelte-k4dbg4">${$.escape(author().name)}</p> `);

			if (author().bio) {
				$$renderer.push(`<!--[0--><p class="sp-author__bio svelte-k4dbg4">${$.escape(author().bio)}</p>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></div></section>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);
	});
}