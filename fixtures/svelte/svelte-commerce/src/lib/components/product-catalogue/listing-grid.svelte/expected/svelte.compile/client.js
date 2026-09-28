import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { page } from '$app/state';
import Pagination from '$lib/components/common/pagination.svelte';
import ProductCard from '$lib/components/product-catalogue/product-card.svelte';
import Skeleton from '$lib/components/ui/skeleton/skeleton.svelte';
import { SearchService } from '$lib/core/services/index.js';

var root = $.from_html(`<div class="ed-empty intra-gap flex h-96 flex-col items-center justify-center svelte-bn04g9"><p class="ed-empty__title text-md uppercase text-gray-500 svelte-bn04g9">No products found</p> <a href="/products" class="ed-empty__link text-sm font-bold uppercase tracking-widest text-primary underline underline-offset-4 svelte-bn04g9">Clear all filters</a></div>`);
var root_1 = $.from_html(`<div class="grid grid-cols-2 gap-3" aria-label="Loading more products"><!> <!></div>`);
var root_2 = $.from_html(`<a rel="next"> </a>`);
var root_3 = $.from_html(`<div class="mt-6 flex min-h-16 items-center justify-center lg:hidden" aria-live="polite"><!></div>`);
var root_4 = $.from_html(`<p class="ed-end mt-8 text-center text-xs font-semibold uppercase tracking-[0.16em] text-gray-400 lg:hidden svelte-bn04g9">You've reached the end</p>`);
var root_5 = $.from_html(`<div class="ed-grid intra-gap grid auto-rows-auto grid-cols-2 lg:grid-cols-3 svelte-bn04g9"></div> <!> <div class="ed-pagination hidden lg:block"><!></div>`, 1);

