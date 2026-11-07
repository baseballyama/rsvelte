import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Button } from '$lib/components/ui/button';
import { formatPrice } from '$lib/core/utils/index.js';

import {
	CheckCircle2,
	MapPin,
	Package,
	Truck,
	ArrowRight,
	ShoppingBag,
	Mail,
	Calendar
} from '@lucide/svelte';

import LazyImg from '$lib/core/components/image/lazy-img.svelte';
import { getUserState, getCartState } from '$lib/core/stores/index.js';
import { onMount } from 'svelte';
import { page } from '$app/state';
import { fade, fly } from 'svelte/transition';
import CheckoutHeader from '$lib/components/checkout/checkout-header.svelte';

var root = $.from_html(`<p class="mx-auto max-w-lg text-lg text-gray-500 text-sm">We've received your order and we'll notify you as soon as it's on its way.</p>`);
var root_1 = $.from_html(`<div class="mt-6 inline-flex items-center rounded-full border border-gray-100 bg-gray-50 px-4 py-1.5 text-sm font-medium text-gray-600"> </div>`);
var root_2 = $.from_html(`<p class="mx-auto max-w-lg text-lg text-gray-500 text-sm">Your payment went through. We're still confirming the order details — they'll appear in your account shortly.</p> <!>`, 1);
var root_3 = $.from_html(`<div class="relative z-10 flex flex-col items-center"><div><!></div> <span> </span></div>`);
var root_4 = $.from_html(`<p class="mt-1 text-xs text-gray-400"> </p>`);
var root_5 = $.from_html(`<div class="group flex  items-start gap-6 py-6 first:pt-0 last:pb-0"><div class="relative flex-shrink-0 overflow-hidden transition-all duration-300"><!></div> <div class="flex flex-1 flex-col transition-all duration-300"><div class="flex justify-between text-base font-semibold text-gray-900"><h3 class="transition-colors "><a> </a></h3> <p class="ml-4"> </p></div> <p class="mt-1 text-sm text-gray-500"> </p> <!></div></div>`);
var root_6 = $.from_html(`<p> </p>`);
var root_7 = $.from_html(`Confirmation sent to <span class="font-bold text-gray-700"> </span>. We'll email you again when your items ship.`, 1);
var root_8 = $.from_html(`<div class="border-b border-muted/30 pb-6 p-2 md:p-12"><h2 class="mb-6 text-lg font-bold text-gray-900">Order Summary</h2> <div class="divide-y divide-gray-100"></div></div> <div class="grid gap-0 border-b border-muted/30 sm:grid-cols-2"><div class="border-b border-muted/30 p-4 sm:border-b-0 sm:border-r md:p-6"><div class="mb-4 flex text-base items-center gap-2 font-bold text-gray-900"><!> <h3>Shipping Address</h3></div> <div class="text-sm leading-relaxed text-gray-600 px-2"><p class="mb-1 font-bold text-gray-700"> </p> <p class="text-gray-700"> </p> <!> <p> </p> <p class="flex items-center gap-2"> </p></div></div> <div class="p-4 md:p-6"><div class="mb-4 flex items-center gap-2 text-base font-bold text-gray-900"><!> <h3>Estimated Delivery</h3></div> <p class="text-lg px-2 font-bold tracking-tight text-gray-900"> </p> <div class="flex items-start gap-3 rounded-xl border border-gray-100 bg-white p-2"><!> <p class="text-sm leading-relaxed text-gray-700"><!></p></div></div></div>`, 1);
var root_9 = $.from_html(`Quote order <span class="font-bold text-gray-900"> </span> if you need to get in touch.`, 1);
var root_10 = $.from_html(`<div class="border-b border-muted/30 p-6 md:p-12"><div class="flex items-start gap-3 rounded-xl border border-gray-100 bg-white p-4"><!> <div class="text-sm leading-relaxed text-gray-700"><p class="font-bold text-gray-900">Order details aren't available yet</p> <p class="mt-1">We couldn't load the details for this order right now. Your payment is safe and nothing needs to be paid again. <!></p> <p class="mt-2">Check <a href="/my/orders" class="font-semibold text-primary underline-offset-4 hover:underline">your orders</a> in a few minutes, or <a href="/contact-us" class="font-semibold text-primary underline-offset-4 hover:underline">contact us</a>.</p></div></div></div>`);
var root_11 = $.from_html(`Continue Shopping <!>`, 1);
var root_12 = $.from_html(`<div class="min-h-screen bg-[#fafafa] py-12 md:py-5"><div class="container mx-auto max-w-3xl px-4"><!> <div class="overflow-hidden rounded-2xl bg-white shadow-[0_1px_3px_rgba(0,0,0,0.05),0_20px_40px_rgba(0,0,0,0.02)]"><div class="border-b border-gray-100 bg-white p-3 sm:p-8 text-center md:p-12"><div class="mb-6 flex justify-center"><div class="relative"><div class="absolute inset-0 animate-ping rounded-full bg-green-100 opacity-20"></div> <div class="relative flex h-16 w-16 items-center justify-center rounded-full bg-green-50"><!></div></div></div> <h1 class="mb-3 text-3xl font-bold tracking-tight text-gray-900 md:text-4xl">Thank you for your order</h1> <!></div> <div class="bg-gray-50/50 px-8 py-10 md:px-12"><div class="relative flex justify-between"><div class="absolute left-0 top-5 h-[2px] w-full bg-gray-200"><div class="h-full w-1/3 bg-primary transition-all duration-1000"></div></div> <!></div></div> <!> <div class="bg-white p-8 md:p-12"><div class="flex flex-col gap-4 sm:flex-row"><!> <!></div> <div class="mt-8 text-center"><p class="text-sm text-gray-500">Need help with your order? <a href="/contact-us" class="font-semibold text-primary underline-offset-4 hover:underline">Contact us</a></p></div></div></div></div></div> <!>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	const userState = getUserState();
	const cartState = getCartState();
	const orders = $.derived(() => $$props.data.orders?.data || []);
	const firstOrder = $.derived(() => $.get(orders)[0]);
	const useremail = $.derived(() => $.get(firstOrder)?.userEmail || $.get(firstOrder)?.shippingAddress?.email);
	const orderNo = $.derived(() => page.url.searchParams.get('order_no') || $.get(firstOrder)?.orderNo);

	const estimatedDeliveryDateMachine = $.derived(() => {
		if (!$.get(firstOrder)) return '';

		const date = new Date($.get(firstOrder).createdAt);
		const days = $.get(firstOrder).shippingRate?.estimatedMaxDays || 7;

		date.setDate(date.getDate() + days);

		return date.toISOString().split('T')[0];
	});

	const estimatedDeliveryDateDisplay = $.derived(() => {
		if (!$.get(firstOrder)) return '';

		const date = new Date($.get(firstOrder).createdAt);
		const days = $.get(firstOrder).shippingRate?.estimatedMaxDays || 7;

		date.setDate(date.getDate() + days);

		return new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric', year: 'numeric' }).format(date);
	});

	onMount(async () => {
		if (!cartState) return;

		const prevCartId = localStorage.getItem('prev_cart_id');

		if (prevCartId) {
			if (typeof cartState.restorePrevCart === 'function') {
				await cartState.restorePrevCart();
			} else if (typeof cartState.resetSingleItemCheckoutSession === 'function') {
				await cartState.resetSingleItemCheckoutSession();
			}

			await cartState.refershCart();
		} else {
			await cartState.refershCart();

			if (!cartState.cart?.lineItems?.length) {
				if (typeof cartState.clear === 'function') {
					await cartState.clear();
				}
			}
		}
	});

	const timelineSteps = [
		{
			label: 'Confirmed',
			icon: CheckCircle2,
			completed: true,
			current: false
		},

		{
			label: 'Processing',
			icon: Package,
			completed: false,
			current: true
		},

		{
			label: 'Shipped',
			icon: Truck,
			completed: false,
			current: false
		}
	];

	var fragment = root_12();

	$.head('1ax5u20', ($$anchor) => {
		$.effect(() => {
			$.document.title = 'Order Confirmed';
		});
	});

	var div = $.first_child(fragment);
	var div_1 = $.child(div);
	var node = $.child(div_1);

	CheckoutHeader(node, { step: 4 });

	var div_2 = $.sibling(node, 2);
	var div_3 = $.child(div_2);
	var div_4 = $.child(div_3);
	var div_5 = $.child(div_4);
	var div_6 = $.sibling($.child(div_5), 2);
	var node_1 = $.child(div_6);

	CheckCircle2(node_1, { class: 'h-8 w-8 text-green-600' });
	$.reset(div_6);
	$.reset(div_5);
	$.reset(div_4);

	var node_2 = $.sibling(div_4, 4);

	{
		var consequent = ($$anchor) => {
			var p = root();

			$.append($$anchor, p);
		};

		var alternate = ($$anchor) => {
			var fragment_1 = root_2();
			var node_3 = $.sibling($.first_child(fragment_1), 2);

			{
				var consequent_1 = ($$anchor) => {
					var div_7 = root_1();
					var text = $.only_child(div_7);

					$.template_effect(() => $.set_text(text, `Order #${$.get(orderNo) ?? ''}`));
					$.append($$anchor, div_7);
				};

				$.if(node_3, ($$render) => {
					if ($.get(orderNo)) $$render(consequent_1);
				});
			}

			$.append($$anchor, fragment_1);
		};

		$.if(node_2, ($$render) => {
			if ($.get(firstOrder)) $$render(consequent); else $$render(alternate, -1);
		});
	}

	$.reset(div_3);

	var div_8 = $.sibling(div_3, 2);
	var div_9 = $.child(div_8);
	var node_4 = $.sibling($.child(div_9), 2);

	$.each(node_4, 17, () => timelineSteps, $.index, ($$anchor, step) => {
		var div_10 = root_3();
		var div_11 = $.child(div_10);
		var node_5 = $.child(div_11);

		$.component(node_5, () => $.get(step).icon, ($$anchor, step_icon) => {
			step_icon($$anchor, { class: 'h-5 w-5' });
		});

		$.reset(div_11);

		var span = $.sibling(div_11, 2);
		var text_1 = $.only_child(span, true);

		$.reset(div_10);

		$.template_effect(() => {
			$.set_class(div_11, 1, `flex h-10 w-10 items-center justify-center rounded-full border-2 transition-colors duration-500
								${$.get(step).completed
				? 'border-primary bg-primary text-white'
				: $.get(step).current
					? 'border-primary bg-white text-primary'
					: 'border-gray-200 bg-white text-gray-400'}`);

			$.set_class(span, 1, `mt-3 text-xs font-semibold uppercase tracking-wider
								${$.get(step).completed || $.get(step).current ? 'text-gray-900' : 'text-gray-400'}`);

			$.set_text(text_1, $.get(step).label);
		});

		$.append($$anchor, div_10);
	});

	$.reset(div_9);
	$.reset(div_8);

	var node_6 = $.sibling(div_8, 2);

	{
		var consequent_5 = ($$anchor) => {
			var fragment_2 = root_8();
			var div_12 = $.first_child(fragment_2);
			var div_13 = $.sibling($.child(div_12), 2);

			$.each(div_13, 21, () => $.get(orders), $.index, ($$anchor, $$item) => {
				let lineItems = () => $.get($$item).lineItems;
				var fragment_3 = $.comment();
				var node_7 = $.first_child(fragment_3);

				$.each(node_7, 17, () => lineItems() || [], $.index, ($$anchor, item) => {
					var div_14 = root_5();
					var div_15 = $.child(div_14);
					var node_8 = $.child(div_15);

					{
						let $0 = $.derived(() => $.get(item).thumbnail || '/placeholder.svg');

						LazyImg(node_8, {
							get src() {
								return $.get($0);
							},

							get alt() {
								return $.get(item).title;
							},
							class: 'aspect-[3/4] w-16 object-contain sm:w-16'
						});
					}

					$.reset(div_15);

					var div_16 = $.sibling(div_15, 2);
					var div_17 = $.child(div_16);
					var h3 = $.child(div_17);
					var a = $.child(h3);
					var text_2 = $.only_child(a, true);

					$.reset(h3);

					var p_1 = $.sibling(h3, 2);
					var text_3 = $.only_child(p_1, true);

					$.reset(div_17);

					var p_2 = $.sibling(div_17, 2);
					var text_4 = $.only_child(p_2);
					var node_9 = $.sibling(p_2, 2);

					{
						var consequent_2 = ($$anchor) => {
							var p_3 = root_4();
							var text_5 = $.only_child(p_3, true);

							$.template_effect(() => $.set_text(text_5, $.get(item).variantTitle));
							$.append($$anchor, p_3);
						};

						$.if(node_9, ($$render) => {
							if ($.get(item).variantTitle) $$render(consequent_2);
						});
					}

					$.reset(div_16);
					$.reset(div_14);

					$.template_effect(
						($0, $1) => {
							$.set_attribute(a, 'href', `/products/${$.get(item).slug}`);
							$.set_text(text_2, $.get(item).title);
							$.set_text(text_3, $0);
							$.set_text(text_4, `${$1 ?? ''} × ${$.get(item).qty ?? ''}`);
						},
						[
							() => formatPrice($.get(item).subtotal, page?.data?.store?.currency?.code),
							() => formatPrice($.get(item).price, page?.data?.store?.currency?.code)
						]
					);

					$.append($$anchor, div_14);
				});

				$.append($$anchor, fragment_3);
			});

			$.reset(div_13);
			$.reset(div_12);

			var div_18 = $.sibling(div_12, 2);
			var div_19 = $.child(div_18);
			var div_20 = $.child(div_19);
			var node_10 = $.child(div_20);

			MapPin(node_10, { class: 'h-5 w-5 text-primary' });
			$.next(2);
			$.reset(div_20);

			var div_21 = $.sibling(div_20, 2);
			var p_4 = $.child(div_21);
			var text_6 = $.only_child(p_4);
			var p_5 = $.sibling(p_4, 2);
			var text_7 = $.only_child(p_5, true);
			var node_11 = $.sibling(p_5, 2);

			{
				var consequent_3 = ($$anchor) => {
					var p_6 = root_6();
					var text_8 = $.only_child(p_6, true);

					$.template_effect(() => $.set_text(text_8, $.get(firstOrder)?.shippingAddress?.address_2));
					$.append($$anchor, p_6);
				};

				$.if(node_11, ($$render) => {
					if ($.get(firstOrder)?.shippingAddress?.address_2) $$render(consequent_3);
				});
			}

			var p_7 = $.sibling(node_11, 2);
			var text_9 = $.only_child(p_7);
			var p_8 = $.sibling(p_7, 2);
			var text_10 = $.only_child(p_8, true);

			$.reset(div_21);
			$.reset(div_19);

			var div_22 = $.sibling(div_19, 2);
			var div_23 = $.child(div_22);
			var node_12 = $.child(div_23);

			Calendar(node_12, { class: 'h-5 w-5 text-primary' });
			$.next(2);
			$.reset(div_23);

			var p_9 = $.sibling(div_23, 2);
			var text_11 = $.only_child(p_9, true);
			var div_24 = $.sibling(p_9, 2);
			var node_13 = $.child(div_24);

			Mail(node_13, { class: 'mt-0.5 h-4 w-4 shrink-0 text-gray-400' });

			var p_10 = $.sibling(node_13, 2);
			var node_14 = $.child(p_10);

			{
				var consequent_4 = ($$anchor) => {
					var fragment_4 = root_7();
					var span_1 = $.sibling($.first_child(fragment_4));
					var text_12 = $.only_child(span_1, true);

					$.next();
					$.template_effect(() => $.set_text(text_12, $.get(useremail)));
					$.append($$anchor, fragment_4);
				};

				var alternate_1 = ($$anchor) => {
					var text_13 = $.text('We\'ll email you a confirmation and let you know again when your items ship.');

					$.append($$anchor, text_13);
				};

				$.if(node_14, ($$render) => {
					if ($.get(useremail)) $$render(consequent_4); else $$render(alternate_1, -1);
				});
			}

			$.reset(p_10);
			$.reset(div_24);
			$.reset(div_22);
			$.reset(div_18);

			$.template_effect(() => {
				$.set_text(text_6, `${$.get(firstOrder)?.shippingAddress?.firstName ?? ''}
							${$.get(firstOrder)?.shippingAddress?.lastName ?? ''}`);

				$.set_text(text_7, $.get(firstOrder)?.shippingAddress?.address_1);
				$.set_text(text_9, `${$.get(firstOrder)?.shippingAddress?.city ?? ''}, ${$.get(firstOrder)?.shippingAddress?.state ?? ''} ${$.get(firstOrder)?.shippingAddress?.zip ?? ''}`);
				$.set_text(text_10, $.get(firstOrder)?.shippingAddress?.phone);
				$.set_text(text_11, $.get(estimatedDeliveryDateDisplay));
			});

			$.append($$anchor, fragment_2);
		};

		var alternate_2 = ($$anchor) => {
			var div_25 = root_10();
			var div_26 = $.child(div_25);
			var node_15 = $.child(div_26);

			Package(node_15, { class: 'mt-0.5 h-5 w-5 shrink-0 text-primary' });

			var div_27 = $.sibling(node_15, 2);
			var p_11 = $.sibling($.child(div_27), 2);
			var node_16 = $.sibling($.child(p_11));

			{
				var consequent_6 = ($$anchor) => {
					var fragment_5 = root_9();
					var span_2 = $.sibling($.first_child(fragment_5));
					var text_14 = $.only_child(span_2);

					$.next();
					$.template_effect(() => $.set_text(text_14, `#${$.get(orderNo) ?? ''}`));
					$.append($$anchor, fragment_5);
				};

				$.if(node_16, ($$render) => {
					if ($.get(orderNo)) $$render(consequent_6);
				});
			}

			$.reset(p_11);
			$.next(2);
			$.reset(div_27);
			$.reset(div_26);
			$.reset(div_25);
			$.append($$anchor, div_25);
		};

		$.if(node_6, ($$render) => {
			if ($.get(firstOrder)) $$render(consequent_5); else $$render(alternate_2, -1);
		});
	}

	var div_28 = $.sibling(node_6, 2);
	var div_29 = $.child(div_28);
	var node_17 = $.child(div_29);

	Button(node_17, {
		href: '/products',
		class: 'group order-1 h-14 flex-1 sm:order-2',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var fragment_6 = root_11();
			var node_18 = $.sibling($.first_child(fragment_6));

			ArrowRight(node_18, { class: 'ml-2 h-4 w-4' });
			$.append($$anchor, fragment_6);
		},
		$$slots: { default: true }
	});

	var node_19 = $.sibling(node_17, 2);

	{
		var consequent_7 = ($$anchor) => {
			Button($$anchor, {
				variant: 'outline',
				href: '/my/orders',
				class: 'order-2 h-14 flex-1 sm:order-1',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_15 = $.text('Track My Order');

					$.append($$anchor, text_15);
				},
				$$slots: { default: true }
			});
		};

		$.if(node_19, ($$render) => {
			if (userState?.user?.role) $$render(consequent_7);
		});
	}

	$.reset(div_29);
	$.next(2);
	$.reset(div_28);
	$.reset(div_2);
	$.reset(div_1);
	$.reset(div);

	var node_20 = $.sibling(div, 2);

	{
		var consequent_8 = ($$anchor) => {
			var fragment_8 = $.comment();
			var node_21 = $.first_child(fragment_8);

			$.html(node_21, () => `<script src="https://apis.google.com/js/platform.js?onload=renderOptIn" async defer><\/script>
  <script>
    window.renderOptIn = function() {
      window.gapi.load('surveyoptin', function() {
        window.gapi.surveyoptin.render(
          {
            // REQUIRED FIELDS
            "merchant_id": ${$$props.data?.store?.plugins?.googleReviewsOptIn?.merchantId},
            "order_id": "${$.get(orderNo)}",
            "email": "${cartState?.cart?.email}",
            "delivery_country": "${$.get(firstOrder)?.shippingAddress?.countryCode}",
            "estimated_delivery_date": "${$.get(estimatedDeliveryDateMachine)}",

            // OPTIONAL FIELDS
          });
      });
    }
  <\/script>`);

			$.append($$anchor, fragment_8);
		};

		$.if(node_20, ($$render) => {
			if ($$props.data?.store?.plugins?.googleReviewsOptIn?.active && $.get(firstOrder)) $$render(consequent_8);
		});
	}

	$.transition(1, div_2, () => fly, () => ({ y: 20, duration: 600 }));
	$.append($$anchor, fragment);
	$.pop();
}