import * as $ from 'svelte/internal/server';
import { Skeleton } from '$lib/components/ui/skeleton/index.js';
import { Button } from '$lib/components/ui/button/index.js';
import { getCollectionState } from '$lib/core/stores/collection.svelte.js';

export default function Collection_grid($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const { block } = $$props;

		const $$d = $.derived(() => block.metadata.aspectRatio?.split(':') || ['1', '1']),
			$$derived_array = $.derived(() => $.to_array($$d(), 2)),
			aspectWidth = $.derived(() => $$derived_array()[0]),
			aspectHeight = $.derived(() => $$derived_array()[1]);

		const collectionState = getCollectionState();

		$$renderer.push(`<div class="w-full py-8">`);

		if (block.metadata.showHeader) {
			$$renderer.push(`<!--[0--><div class="mb-6 flex flex-col items-center justify-between gap-6 md:flex-row md:items-end"><div class="text-center md:text-left">`);

			if (block.metadata.title) {
				$$renderer.push(`<!--[0--><h2 class="text-3xl font-extrabold tracking-tight text-foreground lg:text-4xl">${$.escape(block.metadata.title)}</h2> <div class="mx-auto mt-2 h-1 w-12 bg-primary md:mx-0"></div>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> `);

			if (block.metadata.subtitle) {
				$$renderer.push(`<!--[0--><p class="mt-4 text-sm font-medium text-muted-foreground">${$.escape(block.metadata.subtitle)}</p>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></div> `);

			if (block.metadata.showViewMore) {
				$$renderer.push('<!--[0-->');

				Button($$renderer, {
					href: block.metadata.redirectsTo || '/products',
					class: 'group',
					children: ($$renderer) => {
						$$renderer.push(`<!---->${$.escape(block.metadata.viewMoreText)}<svg xmlns="http://www.w3.org/2000/svg" class="ml-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>`);
					},
					$$slots: { default: true }
				});
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> <div class="intra-gap grid"${$.attr_style(`grid-template-columns: repeat(${$.stringify(block.metadata.columnCount || 5)}, 1fr); row-gap: ${$.stringify(block.metadata.gridRowGap ?? 8)}px; column-gap: ${$.stringify(block.metadata.gridColumnGap ?? 8)}px;`)}><!--[-->`);

		const each_array = $.ensure_array_like(block.metadata.collectionIds || []);

		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let id = each_array[$$index];
			const collection = collectionState.getOneById(id);

			if (collectionState.loading) {
				$$renderer.push('<!--[0-->');
				Skeleton($$renderer, {});
			} else {
				$$renderer.push(`<!--[-1--><div${$.attr_style(`aspect-ratio: ${$.stringify(aspectWidth())}/${$.stringify(aspectHeight())}; ${block.metadata.maxWidth ? `max-width: ${block.metadata.maxWidth}px;` : ``}`)} class="flex items-center justify-center"><img${$.attr('src', collection?.img)} class="h-full object-contain" alt=""/></div>`);
			}

			$$renderer.push(`<!--]-->`);
		}

		$$renderer.push(`<!--]--></div></div>`);
	});
}