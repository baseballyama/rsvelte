import * as $ from 'svelte/internal/server';
import { resolve } from '$app/paths';
import SubsetHTML from '$lib/SubsetHTML.svelte';
import { timeAgo } from '$lib/utils';
import CommentElement from './Comment.svelte';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const { data } = $$props;

		const algoliaItem = $.derived(() => data.algoliaItem),
			pollOptions = $.derived(() => data.pollOptions),
			now = $.derived(() => data.now);

		$.head('1d2597w', $$renderer, ($$renderer) => {
			$$renderer.title(($$renderer) => {
				$$renderer.push(`<title>${$.escape(algoliaItem().title)} | Svelte Hacker News</title>`);
			});
		});

		$$renderer.push(`<div><article class="item svelte-1d2597w"><a class="main-link svelte-1d2597w" rel="external"${$.attr('href', algoliaItem().url)}><h1 class="svelte-1d2597w">${$.escape(algoliaItem().title)}</h1> `);

		if (algoliaItem().url) {
			$$renderer.push(`<!--[0--><small class="svelte-1d2597w">${$.escape(new URL(algoliaItem().url).hostname)}</small>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></a> <p class="meta svelte-1d2597w">${$.escape(algoliaItem().points)}
			${$.escape(algoliaItem().points === 1 ? 'point' : 'points')} by <a${$.attr('href', resolve('/user/[name]', { name: algoliaItem().author }))}>${$.escape(algoliaItem().author)}</a> ${$.escape(timeAgo(now() - algoliaItem().created_at_i))}</p> `);

		if (algoliaItem().text) {
			$$renderer.push('<!--[0-->');
			SubsetHTML($$renderer, { content: algoliaItem().text });
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> `);

		if (algoliaItem().options && algoliaItem().options.length > 0) {
			$$renderer.push(`<!--[0--><!--[-->`);

			const each_array = $.ensure_array_like(pollOptions());

			for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
				let pollOption = each_array[$$index];

				SubsetHTML($$renderer, { content: pollOption.text });
				$$renderer.push(`<!----> <small class="svelte-1d2597w">${$.escape(pollOption.score)} points</small>`);
			}

			$$renderer.push(`<!--]-->`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></article> `);

		if (algoliaItem().children && algoliaItem().children.length > 0) {
			$$renderer.push(`<!--[0--><div class="comments svelte-1d2597w"><!--[-->`);

			const each_array_1 = $.ensure_array_like(algoliaItem().children);

			for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
				let comment = each_array_1[$$index_1];

				CommentElement($$renderer, { comment, now: now() });
			}

			$$renderer.push(`<!--]--></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></div>`);
	});
}