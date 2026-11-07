import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Button } from '$lib/components/ui/button';
import { MyWishlistRenderer } from '$lib/core/composables/index.js';
import { Heart, ArrowRight, LoaderCircle, Trash2, ShoppingBag } from '@lucide/svelte';
import { fade, fly } from 'svelte/transition';
import { page } from '$app/state';
import { formatPrice, toast } from '$lib/core/utils/index.js';
import LazyImg from '$lib/core/components/image/lazy-img.svelte';
import * as Dialog from '$lib/components/ui/dialog';

var root = $.from_html(`<div class="flex min-h-[400px] items-center justify-center"><!></div>`);
var root_1 = $.from_html(`Browse Products <!>`, 1);
var root_2 = $.from_html(`<div class="flex flex-col items-center justify-center py-20 text-center"><div class="relative mb-6"><div class="absolute inset-0 scale-150 animate-pulse rounded-full bg-gray-50"></div> <div class="relative flex h-24 w-24 items-center justify-center rounded-full border border-gray-100 bg-white shadow-sm"><!></div></div> <h2 class="text-2xl font-bold text-gray-900">Your wishlist is empty</h2> <p class="mt-2 max-w-xs text-gray-500">Save items you like to keep track of them and buy them later.</p> <div class="mt-8"><!></div></div>`);
var root_3 = $.from_html(`<span class="text-xs text-gray-400 line-through"> </span> <span class="hidden text-xs font-bold uppercase text-green-600 md:block lg:text-sm"> </span>`, 1);
var root_4 = $.from_html(`<div class="group relative flex h-full w-full flex-col overflow-hidden bg-white transition-all duration-300 dark:bg-gray-800"><a class="relative block w-full overflow-hidden"><!></a> <div class="flex flex-1 flex-col pt-4"><a class="block overflow-hidden"><span class="block w-[95%] truncate text-sm font-medium text-gray-700 lg:text-sm"> </span></a> <div class="mt-1 flex items-center gap-2"><span class="text-base font-bold text-gray-900"> </span> <!></div> <div class="mt-auto pt-5 flex items-center gap-2"><!> <!></div></div></div>`);
var root_5 = $.from_html(`<div class="grid grid-cols-2 gap-6 md:grid-cols-3 md:gap-8 lg:grid-cols-3 lg:gap-10"></div>`);
var root_6 = $.from_html(`<!> <!>`, 1);
var root_7 = $.from_html(`<div class="mx-auto max-w-7xl px-0 md:py-8 md:py-12"><div class="mb-10 flex items-center justify-between"><div><h1 class="text-lg font-bold tracking-tight text-gray-900 md:text-xl">My Wishlist</h1> <p class="mt-2 text-sm text-gray-500">Items you've saved for later.</p></div></div> <!> <!></div>`);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	let showRemoveConfirmation = $.state(false);
	let itemToRemove = $.state(null);

	function confirmRemove(item) {
		$.set(itemToRemove, item, true);
		$.set(showRemoveConfirmation, true);
	}

	$.head('16fzqff', ($$anchor) => {
		$.effect(() => {
			$.document.title = 'My Wishlist | Svelte Commerce';
		});
	});

	{
		const content = ($$anchor, $$arg0) => {
			let loading = () => ($$arg0?.()).loading;
			let wishlistItems = () => ($$arg0?.()).wishlistItems;
			let moveToCart = () => ($$arg0?.()).moveToCart;
			let removeFromWishlist = () => ($$arg0?.()).removeFromWishlist;
			var div = root_7();
			var node = $.sibling($.child(div), 2);

			{
				var consequent = ($$anchor) => {
					var div_1 = root();
					var node_1 = $.child(div_1);

					LoaderCircle(node_1, { class: 'h-8 w-8 animate-spin text-primary' });
					$.reset(div_1);
					$.append($$anchor, div_1);
				};

				var consequent_1 = ($$anchor) => {
					var div_2 = root_2();
					var div_3 = $.child(div_2);
					var div_4 = $.sibling($.child(div_3), 2);
					var node_2 = $.child(div_4);

					Heart(node_2, { class: 'h-10 w-10 text-gray-300' });
					$.reset(div_4);
					$.reset(div_3);

					var div_5 = $.sibling(div_3, 6);
					var node_3 = $.child(div_5);

					Button(node_3, {
						href: '/products',
						class: 'h-12 px-8',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var fragment_1 = root_1();
							var node_4 = $.sibling($.first_child(fragment_1));

							ArrowRight(node_4, { class: 'ml-2 h-4 w-4' });
							$.append($$anchor, fragment_1);
						},
						$$slots: { default: true }
					});

					$.reset(div_5);
					$.reset(div_2);
					$.transition(1, div_2, () => fade);
					$.append($$anchor, div_2);
				};

				var alternate = ($$anchor) => {
					var div_6 = root_5();

					$.each(div_6, 21, wishlistItems, $.index, ($$anchor, item, i) => {
						var div_7 = root_4();
						var a = $.child(div_7);
						var node_5 = $.child(a);

						{
							let $0 = $.derived(() => $.get(item)?.product?.thumbnail ?? undefined);
							let $1 = $.derived(() => $.get(item)?.product?.title);

							LazyImg(node_5, {
								get src() {
									return $.get($0);
								},

								get alt() {
									return $.get($1);
								},
								class: 'w-full rounded-md object-cover transition-transform duration-500',
								style: 'aspect-ratio: 4 / 5; border-radius: 8px;'
							});
						}

						$.reset(a);

						var div_8 = $.sibling(a, 2);
						var a_1 = $.child(div_8);
						var span = $.child(a_1);
						var text = $.only_child(span, true);

						$.reset(a_1);

						var div_9 = $.sibling(a_1, 2);
						var span_1 = $.child(div_9);
						var text_1 = $.only_child(span_1, true);
						var node_6 = $.sibling(span_1, 2);

						{
							var consequent_2 = ($$anchor) => {
								var fragment_2 = root_3();
								var span_2 = $.first_child(fragment_2);
								var text_2 = $.only_child(span_2, true);
								var span_3 = $.sibling(span_2, 2);
								var text_3 = $.only_child(span_3);

								$.template_effect(
									($0, $1) => {
										$.set_text(text_2, $0);
										$.set_text(text_3, `${$1 ?? ''}% OFF`);
									},
									[
										() => formatPrice($.get(item)?.product?.mrp, page?.data?.store?.currency?.code),
										() => Math.round(($.get(item)?.product?.mrp - $.get(item)?.product?.price) / $.get(item)?.product?.mrp * 100)
									]
								);

								$.append($$anchor, fragment_2);
							};

							$.if(node_6, ($$render) => {
								if ($.get(item)?.product?.mrp > $.get(item)?.product?.price) $$render(consequent_2);
							});
						}

						$.reset(div_9);

						var div_10 = $.sibling(div_9, 2);
						var node_7 = $.child(div_10);

						Button(node_7, {
							variant: 'outline',
							size: 'icon',
							class: 'h-8 w-[20%] md:h-9',
							onclick: (e) => {
								e.preventDefault();
								e.stopPropagation();
								confirmRemove($.get(item));
							},
							title: 'Remove from wishlist',
							children: ($$anchor, $$slotProps) => {
								Trash2($$anchor, { class: 'size-5' });
							},
							$$slots: { default: true }
						});

						var node_8 = $.sibling(node_7, 2);

						Button(node_8, {
							variant: 'default',
							class: 'h-8 w-[80%] md:h-9',
							onclick: async (e) => {
								e.preventDefault();
								e.stopPropagation();
								await moveToCart()($.get(item));
								toast('Item added to cart', 'success');
							},

							children: ($$anchor, $$slotProps) => {
								$.next();

								var text_4 = $.text('Add to Cart');

								$.append($$anchor, text_4);
							},
							$$slots: { default: true }
						});

						$.reset(div_10);
						$.reset(div_8);
						$.reset(div_7);

						$.template_effect(
							($0) => {
								$.set_attribute(a, 'href', `/products/${$.get(item)?.product?.slug ?? ''}?variant_id=${$.get(item).variantId ?? ''}`);
								$.set_attribute(a_1, 'href', `/products/${$.get(item)?.product?.slug ?? ''}?variant_id=${$.get(item).variantId ?? ''}`);
								$.set_attribute(span, 'title', $.get(item)?.product?.title);
								$.set_text(text, $.get(item)?.product?.title);
								$.set_text(text_1, $0);
							},
							[
								() => formatPrice($.get(item)?.product?.price, page?.data?.store?.currency?.code)
							]
						);

						$.transition(1, div_7, () => fly, () => ({ y: 20, duration: 400, delay: i * 50 }));
						$.append($$anchor, div_7);
					});

					$.reset(div_6);
					$.append($$anchor, div_6);
				};

				$.if(node, ($$render) => {
					if (loading()) $$render(consequent); else if (wishlistItems().length === 0) $$render(consequent_1, 1); else $$render(alternate, -1);
				});
			}

			var node_9 = $.sibling(node, 2);

			$.component(node_9, () => Dialog.Root, ($$anchor, Dialog_Root) => {
				Dialog_Root($$anchor, {
					get open() {
						return $.get(showRemoveConfirmation);
					},

					set open($$value) {
						$.set(showRemoveConfirmation, $$value, true);
					},

					children: ($$anchor, $$slotProps) => {
						var fragment_4 = $.comment();
						var node_10 = $.first_child(fragment_4);

						$.component(node_10, () => Dialog.Content, ($$anchor, Dialog_Content) => {
							Dialog_Content($$anchor, {
								class: 'sm:max-w-[425px]',
								children: ($$anchor, $$slotProps) => {
									var fragment_5 = root_6();
									var node_11 = $.first_child(fragment_5);

									$.component(node_11, () => Dialog.Header, ($$anchor, Dialog_Header) => {
										Dialog_Header($$anchor, {
											children: ($$anchor, $$slotProps) => {
												var fragment_6 = root_6();
												var node_12 = $.first_child(fragment_6);

												$.component(node_12, () => Dialog.Title, ($$anchor, Dialog_Title) => {
													Dialog_Title($$anchor, {
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_5 = $.text('Remove from Wishlist');

															$.append($$anchor, text_5);
														},
														$$slots: { default: true }
													});
												});

												var node_13 = $.sibling(node_12, 2);

												$.component(node_13, () => Dialog.Description, ($$anchor, Dialog_Description) => {
													Dialog_Description($$anchor, {
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_6 = $.text('Are you sure you want to remove this item from your wishlist?');

															$.append($$anchor, text_6);
														},
														$$slots: { default: true }
													});
												});

												$.append($$anchor, fragment_6);
											},
											$$slots: { default: true }
										});
									});

									var node_14 = $.sibling(node_11, 2);

									$.component(node_14, () => Dialog.Footer, ($$anchor, Dialog_Footer) => {
										Dialog_Footer($$anchor, {
											class: 'mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end',
											children: ($$anchor, $$slotProps) => {
												var fragment_7 = root_6();
												var node_15 = $.first_child(fragment_7);

												Button(node_15, {
													variant: 'outline',
													onclick: () => $.set(showRemoveConfirmation, false),
													class: 'flex-1 sm:flex-none',
													children: ($$anchor, $$slotProps) => {
														$.next();

														var text_7 = $.text('Cancel');

														$.append($$anchor, text_7);
													},
													$$slots: { default: true }
												});

												var node_16 = $.sibling(node_15, 2);

												Button(node_16, {
													variant: 'destructive',
													onclick: async () => {
														if ($.get(itemToRemove)) {
															await removeFromWishlist()($.get(itemToRemove).productId, $.get(itemToRemove).variantId);
															$.set(showRemoveConfirmation, false);
															$.set(itemToRemove, null);
														}
													},
													class: 'flex-1 sm:flex-none',
													children: ($$anchor, $$slotProps) => {
														$.next();

														var text_8 = $.text('Remove');

														$.append($$anchor, text_8);
													},
													$$slots: { default: true }
												});

												$.append($$anchor, fragment_7);
											},
											$$slots: { default: true }
										});
									});

									$.append($$anchor, fragment_5);
								},
								$$slots: { default: true }
							});
						});

						$.append($$anchor, fragment_4);
					},
					$$slots: { default: true }
				});
			});

			$.reset(div);
			$.append($$anchor, div);
		};

		MyWishlistRenderer($$anchor, { content, $$slots: { content: true } });
	}

	$.pop();
}