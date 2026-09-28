import * as $ from 'svelte/internal/server';
import LazyImg from '$lib/core/components/image/lazy-img.svelte';
import { Skeleton } from '$lib/components/ui/skeleton';
import { Button } from '$lib/components/ui/button';

export default function Homepage_category_list_with_image($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		// import { CategoryService } from '$lib/services'
		// import { onMount } from 'svelte'
		// let categories = $state([])
		let { categories, loading } = $$props;

		if (categories?.length) {
			$$renderer.push(`<!--[0--><div class="py-8 w-full"><div class="mb-6 flex flex-col items-center justify-between gap-6 md:flex-row md:items-end"><div class="text-center md:text-left"><h2 class="text-3xl font-extrabold tracking-tight text-foreground lg:text-4xl">Top Categories</h2> <div class="mx-auto mt-2 h-1 w-12 bg-primary md:mx-0"></div> <p class="mt-4 text-sm font-medium text-muted-foreground">Discover our curated range of products by category</p></div> `);

			Button($$renderer, {
				href: '/categories',
				class: 'group',
				children: ($$renderer) => {
					$$renderer.push(`<!---->View all categories <svg xmlns="http://www.w3.org/2000/svg" class="ml-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----></div> <div class="grid grid-cols-2 gap-2 px-2 mobiles:grid-cols-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-6">`);

			if (loading) {
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
					let { slug, icon, color, name, link, thumbnail, parentCategoryId } = each_array_1[$$index_1];

					$$renderer.push(`<a${$.attr('href', link ? link : slug ? `/${slug}` : `/products`)} class="group flex flex-col items-center focus:outline-none"><div class="relative aspect-square w-full overflow-hidden bg-red-200 bg-muted shadow-sm transition-all duration-500 ease-out">`);

					LazyImg($$renderer, {
						src: thumbnail,
						alt: name,
						class: 'h-full w-full object-cover transition-transform duration-700 ease-in-out'
					});

					$$renderer.push(`<!----></div> <span class="mt-2 px-2 text-center text-sm font-bold tracking-tight text-foreground transition-colors duration-300 lg:text-base">${$.escape(name)}</span></a>`);
				}

				$$renderer.push(`<!--]-->`);
			}

			$$renderer.push(`<!--]--></div></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);
	});
}