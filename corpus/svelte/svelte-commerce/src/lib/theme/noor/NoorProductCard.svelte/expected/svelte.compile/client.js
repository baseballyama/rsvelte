import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { toCssRatio } from '$lib/theme/aspect-ratio.js';
import { page } from '$app/state';
import { Heart, Loader2, ShoppingBag } from '@lucide/svelte';
import { ProductCardRenderer } from '$lib/core/composables/index.js';
import { formatPrice } from '$lib/core/utils';

var root = $.from_html(`<img loading="lazy" class="svelte-2y8o17"/>`);
var root_1 = $.from_html(`<span class="noor-sale svelte-2y8o17"> </span>`);
var root_2 = $.from_html(`<button type="button"><!></button>`);
var root_3 = $.from_html(`<span class="svelte-2y8o17"> </span>`);
var root_4 = $.from_html(`<button class="noor-add svelte-2y8o17" type="button"><!> </button>`);
var root_5 = $.from_html(`<article class="noor-card svelte-2y8o17"><a class="noor-card-media svelte-2y8o17"><!> <!> <!></a> <a class="noor-card-body svelte-2y8o17"><h3 class="svelte-2y8o17"> </h3> <p class="svelte-2y8o17"><!> <!></p></a> <!></article>`);

export default function NoorProductCard($$anchor, $$props) {
	$.push($$props, true);

	let hideCartControls = $.prop($$props, 'hideCartControls', 3, false);

	// Store-editable microcopy; the literals are only the fallback when no content is passed.
	const labels = $.derived(() => $$props.themeContent?.labels ?? {});

	const currencyCode = $.derived(() => page?.data?.store?.currency?.code || '');
	const wishlistPlugin = $.derived(() => page?.data?.store?.plugins?.isWishlist);
	const title = $.derived(() => $$props.product?.title || $$props.product?.name || $.get(labels).productFallbackTitle || 'Product');

	// No stand-in product photo: a product without an image simply shows none.
	const image = $.derived(() => $$props.product?.thumbnail || $$props.product?.image_url || $$props.product?.image || '');

	const discount = $.derived(() => $$props.product?.mrp && $$props.product?.mrp > $$props.product?.price
		? Math.round(($$props.product.mrp - $$props.product.price) / $$props.product.mrp * 100)
		: 0);

	// The store's configured product image ratio, as a CSS value ('3:4' → '3 / 4'). The card
	// took the `aspectRatio` prop but then hardcoded 3/4 in its stylesheet, so a store set to
	// 1:1 or 16:9 still got 3:4 cards on noor only.
	const mediaRatio = $.derived(() => toCssRatio($$props.aspectRatio || page?.data?.store?.productImageAspectRatio, '3:4'));

	{
		const content = ($$anchor, $$arg0) => {
			let toggleWishlist = () => ($$arg0?.()).toggleWishlist;
			let isWishlisted = () => ($$arg0?.()).isWishlisted;
			let addToCart = () => ($$arg0?.()).addToCart;
			let loadingForCart = () => ($$arg0?.()).loadingForCart;
			let loadingForWishlist = () => ($$arg0?.()).loadingForWishlist;
			var article = root_5();
			var a = $.child(article);
			var node = $.child(a);

			{
				var consequent = ($$anchor) => {
					var img = root();

					$.template_effect(() => {
						$.set_attribute(img, 'src', $.get(image));
						$.set_attribute(img, 'alt', $.get(title));
					});

					$.append($$anchor, img);
				};

				$.if(node, ($$render) => {
					if ($.get(image)) $$render(consequent);
				});
			}

			var node_1 = $.sibling(node, 2);

			{
				var consequent_1 = ($$anchor) => {
					var span = root_1();
					var text = $.only_child(span);

					$.template_effect(() => $.set_text(text, `-${$.get(discount) ?? ''}%`));
					$.append($$anchor, span);
				};

				$.if(node_1, ($$render) => {
					if ($.get(discount) > 0) $$render(consequent_1);
				});
			}

			var node_2 = $.sibling(node_1, 2);

			{
				var consequent_2 = ($$anchor) => {
					var button = root_2();
					let classes;
					var node_3 = $.child(button);

					Heart(node_3, { class: 'h-4 w-4' });
					$.reset(button);

					$.template_effect(() => {
						classes = $.set_class(button, 1, 'noor-wish svelte-2y8o17', null, classes, { 'is-active': isWishlisted() });
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

				$.if(node_2, ($$render) => {
					if ($.get(wishlistPlugin)?.active) $$render(consequent_2);
				});
			}

			$.reset(a);

			var a_1 = $.sibling(a, 2);
			var h3 = $.child(a_1);
			var text_1 = $.only_child(h3, true);
			var p = $.sibling(h3, 2);
			var node_4 = $.child(p);

			{
				var consequent_3 = ($$anchor) => {
					var text_2 = $.text();

					$.template_effect(($0) => $.set_text(text_2, $0), [
						() => formatPrice($$props.product.price, $.get(currencyCode))
					]);

					$.append($$anchor, text_2);
				};

				var alternate = ($$anchor) => {
					var text_3 = $.text();

					$.template_effect(() => $.set_text(text_3, $.get(labels).priceOnRequest || 'Price on request'));
					$.append($$anchor, text_3);
				};

				$.if(node_4, ($$render) => {
					if ($$props.product?.price) $$render(consequent_3); else $$render(alternate, -1);
				});
			}

			var node_5 = $.sibling(node_4, 2);

			{
				var consequent_4 = ($$anchor) => {
					var span_1 = root_3();
					var text_4 = $.only_child(span_1, true);

					$.template_effect(($0) => $.set_text(text_4, $0), [() => formatPrice($$props.product.mrp, $.get(currencyCode))]);
					$.append($$anchor, span_1);
				};

				$.if(node_5, ($$render) => {
					if ($$props.product?.mrp && $$props.product.mrp > $$props.product.price) $$render(consequent_4);
				});
			}

			$.reset(p);
			$.reset(a_1);

			var node_6 = $.sibling(a_1, 2);

			{
				var consequent_6 = ($$anchor) => {
					var button_1 = root_4();
					var node_7 = $.child(button_1);

					{
						var consequent_5 = ($$anchor) => {
							Loader2($$anchor, { class: 'noor-add-spin h-4 w-4' });
						};

						var alternate_1 = ($$anchor) => {
							ShoppingBag($$anchor, { class: 'h-4 w-4' });
						};

						$.if(node_7, ($$render) => {
							if (loadingForCart()) $$render(consequent_5); else $$render(alternate_1, -1);
						});
					}

					var text_5 = $.sibling(node_7);

					$.reset(button_1);

					$.template_effect(() => {
						button_1.disabled = loadingForCart();
						$.set_attribute(button_1, 'aria-busy', loadingForCart());
						$.set_text(text_5, ` ${($.get(labels).addToCart || 'Add to Cart') ?? ''}`);
					});

					$.delegated('click', button_1, () => addToCart()($$props.product));
					$.append($$anchor, button_1);
				};

				$.if(node_6, ($$render) => {
					if (!hideCartControls()) $$render(consequent_6);
				});
			}

			$.reset(article);

			$.template_effect(() => {
				$.set_attribute(article, 'data-testid', `product-card-${$$props.product.id ?? ''}`);
				$.set_style(article, `--noor-media-ratio: ${$.get(mediaRatio) ?? ''};`);
				$.set_attribute(a, 'href', `/products/${$$props.product.slug ?? ''}`);
				$.set_attribute(a, 'aria-label', `View ${$.get(title) ?? ''}`);
				$.set_attribute(a_1, 'href', `/products/${$$props.product.slug ?? ''}`);
				$.set_text(text_1, $.get(title));
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