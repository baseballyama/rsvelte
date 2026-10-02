import * as $ from 'svelte/internal/server';
import { page } from '$app/state';
import ProductCard from '$lib/components/product-catalogue/product-card.svelte';
import SeoHeader from '$lib/components/seo/seo-header.svelte';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		// This file was 0 bytes: the loader fetched the collection and the route answered 200 with an
		// empty document. Render what wwwCollectionsSlugLoad already returns ({ collection, allratings }).
		const collection = $.derived(() => page.data?.collection);

		const products = $.derived(() => (collection()?.collectionvalues || []).map((value) => value?.products).filter(Boolean));

		SeoHeader($$renderer, {
			metaTitle: collection()?.title || collection()?.name || 'Collection',
			metaDescription: collection()?.subTitle || collection()?.description,
			image: collection()?.img || collection()?.images?.[0]
		});

		$$renderer.push(`<!----> <div class="container mx-auto mt-2 min-h-screen max-md:px-4"><div class="mb-6 flex flex-col items-start gap-2"><h1 class="text-2xl font-bold">${$.escape(collection()?.title || collection()?.name)}</h1> `);

		if (collection()?.subTitle) {
			$$renderer.push(`<!--[0--><p class="text-sm text-muted-foreground">${$.escape(collection().subTitle)}</p>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> <span class="text-sm text-muted-foreground">${$.escape(products().length)} ${$.escape(products().length === 1 ? 'Product' : 'Products')}</span></div> `);

		if (collection()?.description) {
			$$renderer.push(`<!--[0--><p class="mb-8 max-w-3xl text-sm leading-relaxed text-muted-foreground">${$.escape(collection().description)}</p>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> `);

		if (!products().length) {
			$$renderer.push(`<!--[0--><div class="flex h-96 items-center justify-center"><p class="text-sm text-muted-foreground">No products in this collection yet.</p></div>`);
		} else {
			$$renderer.push(`<!--[-1--><ul class="grid grid-cols-2 gap-5 gap-y-8 md:grid-cols-3 lg:grid-cols-4"><!--[-->`);

			const each_array = $.ensure_array_like(products());

			for (let i = 0, $$length = each_array.length; i < $$length; i++) {
				let product = each_array[i];

				$$renderer.push(`<li>`);
				ProductCard($$renderer, { product, priority: i < 4 });
				$$renderer.push(`<!----></li>`);
			}

			$$renderer.push(`<!--]--></ul>`);
		}

		$$renderer.push(`<!--]--></div>`);
	});
}