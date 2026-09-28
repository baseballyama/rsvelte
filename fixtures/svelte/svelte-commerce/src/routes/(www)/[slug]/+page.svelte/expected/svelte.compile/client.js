import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import SeoHeader from '$lib/components/seo/seo-header.svelte';
import { setCategoryFilterState, setDesktopFilterState } from '$lib/core/composables/index.js';
import ListingPage from '$lib/components/product-catalogue/listing-page.svelte';
import { stripPageOnFilterNavigation } from '$lib/components/product-catalogue/strip-page-on-filter';
import { page } from '$app/state';
import ListingScehma from '$lib/components/product-catalogue/listing-scehma.svelte';

var root = $.from_html(`<!> <!> <!>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);
	setDesktopFilterState();
	setCategoryFilterState();
	stripPageOnFilterNavigation();

	const data = $.derived(() => page.data);

	// The slug load returns { products } with the category under products.categoryHierarchy
	// (there is no data.page here); the last entry is the current category.
	const category = $.derived(() => $.get(data)?.products?.categoryHierarchy?.at(-1));

	// Readable fallback derived from the URL slug (e.g. "engagement-rings" -> "Engagement Rings")
	const slugTitle = $.derived(() => (page.params.slug || '').split(/[-_]/).filter(Boolean).map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' '));

	// +page.ts now 404s an unresolvable slug outright, so this only catches the narrowed case it
	// deliberately lets through: a real listing filtered down to nothing (/pendant?price=999999).
	// Those must stay crawlable-but-unindexed rather than becoming thin duplicates of the category.
	const unresolved = $.derived(() => !$.get(category) && !$.get(data)?.products?.data?.length);

	// SeoHeader otherwise falls back to origin + pathname, canonicalising /pendant?page=3 to
	// /pendant and getting every deep listing page dropped as a duplicate of page 1.
	const pageParam = $.derived(() => page.url.searchParams.get('page'));

	const canonicalUrl = $.derived(() => page.url.origin + page.url.pathname + ($.get(pageParam) && $.get(pageParam) !== '1' ? `?page=${$.get(pageParam)}` : ''));
	var fragment = root();
	var node = $.first_child(fragment);

	ListingScehma(node, {});

	var node_1 = $.sibling(node, 2);

	{
		let $0 = $.derived(() => $.get(category)?.metaTitle || $.get(category)?.name || $.get(slugTitle) || 'Products');
		let $1 = $.derived(() => $.get(category)?.metaDescription);
		let $2 = $.derived(() => $.get(category)?.metaKeywords);
		let $3 = $.derived(() => $.get(category)?.banner || $.get(data)?.store?.logo || '');

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
			},

			get noindex() {
				return $.get(unresolved);
			}
		});
	}

	var node_2 = $.sibling(node_1, 2);

	ListingPage(node_2, {});
	$.append($$anchor, fragment);
	$.pop();
}