import * as $ from 'svelte/internal/server';
import { Button } from '$lib/components/ui/button';
import { MyWishlistRenderer } from '$lib/core/composables/index.js';
import { Heart, ArrowRight, LoaderCircle, Trash2, ShoppingBag } from '@lucide/svelte';
import { fade, fly } from 'svelte/transition';
import { page } from '$app/state';
import { formatPrice, toast } from '$lib/core/utils/index.js';
import LazyImg from '$lib/core/components/image/lazy-img.svelte';
import * as Dialog from '$lib/components/ui/dialog';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let showRemoveConfirmation = false;
		let itemToRemove = null;

		function confirmRemove(item) {
			itemToRemove = item;
			showRemoveConfirmation = true;
		}

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$.head('16fzqff', $$renderer, ($$renderer) => {
				$$renderer.title(($$renderer) => {
					$$renderer.push(`<title>My Wishlist | Svelte Commerce</title>`);
				});
			});

			{
				function content(
					$$renderer,
					{ loading, wishlistItems, moveToCart, removeFromWishlist }
				) {
					$$renderer.push(`<div class="mx-auto max-w-7xl px-0 md:py-8 md:py-12"><div class="mb-10 flex items-center justify-between"><div><h1 class="text-lg font-bold tracking-tight text-gray-900 md:text-xl">My Wishlist</h1> <p class="mt-2 text-sm text-gray-500">Items you've saved for later.</p></div></div> `);

					if (loading) {
						$$renderer.push(`<!--[0--><div class="flex min-h-[400px] items-center justify-center">`);
						LoaderCircle($$renderer, { class: 'h-8 w-8 animate-spin text-primary' });
						$$renderer.push(`<!----></div>`);
					} else if (wishlistItems.length === 0) {
						$$renderer.push(`<!--[1--><div class="flex flex-col items-center justify-center py-20 text-center"><div class="relative mb-6"><div class="absolute inset-0 scale-150 animate-pulse rounded-full bg-gray-50"></div> <div class="relative flex h-24 w-24 items-center justify-center rounded-full border border-gray-100 bg-white shadow-sm">`);
						Heart($$renderer, { class: 'h-10 w-10 text-gray-300' });
						$$renderer.push(`<!----></div></div> <h2 class="text-2xl font-bold text-gray-900">Your wishlist is empty</h2> <p class="mt-2 max-w-xs text-gray-500">Save items you like to keep track of them and buy them later.</p> <div class="mt-8">`);

						Button($$renderer, {
							href: '/products',
							class: 'h-12 px-8',
							children: ($$renderer) => {
								$$renderer.push(`<!---->Browse Products `);
								ArrowRight($$renderer, { class: 'ml-2 h-4 w-4' });
								$$renderer.push(`<!---->`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----></div></div>`);
					} else {
						$$renderer.push(`<!--[-1--><div class="grid grid-cols-2 gap-6 md:grid-cols-3 md:gap-8 lg:grid-cols-3 lg:gap-10"><!--[-->`);

						const each_array = $.ensure_array_like(wishlistItems);

						for (let i = 0, $$length = each_array.length; i < $$length; i++) {
							let item = each_array[i];

							$$renderer.push(`<div class="group relative flex h-full w-full flex-col overflow-hidden bg-white transition-all duration-300 dark:bg-gray-800"><a${$.attr('href', `/products/${$.stringify(item?.product?.slug)}?variant_id=${$.stringify(item.variantId)}`)} class="relative block w-full overflow-hidden">`);

							LazyImg($$renderer, {
								src: item?.product?.thumbnail ?? undefined,
								alt: item?.product?.title,
								class: 'w-full rounded-md object-cover transition-transform duration-500',
								style: 'aspect-ratio: 4 / 5; border-radius: 8px;'
							});

							$$renderer.push(`<!----></a> <div class="flex flex-1 flex-col pt-4"><a${$.attr('href', `/products/${$.stringify(item?.product?.slug)}?variant_id=${$.stringify(item.variantId)}`)} class="block overflow-hidden"><span class="block w-[95%] truncate text-sm font-medium text-gray-700 lg:text-sm"${$.attr('title', item?.product?.title)}>${$.escape(item?.product?.title)}</span></a> <div class="mt-1 flex items-center gap-2"><span class="text-base font-bold text-gray-900">${$.escape(formatPrice(item?.product?.price, page?.data?.store?.currency?.code))}</span> `);

							if (item?.product?.mrp > item?.product?.price) {
								$$renderer.push(`<!--[0--><span class="text-xs text-gray-400 line-through">${$.escape(formatPrice(item?.product?.mrp, page?.data?.store?.currency?.code))}</span> <span class="hidden text-xs font-bold uppercase text-green-600 md:block lg:text-sm">${$.escape(Math.round((item?.product?.mrp - item?.product?.price) / item?.product?.mrp * 100))}% OFF</span>`);
							} else {
								$$renderer.push('<!--[-1-->');
							}

							$$renderer.push(`<!--]--></div> <div class="mt-auto pt-5 flex items-center gap-2">`);

							Button($$renderer, {
								variant: 'outline',
								size: 'icon',
								class: 'h-8 w-[20%] md:h-9',
								onclick: (e) => {
									e.preventDefault();
									e.stopPropagation();
									confirmRemove(item);
								},
								title: 'Remove from wishlist',
								children: ($$renderer) => {
									Trash2($$renderer, { class: 'size-5' });
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							Button($$renderer, {
								variant: 'default',
								class: 'h-8 w-[80%] md:h-9',
								onclick: async (e) => {
									e.preventDefault();
									e.stopPropagation();
									await moveToCart(item);
									toast('Item added to cart', 'success');
								},

								children: ($$renderer) => {
									$$renderer.push(`<!---->Add to Cart`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----></div></div></div>`);
						}

						$$renderer.push(`<!--]--></div>`);
					}

					$$renderer.push(`<!--]--> `);

					if (Dialog.Root) {
						$$renderer.push('<!--[-->');

						Dialog.Root($$renderer, {
							get open() {
								return showRemoveConfirmation;
							},

							set open($$value) {
								showRemoveConfirmation = $$value;
								$$settled = false;
							},

							children: ($$renderer) => {
								if (Dialog.Content) {
									$$renderer.push('<!--[-->');

									Dialog.Content($$renderer, {
										class: 'sm:max-w-[425px]',
										children: ($$renderer) => {
											if (Dialog.Header) {
												$$renderer.push('<!--[-->');

												Dialog.Header($$renderer, {
													children: ($$renderer) => {
														if (Dialog.Title) {
															$$renderer.push('<!--[-->');

															Dialog.Title($$renderer, {
																children: ($$renderer) => {
																	$$renderer.push(`<!---->Remove from Wishlist`);
																},
																$$slots: { default: true }
															});

															$$renderer.push('<!--]-->');
														} else {
															$$renderer.push('<!--[!-->');
															$$renderer.push('<!--]-->');
														}

														$$renderer.push(` `);

														if (Dialog.Description) {
															$$renderer.push('<!--[-->');

															Dialog.Description($$renderer, {
																children: ($$renderer) => {
																	$$renderer.push(`<!---->Are you sure you want to remove this item from your wishlist?`);
																},
																$$slots: { default: true }
															});

															$$renderer.push('<!--]-->');
														} else {
															$$renderer.push('<!--[!-->');
															$$renderer.push('<!--]-->');
														}
													},
													$$slots: { default: true }
												});

												$$renderer.push('<!--]-->');
											} else {
												$$renderer.push('<!--[!-->');
												$$renderer.push('<!--]-->');
											}

											$$renderer.push(` `);

											if (Dialog.Footer) {
												$$renderer.push('<!--[-->');

												Dialog.Footer($$renderer, {
													class: 'mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end',
													children: ($$renderer) => {
														Button($$renderer, {
															variant: 'outline',
															onclick: () => showRemoveConfirmation = false,
															class: 'flex-1 sm:flex-none',
															children: ($$renderer) => {
																$$renderer.push(`<!---->Cancel`);
															},
															$$slots: { default: true }
														});

														$$renderer.push(`<!----> `);

														Button($$renderer, {
															variant: 'destructive',
															onclick: async () => {
																if (itemToRemove) {
																	await removeFromWishlist(itemToRemove.productId, itemToRemove.variantId);
																	showRemoveConfirmation = false;
																	itemToRemove = null;
																}
															},
															class: 'flex-1 sm:flex-none',
															children: ($$renderer) => {
																$$renderer.push(`<!---->Remove`);
															},
															$$slots: { default: true }
														});

														$$renderer.push(`<!---->`);
													},
													$$slots: { default: true }
												});

												$$renderer.push('<!--]-->');
											} else {
												$$renderer.push('<!--[!-->');
												$$renderer.push('<!--]-->');
											}
										},
										$$slots: { default: true }
									});

									$$renderer.push('<!--]-->');
								} else {
									$$renderer.push('<!--[!-->');
									$$renderer.push('<!--]-->');
								}
							},
							$$slots: { default: true }
						});

						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}

					$$renderer.push(`</div>`);
				}

				MyWishlistRenderer($$renderer, { content, $$slots: { content: true } });
			}
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}