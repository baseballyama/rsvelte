import * as $ from 'svelte/internal/server';
import { categoryService } from '$lib/core/services/index.js';
import { onMount } from 'svelte';
import LazyImg from '$lib/core/components/image/lazy-img.svelte';
import { Skeleton } from '$lib/components/ui/skeleton/index.js';
import { Button } from '$lib/components/ui/button/index.js';
import { toast } from '@misiki/kitcommerce-core';

export default function Featured_categories($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const { block } = $$props;
		let categories = null;
		let loadingForCategory = false;

		onMount(async () => {
			try {
				loadingForCategory = true;

				const res = await categoryService.fetchFeaturedCategories({ limit: block.metadata.limit || 1000 });

				categories = res?.data;
			} catch(e) {
				toast.error(e?.message || 'Failed to load categories');
			} finally {
				loadingForCategory = false;
			}
		});

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
					href: block.metadata.redirectsTo || '/categories',
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

		$$renderer.push(`<!--]--> <div class="grid gap-2"${$.attr_style(`grid-template-columns: repeat(${$.stringify(block.metadata.columnCount || 5)}, 1fr); row-gap: ${$.stringify(block.metadata.gridRowGap ?? 8)}px; column-gap: ${$.stringify(block.metadata.gridColumnGap ?? 8)}px;`)}>`);

		if (loadingForCategory) {
			$$renderer.push(`<!--[0--><!--[-->`);

			const each_array = $.ensure_array_like(Array(6));

			for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
				let _ = each_array[$$index];

				$$renderer.push(`<div class="flex flex-col items-center">`);
				Skeleton($$renderer, { class: 'aspect-square w-full' });
				$$renderer.push(`<!----> `);
				Skeleton($$renderer, { class: 'mt-4 h-4 w-2/3 rounded-full' });
				$$renderer.push(`<!----></div>`);
			}

			$$renderer.push(`<!--]-->`);
		} else {
			$$renderer.push(`<!--[-1--><!--[-->`);

			const each_array_1 = $.ensure_array_like(categories);

			for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
				let { slug, name, link, thumbnail } = each_array_1[$$index_1];

				$$renderer.push(`<a${$.attr('href', link ? link : slug ? `/${slug}` : `/products`)} class="group flex flex-col items-center focus:outline-none"><div class="relative w-full overflow-hidden bg-muted shadow-sm transition-all duration-500 ease-out">`);

				LazyImg($$renderer, {
					src: thumbnail || '',
					aspectRatio: block.metadata.aspectRatio,
					alt: name,
					class: 'h-full w-full object-contain transition-transform duration-700 ease-in-out'
				});

				$$renderer.push(`<!----></div> `);

				if (!block?.metadata?.hideCategoryName) {
					$$renderer.push(`<!--[0--><span class="mt-2 px-2 text-center text-sm font-bold tracking-tight text-foreground transition-colors duration-300 lg:text-base">${$.escape(name)}</span>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--></a>`);
			}

			$$renderer.push(`<!--]-->`);
		}

		$$renderer.push(`<!--]--></div></div>`);
	});
}