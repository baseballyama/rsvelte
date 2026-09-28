import * as $ from 'svelte/internal/server';
import { toCssRatio } from '$lib/theme/aspect-ratio.js';
import { page } from '$app/state';
import { Heart, Loader2, ShoppingBag } from '@lucide/svelte';
import { ProductCardRenderer } from '$lib/core/composables/index.js';
import { formatPrice } from '$lib/core/utils';

export default function NoorProductCard($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { product, aspectRatio, hideCartControls = false, themeContent } = $$props;

		// Store-editable microcopy; the literals are only the fallback when no content is passed.
		const labels = $.derived(() => themeContent?.labels ?? {});

		const currencyCode = $.derived(() => page?.data?.store?.currency?.code || '');
		const wishlistPlugin = $.derived(() => page?.data?.store?.plugins?.isWishlist);
		const title = $.derived(() => product?.title || product?.name || labels().productFallbackTitle || 'Product');

		// No stand-in product photo: a product without an image simply shows none.
		const image = $.derived(() => product?.thumbnail || product?.image_url || product?.image || '');

		const discount = $.derived(() => product?.mrp && product?.mrp > product?.price
			? Math.round((product.mrp - product.price) / product.mrp * 100)
			: 0);

		// The store's configured product image ratio, as a CSS value ('3:4' → '3 / 4'). The card
		// took the `aspectRatio` prop but then hardcoded 3/4 in its stylesheet, so a store set to
		// 1:1 or 16:9 still got 3:4 cards on noor only.
		const mediaRatio = $.derived(() => toCssRatio(aspectRatio || page?.data?.store?.productImageAspectRatio, '3:4'));

		{
			function content(
				$$renderer,
				{
					toggleWishlist,
					isWishlisted,
					addToCart,
					loadingForCart,
					loadingForWishlist
				}
			) {
				$$renderer.push(`<article class="noor-card svelte-2y8o17"${$.attr('data-testid', `product-card-${$.stringify(product.id)}`)}${$.attr_style(`--noor-media-ratio: ${$.stringify(mediaRatio())};`)}><a class="noor-card-media svelte-2y8o17"${$.attr('href', `/products/${$.stringify(product.slug)}`)}${$.attr('aria-label', `View ${$.stringify(title())}`)}>`);

				if (image()) {
					$$renderer.push(`<!--[0--><img${$.attr('src', image())}${$.attr('alt', title())} loading="lazy" class="svelte-2y8o17"/>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--> `);

				if (discount() > 0) {
					$$renderer.push(`<!--[0--><span class="noor-sale svelte-2y8o17">-${$.escape(discount())}%</span>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--> `);

				if (wishlistPlugin()?.active) {
					$$renderer.push(`<!--[0--><button type="button"${$.attr_class('noor-wish svelte-2y8o17', void 0, { 'is-active': isWishlisted })}${$.attr('disabled', loadingForWishlist, true)}${$.attr('aria-busy', loadingForWishlist)}${$.attr('aria-label', isWishlisted
						? labels().removeFromWishlist || 'Remove from wishlist'
						: labels().addToWishlist || 'Add to wishlist')}>`);

					Heart($$renderer, { class: 'h-4 w-4' });
					$$renderer.push(`<!----></button>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--></a> <a class="noor-card-body svelte-2y8o17"${$.attr('href', `/products/${$.stringify(product.slug)}`)}><h3 class="svelte-2y8o17">${$.escape(title())}</h3> <p class="svelte-2y8o17">`);

				if (product?.price) {
					$$renderer.push(`<!--[0-->${$.escape(formatPrice(product.price, currencyCode()))}`);
				} else {
					$$renderer.push(`<!--[-1-->${$.escape(labels().priceOnRequest || 'Price on request')}`);
				}

				$$renderer.push(`<!--]--> `);

				if (product?.mrp && product.mrp > product.price) {
					$$renderer.push(`<!--[0--><span class="svelte-2y8o17">${$.escape(formatPrice(product.mrp, currencyCode()))}</span>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--></p></a> `);

				if (!hideCartControls) {
					$$renderer.push(`<!--[0--><button class="noor-add svelte-2y8o17" type="button"${$.attr('disabled', loadingForCart, true)}${$.attr('aria-busy', loadingForCart)}>`);

					if (loadingForCart) {
						$$renderer.push('<!--[0-->');
						Loader2($$renderer, { class: 'noor-add-spin h-4 w-4' });
					} else {
						$$renderer.push('<!--[-1-->');
						ShoppingBag($$renderer, { class: 'h-4 w-4' });
					}

					$$renderer.push(`<!--]--> ${$.escape(labels().addToCart || 'Add to Cart')}</button>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--></article>`);
			}

			ProductCardRenderer($$renderer, { product, aspectRatio, content, $$slots: { content: true } });
		}
	});
}