import * as $ from 'svelte/internal/server';
import { page } from '$app/state';
import Select from '$lib/components/form/select.svelte';
import { goto } from '$app/navigation';
import LazyImg from '$lib/core/components/image/lazy-img.svelte';
import Pagination from '$lib/components/common/pagination.svelte';
import SeoHeader from '$lib/components/seo/seo-header.svelte';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		// The route's +page.ts (wwwCollectonsLoad) already fetches the collection list server-side.
		// This page used to ignore it and re-run a *product* search in an $effect, which never runs
		// during SSR — so crawlers were served "0 Collections found" above an empty grid.
		const collections = $.derived(() => page.data?.data || []);

		const count = $.derived(() => page.data?.count ?? 0);
		const noOfPage = $.derived(() => page.data?.noOfPage);
		let selectedSort = page.url.searchParams.get('sort') || '-createdAt';
		const storeName = $.derived(() => page.data?.store?.name);

		const selectSort = (value) => {
			goto(`/collections?sort=${value}`);
		};

		SeoHeader($$renderer, {
			metaTitle: storeName() ? `Collections | ${storeName()}` : 'Collections',
			metaDescription: 'Browse every curated product collection in the store.'
		});

		$$renderer.push(`<!----> <div class="container mx-auto mt-2 flex h-full min-h-screen flex-col max-md:px-4 md:gap-2"><div class="flex-1"><div class="mb-4 flex flex-col items-start gap-2"><h1 class="text-2xl font-bold">All Collections</h1> <span class="text-sm text-muted-foreground">${$.escape(count())} ${$.escape(count() === 1 ? 'Collection' : 'Collections')} found</span></div> <div class="hidden flex-row items-center gap-2 md:flex"><span class="text-sm font-normal text-muted-foreground">Sort by:</span> `);

		Select($$renderer, {
			class: '!mb-0',
			id: 'sort-by',
			value: selectedSort,
			data: [
				{ value: '-createdAt', name: "What's New" },
				{ value: 'createdAt', name: 'Oldest First' },
				{ value: 'name', name: 'Name: A-Z' },
				{ value: '-name', name: 'Name: Z-A' }
			],

			optionSelected: (value) => {
				selectedSort = value;
				selectSort(value);
			}
		});

		$$renderer.push(`<!----></div> `);

		if (!collections().length) {
			$$renderer.push(`<!--[0--><div class="flex h-96 items-center justify-center"><p class="text-sm text-muted-foreground">No collections found</p></div>`);
		} else {
			$$renderer.push(`<!--[-1--><ul class="mt-4 grid grid-cols-2 gap-5 gap-y-8 md:grid-cols-3 lg:grid-cols-4"><!--[-->`);

			const each_array = $.ensure_array_like(collections());

			for (let i = 0, $$length = each_array.length; i < $$length; i++) {
				let collection = each_array[i];

				$$renderer.push(`<li><a${$.attr('href', `/collections/${$.stringify(collection.slug || collection.id)}`)} class="group flex flex-col gap-2"><div class="aspect-square overflow-hidden rounded-md border border-border bg-muted">`);

				LazyImg($$renderer, {
					src: collection.img || collection.images?.[0],
					alt: collection.name,
					width: 400,
					height: 400,
					class: 'h-full w-full object-cover transition-transform duration-300 group-hover:scale-105',
					priority: i < 4
				});

				$$renderer.push(`<!----></div> <h2 class="text-sm font-medium text-foreground group-hover:underline">${$.escape(collection.title || collection.name)}</h2> `);

				if (collection.subTitle) {
					$$renderer.push(`<!--[0--><p class="text-xs text-muted-foreground">${$.escape(collection.subTitle)}</p>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--></a></li>`);
			}

			$$renderer.push(`<!--]--></ul> <div class="mt-20">`);
			Pagination($$renderer, { noOfPage: noOfPage() });
			$$renderer.push(`<!----></div>`);
		}

		$$renderer.push(`<!--]--></div></div>`);
	});
}