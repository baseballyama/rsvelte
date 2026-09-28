import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
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

var root = $.from_html(`<div data-testid="product-card-rating-container" class="absolute bottom-[6px] left-1 z-10"><div class="flex items-center gap-1 rounded-3xl bg-card px-[6px] py-1 lg:px-[9px]"><div class="min-w-[12px]"><svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="none" viewBox="0 0 12 12"><path fill="#FFD232" d="M5.58 1.15a.5.5 0 0 1 .84 0l1.528 2.363a.5.5 0 0 0 .291.212l2.72.722a.5.5 0 0 1 .26.799L9.442 7.429a.5.5 0 0 0-.111.343l.153 2.81a.5.5 0 0 1-.68.493L6.18 10.063a.5.5 0 0 0-.36 0l-2.625 1.014a.5.5 0 0 1-.68-.494l.153-2.81a.5.5 0 0 0-.11-.343L.781 5.246a.5.5 0 0 1 .26-.799l2.719-.722a.5.5 0 0 0 .291-.212L5.58 1.149Z"></path></svg></div> <span class="text-[10px] font-bold text-foreground lg:text-xs"> </span></div></div>`);
var root_1 = $.from_html(`<div class="absolute left-2 top-2 z-10"><div class="rounded-md bg-black/60 px-2 backdrop-blur-sm"><span class="text-xs font-bold uppercase tracking-wider text-white"> </span></div></div>`);
var root_2 = $.from_html(`<!> <span class="sr-only">Toggle wishlist</span>`, 1);
var root_3 = $.from_html(`<div class="absolute right-2 top-2 z-10"><!></div>`);
var root_4 = $.from_html(`<span class="text-xs text-muted-foreground line-through" data-testid="product-card-mrp"> </span> <span class="hidden text-xs font-bold uppercase text-success md:block lg:text-sm" data-testid="product-card-discount"> </span>`, 1);
var root_5 = $.from_html(`<div class="flex items-center justify-between rounded-md border border-border p-1"><!> <div class="flex-1 text-center text-sm font-bold"><!></div> <!></div>`);
var root_6 = $.from_html(`<div class="mt-3"><!></div>`);
var root_7 = $.from_html(`<section class="product-card group relative flex w-full flex-col overflow-hidden bg-card transition-all duration-300"><a data-testid="product-card-link" class="w-full cursor-pointer"><figure data-testid="product-card-image-container" class="relative"><!> <!> <!> <!></figure></a> <div data-testid="product-card-info-wrapper" class="flex flex-col justify-between h-full pt-[7.5px] lg:pt-3"><a class="flex-1 block overflow-hidden"><span class="block w-[80%] text-xs text-muted-foreground lg:text-sm" data-testid="product-title"> </span></a> <div class="flex items-center gap-2" data-testid="product-card-price-container"><span data-testid="product-card-selling-price" class="text-sm font-semibold text-foreground"> </span> <!></div> <!></div></section>`);

