import * as $ from 'svelte/internal/server';
import { page } from '$app/state';
import { Plus, Minus, Heart } from '@lucide/svelte';
import LoadingDots from '$lib/core/components/common/loading-dots.svelte';
import LazyImg from '$lib/core/components/image/lazy-img.svelte';
import EmptyImage from '$lib/core/components/image/empty-image.svelte';
import { getCartState } from '$lib/core/stores/index.js';
import { formatPrice } from '$lib/core/utils';
import { ProductCardRenderer } from '$lib/core/composables/index.js';

export default function DefaultProductCard($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const cartState = getCartState();

		let {
			product,
			aspectRatio,
			hideCartControls = true,
			priority = false
		} = $$props;

		const discount = $.derived(() => product.mrp && product.mrp > product.price
			? Math.round((product.mrp - product.price) / product.mrp * 100)
			: 0);

		const wishlistPlugin = $.derived(() => page?.data?.store?.plugins?.isWishlist);
		const tag = $.derived(() => product?.material?.[0]);

		{
			function content(
				$$renderer,
				{ toggleWishlist, isWishlisted, changeQuantity, addToCart }
			) {
				$$renderer.push(`<section${$.attr('data-testid', `product-card-${$.stringify(product.id)}`)}${$.attr('data-productid', `product-card-${$.stringify(product.id)}`)} class="dpc group svelte-zzwhth"><a data-testid="product-card-link" class="dpc__media-link svelte-zzwhth"${$.attr('href', `/products/${$.stringify(product.slug)}`)}${$.attr('aria-label', `View details of ${$.stringify(product.title || product.name)}`)}><figure${$.attr('title', product.title || product.name)} data-testid="product-card-image-container" class="dpc__media svelte-zzwhth"${$.attr_style(`aspect-ratio: ${$.stringify(aspectRatio || '1 / 1')};`)}>`);

				if (product.thumbnail || product?.image_url) {
					$$renderer.push('<!--[0-->');

					LazyImg($$renderer, {
						src: product.thumbnail || product?.image_url,
						alt: `${$.stringify(product.title || product.name)} product image`,
						sizes: '(min-width: 1024px) 25vw, (min-width: 768px) 38vw, 50vw',
						class: 'dpc__img',
						priority
					});
				} else {
					$$renderer.push('<!--[-1-->');
					EmptyImage($$renderer, { class: 'dpc__img' });
				}

				$$renderer.push(`<!--]--> `);

				if (tag()) {
					$$renderer.push(`<!--[0--><div class="dpc__tag svelte-zzwhth"><span data-testid="product-card-tag" class="svelte-zzwhth">${$.escape(tag())}</span></div>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--> `);

				if (product.rating || Array.isArray(product.ratings) && product.ratings.length > 0) {
					$$renderer.push(`<!--[0--><div data-testid="product-card-rating-container" class="dpc__rating svelte-zzwhth"><svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" fill="none" viewBox="0 0 12 12" aria-hidden="true"><path fill="#c9a227" d="M5.58 1.15a.5.5 0 0 1 .84 0l1.528 2.363a.5.5 0 0 0 .291.212l2.72.722a.5.5 0 0 1 .26.799L9.442 7.429a.5.5 0 0 0-.111.343l.153 2.81a.5.5 0 0 1-.68.493L6.18 10.063a.5.5 0 0 0-.36 0l-2.625 1.014a.5.5 0 0 1-.68-.494l.153-2.81a.5.5 0 0 0-.11-.343L.781 5.246a.5.5 0 0 1 .26-.799l2.719-.722a.5.5 0 0 0 .291-.212L5.58 1.149Z"></path></svg> <span>${$.escape(product.rating || (Array.isArray(product.ratings) ? product.ratings.length : product.ratings))}</span></div>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--> `);

				if (wishlistPlugin()?.active) {
					$$renderer.push(`<!--[0--><button type="button" class="dpc__wish svelte-zzwhth" data-testid="wishlist-button" aria-label="Toggle wishlist">`);

					if (isWishlisted) {
						$$renderer.push('<!--[0-->');
						Heart($$renderer, { class: 'dpc__wish-icon is-on' });
					} else {
						$$renderer.push('<!--[-1-->');
						Heart($$renderer, { class: 'dpc__wish-icon' });
					}

					$$renderer.push(`<!--]--></button>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--></figure></a> <div data-testid="product-card-info-wrapper" class="dpc__info svelte-zzwhth"><a${$.attr('href', `/products/${$.stringify(product.slug)}`)} class="dpc__title-link svelte-zzwhth"><span class="dpc__title svelte-zzwhth" data-testid="product-title"${$.attr('title', product.title)}>${$.escape(product.title)}</span></a> <div class="dpc__price svelte-zzwhth" data-testid="product-card-price-container"><span data-testid="product-card-selling-price" class="dpc__price-now svelte-zzwhth">${$.escape(formatPrice(product.price, page?.data?.store?.currency?.code))}</span> `);

				if (product.mrp && product.mrp > product.price) {
					$$renderer.push(`<!--[0--><span class="dpc__price-mrp svelte-zzwhth" data-testid="product-card-mrp">${$.escape(formatPrice(product.mrp, page?.data?.store?.currency?.code))}</span> <span class="dpc__price-off svelte-zzwhth" data-testid="product-card-discount">${$.escape(discount())}% off</span>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--></div> `);

				if (!hideCartControls) {
					$$renderer.push(`<!--[0--><div class="dpc__cart svelte-zzwhth">`);

					if (cartState?.cart?.lineItems?.some((item) => item.productId === product.id)) {
						$$renderer.push(`<!--[0--><div class="dpc__qty svelte-zzwhth"><button type="button"${$.attr('disabled', !!cartState.isUpdatingCart, true)} aria-label="Decrease quantity" class="svelte-zzwhth">`);
						Minus($$renderer, { class: 'dpc__qty-icon' });
						$$renderer.push(`<!----></button> <span class="dpc__qty-val svelte-zzwhth">`);

						if (cartState.isUpdatingCart) {
							$$renderer.push('<!--[0-->');
							LoadingDots($$renderer, {});
						} else {
							$$renderer.push(`<!--[-1-->${$.escape(cartState.cart?.lineItems?.find((item) => item.productId === product.id)?.qty)}`);
						}

						$$renderer.push(`<!--]--></span> <button type="button"${$.attr('disabled', !!cartState.isUpdatingCart, true)} aria-label="Increase quantity" class="svelte-zzwhth">`);
						Plus($$renderer, { class: 'dpc__qty-icon' });
						$$renderer.push(`<!----></button></div>`);
					} else {
						$$renderer.push(`<!--[-1--><button type="button" class="dpc__add svelte-zzwhth"${$.attr('disabled', !!cartState?.isUpdatingCart, true)}>`);

						if (cartState?.isUpdatingCart) {
							$$renderer.push('<!--[0-->');
							LoadingDots($$renderer, {});
						} else {
							$$renderer.push(`<!--[-1-->Quick Add`);
						}

						$$renderer.push(`<!--]--></button>`);
					}

					$$renderer.push(`<!--]--></div>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--></div></section>`);
			}

			ProductCardRenderer($$renderer, { product, aspectRatio, content, $$slots: { content: true } });
		}
	});
}