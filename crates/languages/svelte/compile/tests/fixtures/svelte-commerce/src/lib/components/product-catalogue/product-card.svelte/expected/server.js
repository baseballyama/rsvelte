import * as $ from 'svelte/internal/server';
import { page } from '$app/state';
import { Plus, Minus, Heart } from '@lucide/svelte';
import { Button } from '$lib/components/ui/button';
import LoadingDots from '$lib/core/components/common/loading-dots.svelte';
import LazyImg from '$lib/core/components/image/lazy-img.svelte';
import EmptyImage from '$lib/core/components/image/empty-image.svelte';
import { getCartState } from '$lib/core/stores/index.js';
import { formatPrice } from '$lib/core/utils';
import { ProductCardRenderer } from '$lib/core/composables/index.js';
import LimeProductCard from '$lib/theme/lime/LimeProductCard.svelte';
import NoorProductCard from '$lib/theme/noor/NoorProductCard.svelte';
import DefaultProductCard from '$lib/theme/default/DefaultProductCard.svelte';

export default function Product_card($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const cartState = getCartState();

		let {
			product,
			aspectRatio,
			hideVariations = true,
			hideCartControls = true,
			priority = false
		} = $$props;

		// Theme-specific product card. Guarded so the default store is unaffected;
		// only the lime theme swaps in its bespoke presentation (logic reused
		// via the same ProductCardRenderer inside the themed card).
		const activeTheme = $.derived(() => page?.data?.theme?.name || 'default');

		const discount = product.mrp && product.mrp > product.price
			? Math.round((product.mrp - product.price) / product.mrp * 100)
			: 0;

		const wishlistPlugin = $.derived(() => page?.data?.store?.plugins?.isWishlist);

		const categoryName = $.derived(() => {
			const name = product?.category?.name || product?.categories?.[0]?.category?.name;

			if (name?.toLowerCase() == 'uncategorized') return false;

			return name;
		});

		const tag = $.derived(() => {
			const name = product?.material?.[0];

			return name;
		});

		if (activeTheme() === 'lime') {
			$$renderer.push('<!--[0-->');
			LimeProductCard($$renderer, { product, aspectRatio, hideCartControls });
		} else if (activeTheme() === 'noor') {
			$$renderer.push('<!--[1-->');
			NoorProductCard($$renderer, { product, aspectRatio, hideCartControls });
		} else if (activeTheme() === 'default') {
			$$renderer.push('<!--[2-->');
			DefaultProductCard($$renderer, { product, aspectRatio, hideCartControls, priority });
		} else {
			$$renderer.push('<!--[-1-->');

			{
				function content(
					$$renderer,
					{
						aspectHeight,
						toggleWishlist,
						isWishlisted,
						aspectWidth,
						handleCardClick,
						changeQuantity,
						addToCart
					}
				) {
					$$renderer.push(`<section${$.attr('data-testid', `product-card-${$.stringify(product.id)}`)}${$.attr('data-productid', `product-card-${$.stringify(product.id)}`)} class="product-card group relative flex w-full flex-col overflow-hidden bg-card transition-all duration-300"><a data-testid="product-card-link" class="w-full cursor-pointer"${$.attr('href', `/products/${$.stringify(product.slug)}`)}${$.attr('aria-label', `View details of ${$.stringify(product.title || product.name)}`)}><figure${$.attr('title', product.name)} data-testid="product-card-image-container" class="relative">`);

					if (product.thumbnail || product?.image_url) {
						$$renderer.push('<!--[0-->');

						LazyImg($$renderer, {
							src: product.thumbnail || product?.image_url,
							alt: `${$.stringify(product.title || product.name)} product image`,
							sizes: '(min-width: 1024px) 25vw, (min-width: 768px) 38vw, 50vw',
							class: 'w-full rounded-md object-top object-contain transition-transform duration-500',
							priority
						});
					} else {
						$$renderer.push('<!--[-1-->');
						EmptyImage($$renderer, { class: 'w-full object-cover' });
					}

					$$renderer.push(`<!--]--> `);

					if (product.rating || Array.isArray(product.ratings) && product.ratings.length > 0) {
						$$renderer.push(`<!--[0--><div data-testid="product-card-rating-container" class="absolute bottom-[6px] left-1 z-10"><div class="flex items-center gap-1 rounded-3xl bg-card px-[6px] py-1 lg:px-[9px]"><div class="min-w-[12px]"><svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="none" viewBox="0 0 12 12"><path fill="#FFD232" d="M5.58 1.15a.5.5 0 0 1 .84 0l1.528 2.363a.5.5 0 0 0 .291.212l2.72.722a.5.5 0 0 1 .26.799L9.442 7.429a.5.5 0 0 0-.111.343l.153 2.81a.5.5 0 0 1-.68.493L6.18 10.063a.5.5 0 0 0-.36 0l-2.625 1.014a.5.5 0 0 1-.68-.494l.153-2.81a.5.5 0 0 0-.11-.343L.781 5.246a.5.5 0 0 1 .26-.799l2.719-.722a.5.5 0 0 0 .291-.212L5.58 1.149Z"></path></svg></div> <span class="text-[10px] font-bold text-foreground lg:text-xs">${$.escape(product.rating || (Array.isArray(product.ratings) ? product.ratings.length : product.ratings))}</span></div></div>`);
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]--> `);

					if (tag()) {
						$$renderer.push(`<!--[0--><div class="absolute left-2 top-2 z-10"><div class="rounded-md bg-black/60 px-2 backdrop-blur-sm"><span class="text-xs font-bold uppercase tracking-wider text-white">${$.escape(tag())}</span></div></div>`);
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]--> `);

					if (wishlistPlugin()?.active) {
						$$renderer.push(`<!--[0--><div class="absolute right-2 top-2 z-10">`);

						Button($$renderer, {
							variant: 'ghost',
							size: 'icon',
							class: 'h-auto w-auto rounded-full bg-card/80 p-1.5 shadow-sm backdrop-blur-sm hover:bg-card',
							'data-testid': 'wishlist-button',
							onclick: (e) => {
								e.stopPropagation();
								e.preventDefault();
								toggleWishlist();
							},

							children: ($$renderer) => {
								if (isWishlisted) {
									$$renderer.push('<!--[0-->');
									Heart($$renderer, { class: 'size-4 fill-red-500 stroke-red-500' });
								} else {
									$$renderer.push('<!--[-1-->');
									Heart($$renderer, { class: 'size-4' });
								}

								$$renderer.push(`<!--]--> <span class="sr-only">Toggle wishlist</span>`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----></div>`);
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]--></figure></a> <div data-testid="product-card-info-wrapper" class="flex flex-col justify-between h-full pt-[7.5px] lg:pt-3"><a${$.attr('href', `/products/${$.stringify(product.slug)}`)} class="flex-1 block overflow-hidden"><span class="block w-[80%] text-xs text-muted-foreground lg:text-sm" data-testid="product-title"${$.attr('title', product.title)}>${$.escape(product.title)}</span></a> <div class="flex items-center gap-2" data-testid="product-card-price-container"><span data-testid="product-card-selling-price" class="text-sm font-semibold text-foreground">${$.escape(formatPrice(product.price, page?.data?.store?.currency?.code))}</span> `);

					if (product.mrp && product.mrp > product.price) {
						$$renderer.push(`<!--[0--><span class="text-xs text-muted-foreground line-through" data-testid="product-card-mrp">${$.escape(formatPrice(product.mrp, page?.data?.store?.currency?.code))}</span> <span class="hidden text-xs font-bold uppercase text-success md:block lg:text-sm" data-testid="product-card-discount">${$.escape(discount)}% OFF</span>`);
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]--></div> `);

					if (!hideCartControls) {
						$$renderer.push(`<!--[0--><div class="mt-3">`);

						if (cartState?.cart?.lineItems?.some((item) => item.productId === product.id)) {
							$$renderer.push(`<!--[0--><div class="flex items-center justify-between rounded-md border border-border p-1">`);

							Button($$renderer, {
								disabled: !!cartState.isUpdatingCart,
								variant: 'ghost',
								size: 'icon',
								onclick: () => changeQuantity(product, -1),
								children: ($$renderer) => {
									Minus($$renderer, { class: 'h-4 w-4' });
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> <div class="flex-1 text-center text-sm font-bold">`);

							if (cartState.isUpdatingCart) {
								$$renderer.push('<!--[0-->');
								LoadingDots($$renderer, {});
							} else {
								$$renderer.push(`<!--[-1-->${$.escape(cartState.cart?.lineItems?.find((item) => item.productId === product.id)?.qty)}`);
							}

							$$renderer.push(`<!--]--></div> `);

							Button($$renderer, {
								disabled: !!cartState.isUpdatingCart,
								variant: 'ghost',
								size: 'icon',
								onclick: () => changeQuantity(product, 1),
								children: ($$renderer) => {
									Plus($$renderer, { class: 'h-4 w-4' });
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----></div>`);
						} else {
							$$renderer.push('<!--[-1-->');

							Button($$renderer, {
								disabled: !!cartState?.isUpdatingCart,
								variant: 'default',
								class: 'w-full py-5',
								onclick: () => addToCart(product),
								children: ($$renderer) => {
									if (cartState?.isUpdatingCart) {
										$$renderer.push('<!--[0-->');
										LoadingDots($$renderer, {});
									} else {
										$$renderer.push(`<!--[-1-->Quick Add`);
									}

									$$renderer.push(`<!--]-->`);
								},
								$$slots: { default: true }
							});
						}

						$$renderer.push(`<!--]--></div>`);
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]--></div></section>`);
				}

				ProductCardRenderer($$renderer, { product, aspectRatio, content, $$slots: { content: true } });
			}
		}

		$$renderer.push(`<!--]-->`);
	});
}