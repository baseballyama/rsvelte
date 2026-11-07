import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { page } from '$app/state';
import { Plus, Minus, Heart } from '@lucide/svelte';
import LoadingDots from '$lib/core/components/common/loading-dots.svelte';
import LazyImg from '$lib/core/components/image/lazy-img.svelte';
import EmptyImage from '$lib/core/components/image/empty-image.svelte';
import { getCartState } from '$lib/core/stores/index.js';
import { formatPrice } from '$lib/core/utils';
import { ProductCardRenderer } from '$lib/core/composables/index.js';

var root = $.from_html(`<div class="dpc__tag svelte-zzwhth"><span data-testid="product-card-tag" class="svelte-zzwhth"> </span></div>`);
var root_1 = $.from_html(`<div data-testid="product-card-rating-container" class="dpc__rating svelte-zzwhth"><svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" fill="none" viewBox="0 0 12 12" aria-hidden="true"><path fill="#c9a227" d="M5.58 1.15a.5.5 0 0 1 .84 0l1.528 2.363a.5.5 0 0 0 .291.212l2.72.722a.5.5 0 0 1 .26.799L9.442 7.429a.5.5 0 0 0-.111.343l.153 2.81a.5.5 0 0 1-.68.493L6.18 10.063a.5.5 0 0 0-.36 0l-2.625 1.014a.5.5 0 0 1-.68-.494l.153-2.81a.5.5 0 0 0-.11-.343L.781 5.246a.5.5 0 0 1 .26-.799l2.719-.722a.5.5 0 0 0 .291-.212L5.58 1.149Z"></path></svg> <span> </span></div>`);
var root_2 = $.from_html(`<button type="button" class="dpc__wish svelte-zzwhth" data-testid="wishlist-button" aria-label="Toggle wishlist"><!></button>`);
var root_3 = $.from_html(`<span class="dpc__price-mrp svelte-zzwhth" data-testid="product-card-mrp"> </span> <span class="dpc__price-off svelte-zzwhth" data-testid="product-card-discount"> </span>`, 1);
var root_4 = $.from_html(`<div class="dpc__qty svelte-zzwhth"><button type="button" aria-label="Decrease quantity" class="svelte-zzwhth"><!></button> <span class="dpc__qty-val svelte-zzwhth"><!></span> <button type="button" aria-label="Increase quantity" class="svelte-zzwhth"><!></button></div>`);
var root_5 = $.from_html(`<button type="button" class="dpc__add svelte-zzwhth"><!></button>`);
var root_6 = $.from_html(`<div class="dpc__cart svelte-zzwhth"><!></div>`);
var root_7 = $.from_html(`<section class="dpc group svelte-zzwhth"><a data-testid="product-card-link" class="dpc__media-link svelte-zzwhth"><figure data-testid="product-card-image-container" class="dpc__media svelte-zzwhth"><!> <!> <!> <!></figure></a> <div data-testid="product-card-info-wrapper" class="dpc__info svelte-zzwhth"><a class="dpc__title-link svelte-zzwhth"><span class="dpc__title svelte-zzwhth" data-testid="product-title"> </span></a> <div class="dpc__price svelte-zzwhth" data-testid="product-card-price-container"><span data-testid="product-card-selling-price" class="dpc__price-now svelte-zzwhth"> </span> <!></div> <!></div></section>`);

