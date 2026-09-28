import * as $ from 'svelte/internal/server';
import { Button } from '$lib/components/ui/button';
import LazyImg from '$lib/core/components/image/lazy-img.svelte';

import {
	ChevronRight,
	ShoppingBag,
	Calendar,
	Tag,
	Package,
	CreditCard,
	ArrowRight,
	CheckCircle2,
	Clock,
	Truck,
	XCircle,
	AlertCircle,
	LoaderCircle
} from '@lucide/svelte';

import { page } from '$app/state';
import { date, formatPrice } from '$lib/core/utils';
import { orderService } from '$lib/core/services/index.js';
import Pagination from '$lib/components/common/pagination.svelte';
import { fade, fly } from 'svelte/transition';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		// Fetched here rather than through MyOrdersRenderer: that renderer swallows failures (leaving
		// `orders.data` undefined for the {#each}) and always requests page 1.
		let loading = true;

		let error = '';
		let orders = {};
		const currentPage = $.derived(() => +(page.url.searchParams.get('page') || '1'));
		const noOfPage = $.derived(() => Math.ceil((orders?.count || 0) / (orders?.pageSize || 20)));

		async function loadOrders() {
			try {
				loading = true;
				error = '';
				orders = await orderService.list({ page: currentPage(), q: '', sort: 'createdAt' });
			} catch(e) {
				console.error(e);
				orders = {};
				error = e?.message || 'We could not load your orders right now.';
			} finally {
				loading = false;
			}
		}

		// Re-fetch whenever ?page= changes.
		const getStatusStyles = (status) => {
			switch (status?.toLowerCase()) {
				case 'delivered':
					return {
						bg: 'bg-green-50',
						text: 'text-green-700',
						ring: 'ring-green-600/20',
						dot: 'bg-green-500',
						icon: CheckCircle2
					};

				case 'shipped':
					return {
						bg: 'bg-blue-50',
						text: 'text-blue-700',
						ring: 'ring-blue-600/20',
						dot: 'bg-blue-500',
						icon: Truck
					};

				case 'processing':
					return {
						bg: 'bg-yellow-50',
						text: 'text-yellow-700',
						ring: 'ring-yellow-600/20',
						dot: 'bg-yellow-500',
						icon: Clock
					};

				case 'cancelled':
					return {
						bg: 'bg-red-50',
						text: 'text-red-700',
						ring: 'ring-red-600/20',
						dot: 'bg-red-500',
						icon: XCircle
					};

				default:
					return {
						bg: 'bg-gray-50',
						text: 'text-gray-700',
						ring: 'ring-gray-600/20',
						dot: 'bg-gray-500',
						icon: Package
					};
			}
		};

		const getPaymentStatusStyles = (status) => {
			switch (status?.toLowerCase()) {
				case 'paid':
					return {
						bg: 'bg-green-50',
						text: 'text-green-700',
						ring: 'ring-green-600/20',
						dot: 'bg-green-500'
					};

				case 'pending':
					return {
						bg: 'bg-yellow-50',
						text: 'text-yellow-700',
						ring: 'ring-yellow-600/20',
						dot: 'bg-yellow-500'
					};

				default:
					return {
						bg: 'bg-red-50',
						text: 'text-red-700',
						ring: 'ring-red-600/20',
						dot: 'bg-red-500'
					};
			}
		};

		$.head('7ffaxd', $$renderer, ($$renderer) => {
			$$renderer.title(($$renderer) => {
				$$renderer.push(`<title>My Orders | Svelte Commerce</title>`);
			});
		});

		$$renderer.push(`<div class="mx-auto max-w-6xl px-0 md:py-8 md:py-12"><div class="mb-7"><h1 class="text-lg font-bold tracking-tight text-gray-900 md:text-xl">Order History</h1> <p class="mt-2 text-sm text-gray-500">Check the status of recent orders and manage returns.</p></div> `);

		if (loading) {
			$$renderer.push(`<!--[0--><div class="flex min-h-[400px] items-center justify-center">`);
			LoaderCircle($$renderer, { class: 'h-8 w-8 animate-spin text-primary' });
			$$renderer.push(`<!----></div>`);
		} else if (error) {
			$$renderer.push(`<!--[1--><div class="flex flex-col items-center justify-center py-20 text-center"><div class="mb-6 flex h-24 w-24 items-center justify-center rounded-full border border-gray-100 bg-white shadow-sm">`);
			AlertCircle($$renderer, { class: 'h-10 w-10 text-destructive' });
			$$renderer.push(`<!----></div> <h2 class="text-2xl font-bold text-gray-900">We couldn't load your orders</h2> <p class="mt-2 max-w-xs text-gray-500">${$.escape(error)}</p> <div class="mt-8">`);

			Button($$renderer, {
				onclick: loadOrders,
				class: 'h-12 px-8',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Try again`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----></div></div>`);
		} else if (!orders?.data?.length) {
			$$renderer.push(`<!--[2--><div class="flex flex-col items-center justify-center py-20 text-center"><div class="relative mb-6"><div class="absolute inset-0 scale-150 animate-pulse rounded-full bg-gray-50"></div> <div class="relative flex h-24 w-24 items-center justify-center rounded-full border border-gray-100 bg-white shadow-sm">`);
			ShoppingBag($$renderer, { class: 'h-10 w-10 text-gray-300' });
			$$renderer.push(`<!----></div></div> <h2 class="text-2xl font-bold text-gray-900">No orders yet</h2> <p class="mt-2 max-w-xs text-gray-500">Looks like you haven't placed any orders yet. Start shopping to see your history here.</p> <div class="mt-8">`);

			Button($$renderer, {
				href: '/products',
				class: 'h-12 px-8',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Start Shopping `);
					ArrowRight($$renderer, { class: 'ml-2 h-4 w-4' });
					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----></div></div>`);
		} else {
			$$renderer.push(`<!--[-1--><div class="space-y-8"><!--[-->`);

			const each_array = $.ensure_array_like(orders?.data || []);

			for (let i = 0, $$length = each_array.length; i < $$length; i++) {
				let order = each_array[i];
				const status = getStatusStyles(order.status);
				const payment = getPaymentStatusStyles(order.paymentStatus);

				$$renderer.push(`<div class="overflow-hidden rounded-md border border-muted/30 bg-background"><div class="border-b border-gray-100 bg-muted/10 p-3"><div class="flex flex-wrap items-center justify-between gap-6"><div class="flex items-center gap-8"><div><p class="text-xs font-bold text-gray-400">Order Number</p> <p class="mt-1.5 text-sm font-semibold text-gray-900">#${$.escape(order.orderNo || '_')}</p></div> <div class="h-10 w-px bg-gray-200"></div> <div><p class="text-xs font-bold text-gray-400">Date Placed</p> <p class="mt-1.5 text-sm font-semibold text-gray-900">${$.escape(date(order.createdAt))}</p></div> <div class="hidden h-10 w-px bg-gray-200 sm:block"></div> <div class="hidden sm:block"><p class="text-xs font-bold text-gray-400">Total Amount</p> <p class="mt-1.5 text-sm font-semibold text-gray-900">${$.escape(formatPrice(order.lineItems.reduce((acc, item) => acc + item.total, 0), page?.data?.store?.currency?.code))}</p></div></div> <div class="flex items-center gap-3">`);

				Button($$renderer, {
					variant: 'outline',
					size: 'sm',
					href: `/my/orders/${$.stringify(order.parentOrderNo)}`,
					class: 'h-10 px-6',
					children: ($$renderer) => {
						$$renderer.push(`<!---->View Details`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----></div></div> <div class="mt-6 flex flex-wrap gap-3"><span${$.attr_class(`inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-[10px] font-bold uppercase ${$.stringify(status.bg)} ${$.stringify(status.text)} ring-1 ring-inset ${$.stringify(status.ring)}`)}>`);

				if (status.icon) {
					$$renderer.push('<!--[-->');
					status.icon($$renderer, { class: 'h-3.5 w-3.5' });
					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}

				$$renderer.push(` ${$.escape(order.status)}</span> <span${$.attr_class(`inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-[10px] font-bold uppercase ${$.stringify(payment.bg)} ${$.stringify(payment.text)} ring-1 ring-inset ${$.stringify(payment.ring)}`)}>`);
				CreditCard($$renderer, { class: 'h-3.5 w-3.5' });
				$$renderer.push(`<!----> Payment: ${$.escape(order.paymentStatus)}</span></div></div> <div class="bg-background"><!--[-->`);

				const each_array_1 = $.ensure_array_like(order.lineItems);

				for (let $$index = 0, $$length = each_array_1.length; $$index < $$length; $$index++) {
					let item = each_array_1[$$index];

					$$renderer.push(`<div class="group flex items-center intra-gap p-3"><a${$.attr('href', `/my/orders/${$.stringify(order.parentOrderNo)}`)} class="relative shrink-0 overflow-hidden transition-transform duration-500">`);

					if (item.thumbnail) {
						$$renderer.push('<!--[0-->');

						LazyImg($$renderer, {
							src: item.thumbnail || '/placeholder.svg',
							alt: item.title,
							class: 'aspect-[3/4] w-24 object-contain sm:w-16'
						});
					} else {
						$$renderer.push(`<!--[-1--><div class="flex h-full w-full items-center justify-center bg-gray-100">`);
						ShoppingBag($$renderer, { class: 'h-8 w-8 text-gray-200' });
						$$renderer.push(`<!----></div>`);
					}

					$$renderer.push(`<!--]--></a> <div class="flex flex-1 flex-col"><div class="flex items-start justify-between gap-4"><div><h3 class="font-medium text-gray-900 text-xs sm:text-sm"><a${$.attr('href', `/my/orders/${$.stringify(order.parentOrderNo)}`)} class="transition-colors hover:text-gray-500">${$.escape(item.title || '_')}</a></h3> <div class="mt-2 flex items-center gap-4 text-xs font-bold uppercase text-gray-400"><span class="flex items-center gap-1.5">`);
					Tag($$renderer, { class: 'h-3.5 w-3.5' });
					$$renderer.push(`<!----> Qty: ${$.escape(item.qty || '_')}</span> `);

					if (item.variantTitle) {
						$$renderer.push(`<!--[0--><span class="h-1 w-1 rounded-full bg-gray-300"></span> <span>${$.escape(item.variantTitle)}</span>`);
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]--></div></div> <p class="text-sm font-semibold text-gray-900 md:text-base">${$.escape(formatPrice(item.total, page?.data?.store?.currency?.code))}</p></div></div></div>`);
				}

				$$renderer.push(`<!--]--></div></div>`);
			}

			$$renderer.push(`<!--]--></div> `);
			Pagination($$renderer, { noOfPage: noOfPage() });
			$$renderer.push(`<!---->`);
		}

		$$renderer.push(`<!--]--></div>`);
	});
}