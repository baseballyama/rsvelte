import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
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

var root = $.from_html(`<div class="flex min-h-[400px] items-center justify-center"><!></div>`);
var root_1 = $.from_html(`<div class="flex flex-col items-center justify-center py-20 text-center"><div class="mb-6 flex h-24 w-24 items-center justify-center rounded-full border border-gray-100 bg-white shadow-sm"><!></div> <h2 class="text-2xl font-bold text-gray-900">We couldn't load your orders</h2> <p class="mt-2 max-w-xs text-gray-500"> </p> <div class="mt-8"><!></div></div>`);
var root_2 = $.from_html(`Start Shopping <!>`, 1);
var root_3 = $.from_html(`<div class="flex flex-col items-center justify-center py-20 text-center"><div class="relative mb-6"><div class="absolute inset-0 scale-150 animate-pulse rounded-full bg-gray-50"></div> <div class="relative flex h-24 w-24 items-center justify-center rounded-full border border-gray-100 bg-white shadow-sm"><!></div></div> <h2 class="text-2xl font-bold text-gray-900">No orders yet</h2> <p class="mt-2 max-w-xs text-gray-500">Looks like you haven't placed any orders yet. Start shopping to see your history here.</p> <div class="mt-8"><!></div></div>`);
var root_4 = $.from_html(`<div class="flex h-full w-full items-center justify-center bg-gray-100"><!></div>`);
var root_5 = $.from_html(`<span class="h-1 w-1 rounded-full bg-gray-300"></span> <span> </span>`, 1);
var root_6 = $.from_html(`<div class="group flex items-center intra-gap p-3"><a class="relative shrink-0 overflow-hidden transition-transform duration-500"><!></a> <div class="flex flex-1 flex-col"><div class="flex items-start justify-between gap-4"><div><h3 class=" font-medium text-gray-900 text-xs sm:text-sm"><a class="transition-colors hover:text-gray-500"> </a></h3> <div class="mt-2 flex items-center gap-4 text-xs font-bold uppercase text-gray-400"><span class="flex items-center gap-1.5"><!> </span> <!></div></div> <p class="text-sm font-semibold text-gray-900 md:text-base"> </p></div></div></div>`);
var root_7 = $.from_html(`<div class="overflow-hidden rounded-md border border-muted/30 bg-background"><div class="border-b border-gray-100 bg-muted/10 p-3"><div class="flex flex-wrap items-center justify-between gap-6"><div class="flex items-center gap-8"><div><p class="text-xs font-bold   text-gray-400">Order Number</p> <p class="mt-1.5 text-sm font-semibold text-gray-900"> </p></div> <div class="h-10 w-px bg-gray-200"></div> <div><p class="text-xs font-bold   text-gray-400">Date Placed</p> <p class="mt-1.5 text-sm font-semibold text-gray-900"> </p></div> <div class="hidden h-10 w-px bg-gray-200 sm:block"></div> <div class="hidden sm:block"><p class="text-xs font-bold   text-gray-400">Total Amount</p> <p class="mt-1.5 text-sm font-semibold text-gray-900"> </p></div></div> <div class="flex items-center gap-3"><!></div></div> <div class="mt-6 flex flex-wrap gap-3"><span><!> </span> <span><!> </span></div></div> <div class=" bg-background"></div></div>`);
var root_8 = $.from_html(`<div class="space-y-8"></div> <!>`, 1);
var root_9 = $.from_html(`<div class="mx-auto max-w-6xl px-0 md:py-8 md:py-12"><div class="mb-7"><h1 class="text-lg font-bold tracking-tight text-gray-900 md:text-xl">Order History</h1> <p class="mt-2 text-sm text-gray-500">Check the status of recent orders and manage returns.</p></div> <!></div>`);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	// Fetched here rather than through MyOrdersRenderer: that renderer swallows failures (leaving
	// `orders.data` undefined for the {#each}) and always requests page 1.
	let loading = $.state(true);

	let error = $.state('');
	let orders = $.state($.proxy({}));
	const currentPage = $.derived(() => +(page.url.searchParams.get('page') || '1'));
	const noOfPage = $.derived(() => Math.ceil(($.get(orders)?.count || 0) / ($.get(orders)?.pageSize || 20)));

	async function loadOrders() {
		try {
			$.set(loading, true);
			$.set(error, '');
			$.set(orders, await orderService.list({ page: $.get(currentPage), q: '', sort: 'createdAt' }), true);
		} catch(e) {
			console.error(e);
			$.set(orders, {}, true);
			$.set(error, e?.message || 'We could not load your orders right now.', true);
		} finally {
			$.set(loading, false);
		}
	}

	$.user_effect(() => {
		// Re-fetch whenever ?page= changes.
		$.get(currentPage);

		loadOrders();
	});

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

	var div = root_9();

	$.head('7ffaxd', ($$anchor) => {
		$.effect(() => {
			$.document.title = 'My Orders | Svelte Commerce';
		});
	});

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
			var div_2 = root_1();
			var div_3 = $.child(div_2);
			var node_2 = $.child(div_3);

			AlertCircle(node_2, { class: 'h-10 w-10 text-destructive' });
			$.reset(div_3);

			var p = $.sibling(div_3, 4);
			var text = $.only_child(p, true);
			var div_4 = $.sibling(p, 2);
			var node_3 = $.child(div_4);

			Button(node_3, {
				onclick: loadOrders,
				class: 'h-12 px-8',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_1 = $.text('Try again');

					$.append($$anchor, text_1);
				},
				$$slots: { default: true }
			});

			$.reset(div_4);
			$.reset(div_2);
			$.template_effect(() => $.set_text(text, $.get(error)));
			$.transition(1, div_2, () => fade);
			$.append($$anchor, div_2);
		};

		var consequent_2 = ($$anchor) => {
			var div_5 = root_3();
			var div_6 = $.child(div_5);
			var div_7 = $.sibling($.child(div_6), 2);
			var node_4 = $.child(div_7);

			ShoppingBag(node_4, { class: 'h-10 w-10 text-gray-300' });
			$.reset(div_7);
			$.reset(div_6);

			var div_8 = $.sibling(div_6, 6);
			var node_5 = $.child(div_8);

			Button(node_5, {
				href: '/products',
				class: 'h-12 px-8',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var fragment = root_2();
					var node_6 = $.sibling($.first_child(fragment));

					ArrowRight(node_6, { class: 'ml-2 h-4 w-4' });
					$.append($$anchor, fragment);
				},
				$$slots: { default: true }
			});

			$.reset(div_8);
			$.reset(div_5);
			$.transition(1, div_5, () => fade);
			$.append($$anchor, div_5);
		};

		var alternate_1 = ($$anchor) => {
			var fragment_1 = root_8();
			var div_9 = $.first_child(fragment_1);

			$.each(div_9, 21, () => $.get(orders)?.data || [], $.index, ($$anchor, order, i) => {
				const status = $.derived(() => getStatusStyles($.get(order).status));
				const payment = $.derived(() => getPaymentStatusStyles($.get(order).paymentStatus));
				var div_10 = root_7();
				var div_11 = $.child(div_10);
				var div_12 = $.child(div_11);
				var div_13 = $.child(div_12);
				var div_14 = $.child(div_13);
				var p_1 = $.sibling($.child(div_14), 2);
				var text_2 = $.only_child(p_1);

				$.reset(div_14);

				var div_15 = $.sibling(div_14, 4);
				var p_2 = $.sibling($.child(div_15), 2);
				var text_3 = $.only_child(p_2, true);

				$.reset(div_15);

				var div_16 = $.sibling(div_15, 4);
				var p_3 = $.sibling($.child(div_16), 2);
				var text_4 = $.only_child(p_3, true);

				$.reset(div_16);
				$.reset(div_13);

				var div_17 = $.sibling(div_13, 2);
				var node_7 = $.child(div_17);

				Button(node_7, {
					variant: 'outline',
					size: 'sm',
					get href() {
						return `/my/orders/${$.get(order).parentOrderNo ?? ''}`;
					},
					class: 'h-10 px-6',
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_5 = $.text('View Details');

						$.append($$anchor, text_5);
					},
					$$slots: { default: true }
				});

				$.reset(div_17);
				$.reset(div_12);

				var div_18 = $.sibling(div_12, 2);
				var span = $.child(div_18);
				var node_8 = $.child(span);

				$.component(node_8, () => $.get(status).icon, ($$anchor, status_icon) => {
					status_icon($$anchor, { class: 'h-3.5 w-3.5' });
				});

				var text_6 = $.sibling(node_8);

				$.reset(span);

				var span_1 = $.sibling(span, 2);
				var node_9 = $.child(span_1);

				CreditCard(node_9, { class: 'h-3.5 w-3.5' });

				var text_7 = $.sibling(node_9);

				$.reset(span_1);
				$.reset(div_18);
				$.reset(div_11);

				var div_19 = $.sibling(div_11, 2);

				$.each(div_19, 21, () => $.get(order).lineItems, $.index, ($$anchor, item) => {
					var div_20 = root_6();
					var a = $.child(div_20);
					var node_10 = $.child(a);

					{
						var consequent_3 = ($$anchor) => {
							{
								let $0 = $.derived(() => $.get(item).thumbnail || '/placeholder.svg');

								LazyImg($$anchor, {
									get src() {
										return $.get($0);
									},

									get alt() {
										return $.get(item).title;
									},
									class: 'aspect-[3/4] w-24 object-contain sm:w-16'
								});
							}
						};

						var alternate = ($$anchor) => {
							var div_21 = root_4();
							var node_11 = $.child(div_21);

							ShoppingBag(node_11, { class: 'h-8 w-8 text-gray-200' });
							$.reset(div_21);
							$.append($$anchor, div_21);
						};

						$.if(node_10, ($$render) => {
							if ($.get(item).thumbnail) $$render(consequent_3); else $$render(alternate, -1);
						});
					}

					$.reset(a);

					var div_22 = $.sibling(a, 2);
					var div_23 = $.child(div_22);
					var div_24 = $.child(div_23);
					var h3 = $.child(div_24);
					var a_1 = $.child(h3);
					var text_8 = $.only_child(a_1, true);

					$.reset(h3);

					var div_25 = $.sibling(h3, 2);
					var span_2 = $.child(div_25);
					var node_12 = $.child(span_2);

					Tag(node_12, { class: 'h-3.5 w-3.5' });

					var text_9 = $.sibling(node_12);

					$.reset(span_2);

					var node_13 = $.sibling(span_2, 2);

					{
						var consequent_4 = ($$anchor) => {
							var fragment_3 = root_5();
							var span_3 = $.sibling($.first_child(fragment_3), 2);
							var text_10 = $.only_child(span_3, true);

							$.template_effect(() => $.set_text(text_10, $.get(item).variantTitle));
							$.append($$anchor, fragment_3);
						};

						$.if(node_13, ($$render) => {
							if ($.get(item).variantTitle) $$render(consequent_4);
						});
					}

					$.reset(div_25);
					$.reset(div_24);

					var p_4 = $.sibling(div_24, 2);
					var text_11 = $.only_child(p_4, true);

					$.reset(div_23);
					$.reset(div_22);
					$.reset(div_20);

					$.template_effect(
						($0) => {
							$.set_attribute(a, 'href', `/my/orders/${$.get(order).parentOrderNo ?? ''}`);
							$.set_attribute(a_1, 'href', `/my/orders/${$.get(order).parentOrderNo ?? ''}`);
							$.set_text(text_8, $.get(item).title || '_');
							$.set_text(text_9, ` Qty: ${($.get(item).qty || '_') ?? ''}`);
							$.set_text(text_11, $0);
						},
						[
							() => formatPrice($.get(item).total, page?.data?.store?.currency?.code)
						]
					);

					$.append($$anchor, div_20);
				});

				$.reset(div_19);
				$.reset(div_10);

				$.template_effect(
					($0, $1) => {
						$.set_text(text_2, `#${($.get(order).orderNo || '_') ?? ''}`);
						$.set_text(text_3, $0);
						$.set_text(text_4, $1);
						$.set_class(span, 1, `inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-[10px] font-bold uppercase  ${$.get(status).bg ?? ''} ${$.get(status).text ?? ''} ring-1 ring-inset ${$.get(status).ring ?? ''}`);
						$.set_text(text_6, ` ${$.get(order).status ?? ''}`);
						$.set_class(span_1, 1, `inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-[10px] font-bold uppercase  ${$.get(payment).bg ?? ''} ${$.get(payment).text ?? ''} ring-1 ring-inset ${$.get(payment).ring ?? ''}`);
						$.set_text(text_7, ` Payment: ${$.get(order).paymentStatus ?? ''}`);
					},
					[
						() => date($.get(order).createdAt),
						() => formatPrice($.get(order).lineItems.reduce((acc, item) => acc + item.total, 0), page?.data?.store?.currency?.code)
					]
				);

				$.transition(1, div_10, () => fly, () => ({ y: 20, duration: 400, delay: i * 50 }));
				$.append($$anchor, div_10);
			});

			$.reset(div_9);

			var node_14 = $.sibling(div_9, 2);

			Pagination(node_14, {
				get noOfPage() {
					return $.get(noOfPage);
				}
			});

			$.append($$anchor, fragment_1);
		};

		$.if(node, ($$render) => {
			if ($.get(loading)) $$render(consequent); else if ($.get(error)) $$render(consequent_1, 1); else if (!$.get(orders)?.data?.length) $$render(consequent_2, 2); else $$render(alternate_1, -1);
		});
	}

	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}