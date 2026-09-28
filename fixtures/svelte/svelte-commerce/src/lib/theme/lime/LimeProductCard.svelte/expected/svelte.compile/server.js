import * as $ from 'svelte/internal/server';
import { toCssRatio } from '$lib/theme/aspect-ratio.js';
import { page } from '$app/state';
import { Heart } from '@lucide/svelte';
import { ProductCardRenderer } from '$lib/core/composables/index.js';
import { LlImage, LlPrice, LlRating, LlButton } from './ui/index.js';

export default function LimeProductCard($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		/**
		 * Lime product card.
		 *
		 * Presentation only — all commerce behaviour (navigation, wishlist toggle,
		 * add-to-cart, quantity) is delegated to the shared ProductCardRenderer so
		 * this card stays in lock-step with the rest of the store's logic.
		 *
		 * Visual contract (from themes/lime/DESIGN.md + the source demand grid):
		 * square blush imagery, centered regular-weight serif title in plum, quiet
		 * price, thin line wishlist icon, square "Add to Bag" outline button.
		 */
		let { product, aspectRatio, hideCartControls = false, themeContent } = $$props;

		// Store-editable microcopy; falls back to the theme's own wording when not supplied.
		const labels = $.derived(() => themeContent?.labels ?? {});

		const currencyCode = $.derived(() => page?.data?.store?.currency?.code || '');
		const wishlistPlugin = $.derived(() => page?.data?.store?.plugins?.isWishlist);

		const rating = $.derived(() => typeof product?.rating === 'number'
			? product.rating
			: Array.isArray(product?.ratings) ? product.ratings.length : 0);

		// The store's configured product image ratio, as a CSS value ('3:4' → '3 / 4'). Without
		// this LlImage fell back to its own 1/1 default, so a store set to 3:4 or 16:9 got
		// centre-cropped square cards on lime only.
		const mediaRatio = $.derived(() => toCssRatio(aspectRatio || page?.data?.store?.productImageAspectRatio, '1:1'));

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
				$$renderer.push(`<article class="ll-card svelte-1yxihk5"${$.attr('data-testid', `product-card-${$.stringify(product.id)}`)}><a class="ll-card-media svelte-1yxihk5"${$.attr('href', `/products/${$.stringify(product.slug)}`)}${$.attr('aria-label', `View ${$.stringify(product.title || product.name)}`)}>`);

				LlImage($$renderer, {
					src: product.thumbnail || product?.image_url,
					alt: product.title || product.name,
					ratio: mediaRatio()
				});

				$$renderer.push(`<!----> `);

				if (wishlistPlugin()?.active) {
					$$renderer.push(`<!--[0--><button type="button"${$.attr_class('ll-card-wish svelte-1yxihk5', void 0, { 'is-active': isWishlisted })}${$.attr('disabled', loadingForWishlist, true)}${$.attr('aria-busy', loadingForWishlist)}${$.attr('aria-label', isWishlisted
						? labels().removeFromWishlist || 'Remove from wishlist'
						: labels().addToWishlist || 'Add to wishlist')}>`);

					Heart($$renderer, { class: 'll-card-wish-icon' });
					$$renderer.push(`<!----></button>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--></a> <a class="ll-card-body svelte-1yxihk5"${$.attr('href', `/products/${$.stringify(product.slug)}`)}><h3 class="ll-card-title svelte-1yxihk5"${$.attr('title', product.title || product.name)}>${$.escape(product.title || product.name)}</h3> `);

				if (rating() > 0) {
					$$renderer.push(`<!--[0--><div class="ll-card-rating svelte-1yxihk5">`);
					LlRating($$renderer, { value: rating(), size: 13 });
					$$renderer.push(`<!----></div>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--> <div class="ll-card-price svelte-1yxihk5">`);

				LlPrice($$renderer, {
					price: product.price,
					mrp: product.mrp,
					currencyCode: currencyCode()
				});

				$$renderer.push(`<!----></div></a> `);

				if (!hideCartControls) {
					$$renderer.push(`<!--[0--><div class="ll-card-actions svelte-1yxihk5">`);

					LlButton($$renderer, {
						variant: 'outline',
						full: true,
						loading: loadingForCart,
						disabled: loadingForCart,
						onclick: () => addToCart(product),
						children: ($$renderer) => {
							$$renderer.push(`<!---->${$.escape(labels().addToBag || 'Add to Bag')}`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----></div>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--></article>`);
			}

			ProductCardRenderer($$renderer, { product, aspectRatio, content, $$slots: { content: true } });
		}
	});
}