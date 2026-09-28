import * as $ from 'svelte/internal/server';
import { Star, StarHalf, HeartIcon, LoaderCircle } from '@lucide/svelte';
import { page } from '$app/state';
import { Button } from '$lib/components/ui/button/index.js';
import { useProductState } from '$lib/core/composables/index.js';

export default function Product_title_section($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const { product } = $$props;
		const productState = useProductState();

		// Star rating comes from the actual ratings array (the same source the reviews
		// section renders) rather than a pre-baked product.rating scalar, so the stars
		// always match the visible reviews.
		const reviewCount = $.derived(() => product?.ratings?.length ?? 0);

		const avgRating = $.derived(() => {
			if (!product?.ratings?.length) return 0;

			const total = product.ratings.reduce((acc, cur) => acc + (cur?.rating || 0), 0);

			return Math.floor(total / product.ratings.length * 10) / 10;
		});

		const reviewsEnabled = $.derived(() => !!page?.data?.store?.plugins?.isProductReviewsAndRatings?.active);

		$$renderer.push(`<div class="relative edp-titlewrap">`);

		if (product?.categories) {
			$$renderer.push(`<!--[0--><p class="max-sm:hidden text-sm font-semibold leading-[1] edp-cat">${$.escape(product?.categories?.[product?.categories.length - 1]?.category?.name)}</p>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> <div class="flex items-center justify-between gap-4"><h1 class="text-md flex-1 font-medium tracking-tight text-gray-900 dark:text-white sm:text-xl leading-[1] edp-title">${$.escape(productState.title || product.title)}</h1> `);

		if (productState.wishlistPluginEnabled) {
			$$renderer.push('<!--[0-->');

			Button($$renderer, {
				variant: 'plain',
				class: 'h-9 w-9 p-0 sm:hidden',
				onclick: productState.handleWishlistClick,
				'aria-label': 'Add to wishlist',
				children: ($$renderer) => {
					if (productState.wishlistLoading) {
						$$renderer.push('<!--[0-->');
						LoaderCircle($$renderer, { class: 'h-6 w-6 animate-spin text-primary' });
					} else {
						$$renderer.push('<!--[-1-->');

						HeartIcon($$renderer, {
							class: `h-6 w-6 ${productState.wishlisted
								? 'scale-110 fill-red-500 text-red-500'
								: 'text-gray-900'} transition-transform duration-300`
						});
					}

					$$renderer.push(`<!--]-->`);
				},
				$$slots: { default: true }
			});
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></div> `);

		if (product.subtitle) {
			$$renderer.push(`<!--[0--><div class="mt-3 line-clamp-3 text-xs font-medium sm:text-sm edp-subtitle">${$.html(productState.selectedVariant?.subtitle || product.subtitle)}</div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> `);

		if (reviewCount() > 0) {
			$$renderer.push(`<!--[0--><div class="intra-pt flex items-center gap-4 edp-reviewrow"><div class="flex items-center gap-2"><div class="relative flex items-center"><div class="flex gap-0.5"><!--[-->`);

			const each_array = $.ensure_array_like({ length: 5 });

			for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
				let _ = each_array[$$index];

				Star($$renderer, { class: 'h-4 w-4 fill-gray-100 text-gray-100' });
			}

			$$renderer.push(`<!--]--></div> <div class="absolute left-0 top-0 flex gap-0.5 overflow-hidden"><!--[-->`);

			const each_array_1 = $.ensure_array_like({ length: 5 });

			for (let i = 0, $$length = each_array_1.length; i < $$length; i++) {
				let _ = each_array_1[i];

				Star($$renderer, {
					class: `h-4 w-4 ${i < Math.floor(avgRating()) ? 'fill-primary text-primary' : 'hidden'}`
				});
			}

			$$renderer.push(`<!--]--> `);

			if (avgRating() % 1 > 0) {
				$$renderer.push('<!--[0-->');
				StarHalf($$renderer, { class: 'h-4 w-4 fill-primary text-primary' });
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></div></div> <span class="text-xs font-bold text-gray-900 dark:text-gray-100">${$.escape(avgRating())}</span> <span class="h-1 w-1 rounded-full bg-gray-300"></span> <span class="text-xs text-gray-500">${$.escape(reviewCount())} ${$.escape(reviewCount() === 1 ? 'review' : 'reviews')}</span> `);

			Button($$renderer, {
				variant: 'link',
				class: 'h-auto p-0 text-xs font-medium',
				children: ($$renderer) => {
					$$renderer.push(`<!---->View Reviews`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----></div></div>`);
		} else if (reviewsEnabled()) {
			$$renderer.push(`<!--[1--><div class="intra-pt edp-reviewrow"><span class="text-sm text-gray-400 edp-review-empty">Be the first to review</span></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></div>`);
	});
}