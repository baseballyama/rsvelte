import * as $ from 'svelte/internal/server';
import LazyImg from '$lib/core/components/image/lazy-img.svelte';
import Button from '$lib/components/ui/button/button.svelte';
import OrderListSkeleton from '../_OrderListSkeleton.svelte';
import BackButton from '$lib/components/common/back-button.svelte';
import StatusCell from '$lib/components/common/status-cell.svelte';

import {
	FileText,
	Truck,
	Calendar,
	CreditCard,
	Home,
	Building,
	ShoppingBag,
	Tag,
	Currency,
	RefreshCw,
	ChevronRight,
	Package,
	MapPin,
	CreditCardIcon,
	ReceiptText
} from '@lucide/svelte';

import { page } from '$app/state';
import { date, formatPrice } from '$lib/core/utils';
import { MyOrdersIdRenderer } from '$lib/core/composables/index.js';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { class: klass = '', data, $$slots, $$events, ...rest } = $$props;

		$.head('1kyfgrd', $$renderer, ($$renderer) => {
			$$renderer.title(($$renderer) => {
				$$renderer.push(`<title>Order Details | Svelte Commerce</title>`);
			});
		});

		{
			function content($$renderer, { loading, order }) {
				$$renderer.push(`<div${$.attr_class(`mx-auto max-w-6xl ${$.stringify(klass)}`)}>`);

				if (loading) {
					$$renderer.push('<!--[0-->');
					OrderListSkeleton($$renderer, {});
				} else if (order) {
					$$renderer.push(`<!--[1--><section class="space-y-5 lg:pt-8"><div class="flex items-center gap-4">`);
					BackButton($$renderer, { to: '/my/orders', title: 'Order History' });
					$$renderer.push(`<!----></div> <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div><h1 class="text-lg font-bold tracking-tight text-gray-900 md:text-xl">Order #${$.escape(order?.orderNo)}</h1> <p class="mt-2 text-sm text-gray-500">Placed on <span class="font-medium text-gray-900">${$.escape(date(order?.createdAt))}</span></p></div> <div class="flex items-center gap-3">`);

					if (order?.invoiceLink) {
						$$renderer.push('<!--[0-->');

						Button($$renderer, {
							variant: 'outline',
							href: order?.invoiceLink,
							target: '_blank',
							class: 'h-11 gap-2',
							children: ($$renderer) => {
								FileText($$renderer, { class: 'h-4 w-4' });
								$$renderer.push(`<!----> Download Invoice`);
							},
							$$slots: { default: true }
						});
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]--></div></div> <div class="grid grid-cols-1 gap-8 lg:grid-cols-3"><div class="lg:col-span-2 space-y-6"><div class="rounded-md border border-muted/20 bg-muted/5 p-6"><div class="flex flex-col sm:flex-row items-center sm:items-start gap-6"><div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-background ring-1 ring-muted/20 shadow-sm">`);
					Package($$renderer, { class: 'h-6 w-6 text-primary' });
					$$renderer.push(`<!----></div> <div class="flex-1"><div class="flex items-center gap-4"><h3 class="text-base font-bold text-gray-900">Order Status</h3> `);
					StatusCell($$renderer, { value: order?.status || 'processing' });
					$$renderer.push(`<!----></div> <p class="mt-2 text-sm text-gray-500">Your order is currently ${$.escape(order?.status || 'being processed')}.</p> <div class="mt-4 flex w-fit items-center gap-2 rounded-lg bg-success/10 px-3 py-2 text-sm text-green-700 ring-1 ring-green-600/10">`);
					Truck($$renderer, { class: 'h-4 w-4' });

					$$renderer.push(`<!----> <span class="font-medium">Estimated Arrival:</span> <span class="font-bold uppercase tracking-tight">${$.escape(order?.shippingRate?.estimatedMaxDays
						? date(order.createdAt + order?.shippingRate?.estimatedMaxDays * 86400000)
						: date(new Date(Date.now() + 7 * 86400000).toISOString()))}</span></div></div></div></div> <div class="overflow-hidden rounded-xl border border-muted/20 bg-background shadow-sm"><div class="px-3 sm:px-6 py-4"><h3 class="font-medium text-gray-900">Order Items (${$.escape(order?.lineItems?.length || 0)})</h3></div> <div class="divide-y divide-gray-100"><!--[-->`);

					const each_array = $.ensure_array_like(order?.lineItems || []);

					for (let $$index_1 = 0, $$length = each_array.length; $$index_1 < $$length; $$index_1++) {
						let item = each_array[$$index_1];

						$$renderer.push(`<div class="p-3 sm:p-6 transition-colors hover:bg-gray-50/30"><div class="flex gap-6"><a${$.attr('href', `/products/${$.stringify(item.slug)}`)} class="relative shrink-0 overflow-hidden">`);

						LazyImg($$renderer, {
							src: item.isCustomized ? item.customizedImg : item.thumbnail || item.img,
							alt: item.title,
							class: 'aspect-[3/4] w-24 object-contain sm:w-24'
						});

						$$renderer.push(`<!----></a> <div class="flex flex-1 flex-col"><div class="flex flex-col justify-between gap-1 sm:flex-row sm:items-start sm:gap-4"><div class="flex-1"><a${$.attr('href', `/products/${$.stringify(item.slug)}`)} class="group"><h4 class="text-base font-semibold text-gray-900 transition-colors">${$.escape(item.title)}</h4></a> <div class="mt-2 flex flex-wrap gap-4 text-xs font-bold uppercase tracking-wider text-gray-400"><span class="flex items-center gap-1.5">`);
						Tag($$renderer, { class: 'h-3.5 w-3.5' });
						$$renderer.push(`<!----> Qty: ${$.escape(item.qty)}</span> `);

						if (item.size) {
							$$renderer.push(`<!--[0--><span class="h-1 w-1 self-center rounded-full bg-gray-300"></span> <span>Size: ${$.escape(item.size)}</span>`);
						} else {
							$$renderer.push('<!--[-1-->');
						}

						$$renderer.push(`<!--]--> `);

						if (item.variantTitle) {
							$$renderer.push(`<!--[0--><span class="h-1 w-1 self-center rounded-full bg-gray-300"></span> <span>${$.escape(item.variantTitle)}</span>`);
						} else {
							$$renderer.push('<!--[-1-->');
						}

						$$renderer.push(`<!--]--></div></div> <div class="mt-2 sm:mt-0 sm:text-right"><p class="text-base font-semibold text-gray-900">${$.escape(formatPrice(item.price * item.qty, page?.data?.store?.currency?.code))}</p> `);

						if (item?.mrp > item?.price) {
							$$renderer.push(`<!--[0--><p class="mt-1 text-sm text-muted-foreground line-through">${$.escape(formatPrice(item.mrp * item.qty, page?.data?.store?.currency?.code))}</p>`);
						} else {
							$$renderer.push('<!--[-1-->');
						}

						$$renderer.push(`<!--]--></div></div> <div class="mt-auto pt-4 flex items-center justify-between"><div class="flex flex-wrap gap-2">`);

						if (item?.status === 'delivered') {
							$$renderer.push('<!--[0-->');

							Button($$renderer, {
								variant: 'ghost',
								size: 'sm',
								href: `/products/${$.stringify(item?.slug)}#review`,
								class: 'h-8 gap-2 text-xs font-bold',
								children: ($$renderer) => {
									$$renderer.push(`<!---->Rate &amp; Review`);
								},
								$$slots: { default: true }
							});
						} else {
							$$renderer.push('<!--[-1-->');
						}

						$$renderer.push(`<!--]--></div> `);

						if (item?.files?.length) {
							$$renderer.push(`<!--[0--><div class="flex gap-2"><!--[-->`);

							const each_array_1 = $.ensure_array_like(item.files);

							for (let fx = 0, $$length = each_array_1.length; fx < $$length; fx++) {
								let file = each_array_1[fx];

								Button($$renderer, {
									variant: 'outline',
									size: 'sm',
									href: file,
									download: true,
									class: 'h-8 gap-2 text-xs',
									children: ($$renderer) => {
										FileText($$renderer, { class: 'h-3.5 w-3.5' });
										$$renderer.push(`<!----> File ${$.escape(fx + 1)}`);
									},
									$$slots: { default: true }
								});
							}

							$$renderer.push(`<!--]--></div>`);
						} else {
							$$renderer.push('<!--[-1-->');
						}

						$$renderer.push(`<!--]--></div></div></div></div>`);
					}

					$$renderer.push(`<!--]--></div></div> `);

					if (order.fulfillments?.length) {
						$$renderer.push(`<!--[0--><div class="overflow-hidden rounded-xl border border-muted/20 bg-background shadow-sm"><div class="border-b border-gray-100 bg-gray-50/50 px-3 sm:px-6 py-4"><h3 class="font-bold text-gray-900">Shipments</h3></div> <div class="divide-y divide-gray-100"><!--[-->`);

						const each_array_2 = $.ensure_array_like(order.fulfillments);

						for (let ix = 0, $$length = each_array_2.length; ix < $$length; ix++) {
							let fulfillment = each_array_2[ix];

							$$renderer.push(`<div class="p-6"><div class="flex flex-col gap-6 sm:flex-row sm:items-center"><div class="flex-1"><div class="flex items-center gap-3"><span class="text-sm font-bold text-gray-900">Shipment ${$.escape(ix + 1)}</span> `);
							StatusCell($$renderer, { value: fulfillment?.status });
							$$renderer.push(`<!----></div> <div class="mt-4 flex flex-wrap gap-2"><!--[-->`);

							const each_array_3 = $.ensure_array_like(fulfillment?.lineItems || []);

							for (let $$index_2 = 0, $$length = each_array_3.length; $$index_2 < $$length; $$index_2++) {
								let item = each_array_3[$$index_2];

								$$renderer.push(`<div class="h-12 w-10 shrink-0 overflow-hidden rounded border border-gray-100">`);

								LazyImg($$renderer, {
									src: item.thumbnail || item.img,
									alt: item.title,
									class: 'h-full w-full object-cover'
								});

								$$renderer.push(`<!----></div>`);
							}

							$$renderer.push(`<!--]--></div></div> `);

							if (fulfillment?.trackingUrl) {
								$$renderer.push('<!--[0-->');

								Button($$renderer, {
									variant: 'outline',
									href: fulfillment.trackingUrl,
									target: '_blank',
									class: 'h-10 gap-2',
									children: ($$renderer) => {
										Truck($$renderer, { class: 'h-4 w-4' });
										$$renderer.push(`<!----> Track Shipment`);
									},
									$$slots: { default: true }
								});
							} else {
								$$renderer.push('<!--[-1-->');
							}

							$$renderer.push(`<!--]--></div></div>`);
						}

						$$renderer.push(`<!--]--></div></div>`);
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]--></div> <div class="space-y-6"><div class="rounded-md border border-muted/20 bg-background shadow-sm overflow-hidden"><div class="bg-muted/20 px-6 py-3"><h3 class="font-semibold text-gray-900">Address Details</h3></div> <div class="p-3 sm:p-6 space-y-8"><div><div class="flex items-center gap-2 mb-3">`);
					MapPin($$renderer, { class: 'h-4 w-4 text-gray-400' });
					$$renderer.push(`<!----> <h4 class="text-sm font-bold text-gray-900 uppercase tracking-tight">Shipping Address</h4></div> <div class="text-sm leading-relaxed text-gray-600"><p class="font-bold text-gray-900">${$.escape(order?.shippingAddress?.firstName)} ${$.escape(order?.shippingAddress?.lastName)}</p> <p>${$.escape(order?.shippingAddress?.address_1)}</p> `);

					if (order?.shippingAddress?.address_2) {
						$$renderer.push(`<!--[0--><p>${$.escape(order?.shippingAddress?.address_2)}</p>`);
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]--> <p>${$.escape(order?.shippingAddress?.city)}, ${$.escape(order?.shippingAddress?.state)}</p> <p>${$.escape(order?.shippingAddress?.country || order?.shippingAddress?.countryCode)} - ${$.escape(order?.shippingAddress?.zip)}</p> `);

					if (order?.shippingAddress?.phone) {
						$$renderer.push(`<!--[0--><p class="mt-2 font-medium text-gray-900">${$.escape(order?.shippingAddress?.phone)}</p>`);
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]--></div></div> `);

					if (order?.billingAddress) {
						$$renderer.push(`<!--[0--><div class="pt-0"><div class="flex items-center gap-2 mb-3">`);
						ReceiptText($$renderer, { class: 'h-4 w-4 text-gray-400' });
						$$renderer.push(`<!----> <h4 class="text-sm font-bold text-gray-900 uppercase tracking-tight">Billing Address</h4></div> <div class="text-sm leading-relaxed text-gray-600"><p class="font-bold text-gray-900">${$.escape(order?.billingAddress?.firstName)} ${$.escape(order?.billingAddress?.lastName)}</p> <p>${$.escape(order?.billingAddress?.address_1)}</p> <p>${$.escape(order?.billingAddress?.city)}, ${$.escape(order?.billingAddress?.state)} - ${$.escape(order?.billingAddress?.zip)}</p></div></div>`);
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]--></div></div> <div class="rounded-md border border-muted/20 bg-background shadow-sm overflow-hidden"><div class="bg-muted/20 px-3 sm:px-6 py-4"><h3 class="font-semibold text-gray-900">Payment Summary</h3></div> <div class="p-6"><div class="space-y-2"><div class="flex justify-between text-sm"><span class="text-gray-500">Subtotal</span> <span class="font-medium text-gray-900">${$.escape(formatPrice(order?.subtotal, page?.data?.store?.currency?.code))}</span></div> `);

					if (order?.discount > 0) {
						$$renderer.push(`<!--[0--><div class="flex justify-between text-sm text-green-600"><span>Discount</span> <span>-${$.escape(formatPrice(order?.discount, page?.data?.store?.currency?.code))}</span></div>`);
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]--> `);

					if (order?.coupon?.code) {
						$$renderer.push(`<!--[0--><div class="flex justify-between text-xs font-bold text-primary"><span>Coupon (${$.escape(order.coupon.code)})</span> <span>Applied</span></div>`);
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]--> <div class="flex justify-between text-sm"><span class="text-gray-500">Shipping</span> <span class="font-medium text-gray-900">${$.escape(order?.shippingCharges > 0
						? formatPrice(order.shippingCharges, page?.data?.store?.currency?.code)
						: 'FREE')}</span></div> `);

					if (order?.codCharges) {
						$$renderer.push(`<!--[0--><div class="flex justify-between text-sm"><span class="text-gray-500">COD Charges</span> <span class="font-medium text-gray-900">${$.escape(formatPrice(order.codCharges, page?.data?.store?.currency?.code))}</span></div>`);
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]--> <div class="pt-1 flex justify-between items-baseline"><span class="text-base font-bold text-gray-900">Total</span> <span class="text-base font-bold text-gray-900">${$.escape(formatPrice(order?.total, page?.data?.store?.currency?.code))}</span></div> <div class="mt-6 pt-6 border-t border-gray-100 flex items-center justify-between gap-2"><div class="flex items-center gap-2">`);
					CreditCardIcon($$renderer, { class: 'h-4 w-4 text-gray-400' });
					$$renderer.push(`<!----> <span class="text-xs font-bold uppercase tracking-tight text-gray-400">Payment Status</span></div> <span${$.attr_class(`text-xs font-bold uppercase tracking-wider ${order?.paymentStatus === 'paid' ? 'text-green-600' : 'text-red-500'}`)}>${$.escape(order?.paymentStatus)}</span></div></div></div></div> `);

					if (order?.replaceValidTill != null && new Date().getTime() <= order?.replaceValidTill && !order?.isReplaceOrReturn) {
						$$renderer.push('<!--[0-->');

						Button($$renderer, {
							variant: 'secondary',
							href: `/my/exchange?orderId=${$.stringify(order?.orderId)}&itemId=${$.stringify(order?.itemId)}`,
							class: 'w-full h-12 gap-2',
							children: ($$renderer) => {
								RefreshCw($$renderer, { class: 'h-4 w-4' });
								$$renderer.push(`<!----> Exchange or Return`);
							},
							$$slots: { default: true }
						});
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]--></div></div> <div class="pt-10 flex justify-center lg:hidden">`);

					Button($$renderer, {
						variant: 'ghost',
						href: '/my/orders',
						class: 'gap-2',
						children: ($$renderer) => {
							ChevronRight($$renderer, { class: 'h-4 w-4 rotate-180' });
							$$renderer.push(`<!----> Back to All Orders`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----></div></section>`);
				} else {
					$$renderer.push(`<!--[-1--><div class="flex h-[70vh] flex-col items-center justify-center text-center"><div class="h-20 w-20 flex items-center justify-center rounded-full bg-muted/10 mb-6">`);
					ShoppingBag($$renderer, { class: 'h-10 w-10 text-muted-foreground/50' });
					$$renderer.push(`<!----></div> <h2 class="text-2xl font-bold text-gray-900">Order not found</h2> <p class="mt-2 text-gray-500">We couldn't find the order details you're looking for.</p> `);

					Button($$renderer, {
						href: '/my/orders',
						class: 'mt-8 h-12 px-8',
						children: ($$renderer) => {
							$$renderer.push(`<!---->View All Orders`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----></div>`);
				}

				$$renderer.push(`<!--]--></div>`);
			}

			MyOrdersIdRenderer($$renderer, { content, $$slots: { content: true } });
		}
	});
}