export default function Product_card($$anchor, $$props) {
	$.push($$props, true);

	const cartState = getCartState();

	let hideVariations = $.prop($$props, 'hideVariations', 3, true),
		hideCartControls = $.prop($$props, 'hideCartControls', 3, true),
		priority = $.prop($$props, 'priority', 3, false);

	// Theme-specific product card. Guarded so the default store is unaffected;
	// only the lime theme swaps in its bespoke presentation (logic reused
	// via the same ProductCardRenderer inside the themed card).
	const activeTheme = $.derived(() => page?.data?.theme?.name || 'default');

	const discount = $$props.product.mrp && $$props.product.mrp > $$props.product.price
		? Math.round(($$props.product.mrp - $$props.product.price) / $$props.product.mrp * 100)
		: 0;

	const wishlistPlugin = $.derived(() => page?.data?.store?.plugins?.isWishlist);

	const categoryName = $.derived(() => {
		const name = $$props.product?.category?.name || $$props.product?.categories?.[0]?.category?.name;

		if (name?.toLowerCase() == 'uncategorized') return false;

		return name;
	});

	const tag = $.derived(() => {
		const name = $$props.product?.material?.[0];

		return name;
	});

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			LimeProductCard($$anchor, {
				get product() {
					return $$props.product;
				},

				get aspectRatio() {
					return $$props.aspectRatio;
				},

				get hideCartControls() {
					return hideCartControls();
				}
			});
		};

		var consequent_1 = ($$anchor) => {
			NoorProductCard($$anchor, {
				get product() {
					return $$props.product;
				},

				get aspectRatio() {
					return $$props.aspectRatio;
				},

				get hideCartControls() {
					return hideCartControls();
				}
			});
		};

		var consequent_2 = ($$anchor) => {
			DefaultProductCard($$anchor, {
				get product() {
					return $$props.product;
				},

				get aspectRatio() {
					return $$props.aspectRatio;
				},

				get hideCartControls() {
					return hideCartControls();
				},

				get priority() {
					return priority();
				}
			});
		};

		var alternate_5 = ($$anchor) => {
			{
				const content = ($$anchor, $$arg0) => {
					let aspectHeight = () => ($$arg0?.()).aspectHeight;
					let toggleWishlist = () => ($$arg0?.()).toggleWishlist;
					let isWishlisted = () => ($$arg0?.()).isWishlisted;
					let aspectWidth = () => ($$arg0?.()).aspectWidth;
					let handleCardClick = () => ($$arg0?.()).handleCardClick;
					let changeQuantity = () => ($$arg0?.()).changeQuantity;
					let addToCart = () => ($$arg0?.()).addToCart;
					var section = root_7();
					var a = $.child(section);
					var figure = $.child(a);
					var node_1 = $.child(figure);

					{
						var consequent_3 = ($$anchor) => {
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
									class: 'w-full rounded-md object-top object-contain transition-transform duration-500',
									get priority() {
										return priority();
									}
								});
							}
						};

						var alternate = ($$anchor) => {
							EmptyImage($$anchor, { class: 'w-full object-cover' });
						};

						$.if(node_1, ($$render) => {
							if ($$props.product.thumbnail || $$props.product?.image_url) $$render(consequent_3); else $$render(alternate, -1);
						});
					}

					var node_2 = $.sibling(node_1, 2);

					{
						var consequent_4 = ($$anchor) => {
							var div = root();
							var div_1 = $.child(div);
							var span = $.sibling($.child(div_1), 2);
							var text = $.only_child(span, true);

							$.reset(div_1);
							$.reset(div);

							$.template_effect(($0) => $.set_text(text, $0), [
								() => $$props.product.rating || (Array.isArray($$props.product.ratings)
									? $$props.product.ratings.length
									: $$props.product.ratings)
							]);

							$.append($$anchor, div);
						};

						var d = $.derived(() => $$props.product.rating || Array.isArray($$props.product.ratings) && $$props.product.ratings.length > 0);

						$.if(node_2, ($$render) => {
							if ($.get(d)) $$render(consequent_4);
						});
					}

					var node_3 = $.sibling(node_2, 2);

					{
						var consequent_5 = ($$anchor) => {
							var div_2 = root_1();
							var div_3 = $.child(div_2);
							var span_1 = $.child(div_3);
							var text_1 = $.only_child(span_1, true);

							$.reset(div_3);
							$.reset(div_2);
							$.template_effect(() => $.set_text(text_1, $.get(tag)));
							$.append($$anchor, div_2);
						};

						$.if(node_3, ($$render) => {
							if ($.get(tag)) $$render(consequent_5);
						});
					}

					var node_4 = $.sibling(node_3, 2);

					{
						var consequent_7 = ($$anchor) => {
							var div_4 = root_3();
							var node_5 = $.child(div_4);

							Button(node_5, {
								variant: 'ghost',
								size: 'icon',
								class: 'h-auto w-auto rounded-full bg-card/80 p-1.5 shadow-sm backdrop-blur-sm hover:bg-card',
								'data-testid': 'wishlist-button',
								onclick: (e) => {
									e.stopPropagation();
									e.preventDefault();
									toggleWishlist()();
								},

								children: ($$anchor, $$slotProps) => {
									var fragment_7 = root_2();
									var node_6 = $.first_child(fragment_7);

									{
										var consequent_6 = ($$anchor) => {
											Heart($$anchor, { class: 'size-4 fill-red-500 stroke-red-500' });
										};

										var alternate_1 = ($$anchor) => {
											Heart($$anchor, { class: 'size-4' });
										};

										$.if(node_6, ($$render) => {
											if (isWishlisted()) $$render(consequent_6); else $$render(alternate_1, -1);
										});
									}

									$.next(2);
									$.append($$anchor, fragment_7);
								},
								$$slots: { default: true }
							});

							$.reset(div_4);
							$.append($$anchor, div_4);
						};

						$.if(node_4, ($$render) => {
							if ($.get(wishlistPlugin)?.active) $$render(consequent_7);
						});
					}

					$.reset(figure);
					$.reset(a);

					var div_5 = $.sibling(a, 2);
					var a_1 = $.child(div_5);
					var span_2 = $.child(a_1);
					var text_2 = $.only_child(span_2, true);

					$.reset(a_1);

					var div_6 = $.sibling(a_1, 2);
					var span_3 = $.child(div_6);
					var text_3 = $.only_child(span_3, true);
					var node_7 = $.sibling(span_3, 2);

					{
						var consequent_8 = ($$anchor) => {
							var fragment_10 = root_4();
							var span_4 = $.first_child(fragment_10);
							var text_4 = $.only_child(span_4, true);
							var span_5 = $.sibling(span_4, 2);
							var text_5 = $.only_child(span_5);

							$.template_effect(
								($0) => {
									$.set_text(text_4, $0);
									$.set_text(text_5, `${discount}% OFF`);
								},
								[
									() => formatPrice($$props.product.mrp, page?.data?.store?.currency?.code)
								]
							);

							$.append($$anchor, fragment_10);
						};

						$.if(node_7, ($$render) => {
							if ($$props.product.mrp && $$props.product.mrp > $$props.product.price) $$render(consequent_8);
						});
					}

					$.reset(div_6);

					var node_8 = $.sibling(div_6, 2);

					{
						var consequent_12 = ($$anchor) => {
							var div_7 = root_6();
							var node_9 = $.child(div_7);

							{
								var consequent_10 = ($$anchor) => {
									var div_8 = root_5();
									var node_10 = $.child(div_8);

									{
										let $0 = $.derived(() => !!cartState.isUpdatingCart);

										Button(node_10, {
											get disabled() {
												return $.get($0);
											},
											variant: 'ghost',
											size: 'icon',
											onclick: () => changeQuantity()($$props.product, -1),
											children: ($$anchor, $$slotProps) => {
												Minus($$anchor, { class: 'h-4 w-4' });
											},
											$$slots: { default: true }
										});
									}

									var div_9 = $.sibling(node_10, 2);
									var node_11 = $.child(div_9);

									{
										var consequent_9 = ($$anchor) => {
											LoadingDots($$anchor, {});
										};

										var alternate_2 = ($$anchor) => {
											var text_6 = $.text();

											$.template_effect(($0) => $.set_text(text_6, $0), [
												() => cartState.cart?.lineItems?.find((item) => item.productId === $$props.product.id)?.qty
											]);

											$.append($$anchor, text_6);
										};

										$.if(node_11, ($$render) => {
											if (cartState.isUpdatingCart) $$render(consequent_9); else $$render(alternate_2, -1);
										});
									}

									$.reset(div_9);

									var node_12 = $.sibling(div_9, 2);

									{
										let $0 = $.derived(() => !!cartState.isUpdatingCart);

										Button(node_12, {
											get disabled() {
												return $.get($0);
											},
											variant: 'ghost',
											size: 'icon',
											onclick: () => changeQuantity()($$props.product, 1),
											children: ($$anchor, $$slotProps) => {
												Plus($$anchor, { class: 'h-4 w-4' });
											},
											$$slots: { default: true }
										});
									}

									$.reset(div_8);
									$.append($$anchor, div_8);
								};

								var d_1 = $.derived(() => cartState?.cart?.lineItems?.some((item) => item.productId === $$props.product.id));

								var alternate_4 = ($$anchor) => {
									{
										let $0 = $.derived(() => !!cartState?.isUpdatingCart);

										Button($$anchor, {
											get disabled() {
												return $.get($0);
											},
											variant: 'default',
											class: 'w-full py-5',
											onclick: () => addToCart()($$props.product),
											children: ($$anchor, $$slotProps) => {
												var fragment_16 = $.comment();
												var node_13 = $.first_child(fragment_16);

												{
													var consequent_11 = ($$anchor) => {
														LoadingDots($$anchor, {});
													};

													var alternate_3 = ($$anchor) => {
														var text_7 = $.text('Quick Add');

														$.append($$anchor, text_7);
													};

													$.if(node_13, ($$render) => {
														if (cartState?.isUpdatingCart) $$render(consequent_11); else $$render(alternate_3, -1);
													});
												}

												$.append($$anchor, fragment_16);
											},
											$$slots: { default: true }
										});
									}
								};

								$.if(node_9, ($$render) => {
									if ($.get(d_1)) $$render(consequent_10); else $$render(alternate_4, -1);
								});
							}

							$.reset(div_7);
							$.append($$anchor, div_7);
						};

						$.if(node_8, ($$render) => {
							if (!hideCartControls()) $$render(consequent_12);
						});
					}

					$.reset(div_5);
					$.reset(section);

					$.template_effect(
						($0) => {
							$.set_attribute(section, 'data-testid', `product-card-${$$props.product.id ?? ''}`);
							$.set_attribute(section, 'data-productid', `product-card-${$$props.product.id ?? ''}`);
							$.set_attribute(a, 'href', `/products/${$$props.product.slug ?? ''}`);
							$.set_attribute(a, 'aria-label', `View details of ${($$props.product.title || $$props.product.name) ?? ''}`);
							$.set_attribute(figure, 'title', $$props.product.name);
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
		};

		$.if(node, ($$render) => {
			if ($.get(activeTheme) === 'lime') $$render(consequent); else if ($.get(activeTheme) === 'noor') $$render(consequent_1, 1); else if ($.get(activeTheme) === 'default') $$render(consequent_2, 2); else $$render(alternate_5, -1);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}