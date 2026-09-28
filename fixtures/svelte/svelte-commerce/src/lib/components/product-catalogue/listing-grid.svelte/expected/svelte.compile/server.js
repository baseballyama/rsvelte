import * as $ from 'svelte/internal/server';
import { page } from '$app/state';
import Pagination from '$lib/components/common/pagination.svelte';
import ProductCard from '$lib/components/product-catalogue/product-card.svelte';
import Skeleton from '$lib/components/ui/skeleton/skeleton.svelte';
import { SearchService } from '$lib/core/services/index.js';

export default function Listing_grid($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
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
		let products = data().products?.data ?? [];

		let currentPage = Number(page.url.searchParams.get('page') ?? 1);
		let loadingMore = false;
		let loadFailed = false;
		let previousListingQueryKey = '';
		const hasMore = $.derived(() => currentPage < (data().products?.totalPages ?? 0));

		// Mobile is the viewport Googlebot renders, and the desktop pagination is display:none there.
		// Giving the infinite-scroll trigger a real href keeps page 2+ reachable without JS.
		const nextPageHref = $.derived(() => {
			const url = new URL(page.url);

			url.searchParams.set('page', String(currentPage + 1));

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
				sessionStorage.setItem(SCROLL_CACHE_KEY, JSON.stringify({ key, currentPage, products }));
			} catch {
				// Quota exceeded or storage blocked — accumulation just won't survive a back-navigation.
			}
		}

		async function loadNextPage() {
			if (loadingMore || !hasMore()) return;

			loadingMore = true;
			loadFailed = false;

			try {
				const nextUrl = new URL(page.url);

				nextUrl.searchParams.set('page', String(currentPage + 1));

				const result = await searchService.searchWithUrl(nextUrl, page.params.slug);

				products = [...products, ...result.data];
				currentPage += 1;
				writeScrollCache(listingQueryKey());
			} catch(e) {
				// The observer only fires on an intersection *transition*, so a swallowed failure left
				// the sentinel already intersecting and the list silently stopped loading forever.
				console.error('Failed to load more products:', e);

				loadFailed = true;
			} finally {
				loadingMore = false;
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

		if (!data().products?.data?.length) {
			$$renderer.push(`<!--[0--><div class="ed-empty intra-gap flex h-96 flex-col items-center justify-center svelte-bn04g9"><p class="ed-empty__title text-md uppercase text-gray-500 svelte-bn04g9">No products found</p> <a href="/products" class="ed-empty__link text-sm font-bold uppercase tracking-widest text-primary underline underline-offset-4 svelte-bn04g9">Clear all filters</a></div>`);
		} else {
			$$renderer.push(`<!--[-1--><div class="ed-grid intra-gap grid auto-rows-auto grid-cols-2 lg:grid-cols-3 svelte-bn04g9"><!--[-->`);

			const each_array = $.ensure_array_like(products);

			for (let i = 0, $$length = each_array.length; i < $$length; i++) {
				let product = each_array[i];

				ProductCard($$renderer, { product, priority: i < 6 });
			}

			$$renderer.push(`<!--]--></div> `);

			if (hasMore() || loadingMore) {
				$$renderer.push(`<!--[0--><div class="mt-6 flex min-h-16 items-center justify-center lg:hidden" aria-live="polite">`);

				if (loadingMore) {
					$$renderer.push(`<!--[0--><div class="grid grid-cols-2 gap-3" aria-label="Loading more products">`);
					Skeleton($$renderer, { class: 'h-2 w-20 bg-gray-200 dark:bg-gray-700' });
					$$renderer.push(`<!----> `);
					Skeleton($$renderer, { class: 'h-2 w-20 bg-gray-200 dark:bg-gray-700' });
					$$renderer.push(`<!----></div>`);
				} else {
					$$renderer.push(`<!--[-1--><a${$.attr('href', nextPageHref())} rel="next"${$.attr_class(
						`text-xs font-semibold uppercase tracking-[0.16em] ${loadFailed
							? 'ed-empty__link text-primary underline underline-offset-4'
							: 'ed-more text-gray-400'}`,
						'svelte-bn04g9'
					)}>${$.escape(loadFailed ? 'Retry' : 'Load more')}</a>`);
				}

				$$renderer.push(`<!--]--></div>`);
			} else if (products.length > 0) {
				$$renderer.push(`<!--[1--><p class="ed-end mt-8 text-center text-xs font-semibold uppercase tracking-[0.16em] text-gray-400 lg:hidden svelte-bn04g9">You've reached the end</p>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> <div class="ed-pagination hidden lg:block">`);
			Pagination($$renderer, { noOfPage: data().products.totalPages });
			$$renderer.push(`<!----></div>`);
		}

		$$renderer.push(`<!--]-->`);
	});
}