export default function Listing_grid($$anchor, $$props) {
	$.push($$props, true);

	const data = $.derived(() => page.data);
	const searchService = new SearchService(fetch);

	const listingQueryKey = $.derived(() => {
		const params = new URLSearchParams(page.url.search);

		params.delete('page');

		return `${page.url.pathname}?${params.toString()}`;
	});

	// Seeded from the SSR payload, NOT from the $effect below: effects never run on the server, so
	// starting this at [] meant the server rendered an empty grid — no product cards and no product
	// links — on /products and every /[slug] category, for every crawler that does not execute JS.
	let products = $.state($.proxy($.get(data).products?.data ?? []));

	let currentPage = $.state($.proxy(Number(page.url.searchParams.get('page') ?? 1)));
	let loadingMore = $.state(false);
	let loadFailed = $.state(false);
	let previousListingQueryKey = '';
	const hasMore = $.derived(() => $.get(currentPage) < ($.get(data).products?.totalPages ?? 0));

	// Mobile is the viewport Googlebot renders, and the desktop pagination is display:none there.
	// Giving the infinite-scroll trigger a real href keeps page 2+ reachable without JS.
	const nextPageHref = $.derived(() => {
		const url = new URL(page.url);

		url.searchParams.set('page', String($.get(currentPage) + 1));

		return url.pathname + url.search;
	});

	// Infinitely-scrolled pages live in component state, so opening a PDP and pressing back used to
	// remount this with only the first 20 items while SvelteKit restored the old scroll position.
	// Park the accumulated list against the listing key so a remount can pick it back up.
	const SCROLL_CACHE_KEY = 'listing-infinite-scroll';

	function readScrollCache(key) {
		try {
			const cached = JSON.parse(sessionStorage.getItem(SCROLL_CACHE_KEY) || 'null');

			return cached?.key === key && Array.isArray(cached.products) ? cached : null;
		} catch {
			return null;
		}
	}

	function writeScrollCache(key) {
		try {
			sessionStorage.setItem(SCROLL_CACHE_KEY, JSON.stringify({
				key,
				currentPage: $.get(currentPage),
				products: $.get(products)
			}));
		} catch {
			// Quota exceeded or storage blocked — accumulation just won't survive a back-navigation.
		}
	}

	$.user_effect(() => {
		if ($.get(listingQueryKey) === previousListingQueryKey) return;

		const isMount = previousListingQueryKey === '';

		previousListingQueryKey = $.get(listingQueryKey);
		$.set(loadFailed, false);

		const urlPage = Number(page.url.searchParams.get('page') ?? 1);
		const cached = isMount ? readScrollCache($.get(listingQueryKey)) : null;

		if (cached && cached.currentPage > urlPage) {
			$.set(products, cached.products, true);
			$.set(currentPage, cached.currentPage, true);
		} else {
			$.set(products, $.get(data).products?.data ?? [], true);
			$.set(currentPage, urlPage, true);
		}
	});

	async function loadNextPage() {
		if ($.get(loadingMore) || !$.get(hasMore)) return;

		$.set(loadingMore, true);
		$.set(loadFailed, false);

		try {
			const nextUrl = new URL(page.url);

			nextUrl.searchParams.set('page', String($.get(currentPage) + 1));

			const result = await searchService.searchWithUrl(nextUrl, page.params.slug);

			$.set(products, [...$.get(products), ...result.data], true);
			$.set(currentPage, $.get(currentPage) + 1);
			writeScrollCache($.get(listingQueryKey));
		} catch(e) {
			// The observer only fires on an intersection *transition*, so a swallowed failure left
			// the sentinel already intersecting and the list silently stopped loading forever.
			console.error('Failed to load more products:', e);

			$.set(loadFailed, true);
		} finally {
			$.set(loadingMore, false);
		}
	}

	function infiniteScroll(node) {
		if (!window.matchMedia('(max-width: 1023px)').matches) return;

		const observer = new IntersectionObserver(
			([entry]) => {
				if (entry.isIntersecting) loadNextPage();
			},
			{ rootMargin: '320px 0px' }
		);

		observer.observe(node);

		return { destroy: () => observer.disconnect() };
	}

	var fragment = $.comment();
	var node_1 = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			var div = root();

			$.append($$anchor, div);
		};

		var alternate_1 = ($$anchor) => {
			var fragment_1 = root_5();
			var div_1 = $.first_child(fragment_1);

			$.each(div_1, 23, () => $.get(products), (product) => product.id, ($$anchor, product, i) => {
				{
					let $0 = $.derived(() => $.get(i) < 6);

					ProductCard($$anchor, {
						get product() {
							return $.get(product);
						},

						get priority() {
							return $.get($0);
						}
					});
				}
			});

			$.reset(div_1);

			var node_2 = $.sibling(div_1, 2);

			{
				var consequent_2 = ($$anchor) => {
					var div_2 = root_3();
					var node_3 = $.child(div_2);

					{
						var consequent_1 = ($$anchor) => {
							var div_3 = root_1();
							var node_4 = $.child(div_3);

							Skeleton(node_4, { class: 'h-2 w-20 bg-gray-200 dark:bg-gray-700' });

							var node_5 = $.sibling(node_4, 2);

							Skeleton(node_5, { class: 'h-2 w-20 bg-gray-200 dark:bg-gray-700' });
							$.reset(div_3);
							$.append($$anchor, div_3);
						};

						var alternate = ($$anchor) => {
							var a = root_2();
							var text = $.only_child(a, true);

							$.template_effect(() => {
								$.set_attribute(a, 'href', $.get(nextPageHref));

								$.set_class(
									a,
									1,
									`text-xs font-semibold uppercase tracking-[0.16em] ${$.get(loadFailed)
										? 'ed-empty__link text-primary underline underline-offset-4'
										: 'ed-more text-gray-400'}`,
									'svelte-bn04g9'
								);

								$.set_text(text, $.get(loadFailed) ? 'Retry' : 'Load more');
							});

							$.delegated('click', a, (e) => {
								e.preventDefault();
								loadNextPage();
							});

							$.append($$anchor, a);
						};

						$.if(node_3, ($$render) => {
							if ($.get(loadingMore)) $$render(consequent_1); else $$render(alternate, -1);
						});
					}

					$.reset(div_2);
					$.action(div_2, ($$node) => infiniteScroll?.($$node));
					$.append($$anchor, div_2);
				};

				var consequent_3 = ($$anchor) => {
					var p = root_4();

					$.append($$anchor, p);
				};

				$.if(node_2, ($$render) => {
					if ($.get(hasMore) || $.get(loadingMore)) $$render(consequent_2); else if ($.get(products).length > 0) $$render(consequent_3, 1);
				});
			}

			var div_4 = $.sibling(node_2, 2);
			var node_6 = $.child(div_4);

			Pagination(node_6, {
				get noOfPage() {
					return $.get(data).products.totalPages;
				}
			});

			$.reset(div_4);
			$.append($$anchor, fragment_1);
		};

		$.if(node_1, ($$render) => {
			if (!$.get(data).products?.data?.length) $$render(consequent); else $$render(alternate_1, -1);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}

$.delegate(['click']);