import * as $ from 'svelte/internal/server';
import { resolve } from '$app/paths';
import ItemSummary from './ItemSummary.svelte';
import NullItem from './NullItem.svelte';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const { data } = $$props;
		const PAGE_SIZE = 30;

		const list = $.derived(() => data.list),
			items = $.derived(() => data.items),
			page = $.derived(() => data.page),
			now = $.derived(() => data.now);

		const start = $.derived(() => 1 + (page() - 1) * PAGE_SIZE);

		$.head('1n9hwi2', $$renderer, ($$renderer) => {
			$$renderer.title(($$renderer) => {
				$$renderer.push(`<title>Svelte Hacker News</title>`);
			});

			$$renderer.push(`<meta name="description"${$.attr('content', `Latest Hacker News stories in the ${$.stringify(list())} category`)}/>`);
		});

		$$renderer.push(`<!--[-->`);

		const each_array = $.ensure_array_like(items());

		for (let i = 0, $$length = each_array.length; i < $$length; i++) {
			let item = each_array[i];

			if (item.type !== 'null') {
				$$renderer.push('<!--[0-->');
				ItemSummary($$renderer, { item, index: start() + i, now: now() });
			} else {
				$$renderer.push('<!--[-1-->');
				NullItem($$renderer, { id: item.id, index: start() + i });
			}

			$$renderer.push(`<!--]-->`);
		}

		$$renderer.push(`<!--]--> `);

		if (items().length >= PAGE_SIZE) {
			$$renderer.push(`<!--[0--><a class="more"${$.attr('href', resolve('/[list=category]/[page=numeric]', { list: list(), page: `${page() + 1}` }))}>More...</a>`);
		} else {
			$$renderer.push(`<!--[-1--><p>That's all we can find...</p>`);
		}

		$$renderer.push(`<!--]-->`);
	});
}