export default function DefaultProductCard($$anchor, $$props) {
	$.push($$props, true);

	const cartState = getCartState();

	let hideCartControls = $.prop($$props, 'hideCartControls', 3, true),
		priority = $.prop($$props, 'priority', 3, false);

	const discount = $.derived(() => $$props.product.mrp && $$props.product.mrp > $$props.product.price
		? Math.round(($$props.product.mrp - $$props.product.price) / $$props.product.mrp * 100)
		: 0);

	const wishlistPlugin = $.derived(() => page?.data?.store?.plugins?.isWishlist);
	const tag = $.derived(() => $$props.product?.material?.[0]);

	{
		const content = ($$anchor, $$arg0) => {
			let toggleWishlist = () => ($$arg0?.()).toggleWishlist;
			let isWishlisted = () => ($$arg0?.()).isWishlisted;
			let changeQuantity = () => ($$arg0?.()).changeQuantity;
			let addToCart = () => ($$arg0?.()).addToCart;
			var section = root_7();
			var a = $.child(section);
			var figure = $.child(a);
			var node = $.child(figure);

			{
				var consequent = ($$anchor) => {
					{
						let $0 = $.derived(() => $$props.product.thumbnail || $$props.product?.image_url);
						let $1 = $.derived(() => $$props.product.title || $$props.product.name);

						LazyImg($$anchor, {
							get src() {
								return $.get($0);
							},

							get alt() {
								return `${$.get($1) ?? ''} product image`;
							},
							sizes: '(min-width: 1024px) 25vw, (min-width: 768px) 38vw, 50vw',
							class: 'dpc__img',
							get priority() {
								return priority();
							}
						});
					}
				};

				var alternate = ($$anchor) => {
					EmptyImage($$anchor, { class: 'dpc__img' });
				};

				$.if(node, ($$render) => {
					if ($$props.product.thumbnail || $$props.product?.image_url) $$render(consequent); else $$render(alternate, -1);
				});
			}

			var node_1 = $.sibling(node, 2);

			{
				var consequent_1 = ($$anchor) => {
					var div = root();
					var span = $.child(div);
					var text = $.only_child(span, true);

					$.reset(div);
					$.template_effect(() => $.set_text(text, $.get(tag)));
					$.append($$anchor, div);
				};

				$.if(node_1, ($$render) => {
					if ($.get(tag)) $$render(consequent_1);
				});
			}

			var node_2 = $.sibling(node_1, 2);

			{
				var consequent_2 = ($$anchor) => {
					var div_1 = root_1();
					var span_1 = $.sibling($.child(div_1), 2);
					var text_1 = $.only_child(span_1, true);

					$.reset(div_1);

					$.template_effect(($0) => $.set_text(text_1, $0), [
						() => $$props.product.rating || (Array.isArray($$props.product.ratings)
							? $$props.product.ratings.length
							: $$props.product.ratings)
					]);

					$.append($$anchor, div_1);
				};

				var d = $.derived(() => $$props.product.rating || Array.isArray($$props.product.ratings) && $$props.product.ratings.length > 0);

				$.if(node_2, ($$render) => {
					if ($.get(d)) $$render(consequent_2);
				});
			}

			var node_3 = $.sibling(node_2, 2);

			{
				var consequent_4 = ($$anchor) => {
					var button = root_2();
					var node_4 = $.child(button);

					{
						var consequent_3 = ($$anchor) => {
							Heart($$anchor, { class: 'dpc__wish-icon is-on' });
						};

						var alternate_1 = ($$anchor) => {
							Heart($$anchor, { class: 'dpc__wish-icon' });
						};

						$.if(node_4, ($$render) => {
							if (isWishlisted()) $$render(consequent_3); else $$render(alternate_1, -1);
						});
					}

					$.reset(button);

					$.delegated('click', button, (e) => {
						e.stopPropagation();
						e.preventDefault();
						toggleWishlist()();
					});

					$.append($$anchor, button);
				};

				$.if(node_3, ($$render) => {
					if ($.get(wishlistPlugin)?.active) $$render(consequent_4);
				});
			}

			$.reset(figure);
			$.reset(a);

			var div_2 = $.sibling(a, 2);
			var a_1 = $.child(div_2);
			var span_2 = $.child(a_1);
			var text_2 = $.only_child(span_2, true);

			$.reset(a_1);

			var div_3 = $.sibling(a_1, 2);
			var span_3 = $.child(div_3);
			var text_3 = $.only_child(span_3, true);
			var node_5 = $.sibling(span_3, 2);

			{
				var consequent_5 = ($$anchor) => {
					var fragment_5 = root_3();
					var span_4 = $.first_child(fragment_5);
					var text_4 = $.only_child(span_4, true);
					var span_5 = $.sibling(span_4, 2);
					var text_5 = $.only_child(span_5);

					$.template_effect(
						($0) => {
							$.set_text(text_4, $0);
							$.set_text(text_5, `${$.get(discount) ?? ''}% off`);
						},
						[
							() => formatPrice($$props.product.mrp, page?.data?.store?.currency?.code)
						]
					);

					$.append($$anchor, fragment_5);
				};

				$.if(node_5, ($$render) => {
					if ($$props.product.mrp && $$props.product.mrp > $$props.product.price) $$render(consequent_5);
				});
			}

			$.reset(div_3);

			var node_6 = $.sibling(div_3, 2);

			{
				var consequent_9 = ($$anchor) => {
					var div_4 = root_6();
					var node_7 = $.child(div_4);

					{
						var consequent_7 = ($$anchor) => {
							var div_5 = root_4();
							var button_1 = $.child(div_5);
							var node_8 = $.child(button_1);

							Minus(node_8, { class: 'dpc__qty-icon' });
							$.reset(button_1);

							var span_6 = $.sibling(button_1, 2);
							var node_9 = $.child(span_6);

							{
								var consequent_6 = ($$anchor) => {
									LoadingDots($$anchor, {});
								};

								var alternate_2 = ($$anchor) => {
									var text_6 = $.text();

									$.template_effect(($0) => $.set_text(text_6, $0), [
										() => cartState.cart?.lineItems?.find((item) => item.productId === $$props.product.id)?.qty
									]);

									$.append($$anchor, text_6);
								};

								$.if(node_9, ($$render) => {
									if (cartState.isUpdatingCart) $$render(consequent_6); else $$render(alternate_2, -1);
								});
							}

							$.reset(span_6);

							var button_2 = $.sibling(span_6, 2);
							var node_10 = $.child(button_2);

							Plus(node_10, { class: 'dpc__qty-icon' });
							$.reset(button_2);
							$.reset(div_5);

							$.template_effect(() => {
								button_1.disabled = !!cartState.isUpdatingCart;
								button_2.disabled = !!cartState.isUpdatingCart;
							});

							$.delegated('click', button_1, () => changeQuantity()($$props.product, -1));
							$.delegated('click', button_2, () => changeQuantity()($$props.product, 1));
							$.append($$anchor, div_5);
						};

						var d_1 = $.derived(() => cartState?.cart?.lineItems?.some((item) => item.productId === $$props.product.id));

						var alternate_4 = ($$anchor) => {
							var button_3 = root_5();
							var node_11 = $.child(button_3);

							{
								var consequent_8 = ($$anchor) => {
									LoadingDots($$anchor, {});
								};

								var alternate_3 = ($$anchor) => {
									var text_7 = $.text('Quick Add');

									$.append($$anchor, text_7);
								};

								$.if(node_11, ($$render) => {
									if (cartState?.isUpdatingCart) $$render(consequent_8); else $$render(alternate_3, -1);
								});
							}

							$.reset(button_3);
							$.template_effect(() => button_3.disabled = !!cartState?.isUpdatingCart);
							$.delegated('click', button_3, () => addToCart()($$props.product));
							$.append($$anchor, button_3);
						};

						$.if(node_7, ($$render) => {
							if ($.get(d_1)) $$render(consequent_7); else $$render(alternate_4, -1);
						});
					}

					$.reset(div_4);
					$.append($$anchor, div_4);
				};

				$.if(node_6, ($$render) => {
					if (!hideCartControls()) $$render(consequent_9);
				});
			}

			$.reset(div_2);
			$.reset(section);

			$.template_effect(
				($0) => {
					$.set_attribute(section, 'data-testid', `product-card-${$$props.product.id ?? ''}`);
					$.set_attribute(section, 'data-productid', `product-card-${$$props.product.id ?? ''}`);
					$.set_attribute(a, 'href', `/products/${$$props.product.slug ?? ''}`);
					$.set_attribute(a, 'aria-label', `View details of ${($$props.product.title || $$props.product.name) ?? ''}`);
					$.set_attribute(figure, 'title', $$props.product.title || $$props.product.name);
					$.set_style(figure, `aspect-ratio: ${($$props.aspectRatio || '1 / 1') ?? ''};`);
					$.set_attribute(a_1, 'href', `/products/${$$props.product.slug ?? ''}`);
					$.set_attribute(span_2, 'title', $$props.product.title);
					$.set_text(text_2, $$props.product.title);
					$.set_text(text_3, $0);
				},
				[
					() => formatPrice($$props.product.price, page?.data?.store?.currency?.code)
				]
			);

			$.append($$anchor, section);
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