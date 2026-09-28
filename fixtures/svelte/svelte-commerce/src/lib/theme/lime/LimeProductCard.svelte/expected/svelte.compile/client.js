import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { toCssRatio } from '$lib/theme/aspect-ratio.js';
import { page } from '$app/state';
import { Heart } from '@lucide/svelte';
import { ProductCardRenderer } from '$lib/core/composables/index.js';
import { LlImage, LlPrice, LlRating, LlButton } from './ui/index.js';

var root = $.from_html(`<button type="button"><!></button>`);
var root_1 = $.from_html(`<div class="ll-card-rating svelte-1yxihk5"><!></div>`);
var root_2 = $.from_html(`<div class="ll-card-actions svelte-1yxihk5"><!></div>`);
var root_3 = $.from_html(`<article class="ll-card svelte-1yxihk5"><a class="ll-card-media svelte-1yxihk5"><!> <!></a> <a class="ll-card-body svelte-1yxihk5"><h3 class="ll-card-title svelte-1yxihk5"> </h3> <!> <div class="ll-card-price svelte-1yxihk5"><!></div></a> <!></article>`);

export default function LimeProductCard($$anchor, $$props) {
	$.push($$props, true);

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
	let hideCartControls = $.prop($$props, 'hideCartControls', 3, false);

	// Store-editable microcopy; falls back to the theme's own wording when not supplied.
	const labels = $.derived(() => $$props.themeContent?.labels ?? {});

	const currencyCode = $.derived(() => page?.data?.store?.currency?.code || '');
	const wishlistPlugin = $.derived(() => page?.data?.store?.plugins?.isWishlist);

	const rating = $.derived(() => typeof $$props.product?.rating === 'number'
		? $$props.product.rating
		: Array.isArray($$props.product?.ratings) ? $$props.product.ratings.length : 0);

	// The store's configured product image ratio, as a CSS value ('3:4' → '3 / 4'). Without
	// this LlImage fell back to its own 1/1 default, so a store set to 3:4 or 16:9 got
	// centre-cropped square cards on lime only.
	const mediaRatio = $.derived(() => toCssRatio($$props.aspectRatio || page?.data?.store?.productImageAspectRatio, '1:1'));

	{
		const content = ($$anchor, $$arg0) => {
			let toggleWishlist = () => ($$arg0?.()).toggleWishlist;
			let isWishlisted = () => ($$arg0?.()).isWishlisted;
			let addToCart = () => ($$arg0?.()).addToCart;
			let loadingForCart = () => ($$arg0?.()).loadingForCart;
			let loadingForWishlist = () => ($$arg0?.()).loadingForWishlist;
			var article = root_3();
			var a = $.child(article);
			var node = $.child(a);

			{
				let $0 = $.derived(() => $$props.product.thumbnail || $$props.product?.image_url);
				let $1 = $.derived(() => $$props.product.title || $$props.product.name);

				LlImage(node, {
					get src() {
						return $.get($0);
					},

					get alt() {
						return $.get($1);
					},

					get ratio() {
						return $.get(mediaRatio);
					}
				});
			}

			var node_1 = $.sibling(node, 2);

			{
				var consequent = ($$anchor) => {
					var button = root();
					let classes;
					var node_2 = $.child(button);

					Heart(node_2, { class: 'll-card-wish-icon' });
					$.reset(button);

					$.template_effect(() => {
						classes = $.set_class(button, 1, 'll-card-wish svelte-1yxihk5', null, classes, { 'is-active': isWishlisted() });
						button.disabled = loadingForWishlist();
						$.set_attribute(button, 'aria-busy', loadingForWishlist());

						$.set_attribute(button, 'aria-label', isWishlisted()
							? $.get(labels).removeFromWishlist || 'Remove from wishlist'
							: $.get(labels).addToWishlist || 'Add to wishlist');
					});

					$.delegated('click', button, (e) => {
						e.preventDefault();
						e.stopPropagation();
						toggleWishlist()();
					});

					$.append($$anchor, button);
				};

				$.if(node_1, ($$render) => {
					if ($.get(wishlistPlugin)?.active) $$render(consequent);
				});
			}

			$.reset(a);

			var a_1 = $.sibling(a, 2);
			var h3 = $.child(a_1);
			var text = $.only_child(h3, true);
			var node_3 = $.sibling(h3, 2);

			{
				var consequent_1 = ($$anchor) => {
					var div = root_1();
					var node_4 = $.child(div);

					LlRating(node_4, {
						get value() {
							return $.get(rating);
						},
						size: 13
					});

					$.reset(div);
					$.append($$anchor, div);
				};

				$.if(node_3, ($$render) => {
					if ($.get(rating) > 0) $$render(consequent_1);
				});
			}

			var div_1 = $.sibling(node_3, 2);
			var node_5 = $.child(div_1);

			LlPrice(node_5, {
				get price() {
					return $$props.product.price;
				},

				get mrp() {
					return $$props.product.mrp;
				},

				get currencyCode() {
					return $.get(currencyCode);
				}
			});

			$.reset(div_1);
			$.reset(a_1);

			var node_6 = $.sibling(a_1, 2);

			{
				var consequent_2 = ($$anchor) => {
					var div_2 = root_2();
					var node_7 = $.child(div_2);

					LlButton(node_7, {
						variant: 'outline',
						full: true,
						get loading() {
							return loadingForCart();
						},

						get disabled() {
							return loadingForCart();
						},
						onclick: () => addToCart()($$props.product),
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_1 = $.text();

							$.template_effect(() => $.set_text(text_1, $.get(labels).addToBag || 'Add to Bag'));
							$.append($$anchor, text_1);
						},
						$$slots: { default: true }
					});

					$.reset(div_2);
					$.append($$anchor, div_2);
				};

				$.if(node_6, ($$render) => {
					if (!hideCartControls()) $$render(consequent_2);
				});
			}

			$.reset(article);

			$.template_effect(() => {
				$.set_attribute(article, 'data-testid', `product-card-${$$props.product.id ?? ''}`);
				$.set_attribute(a, 'href', `/products/${$$props.product.slug ?? ''}`);
				$.set_attribute(a, 'aria-label', `View ${($$props.product.title || $$props.product.name) ?? ''}`);
				$.set_attribute(a_1, 'href', `/products/${$$props.product.slug ?? ''}`);
				$.set_attribute(h3, 'title', $$props.product.title || $$props.product.name);
				$.set_text(text, $$props.product.title || $$props.product.name);
			});

			$.append($$anchor, article);
		};

		ProductCardRenderer($$anchor, {
			get product() {
				return $$props.product;
			},

			get aspectRatio() {
				return $$props.aspectRatio;
			},
			content,
			$$slots: { content: true }
		});
	}

	$.pop();
}

$.delegate(['click']);