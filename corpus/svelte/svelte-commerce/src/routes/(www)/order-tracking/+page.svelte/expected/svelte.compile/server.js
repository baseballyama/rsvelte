import * as $ from 'svelte/internal/server';
import { page } from '$app/state';
import productNonVeg from '$lib/assets/product/non-veg.png';
import productVeg from '$lib/assets/product/veg.png';
import { date, formatPrice } from '$lib/core/utils';
import LazyImg from '$lib/core/components/image/lazy-img.svelte';
import Button from '$lib/components/ui/button/button.svelte';
import OrderListSkeleton from '../../(my)/my/orders/_OrderListSkeleton.svelte';
import OrderTimeline from '$lib/components/order/order-timeline.svelte';
import StatusCell from '$lib/components/common/status-cell.svelte';
import { OrderTrackingModule } from '$lib/core/composables/index.js';
import { CheckCircle } from '@lucide/svelte';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const orderTrackingModule = new OrderTrackingModule();

		$.head('s2sv7m', $$renderer, ($$renderer) => {
			$$renderer.title(($$renderer) => {
				$$renderer.push(`<title>Order</title>`);
			});
		});

		$$renderer.push(`<div>`);

		if (orderTrackingModule.loading) {
			$$renderer.push(`<!--[0--><div class="flex items-center justify-center">`);
			OrderListSkeleton($$renderer, {});
			$$renderer.push(`<!----></div>`);
		} else if (orderTrackingModule.order && orderTrackingModule.order?.orderNo) {
			$$renderer.push(`<!--[1--><section class="container mx-auto"><div class="my-5 overflow-hidden rounded-lg border sm:mb-10"><div class="flex flex-wrap items-center justify-between rounded-lg rounded-b-none border-b bg-gray-50 px-5 py-3"><div class="flex items-center gap-4"><h6>Order No : #${$.escape(orderTrackingModule.order?.orderNo)}</h6> `);
			StatusCell($$renderer, { value: orderTrackingModule.order?.status });
			$$renderer.push(`<!----></div> <h6 class="mt-2 text-sm text-gray-500 sm:mt-0">Order Date : ${$.escape(date(orderTrackingModule.order?.createdAt))}</h6></div> <div class="flex flex-col lg:grid lg:grid-cols-2 lg:divide-x"><div class="order-1 flex flex-col divide-y lg:order-none">`);

			if (orderTrackingModule.order?.lineItems) {
				$$renderer.push(`<!--[0--><div class="divide-y divide-dashed text-xs text-zinc-500"><!--[-->`);

				const each_array = $.ensure_array_like(orderTrackingModule.order?.lineItems);

				for (let $$index_3 = 0, $$length = each_array.length; $$index_3 < $$length; $$index_3++) {
					let item = each_array[$$index_3];

					if (item) {
						$$renderer.push(`<!--[0--><div class="flex gap-2 p-5 lg:gap-5"><a${$.attr('href', `/products/${item.slug}`)} aria-label="Click to view the product details" class="shrink-0">`);

						if (item.isCustomized) {
							$$renderer.push(`<!--[0--><img${$.attr('src', item.customizedImg)}${$.attr('alt', `${$.stringify(item.name)} (Customized)`)} class="h-auto w-14 object-contain object-top"/>`);
						} else {
							$$renderer.push('<!--[-1-->');

							LazyImg($$renderer, {
								src: item.thumbnail || item.img,
								alt: item.name,
								width: '56',
								class: 'h-auto w-14 object-contain object-top'
							});
						}

						$$renderer.push(`<!--]--></a> <div class="flex w-full flex-1 flex-col gap-0.5 xl:pr-4"><div class="flex justify-between gap-2 sm:gap-4"><a${$.attr('href', `/products/${item.slug}`)} aria-label="Click to view the product details" class="flex-1 hover:underline"><p>${$.escape(item.name)}</p></a> `);

						if (page.data.store?.isFnb && item.foodType) {
							$$renderer.push(`<!--[0--><div>`);

							if (item.foodType === 'veg') {
								$$renderer.push(`<!--[0--><img${$.attr('src', productVeg)} alt="veg" class="h-5 w-5"/>`);
							} else if (item.foodType === 'nonveg') {
								$$renderer.push(`<!--[1--><img${$.attr('src', productNonVeg)} alt="non veg" class="h-5 w-5"/>`);
							} else {
								$$renderer.push('<!--[-1-->');
							}

							$$renderer.push(`<!--]--></div>`);
						} else {
							$$renderer.push('<!--[-1-->');
						}

						$$renderer.push(`<!--]--></div> `);

						if (item.qty) {
							$$renderer.push(`<!--[0--><span>Qty : <b>${$.escape(item.qty)}</b></span>`);
						} else {
							$$renderer.push('<!--[-1-->');
						}

						$$renderer.push(`<!--]--> `);

						if (item.size) {
							$$renderer.push(`<!--[0--><span>Size : <b>${$.escape(item.size)}</b></span>`);
						} else {
							$$renderer.push('<!--[-1-->');
						}

						$$renderer.push(`<!--]--> `);

						if (item?.usedOptions?.length) {
							$$renderer.push(`<!--[0--><!--[-->`);

							const each_array_1 = $.ensure_array_like(item?.usedOptions);

							for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
								let option = each_array_1[$$index_1];

								if (option?.val?.length && option?.val !== undefined && option?.val != '') {
									$$renderer.push(`<!--[0--><div class="flex flex-wrap gap-2"><span>${$.escape(option.name)}:</span> `);

									if (option.val) {
										$$renderer.push(`<!--[0--><ul class="flex flex-wrap items-center gap-x-2 gap-y-1"><!--[-->`);

										const each_array_2 = $.ensure_array_like(option.val);

										for (let valIndex = 0, $$length = each_array_2.length; valIndex < $$length; valIndex++) {
											let v = each_array_2[valIndex];

											if (v) {
												$$renderer.push(`<!--[0--><b>${$.escape(v)}</b> `);

												if (valIndex < option.val?.length - 1) {
													$$renderer.push(`<!--[0-->,`);
												} else {
													$$renderer.push('<!--[-1-->');
												}

												$$renderer.push(`<!--]-->`);
											} else {
												$$renderer.push('<!--[-1-->');
											}

											$$renderer.push(`<!--]-->`);
										}

										$$renderer.push(`<!--]--></ul>`);
									} else {
										$$renderer.push('<!--[-1-->');
									}

									$$renderer.push(`<!--]--></div>`);
								} else {
									$$renderer.push('<!--[-1-->');
								}

								$$renderer.push(`<!--]-->`);
							}

							$$renderer.push(`<!--]-->`);
						} else {
							$$renderer.push('<!--[-1-->');
						}

						$$renderer.push(`<!--]--> <div class="flex flex-wrap items-center gap-1">Item price : <span class="whitespace-nowrap font-bold text-zinc-800">${$.escape(formatPrice(item.price, page?.data?.store?.currency?.code))}</span> `);

						if (item?.mrp > item?.price) {
							$$renderer.push(`<!--[0--><span class="whitespace-nowrap text-zinc-500 line-through"><strike>${$.escape(formatPrice(item.mrp, page?.data?.store?.currency?.code))}</strike></span> `);

							if (Math.floor((item.mrp - item.price) / item.mrp * 100) > 0) {
								$$renderer.push(`<!--[0--><span class="text-secondary-500 whitespace-nowrap">(${$.escape(Math.floor((item.mrp - item.price) / item.mrp * 100))}% off)</span>`);
							} else {
								$$renderer.push('<!--[-1-->');
							}

							$$renderer.push(`<!--]-->`);
						} else {
							$$renderer.push('<!--[-1-->');
						}

						$$renderer.push(`<!--]--></div> <div class="flex flex-wrap items-center gap-1">Sub Total : <span class="whitespace-nowrap font-bold text-zinc-800">${$.escape(formatPrice(item.subtotal, page?.data?.store?.currency?.code))}</span> `);

						if (item?.total > item?.subtotal) {
							$$renderer.push(`<!--[0--><span class="whitespace-nowrap text-zinc-500 line-through"><strike>${$.escape(formatPrice(item.total, page?.data?.store?.currency?.code))}</strike></span> `);

							if (Math.floor((item.total - item.subtotal) / item.total * 100) > 0) {
								$$renderer.push(`<!--[0--><span class="text-secondary-500 whitespace-nowrap">(${$.escape(Math.floor((item.total - item.subtotal) / item.total * 100))}% off)</span>`);
							} else {
								$$renderer.push('<!--[-1-->');
							}

							$$renderer.push(`<!--]-->`);
						} else {
							$$renderer.push('<!--[-1-->');
						}

						$$renderer.push(`<!--]--></div> `);

						if (item?.files?.length) {
							$$renderer.push(`<!--[0--><ul class="mt-2 flex list-none flex-col gap-1 p-0"><!--[-->`);

							const each_array_3 = $.ensure_array_like(item?.files);

							for (let fx = 0, $$length = each_array_3.length; fx < $$length; fx++) {
								let file = each_array_3[fx];

								$$renderer.push(`<li><a${$.attr('href', file)} download="">`);

								Button($$renderer, {
									class: 'text-xs',
									children: ($$renderer) => {
										$$renderer.push(`<!---->Download File `);

										if (item?.files?.length > 1) {
											$$renderer.push(`<!--[0-->${$.escape(fx + 1)}`);
										} else {
											$$renderer.push('<!--[-1-->');
										}

										$$renderer.push(`<!--]-->`);
									},
									$$slots: { default: true }
								});

								$$renderer.push(`<!----></a></li>`);
							}

							$$renderer.push(`<!--]--></ul>`);
						} else {
							$$renderer.push('<!--[-1-->');
						}

						$$renderer.push(`<!--]--> `);

						if (item?.status === 'delivered') {
							$$renderer.push(`<!--[0--><div class="mt-2 xl:mt-0 xl:w-1/3"><a${$.attr('href', `/products/${$.stringify(item?.slug)}#review`)} aria-label="Click to visit rate &amp; review product" class="max-w-max whitespace-nowrap font-semibold text-indigo-500 hover:underline focus:outline-none">Rate &amp; Review Product</a></div>`);
						} else {
							$$renderer.push('<!--[-1-->');
						}

						$$renderer.push(`<!--]--></div></div>`);
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]-->`);
				}

				$$renderer.push(`<!--]--></div>`);
			} else {
				$$renderer.push(`<!--[-1--><p>No order items found</p>`);
			}

			$$renderer.push(`<!--]--></div> <div class="order-2 p-5 lg:order-none"><div class="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-5"><div class="space-y-2"><h5 class="font-semibold">Delivery Address</h5> <p class="flex flex-col text-sm"><span>${$.escape(orderTrackingModule.order?.shippingAddress?.firstName)}
										${$.escape(orderTrackingModule.order?.shippingAddress?.lastName)} <br/> ${$.escape(orderTrackingModule.order?.shippingAddress?.address_1)} `);

			if (orderTrackingModule.order?.shippingAddress?.address_2) {
				$$renderer.push(`<!--[0-->, ${$.escape(orderTrackingModule.order?.shippingAddress?.address_2)}`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> , ${$.escape(orderTrackingModule.order?.shippingAddress?.city)} <br/> ${$.escape(orderTrackingModule.order?.shippingAddress?.state)}, <span class="uppercase">${$.escape(orderTrackingModule.order?.shippingAddress?.country || orderTrackingModule.order?.shippingAddress?.countryCode)}</span>,
										${$.escape(orderTrackingModule.order?.shippingAddress?.zip)}</span></p> `);

			if (orderTrackingModule.order?.shippingAddress?.phone) {
				$$renderer.push(`<!--[0--><p class="text-sm">${$.escape(orderTrackingModule.order?.shippingAddress?.phone)}</p>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></div> <div class="space-y-2"><h5 class="font-semibold">Billing Address</h5> `);

			if (orderTrackingModule.order?.billingAddressId === orderTrackingModule.order?.shippingAddressId) {
				$$renderer.push(`<!--[0--><div class="flex items-center gap-2 text-sm text-muted-foreground">`);
				CheckCircle($$renderer, { class: 'h-4 w-4 text-green-500' });
				$$renderer.push(`<!----> <span>Same as shipping address</span></div>`);
			} else if (orderTrackingModule.order?.billingAddress) {
				$$renderer.push(`<!--[1--><p class="flex flex-col text-sm"><span>${$.escape(orderTrackingModule.order?.billingAddress?.firstName)}
											${$.escape(orderTrackingModule.order?.billingAddress?.lastName)} <br/> ${$.escape(orderTrackingModule.order?.billingAddress?.address_1)} `);

				if (orderTrackingModule.order?.billingAddress?.address_2) {
					$$renderer.push(`<!--[0-->, ${$.escape(orderTrackingModule.order?.billingAddress?.address_2)}`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--> , ${$.escape(orderTrackingModule.order?.billingAddress?.city)} <br/> ${$.escape(orderTrackingModule.order?.billingAddress?.state)}, <span class="uppercase">${$.escape(orderTrackingModule.order?.billingAddress?.country || orderTrackingModule.order?.billingAddress?.countryCode)}</span>,
											${$.escape(orderTrackingModule.order?.billingAddress?.zip)}</span></p> `);

				if (orderTrackingModule.order?.billingAddress?.phone) {
					$$renderer.push(`<!--[0--><p class="text-sm">${$.escape(orderTrackingModule.order?.billingAddress?.phone)}</p>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]-->`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></div></div></div> <div class="order-3 col-span-full flex justify-end !border-0 !border-t border-gray-200 bg-gray-50 p-5"><div class="flex w-full max-w-md flex-col items-start gap-2"><p class="flex items-center"><span class="mr-2 w-32">Subtotal</span> <span>:   ${$.escape(formatPrice(orderTrackingModule.order?.subtotal || 0, page?.data?.store?.currency?.code) || '0.00')}</span></p> `);

			if (orderTrackingModule.order?.discount && orderTrackingModule.order?.discount > 0) {
				$$renderer.push(`<!--[0--><p class="flex items-center"><span class="mr-2 w-32">Discount</span> <span>:  

										${$.escape(formatPrice(orderTrackingModule.order?.discount || 0, page?.data?.store?.currency?.code) || '0.00')}</span></p>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> <p class="flex items-center"><span class="mr-2 w-32">Shipping</span> <span>:   `);

			if (orderTrackingModule.order?.shippingCharges) {
				$$renderer.push(`<!--[0-->${$.escape(formatPrice(orderTrackingModule.order?.shippingCharges, page?.data?.store?.currency?.code))}`);
			} else {
				$$renderer.push(`<!--[-1-->Free`);
			}

			$$renderer.push(`<!--]--></span></p> `);

			if (orderTrackingModule.order?.codCharges) {
				$$renderer.push(`<!--[0--><p class="flex items-center"><span class="mr-2 w-32">COD Charges</span> <span>:  

										${$.escape(formatPrice(orderTrackingModule.order?.codCharges, page?.data?.store?.currency?.code))}</span></p>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> <hr class="w-full border-t border-zinc-200"/> <div class="flex items-center text-sm font-bold text-zinc-800"><span class="mr-2 w-32">Total</span> <span>:   ${$.escape(formatPrice(orderTrackingModule.order?.total || 0, page?.data?.store?.currency?.code))}</span></div></div></div></div></div> `);

			if (orderTrackingModule.order.tracking?.length) {
				$$renderer.push('<!--[0-->');
				OrderTimeline($$renderer, { timeline: orderTrackingModule.order.tracking });
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></section>`);
		} else {
			$$renderer.push(`<!--[-1--><div class="flex h-[70vh] flex-col items-center justify-center text-center"><h2 class="mb-2 text-2xl font-semibold text-gray-800">Invalid Order Tracking URL</h2> <p class="mb-5 text-gray-600">The order tracking link appears to be invalid or has expired.</p> <a href="/" aria-label="Return to homepage" data-sveltekit-preload-data="">`);

			Button($$renderer, {
				class: 'w-40 py-2 text-sm',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Return Home`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----></a></div>`);
		}

		$$renderer.push(`<!--]--></div>`);
	});
}