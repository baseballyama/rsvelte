import * as $ from 'svelte/internal/server';
import { resolve } from '$app/paths';
import { timeAgo } from '$lib/utils';

export default function ItemSummary($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const { item, index, now } = $$props;

		$$renderer.push(`<article class="svelte-qvpc2r"><h2 class="svelte-qvpc2r">`);

		if (item.type !== 'poll' && item.url) {
			$$renderer.push(`<!--[0--><a rel="external"${$.attr('href', item.url)} class="svelte-qvpc2r">${$.escape(item.title)} <small class="svelte-qvpc2r">${$.escape(new URL(item.url).hostname)}</small></a>`);
		} else {
			$$renderer.push(`<!--[-1--><a${$.attr('href', resolve('/item/[id=numeric]', { id: `${item.id}` }))} class="svelte-qvpc2r">${$.escape(item.title)}</a>`);
		}

		$$renderer.push(`<!--]--></h2> <p class="svelte-qvpc2r">${$.escape(item.score)}
		${$.escape(item.score === 1 ? 'point' : 'points')} by <a${$.attr('href', resolve('/user/[name]', { name: item.by }))}>${$.escape(item.by)}</a> ${$.escape(timeAgo(now - item.time))} `);

		if (item.type !== 'job') {
			$$renderer.push(`<!--[0-->| <a${$.attr('href', resolve('/item/[id=numeric]', { id: `${item.id}` }))}>${$.escape(item.descendants)}
				${$.escape(item.descendants === 1 ? 'comment' : 'comments')}</a>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></p> <span class="index svelte-qvpc2r">${$.escape(index)}</span></article>`);
	});
}