import * as $ from 'svelte/internal/server';
import { GoogleStructuredDataBreadcrumb } from '@misiki/kitcommerce-core/components';
import ProductListSchema from '$lib/components/seo/product-list-schema.svelte';
import { page } from '$app/state';

export default function Listing_scehma($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		// Both call sites render this bare (`<ListingScehma />`), so a `products` prop defaulted to
		// `[]` and no listing page on the site ever emitted ItemList markup. Read the SSR data
		// directly — the same source listing-grid.svelte renders — and keep the prop as an override.
		const { products } = $$props;

		const listedProducts = $.derived(() => products ?? page.data.products?.data ?? []);
		const categoryHierarchy = $.derived(() => page.data.products?.categoryHierarchy || []);

		ProductListSchema($$renderer, { products: listedProducts() });
		$$renderer.push(`<!----> `);
		GoogleStructuredDataBreadcrumb($$renderer, { categoryHierarchy: categoryHierarchy() });
		$$renderer.push(`<!---->`);
	});
}