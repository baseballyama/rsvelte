import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { setCategoryFilterState, setDesktopFilterState } from '$lib/core/composables/index.js';
import ListingPage from '$lib/components/product-catalogue/listing-page.svelte';
import { stripPageOnFilterNavigation } from '$lib/components/product-catalogue/strip-page-on-filter';
import { page } from '$app/state';
import SeoHeader from '$lib/components/seo/seo-header.svelte';
import ListingScehma from '$lib/components/product-catalogue/listing-scehma.svelte';

var root = $.from_html(`<!> <!> <!>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);
	setDesktopFilterState();
	setCategoryFilterState();
	stripPageOnFilterNavigation();

	const data = $.derived(() => page.data);

	// SeoHeader falls back to origin + pathname, which canonicalises /products?page=7 to /products
	// and gets every deep listing page dropped as a duplicate of page 1. Keep `page` (and only
	// `page` — facets and sort really do belong on page 1's canonical).
	const pageParam = $.derived(() => page.url.searchParams.get('page'));

	const canonicalUrl = $.derived(() => page.url.origin + page.url.pathname + ($.get(pageParam) && $.get(pageParam) !== '1' ? `?page=${$.get(pageParam)}` : ''));
	var fragment = root();
	var node = $.first_child(fragment);

	ListingScehma(node, {});

	var node_1 = $.sibling(node, 2);

	{
		let $0 = $.derived(() => $.get(data).page?.metaTitle || ($.get(data).products?.categoryHierarchy?.length > 0
			? `${$.get(data).products.categoryHierarchy[$.get(data).products.categoryHierarchy.length - 1].name} | ${$.get(data).store?.name ?? 'Shop'}`
			: `All products | ${$.get(data).store?.name ?? 'Shop'}`));

		let $1 = $.derived(() => $.get(data).page?.metaDescription || $.get(data).store?.description || '');
		let $2 = $.derived(() => $.get(data).page?.metaKeywords ?? '');
		let $3 = $.derived(() => $.get(data).page?.logo || $.get(data).store?.logo || '');

		SeoHeader(node_1, {
			get metaTitle() {
				return $.get($0);
			},

			get metaDescription() {
				return $.get($1);
			},

			get metaKeywords() {
				return $.get($2);
			},

			get image() {
				return $.get($3);
			},

			get canonicalUrl() {
				return $.get(canonicalUrl);
			}
		});
	}

	var node_2 = $.sibling(node_1, 2);

	ListingPage(node_2, {});
	$.append($$anchor, fragment);
	$.pop();
}