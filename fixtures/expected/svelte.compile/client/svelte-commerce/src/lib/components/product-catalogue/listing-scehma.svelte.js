import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { GoogleStructuredDataBreadcrumb } from '@misiki/kitcommerce-core/components';
import ProductListSchema from '$lib/components/seo/product-list-schema.svelte';
import { page } from '$app/state';

var root = $.from_html(`<!> <!>`, 1);

export default function Listing_scehma($$anchor, $$props) {
	$.push($$props, true);

	// Both call sites render this bare (`<ListingScehma />`), so a `products` prop defaulted to
	// `[]` and no listing page on the site ever emitted ItemList markup. Read the SSR data
	// directly — the same source listing-grid.svelte renders — and keep the prop as an override.
	const listedProducts = $.derived(() => $$props.products ?? page.data.products?.data ?? []);

	const categoryHierarchy = $.derived(() => page.data.products?.categoryHierarchy || []);
	var fragment = root();
	var node = $.first_child(fragment);

	ProductListSchema(node, {
		get products() {
			return $.get(listedProducts);
		}
	});

	var node_1 = $.sibling(node, 2);

	GoogleStructuredDataBreadcrumb(node_1, {
		get categoryHierarchy() {
			return $.get(categoryHierarchy);
		}
	});

	$.append($$anchor, fragment);
	$.pop();
}