import * as $ from 'svelte/internal/server';
import Limit from './limit.svelte';
import Pagination from './pagination.svelte';
import { Layout } from '@appwrite.io/pink-svelte';

export default function PaginationWithLimit($$renderer, $$props) {
	let {
		limit,
		offset,
		total,
		name,
		useCreateLink = true,
		pageParam = 'page',
		removeOnFirstPage = false,
		$$slots,
		$$events,
		...restProps
	} = $$props;

	const showLimit = $.derived(() => !!useCreateLink);
	const direction = $.derived(() => showLimit() ? 'row' : 'column');
	const alignItems = $.derived(() => showLimit() ? 'center' : 'flex-end');

	if (Layout.Stack) {
		$$renderer.push('<!--[-->');

		Layout.Stack($$renderer, $.spread_props([
			{
				wrap: 'wrap',
				direction: direction(),
				alignItems: alignItems(),
				justifyContent: 'space-between'
			},
			restProps,
			{
				children: ($$renderer) => {
					if (showLimit()) {
						$$renderer.push('<!--[0-->');
						Limit($$renderer, { limit, sum: total, name, pageParam, removeOnFirstPage });
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]--> `);

					Pagination($$renderer, {
						limit,
						offset,
						sum: total,
						useCreateLink,
						pageParam,
						removeOnFirstPage
					});

					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			}
		]));

		$$renderer.push('<!--]-->');
	} else {
		$$renderer.push('<!--[!-->');
		$$renderer.push('<!--]-->');
	}
}